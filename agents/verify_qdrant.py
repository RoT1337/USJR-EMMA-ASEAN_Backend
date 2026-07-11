import asyncio
from dotenv import load_dotenv
import utils.qdrant as qdrant_module

load_dotenv('.env')

async def main():
    client = qdrant_module._get_client()
    exists = await client.collection_exists(qdrant_module.COLLECTION_NAME)
    print('collection_exists', exists)
    if exists:
        info = await client.get_collection(qdrant_module.COLLECTION_NAME)
        print('points_count', getattr(info, 'points_count', None))
        print('vectors', getattr(info, 'vectors', None))
    await client.close()

asyncio.run(main())
