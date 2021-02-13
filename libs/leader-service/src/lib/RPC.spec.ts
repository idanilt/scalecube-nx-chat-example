import {createRaft} from "./RaftState";
import {RPC} from "./RPC";
import {createMicroservice} from "@scalecube/node";
import {leaderDef} from "@scalecube-chat-example/leader-service";

describe("RPC Unit", () => {
  test("RPC full cycle", async () => {
    const rpc = new RPC(createRaft());
    rpc.requestVote({
      term: 1,
      node: "leader"
    });
    rpc.heartBeat({
      term: 1,
      node: "leader"
    });
    rpc.request({
      term: 1,
      node: "leader",
      payload: {}
    })

    const snap1 = await rpc.stat();
    expect(snap1.leader).toBe("leader");
  });
  test("register to MS",async (done)=>{
    const seed = createMicroservice({
      address: {
        host: "localhost",
        path: "",
        port: 10040,
        protocol: "ws"
      },
      debug: true
    });
    const ms = createMicroservice({
      services: [
        {
          definition: {
            serviceName: "LeaderService",
            methods: {
              requestVote: {asyncModel: "requestResponse"},
              heartBeat: {asyncModel: "requestResponse"},
              request: {asyncModel: "requestResponse"},
              stat: {asyncModel: "requestResponse"},
            }
          },
          reference: new RPC(createRaft())
        }
      ],
      address: {
        host: "localhost",
        path: "",
        port: 10041,
        protocol: "ws"
      },
      seedAddress: {
        host: "localhost",
        path: "",
        port: 10040,
        protocol: "ws"
      },
      debug: true
    });
    const p: RPC = seed.createProxy({serviceDefinition: leaderDef});

    setTimeout(async () => {
      const res = await p.stat();
      console.log(res);
      expect(res).toHaveProperty("leader");
      done();
    },1000);
  });
});
