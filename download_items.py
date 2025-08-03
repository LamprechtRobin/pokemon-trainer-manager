#!/usr/bin/env python3
"""
Pokemon Item & Badge Image Downloader

This script downloads common Pokemon item images from the PokeAPI and provides
infrastructure for downloading gym badge images. Items are saved to public/items
and badges would be saved to public/badges folders for use in the web app.

Note: Badge downloading requires working image URLs. The structure is prepared
for when valid badge image sources are found.

Requirements: pip install requests

Usage: python download_items.py
"""

try:
    import requests
except ImportError:
    print("❌ Error: 'requests' module not found!")
    print("💡 Please install it with: pip install requests")
    print("   or: pip3 install requests")
    exit(1)

import time
import os
from pathlib import Path
import json

# Configuration
BASE_URL = "https://pokeapi.co/api/v2"
SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items"
BADGES_SPRITE_BASE = "https://www.serebii.net/itemdex/sprites"
OUTPUT_DIR = Path("public/items")
BADGES_OUTPUT_DIR = Path("public/badges")
DELAY_BETWEEN_REQUESTS = 0.2  # Be respectful to the API

# Common items to download
ITEMS_TO_DOWNLOAD = {
    # Pokéballs
    "pokeballs": [
        {"id": 4, "name": "poke-ball", "display_name": "Poké Ball"},
        {"id": 3, "name": "great-ball", "display_name": "Great Ball"},
        {"id": 2, "name": "ultra-ball", "display_name": "Ultra Ball"},
        {"id": 1, "name": "master-ball", "display_name": "Master Ball"},
        {"id": 12, "name": "premier-ball", "display_name": "Premier Ball"},
        {"id": 11, "name": "luxury-ball", "display_name": "Luxury Ball"},
        {"id": 10, "name": "timer-ball", "display_name": "Timer Ball"},
        {"id": 15, "name": "quick-ball", "display_name": "Quick Ball"},
        {"id": 13, "name": "dusk-ball", "display_name": "Dusk Ball"},
        {"id": 14, "name": "heal-ball", "display_name": "Heal Ball"},
    ],
    
    # Healing Items - Potions
    "potions": [
        {"id": 17, "name": "potion", "display_name": "Potion"},
        {"id": 26, "name": "super-potion", "display_name": "Super Potion"},
        {"id": 25, "name": "hyper-potion", "display_name": "Hyper Potion"},
        {"id": 24, "name": "max-potion", "display_name": "Max Potion"},
        {"id": 23, "name": "full-restore", "display_name": "Full Restore"},
    ],
    
    # Status Healing
    "status_healing": [
        {"id": 18, "name": "antidote", "display_name": "Antidote"},
        {"id": 19, "name": "burn-heal", "display_name": "Burn Heal"},
        {"id": 20, "name": "ice-heal", "display_name": "Ice Heal"},
        {"id": 21, "name": "awakening", "display_name": "Awakening"},
        {"id": 22, "name": "paralyze-heal", "display_name": "Paralyze Heal"},
        {"id": 27, "name": "full-heal", "display_name": "Full Heal"},
    ],
    
    # Revival Items
    "revival": [
        {"id": 28, "name": "revive", "display_name": "Revive"},
        {"id": 29, "name": "max-revive", "display_name": "Max Revive"},
    ],
    
    # Drinks
    "drinks": [
        {"id": 30, "name": "fresh-water", "display_name": "Fresh Water"},
        {"id": 31, "name": "soda-pop", "display_name": "Soda Pop"},
        {"id": 32, "name": "lemonade", "display_name": "Lemonade"},
        {"id": 33, "name": "moomoo-milk", "display_name": "Moomoo Milk"},
    ],
    
    # Common Berries
    "berries": [
        {"id": 132, "name": "oran-berry", "display_name": "Oran Berry"},
        {"id": 135, "name": "sitrus-berry", "display_name": "Sitrus Berry"},
        {"id": 149, "name": "chesto-berry", "display_name": "Chesto Berry"},
        {"id": 150, "name": "pecha-berry", "display_name": "Pecha Berry"},
        {"id": 151, "name": "rawst-berry", "display_name": "Rawst Berry"},
        {"id": 152, "name": "aspear-berry", "display_name": "Aspear Berry"},
        {"id": 153, "name": "leppa-berry", "display_name": "Leppa Berry"},
    ],
}

