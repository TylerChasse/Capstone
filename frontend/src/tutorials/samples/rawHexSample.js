/**
 * Sample packets for the Raw Hex tutorial.
 * Packets with raw_hex populated so the hex view is visible and can be referenced.
 *
 * Packet 1: TCP SYN (74 bytes)
 *   Ethernet (14): dst=02:00:00:00:00:02, src=02:00:00:00:00:01, type=0x0800
 *   IP (20):       ver=4, IHL=20, total=60, TTL=64, proto=TCP(6), src=192.168.1.100, dst=93.184.216.34
 *   TCP (40):      sport=52480(0xCD00), dport=80(0x0050), seq=1, SYN, window=64240, opts=MSS+SACK+TS+WS
 *
 * Packet 2: HTTP GET (91 bytes)
 *   Ethernet (14): same MACs
 *   IP (20):       total=77, same IPs
 *   TCP (20):      sport=52480, dport=80, seq=3, ACK+PSH
 *   HTTP (37):     "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n"
 */
const rawHexSample = [
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
    // Ethernet(14) + IP(20) + TCP with options(40) = 74 bytes
    raw_hex: '0200000000020200000000010800' // Ethernet
            + '4500003c1a2b40004006a4c1c0a801645db8d822' // IP
            + 'cd0000500000000100000000a002faf0e25c0000' // TCP header
            + '020405b40402080a001234560000000001030307', // TCP options
  },
  {
    number: 2,
    timestamp: '10:00:00.013',
    length: 91,
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
      total_len: 77,
    },
    transport: {
      src_port: 52480,
      dst_port: 80,
      flags: 'ACK',
      header_len: 20,
      payload_len: 37,
    },
    application: {
      http_method: 'GET',
      http_host: 'example.com',
    },
    // Ethernet(14) + IP(20) + TCP(20) + HTTP payload(37) = 91 bytes
    raw_hex: '0200000000020200000000010800' // Ethernet
            + '4500004d1a2c40004006a4b1c0a801645db8d822' // IP (total_len=77)
            + 'cd00005000000003000000015018faf0d34a0000' // TCP (ACK+PSH, offset=5)
            + '474554202f20485454502f312e310d0a' // "GET / HTTP/1.1\r\n"
            + '486f73743a206578616d706c652e636f6d0d0a' // "Host: example.com\r\n"
            + '0d0a', // "\r\n"
  },
];

export default rawHexSample;
