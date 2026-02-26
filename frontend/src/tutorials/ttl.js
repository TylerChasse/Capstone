import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'ttl',
  name: 'TTL (Time to Live)',
  frames: [
    new Frame({
      title: 'What Is TTL?',
      text: 'TTL (Time to Live) is a field in the IP header that limits how long a packet can travel across a network. Each time a packet passes through a router, the TTL is decreased by one. When it reaches zero, the packet is discarded and the sender is notified.',
    }),
    new Frame({
      title: 'Why Does TTL Exist?',
      text: 'TTL prevents packets from looping indefinitely through a network. Without it, a misconfigured route could cause packets to bounce between routers forever, wasting bandwidth. TTL acts as a safety mechanism to ensure packets eventually expire.',
    }),
    new Frame({
      title: 'Common Starting TTL Values',
      text: 'Different operating systems use different default starting TTL values. Windows typically starts at 128, Linux and macOS at 64, and some network devices at 255. By looking at the TTL of a received packet, you can sometimes estimate how many hops it traveled and what OS sent it.',
    }),
    new Frame({
      title: 'TTL in IPv4 vs IPv6',
      text: 'In IPv4, the field is called TTL. In IPv6, the equivalent field is called Hop Limit — it works the same way but reflects that modern networks are more concerned with hop counts than time. Both are decremented by one at each router.',
    }),
    new Frame({
      title: 'TTL in This Tool',
      text: 'In the packet details panel, the Network layer shows the TTL (or Hop Limit for IPv6) for each packet. A low TTL on an incoming packet may indicate it traveled many hops, while an unexpectedly high TTL could suggest the packet originated nearby.',
    }),
  ],
});
