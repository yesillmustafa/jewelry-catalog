import csv
import json
import os

# ==========================
# Dosya yolları
# ==========================

CSV_FILE = "products.csv"
IMAGE_FOLDER = "images"
OUTPUT_FILE = "products.json"

# ==========================
# SKU -> Kategori
# ==========================

CATEGORY_MAP = {
    "MKE": "Küpe",
    "MKL": "Kolye",
    "MBL": "Bileklik",
    "MSH": "Şahmeran",
    "MHL": "Halhal"
}

# ==========================
# Resim uzantıları
# ==========================

IMAGE_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif"
)

products = []

# ==========================
# CSV Oku
# ==========================

with open(CSV_FILE, encoding="utf-8-sig") as file:

    reader = csv.DictReader(file)

    for row in reader:

        sku = row["SKU"].strip()

        name = row["Ürün Adı"].strip()

        price = row["Satış Fiyatı (TR)"].strip()

        prefix = sku[:3]

        category = CATEGORY_MAP.get(prefix, "Diğer")

        product_folder = os.path.join(
            IMAGE_FOLDER,
            category,
            sku
        )

        image_list = []

        if os.path.exists(product_folder):

            files = sorted(os.listdir(product_folder))

            for file_name in files:

                if file_name.lower().endswith(IMAGE_EXTENSIONS):

                    image_list.append(file_name)

        products.append({

            "sku": sku,

            "name": name,

            "price": price,

            "category": category,

            "images": image_list

        })

# ==========================
# JSON Yaz
# ==========================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        products,
        file,
        ensure_ascii=False,
        indent=4
    )

print("--------------------------------")
print("JSON oluşturuldu.")
print("Toplam ürün:", len(products))
print("--------------------------------")