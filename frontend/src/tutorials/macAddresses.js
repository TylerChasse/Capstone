import { Tutorial, Frame } from './Tutorial';
import macAddressesImage from '../assets/tutorials/macAddresses/macAddresses.png'

export default new Tutorial({
  id: 'mac-addresses',
  name: 'MAC Addresses',
  frames: [
    new Frame({
      title: 'What Is a MAC Address?',
      text: 'A MAC (Media Access Control) address is a unique hardware identifier assigned to a network interface. Unlike IP addresses, which can change, a MAC address is typically permanent and burned into the device by the manufacturer.',
    }),
    new Frame({
      title: 'MAC Address Format',
      text: 'MAC addresses are 48 bits long and written as six pairs of hexadecimal digits separated by colons, for example: 00:1A:2B:3C:4D:5E. The first three pairs identify the manufacturer (OUI), and the last three pairs uniquely identify the device.',
    }),
    new Frame({
      title: 'MAC vs IP Address',
      text: 'IP addresses route packets across networks and can span the entire internet. MAC addresses only operate within a local network segment. When a packet crosses a router, the IP address stays the same but the MAC address changes to reflect the next hop.',
    }),
    new Frame({
      title: 'The Data Link Layer',
      text: 'MAC addresses operate at the Data Link Layer (Layer 2) of the network model. This layer is responsible for delivering frames between devices on the same local network. Ethernet is the most common Layer 2 protocol, and it uses MAC addresses for delivery.',
    }),
    new Frame({
      title: 'How ARP Uses MAC Addresses',
      text: 'When a device wants to send data to an IP on the same network, it doesn\'t know the destination\'s MAC address yet. It broadcasts an ARP (Address Resolution Protocol) request asking "who has this IP?" The device with that IP replies with its MAC address.',
    }),
    new Frame({
      title: 'Broadcast and Multicast MACs',
      text: 'A MAC address of FF:FF:FF:FF:FF:FF is the broadcast address — frames sent to it are received by all devices on the local network. Multicast MAC addresses (starting with 01:00:5E) are used to deliver frames to a group of devices, such as for routing protocols.',
    }),
    new Frame({
      title: 'MAC Addresses in This Tool',
      text: 'At the Intermediate interface level, in the packet details panel, the Data Link layer shows the source and destination MAC addresses for each packet. This tells you which physical network interfaces were involved in the local delivery of that packet.',
      image: macAddressesImage
    }),
  ],
});
