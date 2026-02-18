import re
import sys

# Read the file
with open('sections-data.js', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Dictionary of garbled patterns to emoji replacements
replacements = {
    # Results Management - use 📊 (bar chart)
    r'dY"\s*Results Management': '📊 Results Management',
    r'ðŸ"\s*Results Management': '📊 Results Management',
    
    # Common patterns found in the output
    r'dY"S\s+Session & Term Selection': '📅 Session & Term Selection',
    r'dY"\?\s+Detailed Marks': '📊 Detailed Marks',
    r"dY'\s+Teacher Comments": '💬 Teacher Comments',
    r'dY-",\?\s+Print Report': '🖨️ Print Report',
    r'dY"s\s+Historical Data': '📜 Historical Data',
    r'dY"\^\s+Progress Tracking': '📈 Progress Tracking',
    r'dY"\?\s+Term Filtering': '🔍 Term Filtering',
    r"dY'\s+Payment Records": '💳 Payment Records',
    r'dY"\.\s+Date Tracking': '📅 Date Tracking',
    r'dY",\s+Receipts': '🧾 Receipts',
    r"dY'\s+Fee Breakdown": '💰 Fee Breakdown',
    r'?\?\s+Due Dates': '⏰ Due Dates',
    r'dY"S\s+Outstanding Balance': '💵 Outstanding Balance',
    r'dY`\s+Personal Information': '👤 Personal Information',
    r'dY"\' Security': '🔒 Security',
    r'dY"\?\s+Account Details': '⚙️ Account Details',
    r'dY`\s+Total Students': '👥 Total Students',
    r'dY"s\s+Total Classes': '🏫 Total Classes',
    r'dY"-\s+Total Subjects': '📚 Total Subjects',
    r'o\.\s+Attendance Marked Today': '✅ Attendance Marked Today',
    r'dY"S\s+Results Entered': '📝 Results Entered',
    r'dY"\.\s+Upcoming Classes': '📅 Upcoming Classes',
    r'??\s+Advanced Dashboards': '📊 Advanced Dashboards',
    r'??\s+Performance Analytics': '📈 Performance Analytics',
    r'dY"<\s+Custom Reports': '📋 Custom Reports',
    r'dY"s\s+Course Management': '📖 Course Management',
    r'dY"\?\s+Assignment Submission': '📝 Assignment Submission',
    r"dY'\s+Discussion Forums": '💬 Discussion Forums',
    r'dY"1\s+Video Integration': '🎥 Video Integration',
}

# Also handle standalone garbled patterns
standalone_replacements = {
    r'dY"': '📊',  # Default replacement for dY"
    r'ðŸ"': '📊',  # Default replacement for ðŸ"
    r'dY`': '📋',
    r'dY`s': '📋',
    r'dY-': '📊',
    r'?': '📊',
    r'o': '✅',
}

# Apply replacements
original_content = content
for pattern, replacement in replacements.items():
    content = re.sub(pattern, replacement, content)

# Count changes
changes = 0
for pattern in replacements.keys():
    matches = len(re.findall(pattern, original_content))
    if matches > 0:
        changes += matches
        print(f"Replaced {matches} instances of: {pattern[:50]}")

# Write the file
with open('sections-data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nTotal replacements made: {changes}")
print("File updated successfully!")
