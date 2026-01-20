"""
Module for capturing network packets using pyshark.
"""

import pyshark
import asyncio
import time
import threading
import warnings
from typing import Optional, Callable, Any, List
from dataclasses import dataclass


@dataclass
class CaptureConfig:
    """Configuration for packet capture."""
    interface: str
    packet_count: int = 50  # 0 = continuous
    display_filter: str = ""
    timeout: int = 30  # seconds


@dataclass
class CaptureStats:
    """Statistics from a capture session."""
    packets_captured: int
    elapsed_time: float
    stopped_by_user: bool
    stopped_by_timeout: bool
    error: Optional[str] = None


class PacketCapture:
    """
    Handles packet capture operations using pyshark.

    This class manages the lifecycle of a packet capture session,
    including starting, stopping, and iterating over captured packets.
    """

    def __init__(self, config: CaptureConfig):
        """
        Initialize the packet capture.

        Args:
            config: CaptureConfig with capture settings
        """
        self.config = config
        self.capture: Optional[pyshark.LiveCapture] = None
        self.is_capturing = False
        self._start_time: Optional[float] = None
        self._packets_captured = 0
        self._stop_event = threading.Event()
        self._packets: List[Any] = []
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._packet_callback: Optional[Callable[[Any, int], None]] = None
        self._error_msg: Optional[str] = None

    def _capture_worker(self):
        """Worker function that runs in a separate thread to capture packets."""
        # Create a new event loop for this thread
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)

        try:
            # Create capture object
            if self.config.display_filter:
                self.capture = pyshark.LiveCapture(
                    interface=self.config.interface,
                    display_filter=self.config.display_filter
                )
            else:
                self.capture = pyshark.LiveCapture(interface=self.config.interface)

            for packet in self.capture.sniff_continuously():
                if self._stop_event.is_set():
                    break

                self._packets_captured += 1
                self._packets.append(packet)

                # Call callback in real-time if provided
                if self._packet_callback:
                    try:
                        self._packet_callback(packet, self._packets_captured)
                    except Exception as e:
                        self._error_msg = str(e)
                        break

                # Check if stop was called during callback
                if self._stop_event.is_set():
                    break

                # Check packet count limit
                if self.config.packet_count > 0 and self._packets_captured >= self.config.packet_count:
                    break

        except Exception as e:
            if not self._stop_event.is_set():
                self._error_msg = str(e)
        finally:
            # Properly close capture and event loop
            self._cleanup_capture()

    def _cleanup_capture(self):
        """Clean up capture resources properly."""
        if self.capture:
            try:
                # Close capture using the event loop if available
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
                # Cancel pending tasks
                pending = asyncio.all_tasks(self._loop)
                for task in pending:
                    task.cancel()
                # Give tasks a chance to clean up
                if pending:
                    self._loop.run_until_complete(asyncio.gather(*pending, return_exceptions=True))
            except:
                pass
            finally:
                try:
                    self._loop.close()
                except:
                    pass

    def start(self, packet_callback: Callable[[Any, int], None],
              status_callback: Optional[Callable[[str], None]] = None) -> CaptureStats:
        """
        Start capturing packets.

        This method blocks until capture is complete (by count, timeout, or stop()).

        Args:
            packet_callback: Function called for each captured packet.
                             Receives (packet, packet_number) as arguments.
                             Called in real-time as packets arrive.
            status_callback: Optional function called with status updates.

        Returns:
            CaptureStats with information about the capture session.
        """
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

        # Suppress pyshark cleanup warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")

            # Run capture in a separate thread with timeout
            capture_thread = threading.Thread(target=self._capture_worker, daemon=True)
            capture_thread.start()

            # Wait for the thread to complete or timeout
            capture_thread.join(timeout=self.config.timeout)

            # If thread is still alive, we timed out
            if capture_thread.is_alive():
                stopped_by_timeout = True
                self._stop_event.set()
                # Try to close the capture to stop the thread
                if self.capture:
                    try:
                        if self._loop and not self._loop.is_closed():
                            self._loop.call_soon_threadsafe(self._loop.stop)
                    except:
                        pass
                # Give it a moment to clean up
                capture_thread.join(timeout=2)

        # Check if user stopped (stop() was called)
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
        """
        Stop the current capture.
        """
        self._stop_event.set()
        self.is_capturing = False

        if self._loop and not self._loop.is_closed():
            try:
                self._loop.call_soon_threadsafe(self._loop.stop)
            except:
                pass

    @property
    def packets_captured(self) -> int:
        """Return the number of packets captured so far."""
        return self._packets_captured

    @property
    def elapsed_time(self) -> float:
        """Return elapsed time since capture started."""
        if self._start_time is None:
            return 0
        return time.time() - self._start_time
