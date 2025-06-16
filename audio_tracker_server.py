# This script does 3 things:
# 1. Listens to system audio using PyAudio
# 2. Analyzes loudness using RMS (root mean square)
# 3. Sends volume level to a browser overlay via WebSocket (ws://localhost:6789)

import asyncio
import websockets
import numpy as np
import pyaudio
import json

# Audio settings
CHUNK = 1024
RATE = 44100

# Setup PyAudio stream to read from default input (use loopback for system audio)
p = pyaudio.PyAudio()

for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    print(f"{i}: {info['name']}")

stream = p.open(format=pyaudio.paInt16,
                channels=1,
                rate=RATE,
                input=True,
                input_device_index=3,  # Replace this with the index you found
                frames_per_buffer=CHUNK)

# WebSocket server
async def audio_sender(websocket, path):
    while True:
        data = np.frombuffer(stream.read(CHUNK, exception_on_overflow=False), dtype=np.int16)
        rms = np.sqrt(np.mean(np.square(data)))
        payload = json.dumps({ "loudness": float(rms) })
        await websocket.send(payload)
        await asyncio.sleep(0.1)  # ~10 FPS

# Launch WebSocket
start_server = websockets.serve(audio_sender, "localhost", 6789)
asyncio.get_event_loop().run_until_complete(start_server)
print("\U0001F3A7 Audio tracker running on ws://localhost:6789")
asyncio.get_event_loop().run_forever()
