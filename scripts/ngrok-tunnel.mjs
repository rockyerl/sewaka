import ngrok from '@ngrok/ngrok';

const PORT = 3000;
const AUTHTOKEN = '3LixloROh6ImsE2hhD62dmUeVDq_66nJu6y4GTP1ko6bkroSN';
const URL = 'https://jalapeno-specimen-sublet.ngrok-free.dev';

console.log(`Mengatur authtoken ngrok...`);

// Set authtoken
await ngrok.authtoken(AUTHTOKEN);
console.log('Authtoken berhasil diatur!');

console.log(`\nMemulai tunnel pada port ${PORT} dengan URL: ${URL}`);

// Start ngrok tunnel with specific URL
const listener = await ngrok.forward({ 
  addr: PORT, 
  authtoken: AUTHTOKEN,
  domain: URL.replace('https://', '')
});

const url = listener.url();
console.log(`\n🌐 Tunnel berhasil dimulai!`);
console.log(`URL: ${url}`);
console.log('\nTekan Ctrl+C untuk menghentikan tunnel.\n');

// Keep the process running
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nMenghentikan tunnel...');
  listener.close();
  process.exit(0);
});
