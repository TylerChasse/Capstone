import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'the-basics',
  name: 'The Fundamentals',
  frames: [
    new Frame({
      title: 'What Is a Packet?',
      text: 'A packet is a small chunk of data sent over a network. When you load a webpage or send a message, the data is broken into packets, sent individually, and reassembled at the destination. Each packet contains a header (addressing info) and a payload (the actual data).',
    }),
    new Frame({
      title: 'What Is an IP Address?',
      text: 'An IP (Internet Protocol) address is a unique number assigned to every device on a network. It works like a mailing address, telling the network where to send data. IPv4 addresses look like 192.168.1.1, while IPv6 addresses are longer, like 2001:db8::1.',
    }),
    new Frame({
      title: 'What Is a Protocol?',
      text: 'A protocol is a set of rules that defines how data is formatted and transmitted. Different protocols handle different jobs: TCP ensures reliable delivery, UDP prioritizes speed, DNS translates domain names to IP addresses, and HTTP loads web pages.',
    }),
    new Frame({
      title: 'What Is a Port?',
      text: 'A port is a number that identifies a specific application or service on a device. While an IP address gets data to the right device, the port gets it to the right program. For example, web servers typically use port 80 (HTTP) or 443 (HTTPS).',
    }),
    new Frame({
      title: 'What Is a Network Interface?',
      text: 'A network interface is the connection point between your device and a network. It can be physical (like an Ethernet port or Wi-Fi adapter) or virtual (like a VPN tunnel). When capturing packets, you choose which interface to listen on.',
    }),
    new Frame({
      title: 'What Are Packet Layers?',
      text: 'Network communication is organized into layers, each handling a different part of the process. The data link layer (Ethernet) handles local delivery, the network layer (IP) handles routing, and the transport layer (TCP/UDP) handles reliable or fast delivery. Each layer wraps the data with its own header.',
    }),
    new Frame({
      title: 'Source and Destination',
      text: 'Every packet has a source (where it came from) and a destination (where it\'s going). These are shown as IP addresses in the packet list. By looking at source and destination pairs, you can see which devices are communicating with each other.',
    }),
    new Frame({
      title: 'Putting It All Together',
      text: 'When you capture traffic, each row in the packet list is one packet. It shows the time it was captured, the source and destination IPs, the protocol used, and the ports involved. Selecting a packet reveals its details broken down by layer.',
    }),
  ],
});
