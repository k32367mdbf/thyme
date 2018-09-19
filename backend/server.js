const config = require(`${process.cwd()}/dev/config`); global.config = config;
const session = require(`${config.backendDir}/session`)
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const spdy = require('spdy')



// 建立伺服器
const 伺服器 = express()
if (config.useHTTPS) {
    const H2伺服器 = spdy.createServer(config.SSL, 伺服器)
    H2伺服器.listen(config.port, async ()=>
    {
        console.log(`正在監聽 port ${config.port}...`)
    })
}
else {
    伺服器.listen(config.port, async ()=>
    {
        console.log(`正在監聽 port ${config.port}...`)
    })
}



// 連接資料庫
require(`${config.backendDir}/connect`)


// 設定中間件
伺服器.use(express.static(config.productDir))               // 設定前端資源目錄
伺服器.use(cookieParser())                                  // 處理Cookie
伺服器.use(session)                                         // 處理Session
伺服器.use(bodyParser.json())                               // 處理JSON
伺服器.use(bodyParser.urlencoded({ extended: true }))       // 處理x-www-form-urlencoded
伺服器.use('/', require(`${config.backendDir}/router`));    // Router
伺服器.use('/api', require(`${config.backendDir}/api`));    // API


