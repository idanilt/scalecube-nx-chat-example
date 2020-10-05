# Scalecube Chat Example nrwl/nx

## See the example

Use `yarn` to install dependencies

Run `nx serve standalone-server` to start standalone server  
Run `nx serve chat-client` to start the client

## Project structure
- apps/chat-client chat client uses chat-service-fe and scalecube/browser
- apps/standalone-server standalone server using chat-service and scalecube/node
- libs/api services apis and definitions
- libs/chat-service backend chat service only lib without bootstrap
- libs/chat-service-fe frontend chat service only lib without bootstrap

