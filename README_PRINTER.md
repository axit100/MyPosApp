Printer Integration (WiFi ESC/POS)

Overview
- This project includes a simple API to print a test receipt to a WiFi thermal printer (ESC/POS, typically 58mm / 2-inch paper).

Setup
1) Configure printer IP/Port in environment
   - Add to your .env.local:
     NEXT_PUBLIC_PRINTER_IP=192.168.0.100
     NEXT_PUBLIC_PRINTER_PORT=9100
     PRINTER_IP=192.168.0.100
     PRINTER_PORT=9100

2) Ensure the app runs with Node.js runtime for the print route
   - Implemented in app/api/print/route.ts (runtime = 'nodejs')

3) Network
   - The server must be on the same network as the printer (WiFi/LAN)
   - Verify connectivity: you should be able to ping the printer's IP from the server

Usage
- On Order cards, a Print button sends a test receipt via /api/print.
- Or call the API directly:
  POST /api/print
  Body: { "printerIp": "192.168.0.100", "printerPort": 9100 }

Troubleshooting
- If printing fails, check:
  - Correct IP/port (commonly 9100)
  - Firewall rules allowing outbound TCP to the printer
  - Printer is ESC/POS compatible and supports raw TCP 9100
- You can also print the printer's network status page to confirm settings.
