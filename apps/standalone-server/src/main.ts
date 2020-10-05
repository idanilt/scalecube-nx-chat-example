console.log('Hello World!');
import {createMicroservice} from '@scalecube/node';
import {ChatServiceDefinition} from '@scalecube-chat-example/api';
import {ChatService} from '@scalecube-chat-example/chat-service';
import Gateway from '@scalecube/rsocket-ws-gateway';

const chatService = new ChatService();

// Create a service
const ms = createMicroservice({
  debug: true,
  services: [
    {
      definition: ChatServiceDefinition,
      reference: chatService
    }
  ],
});

const serviceCall = ms.createServiceCall({});

const gateway = new Gateway({ port: 8000 });
gateway.start({ serviceCall });
