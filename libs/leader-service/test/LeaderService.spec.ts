import {LeaderService} from "../src"
import {createMicroservice} from "@scalecube/node";

describe("LeaderService suite", () => {
  test("should be", async (done) => {
    function port(port) {
      return {
        protocol: "ws",
        host: "localhost",
        path: "",
        port: port
      }
    }

    const seed = createMicroservice({address: port(10010), debug: true});

    const p1 = new LeaderService(createMicroservice, port(10011), port(10010), "1", port(10021));
    // const p2 = new LeaderService(createMicroservice, port(10012), port(10010), "2", port(10022));
    // const p3 = new LeaderService(createMicroservice, port(10013), port(10010), "3", port(10023));
    // const p4 = new LeaderService(createMicroservice, port(10014), port(10010), "4", port(10024));
    // const p5 = new LeaderService(createMicroservice, port(10015), port(10010), "5", port(10025));


    const leader = seed.createProxy({
      serviceDefinition: {
        serviceName: "LeaderService",
        methods: {
          stat: {asyncModel: "requestResponse"},
        }
      }
    });

    setTimeout(async () => {
      const res = await leader.stat();
      console.log(res);
      done();
    }, 2000);

  });
});
