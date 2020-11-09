import {ChatService} from "@scalecube-chat-example/chat-service";
import {createMicroservice} from "@scalecube/node";
import {ChatServiceDefinition, ChatServiceAPI} from "@scalecube-chat-example/api";
import {Microservice} from "@scalecube/api/lib/microservice";
import {Address} from "@scalecube/api";
import { MongoMemoryServer } from  'mongodb-memory-server';
import * as mongoose from 'mongoose';

let port = 10000;


async function createMongo(){
  const mongod = new MongoMemoryServer();
  const uri = await mongod.getUri();
  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
  };

  return await mongoose.createConnection(uri, mongooseOpts);
}




export class Fixture{
  address:Address = {
    protocol: "ws",
    host: "localhost",
    path: "",
    port: port
  };
  seed = createMicroservice({address: this.address});
  async createChat(){
    const mongo = await createMongo();
    const ms = createMicroservice({
      services: [
        {
          definition: ChatServiceDefinition,
          reference: ChatService.build({
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
  }
}
