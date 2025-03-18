'use strict'

const path = require('node:path')
const fs = require('node:fs') // Import the fs module
const pluginPath = path.join(__dirname, 'plugins')
const routePath = path.join(__dirname, 'routes')
const AutoLoad = require('@fastify/autoload')
const fastify = require('fastify');
const options = {}
const app = fastify();

module.exports = async function (fastify, opts) {
  if (!fs.existsSync(pluginPath)) {
    throw new Error(`Plugin path not found: ${pluginPath}`);
  }
  if (!fs.existsSync(routePath)) {
    throw new Error(`Route path not found: ${routePath}`);
  }

  fastify.register(AutoLoad, {
    dir: pluginPath,
    options: Object.assign({}, opts)
  })

  fastify.register(AutoLoad, {
    dir: routePath,
    options: Object.assign({}, opts),
    prefix: '/api'
  })
}

module.exports.options = options

const start = async () => {
  try {
    await app.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
    console.log(`Server running at http://localhost:${process.env.PORT || 3000}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
start().then()