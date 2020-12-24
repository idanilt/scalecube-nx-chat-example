import {fromEvent} from "rxjs";
import {filter, map, switchMap, tap} from "rxjs/operators";
import {createMicroservice} from "@scalecube/browser";
import {ChatService} from '@scalecube-chat-example/chat-service-fe';
import {ChatServiceDefinition} from "@scalecube-chat-example/api";

import './app.element.css';

const ms = createMicroservice({
  seedAddress: ["seed"],
  debug: true,
  services: [
    {
      reference: new ChatService(),
      definition: ChatServiceDefinition
    }
  ]
});

export const chatService: ChatService = ms.createProxy({
  serviceDefinition: ChatServiceDefinition
})


export class AppElement extends HTMLElement {
  public static observedAttributes = [];

  constructor() {
    super();
    this.innerHTML = `
<header class="flex">
    <h1>Chat</h1>
</header>
<main>
    <select class="channel-list">
    <option>select channel</option>
    </select>
    <input class="new" type="text" placeholder="channel topic">
    <button class="create">create</button>
    <textarea class="chat" style="width: 100%; height: 200px"></textarea>
    <input class="message" style="width: 100%" type="text">
</main>
    `;
  }

  connectedCallback() {
    /// helpers
    // get or get and set new value
    const value = (cls, value = undefined) => {
      const ret = (this.querySelector("." + cls) as Element & { value: string }).value || '';
      if (value !== undefined) {
        (this.querySelector("." + cls) as Element & { value: string }).value = value;
      }
      return ret;
    }
    /// events
    const createChannel$ = fromEvent(this.querySelector('.create'), 'click');
    const changeChannel$ = fromEvent(this.querySelector('.channel-list'), 'change');
    const sendMessage$ = fromEvent(this.querySelector('.message'), 'keypress').pipe(
      filter(e => (e as Event & { code: string }).code === "Enter")
    );
    const channelAdded$ = chatService.channels$();

    /// epics
    createChannel$
      .pipe(
        map(() => value('new', '')),
        tap((v) => v && chatService.createChannel({topic: v}))
      )
      .subscribe();

    changeChannel$
      .pipe(
        tap(() => value('chat', '')),
        switchMap(() => chatService.messages$({ch: value('channel-list')})),
        tap(msg => value('chat', value('chat') + '\n' + (msg as { message: string }).message))
      )
      .subscribe();

    sendMessage$
      .pipe(
        map(() => ({ch: value('channel-list'), msg: value('message', '')})),
        filter(i => i.ch !== '' && i.msg !== ''),
        tap(i => chatService.message(i))
      )
      .subscribe();

    // Draw channels dropdown
    channelAdded$
      .pipe(
        tap((ch) => {
            this
              .querySelector('.channel-list')
              .insertAdjacentHTML('beforeend', `<option value="${ch.id}">${ch.topic}</option>`)
        })
      )
      .subscribe()
  }
}

customElements.define('scalecube-chat-example-root', AppElement);
