import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react'
import { slides, profile, sources } from './slides'
import { Slide } from './Slide'
import { clampIndex, indexFromHash, nextIndex, shouldIgnoreShortcut } from './navigation'

const HIDE_AFTER = 4000

function Icon({ name, size = 19 }) {
  const paths = {
    left: <path d="m14 6-6 6 6 6" />,
    right: <path d="m10 6 6 6-6 6" />,
    play: <path d="m8 5 11 7-11 7z" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    full: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
    exit: <path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5" />,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    notes: <><path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    keyboard: <><rect x="2" y="5" width="20" height="14" /><path d="M5 9h1m3 0h1m3 0h1m3 0h1M5 12h1m3 0h1m3 0h1m3 0h1M7 16h10" /></>,
    print: <><path d="M7 8V3h10v5M7 16H3V8h18v8h-4M7 13h10v8H7z" /></>,
    rail: <><path d="M3 3h18v18H3zM15 3v18M17 7h2m-2 5h2m-2 5h2" /></>,
    loop: <><path d="M4 9V7h14l-3-3m3 3-3 3M20 15v2H6l3 3m-3-3 3-3" /></>,
    blank: <rect x="3" y="4" width="18" height="16" />,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">{paths[name]}</svg>
}

function Button({ icon, label, children, ...props }) {
  return <button type="button" title={label} aria-label={label} {...props}>{icon && <Icon name={icon} />}{children}</button>
}

function Modal({ panel, onClose, children }) {
  const ref = useRef(null)
  useEffect(() => {
    if (panel && !ref.current.open) ref.current.showModal()
    if (!panel && ref.current.open) ref.current.close()
  }, [panel])
  return <dialog ref={ref} className={`modal panel-${panel || 'closed'}`} aria-labelledby="panel-title" onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === ref.current) onClose() }}>
    <div className="modal-surface">{children}</div>
  </dialog>
}

function Miniature({ slide, index }) {
  return <div className="miniature"><div className="miniature-canvas"><Slide slide={slide} index={index} miniature /></div></div>
}

