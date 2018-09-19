// specify npm scripts here

const config = require(`${process.cwd()}/dev/config`)
const chalk = require('chalk')
const { spawn } = require('child_process')

const cmd = process.argv[2]         // npm scripts command 
const arg = process.argv.slice(3)   // arguments for npm scripts command 
const opt = {                       // options for spawn function
    stdio: 'inherit',
    shell: true,
}

// =========================== add scripts here ===========================

if ( cmd == 'start' )
{
    console.log(chalk.cyan('Starting server...'))
    spawn(`node ${config.backendDir}/server`, opt)
}

else if ( cmd == 'server' )
{
    console.log(chalk.cyan('Starting server...'))
    spawn(`nodemon -q -w ${config.backendDir} ${config.backendDir}/server`, opt)
}

else if ( cmd == 'dev:node-server' )
{
    console.log(chalk.cyan('Starting develop tools, please wait...'))
    spawn(`concurrently`,
    [
        `-p`, `"{name}"`, `-n`, `" server  , webpack , browser "`, `-c`, `"black.bgYellow,bgGreen,bgCyan"`,
        `"nodemon -q -w ${config.backendDir} ${config.backendDir}/server"`,
        `"webpack -w --config ${config.configDir}/webpack.config.js"`,
        `"browser-sync start -p ${config.useHTTPS ? 'https': 'http'}://localhost:${config.nodeServerPort} --port ${config.browserSyncServerPort} -f ${config.productDir} ${config.openBrowser?'':'--no-open'} --no-inject-changes --no-notify"`,
    ], opt)
    
}

else if ( cmd == 'dev:webpack-server' )
{
    console.log(chalk.cyan('Starting webpack-dev-server...'))
    // dealing with arguments
    let [withNodeServer, writeToDisk] = [false, false]
    if (arg.some( (arg) => { return arg == 'withNodeServer' || arg == 'n' } ))
        withNodeServer = true
    if (arg.some( (arg) => { return arg == 'writeToDisk'    || arg == 'w' } ))
        writeToDisk = true
    if ( withNodeServer || writeToDisk )
    {
        spawn(`concurrently`,
        [
            `-p`, `"{name}"`,
            `-n`, `" wp-server ${withNodeServer?', nd-server ':''}${writeToDisk?',  webpack  ':''}"`,
            `-c`, `"bgCyan${withNodeServer?',black.bgYellow':''}${writeToDisk?',bgGreen':''}"`,
            `"webpack-dev-server -w --config ${config.configDir}/webpack.config.js --hot --progress --colors"`,
            withNodeServer?`"nodemon -q -w ${config.backendDir} ${config.backendDir}/server"`:'',
            writeToDisk?`"webpack -w --config ${config.configDir}/webpack.config.js"`:'',
        ], opt)
    }
    else
        spawn(`webpack-dev-server -w --config ${config.configDir}/webpack.config.js --hot --progress --colors`, opt)
}

else if ( cmd == 'build:bundle' )
{
    console.log(chalk.cyan('Starting to build bundle files...'))
    const process = spawn(`webpack --config ${config.configDir}/webpack.config.js`, opt)
    process.on('close', () => {
        console.log(chalk.green('Bundle files built!'))
    })
}

else if ( cmd == 'build:vendor' )
{
    console.log(chalk.cyan('Starting to build vendor files...'))
    const process = spawn(`webpack --config ${config.configDir}/webpack.vendor.js`, opt)
    process.on('close', ()=>{
        console.log(chalk.green('Vendor files built!'))
    })
}

else if ( cmd == 'build:both' )
{
    console.log(chalk.cyan('Starting to build both bundle files and vendor files...'))
    const process = spawn(`webpack --config ${config.configDir}/webpack.vendor.js`, opt)
    process.on('close', ()=>{
        console.log(chalk.green('Vendor files built!'))
        const process = spawn(`webpack --config ${config.configDir}/webpack.config.js`, opt)
        process.on('close', ()=>{
            console.log(chalk.green('Both bundle files and vendor files built!'))
        })
    })
}

else
{
    console.log(chalk.yellow('undefined command...'))
}
// ========================================================================
