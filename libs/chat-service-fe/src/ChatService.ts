import {ChatServiceAPI, ChatServiceDefinition} from "@scalecube-chat-example/api";
import { createGatewayProxy } from "@scalecube/rsocket-ws-gateway/dist/createGatewayProxy";
import {from, Observable, ReplaySubject} from "rxjs";
import {switchMap, tap} from "rxjs/operators";


const remoteChatServiceP = createGatewayProxy(
    `ws://localhost:8000`,
    ChatServiceDefinition
)
const remoteChatService = new Proxy(remoteChatServiceP, {
    get(target: Promise<ChatServiceAPI.ChatService>, p: string): () => Promise<any> | Observable<any> {
        if( !ChatServiceDefinition.methods[p] ) {
            return;
        }
        switch (ChatServiceDefinition.methods[p].asyncModel) {
            case "requestResponse":
                return (...args) => new Promise((res, rej)=>{
                    target
                        .then( o => o[p](...args).then(res).catch(rej) )
                        .catch(rej);
                });
            case "requestStream":
                return (...args) => from(target).pipe(
                    switchMap(svc => svc[p](...args))
                )
        }
    }
}) as unknown as ChatServiceAPI.ChatService;

export class ChatService {
    private ch$ = new ReplaySubject();
    private history = {};
    private lastMessage = {};
    private msg$;
    constructor() {
        remoteChatService.channels$({})
            .pipe(
                tap( i => this.ch$.next(i) )
            )
            .subscribe()
    }
    createChannel({topic}){
        return remoteChatService.createChannel({topic: topic});
    }
    channels$(){
        return this.ch$.asObservable();
    }
    message({ch, msg}){
        const ts = Date.now();
        return remoteChatService.message({
            header: {
                timestamp: ts,
                type: "text",
                channel: ch
            },
            message: msg
        })
    }
    messages$({ch}){
        //return concat(readHistory(ch), this.readRemote(ch))
        this.history[ch] = this.history[ch] || new ReplaySubject();
        this.lastMessage[ch] = this.lastMessage[ch] || 0;

        if( this.msg$ ) {
            this.msg$.unsubscribe();
        }
        this.msg$ = remoteChatService.messages$({
            channel: ch,
            from: this.lastMessage[ch]
        }).pipe(
            tap((m) => {
                this.lastMessage[ch] < m.ts ? this.lastMessage[ch] = m.ts : '';
            }),
            tap(i=>this.history[ch].next(i))
        ).subscribe();
        return this.history[ch].asObservable();
    }
}
