import csv
import json

def convert_csv_to_js_array(csv_file, js_file):
    """Convert Book1.csv to bike-data.js format"""
    print("=== Converting Book1.csv to bike-data.js format ===")
    
    bikes = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                if 'Chassis No' in row and row['Chassis No'].strip():
                    bike = {
                        'chassisNo': row['Chassis No'].strip(),
                        'regNo': row['Reg No'].strip(),
                        'vehicleModel': row['Vehicle Model'].strip(),
                        'receivedDate': row['Received Date'].strip(),
                        'city': row['City'].strip(),
                        'batch': row['Batch'].strip(),
                        'status': 'Received'
                    }
                    bikes.append(bike)
        
        print(f"Total bikes processed: {len(bikes)}")
        
        # Create the JavaScript content
        js_content = f"""// Bike Data from Book1.csv - Complete inventory of {len(bikes)} bikes
const bikeDataArray = [
"""
        
        # Add each bike as a JavaScript object
        for i, bike in enumerate(bikes):
            js_content += f"""    {{ chassisNo: '{bike['chassisNo']}', regNo: '{bike['regNo']}', vehicleModel: '{bike['vehicleModel']}', receivedDate: '{bike['receivedDate']}', city: '{bike['city']}', batch: '{bike['batch']}', status: '{bike['status']}' }}{',' if i < len(bikes) - 1 else ''}
"""
        
        js_content += """];

// Export the data
window.bikeDataArray = bikeDataArray;
"""
        
        # Write to the JavaScript file
        with open(js_file, 'w', encoding='utf-8') as file:
            file.write(js_content)
        
        print(f"✅ Successfully updated {js_file} with {len(bikes)} bikes")
        print(f"📁 File size: {len(js_content)} characters")
        
        # Show summary by model
        models = {}
        cities = {}
        batches = {}
        
        for bike in bikes:
            models[bike['vehicleModel']] = models.get(bike['vehicleModel'], 0) + 1
            cities[bike['city']] = cities.get(bike['city'], 0) + 1
            batches[bike['batch']] = batches.get(bike['batch'], 0) + 1
        
        print("\n=== Summary ===")
        print("Vehicle Models:")
        for model, count in sorted(models.items()):
            print(f"  {model}: {count}")
        
        print("\nCities:")
        for city, count in sorted(cities.items()):
            print(f"  {city}: {count}")
        
        print("\nBatches:")
        for batch, count in sorted(batches.items()):
            print(f"  {batch}: {count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def create_backup(original_file):
    """Create a backup of the original file"""
    import shutil
    import os
    from datetime import datetime
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"{original_file}.backup_{timestamp}"
    
    try:
        shutil.copy2(original_file, backup_file)
        print(f"✅ Backup created: {backup_file}")
        return True
    except Exception as e:
        print(f"❌ Failed to create backup: {e}")
        return False

def main():
    """Main function to update bike data"""
    print("=== Bike Data Update Tool ===\n")
    
    csv_file = 'Book1.csv'
    js_file = 'bike-data.js'
    
    # Check if files exist
    import os
    if not os.path.exists(csv_file):
        print(f"❌ {csv_file} not found!")
        return
    
    if not os.path.exists(js_file):
        print(f"❌ {js_file} not found!")
        return
    
    print(f"📁 Source: {csv_file}")
    print(f"📁 Target: {js_file}")
    print()
    
    # Create backup
    print("Creating backup of original file...")
    if not create_backup(js_file):
        print("⚠️  Proceeding without backup...")
    print()
    
    # Convert and update
    success = convert_csv_to_js_array(csv_file, js_file)
    
    if success:
        print("\n🎉 Update completed successfully!")
        print("The bike inventory list now contains all bikes from Book1.csv")
    else:
        print("\n❌ Update failed!")

if __name__ == "__main__":
    main() 