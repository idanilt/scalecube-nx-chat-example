import {createGatewayProxy} from "@scalecube/rsocket-ws-gateway/dist/createGatewayProxy";
import {ChatServiceAPI, ChatServiceDefinition} from "@scalecube-chat-example/api";
import {from, Observable} from "rxjs";
import {switchMap} from "rxjs/operators";

const remoteChatServiceP = createGatewayProxy(
  `ws://localhost:8000`,
  ChatServiceDefinition
)

export const remoteChatService = new Proxy(remoteChatServiceP, {
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
