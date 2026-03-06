import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'packet-lengths',
  name: 'Packet & Layer Lengths',
  frames: [
    new Frame({
      title: 'Packet & Layer Lengths',
      text: 'Every layer of a packet has a defined size. Load sample packets with a range of lengths — from a tiny 42-byte ARP frame to a 1514-byte TCP segment near the Ethernet MTU limit.',
      actionButton: { label: 'Load Sample Packets', action: 'load-packet-lengths-sample' },
    }),
    new Frame({
      title: 'Why Lengths Matter',
      text: 'Understanding packet lengths helps you verify that packets are well-formed, identify unusually large or small packets, and understand how much of a packet is overhead versus actual data. To follow along fully, make sure you are on the Advanced detail level — this shows the size of each layer alongside its other fields. Look at the Length column — the loaded packets range from 42 to 1514 bytes.',
      highlight: ['col-length', 'level-selector'],
    }),
    new Frame({
      title: 'Total Packet Length',
      text: 'The total packet length is the size of the entire packet in bytes, from the start of the Ethernet header to the end of the payload. Packet #4 is 1514 bytes — right at the Ethernet MTU (Maximum Transmission Unit) limit of 1500 bytes of IP payload plus 14 bytes of Ethernet header.',
      highlight: 'col-length',
      selectPacket: 4,
    }),
    new Frame({
      title: 'The Ethernet Header',
      text: 'The Ethernet header is always 14 bytes: 6 bytes for the destination MAC, 6 bytes for the source MAC, and 2 bytes for the EtherType field. Select packet #1 (the ARP frame) — it has no IP or TCP overhead, so the 42 total bytes are almost entirely the Ethernet and ARP headers.',
      highlight: 'detail-datalink',
      selectPacket: 1,
    }),
    new Frame({
      title: 'The IP Header',
      text: 'The IPv4 header is at least 20 bytes. The header length field tells you the exact size — stored as a count of 4-byte words, so a value of 5 means 20 bytes. Packet #3 (HTTP GET) shows the IP total length covering the IP header plus TCP header plus HTTP payload.',
      highlight: 'detail-network',
      selectPacket: 3,
    }),
    new Frame({
      title: 'The TCP Header',
      text: 'The TCP header is at least 20 bytes. The TCP payload length is: IP total length − IP header length − TCP header length. For packet #3, the payload is 433 bytes of HTTP data out of a total 487-byte packet.',
      highlight: 'detail-transport',
      selectPacket: 3,
    }),
    new Frame({
      title: 'The UDP Header',
      text: 'The UDP header is always exactly 8 bytes: 2 bytes each for source port, destination port, length, and checksum. Packet #2 is a UDP DNS query — its 8-byte header and 24-byte payload add up within a 66-byte total frame.',
      highlight: 'detail-transport',
      selectPacket: 2,
    }),
    new Frame({
      title: 'Summary',
      text: 'Every byte in a packet is accounted for. The Ethernet header is always 14 bytes, the IP header at least 20, and TCP or UDP adds another 20 or 8 on top. Everything beyond that is payload — the actual data being carried. A 1514-byte packet near the MTU limit is almost entirely payload, while a tiny ARP frame is nearly all headers with no payload at all.',
      highlight: ['detail-network', 'detail-transport'],
    }),
  ],
});
