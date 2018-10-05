// helper for setup or update development environment

// delete module cache to load only dirPath from config module
delete require.cache[require.resolve(`${process.cwd()}/dev/config`)]

const config = require(`${process.cwd()}/dev/config`)
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { spawn } = require('child_process')

// if it's executed from node
if (!module.parent) 
    devHelper()

async function devHelper() {

    // check env.js
    const status = checkEnv()

    // if it's first use
    if (status == 'generated') {

        // welcome message
        console.log('\x1b[35m%s\x1b[0m', `Welcome to develop helper!`)
        console.log('\x1b[35m%s\x1b[0m', `This program will help you to setup your development environment.`)
        console.log('\x1b[35m%s\x1b[0m', `Let's get started.`)

        // prompt for check env.js
        console.log('\x1b[36m%s\x1b[0m', `Checking custom files...`)
        console.log('\x1b[32m%s\x1b[0m', `custom files generated successfully!`)

        // prompt to install dependencies
        console.log('\x1b[35m%s\x1b[0m', `First of all, you will have to install dependencies.`)
        await promptInstallDependencies()

        // prompt to custom key and product folder
        console.log('\x1b[35m%s\x1b[0m', `Next, you may custom your development environment.`)
        await promptCustomKeyDir()
        await promptCustomProductDir()

        // prompt to build vendor files
        console.log('\x1b[35m%s\x1b[0m', `Next, you will have to build vendor files.`)
        await promptBuildVendors()
        
        // end message
        console.log('\x1b[35m%s\x1b[0m', `Now, your development environment is set up.`)
        console.log('\x1b[35m%s\x1b[0m', `For more custom options, see your "env.js"`)
        console.log('\x1b[42m\x1b[37m%s\x1b[0m', ` Enjoy your development ^^ `)

    }
    // if it's about to update
    else {

        // welcome message
        console.log('\x1b[35m%s\x1b[0m', `Welcome to develop helper!`)
        console.log('\x1b[35m%s\x1b[0m', `This program will help you to update your development environment.`)
        console.log('\x1b[35m%s\x1b[0m', `Let's get started.`)

        // prompt for check env.js
        console.log('\x1b[36m%s\x1b[0m', `checking development environment...`)
        if (status == 'up-to-date')
            console.log('\x1b[32m%s\x1b[0m', `"env.js" is already up-to-date!`)
        else if (status == 'updated')
            console.log('\x1b[32m%s\x1b[0m', `"env.js" is updated automatically!`)

        // check key and product folder
        const env = require(`${config.configDir}/env`)
        checkKeyDir( env.keyDir )
        checkProductDir( env.productDir )

        // prompt to install dependencies
        await promptInstallDependencies()

        // prompt to build vendor files
        await promptBuildVendors()

        // end message
        console.log('\x1b[35m%s\x1b[0m', `Your development environment is up-to-date.`)
        console.log('\x1b[35m%s\x1b[0m', `For more custom options, see your "env.js"`)
        console.log('\x1b[42m\x1b[37m%s\x1b[0m', ` Enjoy your development ^^ `)
    }
    process.exit()
}

function promptInstallDependencies() {
    // instance of prompt module
    rl = readline.createInterface(process.stdin, process.stdout)

    // prompt to install dependencies
    console.log('\x1b[44m\x1b[37m%s\x1b[0m', ` Install dependencies `)
    console.log('\x1b[34m%s\x1b[0m', `    press enter to run "npm i" command`)
    console.log('\x1b[34m%s\x1b[0m', `    or enter 'n' to skip this step`)
    return new Promise((resolve) => {
        rl.question('\x1b[90m> \x1b[0m', (choose) => {
            // install dependencies
            if (choose == '') {
                const process = spawn(`npm i`, {
                    stdio: 'inherit',
                    shell: true,
                })
                process.on('close', ()=>{
                    console.log('\x1b[32m%s\x1b[0m', `Dependencies installed successfully!`)
                    rl.close()
                    resolve()
                })
            }
            // skip install dependencies
            else {
                console.log('\x1b[36m%s\x1b[0m', `Skip dependencies installing.`)
                rl.close()
                resolve()
            }
        })
    })
}

