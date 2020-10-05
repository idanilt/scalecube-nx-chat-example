import {ChatServiceAPI} from '@scalecube-chat-example/api';
import { Subject, from, concat } from 'rxjs';
import {filter} from "rxjs/operators";
const channels: ChatServiceAPI.Channel[] = [];
const channels$ = new Subject<ChatServiceAPI.Channel>();
const messages: {[ch:string]: {ts: number, message: string}[]} = {};
const messages$: {[ch:string]: Subject<{ts: number, message: string}>} = {};
export class ChatService implements ChatServiceAPI.ChatService{
    async createChannel(req: ChatServiceAPI.CreateChannelRequest){
        const ch = {
            id: `${Date.now()}-${Math.random()}`,
            topic: req.topic
        }
        messages[ch.id] = [];
        messages$[ch.id] = new Subject();
        channels.push(ch);
        channels$.next(ch)
        return { id: ch.id };
    }
    channels$(_: ChatServiceAPI.Channels$Request){
        return concat(from(channels), channels$);
    }
    async message(req: ChatServiceAPI.MessageRequest){
        messages[req.header.channel].push({
            ts: req.header.timestamp,
            message: req.message
        });
        messages$[req.header.channel].next({
            ts: req.header.timestamp,
            message: req.message
        });
    }
    messages$(req: ChatServiceAPI.Messages$Request){
        return concat(from(messages[req.channel]), messages$[req.channel])
            .pipe(filter(i => !req.from || i.ts > req.from));
    }
}
