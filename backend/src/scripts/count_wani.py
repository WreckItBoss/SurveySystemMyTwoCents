import csv
from pathlib import Path

csv_path = Path("exports/responses.csv")

total = 0
wani_count = 0
other_count = 0

with csv_path.open(
    "r",
    encoding="utf-8",
    newline="",
) as file:
    reader = csv.DictReader(file)

    for row in reader:
        total += 1

        answer = (
            row.get("keywordAnswer", "")
            .strip()
        )

        if answer == "ワニ":
            wani_count += 1
        else:
            other_count += 1

print(f"Total responses: {total}")
print(f"Answered ワニ: {wani_count}")
print(f"Other answers: {other_count}")

if total > 0:
    percentage = (
        wani_count / total * 100
    )

    print(
        f"ワニ percentage: {percentage:.2f}%"
    )