import { Tutorial, Frame } from './Tutorial';

export default new Tutorial({
  id: 'what-is-network-analyzer',
  name: 'What Is a Network Analyzer?',
  frames: [
    new Frame({
      title: 'What Is a Network Analyzer?',
      text: 'A network analyzer (also called a packet sniffer or protocol analyzer) is a tool that captures and inspects the data packets traveling across a network in real time. It lets you see exactly what your devices are sending and receiving.',
    }),
    new Frame({
      title: 'How Does It Work?',
      text: 'This tool listens on a network interface (like your Wi-Fi or Ethernet adapter) and records every packet that passes through it. Each packet contains information such as source and destination addresses, the protocol used, and the actual data being transmitted.',
    }),
    new Frame({
      title: 'Troubleshooting Network Issues',
      text: 'If a website won\'t load or a connection keeps dropping, a network analyzer helps you pinpoint the problem. You can see whether DNS lookups are failing, connections are being refused, or packets are being lost along the way.',
    }),
    new Frame({
      title: 'Learning How Networks Work',
      text: 'By watching real traffic, you can see protocols like TCP, UDP, DNS, and HTTP in action. It\'s one of the best ways to understand how devices communicate, how connections are established, and how data flows across the internet.',
    }),
    new Frame({
      title: 'Security and Monitoring',
      text: 'Network analyzers are used to detect suspicious activity such as unexpected connections, unusual traffic patterns, or unauthorized devices on a network. They are an essential tool for network security and auditing.',
    }),
    new Frame({
      title: 'What You Can Do With This Tool',
      text: 'With this application you can capture live packets, filter by protocol or IP address, inspect individual packet details layer by layer, and save captures for later analysis. Use the interface level setting to control how much detail is shown.',
    }),
  ],
});
