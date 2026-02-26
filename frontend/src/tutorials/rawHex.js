import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'raw-hex',
  name: 'Raw Hex',
  frames: [
    new Frame({
      title: 'What Is Raw Hex?',
      text: 'Every packet on a network is ultimately just a sequence of bytes. The raw hex view shows you the exact bytes of a packet in hexadecimal notation — the same data that traveled across the wire, before any parsing or interpretation.',
    }),
    new Frame({
      title: 'What Is Hexadecimal?',
      text: 'Hexadecimal (base 16) uses digits 0–9 and letters A–F to represent values. Each hex digit represents 4 bits, so two hex digits represent one byte. For example, the byte 0xFF is 255 in decimal, and 0x45 is the first byte of a typical IPv4 header.',
    }),
    new Frame({
      title: 'How to Read the Hex View',
      text: 'The raw hex is displayed as a continuous sequence of bytes from the start of the packet. The first bytes are the Ethernet header (destination MAC, source MAC, EtherType), followed by the IP header, then the transport header (TCP/UDP), and finally the payload.',
    }),
    new Frame({
      title: 'The Ethernet Header',
      text: 'The first 14 bytes of most packets are the Ethernet header: 6 bytes for the destination MAC, 6 bytes for the source MAC, and 2 bytes for the EtherType (e.g., 0x0800 for IPv4, 0x86DD for IPv6, 0x0806 for ARP).',
    }),
    new Frame({
      title: 'The IP Header',
      text: 'Following the Ethernet header is the IP header. The first byte (e.g., 0x45) encodes the IP version (4) and header length (5 × 4 = 20 bytes). Later bytes contain the TTL, protocol number (6 for TCP, 17 for UDP), and source and destination IP addresses.',
    }),
    new Frame({
      title: 'Why Raw Hex Matters',
      text: 'Raw hex is the ground truth of what was actually transmitted. It\'s useful for verifying parsed values, spotting malformed packets, analyzing custom or unknown protocols, and understanding exactly how protocol headers are structured at the byte level.',
    }),
    new Frame({
      title: 'Raw Hex in This Tool',
      text: 'The raw hex view is available in the Advanced interface level. It appears at the bottom of the packet details panel and shows the full byte sequence of the selected packet. Use it alongside the parsed layer details to understand how the fields map to actual bytes.',
    }),
  ],
});
