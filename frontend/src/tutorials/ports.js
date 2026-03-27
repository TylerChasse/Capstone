import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'ports',
  name: 'Ports',
  frames: [
    new Frame({
      title: 'Ports',
      text: 'An IP address gets a packet to the right device — but once it arrives, how does the device know which application should handle it? That\'s what ports are for. Load the sample packets below to explore how ports work in real traffic.',
      actionButton: { label: 'Load Sample Packets', action: 'load-ports-sample' },
    }),
    new Frame({
      title: 'What Is a Port?',
      text: 'A port is a number between 0 and 65535 that identifies a specific application or service on a device. Think of an IP address as the street address of a building, and a port as the apartment number — both are needed to reach the right destination.\n\nEvery packet in the Transport layer has a Source Port and a Destination Port. Click packet #1 and look at the Transport section.',
      highlight: 'detail-transport',
      selectPacket: 1,
    }),
    new Frame({
      title: 'Destination Port — What Service Are You Contacting?',
      text: 'The Destination Port tells you what service on the receiving device should handle this packet. Packet #1 has a Destination Port of 80 — the standard port for HTTP (web traffic). Any server listening on port 80 will accept this packet and treat it as a web request.',
      highlight: 'detail-transport',
      selectPacket: 1,
    }),
    new Frame({
      title: 'Source Port — The Return Address',
      text: 'The Source Port is chosen randomly by your computer when it opens a connection — you\'ll see a high number like 49201. It acts as a return address so the server\'s reply knows which application on your machine to come back to.\n\nYour computer can have dozens of connections open at once, each using a different source port to keep them all separate.',
      highlight: 'detail-transport',
      selectPacket: 1,
    }),
    new Frame({
      title: 'Port 443 — HTTPS',
      text: 'Packet #2 goes to port 443. That\'s the standard port for HTTPS — secure web traffic encrypted with TLS. Whenever you visit a site starting with "https://", your browser connects to port 443.\n\nThe protocol shows as TLS because that\'s the encryption layer being used. The destination is a different IP address than packet #1 — each connection goes to its own server.',
      highlight: 'detail-transport',
      selectPacket: 2,
    }),
    new Frame({
      title: 'Port 53 — DNS',
      text: 'Packet #3 goes to port 53 — the standard port for DNS. DNS uses this port on both TCP and UDP (you\'ll see this one uses UDP). Any time your device needs to look up a domain name, it sends a packet to port 53 on a DNS server.\n\nThe Destination IP is 8.8.8.8 — Google\'s public DNS server, one of the most common DNS servers in the world.',
      highlight: 'detail-transport',
      selectPacket: 3,
    }),
    new Frame({
      title: 'Port 22 — SSH',
      text: 'Packet #4 is a TCP SYN heading to port 22 — the standard port for SSH (Secure Shell). SSH is used to remotely log in to and control another computer securely over a network.\n\nThis is a connection attempt (SYN flag) to a different server (203.0.113.10). Payload Length is 0 because no data has been sent yet — the TCP handshake is still being established.',
      highlight: 'detail-transport',
      selectPacket: 4,
    }),
    new Frame({
      title: 'The Server Replies — Ports Flip',
      text: 'Packet #5 is the server\'s HTTP response to packet #1. Notice how the ports are now reversed: Source Port is 80 (the server\'s web service) and Destination Port is 49201 (your computer\'s original source port).\n\nThis is how two-way communication works. Your computer sends from 49201 to 80. The server replies from 80 to 49201. The same pair of ports keeps the conversation together.',
      highlight: 'detail-transport',
      selectPacket: 5,
    }),
    new Frame({
      title: 'Common Ports to Know',
      text: 'Here are the most important port numbers you\'ll see in captures:\n\n  Port 80   — HTTP (unencrypted web)\n  Port 443  — HTTPS (encrypted web)\n  Port 53   — DNS (domain name lookups)\n  Port 22   — SSH (remote access)\n  Port 25   — SMTP (sending email)\n  Port 3389 — RDP (remote desktop)\n\nWhen you spot an unfamiliar destination port in a capture, looking it up is a quick way to understand what that traffic is.',
      highlight: ['col-source', 'col-destination'],
    }),
  ],
});
