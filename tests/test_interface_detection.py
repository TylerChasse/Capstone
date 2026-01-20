"""
Test Suite: Interface Detection
Tests the ability to detect and list network interfaces
"""

import unittest
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from packet_capture import load_interfaces, get_interface_device


class TestInterfaceDetection(unittest.TestCase):
    """Test that we can detect network interfaces"""

    def test_can_list_interfaces(self):
        """Test that load_interfaces returns available interfaces"""
        try:
            interfaces, interface_map = load_interfaces()

            self.assertIsInstance(interfaces, list)
            self.assertIsInstance(interface_map, dict)
            self.assertGreater(len(interfaces), 0)

            # Print detected interfaces
            print("\n" + "=" * 70)
            print("DETECTED INTERFACES:")
            print("=" * 70)
            for display_name in interfaces:
                device_path = interface_map[display_name]
                print(f"  {display_name}")
                print(f"    Device: {device_path}")
            print("=" * 70)

        except FileNotFoundError:
            self.skipTest("TShark not installed")
        except RuntimeError as e:
            self.skipTest(f"Failed to load interfaces: {e}")

    def test_interface_map_consistency(self):
        """Test that interface map keys match interface list"""
        try:
            interfaces, interface_map = load_interfaces()

            # All interfaces should be keys in the map
            for display_name in interfaces:
                self.assertIn(display_name, interface_map)

            # Map should have same number of entries as interface list
            self.assertEqual(len(interfaces), len(interface_map))

        except FileNotFoundError:
            self.skipTest("TShark not installed")
        except RuntimeError as e:
            self.skipTest(f"Failed to load interfaces: {e}")

    def test_get_interface_device(self):
        """Test that get_interface_device returns correct device path"""
        try:
            interfaces, interface_map = load_interfaces()

            if not interfaces:
                self.skipTest("No interfaces available")

            # Test with first interface
            display_name = interfaces[0]
            device = get_interface_device(display_name, interface_map)

            self.assertIsInstance(device, str)
            self.assertGreater(len(device), 0)
            self.assertEqual(device, interface_map[display_name])

            print("\n" + "=" * 70)
            print("GET INTERFACE DEVICE TEST:")
            print("=" * 70)
            print(f"  Display Name: {display_name}")
            print(f"  Device Path: {device}")
            print("=" * 70)

        except FileNotFoundError:
            self.skipTest("TShark not installed")
        except RuntimeError as e:
            self.skipTest(f"Failed to load interfaces: {e}")

    def test_get_interface_device_invalid_key(self):
        """Test that get_interface_device raises KeyError for invalid key"""
        try:
            interfaces, interface_map = load_interfaces()

            with self.assertRaises(KeyError):
                get_interface_device("NonExistent Interface", interface_map)

        except FileNotFoundError:
            self.skipTest("TShark not installed")
        except RuntimeError as e:
            self.skipTest(f"Failed to load interfaces: {e}")


if __name__ == '__main__':
    unittest.main(verbosity=2)
