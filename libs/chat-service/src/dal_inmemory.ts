import {Dal} from "./dal";
import {concat, from, Subject} from "rxjs";
import {ChatServiceAPI} from "@scalecube-chat-example/api";


export class Dal_mongo implements Dal {
  channels: ChatServiceAPI.Channel[] = [];
  channelsSubject$ = new Subject<ChatServiceAPI.Channel>();

  constructor() {
  }
  async createTopic(topic: string, id: string){
    const ch = {
      id,
      topic
    }
    this.channels.push(ch);
    this.channelsSubject$.next(ch)
  }
  topics$(){
    return concat(from(this.channels), this.channelsSubject$);
  }
}
