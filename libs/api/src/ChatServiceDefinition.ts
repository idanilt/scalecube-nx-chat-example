import {MicroserviceApi} from '@scalecube/api'

export const ChatServiceDefinition: MicroserviceApi.ServiceDefinition = {
    serviceName: "ChatService",
    methods: {
        createChannel: {
            asyncModel: "requestResponse"
        },
        channels$: {
            asyncModel: "requestStream"
        },
        message: {
            asyncModel: "requestResponse"
        },
        messages$: {
            asyncModel: "requestStream"
        },
    }
};