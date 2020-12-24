import {Observable} from "rxjs";

export interface Channel {
    id: string;
    topic: string;
}
export interface CreateChannelRequest {
    topic: string;
}
export type CreateChannelResponse = Promise<{
    id: string;
}>;
export interface Channels$Request {
}

export interface Message {
  header?: {
    channel: string,
    timestamp: number,
    type: string,
    nodeId?:number,
    msgId?:string,
  },
  message: string
}

export interface MessageRequest extends Message{

}

export type MessageResponse = Promise<void>;

export interface Messages$Request {
    channel: string;
    from?: number;
}

export interface ChatService {
    createChannel(req: CreateChannelRequest): CreateChannelResponse;
    message(req: MessageRequest): MessageResponse;
    channels$(req: Channels$Request): Observable<Channel>;
    messages$(req: Messages$Request): Observable<Message>;
}
