const IS_TAURI = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export function useBackend() {
  const call = async (command, args = {}) => {
    if (IS_TAURI) {
      const { invoke } = await import('@tauri-apps/api/core')
      return invoke(command, args)
    }
    const res = await fetch(`/api/${command}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
    return res.json()
  }

  return { call, isTauri: IS_TAURI }
}
