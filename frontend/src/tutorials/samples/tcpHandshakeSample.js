/**
 * Sample packets for the TCP Handshake tutorial.
 * Shows a complete TCP connection lifecycle:
 *   1. SYN        — client initiates
 *   2. SYN, ACK   — server responds
 *   3. ACK         — client confirms (handshake complete)
 *   4. HTTP GET    — first data exchanged over the connection
 *   5. FIN, ACK   — server closes the connection
 */
const tcpHandshakeSample = [
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
      ttl: 128,
      header_len: 20,
      total_len: 60,
    },
    transport: {
      src_port: 49732,
      dst_port: 80,
      flags: 'SYN',
      header_len: 40,
      payload_len: 0,
    },
  },
  {
    number: 2,
    timestamp: '10:00:00.044',
    length: 74,
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
      ttl: 56,
      header_len: 20,
      total_len: 60,
    },
    transport: {
      src_port: 80,
      dst_port: 49732,
      flags: 'SYN, ACK',
      header_len: 40,
      payload_len: 0,
    },
  },
  {
    number: 3,
    timestamp: '10:00:00.045',
    length: 54,
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
      ttl: 128,
      header_len: 20,
      total_len: 40,
    },
    transport: {
      src_port: 49732,
      dst_port: 80,
      flags: 'ACK',
      header_len: 20,
      payload_len: 0,
    },
  },
  {
    number: 4,
    timestamp: '10:00:00.046',
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
      ttl: 128,
      header_len: 20,
      total_len: 473,
    },
    transport: {
      src_port: 49732,
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
    number: 5,
    timestamp: '10:00:00.512',
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
      ttl: 56,
      header_len: 20,
      total_len: 40,
    },
    transport: {
      src_port: 80,
      dst_port: 49732,
      flags: 'FIN, ACK',
      header_len: 20,
      payload_len: 0,
    },
  },
];

export default tcpHandshakeSample;
