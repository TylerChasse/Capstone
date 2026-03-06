/**
 * Sample packets for the TTL (Time to Live) tutorial.
 * Four packets with different TTL values to illustrate starting TTLs and hop counts.
 */
const ttlSample = [
  {
    number: 1,
    timestamp: '10:00:00.000',
    length: 54,
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
      ttl: 64,
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
  {
    number: 2,
    timestamp: '10:00:00.012',
    length: 54,
    protocol: 'TCP',
    layers: 'Ethernet / IP / TCP',
    ethernet: {
      src_mac: '02:00:00:00:00:03',
      dst_mac: '02:00:00:00:00:fe',
      header_len: 14,
    },
    network: {
      src_ip: '192.168.1.200',
      dst_ip: '93.184.216.34',
      ttl: 128,
      header_len: 20,
      total_len: 40,
    },
    transport: {
      src_port: 61440,
      dst_port: 80,
      flags: 'ACK',
      header_len: 20,
      payload_len: 0,
    },
  },
  {
    number: 3,
    timestamp: '10:00:00.025',
    length: 54,
    protocol: 'TCP',
    layers: 'Ethernet / IP / TCP',
    ethernet: {
      src_mac: '02:00:00:00:00:fe',
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
      flags: 'ACK',
      header_len: 20,
      payload_len: 0,
    },
  },
  {
    number: 4,
    timestamp: '10:00:00.037',
    length: 54,
    protocol: 'TCP',
    layers: 'Ethernet / IP / TCP',
    ethernet: {
      src_mac: '02:00:00:00:00:fe',
      dst_mac: '02:00:00:00:00:03',
      header_len: 14,
    },
    network: {
      src_ip: '93.184.216.34',
      dst_ip: '192.168.1.200',
      ttl: 113,
      header_len: 20,
      total_len: 40,
    },
    transport: {
      src_port: 80,
      dst_port: 61440,
      flags: 'ACK',
      header_len: 20,
      payload_len: 0,
    },
  },
];

export default ttlSample;
