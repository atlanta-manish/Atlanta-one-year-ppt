# One year at Atlanta

An 18-slide annual performance review for **Manish Kumar**, Vue Frontend Developer at **Atlanta Systems Private Limited**.

## Open immediately

1. Extract the complete ZIP.
2. Double-click **OPEN_PRESENTATION.html** in Chrome or Edge.
3. Press **F** for fullscreen.

The ready-to-open version embeds React, Motion and all styling. It works offline and does not require Node.js, an installation, a server, a login or an API key. On Windows, `START_PRESENTATION.bat` opens the same file. On macOS/Linux, open the HTML directly or run `sh START_PRESENTATION.command`.

`Atlanta-Year-One.pptx` is an editable PowerPoint companion. Browser controls and Motion animations belong to the HTML presentation. The PowerPoint copy contains the slides and speaker notes.

## Controls

| Key or control | Action |
| --- | --- |
| Right arrow, Space, Page Down | Next slide |
| Left arrow, Page Up | Previous slide |
| Home / End | First / last slide |
| F or double-click the slide | Fullscreen |
| P | Start or pause autoplay |
| G | Slide overview |
| N | Speaker notes |
| S | Reveal right-side thumbnails |
| B | Blank the screen or return |
| Escape | Close a panel or return from blank screen |
| ? | Keyboard help |
| Print button | Print every slide or save as PDF |

Hover at the right edge to reveal the thumbnail rail. It hides after **four seconds** and stays visible while hovered or keyboard-focused. Click a thumbnail to select a slide. Touch devices support horizontal swipes and a readable stacked layout.

Autoplay defaults to **30 seconds per slide**. Choose 10, 20, 30, 45 or 60 seconds. It pauses while notes/overview/help is open, the tab is hidden, or the screen is blank. It stops after the last slide unless the loop control is enabled. The first autoplay run is always started manually. Operating-system reduced-motion settings are respected.

For PDF export, choose landscape, no margins, turn off browser headers/footers, and enable background graphics. The print layout includes all 18 slides, without presentation controls. For the most predictable PowerPoint layout, use the included PPTX.

Speaker notes are visible in the browser when opened. Close the panel before returning to the audience view.

## Edit the React project

Use Node.js **22.12+**. Internet access is needed only to install development dependencies.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Then edit:

- `src/slides.js`: profile, slide content, speaker notes and attribution.
- `src/Slide.jsx`: the reusable slide layouts.
- `src/styles.css`: slide design, controls, mobile and print styling.
- `src/App.jsx`: navigation, Motion transitions, autoplay and slide rail.

To rebuild both the web distribution and the offline HTML:

```sh
npm run build
```

`dist/` contains the regular Vite production build. `OPEN_PRESENTATION.html` is the single-file offline version. The prebuilt PowerPoint is a companion export and does not automatically update when you edit the React source.

Optional local server, requiring Node.js but no dependency installation:

```sh
npm start
```

Open http://127.0.0.1:4173. You can always open the offline HTML directly.

## Content and attribution

The deck uses the personal account and three supplied project reviews. `CONTENT_NOTES.md` explains the scope of the metrics and attribution decisions. Slide notes include evidence references. No production revenue, usage, uptime or time-saving figures are invented. Project-wide repository counts are labeled separately from personal contribution evidence.

The presentation uses React's stable 19.3 release and Motion for React, the current Framer Motion library. Exact installed versions are pinned in `package.json` and `package-lock.json`.

Official references: [React versions](https://react.dev/versions), [Motion for React installation](https://motion.dev/docs/react-installation).
