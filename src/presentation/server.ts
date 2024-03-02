import express, { Router } from 'express'
import path from 'path'
import compression from 'compression'
interface Options {
  port: number
  routes: Router
  public_path?: string
}

export class Server {
  public readonly app = express()
  private serverListener?: any
  private readonly port: number
  private readonly publicPath: string
  private readonly routes: Router

  constructor(options: Options) {
    const { port, routes, public_path = 'public' } = options
    this.port = port
    this.publicPath = public_path
    this.routes = routes
  }

  async start() {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true })) // x-www-form-encoded
    this.app.use(compression())

    // Public Folder
    this.app.use(express.static(this.publicPath))

    // Routes
    this.app.use(this.routes)

    // SPA
    this.app.get('*', (req, res) => {
      const indexPath = path.join(
        __dirname + `../../../${this.publicPath}/index.html`
      )
      res.sendFile(indexPath)
    })

    this.serverListener = this.app.listen(3000, () => {
      console.log('Server listening on http://localhost:3000')
    })
  }

  public close() {
    this.serverListener?.close()
  }
}
