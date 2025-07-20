import ProxyChain from 'proxy-chain';
import ngrok from '@ngrok/ngrok';

const server = new ProxyChain.Server({
  port: 8081,
  prepareRequestFunction: ({ request }) => {
    const url = request.url;
    const method = request.method;
    const headers = request.headers;

    console.log(`\n[REQUEST] ${method} ${url}`);
    console.log('Headers:', headers);

    return {
      upstreamProxyUrl: null,
    };
  },

  verbose: true,
});
server.listen(async () => {
  try {
    const builder = new ngrok.SessionBuilder();
    builder.authtokenFromEnv().metadata("ProxyChain UNIX socket")
    .handleDisconnection((addr, error) => {
      console.log(`[ngrok] Disconnected from ${addr}: ${error}`);
      return true;
    })
    .handleHeartbeat((latency) => {
      console.log(`[ngrok] Heartbeat latency: ${latency} ms`);
    })
    .handleRestartCommand(() => {
      console.log('[ngrok] Restart command received from ngrok service.');
    })
    .heartbeatTolerance(100);

    builder.connect().then((session) => {
      session
        .tcpEndpoint()
        .metadata("ProxyChain listener")
        .listen()
        .then((listener) => {
          console.log("Ingress established at:", listener.url().replace('tcp://', 'http://'));
          listener.forward('http://localhost:8081')
        });
    });
  } catch (error) {
    console.error('Failed to start ngrok tunnel:', error);
    process.exit(1);
  }
});