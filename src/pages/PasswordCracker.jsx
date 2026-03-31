import { useState, useMemo, useCallback } from "react";
import {
  KeyRound, Search, Copy, Check, Download,
  ChevronDown, ChevronRight, Zap, Hash, FileText,
  AlertTriangle, Database, Wand2,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';
import { VariableBar } from '../components/ui/VariableBar.jsx';
import { useVariables } from '../lib/variables.js';

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const TABS = ["Hashcat", "John the Ripper", "Hash Identifier", "Wordlists", "Wordlist Builder", "Rule Engine"];

const HASHCAT_MODES = [
  { mode: 0, name: "MD5", example: "8743b52063cd84097a65d1633f5c74f5", cat: "Raw Hash" },
  { mode: 10, name: "md5($pass.$salt)", example: "3d83c8e717ff0e7ecfe187f088d69954:salt", cat: "Raw Hash, Salted" },
  { mode: 20, name: "md5($salt.$pass)", example: "57ab8499d08c59a7211c77f557bf9425:salt", cat: "Raw Hash, Salted" },
  { mode: 50, name: "HMAC-MD5", example: "c1a42fe539a07950f4e4288a3e35060c:salt", cat: "Raw Hash, Auth" },
  { mode: 100, name: "SHA1", example: "b89eaac7e61417341b710b727768294d0e6a277b", cat: "Raw Hash" },
  { mode: 110, name: "sha1($pass.$salt)", example: "2fc5a684737ce1bf7b3b239df432416e0dd07c5:salt", cat: "Raw Hash, Salted" },
  { mode: 150, name: "HMAC-SHA1", example: "c898896f3f70f61bc3fb19bef222aa860e5ea717:salt", cat: "Raw Hash, Auth" },
  { mode: 200, name: "MySQL323", example: "7196759210defdc0", cat: "Database" },
  { mode: 300, name: "MySQL4.1+", example: "*94BDCEBE19083CE2A1F959FD02F964C7AF4CFC29", cat: "Database" },
  { mode: 400, name: "phpass / WordPress", example: "$P$984478476IagS59wHZvyQMArzfx58u.", cat: "CMS" },
  { mode: 500, name: "md5crypt $1$", example: "$1$28772684$iEwNOgGugqO9.bIz5sk8k/", cat: "OS" },
  { mode: 900, name: "MD4", example: "afe04867ec7a3845145579a95f72eca7", cat: "Raw Hash" },
  { mode: 1000, name: "NTLM", example: "b4b9b02e6f09a9bd760f388b67351e2b", cat: "OS" },
  { mode: 1100, name: "Domain Cached Creds (DCC)", example: "4dd8965d1d476fa0d026722989a6b772:3060147285011", cat: "OS" },
  { mode: 1400, name: "SHA-256", example: "127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935", cat: "Raw Hash" },
  { mode: 1410, name: "sha256($pass.$salt)", example: "c73d08de890479518ed60cf670d17faa26a4a71f995c1dcc978165399401a6c4:salt", cat: "Raw Hash, Salted" },
  { mode: 1700, name: "SHA-512", example: "82a9dda829eb7f8ffe9fbe49e45d47d2dad9664fbb7adf72492e3c81ebd3e29134d9bc12212bf83c6840f10e8246b9db54a4859b7ccd0123d86e5872c1e5082f", cat: "Raw Hash" },
  { mode: 1800, name: "sha512crypt $6$", example: "$6$52450745$k5ka2p8bFuSmoVT1tzOyyuaREkkKBcCNqoDKzYiJL9RaE8yMnPgh2XzzF0NDrUhgrcLwg78xs1w5pJiypEdFX/", cat: "OS" },
  { mode: 2100, name: "Domain Cached Creds 2 (DCC2)", example: "$DCC2$10240#user#c4fd2935f....", cat: "OS" },
  { mode: 2500, name: "WPA-EAPOL-PBKDF2", example: "WPA*02*...", cat: "Network" },
  { mode: 2611, name: "vBulletin < v3.8.5", example: "16780ba78d2d5f02f3202901c1b6d975:568", cat: "CMS" },
  { mode: 3000, name: "LM", example: "299bd128c1101fd6", cat: "OS" },
  { mode: 3200, name: "bcrypt $2*$", example: "$2a$05$LhayLxezLhK1LhWvKxCyLOj0j1u.Kj0jZ0pEmm134uzrQlFvQJLF6", cat: "Raw Hash" },
  { mode: 3711, name: "MediaWiki B type", example: "$B$56668501$0ce106caa70af57fd525aeaf80ef2898", cat: "CMS" },
  { mode: 5500, name: "NetNTLMv1", example: "u4-netntlm::kNS:338d08f8e26de93300000000000000000...", cat: "Network" },
  { mode: 5600, name: "NetNTLMv2", example: "admin::N46iSNekpT:08ca45b7d7ea58ee:...", cat: "Network" },
  { mode: 6300, name: "AIX {smd5}", example: "{smd5}a]z.M....QC9Y0EKhJYE", cat: "OS" },
  { mode: 6900, name: "GOST R 34.11-94", example: "df226c2c6dcb1d995c0299db145b3...", cat: "Raw Hash" },
  { mode: 7300, name: "IPMI2 RAKP HMAC-SHA1", example: "b7c2d6f13a43dce2e44ad120a9cd...", cat: "Network" },
  { mode: 7400, name: "sha256crypt $5$", example: "$5$rounds=5000$GX7BopJZJxPc/KEK...", cat: "OS" },
  { mode: 7500, name: "Kerberos 5 AS-REQ Pre-Auth", example: "$krb5pa$23$user$realm$...", cat: "Network" },
  { mode: 7900, name: "Drupal7", example: "$S$C33783772bRXEx1aCsvY.dqgaaSu76XmYlEZHj9Y45Cc3kBX...", cat: "CMS" },
  { mode: 8900, name: "scrypt", example: "SCRYPT:1024:1:1:aG/...", cat: "Raw Hash" },
  { mode: 9400, name: "MS Office 2007", example: "$office$*2007*20*128*...", cat: "Documents" },
  { mode: 9500, name: "MS Office 2010", example: "$office$*2010*100000*128*...", cat: "Documents" },
  { mode: 9600, name: "MS Office 2013", example: "$office$*2013*100000*256*...", cat: "Documents" },
  { mode: 9700, name: "MS Office <= 2003 ($0/$1)", example: "$oldoffice$1*...", cat: "Documents" },
  { mode: 10300, name: "SAP CODVN H (PWDSALTEDHASH) iSSHA-1", example: "{x-issha, 1024}...", cat: "ERP" },
  { mode: 10500, name: "PDF 1.4-1.6 (Acrobat 5-8)", example: "$pdf$2*3*128*...", cat: "Documents" },
  { mode: 10900, name: "PBKDF2-HMAC-SHA256", example: "sha256:1000:base64salt:base64hash", cat: "Raw Hash" },
  { mode: 11300, name: "Bitcoin/Litecoin wallet.dat", example: "$bitcoin$96$...", cat: "Cryptocurrency" },
  { mode: 11600, name: "7-Zip", example: "$7z$0$14$0$...", cat: "Archives" },
  { mode: 12500, name: "RAR3-hp", example: "$RAR3$*0*...", cat: "Archives" },
  { mode: 13000, name: "RAR5", example: "$rar5$16$...", cat: "Archives" },
  { mode: 13100, name: "Kerberos 5 TGS-REP etype 23", example: "$krb5tgs$23$*user$realm$...", cat: "Network" },
  { mode: 13400, name: "KeePass 1/2 (AES/Twofish)", example: "$keepass$*2*...", cat: "Password Managers" },
  { mode: 13600, name: "WinZip", example: "$zip2$*0*3*0*...", cat: "Archives" },
  { mode: 15700, name: "Ethereum Wallet, PBKDF2-HMAC-SHA256", example: "$ethereum$p*...", cat: "Cryptocurrency" },
  { mode: 16400, name: "CRAM-MD5 Dovecot", example: "{CRAM-MD5}...", cat: "Email" },
  { mode: 16500, name: "JWT (JSON Web Token)", example: "eyJhbGciOiJIUzI1NiJ9.ey...", cat: "Network" },
  { mode: 16600, name: "Electrum Wallet (Salt-Type 1-3)", example: "$electrum$1$...", cat: "Cryptocurrency" },
  { mode: 17300, name: "SHA3-256", example: "a03ab19b866fc585b694ab718...", cat: "Raw Hash" },
  { mode: 17600, name: "SHA3-512", example: "e19e3bff5e6ae94c...", cat: "Raw Hash" },
  { mode: 18200, name: "Kerberos 5 AS-REP etype 23 (Kerberoasting)", example: "$krb5asrep$23$user@realm:...", cat: "Network" },
  { mode: 18300, name: "Apple File System (APFS)", example: "$fvde$1$...", cat: "OS" },
  { mode: 22000, name: "WPA-PBKDF2-PMKID+EAPOL", example: "WPA*01*...", cat: "Network" },
  { mode: 22100, name: "BitLocker", example: "$bitlocker$0$...", cat: "Full Disk Encryption" },
  { mode: 22500, name: "MultiBit Classic .key", example: "$multibit$1*...", cat: "Cryptocurrency" },
  { mode: 26600, name: "MetaMask Wallet", example: "$metamask$...", cat: "Cryptocurrency" },
  { mode: 27700, name: "MultiBit HD (scrypt)", example: "$multibit$2$...", cat: "Cryptocurrency" },
  { mode: 28200, name: "Exodus Wallet (scrypt)", example: "$exodus$...", cat: "Cryptocurrency" },
];

const HASHCAT_ATTACKS = [
  { mode: 0, name: "Straight", flag: "-a 0", desc: "Dictionary attack — tries every word in wordlist", example: "hashcat -m {MODE} -a 0 hash.txt wordlist.txt" },
  { mode: 1, name: "Combination", flag: "-a 1", desc: "Combines words from two wordlists (word1+word2)", example: "hashcat -m {MODE} -a 1 hash.txt wordlist1.txt wordlist2.txt" },
  { mode: 3, name: "Brute-Force / Mask", flag: "-a 3", desc: "Tries all combinations matching a mask pattern", example: "hashcat -m {MODE} -a 3 hash.txt ?u?l?l?l?l?d?d?d" },
  { mode: 6, name: "Hybrid Wordlist+Mask", flag: "-a 6", desc: "Appends mask pattern to each word in wordlist", example: "hashcat -m {MODE} -a 6 hash.txt wordlist.txt ?d?d?d?d" },
  { mode: 7, name: "Hybrid Mask+Wordlist", flag: "-a 7", desc: "Prepends mask pattern to each word in wordlist", example: "hashcat -m {MODE} -a 7 hash.txt ?d?d?d?d wordlist.txt" },
];

const HASHCAT_CHARSETS = [
  { mask: "?l", desc: "Lowercase a-z", set: "abcdefghijklmnopqrstuvwxyz" },
  { mask: "?u", desc: "Uppercase A-Z", set: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { mask: "?d", desc: "Digits 0-9", set: "0123456789" },
  { mask: "?s", desc: "Special chars", set: " !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~" },
  { mask: "?a", desc: "All printable (?l?u?d?s)", set: "All of the above" },
  { mask: "?b", desc: "Binary 0x00-0xff", set: "All 256 bytes" },
  { mask: "?h", desc: "Hex lowercase", set: "0123456789abcdef" },
  { mask: "?H", desc: "Hex uppercase", set: "0123456789ABCDEF" },
];

const JOHN_FORMATS = [
  { format: "Raw-MD5", flag: "--format=Raw-MD5", desc: "Plain MD5 hash" },
  { format: "Raw-SHA1", flag: "--format=Raw-SHA1", desc: "Plain SHA-1 hash" },
  { format: "Raw-SHA256", flag: "--format=Raw-SHA256", desc: "Plain SHA-256 hash" },
  { format: "Raw-SHA512", flag: "--format=Raw-SHA512", desc: "Plain SHA-512 hash" },
  { format: "bcrypt", flag: "--format=bcrypt", desc: "bcrypt hashes ($2a$, $2b$, $2y$)" },
  { format: "descrypt", flag: "--format=descrypt", desc: "Traditional DES crypt" },
  { format: "md5crypt", flag: "--format=md5crypt", desc: "MD5-based crypt ($1$)" },
  { format: "sha256crypt", flag: "--format=sha256crypt", desc: "SHA-256 crypt ($5$)" },
  { format: "sha512crypt", flag: "--format=sha512crypt", desc: "SHA-512 crypt ($6$)" },
  { format: "NT", flag: "--format=NT", desc: "Windows NTLM hashes" },
  { format: "LM", flag: "--format=LM", desc: "Windows LM hashes" },
  { format: "netntlmv2", flag: "--format=netntlmv2", desc: "NetNTLMv2 challenge/response" },
  { format: "mssql05", flag: "--format=mssql05", desc: "MS SQL Server 2005+" },
  { format: "mysql-sha1", flag: "--format=mysql-sha1", desc: "MySQL 4.1+" },
  { format: "oracle11", flag: "--format=oracle11", desc: "Oracle 11g" },
  { format: "PHPS", flag: "--format=PHPS", desc: "PHPS / md5(md5($p).$s)" },
  { format: "phpass", flag: "--format=phpass", desc: "PHPass (WordPress, Joomla)" },
  { format: "drupal7", flag: "--format=drupal7", desc: "Drupal 7" },
  { format: "wpapsk", flag: "--format=wpapsk", desc: "WPA/WPA2 PSK" },
  { format: "krb5tgs", flag: "--format=krb5tgs", desc: "Kerberos TGS-REP etype 23" },
  { format: "krb5asrep", flag: "--format=krb5asrep", desc: "Kerberos AS-REP etype 23" },
  { format: "KeePass", flag: "--format=KeePass", desc: "KeePass database" },
  { format: "ZIP", flag: "--format=ZIP", desc: "ZIP/PKZIP" },
  { format: "RAR5", flag: "--format=RAR5", desc: "RAR v5+" },
  { format: "7z", flag: "--format=7z", desc: "7-Zip archives" },
  { format: "PDF", flag: "--format=PDF", desc: "PDF documents" },
  { format: "SSH", flag: "--format=SSH", desc: "SSH private keys" },
  { format: "ethereum", flag: "--format=ethereum", desc: "Ethereum wallet" },
  { format: "electrum", flag: "--format=electrum", desc: "Electrum wallet" },
  { format: "BitLocker", flag: "--format=BitLocker", desc: "BitLocker volumes" },
];

const JOHN_COMMANDS = [
  { name: "Basic dictionary attack", cmd: "john --wordlist=rockyou.txt hashes.txt" },
  { name: "With format specification", cmd: "john --format=Raw-MD5 --wordlist=rockyou.txt hashes.txt" },
  { name: "With rules", cmd: "john --wordlist=rockyou.txt --rules=All hashes.txt" },
  { name: "Incremental (brute-force)", cmd: "john --incremental hashes.txt" },
  { name: "Incremental digits only", cmd: "john --incremental=Digits hashes.txt" },
  { name: "Show cracked passwords", cmd: "john --show hashes.txt" },
  { name: "Resume interrupted session", cmd: "john --restore=session_name" },
  { name: "Single crack mode", cmd: "john --single hashes.txt" },
  { name: "External mode", cmd: "john --external=Filter_Alpha hashes.txt" },
  { name: "Fork (multi-process)", cmd: "john --fork=4 --wordlist=rockyou.txt hashes.txt" },
  { name: "Mask attack", cmd: "john --mask=?u?l?l?l?d?d?d?d hashes.txt" },
  { name: "Pipe from stdin", cmd: "cat wordlist.txt | john --stdin --format=Raw-MD5 hashes.txt" },
  { name: "List supported formats", cmd: "john --list=formats" },
  { name: "List rules", cmd: "john --list=rules" },
  { name: "Benchmark all formats", cmd: "john --test" },
  { name: "Pot file lookup", cmd: "john --show --pot=john.pot hashes.txt" },
];

const JOHN_TOOLS = [
  { name: "ssh2john", cmd: "ssh2john id_rsa > ssh_hash.txt", desc: "SSH private key" },
  { name: "zip2john", cmd: "zip2john file.zip > zip_hash.txt", desc: "ZIP archives" },
  { name: "rar2john", cmd: "rar2john file.rar > rar_hash.txt", desc: "RAR archives" },
  { name: "pdf2john", cmd: "pdf2john file.pdf > pdf_hash.txt", desc: "PDF documents" },
  { name: "office2john", cmd: "office2john file.docx > office_hash.txt", desc: "MS Office files" },
  { name: "keepass2john", cmd: "keepass2john file.kdbx > kp_hash.txt", desc: "KeePass databases" },
  { name: "7z2john", cmd: "7z2john file.7z > 7z_hash.txt", desc: "7-Zip archives" },
  { name: "gpg2john", cmd: "gpg2john key.gpg > gpg_hash.txt", desc: "GPG/PGP keys" },
  { name: "wpapcap2john", cmd: "wpapcap2john capture.cap > wpa_hash.txt", desc: "WPA handshakes" },
  { name: "ethereum2john", cmd: "ethereum2john wallet.json > eth_hash.txt", desc: "Ethereum wallets" },
  { name: "bitcoin2john", cmd: "bitcoin2john wallet.dat > btc_hash.txt", desc: "Bitcoin wallets" },
  { name: "bitlocker2john", cmd: "bitlocker2john -i volume > bl_hash.txt", desc: "BitLocker volumes" },
  { name: "dmg2john", cmd: "dmg2john file.dmg > dmg_hash.txt", desc: "macOS DMG images" },
  { name: "vncpcap2john", cmd: "vncpcap2john capture.pcap > vnc_hash.txt", desc: "VNC traffic" },
  { name: "hccapx2john", cmd: "hccapx2john file.hccapx > wpa_hash.txt", desc: "Hashcat captures" },
  { name: "truecrypt2john", cmd: "truecrypt_volume2john volume > tc_hash.txt", desc: "TrueCrypt volumes" },
];

const HASH_PATTERNS = [
  { regex: /^[a-f0-9]{32}$/i, name: "MD5", hashcat: 0, john: "Raw-MD5" },
  { regex: /^[a-f0-9]{40}$/i, name: "SHA-1", hashcat: 100, john: "Raw-SHA1" },
  { regex: /^[a-f0-9]{64}$/i, name: "SHA-256", hashcat: 1400, john: "Raw-SHA256" },
  { regex: /^[a-f0-9]{128}$/i, name: "SHA-512", hashcat: 1700, john: "Raw-SHA512" },
  { regex: /^[a-f0-9]{16}$/i, name: "MySQL323 / LM (half)", hashcat: 200, john: "mysql" },
  { regex: /^\*[A-F0-9]{40}$/i, name: "MySQL 4.1+", hashcat: 300, john: "mysql-sha1" },
  { regex: /^\$1\$.{0,8}\$[./A-Za-z0-9]{22}$/, name: "md5crypt ($1$)", hashcat: 500, john: "md5crypt" },
  { regex: /^\$5\$(rounds=\d+\$)?[./A-Za-z0-9]+\$[./A-Za-z0-9]{43}$/, name: "sha256crypt ($5$)", hashcat: 7400, john: "sha256crypt" },
  { regex: /^\$6\$(rounds=\d+\$)?[./A-Za-z0-9]+\$[./A-Za-z0-9]{86}$/, name: "sha512crypt ($6$)", hashcat: 1800, john: "sha512crypt" },
  { regex: /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/, name: "bcrypt", hashcat: 3200, john: "bcrypt" },
  { regex: /^\$P\$[A-Za-z0-9./]{31}$/, name: "phpass (WordPress/Joomla)", hashcat: 400, john: "phpass" },
  { regex: /^\$S\$[A-Za-z0-9./]{52}$/, name: "Drupal 7", hashcat: 7900, john: "drupal7" },
  { regex: /^[a-f0-9]{32}:[a-f0-9]+$/i, name: "MD5 + salt (md5($pass.$salt) or similar)", hashcat: 10, john: "dynamic_0" },
  { regex: /^[a-f0-9]{40}:[a-f0-9]+$/i, name: "SHA-1 + salt", hashcat: 110, john: "dynamic_24" },
  { regex: /^[a-f0-9]{32}:.+$/i, name: "NTLM + username (DCC)", hashcat: 1100, john: "mscash" },
  { regex: /^\$DCC2\$/, name: "Domain Cached Credentials 2", hashcat: 2100, john: "mscash2" },
  { regex: /^\$krb5tgs\$23\$/, name: "Kerberos 5 TGS-REP (etype 23)", hashcat: 13100, john: "krb5tgs" },
  { regex: /^\$krb5asrep\$23\$/, name: "Kerberos 5 AS-REP (etype 23)", hashcat: 18200, john: "krb5asrep" },
  { regex: /^\$krb5pa\$23\$/, name: "Kerberos 5 Pre-Auth", hashcat: 7500, john: "krb5pa-md5" },
  { regex: /^[a-f0-9]{48}$/i, name: "Haval-192 / Tiger-192", hashcat: null, john: null },
  { regex: /^[a-f0-9]{96}$/i, name: "SHA-384", hashcat: 10800, john: "Raw-SHA384" },
  { regex: /^[a-f0-9]{56}$/i, name: "SHA-224 / Haval-224", hashcat: null, john: null },
  { regex: /^WPA\*/, name: "WPA-PBKDF2-PMKID+EAPOL", hashcat: 22000, john: "wpapsk" },
  { regex: /^\$office\$\*2007/, name: "MS Office 2007", hashcat: 9400, john: "Office" },
  { regex: /^\$office\$\*2010/, name: "MS Office 2010", hashcat: 9500, john: "Office" },
  { regex: /^\$office\$\*2013/, name: "MS Office 2013", hashcat: 9600, john: "Office" },
  { regex: /^\$keepass\$/, name: "KeePass", hashcat: 13400, john: "KeePass" },
  { regex: /^\$RAR3\$/, name: "RAR3", hashcat: 12500, john: "RAR" },
  { regex: /^\$rar5\$/, name: "RAR5", hashcat: 13000, john: "RAR5" },
  { regex: /^\$7z\$/, name: "7-Zip", hashcat: 11600, john: "7z" },
  { regex: /^\$pdf\$/, name: "PDF", hashcat: 10500, john: "PDF" },
  { regex: /^\$bitcoin\$/, name: "Bitcoin wallet", hashcat: 11300, john: "bitcoin" },
  { regex: /^\$ethereum\$/, name: "Ethereum wallet", hashcat: 15700, john: "ethereum" },
  { regex: /^\$bitlocker\$/, name: "BitLocker", hashcat: 22100, john: "BitLocker" },
  { regex: /^\$zip2\$/, name: "WinZip", hashcat: 13600, john: "ZIP" },
  { regex: /^{SSHA}/, name: "SSHA (LDAP)", hashcat: 111, john: "SSHA" },
  { regex: /^{SHA}/, name: "SHA (LDAP)", hashcat: null, john: "LDAP-SHA" },
  { regex: /^0x0100[a-f0-9]{48}$/i, name: "MSSQL 2005", hashcat: 132, john: "mssql05" },
  { regex: /^0x0200[a-f0-9]{128}$/i, name: "MSSQL 2012+", hashcat: 1731, john: "mssql12" },
  { regex: /^S:[A-F0-9]{60}$/i, name: "Oracle 11g", hashcat: 112, john: "oracle11" },
  { regex: /^[a-f0-9]{32}$/, name: "Could also be: MD4, NTLM, MD2, Haval-128, RIPEMD-128", hashcat: null, john: null },
];

const WORDLIST_DB = [
  { name: "rockyou.txt", size: "133 MB", entries: "14,344,391", desc: "The classic. Leaked from RockYou in 2009. The default for most attacks.", source: "https://github.com/brannondorsey/naive-hashcat/releases", cat: "General" },
  { name: "SecLists", size: "~800 MB", entries: "Varies", desc: "Daniel Miessler's massive collection. Passwords, usernames, URLs, fuzzing, everything.", source: "https://github.com/danielmiessler/SecLists", cat: "Collection" },
  { name: "CrackStation", size: "15 GB", entries: "1,493,677,782", desc: "Massive dictionary. Human-only version is 683 MB (63M entries).", source: "https://crackstation.net/crackstation-wordlist-password-cracking-dictionary.htm", cat: "General" },
  { name: "Weakpass", size: "Varies", entries: "Varies", desc: "Multiple curated wordlists by strength/purpose. Excellent resource.", source: "https://weakpass.com/wordlist", cat: "Collection" },
  { name: "Have I Been Pwned (HIBP)", size: "~12 GB", entries: "613,584,246", desc: "Pwned Passwords list. SHA-1 ordered by prevalence.", source: "https://haveibeenpwned.com/Passwords", cat: "Breach" },
  { name: "Kaonashi", size: "~4.2 GB", entries: "~185,000,000", desc: "Curated from multiple breach datasets, deduplicated and sorted.", source: "https://github.com/kaonashi-passwords/Kaonashi", cat: "Breach" },
  { name: "hashesorg2019", size: "~11 GB", entries: "~800,000,000", desc: "Massive compilation from hashes.org collections.", source: "https://hashes.org", cat: "Breach" },
  { name: "openwall", size: "Varies", entries: "Varies", desc: "Multilingual wordlists. Good for non-English targets.", source: "https://download.openwall.net/pub/wordlists/", cat: "General" },
  { name: "probable-v2", size: "~210 MB", entries: "~12,645,699", desc: "Most probable passwords, ordered by real-world frequency.", source: "https://github.com/berzerk0/Probable-Wordlists", cat: "General" },
  { name: "wifi-passwords", size: "~30 MB", entries: "~4,800,000", desc: "Common WiFi/router passwords. Default vendor passwords included.", source: "SecLists/Passwords/WiFi-WPA/", cat: "WiFi" },
  { name: "darkc0de.lst", size: "~18 MB", entries: "~1,707,657", desc: "Classic hacking wordlist from darkc0de forums.", source: "Kali Linux /usr/share/wordlists/", cat: "General" },
  { name: "10-million-password-list", size: "~100 MB", entries: "10,000,000", desc: "Top 10 million from aggregated breach data.", source: "SecLists/Passwords/", cat: "General" },
  { name: "xato-net-10-million-passwords", size: "~80 MB", entries: "~10,000,000", desc: "Mark Burnett's 10 million password compilation.", source: "https://xato.net/", cat: "General" },
  { name: "cirt-default-passwords", size: "~200 KB", entries: "~2,500", desc: "Default credentials for routers, IoT, network devices, applications.", source: "https://cirt.net/passwords", cat: "Default Creds" },
  { name: "default-creds-cheat-sheet", size: "~600 KB", entries: "~4,700", desc: "Categorized default credentials for 500+ products.", source: "https://github.com/ihebski/DefaultCreds-cheat-sheet", cat: "Default Creds" },
  { name: "common-corporate-passwords", size: "~5 MB", entries: "~500,000", desc: "Patterns seen in corporate environments (Season+Year, Company+123, etc).", source: "Custom/Curated", cat: "Corporate" },
  { name: "keyboard-walks", size: "~12 MB", entries: "~1,200,000", desc: "Keyboard walk patterns (qwerty, 1qaz2wsx, etc).", source: "https://github.com/hashcat/kwprocessor", cat: "Pattern" },
  { name: "hashcat-rules", size: "~5 MB", entries: "Varies", desc: "Best rule files: best64.rule, d3ad0ne.rule, dive.rule, OneRuleToRuleThemAll.", source: "Hashcat distribution", cat: "Rules" },
];

const BUILDER_TRANSFORMS = [
  { id: "numbers", label: "Append numbers (0-9, 00-99)", checked: true },
  { id: "years", label: "Append years (1990-2026)", checked: false },
  { id: "special", label: "Append special chars (!@#$%&*)", checked: false },
  { id: "leet", label: "Leet speak (a→4, e→3, o→0, s→5, t→7, i→1)", checked: true },
  { id: "upper", label: "UPPERCASE", checked: false },
  { id: "lower", label: "lowercase", checked: false },
  { id: "capitalize", label: "Capitalize first", checked: true },
  { id: "reverse", label: "Reverse", checked: false },
  { id: "double", label: "Double (wordword)", checked: false },
  { id: "prefix_nums", label: "Prepend numbers (1-999)", checked: false },
  { id: "toggle_case", label: "Toggle case (pAsSwOrD)", checked: false },
  { id: "suffix_common", label: "Suffix common patterns (123, 1234, 12345, !, 1!, 123!)", checked: false },
];

const RULE_PRESETS = [
  { name: "best64.rule", desc: "64 most effective rules. Fast, good hit rate. Start here.", rules: 64, path: "/usr/share/hashcat/rules/best64.rule" },
  { name: "d3ad0ne.rule", desc: "34,101 rules by d3ad0ne. Medium speed, great coverage.", rules: 34101, path: "/usr/share/hashcat/rules/d3ad0ne.rule" },
  { name: "dive.rule", desc: "99,092 rules. Deep dive, slower but thorough.", rules: 99092, path: "/usr/share/hashcat/rules/dive.rule" },
  { name: "OneRuleToRuleThemAll.rule", desc: "THE best single rule. 52,000 rules, optimized for real passwords.", rules: 52000, path: "https://github.com/NotSoSecure/password_cracking_rules" },
  { name: "rockyou-30000.rule", desc: "30,000 rules from rockyou patterns. Good general purpose.", rules: 30000, path: "/usr/share/hashcat/rules/rockyou-30000.rule" },
  { name: "Incisive-leetspeak.rule", desc: "Focused leet speak transformations.", rules: 800, path: "Custom" },
  { name: "toggles1-5.rule", desc: "Toggle case on positions 1-5. Good for short passwords.", rules: 31, path: "/usr/share/hashcat/rules/toggles1.rule - toggles5.rule" },
  { name: "unix-ninja-leetspeak.rule", desc: "Comprehensive leetspeak by unix-ninja.", rules: 2400, path: "Custom" },
];

const RULE_FUNCTIONS = [
  { func: ":", desc: "Do nothing (passthrough)", example: "password → password" },
  { func: "l", desc: "Lowercase all", example: "PASSWORD → password" },
  { func: "u", desc: "Uppercase all", example: "password → PASSWORD" },
  { func: "c", desc: "Capitalize first, lowercase rest", example: "password → Password" },
  { func: "C", desc: "Lowercase first, uppercase rest", example: "password → pASSWORD" },
  { func: "t", desc: "Toggle case of all", example: "PaSsWoRd → pAsSwOrD" },
  { func: "TN", desc: "Toggle case at position N", example: "T3: password → pasSwOrd" },
  { func: "r", desc: "Reverse", example: "password → drowssap" },
  { func: "d", desc: "Duplicate entire word", example: "password → passwordpassword" },
  { func: "f", desc: "Reflect (append reverse)", example: "password → passworddrowssap" },
  { func: "{", desc: "Rotate left", example: "password → asswordp" },
  { func: "}", desc: "Rotate right", example: "password → dpasswor" },
  { func: "$X", desc: "Append character X", example: "$1: password → password1" },
  { func: "^X", desc: "Prepend character X", example: "^1: password → 1password" },
  { func: "[", desc: "Delete first char", example: "password → assword" },
  { func: "]", desc: "Delete last char", example: "password → passwor" },
  { func: "DN", desc: "Delete char at position N", example: "D3: password → pasword" },
  { func: "iNX", desc: "Insert char X at position N", example: "i4!: password → pass!word" },
  { func: "oNX", desc: "Overwrite char at N with X", example: "o3$: password → pas$word" },
  { func: "'N", desc: "Truncate at position N", example: "'5: password → passw" },
  { func: "sXY", desc: "Replace all X with Y", example: "sa@: password → p@ssword" },
  { func: "@X", desc: "Purge all instances of X", example: "@s: password → paword" },
  { func: "xNM", desc: "Extract M chars starting at N", example: "x04: password → pass" },
  { func: "Z1", desc: "Duplicate last char", example: "password → passwordd" },
  { func: "q", desc: "Duplicate every char", example: "password → ppaasssswwoorrdd" },
  { func: "k", desc: "Swap first two chars", example: "password → apssword" },
  { func: "K", desc: "Swap last two chars", example: "password → passwrod" },
  { func: "*NM", desc: "Swap chars at N and M", example: "*34: password → passwrod" },
  { func: "E", desc: "Lowercase then title case (each word)", example: "pass word → Pass Word" },
];

function CopyBlock({ text, substitute: sub }) {
  const [copied, setCopied] = useState(false);
  const display = sub ? sub(text) : text;
  return (
    <div style={{ position: "relative", background: "#0B0F18", borderRadius: 8, padding: "10px 40px 10px 14px", border: "1px solid rgba(255,255,255,0.04)" }}>
      <code style={{ fontFamily: mono, fontSize: 11, color: "#CBD5E1", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>{display}</code>
      <button
        onClick={() => { navigator.clipboard.writeText(display); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
        style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", padding: 4 }}
      >
        {copied ? <Check size={13} style={{ color: "#6EE7B7" }} /> : <Copy size={13} style={{ color: "#4B5563" }} />}
      </button>
    </div>
  );
}

function TabButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
        fontFamily: heading, fontSize: 12, fontWeight: active ? 600 : 400,
        background: active ? "rgba(251,191,36,0.1)" : "transparent",
        color: active ? "#FBBF24" : "#6B7280",
        borderBottom: active ? "2px solid #FBBF24" : "2px solid transparent",
        transition: "all 100ms",
      }}
    >
      {label}
    </button>
  );
}

function Badge({ children, color = "#6B7280" }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 8, fontWeight: 700, color,
      background: `${color}18`, border: `1px solid ${color}33`,
      borderRadius: 999, padding: "2px 7px", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function HashcatTab({ substitute }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [attackMode, setAttackMode] = useState(0);
  const [hashFile, setHashFile] = useState("hash.txt");
  const [wordlist, setWordlist] = useState("rockyou.txt");
  const [mask, setMask] = useState("?u?l?l?l?l?d?d?d");
  const [extraFlags, setExtraFlags] = useState("");

  const cats = useMemo(() => ["All", ...new Set(HASHCAT_MODES.map((m) => m.cat))], []);
  const filtered = useMemo(() => {
    let f = HASHCAT_MODES;
    if (catFilter !== "All") f = f.filter((m) => m.cat === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter((m) => m.name.toLowerCase().includes(q) || String(m.mode).includes(q) || m.cat.toLowerCase().includes(q));
    }
    return f;
  }, [search, catFilter]);

  const buildCommand = () => {
    const m = selectedMode ?? 0;
    const atk = HASHCAT_ATTACKS.find((a) => a.mode === attackMode);
    let cmd = `hashcat -m ${m} ${atk?.flag || "-a 0"}`;
    if (extraFlags.trim()) cmd += ` ${extraFlags.trim()}`;
    cmd += ` ${hashFile}`;
    if (attackMode === 0 || attackMode === 6) cmd += ` ${wordlist}`;
    if (attackMode === 3 || attackMode === 6 || attackMode === 7) cmd += ` ${mask}`;
    if (attackMode === 7) cmd += ` ${wordlist}`;
    if (attackMode === 1) cmd += ` ${wordlist} wordlist2.txt`;
    return cmd;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Command builder */}
      <Card style={{ borderLeft: "3px solid #FBBF24" }}>
        <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Wand2 size={16} style={{ color: "#FBBF24" }} /> Command Builder
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Hash Mode (-m)</label>
            <select
              value={selectedMode ?? ""}
              onChange={(e) => setSelectedMode(e.target.value ? Number(e.target.value) : null)}
              style={{ background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 10px", fontFamily: mono, fontSize: 11, color: "#E2E8F0", outline: "none" }}
            >
              <option value="">Select mode...</option>
              {HASHCAT_MODES.map((m) => <option key={m.mode} value={m.mode}>{m.mode} - {m.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Attack Mode (-a)</label>
            <select
              value={attackMode}
              onChange={(e) => setAttackMode(Number(e.target.value))}
              style={{ background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 10px", fontFamily: mono, fontSize: 11, color: "#E2E8F0", outline: "none" }}
            >
              {HASHCAT_ATTACKS.map((a) => <option key={a.mode} value={a.mode}>{a.flag} — {a.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Hash File</label>
            <input value={hashFile} onChange={(e) => setHashFile(e.target.value)} style={{ background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 10px", fontFamily: mono, fontSize: 11, color: "#E2E8F0", outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>{attackMode === 3 ? "Mask" : "Wordlist"}</label>
            <input value={attackMode === 3 ? mask : wordlist} onChange={(e) => attackMode === 3 ? setMask(e.target.value) : setWordlist(e.target.value)} style={{ background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 10px", fontFamily: mono, fontSize: 11, color: "#E2E8F0", outline: "none" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
          <label style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Extra Flags (optional)</label>
          <input placeholder="-O -w 3 --force --potfile-disable" value={extraFlags} onChange={(e) => setExtraFlags(e.target.value)} style={{ background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 10px", fontFamily: mono, fontSize: 11, color: "#E2E8F0", outline: "none" }} />
        </div>
        <CopyBlock text={buildCommand()} substitute={substitute} />
      </Card>

      {/* Hash modes database */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modes by name, number, or category..."
              style={{ width: "100%", background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "9px 12px 9px 32px", fontFamily: mono, fontSize: 11, color: "#E2E8F0", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <span style={{ fontFamily: mono, fontSize: 10, color: "#4B5563" }}>{filtered.length} modes</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
          {cats.map((c) => (
            <button key={c} onClick={() => setCatFilter(c)} style={{
              padding: "4px 10px", borderRadius: 999, border: "none", cursor: "pointer",
              fontFamily: mono, fontSize: 9, fontWeight: 600,
              background: catFilter === c ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
              color: catFilter === c ? "#FBBF24" : "#6B7280",
            }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 400, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
          {filtered.map((m) => (
            <div key={m.mode}
              onClick={() => { setExpanded(expanded === m.mode ? null : m.mode); setSelectedMode(m.mode); }}
              style={{ background: expanded === m.mode ? "rgba(251,191,36,0.04)" : "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 14px", cursor: "pointer", transition: "background 100ms" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: "#FBBF24", minWidth: 50 }}>-m {m.mode}</span>
                <span style={{ fontFamily: heading, fontSize: 12, color: "#E2E8F0", flex: 1 }}>{m.name}</span>
                <Badge color="#6B7280">{m.cat}</Badge>
                {expanded === m.mode ? <ChevronDown size={12} style={{ color: "#4B5563" }} /> : <ChevronRight size={12} style={{ color: "#4B5563" }} />}
              </div>
              {expanded === m.mode && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>Example Hash</div>
                  <CopyBlock text={m.example} />
                  <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", marginTop: 10, marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>Quick Commands</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <CopyBlock text={`hashcat -m ${m.mode} -a 0 hash.txt rockyou.txt`} substitute={substitute} />
                    <CopyBlock text={`hashcat -m ${m.mode} -a 3 hash.txt ?a?a?a?a?a?a?a`} substitute={substitute} />
                    <CopyBlock text={`hashcat -m ${m.mode} -a 0 hash.txt rockyou.txt -r best64.rule`} substitute={substitute} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charsets & Attack modes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>Mask Charsets</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {HASHCAT_CHARSETS.map((c) => (
              <div key={c.mask} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <code style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: "#FBBF24", minWidth: 28 }}>{c.mask}</code>
                <span style={{ fontFamily: mono, fontSize: 11, color: "#CBD5E1", flex: 1 }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>Attack Modes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {HASHCAT_ATTACKS.map((a) => (
              <div key={a.mode} style={{ padding: "6px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <code style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: "#FBBF24" }}>{a.flag}</code>
                  <span style={{ fontFamily: heading, fontSize: 12, color: "#E2E8F0" }}>{a.name}</span>
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#6B7280", marginTop: 2 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function JohnTab({ substitute }) {
  const [searchFormats, setSearchFormats] = useState("");
  const filteredFormats = useMemo(() => {
    if (!searchFormats.trim()) return JOHN_FORMATS;
    const q = searchFormats.toLowerCase();
    return JOHN_FORMATS.filter((f) => f.format.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));
  }, [searchFormats]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Common commands */}
      <Card style={{ borderLeft: "3px solid #38BDF8" }}>
        <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Zap size={16} style={{ color: "#38BDF8" }} /> Common Commands
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {JOHN_COMMANDS.map((c, i) => (
            <div key={i}>
              <div style={{ fontFamily: heading, fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>{c.name}</div>
              <CopyBlock text={c.cmd} substitute={substitute} />
            </div>
          ))}
        </div>
      </Card>

      {/* *2john tools */}
      <Card style={{ borderLeft: "3px solid #A78BFA" }}>
        <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Hash size={16} style={{ color: "#A78BFA" }} /> *2john Hash Extractors
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, color: "#6B7280", marginBottom: 12 }}>
          Extract crackable hashes from files. Located in john/run/ or /usr/share/john/
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {JOHN_TOOLS.map((t, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: "#E2E8F0" }}>{t.name}</span>
                <Badge color="#A78BFA">{t.desc}</Badge>
              </div>
              <CopyBlock text={t.cmd} substitute={substitute} />
            </div>
          ))}
        </div>
      </Card>

      {/* Supported formats */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>Formats ({filteredFormats.length})</div>
          <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
            <input
              value={searchFormats} onChange={(e) => setSearchFormats(e.target.value)}
              placeholder="Search formats..."
              style={{ width: "100%", background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px 8px 32px", fontFamily: mono, fontSize: 11, color: "#E2E8F0", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {filteredFormats.map((f) => (
            <div key={f.format} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 6, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 8 }}>
              <code style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: "#38BDF8" }}>{f.format}</code>
              <span style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", flex: 1 }}>{f.desc}</span>
              <CopyButton text={substitute(f.flag)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HashIdentifierTab({ substitute }) {
  const [input, setInput] = useState("");
  const matches = useMemo(() => {
    const h = input.trim();
    if (!h) return [];
    return HASH_PATTERNS.filter((p) => p.regex.test(h));
  }, [input]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card style={{ borderLeft: "3px solid #34D399" }}>
        <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={16} style={{ color: "#34D399" }} /> Paste a Hash
        </div>
        <textarea
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your hash here to identify it..."
          rows={3}
          style={{ width: "100%", background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", fontFamily: mono, fontSize: 12, color: "#E2E8F0", outline: "none", resize: "vertical", boxSizing: "border-box" }}
        />
      </Card>

      {input.trim() && (
        <div>
          <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>
            {matches.length > 0 ? `${matches.length} Possible Match${matches.length !== 1 ? "es" : ""}` : "No Match Found"}
          </div>
          {matches.length === 0 && (
            <Card>
              <div style={{ fontFamily: mono, fontSize: 12, color: "#6B7280", textAlign: "center", padding: 20 }}>
                Could not identify the hash format. It may be an unusual or unsupported type.<br />
                Try checking the hash length ({input.trim().length} chars) and prefix manually.
              </div>
            </Card>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {matches.map((m, i) => (
              <Card key={i} style={{ borderLeft: `3px solid ${i === 0 ? "#34D399" : "#4B5563"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  {i === 0 && <Badge color="#34D399">Most Likely</Badge>}
                  <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>{m.name}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {m.hashcat !== null && (
                    <div>
                      <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Hashcat</div>
                      <CopyBlock text={`hashcat -m ${m.hashcat} -a 0 hash.txt rockyou.txt`} substitute={substitute} />
                    </div>
                  )}
                  {m.john && (
                    <div>
                      <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>John the Ripper</div>
                      <CopyBlock text={`john --format=${m.john} --wordlist=rockyou.txt hash.txt`} substitute={substitute} />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>Quick Reference: Hash Lengths</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {[
            { len: 16, types: "MySQL323, LM half" },
            { len: 32, types: "MD5, NTLM, MD4" },
            { len: 40, types: "SHA-1, MySQL 4.1+" },
            { len: 56, types: "SHA-224" },
            { len: 64, types: "SHA-256" },
            { len: 96, types: "SHA-384" },
            { len: 128, types: "SHA-512" },
            { len: 60, types: "bcrypt ($2a$)" },
          ].map((h) => (
            <div key={h.len} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 6, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: "#34D399" }}>{h.len}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280" }}>{h.types}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WordlistsTab({ substitute }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const cats = useMemo(() => ["All", ...new Set(WORDLIST_DB.map((w) => w.cat))], []);
  const filtered = useMemo(() => {
    let f = WORDLIST_DB;
    if (catFilter !== "All") f = f.filter((w) => w.cat === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter((w) => w.name.toLowerCase().includes(q) || w.desc.toLowerCase().includes(q));
    }
    return f;
  }, [search, catFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4B5563" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search wordlists..."
            style={{ width: "100%", background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "9px 12px 9px 32px", fontFamily: mono, fontSize: 11, color: "#E2E8F0", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <span style={{ fontFamily: mono, fontSize: 10, color: "#4B5563" }}>{filtered.length} lists</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {cats.map((c) => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: "4px 10px", borderRadius: 999, border: "none", cursor: "pointer",
            fontFamily: mono, fontSize: 9, fontWeight: 600,
            background: catFilter === c ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
            color: catFilter === c ? "#FBBF24" : "#6B7280",
          }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((w) => (
          <Card key={w.name}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <Database size={18} style={{ color: "#FBBF24", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>{w.name}</span>
                  <Badge color="#FBBF24">{w.cat}</Badge>
                  <span style={{ fontFamily: mono, fontSize: 10, color: "#6B7280", marginLeft: "auto" }}>{w.size} · {w.entries} entries</span>
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#9CA3AF", marginBottom: 8 }}>{w.desc}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <a href={w.source} target="_blank" rel="noopener noreferrer" style={{ fontFamily: mono, fontSize: 10, color: "#38BDF8", textDecoration: "none" }}>
                    {w.source.length > 60 ? w.source.slice(0, 60) + "..." : w.source}
                  </a>
                  <CopyButton text={substitute(w.source)} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WordlistBuilderTab() {
  const [baseWords, setBaseWords] = useState("password\nadmin\nletmein\nwelcome\ncompany");
  const [transforms, setTransforms] = useState(BUILDER_TRANSFORMS.map((t) => ({ ...t })));
  const [maxOutput, setMaxOutput] = useState(5000);
  const [output, setOutput] = useState([]);

  const toggleTransform = (id) => {
    setTransforms((prev) => prev.map((t) => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const generate = useCallback(() => {
    const words = baseWords.split("\n").map((w) => w.trim()).filter(Boolean);
    const activeTransforms = transforms.filter((t) => t.checked);
    const results = new Set(words);

    for (const word of words) {
      for (const t of activeTransforms) {
        switch (t.id) {
          case "numbers":
            for (let n = 0; n <= 99; n++) results.add(word + n);
            break;
          case "years":
            for (let y = 1990; y <= 2026; y++) results.add(word + y);
            break;
          case "special":
            for (const c of "!@#$%&*") { results.add(word + c); results.add(c + word); }
            break;
          case "leet": {
            const leets = { a: "4", e: "3", o: "0", s: "5", t: "7", i: "1", l: "1" };
            let leetWord = word;
            for (const [k, v] of Object.entries(leets)) leetWord = leetWord.replace(new RegExp(k, "gi"), v);
            if (leetWord !== word) results.add(leetWord);
            break;
          }
          case "upper": results.add(word.toUpperCase()); break;
          case "lower": results.add(word.toLowerCase()); break;
          case "capitalize": results.add(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()); break;
          case "reverse": results.add(word.split("").reverse().join("")); break;
          case "double": results.add(word + word); break;
          case "prefix_nums":
            for (let n = 1; n <= 999; n++) results.add(n + word);
            break;
          case "toggle_case":
            results.add(word.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(""));
            break;
          case "suffix_common":
            for (const s of ["123", "1234", "12345", "!", "1!", "123!", "1234!", "#1", "01", "007"]) results.add(word + s);
            break;
        }
      }
    }

    setOutput([...results].slice(0, maxOutput));
  }, [baseWords, transforms, maxOutput]);

  const downloadTxt = () => {
    const blob = new Blob([output.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "custom-wordlist.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ borderLeft: "3px solid #F472B6" }}>
          <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={16} style={{ color: "#F472B6" }} /> Base Words
          </div>
          <textarea value={baseWords} onChange={(e) => setBaseWords(e.target.value)} rows={8}
            placeholder="One word per line..."
            style={{ width: "100%", background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", fontFamily: mono, fontSize: 12, color: "#E2E8F0", outline: "none", resize: "vertical", boxSizing: "border-box" }}
          />
          <div style={{ fontFamily: mono, fontSize: 10, color: "#6B7280", marginTop: 6 }}>
            {baseWords.split("\n").filter((w) => w.trim()).length} base words
          </div>
        </Card>
        <Card>
          <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>Transforms</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {transforms.map((t) => (
              <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 0" }}>
                <input type="checkbox" checked={t.checked} onChange={() => toggleTransform(t.id)}
                  style={{ accentColor: "#FBBF24" }}
                />
                <span style={{ fontFamily: mono, fontSize: 11, color: t.checked ? "#E2E8F0" : "#6B7280" }}>{t.label}</span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Max output</label>
            <input type="number" value={maxOutput} onChange={(e) => setMaxOutput(Number(e.target.value) || 5000)}
              style={{ width: 80, background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 8px", fontFamily: mono, fontSize: 11, color: "#E2E8F0", outline: "none" }}
            />
          </div>
          <button onClick={generate} style={{
            marginTop: 12, width: "100%", padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #FBBF24, #F59E0B)", fontFamily: heading, fontSize: 13, fontWeight: 700, color: "#080C14",
          }}>
            Generate Wordlist
          </button>
        </Card>
      </div>

      {output.length > 0 && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>Output</span>
            <Badge color="#34D399">{output.length.toLocaleString()} words</Badge>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#6B7280" }}>~{(output.join("\n").length / 1024).toFixed(1)} KB</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button onClick={() => navigator.clipboard.writeText(output.join("\n"))} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)", fontFamily: mono, fontSize: 10, color: "#9CA3AF" }}>
                <Copy size={12} /> Copy All
              </button>
              <button onClick={downloadTxt} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: "rgba(251,191,36,0.1)", fontFamily: mono, fontSize: 10, color: "#FBBF24" }}>
                <Download size={12} /> Download .txt
              </button>
            </div>
          </div>
          <div style={{ background: "#0B0F18", borderRadius: 8, padding: 14, maxHeight: 300, overflowY: "auto", border: "1px solid rgba(255,255,255,0.04)", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
            <pre style={{ fontFamily: mono, fontSize: 10, color: "#CBD5E1", margin: 0, whiteSpace: "pre-wrap" }}>
              {output.slice(0, 500).join("\n")}
              {output.length > 500 && `\n\n... and ${output.length - 500} more`}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}

function RuleEngineTab({ substitute }) {
  const [customRule, setCustomRule] = useState("$1 $2 $3");
  const [testWord, setTestWord] = useState("password");

  const applyRule = (rule, word) => {
    let result = word;
    let i = 0;
    while (i < rule.length) {
      const c = rule[i];
      switch (c) {
        case ":": break;
        case "l": result = result.toLowerCase(); break;
        case "u": result = result.toUpperCase(); break;
        case "c": result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase(); break;
        case "C": result = result.charAt(0).toLowerCase() + result.slice(1).toUpperCase(); break;
        case "r": result = result.split("").reverse().join(""); break;
        case "d": result = result + result; break;
        case "f": result = result + result.split("").reverse().join(""); break;
        case "{": result = result.slice(1) + result[0]; break;
        case "}": result = result[result.length - 1] + result.slice(0, -1); break;
        case "[": result = result.slice(1); break;
        case "]": result = result.slice(0, -1); break;
        case "t": result = result.split("").map((ch) => ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()).join(""); break;
        case "q": result = result.split("").map((ch) => ch + ch).join(""); break;
        case "k": if (result.length >= 2) result = result[1] + result[0] + result.slice(2); break;
        case "K": if (result.length >= 2) result = result.slice(0, -2) + result[result.length - 1] + result[result.length - 2]; break;
        case "$": i++; if (i < rule.length) result += rule[i]; break;
        case "^": i++; if (i < rule.length) result = rule[i] + result; break;
        case "s": {
          i++;
          const from = rule[i] || "";
          i++;
          const to = rule[i] || "";
          result = result.split(from).join(to);
          break;
        }
        case "T": {
          i++;
          const pos = parseInt(rule[i], 10);
          if (!isNaN(pos) && pos < result.length) {
            const ch = result[pos];
            result = result.slice(0, pos) + (ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()) + result.slice(pos + 1);
          }
          break;
        }
        case "D": {
          i++;
          const pos = parseInt(rule[i], 10);
          if (!isNaN(pos) && pos < result.length) result = result.slice(0, pos) + result.slice(pos + 1);
          break;
        }
        case "Z": {
          i++;
          const n = parseInt(rule[i], 10) || 1;
          for (let j = 0; j < n; j++) result += result[result.length - 1] || "";
          break;
        }
        case "'": {
          i++;
          const pos = parseInt(rule[i], 10);
          if (!isNaN(pos)) result = result.slice(0, pos);
          break;
        }
        case " ": break;
        default: break;
      }
      i++;
    }
    return result;
  };

  const testResult = useMemo(() => {
    try { return applyRule(customRule, testWord); }
    catch { return "(error)"; }
  }, [customRule, testWord]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Rule tester */}
      <Card style={{ borderLeft: "3px solid #C084FC" }}>
        <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Wand2 size={16} style={{ color: "#C084FC" }} /> Rule Tester
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Input Word</label>
            <input value={testWord} onChange={(e) => setTestWord(e.target.value)}
              style={{ background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 10px", fontFamily: mono, fontSize: 12, color: "#E2E8F0", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Rule</label>
            <input value={customRule} onChange={(e) => setCustomRule(e.target.value)}
              style={{ background: "#0B0F18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 10px", fontFamily: mono, fontSize: 12, color: "#C084FC", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: mono, fontSize: 9, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Output</label>
            <div style={{ background: "#0B0F18", border: "1px solid rgba(110,231,183,0.15)", borderRadius: 6, padding: "8px 10px", fontFamily: mono, fontSize: 12, color: "#6EE7B7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{testResult}</span>
              <CopyButton text={substitute(testResult)} />
            </div>
          </div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, color: "#6B7280" }}>
          Try: <code style={{ color: "#C084FC", cursor: "pointer" }} onClick={() => setCustomRule("c $1")}>c $1</code>
          {" · "}
          <code style={{ color: "#C084FC", cursor: "pointer" }} onClick={() => setCustomRule("sa@ se3 si1")}>sa@ se3 si1</code>
          {" · "}
          <code style={{ color: "#C084FC", cursor: "pointer" }} onClick={() => setCustomRule("u d")}>u d</code>
          {" · "}
          <code style={{ color: "#C084FC", cursor: "pointer" }} onClick={() => setCustomRule("c $! $2 $0 $2 $5")}>c $! $2 $0 $2 $5</code>
          {" · "}
          <code style={{ color: "#C084FC", cursor: "pointer" }} onClick={() => setCustomRule("^# c r")}>^# c r</code>
        </div>
      </Card>

      {/* Rule presets */}
      <div>
        <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>Rule Files</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {RULE_PRESETS.map((r) => (
            <Card key={r.name}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{r.name}</span>
                <Badge color="#C084FC">{r.rules.toLocaleString()} rules</Badge>
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: "#9CA3AF", marginBottom: 8 }}>{r.desc}</div>
              <CopyBlock text={`hashcat -m 0 -a 0 hash.txt rockyou.txt -r ${r.path}`} substitute={substitute} />
            </Card>
          ))}
        </div>
      </div>

      {/* Rule functions reference */}
      <div>
        <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>Rule Functions Reference</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {RULE_FUNCTIONS.map((r) => (
            <div key={r.func} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" }}>
              <code style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: "#C084FC", minWidth: 28 }}>{r.func}</code>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#CBD5E1" }}>{r.desc}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#6B7280" }}>{r.example}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PasswordCracker() {
  const { vars, setVar, substitute } = useVariables();
  const [tab, setTab] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <KeyRound size={18} style={{ color: "#FBBF24" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontFamily: heading, fontSize: 22, fontWeight: 700, color: "#E2E8F0" }}>Password Cracking</h1>
          <p style={{ margin: 0, fontFamily: mono, fontSize: 11, color: "#6B7280" }}>Hashcat · John the Ripper · Hash ID · Wordlists · Rules</p>
        </div>
        <ToolHelp title="Password Cracking" description="Hash identifier, Hashcat/John command builder, wordlist generator, and rule engine for password cracking." steps={["Paste a hash in the identifier to detect its type","Use the command builder to generate Hashcat/John commands","Build custom wordlists with the wordlist tab","Test and create rules with the rule engine"]} tips={["Hash identifier matches against 100+ hash formats","Command builder includes common attack presets","The rule engine previews transforms in real-time"]} />
      </div>

      {/* Disclaimer */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
        background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)",
        borderRadius: 8,
      }}>
        <AlertTriangle size={14} style={{ color: "#FBBF24", flexShrink: 0 }} />
        <span style={{ fontFamily: mono, fontSize: 10, color: "#FBBF24" }}>
          For authorized penetration testing, CTF competitions, and security research only. Always have written permission.
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 4, flexWrap: "wrap" }}>
        {TABS.map((t, i) => <TabButton key={t} label={t} active={tab === i} onClick={() => setTab(i)} />)}
      </div>

      <VariableBar vars={vars} setVar={setVar} fields={['LHOST', 'TARGET', 'WORDLIST', 'USER']} />

      {/* Tab content */}
      {tab === 0 && <HashcatTab substitute={substitute} />}
      {tab === 1 && <JohnTab substitute={substitute} />}
      {tab === 2 && <HashIdentifierTab substitute={substitute} />}
      {tab === 3 && <WordlistsTab substitute={substitute} />}
      {tab === 4 && <WordlistBuilderTab />}
      {tab === 5 && <RuleEngineTab substitute={substitute} />}
    </div>
  );
}
