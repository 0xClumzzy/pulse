# Security Tools

Pulse includes built-in security tools for penetration testing and CTF workflows.

## Recon Sidebar

The Recon Sidebar automatically extracts security-relevant data from terminal output.

**Open:** `Ctrl+Shift+R` or Command Palette → "Toggle Security Recon"

### Extracted Data Types

| Type | Icon | Description |
|------|------|-------------|
| CVE | `!!` | Common Vulnerabilities and Exposures |
| Port | `:` | Open ports and services |
| URL | `@` | HTTP/HTTPS endpoints |
| Hostname | `#` | Domain names and hostnames |
| JWT | `$` | JSON Web Tokens |
| Base64 | `B` | Base64 encoded strings |
| Private IP | `*` | Internal network addresses |
| Credential | `!` | Passwords, keys, tokens |

### Features

- **Per-pane tracking** - Each split pane has its own recon data
- **Auto-refresh** - Updates every 5 seconds
- **Host key alerts** - Detects SSH host key changes
- **Session stats** - Credentials, commands, connections counts

## Payload Palette

Quick access to common penetration testing payloads.

**Open:** `Ctrl+Shift+P` or Command Palette → "Payloads" tab

### Payload Categories

#### Reverse Shells
- **Bash TCP/UDP** - Standard bash reverse shells
- **Python** - Python socket-based reverse shell
- **Perl** - Perl socket reverse shell
- **Netcat** - Including mkfifo variant without -e
- **PHP** - PHP fsockopen reverse shell
- **Ruby** - Ruby socket reverse shell
- **Groovy** - Java/Groovy ProcessBuilder reverse shell
- **PowerShell** - PowerShell TCP client reverse shell

#### LFI/SSTI
- `/etc/passwd` - Linux password file
- `/proc/self/environ` - Environment variables
- **Jinja2 SSTI** - Template injection test
- **Jinja2 RCE** - Remote code execution via config
- **Smarty SSTI** - Smarty template injection
- **FreeMarker SSTI** - FreeMarker template injection

#### Encoding
- Base64 encode/decode
- URL encode/decode

#### Enumeration
- **Nmap** - Full scan, all ports
- **Gobuster** - Directory and vhost brute force
- **Feroxbuster** - Recursive directory scan
- **Subfinder** - Subdomain enumeration
- **Nikto** - Web vulnerability scanner

#### Privilege Escalation
- **LinPEAS** - Linux privilege escalation enumerator
- **LinEnum** - Linux enumeration script
- **Find SUID** - Locate SUID binaries
- **Sudo -l** - Check sudo permissions

### Variable Substitution

Payloads support placeholder variables that are auto-filled:

| Variable | Description | Default |
|----------|-------------|---------|
| `{LHOST}` | Your IP address | `127.0.0.1` |
| `{LPORT}` | Listener port | `4444` |
| `{TARGET}` | Target hostname/IP | `example.com` |

Set these in the Payloads tab of the Command Palette.

### Encoding Modes

When pasting payloads, you can encode them:

| Mode | Description |
|------|-------------|
| Raw | No encoding (default) |
| Base64 | Base64 encode the payload |
| URL | URL encode the payload |

## Built-in Reverse Shell Handler

Pulse includes a built-in TCP listener for catching reverse shells.

**Open:** Command Palette → "Toggle Reverse Shell Handler"

### Usage

1. Open the Handler panel
2. Enter a port number (default: 4444)
3. Click "Start Listener"
4. Wait for incoming connections
5. View connected clients

### Features

- **Multiple listeners** - Run handlers on different ports simultaneously
- **Connection tracking** - See remote addresses and connection times
- **Start/stop control** - Manage individual handlers
- **Non-blocking** - Handlers don't block the UI

## Wordlists

Integrated wordlist paths for common tools:

| Wordlist | Path |
|----------|------|
| RockYou | `/usr/share/wordlists/rockyou.txt` |
| SecLists Web (common) | `/usr/share/seclists/Discovery/Web-Content/common.txt` |
| SecLists Web (medium) | `/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt` |
| SecLists Subdomains | `/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt` |
| SecLists Names | `/usr/share/seclists/Usernames/Names/names.txt` |
| Common Passwords | `/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-10000.txt` |
| Raft Small | `/usr/share/seclists/Discovery/Web-Content/raft-small-directories.txt` |
| Raft Medium | `/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt` |
| Raft Large | `/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt` |
| WFuzz General | `/usr/share/wfuzz/wordlist/general/common.txt` |
| API Endpoints | `/usr/share/seclists/Discovery/Web-Content/api-endpoints.txt` |
| GraphQL Paths | `/usr/share/seclists/Discovery/Web-Content/graphql.txt` |

Use the custom path input to add your own wordlists.

## Host Tagging

Mark tabs with environment labels for organization:

- **PROD** - Production systems (red)
- **STAGE** - Staging environments (orange)
- **DEV** - Development servers (green)
- **CTF** - Capture The Flag challenges (purple)
- **HOME** - Homelab services (cyan)

Access via Command Palette → "Tag as ..." commands.

## Tips

1. **Set LHOST first** - Configure your IP in the Payloads tab before generating payloads
2. **Use encoding** - Base64 encoding can bypass basic WAF rules
3. **Check recon regularly** - The sidebar auto-refreshes every 5 seconds
4. **Tag your tabs** - Use host tags to track which environment you're targeting
5. **Custom wordlists** - Add project-specific wordlists via the custom path input
