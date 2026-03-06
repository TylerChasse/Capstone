/**
 * Sample packets for the What Is a Network Analyzer? tutorial.
 * Varied traffic showing the different types of packets a network analyzer can capture.
 */
const whatIsNetworkAnalyzerSample = [
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
    number: 3,
    timestamp: '10:00:00.021',
    length: 73,
    protocol: 'DNS',
    layers: 'Ethernet / IP / UDP / DNS',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: '02:00:00:00:00:02',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.100',
      dst_ip: '8.8.8.8',
      ttl: 64,
      header_len: 20,
      total_len: 59,
    },
    transport: {
      src_port: 49152,
      dst_port: 53,
      header_len: 8,
      payload_len: 31,
    },
    application: {
      dns_query: 'example.com',
    },
  },
  {
    number: 4,
    timestamp: '10:00:00.034',
    length: 98,
    protocol: 'ICMP',
    layers: 'Ethernet / IP / ICMP',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: '02:00:00:00:00:02',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.100',
      dst_ip: '8.8.8.8',
      ttl: 64,
      header_len: 20,
      total_len: 84,
    },
  },
  {
    number: 5,
    timestamp: '10:00:00.049',
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
];

export default whatIsNetworkAnalyzerSample;
