import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'mac-addresses',
  name: 'MAC Addresses',
  frames: [
    new Frame({
      title: 'MAC Addresses',
      text: 'A MAC address is a hardware identifier that operates at the local network level. Load sample packets to explore how MAC addresses are used in real traffic — including unicast, ARP requests, and broadcast frames.',
      actionButton: { label: 'Load Sample Packets', action: 'load-mac-addresses-sample' },
    }),
    new Frame({
      title: 'What Is a MAC Address?',
      text: 'A MAC (Media Access Control) address is a unique hardware identifier assigned to a network interface. Unlike IP addresses, which can change, a MAC address is typically permanent and burned into the device by the manufacturer. To follow along, make sure you are on the Intermediate detail level or higher — this unlocks the Data Link section in the packet details panel.',
      highlight: ['detail-datalink', 'level-selector'],
      selectPacket: 1,
    }),
    new Frame({
      title: 'MAC Address Format',
      text: 'MAC addresses are 48 bits long and written as six pairs of hexadecimal digits separated by colons — for example, 02:00:00:00:00:01. The first three pairs identify the manufacturer (OUI), and the last three pairs uniquely identify the device. You can see the MAC addresses for packet #1 in the Data Link section.',
      highlight: 'detail-datalink',
      selectPacket: 1,
    }),
    new Frame({
      title: 'MAC vs IP Address',
      text: 'IP addresses route packets across networks and can span the entire internet. MAC addresses only operate within a local network segment. When a packet crosses a router, the IP address stays the same but the MAC address changes to reflect the next hop.',
      highlight: ['col-source', 'col-destination'],
    }),
    new Frame({
      title: 'How ARP Uses MAC Addresses',
      text: 'When a device wants to send data to an IP on the same network, it broadcasts an ARP request asking "who has this IP?" Packet #2 is an ARP request — notice the destination MAC is FF:FF:FF:FF:FF:FF (broadcast). Packet #3 is the reply with the actual MAC address.',
      highlight: 'detail-arp',
      selectPacket: 2,
    }),
    new Frame({
      title: 'Broadcast and Multicast MACs',
      text: 'A MAC address of FF:FF:FF:FF:FF:FF is the broadcast address — frames sent to it are received by all devices on the local network. Multicast MAC addresses (starting with 01:00:5E) are used to deliver frames to a group of devices, such as for routing protocols.',
      highlight: 'detail-datalink',
      selectPacket: 2,
    }),
    new Frame({
      title: 'After ARP: Normal Traffic',
      text: 'Once ARP resolves the MAC address, subsequent packets use it directly. Packet #4 is a TCP packet sent to the gateway — notice the destination MAC is now the gateway\'s address (02:00:00:00:00:FE) rather than a broadcast.',
      highlight: 'detail-datalink',
      selectPacket: 4,
    }),
    new Frame({
      title: 'Summary',
      text: 'MAC addresses are hardware identifiers that operate at the local network level. Every packet is delivered on the wire using MAC addresses, even when IP addresses handle the end-to-end routing. ARP bridges the two — resolving IPs to MACs on demand. Look at the Data Link section of any packet to see which physical interfaces were involved in its local delivery.',
      highlight: 'detail-datalink',
    }),
  ],
});
