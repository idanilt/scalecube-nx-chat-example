import {ChatService} from "@scalecube-chat-example/chat-service";
import {createMicroservice} from "@scalecube/node";
import {ChatServiceDefinition, ChatServiceAPI} from "@scalecube-chat-example/api";
import {Microservice} from "@scalecube/api/lib/microservice";

export class Fixture{
  address = Date.now().toString();
  seed = createMicroservice({address: this.address});
  createChat(){
    const ms = createMicroservice({
      services: [
        {
          definition: ChatServiceDefinition,
          reference: new ChatService()
        }
      ],
      seedAddress: this.address
    });

    return {
      ms,
      service: ms.createProxy({serviceDefinition: ChatServiceDefinition})
    } as { ms: Microservice, service: ChatServiceAPI.ChatService }
  }
}

describe("ssds",()=>{
  test("sdsd", ()=>{
    //new Fixture();
  })
})
