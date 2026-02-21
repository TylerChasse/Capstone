import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'packet-protocols',
  name: 'Packet Protocols',
  frames: [
    new Frame({
      title: 'What Are Protocols?',
      text: 'Protocols are sets of rules that define how data is transmitted over a network. Each protocol operates at a specific layer of the network stack and serves a different purpose.',
    }),
    new Frame({
      title: 'TCP (Transmission Control Protocol)',
      text: 'TCP is a reliable, connection-oriented protocol. It ensures data arrives in order and without errors by using acknowledgments and retransmissions. Used by HTTP, SSH, email, and most web traffic.',
    }),
    new Frame({
      title: 'UDP (User Datagram Protocol)',
      text: 'UDP is a fast, connectionless protocol. It sends data without guaranteeing delivery or order, making it ideal for real-time applications like video streaming, gaming, and DNS lookups.',
    }),
    new Frame({
      title: 'HTTP (HyperText Transfer Protocol)',
      text: 'HTTP is used for loading web pages. It runs on top of TCP and defines how browsers request and receive content from web servers. You\'ll see it on port 80 (or 443 for HTTPS).',
    }),
    new Frame({
      title: 'DNS (Domain Name System)',
      text: 'DNS translates human-readable domain names (like google.com) into IP addresses. It typically uses UDP on port 53. You\'ll see DNS queries whenever a device looks up a website.',
    }),
    new Frame({
      title: 'ICMP (Internet Control Message Protocol)',
      text: 'ICMP is used for network diagnostics. The most common example is "ping", which sends an Echo Request and waits for an Echo Reply to test if a host is reachable.',
    }),
    new Frame({
      title: 'ARP (Address Resolution Protocol)',
      text: 'ARP maps IP addresses to MAC (hardware) addresses on a local network. When a device needs to send data to an IP on the same network, it uses ARP to find the destination\'s MAC address.',
    }),
    new Frame({
      title: 'TLS/SSL (Transport Layer Security)',
      text: 'TLS encrypts data in transit to protect it from eavesdropping. It\'s the "S" in HTTPS. You\'ll see TLS handshakes (Client Hello, Server Hello) when a secure connection is established.',
    }),
    new Frame({
      title: 'STP (Spanning Tree Protocol)',
      text: 'STP prevents loops in network switches by disabling redundant paths. It\'s a Layer 2 protocol you\'ll mainly see on enterprise or managed networks.',
    }),
    new Frame({
      title: 'VRRP (Virtual Router Redundancy Protocol)',
      text: 'VRRP provides automatic failover for default gateways. Multiple routers share a virtual IP address, and if the primary router goes down, a backup takes over seamlessly. You\'ll see VRRP advertisements on enterprise networks with redundant routing.',
    }),
    new Frame({
      title: 'PIM (Protocol Independent Multicast)',
      text: 'PIM is used to route multicast traffic efficiently across networks. Instead of sending the same data to each recipient individually, PIM builds multicast distribution trees so data is delivered to many receivers at once. Common in video streaming and IPTV.',
    }),
  ],
});
