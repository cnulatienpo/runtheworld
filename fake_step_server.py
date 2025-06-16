import asyncio
import websockets
import json

async def step_server(websocket):
    while True:
        await asyncio.sleep(1.5)
        await websocket.send(json.dumps({"steps": 1}))

async def main():
    async with websockets.serve(step_server, "localhost", 6789):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())


