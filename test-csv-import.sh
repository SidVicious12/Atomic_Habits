#!/bin/bash

echo "🧪 Testing CSV Import for Atomic Habits"
echo "========================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if CSV file exists
CSV_FILE="/Users/SidVicious/Downloads/Daily's (Yearly) - Sheet1.csv"
if [ ! -f "$CSV_FILE" ]; then
    echo "❌ CSV file not found: $CSV_FILE"
    echo "   Please make sure your CSV file is in the Downloads folder"
    exit 1
fi

echo "✅ CSV file found: $(du -h "$CSV_FILE" | cut -f1) bytes"

# Run the import test
echo ""
echo "🚀 Running import analysis..."
node import-csv.js

echo ""
echo "🎯 Import analysis complete!"
echo ""
echo "📱 To actually import the data:"
echo "   1. Open your web browser"
echo "   2. Go to your Atomic Habits app"
echo "   3. Navigate to the Import page"
echo "   4. Upload your CSV file"
echo "   5. Click 'Import Your Daily's CSV'"
echo ""
echo "✨ Your charts should then display all your historical data!"