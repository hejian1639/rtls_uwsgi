var path = require("path");
var precss = require('precss'); // 实现类Sass的功能，变量，嵌套，mixins
var autoprefixer = require('autoprefixer'); // 自动添加浏览器前缀
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var fs = require('fs')
import TypingsCssModulePlugin from './typings-for-css-modules-plugin';

var baseLibUrl = '';
var baseAppUrl = 'dist/';

var babelOptions = {
    "presets": [
    "react",
    [
      "es2015",
            {
                "modules": false
        }
    ],
    "es2016"
  ]
};

function ifExistDelExtension(reg, str) {
    if (str.match(reg)) {
        return str.replace(reg, '');

    }

    return false;
}

var rootDir = __dirname + '/src';
var entry = fs.readdirSync(rootDir)
    .reduce(function(entries, dir) {
        if (fs.statSync(path.join(rootDir, dir))
            .isDirectory()) {
            var entryFile = path.join(rootDir, dir, 'index.js')
            if (fs.existsSync(entryFile)) {
                entries[dir] = entryFile;
            }

            var entryFile = path.join(rootDir, dir, 'index.jsx')
            if (fs.existsSync(entryFile)) {
                entries[dir] = entryFile;
            }

            var entryFile = path.join(rootDir, dir, 'index.ts')
            if (fs.existsSync(entryFile)) {
                entries[dir] = entryFile;
            }

            var entryFile = path.join(rootDir, dir, 'index.tsx')
            if (fs.existsSync(entryFile)) {
                entries[dir] = entryFile;
            }

        } else if (fs.statSync(path.join(rootDir, dir))
            .isFile()) {
            var entryName = ifExistDelExtension(/.(js(x?))|(tsx?)$/, dir);
            if (entryName) {

                entries[entryName] = path.join(rootDir, dir);
            }

        }

        return entries
    }, {});

var externals = fs.readdirSync(rootDir)
    .reduce(function(entries, dir) {
        if (fs.statSync(path.join(rootDir, dir))
            .isDirectory()) {
            var entryFile = path.join(rootDir, dir, 'index.js')
            if (fs.existsSync(entryFile)) {
                entries[dir] = baseAppUrl + dir;
            }

            var entryFile = path.join(rootDir, dir, 'index.jsx')
            if (fs.existsSync(entryFile)) {
                entries[dir] = baseAppUrl + dir;
            }

            var entryFile = path.join(rootDir, dir, 'index.ts')
            if (fs.existsSync(entryFile)) {
                entries[dir] = baseAppUrl + dir;
            }

            var entryFile = path.join(rootDir, dir, 'index.tsx')
            if (fs.existsSync(entryFile)) {
                entries[dir] = baseAppUrl + dir;
            }

        } else if (fs.statSync(path.join(rootDir, dir))
            .isFile()) {
            var entryName = ifExistDelExtension(/.(js(x?))|(tsx?)$/, dir);
            if (entryName) {
                entries[dir] = baseAppUrl + dir;

            }
        }

        return entries
    }, {
        'jquery.jplayer': 'jplayer/jquery.jplayer',
        'css!fonts/iconfont': 'css!' + 'fonts/iconfont',
        'css!todomvc-app-css': 'css!' + 'todomvc-app-css/index.css',
        'css!todomvc-common': 'css!' + 'todomvc-common/base.css',
        'mobx-react-devtools': 'mobx-react-devtools/index',
        "video.js": "video",
    });

var rootDir = './lib';

function delJSExtension(str) {
    var reg = /.js$/;
    return str.replace(reg, '');
}

function delCSSExtension(str) {
    var reg = /.css$/;
    return str.replace(reg, '');
}
externals = fs.readdirSync(rootDir)
    .reduce(function(entries, dir) {
        if (fs.statSync(path.join(rootDir, dir))
            .isFile()) {
            if (dir.match(/.js$/)) {
                dir = delJSExtension(dir);
                entries[dir] = dir;

            } else if (dir.match(/.css$/)) {
                dir = 'css!' + delCSSExtension(dir);
                entries[dir] = dir;

            }
        }

        return entries
    }, externals);

// entry = Object.assign(entry, {
//         main: "./src/main.jsx",
//         'active-links': "./src/active-links.jsx",
//         'jmui-test': "./src/jmui-test.jsx",
//         form: "./src/form.jsx",
//         'react-flux-babel-karma': "./src/react-flux-babel-karma/main.tsx",

//     });
// console.log(externals);

module.exports = {
    // devtool: 'source-map',

    entry: entry,
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
        libraryTarget: "umd",
        publicPath: '/dist/'
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelOptions
                    },
                    {
                        loader: 'ts-loader'
                    }]
            },
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ['es2015', 'stage-0', 'react'],
                        plugins: ["transform-decorators-legacy", ["import", { libraryName: "antd", style: "css" }]]
                    }
                }
            },
            {
                test: /\.(css|less)$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        // options: {
                        //     modules: true,
                        // },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [require('precss'), require(
                                'autoprefixer')]
                        }
                    }
                ]
            },
            {
                test: /\.(gif|png|jpg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 4096,
                        name: '[name].[ext]'
                    },
                }
            },
            {
                test: /\.(eot|ttf|svg|m4a|ogg|mp3)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]'
                    },
                },
            },
        ]
    },

    externals: [externals],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.d.ts']
    },
    plugins: [
        new ProgressBarPlugin(),
        new TypingsCssModulePlugin()
    ]
};
