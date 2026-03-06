import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'ttl',
  name: 'TTL (Time to Live)',
  frames: [
    new Frame({
      title: 'TTL (Time to Live)',
      text: 'TTL is a field in the IP header that limits how far a packet can travel. Load sample packets to compare TTL values across packets from different sources and see what they reveal.',
      actionButton: { label: 'Load Sample Packets', action: 'load-ttl-sample' },
    }),
    new Frame({
      title: 'What Is TTL?',
      text: 'TTL (Time to Live) is a field in the IP header that limits how long a packet can travel across a network. Each time a packet passes through a router, the TTL is decreased by one. When it reaches zero, the packet is discarded and the sender is notified. To follow along, make sure you are on the Intermediate detail level or higher — this unlocks the Network section where TTL is shown. Select packet #1 and look at its TTL.',
      highlight: ['detail-network', 'level-selector'],
      selectPacket: 1,
    }),
    new Frame({
      title: 'Why Does TTL Exist?',
      text: 'TTL prevents packets from looping indefinitely through a network. Without it, a misconfigured route could cause packets to bounce between routers forever, wasting bandwidth. TTL acts as a safety mechanism to ensure packets eventually expire.',
    }),
    new Frame({
      title: 'Common Starting TTL Values',
      text: 'Different operating systems use different default starting TTL values. Windows typically starts at 128, Linux and macOS at 64, and some network devices at 255. Packet #2 has a TTL of 128 — a typical Windows device. Compare it with packet #1 (TTL 64, Linux/macOS).',
      highlight: 'detail-network',
      selectPacket: 2,
    }),
    new Frame({
      title: 'Inferring Hops From TTL',
      text: 'If a packet arrives with TTL 52 and Linux starts at 64, it traveled approximately 12 hops to reach you. Packet #3 has TTL 52, and packet #4 has TTL 113 — the Windows device that sent #4 started at 128, meaning it traveled about 15 hops.',
      highlight: 'detail-network',
      selectPacket: 3,
    }),
    new Frame({
      title: 'TTL in IPv4 vs IPv6',
      text: 'In IPv4, the field is called TTL. In IPv6, the equivalent field is called Hop Limit — it works the same way but reflects that modern networks are more concerned with hop counts than time. Both are decremented by one at each router.',
      highlight: 'detail-network',
    }),
    new Frame({
      title: 'Summary',
      text: 'TTL is a simple but revealing field. The starting value tells you the sender\'s OS, and how much it has decreased tells you how far the packet traveled. A TTL of 64 suggests Linux or macOS, 128 suggests Windows, and a lower-than-expected value means the packet crossed multiple routers to reach you. Check the Network layer of any packet to see its TTL.',
      highlight: 'detail-network',
    }),
  ],
});
