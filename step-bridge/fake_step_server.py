import asyncio
import json
import websockets

# Set of currently connected clients
connected = set()
# Global step counter
step_count = 0

async def broadcast_steps():
    """Periodically increment step count and broadcast to clients."""
    global step_count
    while True:
        await asyncio.sleep(2)  # wait 2 seconds between steps
        step_count += 1
        message = json.dumps({"steps": step_count})
        # Send to all connected clients
        if connected:
            await asyncio.gather(*[ws.send(message) for ws in connected])
        # Optional debug output
        print(f"Sent: {message}")
        # Placeholder for real device integration
        # read_real_device() could update step_count instead of incrementing

async def handler(websocket):
    """Register client connections and cleanup on disconnect."""
    connected.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        connected.remove(websocket)

# Placeholder for future real device reading
async def read_real_device():
    """Example function for reading from a real wearable via BLE/OSC."""
    # Replace this section with BLE/OSC input for real wearable devices
    await asyncio.sleep(0)  # no-op placeholder

async def main():
    async with websockets.serve(handler, "localhost", 6789):
        # Start the broadcast coroutine alongside the server
        await broadcast_steps()

if __name__ == "__main__":
    asyncio.run(main())
