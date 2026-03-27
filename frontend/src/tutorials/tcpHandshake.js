import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'tcp-handshake',
  name: 'TCP Handshake',
  frames: [
    new Frame({
      title: 'The TCP Handshake',
      text: 'Before two computers can exchange data using TCP, they first need to agree to open a connection. This agreement happens through a process called the three-way handshake — just three packets that say "let\'s talk." Load the sample capture below to see it in action.',
      actionButton: { label: 'Load Sample Packets', action: 'load-tcp-handshake-sample' },
    }),
    new Frame({
      title: 'The Full Picture',
      text: 'Five packets were loaded. The first three (SYN → SYN-ACK → ACK) are the handshake. Packet 4 is the first real data sent over the connection, and packet 5 closes it. Watch how the Source and Destination flip back and forth as the two sides take turns.',
      highlight: 'packet-table',
      selectPacket: 'first',
    }),
    new Frame({
      title: 'Step 1 of 3 — SYN',
      text: 'Packet 1 is a SYN packet sent from your computer (192.168.1.100) to the server (93.184.216.34). SYN stands for "synchronize" — it\'s your computer knocking on the server\'s door and saying "I want to connect."\n\nNotice the Source Port is a random high number (49732) chosen by your computer, and the Destination Port is 80 — the standard port for web traffic. The Payload Length is 0 because no actual data is sent yet.',
      highlight: ['detail-network', 'detail-transport'],
      selectPacket: 1,
    }),
    new Frame({
      title: 'Step 2 of 3 — SYN-ACK',
      text: 'The server replies with a SYN-ACK. This packet travels the opposite direction — from the server back to your computer. Notice the Source and Destination IPs are now reversed.\n\nThe SYN flag means the server also wants to synchronize. The ACK flag means it\'s acknowledging your SYN from packet 1. Two flags, one packet — "I heard you, and I\'m ready."',
      highlight: ['detail-network', 'detail-transport'],
      selectPacket: 2,
    }),
    new Frame({
      title: 'Step 3 of 3 — ACK',
      text: 'Your computer sends one final ACK back to the server — "got it, let\'s go." This completes the handshake. The connection is now open.\n\nNotice this packet is smaller than the first two (54 bytes vs 74). The SYN and SYN-ACK packets carry extra TCP options in their headers, while this plain ACK carries the minimum. Payload Length is still 0 — no data yet.',
      highlight: 'detail-transport',
      selectPacket: 3,
    }),
    new Frame({
      title: 'Data Flows — HTTP GET',
      text: 'With the handshake complete, real data can now travel over the connection. Packet 4 is an HTTP GET request — your computer asking the server for a web page.\n\nThis packet is much larger (487 bytes) because it carries actual content. The Application Layer section shows the HTTP method (GET) and the host being requested (example.com). The ACK flag is set on all data packets to keep both sides in sync.',
      highlight: ['detail-transport', 'detail-application'],
      selectPacket: 4,
    }),
    new Frame({
      title: 'Closing the Connection — FIN-ACK',
      text: 'When the server is done, it sends a FIN-ACK to close the connection. FIN means "I\'m finished sending." The ACK acknowledges the last data it received.\n\nYou\'ll often see FIN and ACK combined into one packet like this. A full TCP close normally takes four packets (FIN → ACK → FIN → ACK), but you\'ll frequently see them merged. Payload Length is 0 again — no data, just a goodbye.',
      highlight: 'detail-transport',
      selectPacket: 5,
    }),
    new Frame({
      title: 'Summary',
      text: 'Every TCP connection — loading a web page, sending email, streaming video — starts with these three packets:\n\n  1. SYN      — client says "I want to connect"\n  2. SYN-ACK  — server says "I heard you, I\'m ready"\n  3. ACK       — client says "Got it, let\'s go"\n\nOnce the handshake is done, data flows. When either side is finished, a FIN closes the connection. The whole process ensures both computers are ready and in sync before any real data is exchanged.',
      highlight: 'packet-table',
    }),
  ],
});
