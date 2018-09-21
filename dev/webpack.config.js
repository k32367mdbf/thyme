// A webpack config file specify bundle files

// see more configuration here
// English: https://webpack.js.org/configuration
// Chinese: https://webpack.docschina.org/configuration

const config = require(`${process.cwd()}/dev/config`)
const vendorManifest = require(`${config.productDir}/vendor/vendor.manifest.json`)
const path = require('path')
const webpack = require('webpack')
const HtmlWebPackPlugin = require("html-webpack-plugin")

module.exports = {
    mode:      config.mode,         //'development' or 'production'
    devtool:  'source-map',         // develop tool to debug
    stats:    'minimal',            // command line output
    watch:     config.watch,        // watch file or not
    watchOptions: {
        ignored: [                  // do not watch those folders
            'node_modules',
            config.backendDir,
            config.configDir,
            config.keyDir,
            config.productDir,
        ]
    },
    devServer: {                    // settings of webpack-dev-server
        host: 'localhost',
        port: config.webpackServerPort,
        contentBase: config.productDir,
        inline: true,
        stats: 'minimal',           // command line output (webpack-dev-server)
        open: config.openBrowser,   // open broswer automatically
        openPage: '/page',          // open productDir/page/index.html
        disableHostCheck: true,     // bypasses host checking
        proxy: {                    // api proxy
            '/api': {
                target: `${config.useHTTPS ? 'https': 'http'}://localhost:${config.nodeServerPort}`,
                secure: false,
            },
        },                      
        https: config.useHTTPS ? config.SSL : undefined     // load SSL key and cert if using HTTPS
    },
    resolve: {
        alias: {         // allow to use those alias to import files
            frontend:       config.frontendDir,
            component:   `${config.frontendDir}/component`,
            model:       `${config.frontendDir}/model`,
            page:        `${config.frontendDir}/page`,
            style:       `${config.frontendDir}/style`,
            util:        `${config.frontendDir}/util`,
            'vue$': config.vueVersion, // switch vue version
        }
    },
    entry: {        // set up entry files
        bundle:     [ '@babel/polyfill', `${config.frontendDir}/page/index/-.js` ],
    },
    output: {       // set up output files
        path:       config.productDir,
        filename:   config.mode == 'development' ? 'bundle/[name].js' : 'bundle/[name]-[hash].js'
    },
    module: {
        rules: [
            {   // html files (except entry pages)
                test: /\.html$/,
                exclude: [ path.resolve( config.frontendDir, 'page/index/-.html') ],
                use: [
                    { loader: "html-loader" }
                ]
            },
            {   // html files (entry pages)
                include: [ path.resolve( config.frontendDir, 'page/index/-.html') ],
                use: [
                    // html-loader can not work with ejs-loader
                    // See: https://stackoverflow.com/questions/47112305/how-to-get-both-ejs-compilation-and-html-loader-in-html-webpack-plugin
                    // So I use this: https://blog.csdn.net/qq_33726801/article/details/79301546
                    // but therefore you are only allowed to use ejs grammar in those files
                    { loader: "jcy-loader" }
                ]
            },
            {   // css files
                test: /\.(css|scss|sass)$/,
                use: [
                    { loader: 'style-loader' },     // creates style nodes from JS strings
                    { loader: 'css-loader' },       // translates CSS into CommonJS
                    { loader: 'sass-loader',        // compiles Sass to CSS, using node-sass by default
                        options: { implementation: require('sass') }
                    }
                ]
            },
            {   // js files
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",         // use babel
                    options: require(`${config.configDir}/babel.config.js`)
                }
            },
            {   // assets
                test: /\.(png|gif|jpe?g|svg|woff2?|ttf|eot)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,            // use file-loader automatically when exceed limit
                            fallback: 'file-loader',
                            name: config.mode == 'development' ? '/bundle/asset/[name].[ext]' : '/bundle/asset/[name]-[hash].[ext]',
                        } 
                    }
                ]
            },
        ]
    },
    plugins: [
        new webpack.DllReferencePlugin({            // link vendors dynamically
            manifest: vendorManifest
        }),
        new HtmlWebPackPlugin({                     // build entry pages
            template: `${config.frontendDir}/page/index/-.html`,
            filename: "page/index.html",
            // custom variables for HtmlWebPackPlugin
            vendor: `/vendor/${vendorManifest.name}.js`,
            styleVendor: `/vendor/${vendorManifest.name}.css`,
        })
    ]
};
