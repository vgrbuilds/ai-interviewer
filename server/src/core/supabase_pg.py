import asyncpg
from src.core.config import settings

class Database:
    def __init__(self):
        self.pool = None
    async def connect(self):
        self.pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_CONNECTION_STRING,
            min_size = 5,
            max_size = 20,   
        )
    async def disconnect(self):
        if self.pool:
            await self.pool.close()    

db = Database()