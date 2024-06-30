import cloudscraper
from bs4 import BeautifulSoup
from pymongo import MongoClient
from time import sleep
import os

database_url = os.environ.get("MONGODB_URI", "mongodb+srv://johnson:jingleton@cluster0.ce4xwfb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

scraper = cloudscraper.create_scraper(
    browser={
        'browser': 'chrome',
        'platform': 'android',
        'desktop': False
    }
)

Cluster = MongoClient([database_url])
Database = Cluster["test"]
Data = Database["items"]

PetIcons = scraper.get("https://biggamesapi.io/api/collection/Pets").json()

#CosmicValues = scraper.get("https://petsimulatorvalues.com/ps99.php?category=huges").text
#CosmicValues = scraper.get("https://petsimulatorvalues.com/ps99.php?category=titanics").text

with open("Values.txt", "r") as file:
    CosmicValues = file.read()

AllData = Data.find()

def UnFormat(string):
    suffixes = {'K': 1000, 'M': 1000000, 'B': 1000000000, 'T': 1000000000000, 'Q': 1000000000000000}
    try:
        number = int(string)
    except ValueError:
        try:
            if string[-2].upper() in suffixes:
                number_str = string[:-2]
                suffix = string[-2:].upper()
            else:
                number_str = string[:-1]
                suffix = string[-1].upper()
            if suffix in suffixes:
                number = int(float(number_str) * suffixes[suffix])
            else:
                return 0
        except ValueError:
            return 0
    return number

def GetData(PetName):
    CheckName = str.lower(PetName)
    FoundPet = False

    Golden = False
    Rainbow = False
    Shiny = False

    if "golden " in CheckName:
        CheckName = CheckName.replace("golden ", "", 1)
        Golden = True

    if "rainbow " in CheckName:
        CheckName = CheckName.replace("rainbow ", "", 1)
        Rainbow = True

    if "shiny" in CheckName:
        CheckName = CheckName.replace("shiny ", "", 1)
        Shiny = True

    for Pet in PetIcons["data"]:
        FoundName = str.lower(Pet["configData"]["name"])

        if CheckName == FoundName:
            if Golden:
                ImageURL = Pet["configData"]["goldenThumbnail"]
            else:
                ImageURL = Pet["configData"]["thumbnail"]

            FoundPet = {"name": Pet["configData"]["name"], "icon": ImageURL}
            break

    if FoundPet:
        FoundPet["icon"] = FoundPet["icon"].replace("rbxassetid://", "", 1)
        FoundPet["icon"] = "https://biggamesapi.io/image/" + FoundPet["icon"]

    return FoundPet

Soup = BeautifulSoup(CosmicValues, 'html5lib')
Items = Soup.select("body > section.md-content.pb-5 > div > div.cards-groups.justify-content-around.content-scroll > a")

ItemsChanged = 0
ItemsAdded = 0

for Item in Items:
    ItemName = Item.select_one('.item-name').get_text(strip=True)
    Value = UnFormat(Item.select_one('.float-right.pt-2').get_text(strip=True))/1000
    Check = next((item for item in AllData if item['item_name'] == ItemName), None)
    ImageURL = GetData(ItemName)

    if Check:
        if Check["item_value"] != Value:
            Data.update_one({"item_name": ItemName}, {"$set": {"item_value": Value}})
            print(f"{ItemName}'s value changed from {Check['item_value']} to {Value}")
            ItemsChanged += 1

        if ImageURL != False and Check["item_image"] != ImageURL["icon"]:
            Data.update_one({"item_name": ItemName}, {"$set": {"item_image": ImageURL['icon']}})
            print(f"{ItemName}'s image url from {Check['item_image']} to {ImageURL['icon']}")
            ItemsChanged += 1

        sleep(0.01)
    else:
        Data.insert_one({
            "item_name": ItemName,
            "display_name": ImageURL.get("name", "{ItemName}") if ImageURL else ItemName,
            "item_image": ImageURL.get("icon", None) if ImageURL else None,
            "item_value": Value,
            "game": "PS99"
        })
        print(f"{ItemName}'s was added with value {Value}")
        ItemsAdded += 1
        sleep(0.01)

print(f"Changed Items: {ItemsChanged}")
print(f"Added Items: {ItemsAdded}")