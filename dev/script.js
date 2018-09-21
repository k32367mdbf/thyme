// specify npm scripts here

const config = require(`${process.cwd()}/dev/config`)
const { spawn } = require('child_process')
const concurrently = require('concurrently')
const chalk = require('chalk')

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
    concurrently([
        {
            command: `nodemon -q -w ${config.backendDir} ${config.backendDir}/server`,
            name:'server ', prefixColor:'black.bgYellow'
        },
        {
            command: `webpack -w --config ${config.configDir}/webpack.config.js`,
            name:'webpack', prefixColor:'bgGreen'
        },
        {
            command: `browser-sync start -p ${config.useHTTPS ? 'https': 'http'}://localhost:${config.nodeServerPort} --port ${config.browserSyncServerPort} -f ${config.productDir} ${config.openBrowser?'':'--no-open'} --no-inject-changes --no-notify`,
            name:'browser', prefixColor:'bgCyan'
        },
    ],
    {
        prefix: `${chalk.white(' ')}{name}${chalk.white(' ')}`,
        restartTries: 1,
    }).then( (success, failure) => {
        console.log(chalk.cyan('Please ignore previous message.'))
        if (process.platform === 'win32')
            process.stdout.write(chalk.cyan('Terminate current process? (Y/N): '))
    })
}

else if ( cmd == 'dev:webpack-server' )
{
    console.log(chalk.cyan('Starting webpack-dev-server...'))
    // dealing with arguments
    let [withNodeServer, writeToDisk] = [false, false]
    let commands = [{
        command: `webpack-dev-server -w --config ${config.configDir}/webpack.config.js --hot --progress --colors`,
        name:'wp-server', prefixColor:'bgCyan'
    }]
    if (arg.some( (arg) => { return arg == 'withNodeServer' || arg == 'n' } )) {
        withNodeServer = true
        commands.push({
            command: `nodemon -q -w ${config.backendDir} ${config.backendDir}/server`,
            name:'nd-server', prefixColor:'black.bgYellow'
        })
    }
    if (arg.some( (arg) => { return arg == 'writeToDisk' || arg == 'w' } )) {
        writeToDisk = true
        commands.push({
            command: `webpack -w --config ${config.configDir}/webpack.config.js`,
            name:' webpack ', prefixColor:'bgGreen'
        })
    }
    // run commands
    if ( withNodeServer || writeToDisk )
    {
        concurrently( commands, {
            prefix: `${chalk.white(' ')}{name}${chalk.white(' ')}`,
            restartTries: 1,
        }).then( (success, failure) => {
            console.log(chalk.cyan('Please ignore previous message.'))
            if (process.platform === 'win32')
                process.stdout.write(chalk.cyan('Terminate current process? (Y/N): '))
        })
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
