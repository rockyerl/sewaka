import ngrok from '@ngrok/ngrok';

const PORT = 3000;
const AUTHTOKEN = '3LixloROh6ImsE2hhD62dmUeVDq_66nJu6y4GTP1ko6bkroSN';

console.log(`Memulai ngrok tunnel pada port ${PORT} dengan URL acak...`);

// Start ngrok tunnel dengan URL acak (tidak menggunakan domain spesifik)
const listener = await ngrok.forward({
  addr: PORT,
  authtoken: AUTHTOKEN
});

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
  process.exit(0);
});
