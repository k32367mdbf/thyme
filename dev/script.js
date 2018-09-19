#!/usr/bin/env node

const path = require('path')
const fse = require('fs-extra')
const spawn = require('cross-spawn')
const chalk = require('chalk')
const config = require(`${process.cwd()}/dev/config`)

const 參數 = process.argv

// 指令表
const 建構 = 
{
    html: (()=>
    {
        if(參數[3])
        {
            const 發布資源 = `${config.productDir}/${參數[3].slice(9)}`
            fse.ensureDirSync(path.parse(發布資源).dir)
            return `html-minifier --collapse-whitespace -o ${發布資源} ${參數[3]}`
        }
        else 
            return `html-minifier --input-dir ${config.frontendDir} --output-dir ${config.productDir} --file-ext html --collapse-whitespace`
    })(),
    css: (()=>
    {
        if(參數[3])
        {
            const 發布資源 = `${config.productDir}/${參數[3].slice(9)}`
            fse.ensureDirSync(path.parse(發布資源).dir)
            // return `node-sass ${參數[3]} -o ${path.parse(發布資源).dir} -q && postcss ${發布資源.slice(0,-5)}.css -u autoprefixer -r`
            return `node-sass ${參數[3]} -o ${path.parse(發布資源).dir} -q`
        }
        else
            // return `node-sass ${config.frontendDir} -o ${config.productDir} -q && postcss ${config.productDir}**/*.css -u autoprefixer -r`
            return `node-sass ${config.frontendDir} -o ${config.productDir} -q`
    })(),
    js: (()=>
    {
        if(參數[3])
        {
            const 發布資源 = `${config.productDir}/${參數[3].slice(9)}`
            fse.ensureDirSync(path.parse(發布資源).dir)
            return `uglifyjs ${參數[3]} -o ${發布資源}`
        }
        else
            return `uglifyjs-folder ${config.frontendDir} -yeo ${config.productDir} -x .js > nul`
    })(),
    img: (()=>
    {
        if(參數[3])
        {
            const 發布資源 = `${config.productDir}/${參數[3].slice(9)}`
            fse.ensureDirSync(path.parse(發布資源).dir)
            return `imagemin-power ${參數[3]} > ${發布資源} -d ${config.frontendDir}`
        }
        else
            return `imagemin-power ${config.frontendDir}/**/*.{jpg,png,svg} -r -d ${config.frontendDir} -o ${config.productDir}`
    })(),
}
const 監控 = 
{
    html: `onchange ${config.frontendDir}/**/*.html -- node exec/dev build:html {{changed}}`,
    css: `onchange ${config.frontendDir}/**/*.scss -- node exec/dev build:css {{changed}}`,
    js: `onchange ${config.frontendDir}/**/*.js -- node exec/dev build:js {{changed}}`,
    img: `onchange ${config.frontendDir}/**/*.{jpg,png,svg} -- node exec/dev build:img {{changed}}`,
}
const 建構所有資源 = `${建構.html} && ${建構.css} && ${建構.js} && ${建構.img}`
const 啟動伺服器 = `nodemon -w ${config.backendDir} ${config.backendDir}/server.js`
const 刷新瀏覽器 = `browser-sync start -p ${config.useHTTPS ? 'https': 'http'}://localhost:${config.port} -f ${config.productDir} --no-inject-changes --no-notify`

const npm指令 = 
{
    server:
    {
        說明: `正在啟動伺服器...`,
        指令: 啟動伺服器,
    },
    browser:
    {
        說明: `正在啟動 browser-sync...`,
        指令: 刷新瀏覽器,
    },
    "build:html":
    {
        說明: `正在建構HTML...`,
        指令: 建構.html,
    },
    "build:css":
    {
        說明: `正在建構CSS...`,
        指令: 建構.css,
    },
    "build:js":
    {
        說明: `正在建構JS...`,
        指令: 建構.js,
    },
    "build:img":
    {
        說明: `正在建構IMG...`,
        指令: 建構.img,
    },
    build:
    {
        說明: `正在建構所有資源...`,
        指令: 建構所有資源,
    },
    "watch:html":
    {
        說明: `正在監控HTML...`,
        指令: 監控.html,
    },
    "watch:css":
    {
        說明: `正在監控CSS...`,
        指令: 監控.css,
    },
    "watch:js":
    {
        說明: `正在監控JS...`,
        指令: 監控.js,
    },
    "watch:img":
    {
        說明: `正在監控IMG...`,
        指令: 監控.img,
    },
    watch: 
    {
        cmd: `concurrently -p "{name}" -n " HTML , CSS  ,  JS  , IMG  " -c "black.bgGreen,black.bgBlue,black.bgYellow,black.bgCyan" `,
        arg: [`"${監控.html}"`, `"${監控.css}"`, `"${監控.js}"`, `"${監控.img}"`],
    },
    dev: 
    {
        cmd: `${建構所有資源} && concurrently -p "{name}" -n "伺服器,瀏覽器, HTML , CSS  ,  JS  , IMG  " -c "inverse,bgMagenta,black.bgGreen,black.bgBlue,black.bgYellow,black.bgCyan" `,
        arg: [`"${啟動伺服器}"`, `"${刷新瀏覽器}"`, `"${監控.html}"`, `"${監控.css}"`, `"${監控.js}"`, `"${監控.img}"`],
    },
}


// 開始執行
if(參數[2]=='watch' | 參數[2]=='dev')
{
    spawn(npm指令[參數[2]].cmd, npm指令[參數[2]].arg, {stdio: 'inherit'})
    console.log(chalk.cyan('正在建構並監控所有資源，請稍後...\n'))
}
else
{
    if(參數[3])
    {
        console.log(`已變更：${chalk.blue(參數[3].slice(9))}`)
        const 子程序 = spawn(npm指令[參數[2]].指令, {stdio: 'inherit'})
        子程序.on('close', ()=>{
            console.log(chalk.green(`已建構：${參數[3].slice(9)}`))
        })
    }
    else
    {
        console.log(chalk.cyan(npm指令[參數[2]].說明))
        const 子程序 = spawn(npm指令[參數[2]].指令, {stdio: 'inherit'})
        子程序.on('close', ()=>{
            console.log(chalk.green('成功結束！'))
        })
    }
}

