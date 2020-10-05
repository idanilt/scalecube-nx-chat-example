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

export interface MessageRequest {
    header: {
        channel: string,
        timestamp: number,
        type: string
    },
    message: string
}

export type MessageResponse = void;

export interface Messages$Request {
    channel: string;
    from?: number;
}

export interface ChatService {
    createChannel(req: CreateChannelRequest): CreateChannelResponse;
    message(req: MessageRequest): MessageResponse;
    channels$(req: Channels$Request): Observable<Channel>;
    messages$(req: Messages$Request): Observable<{ ts: number, message: string }>;
}
