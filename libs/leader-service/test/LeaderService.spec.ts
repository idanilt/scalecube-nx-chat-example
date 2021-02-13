import {LeaderService} from "../src"
import {createMicroservice} from "@scalecube/node";
import {RaftState} from "../src/lib/RaftState";

function createCluster(){
  function port(port) {
    return {
      protocol: "ws",
      host: "localhost",
      port: port,
      path: ""
    }
  }

  const seed = createMicroservice({address: port(10010), debug: true});
  const nodes = [];

  nodes[0] = new LeaderService(createMicroservice, port(10011), port(10010), "1", port(10021));
  nodes[1] = new LeaderService(createMicroservice, port(10012), port(10010), "2", port(10022));
  nodes[2] = new LeaderService(createMicroservice, port(10013), port(10010), "3", port(10023));
  nodes[3] = new LeaderService(createMicroservice, port(10014), port(10010), "4", port(10024));
  nodes[4] = new LeaderService(createMicroservice, port(10015), port(10010), "5", port(10025));

  const proxy = seed.createProxy({
    serviceDefinition: {
      serviceName: "LeaderService",
      methods: {
        stat: {asyncModel: "requestResponse"},
      }
    }
  });

  return { proxy, nodes, seed}
}
async function whoIsLeader(svc) {
  for( let i = 1 ; i <= 5 ;  i++ ) {

  }
}

describe("LeaderService suite", () => {
  test("Should have leader", async (done) => {
    const {proxy, nodes, seed} = createCluster();


    setTimeout(async () => {
      const stat = await proxy.stat();
      console.log(stat);
      const leader = stat.leader;
      expect(leader).toMatch(/^[1-5]$/);
      done();
    }, 2000);

  });
  test("Leader should be replace if current leader dies", async (done) => {
    const {proxy, nodes, seed} = createCluster();


    setTimeout(async () => {
      const leader = (await proxy.stat()).leader;
      nodes[leader -1].destroy();
      expect(leader).not.toBe((await proxy.stat()).leader);
      done();
    }, 2000);

  });
});
