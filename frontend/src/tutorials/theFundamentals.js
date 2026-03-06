import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'the-basics',
  name: 'The Fundamentals',
  frames: [
    new Frame({
      title: 'The Fundamentals',
      text: 'This tutorial will walk you through the core concepts of networking using real sample packets loaded directly into the tool. Click "Load Sample Packets" to get started.',
      actionButton: { label: 'Load Sample Packets', action: 'load-fundamentals-sample' },
    }),
    new Frame({
      title: 'What Is a Packet?',
      text: 'Each row in the packet list is one packet — a small chunk of data sent across the network. Every packet has a source, a destination, a protocol, and a size. Take a look at the packets that were just loaded.',
      highlight: 'packet-table',
    }),
    new Frame({
      title: 'Source and Destination',
      text: 'The Source and Destination columns show where each packet came from and where it\'s going. These are IP addresses — unique numbers that identify devices on a network. Notice how some packets go from 192.168.1.100 outward, and some come back.',
      highlight: ['col-source', 'col-destination'],
    }),
    new Frame({
      title: 'What Is a Protocol?',
      text: 'The Protocol column shows what type of traffic the packet carries. TCP is a reliable connection-based protocol used for web traffic, UDP is a faster connectionless protocol, and HTTP is web page data carried over TCP. Each protocol is color-coded for quick identification.',
      highlight: 'col-protocol',
    }),
    new Frame({
      title: 'Packet Details and Layers',
      text: 'Click any packet in the list to inspect it. The details panel shows the packet broken into layers — each layer handles a different part of delivering the data.',
      highlight: 'packet-details',
      selectPacket: 'first',
    }),
    new Frame({
      title: 'What Is a Port?',
      text: 'In the Transport layer you\'ll see a source port and a destination port. Ports identify which application the data is for. Port 80 is web traffic (HTTP) and port 443 is HTTPS.',
      highlight: 'detail-transport',
    }),
    new Frame({
      title: 'Putting It All Together',
      text: 'Every packet in the list has a source and destination IP, a protocol that defines how the data is structured, and a set of layers — Ethernet, IP, TCP/UDP — each handling a different part of delivery. Click through the packets you loaded and see how these pieces connect. When you\'re ready to capture real traffic, select a network interface and hit Start Capture.',
      highlight: ['packet-table', 'interface-selector', 'start-capture'],
    }),
  ],
});
