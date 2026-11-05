"""Create (or, with --reset, replace) the staff access code for every restaurant.

    python3 generate_staff_codes.py            # codes for restaurants that don't have one yet
    python3 generate_staff_codes.py --reset    # new codes for all restaurants (old ones stop working)

Codes are printed once and only their hash is stored, so copy them down and hand each to its restaurant.
"""
import asyncio
import sys

from server import db, hash_staff_code, new_staff_code, ensure_code_staff_user


async def main(reset: bool) -> None:
    venues = await db.venues.find({}, {"_id": 0, "id": 1, "name": 1, "neighborhood": 1, "staff_code_hash": 1}).to_list(500)
    shown = 0
    for v in sorted(venues, key=lambda x: x["name"]):
        if v.get("staff_code_hash") and not reset:
            print(f"{v['name']:<22} {v['neighborhood'] or '':<22} (already has a code — use --reset to replace)")
            continue
        code = new_staff_code(v["name"])
        await db.venues.update_one({"id": v["id"]}, {"$set": {"staff_code_hash": hash_staff_code(code)}})
        await ensure_code_staff_user(v)
        print(f"{v['name']:<22} {v['neighborhood'] or '':<22} {code}")
        shown += 1
    if not shown:
        print("No new codes created.")


if __name__ == "__main__":
    asyncio.run(main("--reset" in sys.argv))
