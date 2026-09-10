export function clampIndex(value, count) {
  return Math.max(0, Math.min(count - 1, Number.isFinite(value) ? Math.trunc(value) : 0))
}

export function nextIndex(index, count, loop = false) {
  return index + 1 < count ? index + 1 : loop ? 0 : index
}

export function indexFromHash(hash, slides) {
  const id = new URLSearchParams(hash.replace(/^#/, '')).get('slide')
  const index = slides.findIndex((slide) => slide.id === id)
  return index < 0 ? 0 : index
}

export function shouldIgnoreShortcut(target) {
  return Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'))
}
