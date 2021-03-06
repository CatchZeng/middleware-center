import {compose} from './compose'

export class MiddlewareCenter {
  constructor() {
    this._middlewares = []
    this._context = null
  }

  use(middleware) {
    if (typeof middleware != "function") {
      console.warn("middleware must be a function.")
      return null
    }
    this._middlewares.push(middleware)
    return this
  }

  handleRequest(context) {
    const fn = compose(this._middlewares)
    this._context = context
    return fn(this._context)
  }
}
