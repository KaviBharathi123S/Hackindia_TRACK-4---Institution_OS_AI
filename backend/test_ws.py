import asyncio, websockets, json

async def test():
    async with websockets.connect("ws://localhost:8000/ws/chat/test1") as ws:
        await ws.send("Delete student STU00954")
        print(await ws.recv())

asyncio.run(test())
