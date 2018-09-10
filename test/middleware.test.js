import chai from 'chai';
const expect = chai.expect;
import MiddlewareCenter from "../src/index";

describe('MiddlewareCenter', function () {
    describe('#use(middleware) => ', function () {
        it('middleware must be function.', function () {
            const middleware = new MiddlewareCenter()
            const self = middleware.use(123)
            expect(self).to.be.equal(null)
            expect(middleware._middlewares.length).to.be.equal(0)
        })

        it('middleware must be saved when it is a function.', function () {
            const middleware = new MiddlewareCenter()
            const self = middleware.use(function () {
            })
            expect(self).to.be.equal(middleware)
            expect(middleware._middlewares.length).to.be.equal(1)
        })
    })

    describe('#handleRequest() => ', function () {
        it('next will be executed after handleRequest.', function () {
            const middleware = new MiddlewareCenter()
            let count = ""
            middleware.use(function (ctx, next) {
                console.log('middleware-1')
                count += "1"
                next()
            })
            middleware.use(function (ctx, next) {
                console.log('middleware-2')
                count += "2"
                next()
            })
            middleware.use(function (ctx, next) {
                console.log('middleware-3')
                count += "3"
                next()
            })
            middleware.use(function (ctx, next) {
                console.log('middleware-4')
                count += "4"
            })
            middleware.handleRequest()
            expect(count).to.be.equal("1234")
        })

        it('next will be ingored without next.', function () {
            const middleware = new MiddlewareCenter()
            let count = ""
            middleware.use(function (ctx, next) {
                console.log('middleware-1')
                count += "1"
            })
            middleware.use(function (ctx, next) {
                console.log('middleware-2')
                count += "2"
            })
            middleware.use(function (ctx, next) {
                console.log('middleware-3')
                count += "3"
            })
            middleware.use(function (ctx, next) {
                console.log('middleware-4')
                count += "4"
            })
            middleware.handleRequest()
            expect(count).to.be.equal("1")
        })

        it('ctx will be passed down.', function () {
            const middleware = new MiddlewareCenter()
            let count = ""
            middleware.use(function (ctx, next) {
                if (ctx.request.id === 'idr' && ctx.response.id === 'ids') {
                    count += "1"
                    next()
                }
            })
            middleware.use(function (ctx, next) {
                if (ctx.request.id === 'idr' && ctx.response.id === 'ids') {
                    count += "2"
                    next()
                }
            })
            middleware.use(function (ctx, next) {
                if (ctx.request.id === 'idr' && ctx.response.id === 'ids') {
                    count += "3"
                }
            })

            middleware.handleRequest({ request: { id: 'idr' }, response: { id: 'ids' } })
            expect(count).to.be.equal("123")
        })

        it('support async middleware.', function (done) {
            const middleware = new MiddlewareCenter()
            let count = ""

            var async1 = function () {
                return new Promise((resolve, reject) => {
                    setTimeout(function () {
                        resolve(1)
                    }, 10)
                })
            }

            var async2 = function (ctx, next) {
                return new Promise((resolve, reject) => {
                    setTimeout(function () {
                        resolve(2)
                    }, 12)
                })
            }

            var m1 = async function (ctx, next) {
                console.log('before m1')
                let result = await async1()
                count += "1"
                await next()
                console.log('after m1')
            }

            var m2 = async function (ctx, next) {
                console.log('before m2')
                let result = await async2()
                count += "2"
                console.log('after m2')
            }

            middleware.use(m1)
            middleware.use(m2)

            middleware.handleRequest()

            setTimeout(function () {
                expect(count).to.be.equal("12")
                done()
            }, 40)
        })
    })

    it('demo', function (done) {
        const middlewareCenter = new CustomMiddlewareCenter()
        middlewareCenter.handle('uploader')

        setTimeout(function () {
            expect(middlewareCenter.content).to.be.equal("upload content")
            done()
        }, 12)
    })
})

// MiddlewareCenter
class CustomMiddlewareCenter extends MiddlewareCenter {

    constructor() {
        super()
        this._middlewareMap = { 'uploader': [this.beforeUpload, this.startUplaod, this.finishUpload] }
        this.content = ""
    }

    handle(name) {
        let middlewares = this._middlewareMap[name]
        for (let middleware of middlewares) {
            this.use(middleware)
        }
        this.handleRequest(this)
    }

    // Middlewares

    async beforeUpload (ctx, next) {
        console.log('beforeUpload')
        ctx.content = await ctx.genContent()
        await next()
        console.log('after beforeUpload')
    }

    async startUplaod (ctx, next) {
        console.log('startUplaod')
        let result = await ctx.upload(ctx.content)
        await next()
        console.log('after startUplaod')
    }

    finishUpload (ctx, next) {
        console.log('finishUpload')
        //do something like notify listeners
        console.log('after finishUpload')
    }

    // Helpers
    genContent() {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve('upload content')
            }, 3)
        })
    }

    upload(content) {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve(true)
            }, 5)
        })
    }
}