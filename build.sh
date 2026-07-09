#!/bin/bash
set -e

echo "Building Pulse..."

# Build frontend
echo "Building frontend..."
npm run build

# Build Rust backend
echo "Building Rust backend..."
cd src-tauri
cargo build --release

echo ""
echo "Build complete!"
echo ""
echo "Binary: src-tauri/target/release/pulse"
echo ""
echo "Packages:"
ls -la target/release/bundle/deb/*.deb 2>/dev/null || true
ls -la target/release/bundle/rpm/*.rpm 2>/dev/null || true
ls -la target/release/bundle/appimage/*.AppImage 2>/dev/null || true