function promptBuildVendors() {
    // instance of prompt module
    rl = readline.createInterface(process.stdin, process.stdout)

    // prompt to build vendor files
    console.log('\x1b[44m\x1b[37m%s\x1b[0m', ` Build vendor files `)
    console.log('\x1b[34m%s\x1b[0m', `    press enter to build vendor files`)
    console.log('\x1b[34m%s\x1b[0m', `    or enter 'n' to skip this step`)
    return new Promise((resolve) => {
        rl.question('\x1b[90m> \x1b[0m', (choose) => {
            // build vendor files
            if (choose == '') {
                console.log('\x1b[36m%s\x1b[0m', `Building vendor files...`)
                const process = spawn(`webpack --config ${config.configDir}/webpack.vendor.js`, {
                    stdio: 'inherit',
                    shell: true,
                })
                process.on('close', ()=>{
                    console.log('\x1b[32m%s\x1b[0m', `Vendor files built successfully!`)
                    rl.close()
                    resolve(true)
                })
            }
            // skip build vendor files
            else {
                console.log('\x1b[36m%s\x1b[0m', `Skip vendor files building.`)
                rl.close()
                resolve(false)
            }
        })
    })
}

function promptCustomKeyDir() {
    // instance of prompt module
    rl = readline.createInterface(process.stdin, process.stdout)

    // prompt to set up key folder
    console.log('\x1b[44m\x1b[37m%s\x1b[0m', ` Where do you want to put your key files? `)
    console.log('\x1b[34m%s\x1b[0m', `    enter absolute path or relative path base on project root`)
    console.log('\x1b[34m%s\x1b[0m', `    or just press enter to use default folder (./key)`)
    return new Promise((resolve) => {
        rl.question('\x1b[90m> \x1b[0m', (keyDir) => {
            if (keyDir == '') {
                keyDir = 'key'
            }
            const fullPath = checkKeyDir( keyDir, true )
            console.log('\x1b[36m%s\x1b[0m', `Set up key folder to ${fullPath}`)
            rl.close()
            resolve()
        })
    })
}

function promptCustomProductDir() {
    // instance of prompt module
    rl = readline.createInterface(process.stdin, process.stdout)

    // prompt to set up product folder
    console.log('\x1b[44m\x1b[37m%s\x1b[0m', ` Where do you want to put your product files? `)
    console.log('\x1b[34m%s\x1b[0m', `    enter absolute path or relative path base on project root`)
    console.log('\x1b[34m%s\x1b[0m', `    or just press enter to use default folder (./product)`)
    return new Promise((resolve) => {
        rl.resume()
        rl.question('\x1b[90m> \x1b[0m', (productDir) => {
            if (productDir == '') {
                productDir = 'product'
            }
            const fullPath = checkProductDir( productDir, true )
            console.log('\x1b[36m%s\x1b[0m', `Set up key folder to ${fullPath}`)
            rl.close()
            resolve()
        })
    })
}

