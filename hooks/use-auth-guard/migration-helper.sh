#!/bin/bash

# Auth Guard Migration Helper Script
# This script identifies files that contain manual auth error handling patterns

echo "🔍 Auth Guard Migration Analysis"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/omogbolahanakinsanya/Source/Repo/trifted-platform/frontend/trifted-app"

echo -e "${BLUE}Scanning for manual auth error handling patterns...${NC}\n"

# Find files with manual 401 checks
echo -e "${YELLOW}Files with manual 401 response checks:${NC}"
grep -r "responseCode.*401\|responseCode.*\"401\"" "$BASE_DIR/app/(authenticated)" --include="*.tsx" --include="*.ts" | head -20

echo -e "\n${YELLOW}Files with manual OnboardingMain redirects:${NC}"
grep -r "router.*push.*OnboardingMain\|router.*replace.*OnboardingMain" "$BASE_DIR/app/(authenticated)" --include="*.tsx" --include="*.ts" | head -15

echo -e "\n${YELLOW}Files with token-dependent API calls:${NC}"
grep -r "\.then.*res.*=>" "$BASE_DIR/app/(authenticated)" --include="*.tsx" --include="*.ts" | grep -c "\.tsx:" | head -10

echo -e "\n${GREEN}Priority files for migration (most auth checks):${NC}"
echo "Based on frequency of auth error patterns:"

# Count auth patterns per file
grep -r "responseCode.*401\|router.*OnboardingMain" "$BASE_DIR/app/(authenticated)" --include="*.tsx" -l | \
while read file; do
    count=$(grep "responseCode.*401\|router.*OnboardingMain" "$file" | wc -l)
    echo "$count $file"
done | sort -nr | head -10

echo -e "\n${BLUE}Recommended migration order:${NC}"
echo "1. 📧 EmailConfirmation.tsx (example provided)"
echo "2. 👤 profileMain.tsx (user dashboard)"
echo "3. ⭐ favorites.tsx (user favorites)"
echo "4. 📱 PhoneNumberConfirmation.tsx (phone verification)"
echo "5. 🔐 security.tsx (security settings)"

echo -e "\n${GREEN}✅ Auth Guard Implementation Complete!${NC}"
echo "📁 Location: hooks/use-auth-guard/"
echo "📖 Guide: hooks/use-auth-guard/README.md"
echo "🧪 Example: hooks/use-auth-guard/examples/EmailConfirmationRefactored.tsx"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Import auth guard hooks in your components"
echo "2. Replace manual 401 checks with useApiService"
echo "3. Wrap components with withAuthGuard HOC"
echo "4. Test authentication flows"
echo "5. Remove legacy auth handling code"

echo -e "\n${RED}Important:${NC}"
echo "• Test thoroughly in development environment"
echo "• Update one component at a time"
echo "• Verify auth flows work as expected"
echo "• Keep LoadingScreen component properly styled"
