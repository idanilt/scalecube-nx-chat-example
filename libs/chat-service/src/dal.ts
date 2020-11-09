import {Observable} from "rxjs";

export interface Dal {
  createTopic: (topic: string, id: string) => Promise<void>;
  topics$:() => Observable<{topic: string, id: string}>
}

export async function factory(options){
  const dep = await import(`./dal_${options.driver}.ts`);
  return new dep[`Dal_${options.driver}`](options.options);
}
