import { NextResponse } from 'next/server';
import os from 'os';
import net from 'net';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getLocalSubnets(): string[] {
  const ifaces = os.networkInterfaces();
  const subnets = new Set<string>();
  for (const name of Object.keys(ifaces)) {
    for (const info of ifaces[name] || []) {
      if (!info || info.internal || info.family !== 'IPv4') continue;
      const parts = info.address.split('.');
      if (parts.length === 4) subnets.add(`${parts[0]}.${parts[1]}.${parts[2]}`);
    }
  }
  // Fallbacks
  if (subnets.size === 0) {
    ['192.168.0', '192.168.1', '10.0.0'].forEach(s => subnets.add(s));
  }
  return Array.from(subnets);
}

function tryConnect(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      try { socket.destroy(); } catch {}
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.on('connect', () => finish(true));
    socket.on('timeout', () => finish(false));
    socket.on('error', () => finish(false));
    socket.on('close', () => finish(false));

    socket.connect(port, host);
  });
}

export async function GET() {
  const PORT = 9100; // ESC/POS default
  const TIMEOUT = 300; // ms per host attempt
  const CONCURRENCY = 64;

  const subnets = getLocalSubnets();

  const candidates: string[] = [];
  for (const subnet of subnets) {
    for (let i = 1; i <= 254; i++) {
      candidates.push(`${subnet}.${i}`);
    }
  }

  const results: string[] = [];

  // Run a simple pool for concurrency
  let index = 0;
  async function worker() {
    while (index < candidates.length) {
      const host = candidates[index++];
      const ok = await tryConnect(host, PORT, TIMEOUT);
      if (ok) results.push(host);
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, candidates.length) }, () => worker());
  await Promise.all(workers);

  // De-duplicate and return
  const unique = Array.from(new Set(results));
  return NextResponse.json({ success: true, printers: unique });
}
