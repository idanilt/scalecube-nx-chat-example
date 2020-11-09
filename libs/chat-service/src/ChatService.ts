import {ChatServiceAPI} from '@scalecube-chat-example/api';
import { Subject, from, concat } from 'rxjs';
import {filter} from "rxjs/operators";
import {Message} from "../../api/src/ChatService";
import {Dal, factory} from "./dal";

const defaultOptions = {
  storage: {
    driver: "inmemory",
    options: {}
  }
}
export class ChatService implements ChatServiceAPI.ChatService{
  channels: ChatServiceAPI.Channel[] = [];
  channelsSubject$ = new Subject<ChatServiceAPI.Channel>();
  messages: { [ch: string]: Message[] } = {};
  messagesSubject$: { [ch: string]: Subject<Message> } = {};
  conn: Dal;
  public static async build(buildOptions?: any){
    const conn = await factory(buildOptions.storage || defaultOptions.storage)
    return new ChatService({conn});
  }
  constructor(options?: any) {
    this.conn = options.conn;
  }
  async createChannel(req: ChatServiceAPI.CreateChannelRequest){
    const ch = {
      id: `${Date.now()}-${Math.random()}`,
      topic: req.topic
    }
    this.messages[ch.id] = [];
    this.messagesSubject$[ch.id] = new Subject();
    await this.conn.createTopic(ch.topic, ch.id);
    return { id: ch.id };
  }
  channels$(_: ChatServiceAPI.Channels$Request){
    return this.conn.topics$();
  }
  async message(req: ChatServiceAPI.MessageRequest){
    this.messages[req.header.channel].push(req);
    this.messagesSubject$[req.header.channel].next(req);
  }
  messages$(req: ChatServiceAPI.Messages$Request){
    return concat(from(this.messages[req.channel]), this.messagesSubject$[req.channel])
      .pipe(filter(i => !req.from || i.header.timestamp > req.from));
  }
}
