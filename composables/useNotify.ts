export const notify = (
  message: string,
  color: string = 'primary',
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'top',
  timeout: number = 3000
) => {
  const { $q } = useNuxtApp()

  $q.notify({
    message,
    color,
    position,
    timeout,
    group: false
  })
}

export const notifyError = (
  message: string,
  error?: unknown, // může být cokoliv (např. Error, string, apod.)
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'top',
  timeout: number = 5000
) => {
  // Vytáhne text chyby pokud existuje
  const errorText =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : ''

  // Zobrazí error notifikaci (přidá i text chyby, pokud existuje)
  notify(`${message}${errorText ? `: ${errorText}` : ''}`, 'negative', position, timeout)

  // Vypíše do konzole detail chyby
  if (error) {
    console.error(`❌ ${message}:`, error)
  }
}