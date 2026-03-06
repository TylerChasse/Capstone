/**
 * Sample packets for the MAC Addresses tutorial.
 * Focuses on MAC address usage: unicast, broadcast, and ARP.
 */
const macAddressesSample = [
  {
    number: 1,
    timestamp: '10:00:00.000',
    length: 74,
    protocol: 'TCP',
    layers: 'Ethernet / IP / TCP',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: '02:00:00:00:00:02',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.100',
      dst_ip: '93.184.216.34',
      ttl: 64,
      header_len: 20,
      total_len: 60,
    },
    transport: {
      src_port: 52480,
      dst_port: 80,
      flags: 'SYN',
      header_len: 40,
      payload_len: 0,
    },
  },
  {
    number: 2,
    timestamp: '10:00:00.015',
    length: 42,
    protocol: 'ARP',
    layers: 'Ethernet / ARP',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: 'ff:ff:ff:ff:ff:ff',
      header_len: 14,
    },
    arp: {
      operation: 'request',
      sender_mac: '02:00:00:00:00:01',
      sender_ip: '192.168.1.100',
      target_mac: '00:00:00:00:00:00',
      target_ip: '192.168.1.1',
    },
  },
  {
    number: 3,
    timestamp: '10:00:00.016',
    length: 42,
    protocol: 'ARP',
    layers: 'Ethernet / ARP',
    ethernet: {
      src_mac: '02:00:00:00:00:fe',
      dst_mac: '02:00:00:00:00:01',
      header_len: 14,
    },
    arp: {
      operation: 'reply',
      sender_mac: '02:00:00:00:00:fe',
      sender_ip: '192.168.1.1',
      target_mac: '02:00:00:00:00:01',
      target_ip: '192.168.1.100',
    },
  },
  {
    number: 4,
    timestamp: '10:00:00.030',
    length: 60,
    protocol: 'TCP',
    layers: 'Ethernet / IP / TCP',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: '02:00:00:00:00:fe',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.100',
      dst_ip: '93.184.216.34',
      ttl: 63,
      header_len: 20,
      total_len: 40,
    },
    transport: {
      src_port: 52480,
      dst_port: 80,
      flags: 'ACK',
      header_len: 20,
      payload_len: 0,
    },
  },
];

export default macAddressesSample;