function checkEnv() {
    let status = ''
    if (!fs.existsSync(`${config.configDir}/env.js`)) {
        // env.js not found. create one from default.env.js
        let content = fs.readFileSync(`${config.configDir}/default.env.js`, 'utf8')
        content = content.slice(content.indexOf('\n') + 1).replace(/^(.*)$/m, '// custom your own environment config here!')
        fs.writeFileSync(`${config.configDir}/env.js`, content)
        status = 'generated'
    }
    else {
        // update env.js if need
        const defaultConfig = require(`${config.configDir}/default.env.js`)
        const customConfig = require(`${config.configDir}/env.js`)
        const defaultContent = fs.readFileSync(`${config.configDir}/default.env.js`, 'utf8')
        let customContent = fs.readFileSync(`${config.configDir}/env.js`, 'utf8')
        let newline = true
        let update = false
        for (const key in defaultConfig) {
            if (customConfig[key] == undefined) {
                update = true
                if (newline) {
                    const d = new Date
                    customContent = customContent.replace(/^(.*)}.*$/m, `$1\n    // merge from default.env.js on ${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()/10 < 1 ? '0': ''}${d.getMinutes()}\n}` )
                    newline = false
                }
                const insert = defaultContent.slice(defaultContent.indexOf(key)).split('\n')[0]
                customContent = customContent.replace(/^(.*)}.*$/m, `$1    ${insert}\n}`)
            }
        }
        if (update) {
            fs.writeFileSync(`${config.configDir}/env.js`, customContent)
            status = 'updated'
        }
        else
        status = 'up-to-date'
    }
    return status
}

function checkKeyDir( p, setup = false ) {
    const fullPath = path.resolve( process.cwd(), p )
    mkDirByPathSync(fullPath)

    // generate files if not exsits
    if (!fs.existsSync(`${fullPath}/.gitignore`))
        fs.writeFileSync(`${fullPath}/.gitignore`, '*\n')
    if (!fs.existsSync(`${fullPath}/db.json`))
        fs.writeFileSync(`${fullPath}/db.json`, JSON.stringify({usr: '', pwd: '', url: ''}, null, 4))
    if (!fs.existsSync(`${fullPath}/key.json`))
        fs.writeFileSync(`${fullPath}/key.json`, JSON.stringify({aes: ''}, null, 4))

    if (setup) {
        // setup keyDir in env.js
        let customContent = fs.readFileSync(`${config.configDir}/env.js`, 'utf8')
        customContent = customContent.replace(/(keyDir:.*?').*('.*?,).*(\/\/.*)/m, `$1${p}$2\t$3`)
        fs.writeFileSync(`${config.configDir}/env.js`, customContent)
    }
    return fullPath
}

function checkProductDir( p, setup = false ) {
    const fullPath = path.resolve( process.cwd(), p )
    mkDirByPathSync(fullPath)

    // generate files if not exsits
    if (!fs.existsSync(`${fullPath}/.gitignore`))
        fs.writeFileSync(`${fullPath}/.gitignore`, '*\n')

    if (setup) {
        // setup productDir in env.js
        let customContent = fs.readFileSync(`${config.configDir}/env.js`, 'utf8')
        customContent = customContent.replace(/(productDir:.*?').*('.*?,).*(\/\/.*)/m, `$1${p}$2\t$3`)
        fs.writeFileSync(`${config.configDir}/env.js`, customContent)
    }
    return fullPath
}

function checkVendors() {
    return new Promise( async (resolve) => {
        const env = require(`${config.configDir}/env.js`)
        if (!fs.existsSync(`${env.productDir}/vendor`)) {
            // prompt to build vendor files
            console.log('\x1b[35m%s\x1b[0m', `Vendor files not found.`)
            console.log('\x1b[35m%s\x1b[0m', `You will have to build vendor files first.`)
            const choose = await promptBuildVendors()
            if(!choose) {
                console.log('\x1b[35m%s\x1b[0m', `Maybe next time.`)
                process.exit()
            }
            resolve()
        }
        resolve()
    })
}

// https://stackoverflow.com/a/40686853/6379355
function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';
  
    return targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        } catch (err) {
            if (err.code === 'EEXIST') { // curDir already exists!
            return curDir;
            }
    
            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
            throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }
    
            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && targetDir === curDir) {
            throw err; // Throw if it's just the last created dir.
            }
        }
        return curDir;
    }, initDir);
}

module.exports = {
    checkEnv: checkEnv,
    checkKeyDir: checkKeyDir,
    checkProductDir: checkProductDir,
    checkVendors: checkVendors,
    mkDirByPathSync: mkDirByPathSync,
}
