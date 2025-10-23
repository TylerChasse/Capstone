"""
Test Suite: Interface Detection
Tests the ability to detect and list network interfaces
"""

import unittest
import subprocess


class TestInterfaceDetection(unittest.TestCase):
    """Test that we can detect network interfaces"""

    def test_can_list_interfaces(self):
        """Test that tshark can list interfaces"""
        try:
            result = subprocess.run(['tshark', '-D'],
                                    capture_output=True,
                                    text=True,
                                    timeout=5)
            self.assertEqual(result.returncode, 0)
            self.assertGreater(len(result.stdout), 0)

            # Print detected interfaces
            print("\n" + "=" * 70)
            print("DETECTED INTERFACES:")
            print("=" * 70)
            for line in result.stdout.strip().split('\n'):
                print(f"  {line}")
            print("=" * 70)
        except FileNotFoundError:
            self.skipTest("TShark not installed")


if __name__ == '__main__':
    unittest.main(verbosity=2)