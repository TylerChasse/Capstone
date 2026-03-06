/**
 * Sample packets for The Fundamentals tutorial.
 * Fictional but realistic TCP, UDP, and HTTP packets.
 */
const fundamentalsSample = [
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
    timestamp: '10:00:00.012',
    length: 54,
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
      total_len: 40,
    },
    transport: {
      src_port: 80,
      dst_port: 52480,
      flags: 'SYN, ACK',
      header_len: 20,
      payload_len: 0,
    },
  },
  {
    number: 3,
    timestamp: '10:00:00.013',
    length: 487,
    protocol: 'HTTP',
    layers: 'Ethernet / IP / TCP / HTTP',
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
    timestamp: '10:00:00.025',
    length: 62,
    protocol: 'UDP',
    layers: 'Ethernet / IP / UDP',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: '02:00:00:00:00:02',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.100',
      dst_ip: '192.168.1.255',
      ttl: 64,
      header_len: 20,
      total_len: 48,
    },
    transport: {
      src_port: 57621,
      dst_port: 57621,
      header_len: 8,
      payload_len: 20,
    },
  },
];

export default fundamentalsSample;
