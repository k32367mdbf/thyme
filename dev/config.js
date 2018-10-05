// Project config file

const fs = require('fs')
const path = require('path')

// path of directories
const dirPath = 
{
    rootDir:       process.cwd(),
    backendDir:    path.resolve( process.cwd(), 'backend' ),
    configDir:     path.resolve( process.cwd(), 'dev' ),
    frontendDir:   path.resolve( process.cwd(), 'frontend' ),
}

if (module.parent.filename == path.resolve(`${dirPath.configDir}/setup.js`))
    module.exports = dirPath
else {
    // load setup module
    const setup = require(`${dirPath.configDir}/setup`)

    // check env.js
    const status = setup.checkEnv()

    // check key and product folder
    const env = require(`${dirPath.configDir}/env`)
    setup.checkKeyDir( env.keyDir )
    setup.checkProductDir( env.productDir )

    // show message if need
    if (status == 'generated')
        console.log('\x1b[32m%s\x1b[0m', `custom files generated automatically!`)
    else if (status == 'updated')
        console.log('\x1b[32m%s\x1b[0m', `"env.js" is updated automatically!`)

    // key files
    const key = 
    {
        SSL: {
            key:    fs.existsSync(`${env.keyDir}/SSL.key`)  ? fs.readFileSync(`${env.keyDir}/SSL.key`)  : undefined,
            cert:   fs.existsSync(`${env.keyDir}/SSL.cert`) ? fs.readFileSync(`${env.keyDir}/SSL.cert`) : undefined,
        },
        dbInfo:     JSON.parse( fs.readFileSync(`${env.keyDir}/db.json`) ),
        key:        JSON.parse( fs.readFileSync(`${env.keyDir}/key.json`) ),
    }
    module.exports = { ...env, ...dirPath, ...key }
}
