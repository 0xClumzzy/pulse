#!/bin/bash
set -e

# Pulse Terminal - Install Script
# https://github.com/0xClumzzy/pulse

REPO="0xClumzzy/pulse"
INSTALL_DIR="$HOME/.local/bin"
BINARY_NAME="pulse"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_banner() {
    echo -e "${BLUE}"
    echo "  ____             _   ____  "
    echo " |  _ \ __ _ _   _| | |  _ \ "
    echo " | |_) / _\` | | | | | | | |"
    echo " |  __/ (_| | |_| | | |_| |"
    echo " |_|   \__,_|\__,_|_|____/ "
    echo ""
    echo -e "${NC}"
    echo -e "  A blazing fast terminal emulator with glass aesthetics"
    echo ""
}

check_arch() {
    ARCH=$(uname -m)
    case $ARCH in
        x86_64|amd64)
            ARCH="x86_64"
            ;;
        aarch64|arm64)
            ARCH="aarch64"
            ;;
        *)
            echo -e "${RED}Error: Unsupported architecture $ARCH${NC}"
            exit 1
            ;;
    esac
}

check_os() {
    OS=$(uname -s)
    if [ "$OS" != "Linux" ]; then
        echo -e "${RED}Error: This installer only supports Linux${NC}"
        echo -e "${YELLOW}For macOS, download from: https://github.com/$REPO/releases${NC}"
        exit 1
    fi
}

check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    local missing=()
    
    # Check for required libraries
    if ! ldconfig -p 2>/dev/null | grep -q libwebkit2gtk-4.1; then
        missing+=("libwebkit2gtk-4.1")
    fi
    
    if ! ldconfig -p 2>/dev/null | grep -q libgtk-3; then
        missing+=("libgtk-3")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${YELLOW}Warning: Missing optional libraries: ${missing[*]}${NC}"
        echo -e "${YELLOW}Install them with your package manager for full functionality${NC}"
        echo ""
        
        # Try to detect distro and suggest install command
        if command -v pacman &> /dev/null; then
            echo -e "  ${GREEN}sudo pacman -S webkit2gtk-4.1 gtk3 libayatana-appindicator3 librsvg openssl${NC}"
        elif command -v apt &> /dev/null; then
            echo -e "  ${GREEN}sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0 libayatana-appindicator3-1 librsvg2-0 libssl3${NC}"
        elif command -v dnf &> /dev/null; then
            echo -e "  ${GREEN}sudo dnf install webkit2gtk4.1 gtk3 libappindicator-gtk3 librsvg2 openssl${NC}"
        fi
        echo ""
    fi
}

get_latest_version() {
    curl -sL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4
}

download_binary() {
    local version=$1
    local url="https://github.com/$REPO/releases/download/$version/pulse-${ARCH}-linux"
    
    echo -e "${BLUE}Downloading Pulse $version for $ARCH...${NC}"
    
    mkdir -p "$INSTALL_DIR"
    
    curl -L -o "$INSTALL_DIR/$BINARY_NAME" "$url" 2>/dev/null
    
    chmod +x "$INSTALL_DIR/$BINARY_NAME"
}

check_path() {
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        echo -e "${YELLOW}Note: $INSTALL_DIR is not in your PATH${NC}"
        echo ""
        echo "  Add it to your shell profile:"
        echo -e "    ${GREEN}echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc${NC}"
        echo -e "    ${GREEN}source ~/.bashrc${NC}"
        echo ""
    fi
}

main() {
    print_banner
    
    check_os
    check_arch
    
    local version=$(get_latest_version)
    
    if [ -z "$version" ]; then
        echo -e "${RED}Error: Could not fetch latest version${NC}"
        echo -e "${YELLOW}Falling back to v0.1.0${NC}"
        version="v0.1.0"
    fi
    
    echo -e "${GREEN}Latest version: $version${NC}"
    echo ""
    
    download_binary "$version"
    
    echo ""
    echo -e "${GREEN}✓ Pulse installed successfully!${NC}"
    echo ""
    
    check_path
    
    echo "  Run Pulse:"
    echo -e "    ${GREEN}pulse${NC}"
    echo ""
    echo "  Documentation:"
    echo -e "    ${BLUE}https://github.com/$REPO#readme${NC}"
    echo ""
}

# Parse arguments
while [ $# -gt 0 ]; do
    case $1 in
        --help|-h)
            print_banner
            echo "Usage: curl -sSL https://raw.githubusercontent.com/$REPO/main/install.sh | bash"
            echo ""
            echo "Options:"
            echo "  --help, -h     Show this help message"
            echo "  --uninstall    Remove Pulse from your system"
            echo "  --version      Install a specific version"
            echo ""
            exit 0
            ;;
        --uninstall)
            echo -e "${BLUE}Uninstalling Pulse...${NC}"
            rm -f "$HOME/.local/bin/pulse"
            echo -e "${GREEN}✓ Pulse uninstalled${NC}"
            exit 0
            ;;
        --version)
            shift
            VERSION="$1"
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
    shift
done

main
