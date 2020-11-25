import {Observable} from "rxjs";

export interface Dal {
  createTopic: (topic: string, id: string) => Promise<void>;
  topics$:() => Observable<{topic: string, id: string}>;
  createMessage: (channel: string, message: string) => void;
  messages$: (channel: string) => Observable<any>;
}

export async function factory(options){
  const dep = await import(`./drivers/dal_${options.driver}.ts`);
  return new dep[`Dal_${options.driver}`](options.options);
}
