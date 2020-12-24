import {bootstrap} from '../src/app/boostrap';
import {ChatServiceDefinition, ChatServiceAPI} from "@scalecube-chat-example/api";
import {filter, tap} from "rxjs/operators";


describe("sanity",()=>{
  test("ms bootstrap", async (done)=>{
    expect.assertions(2);
    const {ms} = await bootstrap({gw_port: 10010, ms_port: 10011});
    const chat: ChatServiceAPI.ChatService = ms.createProxy({serviceDefinition: ChatServiceDefinition});
    const ch = await chat.createChannel({topic: "hey"});

    chat.messages$({channel: ch.id})
      .pipe(
        tap(console.log),
        filter((i) => i.message === "hello"),
        tap((i)=>{
          expect(i).toHaveProperty("header.timestamp");
          expect(i.header.timestamp).toBeDefined();
          done();
        })
      ).subscribe();
    await chat.message({message: "hello", header: {channel: ch.id, type: "text", timestamp: Date.now()}}).catch((e) => console.error(e));



  })
})
