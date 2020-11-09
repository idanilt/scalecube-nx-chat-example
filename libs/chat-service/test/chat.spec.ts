import {ChatService} from "@scalecube-chat-example/chat-service";
import {filter, switchMap, tap} from "rxjs/operators";

function getChatService(){
  return new ChatService();
}
describe("Chat test suite", () => {
  test(`Scenario create channel
    When getting createChannel request with channel myChannel
    And channel creation succeed
    Then channels$ should emit event with myChannel`, (done) => {
    expect.assertions(1);
    const chat = getChatService();
    chat
      .channels$({})
      .pipe(
        filter(i => i.topic === "myChannel"),
        tap(i => expect(i.topic).toBe("myChannel") ),
        tap(_ => done())
      )
      .subscribe();
    chat.createChannel({topic: "myChannel"});
  });
  test(`Scenario Post message
    Given channel myChannel
    When posting a message "hello" to myChannel
    Then messages$ should emit a message with "hello"`, (done) => {
    expect.assertions(1);
    const chat = getChatService();
    chat
      .channels$({})
      .pipe(
        filter(i => i.topic === "myChannel"),
        tap(i => chat.message({
            header: {
              channel: i.id,
              type: "message",
              timestamp: Date.now()
            },
            message: "hello"
          })),
        switchMap(i => chat.messages$({
          channel: i.id,
        })),
        filter(i => i.message === "hello"),
        tap(i => expect(i.message).toBe("hello") ),
        tap(_ => done())
      )
      .subscribe();
    chat.createChannel({topic: "myChannel"});
  });

});
