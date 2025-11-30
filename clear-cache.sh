#!/bin/bash

echo "🧹 Clearing all caches for Trifted App..."

# Stop any running Metro bundler
echo "Stopping Metro bundler..."
pkill -f "expo start" || true

# Clear Metro bundler cache
echo "Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/haste-* || true
rm -rf $TMPDIR/react-* || true

# Clear npm/yarn cache
echo "Clearing npm cache..."
npm cache clean --force

# Clear node_modules and reinstall (optional but thorough)
# Uncomment if you want a complete clean
# echo "Removing node_modules..."
# rm -rf node_modules
# echo "Reinstalling dependencies..."
# npm install

# Clear watchman cache
echo "Clearing watchman cache..."
watchman watch-del-all 2>/dev/null || true

# Clear iOS build cache (if using iOS)
echo "Clearing iOS cache..."
rm -rf ios/build 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true

# Clear Android cache (if using Android)
echo "Clearing Android cache..."
cd android && ./gradlew clean 2>/dev/null && cd .. || true

# Clear Expo cache
echo "Clearing Expo cache..."
npx expo start --clear &

echo "✅ Cache cleared! Your app should reload with fresh translations."
echo "📱 Reload your app now (Cmd+R on iOS, R+R on Android)"

