import {ChatServiceAPI} from '@scalecube-chat-example/api';
import {Dal, factory} from "./dal/dal";
import {filter} from "rxjs/operators";

const defaultOptions = {
  storage: {
    driver: "inmemory",
    options: {}
  }
}
export class ChatService implements ChatServiceAPI.ChatService{
  conn: Dal;
  public static async build(buildOptions?: any){
    const conn = await factory(buildOptions ? buildOptions.storage || defaultOptions.storage : defaultOptions.storage);
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
    await this.conn.createTopic(ch.topic, ch.id);
    return { id: ch.id };
  }
  channels$(_: ChatServiceAPI.Channels$Request){
    return this.conn.topics$();
  }
  async message(req: ChatServiceAPI.MessageRequest){
    await this.conn.createMessage(req.header.channel, req.message)
  }
  messages$(req: ChatServiceAPI.Messages$Request){
    return this.conn.messages$(req.channel)
      .pipe(filter(i => !req.from || i.header.timestamp > req.from));
  }
}
