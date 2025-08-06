import csv

# Read the CSV file
with open('Book1.csv', 'r', encoding='utf-8') as file:
    reader = csv.reader(file)
    next(reader)  # Skip header
    
    # Start the JavaScript array
    js_code = "// Bike Data from Book1.csv\nconst bikeDataArray = [\n"
    
    # Convert each row to JavaScript object
    for row in reader:
        if len(row) >= 6:
            js_code += f"    {{ chassisNo: '{row[0]}', regNo: '{row[1]}', vehicleModel: '{row[2]}', receivedDate: '{row[3]}', city: '{row[4]}', batch: '{row[5]}', status: 'Received' }},\n"
    
    # Close the array
    js_code += "];\n\n// Export the data\nwindow.bikeDataArray = bikeDataArray;"
    
    # Write to file
    with open('bike-data.js', 'w', encoding='utf-8') as output_file:
        output_file.write(js_code)

print("Conversion completed! Check bike-data.js") 