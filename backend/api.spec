# api.spec - PyInstaller build spec for the Network Analyzer backend
#
# Build with:
#   cd backend
#   pyinstaller api.spec
#
# Output: backend/dist/api.exe

import sys
from pathlib import Path

block_cipher = None

a = Analysis(
    ['api.py'],
    pathex=[str(Path('api.py').parent.resolve())],
    binaries=[],
    datas=[],
    # These hidden imports are needed because PyInstaller can't detect them
    # through pyshark/scapy's dynamic import machinery
    hiddenimports=[
        # FastAPI / Uvicorn
        'uvicorn',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'fastapi',
        'pydantic',
        # pyshark uses these dynamically
        'pyshark',
        'pyshark.capture',
        'pyshark.capture.live_capture',
        'pyshark.packet',
        'pyshark.packet.packet',
        'pyshark.packet.layers',
        # scapy
        'scapy',
        'scapy.all',
        'scapy.layers.all',
        'scapy.arch.windows',
        # netifaces / psutil for interface detection
        'netifaces',
        'psutil',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='api',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,       # Keep console visible so you can see uvicorn logs
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
