import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'packet-protocols',
  name: 'Packet Protocols',
  frames: [
    new Frame({
      title: 'Packet Protocols',
      text: 'Protocols are sets of rules that define how data is transmitted over a network. Load sample packets to see several common protocols side by side in the packet list.',
      actionButton: { label: 'Load Sample Packets', action: 'load-packet-protocols-sample' },
    }),
    new Frame({
      title: 'What Are Protocols?',
      text: 'Each protocol operates at a specific layer of the network stack and serves a different purpose. The Protocol column shows the highest-level protocol identified in each packet. Look at the variety of protocols in the loaded packets.',
      highlight: 'col-protocol',
    }),
    new Frame({
      title: 'TCP (Transmission Control Protocol)',
      text: 'TCP is a reliable, connection-oriented protocol. It ensures data arrives in order and without errors by using acknowledgments and retransmissions. Used by HTTP, SSH, email, and most web traffic. Packet #1 is a TCP SYN — the start of a connection.',
      highlight: 'col-protocol',
      selectPacket: 1,
    }),
    new Frame({
      title: 'UDP (User Datagram Protocol)',
      text: 'UDP is a fast, connectionless protocol. It sends data without guaranteeing delivery or order, making it ideal for real-time applications like video streaming, gaming, and DNS lookups. Packet #2 is a UDP broadcast.',
      highlight: 'col-protocol',
      selectPacket: 2,
    }),
    new Frame({
      title: 'HTTP (HyperText Transfer Protocol)',
      text: 'HTTP is used for loading web pages. It runs on top of TCP and defines how browsers request and receive content from web servers. You\'ll see it on port 80 (or 443 for HTTPS). Packet #3 is an HTTP GET request.',
      highlight: ['col-protocol', 'detail-application'],
      selectPacket: 3,
    }),
    new Frame({
      title: 'DNS (Domain Name System)',
      text: 'DNS translates human-readable domain names (like google.com) into IP addresses. It typically uses UDP on port 53. Packet #4 is a DNS query for "example.com" — you can see the domain name in the Application layer details.',
      highlight: ['col-protocol', 'detail-application'],
      selectPacket: 4,
    }),
    new Frame({
      title: 'ICMP (Internet Control Message Protocol)',
      text: 'ICMP is used for network diagnostics. The most common example is "ping", which sends an Echo Request and waits for an Echo Reply to test if a host is reachable. Packet #5 is an ICMP Echo Request.',
      highlight: 'col-protocol',
      selectPacket: 5,
    }),
    new Frame({
      title: 'ARP (Address Resolution Protocol)',
      text: 'ARP maps IP addresses to MAC (hardware) addresses on a local network. When a device needs to send data to an IP on the same network, it uses ARP to find the destination\'s MAC address. Packet #6 is an ARP broadcast request.',
      highlight: ['col-protocol', 'detail-arp'],
      selectPacket: 6,
    }),
    new Frame({
      title: 'TLS/SSL (Transport Layer Security)',
      text: 'TLS encrypts data in transit to protect it from eavesdropping. It\'s the "S" in HTTPS. You\'ll see TLS handshakes (Client Hello, Server Hello) when a secure connection is established. Packet #7 is TLS traffic on port 443.',
      highlight: 'col-protocol',
      selectPacket: 7,
    }),
    new Frame({
      title: 'And Many More',
      text: 'The protocols covered here are the most common ones you\'ll encounter in everyday traffic, but there are hundreds more. Protocols like OSPF, BGP, DHCP, SNMP, FTP, SSH, and SMTP all serve different roles in keeping networks running. Any protocol this tool doesn\'t specifically recognize will appear as "Other" in the packet list.',
      highlight: 'col-protocol',
    }),
  ],
});
