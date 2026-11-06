import ngrok from '@ngrok/ngrok';

const AUTHTOKEN = '3LixloROh6ImsE2hhD62dmUeVDq_66nJu6y4GTP1ko6bkroSN';

console.log('Mengatur authtoken ngrok...');

// Set authtoken for all future connections
await ngrok.authtoken(AUTHTOKEN);

console.log('✓ Authtoken berhasil dikonfigurasi!');
console.log(`Authtoken: ${AUTHTOKEN.substring(0, 8)}...${AUTHTOKEN.substring(AUTHTOKEN.length - 4)}`);
console.log('\nAuthtoken ini akan digunakan untuk semua koneksi ngrok di session ini.');
console.log('Untuk penggunaan permanen, set environment variable:');
console.log('  $env:NGROK_AUTHTOKEN = "' + AUTHTOKEN + '"');
