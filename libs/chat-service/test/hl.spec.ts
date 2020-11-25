import {ChatService} from "@scalecube-chat-example/chat-service";
import {Fixture} from "./fixture";
import {filter, map, tap} from "rxjs/operators";
import {combineLatest} from "rxjs";

describe("High Availability test suite", () => {
  test(`Scenario new topic sync with all nodes
    Given ChatService 3 instances A, B and C
    When channel myTopic created on instance A
    Then instances A, B, C should have channel "myChannel"`, async (done) => {
    const fixture = new Fixture();
    const a = await fixture.createChat();
    const b = await fixture.createChat();
    const c = await fixture.createChat();

    a.service.createChannel({topic: "myChannel"});

    const getMyChannel = ({ service }, name) =>
      (service as ChatService).channels$({})
        .pipe(
          // tap(console.log),
          filter( i => i.topic === "myChannel"),
          map(_ => name)
        );
    combineLatest(getMyChannel(a, "a"), getMyChannel(b, "b"), getMyChannel(c, "c"))
      .pipe(
        tap(i => expect(i).toEqual(['a', 'b', 'c'])),
        tap(_ => done()),
      )
      .subscribe();

  });
  test(`Scenario: Scale-up
    Given ChatService 3 instances A, B and C
    When ChatService instance D is added
    Then All instances able to persist messages
    And A, B, C messages streams continue to emit new messages
    And New messages streams emit correct values`, () => {
    // const fixture = new Fixture();
    // const a = fixture.createChat();
    // const b = fixture.createChat();
    // const c = fixture.createChat();
    //
    // const messages = sendMessages(3 * 100, "topic", a, b, c);
    // const d = createChat();
    // d.messages$({channel: "topic"})
    //   .pipe(have(messages))
    //   .subscribe()

  });
  test(`Scenario: Scale-down
    Given ChatService 3 instances A, B and C
    When ChatService instance C is removed
    Then All instances able to persist messages
    And A, B messages streams continue to emit new messages
    And New messages streams emit correct values`, () => {});
  test(`Scenario: 2 instances write to the same channel at the same time
    Given ChatService 3 instances A, B, C with message$ steam
    When A write "Hello"
    And B write "World"
    Then All instances able to persist messages`, () => {});
    });




