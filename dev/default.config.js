// make a copy of this file and rename it to "config.js"
// then custom your own environment config there in custom config section!

const fs = require('fs')
const path = require('path')

// ======================= custom config section =======================
// ================= custom your own environment here ==================
const dev = {
    // port
    nodeServerPort:         '2018',             // port of express server
    webpackServerPort:      '8080',             // port of webpack dev server
    browserSyncServerPort:  '3000',             // port of browser-sync server

    // other develop settings
    mode:           'development',              // 'development' or 'production' 
    watch:          true,                       // watch files or not when "npm run build"
    useHTTPS:       false,                      // use http or https server
    openBrowser:    true,                       // open browser automatically when running develop tools
    vueVersion:     'vue/dist/vue.esm.js',      // switch vue version

    // path of directories
    dataDir:    path.resolve( process.cwd(), 'data' ),      // folder to put some files like media files, etc.
    keyDir:     path.resolve( process.cwd(), 'key' ),       // folder for key files
    productDir: path.resolve( process.cwd(), 'product' ),   // folder for built files
}
// key files
const key = 
{
    SSL: {
        key:    fs.readFileSync( `${dev.keyDir}/SSL.key` ),
        cert:   fs.readFileSync( `${dev.keyDir}/SSL.crt` ),
    },
    dbInfo:     JSON.parse(fs.readFileSync( `${dev.keyDir}/db.json` )),
    googleAPI:  JSON.parse(fs.readFileSync( `${dev.keyDir}/googleAPI.json` )),
    AES:        JSON.parse(fs.readFileSync( `${dev.keyDir}/aes.json` )),
}


// ============ project config section (do not edit below!) ============
// path of directories
const dirPath = 
{
    rootDir:       process.cwd(),
    backendDir:    path.resolve( process.cwd(), 'backend' ),
    configDir:     path.resolve( process.cwd(), 'dev' ),
    frontendDir:   path.resolve( process.cwd(), 'frontend' ),
}

module.exports = { ...dev, ...key, ...dirPath }