import {ChatService} from "@scalecube-chat-example/chat-service";
import {createMicroservice} from "@scalecube/node";
import {ChatServiceDefinition, ChatServiceAPI} from "@scalecube-chat-example/api";
import {Microservice} from "@scalecube/api/lib/microservice";
import {Address} from "@scalecube/api";
import {  MongoMemoryReplSet } from  'mongodb-memory-server';
import * as mongoose from 'mongoose';

let port = 10000;

const replSet = new MongoMemoryReplSet({
  instanceOpts: [
    { storageEngine: 'wiredTiger'},
  ],
  replSet: {
    dbName: 'topic',
    name: 'topic',
  },
  autoStart: true,
});


async function createMongo(){
  await replSet.waitUntilRunning();
  const uri = await replSet.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return await mongoose.createConnection(uri + "?replicaSet=topic", mongooseOpts);
}




export class Fixture{
  address:Address;
  seed;
  constructor() {
    const initSeed = () =>{
      this.address = {
        protocol: "ws",
        host: "localhost",
        path: "",
        port: port
      };
      this.seed = createMicroservice({address: this.address});
    }
    try {
      initSeed()
    } catch (e) {
      port++;
      initSeed();
    }

  }
  async createChat() : Promise<{service: ChatServiceAPI.ChatService, ms: Microservice }>{
    const mongo = await createMongo();
    try {
      const ms = createMicroservice({
        services: [
          {
            definition: ChatServiceDefinition,
            reference: await ChatService.build({
              storage: {
                driver: 'mongo',
                options: {
                  conn: mongo
                }
              }
            })
          }
        ],
        seedAddress: this.address,
        address: {
          protocol: "ws",
          host: "localhost",
          path: "",
          port: ++port
        }
      });

      return {
        ms,
        service: ms.createProxy({serviceDefinition: ChatServiceDefinition})
      } as { ms: Microservice, service: ChatServiceAPI.ChatService }
    } catch (e) {
      return this.createChat();
    }
  }
}
