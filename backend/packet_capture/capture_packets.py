"""
capture_packets.py - Packet Capture Engine

Handles live packet capture using pyshark (Python wrapper for Wireshark/tshark).
Uses threading to enforce timeouts since pyshark's built-in timeout is unreliable.

Key Classes:
    CaptureConfig - Settings for a capture session (interface, filters, timeout)
    CaptureStats  - Results after capture completes (packet count, duration, etc.)
    PacketCapture - Main class that manages the capture lifecycle
"""

import pyshark
import asyncio
import time
import threading
import warnings
from typing import Optional, Callable, Any, List
from dataclasses import dataclass


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class CaptureConfig:
    """
    Configuration for packet capture.

    Attributes:
        interface: Device path to capture on (from load_interfaces)
        packet_count: Stop after this many packets (0 = unlimited)
        display_filter: Wireshark display filter (e.g., "tcp", "udp port 53")
        timeout: Maximum capture duration in seconds
    """
    interface: str
    packet_count: int = 50
    display_filter: str = ""
    timeout: int = 30


@dataclass
class CaptureStats:
    """
    Statistics returned after a capture session ends.

    Attributes:
        packets_captured: Total number of packets captured
        elapsed_time: How long the capture ran (seconds)
        stopped_by_user: True if stop() was called
        stopped_by_timeout: True if timeout was reached
        error: Error message if capture failed, None otherwise
    """
    packets_captured: int
    elapsed_time: float
    stopped_by_user: bool
    stopped_by_timeout: bool
    error: Optional[str] = None


# =============================================================================
# PACKET CAPTURE CLASS
# =============================================================================

class PacketCapture:
    """
    Manages packet capture operations using pyshark.

    Usage:
        config = CaptureConfig(interface="eth0", timeout=30)
        capture = PacketCapture(config)

        def my_callback(packet, number):
            print(f"Packet {number}: {packet}")

        stats = capture.start(my_callback)
        print(f"Captured {stats.packets_captured} packets")
    """

    def __init__(self, config: CaptureConfig):
        """Initialize capture with the given configuration."""
        self.config = config
        self.capture: Optional[pyshark.LiveCapture] = None
        self.is_capturing = False

        # Internal state
        self._start_time: Optional[float] = None
        self._packets_captured = 0
        self._stop_event = threading.Event()  # Signals capture to stop
        self._packets: List[Any] = []
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._packet_callback: Optional[Callable[[Any, int], None]] = None
        self._error_msg: Optional[str] = None

    # -------------------------------------------------------------------------
    # CAPTURE WORKER (runs in separate thread)
    # -------------------------------------------------------------------------

    def _capture_worker(self):
        """
        Worker function that runs in a separate thread to capture packets.
        Pyshark requires its own asyncio event loop, so we create one here.
        """
        # Create a new event loop for this thread (pyshark needs asyncio)
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)

        try:
            # Create the pyshark LiveCapture object
            if self.config.display_filter:
                self.capture = pyshark.LiveCapture(
                    interface=self.config.interface,
                    display_filter=self.config.display_filter,
                    include_raw=True,
                    use_json=True
                )
            else:
                self.capture = pyshark.LiveCapture(
                    interface=self.config.interface,
                    include_raw=True,
                    use_json=True
                )

            # Capture packets one at a time using sniff_continuously()
            for packet in self.capture.sniff_continuously():
                # Check if stop was requested
                if self._stop_event.is_set():
                    break

                self._packets_captured += 1
                self._packets.append(packet)

                # Call the user's callback function with this packet
                if self._packet_callback:
                    try:
                        self._packet_callback(packet, self._packets_captured)
                    except Exception as e:
                        self._error_msg = str(e)
                        break

                # Check again after callback (user might call stop() in callback)
                if self._stop_event.is_set():
                    break

                # Check if we've reached the packet limit
                if self.config.packet_count > 0 and self._packets_captured >= self.config.packet_count:
                    break

        except Exception as e:
            if not self._stop_event.is_set():
                self._error_msg = str(e)
        finally:
            self._cleanup_capture()

    def _cleanup_capture(self):
        """Clean up pyshark capture and asyncio resources."""
        if self.capture:
            try:
                if self._loop and not self._loop.is_closed():
                    try:
                        self._loop.run_until_complete(self.capture.close_async())
                    except:
                        pass
            except:
                pass
            finally:
                self.capture = None

        if self._loop and not self._loop.is_closed():
            try:
                # Cancel any pending async tasks
                pending = asyncio.all_tasks(self._loop)
                for task in pending:
                    task.cancel()
                if pending:
                    self._loop.run_until_complete(asyncio.gather(*pending, return_exceptions=True))
            except:
                pass
            finally:
                try:
                    self._loop.close()
                except:
                    pass

    # -------------------------------------------------------------------------
    # PUBLIC METHODS
    # -------------------------------------------------------------------------

    def start(self, packet_callback: Callable[[Any, int], None],
              status_callback: Optional[Callable[[str], None]] = None) -> CaptureStats:
        """
        Start capturing packets. Blocks until capture completes.

        Args:
            packet_callback: Called for each packet with (packet, packet_number).
                             Use this to process/store packets as they arrive.
            status_callback: Optional, called with status messages.

        Returns:
            CaptureStats with results of the capture session.
        """
        # Reset state for new capture
        self._stop_event.clear()
        self._packets = []
        self._packets_captured = 0
        self._error_msg = None
        self._packet_callback = packet_callback
        stopped_by_user = False
        stopped_by_timeout = False

        self.is_capturing = True
        self._start_time = time.time()

        if status_callback:
            status_callback("Capturing packets...")

        # Suppress pyshark cleanup warnings (they're harmless but noisy)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")

            # Start capture in a separate thread so we can enforce timeout
            capture_thread = threading.Thread(target=self._capture_worker, daemon=True)
            capture_thread.start()

            # Wait for capture to finish or timeout
            capture_thread.join(timeout=self.config.timeout)

            # If thread is still running, we hit the timeout
            if capture_thread.is_alive():
                stopped_by_timeout = True
                self._stop_event.set()

                # Force-stop the event loop to unblock sniff_continuously()
                if self.capture and self._loop and not self._loop.is_closed():
                    try:
                        self._loop.call_soon_threadsafe(self._loop.stop)
                    except:
                        pass

                # Give thread time to clean up
                capture_thread.join(timeout=2)

        # Determine how capture ended
        if self._stop_event.is_set() and not stopped_by_timeout:
            stopped_by_user = True

        self.is_capturing = False
        elapsed_time = time.time() - self._start_time if self._start_time else 0

        return CaptureStats(
            packets_captured=self._packets_captured,
            elapsed_time=elapsed_time,
            stopped_by_user=stopped_by_user,
            stopped_by_timeout=stopped_by_timeout,
            error=self._error_msg
        )

    def stop(self):
        """Stop the current capture. Can be called from the packet callback."""
        self._stop_event.set()
        self.is_capturing = False

        # Force-stop the event loop
        if self._loop and not self._loop.is_closed():
            try:
                self._loop.call_soon_threadsafe(self._loop.stop)
            except:
                pass

    # -------------------------------------------------------------------------
    # PROPERTIES (for monitoring capture progress)
    # -------------------------------------------------------------------------

    @property
    def packets_captured(self) -> int:
        """Number of packets captured so far."""
        return self._packets_captured

    @property
    def elapsed_time(self) -> float:
        """Seconds elapsed since capture started."""
        if self._start_time is None:
            return 0
        return time.time() - self._start_time
