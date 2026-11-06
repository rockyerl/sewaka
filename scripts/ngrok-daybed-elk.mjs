import ngrok from '@ngrok/ngrok';

const PORT = 3000;
const AUTHTOKEN = '3LixloROh6ImsE2hhD62dmUeVDq_66nJu6y4GTP1ko6bkroSN';
const DOMAIN = 'daybed-elk-catalog.ngrok-free.dev';

console.log(`Memulai ngrok tunnel pada port ${PORT} dengan domain: ${DOMAIN}`);

// Connect session
const session = await new ngrok.SessionBuilder()
  .authtoken(AUTHTOKEN)
  .connect();

// Create HTTP endpoint with the specified domain
const listener = await session.httpEndpoint()
  .domain(DOMAIN)
  .listenAndForward(`http://localhost:${PORT}`);

const url = listener.url();
console.log(`\n🌐 Tunnel berhasil dimulai!`);
console.log(`URL: ${url}`);
console.log('\nAplikasi kamu sekarang bisa diakses dari URL di atas.');
console.log('Tekan Ctrl+C untuk menghentikan tunnel.\n');

// Keep the process running
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nMenghentikan tunnel...');
  listener.close();
  session.close();
  process.exit(0);
});
