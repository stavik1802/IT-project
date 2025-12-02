# backend/test_mongo.py
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    # 🔹 Make sure .env is loaded
    load_dotenv()  # this loads backend/.env when run from backend directory

    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB_NAME", "real_estate_db")

    print("MONGO_URI =", repr(uri))
    print("MONGO_DB_NAME =", repr(db_name))

    if not uri:
        print("❌ MONGO_URI is missing or empty")
        return

    client = AsyncIOMotorClient(uri)
    db = client[db_name]

    try:
        result = await db.test_ping.insert_one({"ok": True})
        print("✅ Connected and wrote document with _id:", result.inserted_id)
    except Exception as e:
        print("❌ Mongo error:", e)

if __name__ == "__main__":
    asyncio.run(main())
