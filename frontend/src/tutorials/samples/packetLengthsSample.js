/**
 * Sample packets for the Packet & Layer Lengths tutorial.
 * Packets of very different sizes to illustrate how headers and payload contribute to total length.
 */
const packetLengthsSample = [
  {
    number: 1,
    timestamp: '10:00:00.000',
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
    number: 2,
    timestamp: '10:00:00.014',
    length: 66,
    protocol: 'DNS',
    layers: 'Ethernet / IP / UDP / DNS',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: '02:00:00:00:00:fe',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.100',
      dst_ip: '8.8.8.8',
      ttl: 64,
      header_len: 20,
      total_len: 52,
    },
    transport: {
      src_port: 49152,
      dst_port: 53,
      header_len: 8,
      payload_len: 24,
    },
    application: {
      dns_query: 'example.com',
    },
  },
  {
    number: 3,
    timestamp: '10:00:00.028',
    length: 487,
    protocol: 'HTTP',
    layers: 'Ethernet / IP / TCP / HTTP',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: '02:00:00:00:00:fe',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.100',
      dst_ip: '93.184.216.34',
      ttl: 64,
      header_len: 20,
      total_len: 473,
    },
    transport: {
      src_port: 52480,
      dst_port: 80,
      flags: 'ACK',
      header_len: 20,
      payload_len: 433,
    },
    application: {
      http_method: 'GET',
      http_host: 'example.com',
    },
  },
  {
    number: 4,
    timestamp: '10:00:00.045',
    length: 1514,
    protocol: 'TCP',
    layers: 'Ethernet / IP / TCP',
    ethernet: {
      src_mac: '02:00:00:00:00:02',
      dst_mac: '02:00:00:00:00:01',
      header_len: 14,
    },
    network: {
      src_ip: '93.184.216.34',
      dst_ip: '192.168.1.100',
      ttl: 52,
      header_len: 20,
      total_len: 1500,
    },
    transport: {
      src_port: 80,
      dst_port: 52480,
      flags: 'ACK',
      header_len: 20,
      payload_len: 1460,
    },
  },
];

export default packetLengthsSample;
