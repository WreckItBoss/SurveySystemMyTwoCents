import csv
import statistics

CSV_PATH = "exports/responses6.csv"

response_times = []

with open(CSV_PATH, "r", encoding="utf-8-sig") as file:
    reader = csv.DictReader(file)

    for row in reader:
        # Only valid responses that answered ワニ
        if row.get("keywordAnswer", "").strip() != "ワニ":
            continue

        time_value = row.get(
            "completionTimeSeconds", ""
        ).strip()

        if not time_value:
            continue

        try:
            response_times.append(float(time_value))
        except ValueError:
            continue

if not response_times:
    print("No valid responses found.")
    exit()

average = statistics.mean(response_times)
median = statistics.median(response_times)
minimum = min(response_times)
maximum = max(response_times)

print(f"Valid responses (ワニ): {len(response_times)}")
print()
print("Response time statistics:")
print(f"Average: {average:.2f} seconds ({average / 60:.2f} minutes)")
print(f"Median:  {median:.2f} seconds ({median / 60:.2f} minutes)")
print(f"Minimum: {minimum:.2f} seconds ({minimum / 60:.2f} minutes)")
print(f"Maximum: {maximum:.2f} seconds ({maximum / 60:.2f} minutes)")