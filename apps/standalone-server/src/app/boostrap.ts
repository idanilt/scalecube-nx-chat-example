import {createMicroservice} from '@scalecube/node';
import {ChatServiceDefinition} from '@scalecube-chat-example/api';
import {ChatService} from '@scalecube-chat-example/chat-service';
import Gateway from '@scalecube/rsocket-ws-gateway/lib';

export async function bootstrap(options = {gw_port: 8000, ms_port: 8080}) {
  const chatService = await ChatService.build();

  // Create a service
  const ms = createMicroservice({
    debug: true,
    services: [
      {
        definition: ChatServiceDefinition,
        reference: chatService
      }
    ],
    address: `ws://localhost:${options.ms_port}/`
  });

  const serviceCall = ms.createServiceCall({});

  const gateway = new Gateway({port: options.gw_port});
  gateway.start({serviceCall});

  return { ms, gateway };
}
