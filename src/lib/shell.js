let Command = null;

async function getCommand() {
  if (Command) return Command;
  try {
    const mod = await import('@tauri-apps/plugin-shell');
    Command = mod.Command;
    return Command;
  } catch {
    return null;
  }
}

export async function runCommand(program, args = []) {
  const Cmd = await getCommand();
  if (!Cmd) {
    return {
      success: false,
      stdout: '',
      stderr: 'Shell plugin not available (running in browser?)',
      code: -1,
    };
  }

  try {
    const cmd = Cmd.create(program, args);
    const output = await cmd.execute();
    return {
      success: output.code === 0,
      stdout: output.stdout || '',
      stderr: output.stderr || '',
      code: output.code,
    };
  } catch (err) {
    return {
      success: false,
      stdout: '',
      stderr: err.message || String(err),
      code: -1,
    };
  }
}

export async function spawnCommand(program, args = [], { onStdout, onStderr, onClose } = {}) {
  const Cmd = await getCommand();
  if (!Cmd) {
    onStderr?.('Shell plugin not available');
    onClose?.(-1);
    return null;
  }

  try {
    const cmd = Cmd.create(program, args);
    cmd.on('close', (data) => onClose?.(data.code));
    cmd.on('error', (err) => onStderr?.(err));
    cmd.stdout.on('data', (line) => onStdout?.(line));
    cmd.stderr.on('data', (line) => onStderr?.(line));
    const child = await cmd.spawn();
    return child;
  } catch (err) {
    onStderr?.(err.message || String(err));
    onClose?.(-1);
    return null;
  }
}

export function isShellAvailable() {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}
