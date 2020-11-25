import {ChatService} from "@scalecube-chat-example/chat-service";
import {filter, finalize, switchMap, takeWhile, tap} from "rxjs/operators";
import {Fixture} from "./fixture";
import {createMicroservice} from "@scalecube/node";
import {ChatServiceAPI, ChatServiceDefinition} from "@scalecube-chat-example/api";

const fixture = new Fixture();

async function chatMongo(){
  return fixture.createChat();
}
let port = 10010;
async function chatInmemory(){
  const ms = createMicroservice({
    services: [
      {
        definition: ChatServiceDefinition,
        reference: await ChatService.build({
          storage: {
            driver: 'inmemory'
          }
        })
      }
    ],
    address: {
      protocol: "ws",
      host: "localhost",
      path: "",
      port: ++port
    }
  });

  return {
    ms,
    service: ms.createProxy({serviceDefinition: ChatServiceDefinition}) as ChatServiceAPI.ChatService
  }
}

describe.each([['inmomemory', chatInmemory], ['mangodb', chatMongo]])("Chat test suite %s", (_, getChatService) => {
  test(`Scenario create channel
    When getting createChannel request with channel myChannel
    And channel creation succeed
    Then channels$ should emit event with myChannel`, async (done) => {
    expect.assertions(1);
    const chat = (await getChatService());
    chat
      .service
      .channels$({})
      .pipe(
        filter(i => i.topic === "myChannel"),
        tap(i => expect(i.topic).toBe("myChannel") ),
        finalize(() => {
          chat.ms.destroy();
          done();
        }),
        takeWhile( i => i.topic !== "myChannel" )
      )
      .subscribe();
    chat.service.createChannel({topic: "myChannel"});
  });
  test(`Scenario Post message
    Given channel myChannel
    When posting a message "hello" to myChannel
    Then messages$ should emit a message with "hello"`, async (done) => {
    expect.assertions(1);
    const chat = (await getChatService());
    chat
      .service
      .channels$({})
      .pipe(
        filter(i => i.topic === "myChannel"),
        tap(i => chat.service.message({
            header: {
              channel: i.id,
              type: "message",
              timestamp: Date.now()
            },
            message: "hello"
          })),
        switchMap(i => chat.service.messages$({
          channel: i.id,
        })),
        filter(i => i.message === "hello"),
        tap(console.log),
        tap(i => expect(i.message).toBe("hello") ),
        finalize(() => {
          chat.ms.destroy();
          done();
        }),
        takeWhile( i => i.message !== "hello" )
      )
      .subscribe();
    chat.service.createChannel({topic: "myChannel"});
  });

});
