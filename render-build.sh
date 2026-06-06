#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Install Puppeteer's Chrome instance
# This ensures that Chromium is available in the Render environment
npx puppeteer install

# Build the frontend
npm run build
