import fs from 'node:fs/promises'
import { build } from 'esbuild'

const result = await build({
  entryPoints: ['src/main.jsx'], bundle: true, minify: true, write: false,
  outfile: 'offline.js', format: 'iife', platform: 'browser', target: 'es2020',
  define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'inline',
})
const js = result.outputFiles.find(file => file.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script')
const css = result.outputFiles.find(file => file.path.endsWith('.css')).text.replace(/<\/style/gi, '<\\/style')
const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101621"><title>One year at Atlanta · Manish Kumar</title><link rel="icon" href="data:,"><style>${css}</style></head><body><div id="root"></div><noscript>Enable JavaScript or open the included PowerPoint file.</noscript><script>${js}</script></body></html>`
await fs.writeFile('OPEN_PRESENTATION.html', html)
console.log('Created OPEN_PRESENTATION.html. All presentation code is embedded for offline use.')
