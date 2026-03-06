import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'raw-hex',
  name: 'Raw Hex',
  frames: [
    new Frame({
      title: 'Raw Hex',
      text: 'Every packet on a network is ultimately just a sequence of bytes. Load sample packets with raw hex data so you can see the actual bytes alongside the parsed fields.',
      actionButton: { label: 'Load Sample Packets', action: 'load-raw-hex-sample' },
    }),
    new Frame({
      title: 'What Is Raw Hex?',
      text: 'The raw hex view shows you the exact bytes of a packet in hexadecimal notation — the same data that traveled across the wire, before any parsing or interpretation. Make sure you are on the Advanced detail level, then select packet #1 to see its raw hex.',
      highlight: 'detail-raw-hex',
      selectPacket: 1,
    }),
    new Frame({
      title: 'What Is Hexadecimal?',
      text: 'Hexadecimal (base 16) uses digits 0–9 and letters A–F to represent values. Each hex digit represents 4 bits, so two hex digits represent one byte. For example, 0xFF is 255 in decimal, and 0x45 is the first byte of a typical IPv4 header (version 4, IHL 5).',
    }),
    new Frame({
      title: 'How to Read the Hex View',
      text: 'The raw hex is displayed as rows of 16 bytes each, with an offset on the left. The first bytes are the Ethernet header (destination MAC, source MAC, EtherType), followed by the IP header, then TCP/UDP, and finally the payload.',
      highlight: 'detail-raw-hex',
      selectPacket: 1,
    }),
    new Frame({
      title: 'The Ethernet Header',
      text: 'The first 14 bytes of packet #1 are the Ethernet header. In the hex view: bytes 1–6 are the destination MAC (02 00 00 00 00 02), bytes 7–12 are the source MAC (02 00 00 00 00 01), and bytes 13–14 are the EtherType (08 00 = IPv4).',
      highlight: ['detail-raw-hex', 'detail-datalink'],
      selectPacket: 1,
    }),
    new Frame({
      title: 'The IP Header',
      text: 'Bytes 15–34 of packet #1 are the IP header. The first byte (45) tells you IP version 4 and a 20-byte header. Later bytes include the TTL (40 hex = 64 decimal), protocol (06 = TCP), and the source and destination IP addresses.',
      highlight: ['detail-raw-hex', 'detail-network'],
      selectPacket: 1,
    }),
    new Frame({
      title: 'Why Raw Hex Matters',
      text: 'Raw hex is the ground truth of what was actually transmitted. It\'s useful for verifying parsed values, spotting malformed packets, analyzing custom or unknown protocols, and understanding exactly how protocol headers are structured at the byte level.',
      highlight: 'detail-raw-hex',
    }),
    new Frame({
      title: 'Summary',
      text: 'Raw hex is the ground truth of every packet — the exact bytes that traveled across the wire. The first 14 bytes are always the Ethernet header, followed by the IP header starting with 45 for a standard IPv4 packet. Use the hex view alongside the parsed layer details to see exactly how each field maps to its bytes, and to catch anything the parser may have missed.',
      highlight: 'detail-raw-hex',
    }),
  ],
});
