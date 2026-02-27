import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'packet-lengths',
  name: 'Packet & Layer Lengths',
  frames: [
    new Frame({
      title: 'Why Lengths Matter',
      text: 'Every layer of a packet has a defined size. Understanding these lengths helps you verify that packets are well-formed, identify unusually large or small packets, and understand how much of a packet is overhead versus actual data.',
    }),
    new Frame({
      title: 'Total Packet Length',
      text: 'The total packet length is the size of the entire packet in bytes, from the start of the Ethernet header to the end of the payload. Typical packets are under 1500 bytes due to the standard Ethernet MTU (Maximum Transmission Unit) limit.',
    }),
    new Frame({
      title: 'The Ethernet Header',
      text: 'The Ethernet header is always 14 bytes: 6 bytes for the destination MAC address, 6 bytes for the source MAC address, and 2 bytes for the EtherType field that identifies the next protocol (e.g., IPv4, IPv6, ARP).',
    }),
    new Frame({
      title: 'The IP Header',
      text: 'The IPv4 header is at least 20 bytes. The header length field in the IP header tells you the exact size — it\'s stored as a count of 4-byte words, so a value of 5 means 20 bytes. The IP total length field covers the IP header plus everything after it.',
    }),
    new Frame({
      title: 'The TCP Header',
      text: 'The TCP header is at least 20 bytes. Like IP, it has a data offset field that gives the exact header length in 4-byte words. The TCP payload length can be calculated as: IP total length − IP header length − TCP header length.',
    }),
    new Frame({
      title: 'The UDP Header',
      text: 'The UDP header is always exactly 8 bytes: 2 bytes each for source port, destination port, length, and checksum. The UDP length field includes both the 8-byte header and the payload, so the payload size is UDP length − 8.',
    }),
    new Frame({
      title: 'Lengths in This Tool',
      text: 'In the Advanced interface level, the packet details panel shows the length of each layer alongside the other fields. This lets you quickly see how the total packet size is divided between headers and payload at each layer.',
    }),
  ],
});
