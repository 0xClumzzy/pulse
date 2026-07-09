#!/bin/bash
set -e

echo "Building Pulse..."

# Build frontend
echo "Building frontend..."
npm run build

# Build Rust backend
echo "Building Rust backend..."
cargo build --release --manifest-path src-tauri/Cargo.toml

echo ""
echo "Build complete!"
echo ""
echo "Binary: src-tauri/target/release/pulse"
echo ""
echo "Packages:"
ls -la src-tauri/target/release/bundle/deb/*.deb 2>/dev/null || true
ls -la src-tauri/target/release/bundle/rpm/*.rpm 2>/dev/null || true
