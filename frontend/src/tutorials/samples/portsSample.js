/**
 * Sample packets for the Ports tutorial.
 * Each packet targets a different well-known destination port so learners
 * can see port numbers in context. Packet 5 is a server reply — ports flip
 * to show how the return path works.
 *
 *   1. HTTP    — dst port 80
 *   2. HTTPS   — dst port 443
 *   3. DNS     — dst port 53
 *   4. SSH     — dst port 22
 *   5. HTTP response — src port 80, dst port back to the client's ephemeral port
 */
const portsSample = [
  {
    number: 1,
    timestamp: '10:00:00.000',
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
      ttl: 128,
      header_len: 20,
      total_len: 473,
    },
    transport: {
      src_port: 49201,
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
    number: 2,
    timestamp: '10:00:00.015',
    length: 583,
    protocol: 'TLS',
    layers: 'Ethernet / IP / TCP / TLS',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: '02:00:00:00:00:fe',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.100',
      dst_ip: '172.217.14.100',
      ttl: 128,
      header_len: 20,
      total_len: 569,
    },
    transport: {
      src_port: 49202,
      dst_port: 443,
      flags: 'ACK',
      header_len: 20,
      payload_len: 529,
    },
  },
  {
    number: 3,
    timestamp: '10:00:00.031',
    length: 73,
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
      ttl: 128,
      header_len: 20,
      total_len: 59,
    },
    transport: {
      src_port: 54100,
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
    timestamp: '10:00:00.045',
    length: 74,
    protocol: 'TCP',
    layers: 'Ethernet / IP / TCP',
    ethernet: {
      src_mac: '02:00:00:00:00:01',
      dst_mac: '02:00:00:00:00:fe',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.100',
      dst_ip: '203.0.113.10',
      ttl: 128,
      header_len: 20,
      total_len: 60,
    },
    transport: {
      src_port: 49203,
      dst_port: 22,
      flags: 'SYN',
      header_len: 40,
      payload_len: 0,
    },
  },
  {
    number: 5,
    timestamp: '10:00:00.058',
    length: 512,
    protocol: 'HTTP',
    layers: 'Ethernet / IP / TCP / HTTP',
    ethernet: {
      src_mac: '02:00:00:00:00:fe',
      dst_mac: '02:00:00:00:00:01',
      header_len: 14,
    },
    network: {
      src_ip: '93.184.216.34',
      dst_ip: '192.168.1.100',
      ttl: 55,
      header_len: 20,
      total_len: 498,
    },
    transport: {
      src_port: 80,
      dst_port: 49201,
      flags: 'ACK',
      header_len: 20,
      payload_len: 458,
    },
    application: {
      http_host: 'example.com',
    },
  },
];

export default portsSample;
