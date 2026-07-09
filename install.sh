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

check_os() {
    OS=$(uname -s)
    if [ "$OS" != "Linux" ]; then
        echo -e "${RED}Error: This installer only supports Linux${NC}"
        echo -e "${YELLOW}For other platforms, download from: https://github.com/$REPO/releases${NC}"
        exit 1
    fi
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

detect_distro() {
    if command -v pacman &> /dev/null; then
        DISTRO="arch"
    elif command -v apt &> /dev/null; then
        DISTRO="debian"
    elif command -v dnf &> /dev/null; then
        DISTRO="fedora"
    else
        DISTRO="unknown"
    fi
}

check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    local missing_build=()
    local missing_runtime=()
    
    # Check build dependencies
    for cmd in curl git node npm rustc cargo; do
        if ! command -v $cmd &> /dev/null; then
            missing_build+=("$cmd")
        fi
    done
    
    if [ ${#missing_build[@]} -gt 0 ]; then
        echo -e "${YELLOW}Missing build tools: ${missing_build[*]}${NC}"
        echo ""
        
        case $DISTRO in
            arch)
                echo -e "  ${GREEN}sudo pacman -S --needed curl git nodejs npm rust${NC}"
                ;;
            debian)
                echo -e "  ${GREEN}sudo apt install curl git nodejs npm rustc cargo${NC}"
                ;;
            fedora)
                echo -e "  ${GREEN}sudo dnf install curl git nodejs npm rust cargo${NC}"
                ;;
            *)
                echo -e "  ${YELLOW}Please install: curl git node npm rust${NC}"
                ;;
        esac
        echo ""
        
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check runtime dependencies
    if ! ldconfig -p 2>/dev/null | grep -q libwebkit2gtk-4.1; then
        missing_runtime+=("libwebkit2gtk-4.1")
    fi
    
    if [ ${#missing_runtime[@]} -gt 0 ]; then
        echo -e "${YELLOW}Warning: Missing runtime libraries: ${missing_runtime[*]}${NC}"
        echo -e "${YELLOW}The app may not run without these.${NC}"
        echo ""
        
        case $DISTRO in
            arch)
                echo -e "  ${GREEN}sudo pacman -S webkit2gtk-4.1 gtk3 libayatana-appindicator3 librsvg openssl${NC}"
                ;;
            debian)
                echo -e "  ${GREEN}sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0 libayatana-appindicator3-1 librsvg2-0 libssl3${NC}"
                ;;
            fedora)
                echo -e "  ${GREEN}sudo dnf install webkit2gtk4.1 gtk3 libappindicator-gtk3 librsvg2 openssl${NC}"
                ;;
        esac
        echo ""
    fi
}

build_from_source() {
    echo -e "${BLUE}Building Pulse from source...${NC}"
    echo ""
    
    # Create temp directory
    local build_dir=$(mktemp -d)
    trap "rm -rf $build_dir" EXIT
    
    # Clone repo
    echo -e "${BLUE}Cloning repository...${NC}"
    git clone --depth 1 "https://github.com/$REPO.git" "$build_dir/pulse"
    cd "$build_dir/pulse"
    
    # Install frontend dependencies
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
    
    # Build the app
    echo -e "${BLUE}Building application...${NC}"
    npm run tauri build
    
    # Find the built binary
    local binary_path=$(find src-tauri/target/release -name "$BINARY_NAME" -type f ! -name "*.d" | head -1)
    
    if [ -z "$binary_path" ]; then
        echo -e "${RED}Error: Build succeeded but could not find binary${NC}"
        exit 1
    fi
    
    # Install
    echo -e "${BLUE}Installing to $INSTALL_DIR...${NC}"
    mkdir -p "$INSTALL_DIR"
    cp "$binary_path" "$INSTALL_DIR/$BINARY_NAME"
    chmod +x "$INSTALL_DIR/$BINARY_NAME"
}

check_path() {
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        echo -e "${YELLOW}Note: $INSTALL_DIR is not in your PATH${NC}"
        echo ""
        echo "  Add it to your shell profile:"
        echo -e "    ${GREEN}echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc${NC}"
        echo -e "    ${GREEN}source ~/.zshrc${NC}"
        echo ""
    fi
}

uninstall() {
    echo -e "${BLUE}Uninstalling Pulse...${NC}"
    
    # Try package manager uninstall first
    if command -v dpkg &> /dev/null; then
        sudo dpkg -r pulse 2>/dev/null || true
    fi
    
    # Remove binary if exists
    rm -f "$HOME/.local/bin/pulse"
    
    echo -e "${GREEN}✓ Pulse uninstalled${NC}"
    exit 0
}

main() {
    print_banner
    
    check_os
    check_arch
    detect_distro
    
    echo -e "${GREEN}Architecture: $ARCH${NC}"
    echo -e "${GREEN}Distribution: $DISTRO${NC}"
    echo ""
    
    check_dependencies
    build_from_source
    
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
            echo ""
            exit 0
            ;;
        --uninstall)
            uninstall
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
    shift
done

main
