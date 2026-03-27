import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'dns-resolution',
  name: 'DNS Resolution',
  frames: [
    new Frame({
      title: 'DNS Resolution',
      text: 'When you type "google.com" into a browser, your computer has no idea where that is — it only understands IP addresses. DNS (Domain Name System) is the service that translates domain names into IPs before any connection can be made. Load the sample below to watch the full process.',
      actionButton: { label: 'Load Sample Packets', action: 'load-dns-resolution-sample' },
    }),
    new Frame({
      title: 'The Full Picture',
      text: 'Five packets tell the complete story. Packets 1 and 2 are the DNS exchange — a question and an answer. Packets 3 through 5 are the TCP connection that happens immediately after, now that your computer knows the server\'s IP address. Without DNS, packet 3 could never be sent.',
      highlight: 'packet-table',
      selectPacket: 'first',
    }),
    new Frame({
      title: 'Packet 1 — The DNS Query',
      text: 'Your computer sends a DNS query to 8.8.8.8 — Google\'s public DNS server. The query asks: "What is the IP address for google.com?"\n\nNotice the Destination Port is 53 — the standard port for DNS. The Source Port is a random high number chosen by your computer so the reply knows where to come back to.',
      highlight: ['detail-network', 'detail-transport', 'detail-application'],
      selectPacket: 1,
    }),
    new Frame({
      title: 'DNS Uses UDP, Not TCP',
      text: 'Look at the Layers field — it reads "Ethernet / IP / UDP / DNS." DNS uses UDP instead of TCP because DNS queries are tiny and speed matters more than reliability. There is no handshake, no connection setup — just a single question packet and a single answer packet.\n\nThe Header Length is only 8 bytes, which is the fixed size of a UDP header.',
      highlight: 'detail-transport',
      selectPacket: 1,
    }),
    new Frame({
      title: 'Packet 2 — The DNS Response',
      text: 'The DNS server replies with the answer: google.com resolves to 142.250.80.46. The Source and Destination are now reversed — this packet travels from 8.8.8.8 back to your computer.\n\nThe response is slightly larger (89 bytes vs 73) because it includes the answer record in addition to the original question. The DNS Query field shows the same domain name it was asked about.',
      highlight: ['detail-network', 'detail-transport', 'detail-application'],
      selectPacket: 2,
    }),
    new Frame({
      title: 'Packet 3 — Connection to the Resolved IP',
      text: 'Immediately after the DNS response, your computer opens a TCP connection — and it uses the IP address DNS just provided. Packet 3 is a SYN sent directly to 142.250.80.46.\n\nCompare this Destination IP to the DNS response in packet 2. They match. This is the moment DNS becomes useful — without it, your computer would not know what IP to connect to.',
      highlight: 'detail-network',
      selectPacket: 3,
    }),
    new Frame({
      title: 'Packet 5 — The HTTP Request',
      text: 'After the TCP handshake completes (packets 3 and 4), your browser sends an HTTP GET request to the server. Notice the HTTP Host field still says "google.com" even though the actual connection is using the IP address 142.250.80.46.\n\nThis is the separation DNS creates: humans use names, computers use IPs, and HTTP headers carry the name along so the server knows which site is being requested.',
      highlight: ['detail-network', 'detail-application'],
      selectPacket: 5,
    }),
    new Frame({
      title: 'Summary',
      text: 'DNS resolution happens automatically every time you visit a website, and you can see it in any real capture:\n\n  1. A DNS query goes out to port 53 over UDP\n  2. The DNS server replies with an IP address\n  3. Your computer immediately connects to that IP\n\nLook for short UDP packets going to 8.8.8.8, 1.1.1.1, or your router\'s IP — those are DNS. The TCP connection that follows right after is the actual website traffic.',
      highlight: ['col-protocol', 'packet-table'],
    }),
  ],
});
