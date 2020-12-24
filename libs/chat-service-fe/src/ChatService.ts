import {Observable, ReplaySubject} from "rxjs";
import {tap} from "rxjs/operators";
import {remoteChatService} from "./remoteChatService";
import {ChatServiceAPI} from "@scalecube-chat-example/api";

export class ChatService {
  private ch$ = new ReplaySubject();
  private history = {};
  private lastMessage = {};
  private msg$;

  constructor() {
    remoteChatService.channels$({})
      .pipe(
        tap(i => this.ch$.next(i))
      )
      .subscribe()
  }

  createChannel({topic}) {
    return remoteChatService.createChannel({topic: topic});
  }

  channels$() {
    return this.ch$.asObservable() as Observable<ChatServiceAPI.Channel>;
  }

  message({ch, msg}) {
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

  messages$({ch}) {
    //return concat(readHistory(ch), this.readRemote(ch))
    this.history[ch] = this.history[ch] || new ReplaySubject();
    this.lastMessage[ch] = this.lastMessage[ch] || 0;

    if (this.msg$) {
      this.msg$.unsubscribe();
    }
    this.msg$ = remoteChatService.messages$({
      channel: ch,
      from: this.lastMessage[ch]
    }).pipe(
      tap((m) => {
        this.lastMessage[ch] < m.header.timestamp ? this.lastMessage[ch] = m.header.timestamp : '';
      }),
      tap(i => this.history[ch].next(i))
    ).subscribe();
    return this.history[ch].asObservable();
  }
}
