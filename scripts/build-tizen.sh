#!/bin/bash

# Samsung TV Jukebox Karaoke - Tizen Build Script
# This script builds the Next.js app for Samsung Smart TV deployment

echo "🎤 Building Samsung TV Jukebox Karaoke for Tizen..."

# Set build target
export BUILD_TARGET=tizen
export NODE_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf tizen-build
mkdir -p tizen-build

# Build Next.js app
echo "⚡ Building Next.js application..."
npm run build

# Export static files
echo "📦 Exporting static files..."
npm run export

# Copy exported files to Tizen build directory
echo "📋 Copying files to Tizen build directory..."
cp -r out/* tizen-build/
cp config.xml tizen-build/
cp tizen-manifest.xml tizen-build/
cp index.html tizen-build/
cp icon.png tizen-build/ 2>/dev/null || echo "⚠️  icon.png not found, using default"
cp splash.png tizen-build/ 2>/dev/null || echo "⚠️  splash.png not found, using default"

# Create Tizen package
echo "📱 Creating Tizen package..."
cd tizen-build

# Check if Tizen CLI is available
if command -v tizen &> /dev/null; then
    echo "✅ Tizen CLI found, creating package..."
    tizen package -t wgt -s author
    echo "🎉 Tizen package created successfully!"
    echo "📁 Package location: tizen-build/SamsungTVJukeboxKaraoke.wgt"
else
    echo "❌ Tizen CLI not found. Please install Tizen Studio and CLI tools."
    echo "📖 Installation guide: https://developer.tizen.org/development/tizen-studio/download"
fi

cd ..

echo "✨ Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Install the .wgt file on your Samsung Smart TV"
echo "2. Use Tizen Studio to deploy and test"
echo "3. Submit to Samsung TV App Store for distribution"
