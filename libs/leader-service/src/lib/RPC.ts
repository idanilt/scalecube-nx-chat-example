import {RaftState} from "./RaftState";

export class RPC {
  state: RaftState;

  constructor(state) {
    this.state = state;
  }

  stat(){
    return Promise.resolve(this.state);
  }
  requestVote({term, node}) {
    console.log("vote");
    if (node === this.state.node) {
      return Promise.resolve("accepted");
    }
    if (term > this.state.term && !this.state.termVote.has(term)) {
      this.state.leader = node;
      this.state.machine$.next("follower");
      return Promise.resolve("accepted");
    }
    return Promise.resolve("rejected");
  }

  heartBeat({term, node}) {
    console.log("heartBeat");
    if (node === this.state.node) {
      return Promise.resolve();
    }
    if (term > this.state.term) {
      this.state.leader = node;
      this.state.machine$.next("follower");
    }
    if (term < this.state.term) {
      return Promise.reject()
    }
    this.state.beat$.next(term);
    return Promise.resolve();
  }

  request({term, node, payload}) {
    console.log("request");
    if (node !== this.state.leader && term > this.state.term) {
      this.state.leader = node;
      this.state.machine$.next("follower");
    }
    return Promise.resolve();
  }
}
