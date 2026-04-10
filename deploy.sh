#!/bin/bash

# PrctorFlow Production Deployment Script
# This script builds and deploys the application to Firebase Hosting

set -e

echo "🚀 Starting PrctorFlow Production Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}[1/5]${NC} Installing dependencies..."
npm ci --production=false
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

# Step 2: Run linting
echo -e "${BLUE}[2/5]${NC} Running ESLint..."
npm run lint 2>/dev/null || echo -e "${YELLOW}⚠ Lint warnings (non-blocking)${NC}"
echo ""

# Step 3: Build for production
echo -e "${BLUE}[3/5]${NC} Building for production..."
npm run build
BUILD_SIZE=$(du -sh dist | cut -f1)
echo -e "${GREEN}✓ Build complete (${BUILD_SIZE})${NC}\n"

# Step 4: Check Firebase tools
echo -e "${BLUE}[4/5]${NC} Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✓ Firebase CLI found${NC}\n"
else
    echo -e "${YELLOW}⚠ Firebase CLI not found. Installing globally...${NC}"
    npm install -g firebase-tools
fi

# Step 5: Deploy to Firebase Hosting
echo -e "${BLUE}[5/5]${NC} Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Your application is now live at:"
firebase hosting:sites:list 2>/dev/null | grep -A 1 "Hosting sites" || echo "Check your Firebase Console for the live URL"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Visit your live URL to verify the deployment"
echo "2. Check Firebase Console for any errors"
echo "3. Monitor performance via Cloud Logging"
