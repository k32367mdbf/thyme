const config = require(`${process.cwd()}/dev/config`); global.config = config
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const spdy = require('spdy')
const chalk = require('chalk')

// Create server
const server = express()
if ( config.useHTTPS ) {
    const H2server = spdy.createServer(config.SSL, server)
    H2server.listen(config.nodeServerPort, async () => {
        console.log(chalk.cyan(`listening on port ${config.nodeServerPort}...`))
    })
}
else {
    server.listen(config.nodeServerPort, async () => {
        console.log(chalk.cyan(`listening on port ${config.nodeServerPort}...`))
    })
}

// Connect to database
require(`${config.backendDir}/connect`)

// Middlewares
server.use(express.static(config.productDir))           // static files folder
server.use(cookieParser())                              // dealing with cookies
server.use(bodyParser.json())                           // dealing with JSON post
server.use(bodyParser.urlencoded({ extended: true }))   // dealing with x-www-form-urlencoded post
server.use('/', require(`${config.backendDir}/router`)) // Routers
server.use('/api', require(`${config.backendDir}/api`)) // APIs
