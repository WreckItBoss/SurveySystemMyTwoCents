import csv

CSV_PATH = "exports/responses.csv"

with open(CSV_PATH, "r", encoding="utf-8-sig") as file:
    reader = csv.DictReader(file)

    count = 0

    for row in reader:
        comment = row.get("systemComment", "").strip()

        if comment:
            count += 1
            print(f"{count}. {comment}")

print(f"\nTotal system comments: {count}")