#!/bin/bash

# Configuration Validation Script
# This script checks if all required Google Services files are present
# Updated: July 4, 2025 - Reflects new organized configuration structure

echo "🔍 Validating Google Services Configuration..."
echo "📁 Using organized config structure: config/google-services/"

# Define file paths
IOS_PREVIEW="config/google-services/ios/GoogleService-Info-preview.plist"
IOS_PRODUCTION="config/google-services/ios/GoogleService-Info-production.plist"
ANDROID_PREVIEW="config/google-services/android/google-services-preview.json"
ANDROID_PRODUCTION="config/google-services/android/google-services-production.json"

# Check if files exist
files_missing=0

echo ""
echo "📱 iOS Configuration:"
if [ -f "$IOS_PREVIEW" ]; then
    echo "✅ Preview: $IOS_PREVIEW"
else
    echo "❌ Missing: $IOS_PREVIEW"
    files_missing=$((files_missing + 1))
fi

if [ -f "$IOS_PRODUCTION" ]; then
    echo "✅ Production: $IOS_PRODUCTION"
else
    echo "❌ Missing: $IOS_PRODUCTION"
    files_missing=$((files_missing + 1))
fi

echo ""
echo "🤖 Android Configuration:"
if [ -f "$ANDROID_PREVIEW" ]; then
    echo "✅ Preview: $ANDROID_PREVIEW"
else
    echo "❌ Missing: $ANDROID_PREVIEW"
    files_missing=$((files_missing + 1))
fi

if [ -f "$ANDROID_PRODUCTION" ]; then
    echo "✅ Production: $ANDROID_PRODUCTION"
else
    echo "❌ Missing: $ANDROID_PRODUCTION"
    files_missing=$((files_missing + 1))
fi

echo ""

# Check for placeholder content
echo "🔍 Checking for placeholder files..."
placeholder_count=0

if [ -f "$IOS_PREVIEW" ] && grep -q "PLACEHOLDER" "$IOS_PREVIEW"; then
    echo "⚠️  iOS Preview contains placeholder content"
    placeholder_count=$((placeholder_count + 1))
fi

if [ -f "$IOS_PRODUCTION" ] && grep -q "PLACEHOLDER" "$IOS_PRODUCTION"; then
    echo "⚠️  iOS Production contains placeholder content"
    placeholder_count=$((placeholder_count + 1))
fi

if [ -f "$ANDROID_PREVIEW" ] && grep -q "PLACEHOLDER" "$ANDROID_PREVIEW"; then
    echo "⚠️  Android Preview contains placeholder content"
    placeholder_count=$((placeholder_count + 1))
fi

if [ -f "$ANDROID_PRODUCTION" ] && grep -q "PLACEHOLDER" "$ANDROID_PRODUCTION"; then
    echo "⚠️  Android Production contains placeholder content"
    placeholder_count=$((placeholder_count + 1))
fi

echo ""
echo "📊 Summary:"
echo "   Files missing: $files_missing"
echo "   Placeholder files: $placeholder_count"

if [ $files_missing -eq 0 ] && [ $placeholder_count -eq 0 ]; then
    echo ""
    echo "🎉 All Google Services files are present and configured!"
    echo "   You're ready to build for both environments."
    echo ""
    echo "🚀 Next steps:"
    echo "   • npm start                    # Start development"
    echo "   • npm run build:android-dev    # Build Android development"
    echo "   • npm run build:ios-dev        # Build iOS development"
    exit 0
elif [ $files_missing -eq 0 ]; then
    echo ""
    echo "📝 Files are present but contain placeholder content."
    echo "   Replace placeholder files with actual Google Services files from Google Cloud Console."
    echo ""
    echo "📖 Documentation:"
    echo "   • docs/GOOGLE_SERVICES_SETUP.md    # Complete setup guide"
    echo "   • docs/CONFIG_STRUCTURE.md         # Configuration overview"
    echo "   • npm run config:help              # Quick help"
    exit 1
else
    echo ""
    echo "🚨 Missing configuration files!"
    echo "   Download the missing files from Google Cloud Console."
    echo ""
    echo "📖 Setup Instructions:"
    echo "   • docs/GOOGLE_SERVICES_SETUP.md    # Complete setup guide"
    echo "   • docs/DOCUMENTATION_INDEX.md      # All documentation"
    echo "   • npm run config:help              # Quick help"
    exit 1
fi
