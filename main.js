import ProxyChain from 'proxy-chain';
import ngrok from '@ngrok/ngrok';

const server = new ProxyChain.Server({ port: 8081 });
server.listen(async () => {
    try {
        const builder = new ngrok.SessionBuilder();
        builder.authtokenFromEnv().metadata("ProxyChain UNIX socket");
      
        builder.connect().then((session) => {
          session
            .tcpEndpoint()
            .metadata("ProxyChain listener")
            .listen()
            .then((listener) => {
              console.log("Ingress established at:", listener.url());
              listener.forward('http://localhost:8081')
            });
        });
    } catch (error) {
        console.error('Failed to start ngrok tunnel:', error);
        process.exit(1);
    }
});