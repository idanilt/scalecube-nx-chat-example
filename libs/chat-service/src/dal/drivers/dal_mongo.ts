import * as mongoose from "mongoose"
import {Dal} from "../dal";
import {Observable} from "rxjs";

const topicSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  id: { type: String, required: true }
});

const chatSchema = new mongoose.Schema({
  message: { type: String, required: true }
});

export class Dal_mongo implements Dal {
  conn: mongoose.connection;
  topicModel: mongoose.Model;
  constructor(options) {
    this.conn = options.conn;
    this.topicModel = options.conn.model("topic", topicSchema);
  }
  async createTopic(topic: string, id: string){
    return this.topicModel.create({topic, id});
  }
  topics$(){
    const watch = this.topicModel.watch();

    return new Observable<{topic: string, id: string}>(subscriber => {
      watch.on('change', t => subscriber.next({
        topic: t.fullDocument.topic,
        id: t.fullDocument.id
      }));
      watch.on('error', e => subscriber.error(e));
      watch.on('close', _ => subscriber.complete());
      watch.on('end', _ => subscriber.complete());
    });
  }
  async createMessage(channel, message){
    const chat = this.conn.model(`chat-${channel}`, chatSchema);
    await chat.create({ message });
  }
  messages$(channel){
    const chat = this.conn.model(`chat-${channel}`, chatSchema);
    const watch = chat.watch();

    return new Observable<{message: string}>(subscriber => {
      watch.on('change', t => subscriber.next({
        message: t.fullDocument.message
      }));
      watch.on('error', e => subscriber.error(e));
      watch.on('close', _ => subscriber.complete());
      watch.on('end', _ => subscriber.complete());
    });
  }
}
