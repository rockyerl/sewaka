import ngrok from '@ngrok/ngrok';
import { spawn } from 'child_process';

const PORT = 3000;

// Start Next.js dev server
console.log(`Starting Next.js dev server on port ${PORT}...`);
const nextServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

let session = null;
let listener = null;
let shuttingDown = false;

function killNext() {
  if (!nextServer.pid) return;
  if (process.platform === 'win32') {
    // /T kills the whole process tree, not just the cmd.exe wrapper
    spawn('taskkill', ['/pid', String(nextServer.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    nextServer.kill();
  }
}

async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\nShutting down...');
  try { await listener?.close(); } catch {}
  try { await session?.close(); } catch {}
  killNext();
  setTimeout(() => process.exit(code), 500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
nextServer.on('exit', () => shutdown(0));

// Wait for server to be ready
let attempts = 0;
const maxAttempts = 30;
let serverReady = false;

while (attempts < maxAttempts && !serverReady) {
  try {
    const res = await fetch(`http://localhost:${PORT}`);
    if (res.ok) serverReady = true;
  } catch {
    // Server not ready yet
  }
  if (!serverReady) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

if (!serverReady) {
  console.error('Next.js server did not start in time.');
  await shutdown(1);
}

console.log(`Next.js server is ready on port ${PORT}`);

// Start ngrok tunnel with remote stop/restart support
try {
  session = await new ngrok.SessionBuilder()
      .authtokenFromEnv()
      .handleStopCommand(async () => {
        console.log('Remote stop requested from ngrok dashboard');
        await shutdown(0);
      })
      .handleRestartCommand(async () => {
        console.log('Remote restart requested (ignored in dev)');
      })
      .handleUpdateCommand(async () => {
        console.log('Remote update requested (ignored in dev)');
      })
      .connect();

  listener = await session.httpEndpoint().listenAndForward(`http://localhost:${PORT}`);
  console.log(`\nTunnel URL: ${listener.url()}`);
} catch (err) {
  console.error('ngrok failed to start:', err);
  await shutdown(1);
}