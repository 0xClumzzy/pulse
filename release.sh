#!/bin/bash
set -e

VERSION=${1:-v0.1.0}

echo "Creating release $VERSION..."

# Update version in Cargo.toml
sed -i "s/^version = .*/version = \"${VERSION#v}\"/" src-tauri/Cargo.toml

# Update version in package.json
sed -i "s/\"version\": .*/\"version\": \"${VERSION#v}\"/" package.json

# Update version in tauri.conf.json
sed -i "s/\"version\": .*/\"version\": \"${VERSION#v}\"/" src-tauri/tauri.conf.json

# Commit changes
git add -A
git commit -m "Release $VERSION"

# Create tag
git tag -a $VERSION -m "Release $VERSION"

# Push
echo ""
echo "Pushing to origin..."
echo "Run: git push origin main && git push origin $VERSION"
echo ""
echo "Or run:"
echo "  git push origin main"
echo "  git push origin $VERSION"
