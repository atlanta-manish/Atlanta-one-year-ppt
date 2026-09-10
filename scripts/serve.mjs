import http from 'node:http'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const entry = fileURLToPath(new URL('../OPEN_PRESENTATION.html', import.meta.url))
const server = http.createServer(async (request, response) => {
  if (request.url === '/favicon.ico') { response.writeHead(204); response.end(); return }
  try {
    const html = await fs.readFile(entry)
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
    response.end(html)
  } catch {
    response.writeHead(503, { 'Content-Type': 'text/plain' })
    response.end('Build the presentation first: npm install, then npm run build.')
  }
})
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Port 4173 is in use. Open OPEN_PRESENTATION.html directly instead.' : error.message)
  process.exitCode = 1
})
server.listen(4173, '127.0.0.1', () => console.log('Presentation: http://127.0.0.1:4173\nPress Ctrl+C to stop.'))
