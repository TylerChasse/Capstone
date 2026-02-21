import { Tutorial, Frame } from './Tutorial';
import interfaceSelectionImage from '../assets/tutorials/gettingStarted/interfaceSelection.png'
import startCaptureImage from '../assets/tutorials/gettingStarted/startCapture.png'
import filtersImage from '../assets/tutorials/gettingStarted/filters.png'
import packetDetailsImage from '../assets/tutorials/gettingStarted/packetDetails.png'
import tutorialsImage from '../assets/tutorials/gettingStarted/tutorials.png'
import detailLevelsImage from '../assets/tutorials/gettingStarted/detailLevels.png'

export default new Tutorial({
  id: 'getting-started',
  name: 'Getting Started',
  frames: [
    new Frame({
      title: 'Welcome to your Network Analyzer',
      text: 'This tutorial will walk you through the basics of how to capture and analyze network packets.',
    }),
    new Frame({
      title: 'Select an Interface',
      text: 'A network interface is where packet traffic occurs and can be captured from. This will likely be an Ethernet or Wi-Fi interface. Choose a network interface from the dropdown in the top-left corner. Connected interfaces are labeled "(Connected)". Click "Refresh" if your interface doesn\'t appear.',
      image: interfaceSelectionImage
    }),
    new Frame({
      title: 'Start a Capture',
      text: 'Click "Start Capture" to begin capturing packets on the selected interface. Packets will appear in the table in real time as they are captured.',
      image: startCaptureImage
    }),
    new Frame({
      title: 'Filter Packets',
      text: 'Use the Protocol Filter to show/hide specific protocols and packet types. Use the IP Filter to focus on traffic to or from specific addresses.',
      image: filtersImage
    }),
    new Frame({
      title: 'Inspect a Packet',
      text: 'Click any packet in the table to see its details in the panel below. Drag the divider to resize the panels.',
      image: packetDetailsImage
    }),
    new Frame({
      title: 'Use Tutorials',
      text: 'Access Tutorials from the "Tutorials" tab in the top toolbar to learn about these packet details. Beginner tutorials may be a good place to start.',
      image: tutorialsImage
    }),
    new Frame({
      title: 'Change Detail Level',
      text: 'When ready, switch between Beginner, Intermediate, and Advanced levels to reveal more detail and information. For example, you may find MAC addresses, TTL, layer sizes, and raw hex data at higher levels.',
      image: detailLevelsImage
    }),
  ],
});
