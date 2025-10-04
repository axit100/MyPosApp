import { NextRequest, NextResponse } from 'next/server';
import net from 'net';
import connectDB from '@/lib/mongodb';
import RestaurantSettings from '@/models/Settings';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ESC/POS helper to build a simple 2 inch (58mm) test receipt
function buildTestReceipt(): Buffer {
  const ESC = '\x1b';
  const GS = '\x1d';
  const cmds: string[] = [];
  // Initialize printer
  cmds.push(`${ESC}@`);
  // Align center
  cmds.push(`${ESC}a\x01`);
  // Double height width off (use small font for 58mm)
  cmds.push(`${GS}!\x00`);
  // Title
  cmds.push('*** TEST RECEIPT ***\n');
  cmds.push('POSBillApp\n');
  cmds.push('-----------------------------\n');
  // Content
  cmds.push('Hello from your Next.js POS!\n');
  cmds.push('Printing to 58mm ESC/POS printer.\n');
  cmds.push('Date: ' + new Date().toLocaleString() + '\n');
  cmds.push('-----------------------------\n');
  cmds.push('Thank you!\n\n\n');
  // Cut (partial cut)
  cmds.push(`${GS}V\x01`);
  return Buffer.concat(cmds.map((s) => Buffer.from(s, 'binary')));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let printerIp = body.printerIp || process.env.PRINTER_IP as string | undefined;
    let printerPort = Number(body.printerPort || process.env.PRINTER_PORT || 0);

    if (!printerIp || !printerPort) {
      // Load from DB settings as fallback
      await connectDB();
      const settings = await RestaurantSettings.findOne();
      printerIp = printerIp || settings?.printerSettings?.printerIP;
      printerPort = printerPort || Number(settings?.printerSettings?.printerPort || 9100);
    }

    if (!printerIp) {
      return NextResponse.json({ success: false, error: 'printerIp is required' }, { status: 400 });
    }

    const payload = buildTestReceipt();

    const result = await new Promise<{ success: boolean; message?: string }>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(5000);

      const handleTimeout = () => {
        resolve({ success: false, message: 'Connection timed out' });
        socket.destroy();
      };
      const handleError = (err: Error) => {
        resolve({ success: false, message: err.message });
      };
      const finishOk = () => {
        socket.end();
        resolve({ success: true });
      };
      const onWritten = (err?: Error | null) => {
        if (err) {
          resolve({ success: false, message: 'Write failed: ' + err.message });
          socket.destroy();
          return;
        }
        // give printer a brief moment then end
        setTimeout(finishOk, 150);
      };
      const handleConnect = () => {
        socket.write(payload, onWritten as any);
      };

      socket.on('timeout', handleTimeout);
      socket.on('error', handleError);
      socket.on('connect', handleConnect);
      socket.on('close', () => {});

      socket.connect(printerPort, printerIp);
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message || 'Print failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Unexpected error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const settings = await RestaurantSettings.findOne();
    return NextResponse.json({
      success: true,
      data: {
        printerIp: settings?.printerSettings?.printerIP || null,
        printerPort: settings?.printerSettings?.printerPort || 9100
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to load printer settings' }, { status: 500 });
  }
}
