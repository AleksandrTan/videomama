import asyncio
import websockets

async def echo(websocket, path):
    name = await websocket.recv()
    if name == 'stop':
        print(f"< {name}")
    else:
        print(1000)

start_server = websockets.serve(echo, "127.0.0.1", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()