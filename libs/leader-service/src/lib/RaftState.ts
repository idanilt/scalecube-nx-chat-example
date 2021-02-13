import {ReplaySubject, Subject} from "rxjs";
import {ServiceDefinition} from "@scalecube/api/lib/microservice";

export interface RaftState {
  node: string;
  machine$: ReplaySubject<"follower" | "candidate" | "leader">;
  beat$: Subject<number>;
  leader: string;
  term: number;
  termVote: Set<number>;
}

export const createRaft = () => ({
  node: Date.now() + "_" + Math.random(),
  machine$: new ReplaySubject<"follower" | "candidate" | "leader">(1),
  beat$: new Subject<number>(),
  leader: "",
  term: 0,
  termVote: new Set<number>()
})
