import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
const root = path.resolve(process.env.TEST_ROOT || 'dist'),
  prefix = process.env.TEST_PREFIX || '/visual-learning-lab/',
  port = Number(process.env.TEST_PORT || 4175)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.csv': 'text/csv; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
}
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1')
  if (!url.pathname.startsWith(prefix)) {
    res.writeHead(404)
    res.end('Not found')
    return
  }
  const relative = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html'
  const file = path.resolve(root, relative)
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403)
    res.end()
    return
  }
  try {
    const data = await readFile(file)
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`Static deployment QA: http://127.0.0.1:${port}${prefix}`)
)
