import {Dal} from "../dal";
import {concat, from, Subject} from "rxjs";
import {ChatServiceAPI} from "@scalecube-chat-example/api";


export class Dal_inmemory implements Dal {
  channels: ChatServiceAPI.Channel[] = [];
  channelsSubject$ = new Subject<ChatServiceAPI.Channel>();
  messages: { [ch: string]: ChatServiceAPI.Message[] } = {};
  messagesSubject$: { [ch: string]: Subject<ChatServiceAPI.Message> } = {};

  constructor() {
  }
  async createTopic(topic: string, id: string){
    const ch = {
      id,
      topic
    }
    this.channels.push(ch);
    this.messages[id] = [];
    this.messagesSubject$[id] = new Subject();
    this.channelsSubject$.next(ch);
  }
  topics$(){
    return concat(from(this.channels), this.channelsSubject$);
  }
  async createMessage(channel: string, message: string){
    this.messages[channel].push({message});
    this.messagesSubject$[channel].next({message});
  }
  messages$(channel){
    return concat(from(this.messages[channel]), this.messagesSubject$[channel]);
      //.pipe(filter(i => !req.from || i.header.timestamp > req.from));
  }
}