export default function App() {
  const [index, setIndex] = useState(() => indexFromHash(window.location.hash, slides))
  const [direction, setDirection] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const [loop, setLoop] = useState(false)
  const [progress, setProgress] = useState(0)
  const [panel, setPanel] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [blackout, setBlackout] = useState(false)
  const [pageHidden, setPageHidden] = useState(document.hidden)
  const [railOpen, setRailOpen] = useState(true)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [message, setMessage] = useState('')
  const [canvas, setCanvas] = useState({ width: 1280, height: 720, scale: 1 })
  const [compact, setCompact] = useState(false)
  const hostRef = useRef(null)
  const railRef = useRef(null)
  const activeThumb = useRef(null)
  const indexRef = useRef(index)
  const elapsed = useRef(0)
  const railTimer = useRef(null)
  const controlsTimer = useRef(null)
  const railHovered = useRef(false)
  const touchStart = useRef(null)
  const reducedMotion = useReducedMotion()
  const current = slides[index]

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => {
      if (!document.activeElement?.closest('.controls, .app-header, .edge-trigger')) setControlsVisible(false)
    }, HIDE_AFTER)
  }, [])

  const scheduleRailHide = useCallback(() => {
    clearTimeout(railTimer.current)
    railTimer.current = setTimeout(() => {
      if (!railHovered.current && !railRef.current?.contains(document.activeElement)) setRailOpen(false)
    }, HIDE_AFTER)
  }, [])

  const showRail = useCallback(() => {
    setRailOpen(true)
    scheduleRailHide()
  }, [scheduleRailHide])

  const goTo = useCallback((target) => {
    const next = clampIndex(target, slides.length)
    setDirection(next >= indexRef.current ? 1 : -1)
    indexRef.current = next
    setIndex(next)
    elapsed.current = 0
    setProgress(0)
    const hash = '#slide=' + slides[next].id
    try { window.history.replaceState(null, '', hash) } catch { window.location.hash = hash }
    revealControls()
  }, [revealControls])

  const togglePlay = useCallback(() => {
    if (!playing && index === slides.length - 1 && progress >= 1) goTo(0)
    setPlaying(value => !value)
    revealControls()
  }, [playing, index, progress, goTo, revealControls])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen()
      else setMessage('Use your browser’s fullscreen option, or press F11.')
    } catch { setMessage('Fullscreen is unavailable here. Try your browser’s fullscreen option.') }
    revealControls()
  }, [revealControls])

  const openPanel = useCallback((name) => { setPanel(name); revealControls() }, [revealControls])
  const closePanel = useCallback(() => { setPanel(null); revealControls() }, [revealControls])
  const printDeck = () => { setPlaying(false); window.print() }

  useLayoutEffect(() => {
    const host = hostRef.current
    const resize = () => {
      const isCompact = window.innerWidth < 760
      setCompact(isCompact)
      const { width, height } = host.getBoundingClientRect()
      const scale = Math.max(0.1, Math.min(width / 1280, height / 720))
      setCanvas({ width: 1280 * scale, height: 720 * scale, scale })
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    window.addEventListener('resize', resize)
    return () => { observer.disconnect(); window.removeEventListener('resize', resize) }
  }, [])

  useEffect(() => {
    revealControls(); scheduleRailHide()
    const changeHash = () => goTo(indexFromHash(window.location.hash, slides))
    const visibility = () => setPageHidden(document.hidden)
    const full = () => setFullscreen(Boolean(document.fullscreenElement))
    window.addEventListener('hashchange', changeHash)
    document.addEventListener('visibilitychange', visibility)
    document.addEventListener('fullscreenchange', full)
    return () => {
      window.removeEventListener('hashchange', changeHash)
      document.removeEventListener('visibilitychange', visibility)
      document.removeEventListener('fullscreenchange', full)
      clearTimeout(railTimer.current); clearTimeout(controlsTimer.current)
    }
  }, [goTo, revealControls, scheduleRailHide])

  useEffect(() => {
    if (!playing || panel || pageHidden || blackout) return
    let previous = performance.now()
    let finished = false
    const timer = setInterval(() => {
      if (finished) return
      const now = performance.now()
      elapsed.current += now - previous
      previous = now
      setProgress(Math.min(elapsed.current / (seconds * 1000), 1))
      if (elapsed.current >= seconds * 1000) {
        finished = true
        if (index === slides.length - 1 && !loop) setPlaying(false)
        else goTo(nextIndex(index, slides.length, loop))
      }
    }, 100)
    return () => clearInterval(timer)
  }, [playing, panel, pageHidden, blackout, seconds, index, loop, goTo])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 5500)
    return () => clearTimeout(timer)
  }, [message])

  useEffect(() => {
    if (railOpen) activeThumb.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [railOpen, index])

  useEffect(() => {
    const keydown = event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return
      if (event.key === 'Escape') { setBlackout(false); closePanel(); return }
      if (panel || shouldIgnoreShortcut(event.target)) return
      const key = event.key.toLowerCase()
      if (key === ' ' && event.target?.closest?.('button, a')) return
      const actions = {
        arrowright: () => goTo(index + 1), pagedown: () => goTo(index + 1),
        ' ': () => goTo(index + 1), arrowleft: () => goTo(index - 1),
        pageup: () => goTo(index - 1), home: () => goTo(0), end: () => goTo(slides.length - 1),
        f: toggleFullscreen, p: togglePlay, g: () => openPanel('overview'),
        n: () => openPanel('notes'), '?': () => openPanel('help'),
        b: () => setBlackout(value => !value), s: showRail,
      }
      if (actions[key]) { event.preventDefault(); actions[key](); revealControls() }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [index, panel, goTo, toggleFullscreen, togglePlay, openPanel, closePanel, showRail, revealControls])

  const variants = {
    enter: direction => ({ opacity: 0, x: reducedMotion ? 0 : direction * 26 }),
    center: { opacity: 1, x: 0 },
    exit: direction => ({ opacity: 0, x: reducedMotion ? 0 : direction * -18 }),
  }
  const paused = playing && (panel || pageHidden || blackout)

  return <MotionConfig reducedMotion="user"><div className={`presentation-app ${controlsVisible || panel ? 'show-controls' : ''} ${compact ? 'compact' : ''}`} onPointerMove={revealControls} onFocusCapture={revealControls}>
    <header className="app-header">
      <div className="app-identity"><span className="wordmark">ATLANTA<span>SYSTEMS</span></span><span className="header-divider" /><span className="review-label">ONE YEAR / MANISH KUMAR</span></div>
      <div className="header-actions"><Button icon="keyboard" label="Keyboard shortcuts (?)" onClick={() => openPanel('help')} /><Button icon="grid" label="Slide overview (G)" onClick={() => openPanel('overview')} /><Button icon={fullscreen ? 'exit' : 'full'} label={fullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'} onClick={toggleFullscreen}><span>Fullscreen</span></Button></div>
    </header>

    <main className="stage-area" ref={hostRef} aria-label="Presentation stage">
      <div className="canvas-wrapper" style={compact ? undefined : { width: canvas.width, height: canvas.height }} onDoubleClick={toggleFullscreen}
        onTouchStart={event => { const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY } }}
        onTouchEnd={event => { const start = touchStart.current; touchStart.current = null; if (!start) return; const touch = event.changedTouches[0]; const dx = touch.clientX - start.x; const dy = touch.clientY - start.y; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) goTo(index + (dx < 0 ? 1 : -1)) }}>
        <div className="scaled-canvas" style={compact ? undefined : { transform: `scale(${canvas.scale})` }}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div className="active-slide" key={current.id} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}>
              <Slide slide={current} index={index} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>

    <button type="button" className="edge-trigger" title="Show slides (S)" aria-label="Show slide thumbnails (S)" aria-controls="slide-rail" aria-expanded={railOpen} onPointerEnter={showRail} onFocus={showRail} onClick={showRail}><Icon name="rail" size={17} /><span>SLIDES</span></button>
    <aside ref={railRef} id="slide-rail" className={`slide-rail ${railOpen ? 'is-open' : ''}`} aria-label="Slide thumbnails" inert={!railOpen} onPointerEnter={() => { railHovered.current = true; clearTimeout(railTimer.current); setRailOpen(true) }} onPointerLeave={() => { railHovered.current = false; scheduleRailHide() }} onFocusCapture={() => clearTimeout(railTimer.current)} onBlurCapture={scheduleRailHide}>
      <div className="rail-header"><span>SLIDES <em>{slides.length}</em></span><Button icon="close" label="Hide slide thumbnails" onClick={() => { railRef.current?.querySelector(':focus')?.blur(); setRailOpen(false) }} /></div>
      <ol className="thumbnail-list">{slides.map((slide, i) => <motion.li key={slide.id} whileHover={reducedMotion ? undefined : { scale: 1.035 }} transition={{ duration: 0.16 }}>
        <button type="button" ref={i === index ? activeThumb : undefined} className={`thumbnail-button ${i === index ? 'selected' : ''}`} aria-label={`Slide ${i + 1}: ${slide.label}`} aria-current={i === index ? 'page' : undefined} onClick={event => { goTo(i); if (event.detail > 0) event.currentTarget.blur(); if (compact) setRailOpen(false); else scheduleRailHide() }}>
          <Miniature slide={slide} index={i} /><span className="thumbnail-caption"><b>{String(i + 1).padStart(2, '0')}</b><span>{slide.label}</span></span>
        </button>
      </motion.li>)}</ol>
      <div className="rail-footnote">Hover here to keep slides visible</div>
    </aside>

    <footer className="controls" onPointerEnter={revealControls} onPointerLeave={revealControls}>
      <div className="slide-context"><span className="current-count">{String(index + 1).padStart(2, '0')}<span> / {slides.length}</span></span><div><strong>{current.section}</strong><span>{current.label}</span></div></div>
      <nav className="navigation-controls" aria-label="Presentation controls"><Button icon="left" label="Previous slide (Left arrow)" disabled={index === 0} onClick={() => goTo(index - 1)} /><Button className={`play-button ${playing ? 'active' : ''}`} icon={playing ? 'pause' : 'play'} label={playing ? 'Pause autoplay (P)' : 'Start autoplay (P)'} aria-pressed={playing} onClick={togglePlay}><span>{paused ? 'Paused' : playing ? 'Pause' : 'Autoplay'}</span></Button><Button icon="right" label="Next slide (Right arrow)" disabled={index === slides.length - 1} onClick={() => goTo(index + 1)} /><span className="control-divider" /><label className="speed-control"><span className="sr-only">Autoplay interval</span><select value={seconds} title="Autoplay interval per slide" onChange={event => { setSeconds(Number(event.target.value)); elapsed.current = 0; setProgress(0) }}>{[10, 20, 30, 45, 60].map(value => <option key={value} value={value}>{value}s</option>)}</select></label><Button className={loop ? 'active' : ''} icon="loop" label={loop ? 'Turn off autoplay loop' : 'Loop autoplay'} aria-pressed={loop} onClick={() => setLoop(value => !value)} /></nav>
      <div className="utility-controls"><Button icon="notes" label="Speaker notes (N)" onClick={() => openPanel('notes')} /><Button icon="print" label="Print all slides or save as PDF" onClick={printDeck} /><Button icon="blank" label="Blank screen (B); press B or Escape to return" onClick={() => setBlackout(true)} /></div>
      <div className="deck-progress" aria-hidden="true"><div style={{ width: `${((index + (playing || progress ? progress : 0)) / slides.length) * 100}%` }} /></div>
    </footer>

    <div className="sr-only" role="status" aria-live="polite">Slide {index + 1} of {slides.length}. {current.label}</div>
    {message && <div className="toast" role="status">{message}</div>}
    {blackout && <button className="blackout" aria-label="Return to presentation" onClick={() => setBlackout(false)}><span>Click or press B to return</span></button>}

    <Modal panel={panel} onClose={closePanel}>
      <div className="modal-heading"><div><p>{panel === 'overview' ? `${slides.length} SLIDES` : panel === 'notes' ? `SLIDE ${index + 1} OF ${slides.length}` : 'PRESENTATION CONTROLS'}</p><h2 id="panel-title">{panel === 'overview' ? 'Slide overview' : panel === 'notes' ? 'Speaker notes' : 'Keyboard shortcuts'}</h2></div><Button icon="close" label="Close panel (Escape)" onClick={closePanel} /></div>
      {panel === 'overview' && <div className="overview-grid">{slides.map((slide, i) => <button type="button" className={`overview-item ${i === index ? 'selected' : ''}`} key={slide.id} aria-label={`Go to slide ${i + 1}: ${slide.label}`} onClick={() => { goTo(i); closePanel() }}><Miniature slide={slide} index={i} /><span><b>{String(i + 1).padStart(2, '0')}</b>{slide.label}</span></button>)}</div>}
      {panel === 'notes' && <div className="speaker-notes"><h3>{current.label}</h3><p>{current.notes}</p><details><summary>Evidence and attribution</summary><ul>{current.source.map(source => <li key={source}>{sources[source]}</li>)}</ul></details><div className="notes-navigation"><Button icon="left" label="Previous slide and notes" disabled={index === 0} onClick={() => goTo(index - 1)}>Previous</Button><span>{index + 1} / {slides.length}</span><Button icon="right" label="Next slide and notes" disabled={index === slides.length - 1} onClick={() => goTo(index + 1)}>Next</Button></div></div>}
      {panel === 'help' && <div className="help-content"><dl>{[['→ / Space / Page Down', 'Next slide'], ['← / Page Up', 'Previous slide'], ['Home / End', 'First / last slide'], ['F', 'Toggle fullscreen'], ['P', 'Play / pause autoplay'], ['G', 'Slide overview'], ['N', 'Speaker notes'], ['S', 'Show the slide rail'], ['B', 'Blank screen / return'], ['Esc', 'Close a panel or return from blank screen']].map(([key, action]) => <div key={key}><dt><kbd>{key}</kbd></dt><dd>{action}</dd></div>)}</dl><p>Move your pointer to the right edge for slide thumbnails. The rail hides after four seconds and stays open while hovered or focused. Swipe horizontally on touch screens. Double-click the slide to toggle fullscreen.</p><p>Autoplay pauses while a panel is open, the screen is blank or the browser tab is hidden. It stops at the final slide unless looping is enabled.</p></div>}
    </Modal>
  </div><div className="print-deck" aria-hidden="true">{slides.map((slide, i) => <Slide key={slide.id} slide={slide} index={i} />)}</div></MotionConfig>
}
