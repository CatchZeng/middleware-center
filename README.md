## middleware-center

[![NPM version](https://img.shields.io/npm/v/middleware-center.svg)](https://www.npmjs.com/package/middleware-center)
![travis ci](https://travis-ci.org/CatchZeng/middleware-center.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/CatchZeng/middleware-center/badge.svg?branch=master)](https://coveralls.io/github/CatchZeng/middleware-center?branch=master)

middleware center for JavaScript, just like [koa](https://koajs.com) middleware.

## Installation

```javascript
npm i middleware-center
```

## Usage

### Sync method

```javascript
import MiddlewareCenter from "middleware-center"

const submiter = new MiddlewareCenter()

submiter.use(function validate(ctx, next) {
    console.log('before validate', ctx);
    if (ctx.name === 'zhh' && ctx.passwd === '123') {
        next()
        console.log('after validate');
    }
})

submiter.use(function request(ctx, next) {
    console.log('before request', ctx);
    next()
    console.log('after request');
})

submiter.use(function success(ctx, next) {
    console.log('on success', ctx);
})

submiter.handleRequest({name: 'zhh', passwd: '123'})

/* result
before validate { name: 'zhh', passwd: '123' }
before request { name: 'zhh', passwd: '123' }
on success { name: 'zhh', passwd: '123' }
after request
after validate
*/
```

### Async method

```javascript
import MiddlewareCenter from "middleware-center"

const middlewareCenter = new MiddlewareCenter()

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
        }, 20)
    })
}

var m1 = async function (ctx, next) {
    console.log('before m1')
    let result =  await async1()
    await next()
    console.log('after m1')
}

var m2 = async function (ctx, next) {
    console.log('before m2')
    let result = await async2()
    console.log('after m2')
}

middlewareCenter.use(m1)
middlewareCenter.use(m2)

middlewareCenter.handleRequest()

/* result
before m1
before m2
after m2
after m1
*/
```

### Custom MiddlewareCenter

```javascript
import MiddlewareCenter from "middleware-center"

const middlewareCenter = new CustomMiddlewareCenter()
middlewareCenter.handle('uploader')

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

/* result
beforeUpload
startUplaod
finishUpload
after finishUpload
after startUplaod
after beforeUpload
*/
```

## API

### use(middleware)

push a middleware. middleware must be function.

### handleRequest(context)

handle request with context. It will trigger next chain.