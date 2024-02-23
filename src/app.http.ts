import http from 'http'
import fs from 'fs'

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const htmlFile = fs.readFileSync('./public/index.html', 'utf8')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(htmlFile)
    return
  }

  if (req.url?.endsWith('.js')) {
    res.writeHead(200, { 'Content-Type': 'application/javascript' })
  }

  if (req.url?.endsWith('.css')) {
    res.writeHead(200, { 'Content-Type': 'text/css' })
  }

  try {
    const responseContent = fs.readFileSync(`./public${req.url}`, 'utf8')
    res.end(responseContent)
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end()
  }
})

server.listen(3000, () => {
  console.log('Server listening on port 3000')
})
