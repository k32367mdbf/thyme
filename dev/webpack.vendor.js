// A webpack config file specify common used modules

// see more configuration here
// English: https://webpack.js.org/configuration
// Chinese: https://webpack.docschina.org/configuration

const config = require(`${process.cwd()}/dev/config`)
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

// =========================== add vendors here ===========================
const vendors = [

    // libraries or frameworks
    '@babel/polyfill',
    'vue',
    'vue-router',
    'vuetify',

    // styles
    'vuetify/dist/vuetify.min.css',
    'material-design-icons/iconfont/material-icons.css',

]
// ========================================================================

module.exports = {
    mode:      config.mode,         //'development' or 'production'
    devtool:  'source-map',         // develop tool to debug
    stats:    'minimal',            // command line output
    resolve: {
        alias: {    
            'vue$': config.vueVersion, // switch vue version
        }
    },
    entry: {                        // set up entry files
        vendor: vendors
    },
    output: {                       // set up output files
        path:           config.productDir,
        filename:       config.mode == 'development' ? 'vendor/[name].js' : 'vendor/[name]-[chunkhash].js',
        library:        config.mode == 'development' ? '[name]' : '[name]_[chunkhash]',
        libraryTarget:  'umd',      // library export method

    },
    module: {
        rules: [
            {   // css files
                test: /\.(css|scss|sass)$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader }, // extracts CSS into separate files
                    { loader: 'css-loader' },                // translates CSS into CommonJS
                    { loader: 'sass-loader',                 // compiles Sass to CSS, using node-sass by default
                        options: { implementation: require('sass') }
                    }
                ]
            },
            {   // assets
                test: /\.(png|gif|jpe?g|svg|woff2?|ttf|eot)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,                     // use file-loader automatically when exceed limit
                            fallback: 'file-loader',
                            name: config.mode == 'development' ? '/vendor/asset/[name].[ext]' : '/vendor/asset/[name]-[hash].[ext]',
                        }
                    }
                ]
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({  // extracts CSS into separate files
            filename: config.mode == 'development' ? 'vendor/[name].css' : 'vendor/[name]-[chunkhash].css',
        }), 
        new webpack.DllPlugin({     // set up DLL vendors
            // output manifest file
            path: `${config.productDir}/vendor/[name].manifest.json`,
            // values inside manifest ( must match output.library )
            name: config.mode == 'development' ? '[name]' : '[name]_[chunkhash]',
        })
    ]
};