# Gym Badges to download (Note: Badge images from external sources may not be available)
# This demonstrates the structure for future badge downloads when working URLs are found
BADGES_TO_DOWNLOAD = {
    # Kanto Gym Badges (Placeholder structure)
    "kanto": [
        {"id": 464, "name": "boulder-badge", "display_name": "Boulder Badge", "gym": "Pewter City", "leader": "Brock", "url": "placeholder-badge.png"},
        {"id": 465, "name": "cascade-badge", "display_name": "Cascade Badge", "gym": "Cerulean City", "leader": "Misty", "url": "placeholder-badge.png"},
        {"id": 466, "name": "thunder-badge", "display_name": "Thunder Badge", "gym": "Vermilion City", "leader": "Lt. Surge", "url": "placeholder-badge.png"},
        {"id": 467, "name": "rainbow-badge", "display_name": "Rainbow Badge", "gym": "Celadon City", "leader": "Erika", "url": "placeholder-badge.png"},
    ],
}

def create_output_directories():
    """Create the output directory structure"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    BADGES_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✅ Created output directory: {OUTPUT_DIR}")
    print(f"✅ Created badges directory: {BADGES_OUTPUT_DIR}")

def download_image(url, filename, output_dir=None):
    """Download an image from URL and save it to filename"""
    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        target_dir = output_dir if output_dir else OUTPUT_DIR
        filepath = target_dir / filename
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to download {url}: {e}")
        return False

def get_item_details(item_id):
    """Fetch item details from PokeAPI"""
    try:
        response = requests.get(f"{BASE_URL}/item/{item_id}/", timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to fetch item {item_id}: {e}")
        return None

def download_items():
    """Download all specified items"""
    items_catalog = []
    total_items = sum(len(category_items) for category_items in ITEMS_TO_DOWNLOAD.values())
    current_item = 0
    
    print(f"🚀 Starting download of {total_items} Pokemon items...")
    
    for category, items in ITEMS_TO_DOWNLOAD.items():
        print(f"\n📂 Processing {category.title()} ({len(items)} items)...")
        
        for item in items:
            current_item += 1
            item_id = item["id"]
            item_name = item["name"]
            display_name = item["display_name"]
            
            print(f"  [{current_item}/{total_items}] {display_name} (ID: {item_id})...")
            
            # Get item details from API
            item_data = get_item_details(item_id)
            if not item_data:
                continue
                
            # Download image
            image_url = f"{SPRITE_BASE}/{item_name}.png"
            filename = f"{item_name}.png"
            
            if download_image(image_url, filename):
                print(f"    ✅ Downloaded: {filename}")
                
                # Add to catalog
                item_info = {
                    "id": item_id,
                    "name": item_name,
                    "display_name": display_name,
                    "category": category,
                    "filename": filename,
                    "description": "",
                    "cost": item_data.get("cost", 0),
                    "image_url": f"/items/{filename}"
                }
                
                # Extract description from API data
                effect_entries = item_data.get("effect_entries", [])
                for entry in effect_entries:
                    if entry.get("language", {}).get("name") == "en":
                        item_info["description"] = entry.get("effect", "").replace("\n", " ")
                        break
                
                items_catalog.append(item_info)
            else:
                print(f"    ❌ Failed to download: {filename}")
            
            # Be respectful to the API
            time.sleep(DELAY_BETWEEN_REQUESTS)
    
    return items_catalog

def download_badges():
    """Download all specified gym badges"""
    badges_catalog = []
    total_badges = sum(len(region_badges) for region_badges in BADGES_TO_DOWNLOAD.values())
    current_badge = 0
    
    print(f"\n🏆 Starting download of {total_badges} Pokemon gym badges...")
    
    for region, badges in BADGES_TO_DOWNLOAD.items():
        print(f"\n🌍 Processing {region.title()} badges ({len(badges)} badges)...")
        
        for badge in badges:
            current_badge += 1
            badge_id = badge["id"]
            badge_name = badge["name"]
            display_name = badge["display_name"]
            gym = badge["gym"]
            leader = badge["leader"]
            url_path = badge["url"]
            
            print(f"  [{current_badge}/{total_badges}] {display_name} ({gym})...")
            
            # Download badge image
            image_url = f"{BADGES_SPRITE_BASE}/{url_path}"
            filename = f"{badge_name}.png"
            
            if download_image(image_url, filename, BADGES_OUTPUT_DIR):
                print(f"    ✅ Downloaded: {filename}")
                
                # Add to catalog
                badge_info = {
                    "id": badge_id,
                    "name": badge_name,
                    "display_name": display_name,
                    "region": region,
                    "gym": gym,
                    "leader": leader,
                    "filename": filename,
                    "description": f"The {display_name} earned by defeating {leader} at {gym}.",
                    "image_url": f"/badges/{filename}"
                }
                
                badges_catalog.append(badge_info)
            else:
                print(f"    ❌ Failed to download: {filename}")
            
            # Be respectful to the API
            time.sleep(DELAY_BETWEEN_REQUESTS)
    
    return badges_catalog

def save_catalog(items_catalog):
    """Save the items catalog as JSON for easy import"""
    catalog_file = OUTPUT_DIR / "items_catalog.json"
    
    with open(catalog_file, 'w', encoding='utf-8') as f:
        json.dump(items_catalog, f, indent=2, ensure_ascii=False)
    
    print(f"\n📋 Saved items catalog to: {catalog_file}")
    print(f"   Contains {len(items_catalog)} items with descriptions and metadata")

def save_badges_catalog(badges_catalog):
    """Save the badges catalog as JSON for easy import"""
    catalog_file = BADGES_OUTPUT_DIR / "badges_catalog.json"
    
    with open(catalog_file, 'w', encoding='utf-8') as f:
        json.dump(badges_catalog, f, indent=2, ensure_ascii=False)
    
    print(f"\n🏆 Saved badges catalog to: {catalog_file}")
    print(f"   Contains {len(badges_catalog)} badges with descriptions and metadata")

def print_summary(items_catalog, badges_catalog):
    """Print a summary of downloaded items and badges"""
    print(f"\n🎉 Download Complete!")
    print(f"📊 Summary:")
    print(f"   Total items downloaded: {len(items_catalog)}")
    print(f"   Total badges downloaded: {len(badges_catalog)}")
    
    # Items by category
    by_category = {}
    for item in items_catalog:
        category = item["category"]
        by_category[category] = by_category.get(category, 0) + 1
    
    print(f"\n📦 Items by category:")
    for category, count in by_category.items():
        print(f"   {category.title()}: {count} items")
    
    # Badges by region
    by_region = {}
    for badge in badges_catalog:
        region = badge["region"]
        by_region[region] = by_region.get(region, 0) + 1
    
    print(f"\n🏆 Badges by region:")
    for region, count in by_region.items():
        print(f"   {region.title()}: {count} badges")
    
    print(f"\n📁 Files saved to:")
    print(f"   {OUTPUT_DIR} - Items with PNG images and catalog")
    print(f"   {BADGES_OUTPUT_DIR} - Badges with PNG images and catalog")
    
    print(f"\n💡 Usage in web app:")
    print(f"   Item images: /items/[item-name].png")
    print(f"   Badge images: /badges/[badge-name].png")
    print(f"   Use catalog JSONs for easy data import")

def main():
    """Main function"""
    print("🎮 Pokemon Item & Badge Image Downloader")
    print("=" * 50)
    
    # Create directories
    create_output_directories()
    
    # Download all items
    items_catalog = download_items()
    
    # Download all badges
    badges_catalog = download_badges()
    
    # Save catalogs
    save_catalog(items_catalog)
    save_badges_catalog(badges_catalog)
    
    # Print summary
    print_summary(items_catalog, badges_catalog)
    
    print(f"\n✨ Ready to use in your Pokemon Trainer Manager app!")

if __name__ == "__main__":
    main()