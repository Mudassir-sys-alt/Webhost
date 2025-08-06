import csv
import re
from collections import defaultdict

def analyze_csv_data(csv_file):
    """Analyze the Book1.csv file in detail"""
    print("=== Book1.csv Analysis ===")
    
    chassis_numbers = []
    models = defaultdict(int)
    cities = defaultdict(int)
    batches = defaultdict(int)
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                if 'Chassis No' in row and row['Chassis No'].strip():
                    chassis_no = row['Chassis No'].strip()
                    chassis_numbers.append(chassis_no)
                    
                    # Count models
                    if 'Vehicle Model' in row:
                        models[row['Vehicle Model']] += 1
                    
                    # Count cities
                    if 'City' in row:
                        cities[row['City']] += 1
                    
                    # Count batches
                    if 'Batch' in row:
                        batches[row['Batch']] += 1
        
        print(f"Total bikes in Book1.csv: {len(chassis_numbers)}")
        print(f"Unique chassis numbers: {len(set(chassis_numbers))}")
        print()
        
        print("Vehicle Models:")
        for model, count in sorted(models.items()):
            print(f"  {model}: {count}")
        print()
        
        print("Cities:")
        for city, count in sorted(cities.items()):
            print(f"  {city}: {count}")
        print()
        
        print("Batches:")
        for batch, count in sorted(batches.items()):
            print(f"  {batch}: {count}")
        print()
        
        return set(chassis_numbers)
        
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return set()

def analyze_js_data(js_file):
    """Analyze the bike-data.js file in detail"""
    print("=== bike-data.js Analysis ===")
    
    chassis_numbers = []
    models = defaultdict(int)
    cities = defaultdict(int)
    batches = defaultdict(int)
    
    try:
        with open(js_file, 'r', encoding='utf-8') as file:
            content = file.read()
            
            # Extract all bike objects
            bike_pattern = r"\{[^}]*chassisNo:\s*'([^']+)'[^}]*regNo:\s*'([^']+)'[^}]*vehicleModel:\s*'([^']+)'[^}]*city:\s*'([^']+)'[^}]*batch:\s*'([^']+)'[^}]*\}"
            matches = re.findall(bike_pattern, content)
            
            for match in matches:
                chassis_no, reg_no, model, city, batch = match
                chassis_numbers.append(chassis_no)
                models[model] += 1
                cities[city] += 1
                batches[batch] += 1
            
            # Also check for generated bikes
            generated_pattern = r'MD9HAPXF4GR71\d{4}'
            generated_matches = re.findall(generated_pattern, content)
            print(f"Generated bikes found: {len(generated_matches)}")
        
        print(f"Total bikes in bike-data.js: {len(chassis_numbers)}")
        print(f"Unique chassis numbers: {len(set(chassis_numbers))}")
        print()
        
        print("Vehicle Models:")
        for model, count in sorted(models.items()):
            print(f"  {model}: {count}")
        print()
        
        print("Cities:")
        for city, count in sorted(cities.items()):
            print(f"  {city}: {count}")
        print()
        
        print("Batches:")
        for batch, count in sorted(batches.items()):
            print(f"  {batch}: {count}")
        print()
        
        return set(chassis_numbers)
        
    except Exception as e:
        print(f"Error reading JS file: {e}")
        return set()

def find_common_patterns(csv_chassis, js_chassis):
    """Find common patterns in chassis numbers"""
    print("=== Chassis Number Pattern Analysis ===")
    
    # Analyze CSV chassis patterns
    csv_patterns = defaultdict(int)
    for chassis in csv_chassis:
        if len(chassis) >= 8:
            prefix = chassis[:8]  # First 8 characters
            csv_patterns[prefix] += 1
    
    print("Top chassis prefixes in Book1.csv:")
    for prefix, count in sorted(csv_patterns.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {prefix}: {count}")
    print()
    
    # Analyze JS chassis patterns
    js_patterns = defaultdict(int)
    for chassis in js_chassis:
        if len(chassis) >= 8:
            prefix = chassis[:8]  # First 8 characters
            js_patterns[prefix] += 1
    
    print("Top chassis prefixes in bike-data.js:")
    for prefix, count in sorted(js_patterns.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {prefix}: {count}")
    print()
    
    # Find common prefixes
    common_prefixes = set(csv_patterns.keys()) & set(js_patterns.keys())
    print(f"Common chassis prefixes: {len(common_prefixes)}")
    for prefix in sorted(common_prefixes):
        print(f"  {prefix}: CSV={csv_patterns[prefix]}, JS={js_patterns[prefix]}")

def main():
    """Main analysis function"""
    print("=== Detailed Bike Number Analysis ===\n")
    
    # Analyze both files
    csv_chassis = analyze_csv_data('Book1.csv')
    print()
    js_chassis = analyze_js_data('bike-data.js')
    print()
    
    # Compare
    matching = csv_chassis & js_chassis
    only_csv = csv_chassis - js_chassis
    only_js = js_chassis - csv_chassis
    
    print("=== Comparison Summary ===")
    print(f"Matching chassis numbers: {len(matching)}")
    print(f"Only in Book1.csv: {len(only_csv)}")
    print(f"Only in bike-data.js: {len(only_js)}")
    print()
    
    if matching:
        print("Sample matching chassis numbers:")
        for chassis in list(matching)[:10]:
            print(f"  {chassis}")
        if len(matching) > 10:
            print(f"  ... and {len(matching) - 10} more")
        print()
    
    # Pattern analysis
    find_common_patterns(csv_chassis, js_chassis)
    
    print("\n=== Recommendations ===")
    if len(only_csv) > len(matching):
        print("❌ Most bike numbers from Book1.csv are missing from bike-data.js")
        print("   The bike-data.js file appears to contain only a small sample of the actual data")
        print("   Consider updating bike-data.js to include all bikes from Book1.csv")
    elif len(only_js) > 0:
        print("⚠️  bike-data.js contains bike numbers not in Book1.csv")
        print("   These may be test data or outdated entries")
    else:
        print("✅ All bike numbers match between the files")

if __name__ == "__main__":
    main() 