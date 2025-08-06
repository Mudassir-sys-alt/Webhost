import csv
import re

def extract_chassis_numbers_from_csv(csv_file):
    """Extract chassis numbers from Book1.csv file"""
    chassis_numbers = set()
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                if 'Chassis No' in row and row['Chassis No'].strip():
                    chassis_numbers.add(row['Chassis No'].strip())
        return chassis_numbers
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return set()

def extract_chassis_numbers_from_js(js_file):
    """Extract chassis numbers from bike-data.js file"""
    chassis_numbers = set()
    try:
        with open(js_file, 'r', encoding='utf-8') as file:
            content = file.read()
            # Find all chassis numbers in the format: 'MD9HAPXF4GR710037'
            pattern = r"'([A-Z0-9]{17})'"
            matches = re.findall(pattern, content)
            chassis_numbers.update(matches)
            
            # Also find chassis numbers in the generated section
            generated_pattern = r'MD9HAPXF4GR71\d{4}'
            generated_matches = re.findall(generated_pattern, content)
            chassis_numbers.update(generated_matches)
            
        return chassis_numbers
    except Exception as e:
        print(f"Error reading JS file: {e}")
        return set()

def compare_bike_numbers():
    """Compare bike numbers between Book1.csv and bike-data.js"""
    print("=== Bike Number Comparison Report ===\n")
    
    # Extract chassis numbers from both files
    csv_chassis = extract_chassis_numbers_from_csv('Book1.csv')
    js_chassis = extract_chassis_numbers_from_js('bike-data.js')
    
    print(f"Total chassis numbers in Book1.csv: {len(csv_chassis)}")
    print(f"Total chassis numbers in bike-data.js: {len(js_chassis)}")
    print()
    
    # Find matching chassis numbers
    matching_chassis = csv_chassis.intersection(js_chassis)
    print(f"Number of matching chassis numbers: {len(matching_chassis)}")
    
    # Find chassis numbers only in CSV
    only_in_csv = csv_chassis - js_chassis
    print(f"Chassis numbers only in Book1.csv: {len(only_in_csv)}")
    
    # Find chassis numbers only in JS
    only_in_js = js_chassis - csv_chassis
    print(f"Chassis numbers only in bike-data.js: {len(only_in_js)}")
    print()
    
    # Calculate match percentage
    if csv_chassis:
        match_percentage = (len(matching_chassis) / len(csv_chassis)) * 100
        print(f"Match percentage: {match_percentage:.2f}%")
    print()
    
    # Show sample of mismatches
    if only_in_csv:
        print("Sample chassis numbers only in Book1.csv (first 10):")
        for chassis in list(only_in_csv)[:10]:
            print(f"  {chassis}")
        if len(only_in_csv) > 10:
            print(f"  ... and {len(only_in_csv) - 10} more")
        print()
    
    if only_in_js:
        print("Sample chassis numbers only in bike-data.js (first 10):")
        for chassis in list(only_in_js)[:10]:
            print(f"  {chassis}")
        if len(only_in_js) > 10:
            print(f"  ... and {len(only_in_js) - 10} more")
        print()
    
    # Summary
    print("=== Summary ===")
    if len(matching_chassis) == len(csv_chassis) and len(only_in_js) == 0:
        print("✅ All bike numbers from Book1.csv are present in bike-data.js")
        print("✅ No extra bike numbers in bike-data.js")
        print("✅ Perfect match!")
    elif len(matching_chassis) == len(csv_chassis):
        print("✅ All bike numbers from Book1.csv are present in bike-data.js")
        print("⚠️  bike-data.js contains additional bike numbers not in Book1.csv")
    elif len(matching_chassis) > 0:
        print("⚠️  Partial match - some bike numbers are missing or extra")
    else:
        print("❌ No matching bike numbers found between the files")

if __name__ == "__main__":
    compare_bike_numbers() 