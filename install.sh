#!/bin/bash
set -e

# Pulse Terminal - Install Script
# https://github.com/0xClumzzy/pulse

REPO="0xClumzzy/pulse"
INSTALL_DIR="$HOME/.local/bin"
BINARY_NAME="pulse"
VERSION="v0.1.0"

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
            DEB_ARCH="amd64"
            ;;
        aarch64|arm64)
            ARCH="aarch64"
            DEB_ARCH="arm64"
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
        echo -e "${YELLOW}For other platforms, download from: https://github.com/$REPO/releases${NC}"
        exit 1
    fi
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

download_and_install() {
    local deb_url="https://github.com/$REPO/releases/download/$VERSION/pulse_${VERSION#v}_${DEB_ARCH}.deb"
    
    echo -e "${BLUE}Downloading Pulse $VERSION...${NC}"
    
    # Create temp directory
    local tmp_dir=$(mktemp -d)
    trap "rm -rf $tmp_dir" EXIT
    
    # Download deb package
    curl -L -o "$tmp_dir/pulse.deb" "$deb_url" 2>/dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to download package${NC}"
        echo -e "${YELLOW}Please download manually from: https://github.com/$REPO/releases${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Installing Pulse...${NC}"
    
    # Install based on distro
    case $DISTRO in
        arch)
            # Arch can install debs with debtap or we can extract manually
            echo -e "${YELLOW}Arch Linux detected. Extracting binary...${NC}"
            mkdir -p "$INSTALL_DIR"
            dpkg-deb -x "$tmp_dir/pulse.deb" "$tmp_dir/extracted" 2>/dev/null || {
                # If dpkg-deb not available, try ar
                cd "$tmp_dir"
                ar x pulse.deb 2>/dev/null
                tar xf data.tar.* 2>/dev/null
                cd -
            }
            cp "$tmp_dir/extracted/usr/bin/pulse" "$INSTALL_DIR/$BINARY_NAME" 2>/dev/null || \
            cp "$tmp_dir/usr/bin/pulse" "$INSTALL_DIR/$BINARY_NAME" 2>/dev/null || {
                echo -e "${RED}Error: Could not extract binary${NC}"
                exit 1
            }
            chmod +x "$INSTALL_DIR/$BINARY_NAME"
            ;;
        debian|fedora)
            sudo dpkg -i "$tmp_dir/pulse.deb" 2>/dev/null || sudo apt-get install -f -y 2>/dev/null
            ;;
        *)
            echo -e "${YELLOW}Unknown distro. Extracting binary manually...${NC}"
            mkdir -p "$INSTALL_DIR"
            dpkg-deb -x "$tmp_dir/pulse.deb" "$tmp_dir/extracted" 2>/dev/null || {
                cd "$tmp_dir"
                ar x pulse.deb 2>/dev/null
                tar xf data.tar.* 2>/dev/null
                cd -
            }
            cp "$tmp_dir/extracted/usr/bin/pulse" "$INSTALL_DIR/$BINARY_NAME" 2>/dev/null || \
            cp "$tmp_dir/usr/bin/pulse" "$INSTALL_DIR/$BINARY_NAME" 2>/dev/null || {
                echo -e "${RED}Error: Could not extract binary${NC}"
                exit 1
            }
            chmod +x "$INSTALL_DIR/$BINARY_NAME"
            ;;
    esac
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
    
    echo -e "${GREEN}Latest version: $VERSION${NC}"
    echo ""
    
    download_and_install
    
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
