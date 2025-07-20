import ProxyChain from 'proxy-chain';
import ngrok from 'ngrok';

const server = new ProxyChain.Server({ port: 8081 });
server.listen(async () => {
    try {
        const url = await ngrok.connect({
            addr: 8081,
            proto: 'tcp',
            authtoken : process.env.NGROK_AUTHTOKEN || '<YOUR_NGROK_AUTHTOKEN>',
        });
        console.log(`Tunnel URL: ${url}`);
        console.log('Proxy server is running on port 8081');
    } catch (error) {
        console.error('Failed to start ngrok tunnel:', error);
        process.exit(1);
    }
});