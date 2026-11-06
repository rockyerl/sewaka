import ngrok from '@ngrok/ngrok';

const PORT = 3000;
const AUTHTOKEN = '3LixloROh6ImsE2hhD62dmUeVDq_66nJu6y4GTP1ko6bkroSN';
const DOMAIN = 'jalapeno-specimen-sublet.ngrok-free.dev';

console.log(`Memulai ngrok tunnel pada port ${PORT}...`);

// Try simple forward first (no specific domain)
try {
  const listener = await ngrok.forward({
    addr: PORT,
    authtoken: AUTHTOKEN
  });
  console.log(`\n🌐 Tunnel berhasil dimulai (random URL)!`);
  console.log(`URL: ${listener.url()}`);
  console.log('\nTekan Ctrl+C untuk menghentikan tunnel.\n');
  process.stdin.resume();
  process.on('SIGINT', () => {
    console.log('\nMenghentikan tunnel...');
    listener.close();
    process.exit(0);
  });
} catch (error) {
  console.error('Forward gagal, mencoba dengan domain spesifik dan pooling...');
  console.error(error.message);

  // Fallback: try with specific domain and pooling
  const session = await new ngrok.SessionBuilder()
    .authtoken(AUTHTOKEN)
    .connect();

  const listener = await session.httpEndpoint()
    .domain(DOMAIN)
    .poolingEnabled(true)
    .listenAndForward(`http://localhost:${PORT}`);

  const url = listener.url();
  console.log(`\n🌐 Tunnel berhasil dimulai dengan pooling!`);
  console.log(`URL: ${url}`);
  console.log('\nTekan Ctrl+C untuk menghentikan tunnel.\n');
  process.stdin.resume();
  process.on('SIGINT', () => {
    console.log('\nMenghentikan tunnel...');
    listener.close();
    session.close();
    process.exit(0);
  });
}
