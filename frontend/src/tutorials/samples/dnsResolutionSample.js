/**
 * Sample packets for the DNS Resolution tutorial.
 * Tells the complete story of a DNS lookup followed by the TCP connection it enables:
 *   1. DNS Query   — client asks "what is the IP for google.com?"
 *   2. DNS Response — server answers "142.250.80.46"
 *   3. TCP SYN     — client opens a connection to that IP
 *   4. TCP SYN-ACK — server accepts
 *   5. HTTP GET    — first real data sent over the connection
 */
const dnsResolutionSample = [
  {
    number: 1,
    timestamp: '10:00:00.000',
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
      src_port: 54312,
      dst_port: 53,
      header_len: 8,
      payload_len: 31,
    },
    application: {
      dns_query: 'google.com',
    },
  },
  {
    number: 2,
    timestamp: '10:00:00.018',
    length: 89,
    protocol: 'DNS',
    layers: 'Ethernet / IP / UDP / DNS',
    ethernet: {
      src_mac: '02:00:00:00:00:fe',
      dst_mac: '02:00:00:00:00:01',
      header_len: 14,
    },
    network: {
      src_ip: '8.8.8.8',
      dst_ip: '192.168.1.100',
      ttl: 119,
      header_len: 20,
      total_len: 75,
    },
    transport: {
      src_port: 53,
      dst_port: 54312,
      header_len: 8,
      payload_len: 47,
    },
    application: {
      dns_query: 'google.com',
    },
  },
  {
    number: 3,
    timestamp: '10:00:00.019',
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
      dst_ip: '142.250.80.46',
      ttl: 128,
      header_len: 20,
      total_len: 60,
    },
    transport: {
      src_port: 49801,
      dst_port: 80,
      flags: 'SYN',
      header_len: 40,
      payload_len: 0,
    },
  },
  {
    number: 4,
    timestamp: '10:00:00.031',
    length: 74,
    protocol: 'TCP',
    layers: 'Ethernet / IP / TCP',
    ethernet: {
      src_mac: '02:00:00:00:00:fe',
      dst_mac: '02:00:00:00:00:01',
      header_len: 14,
    },
    network: {
      src_ip: '142.250.80.46',
      dst_ip: '192.168.1.100',
      ttl: 118,
      header_len: 20,
      total_len: 60,
    },
    transport: {
      src_port: 80,
      dst_port: 49801,
      flags: 'SYN, ACK',
      header_len: 40,
      payload_len: 0,
    },
  },
  {
    number: 5,
    timestamp: '10:00:00.032',
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
      dst_ip: '142.250.80.46',
      ttl: 128,
      header_len: 20,
      total_len: 473,
    },
    transport: {
      src_port: 49801,
      dst_port: 80,
      flags: 'ACK',
      header_len: 20,
      payload_len: 433,
    },
    application: {
      http_method: 'GET',
      http_host: 'google.com',
    },
  },
];

export default dnsResolutionSample;
