const CircularDependencyPlugin = require("circular-dependency-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");
const TerserPlugin = require("terser-webpack-plugin");

const path = require("path");

const isProd = process.env.NODE_ENV === "production";

const assets = path.join(__dirname, "/build/resources/main/assets");

module.exports = {
    mode: isProd ? "production" : "development",
    devtool: isProd ? false : "source-map",
    performance: { hints: false },
    context: path.join(__dirname, "/src/main/resources/assets"),
    entry: {
        "js/widgets/layers": "./js/main.ts",
        "styles/": "./styles.scss",
    },
    output: {
        path: assets,
        filename: "./[name].js",
    },
    resolve: {
        extensions: [".ts", ".js", ".scss", ".css"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: { configFile: "tsconfig.json" },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { publicPath: "../" },
                    },
                    {
                        loader: "css-loader",
                        options: { sourceMap: !isProd, importLoaders: 1 },
                    },
                    {
                        loader: "postcss-loader",
                        options: { sourceMap: !isProd },
                    },
                    { loader: "sass-loader", options: { sourceMap: !isProd } },
                ],
            },
            {
                test: /\.(eot|woff|woff2|ttf)$|icomoon.svg/,
                use: "file-loader?name=fonts/[name].[ext]",
            },
            {
                test: /^\.(svg|png|jpg|gif)$/,
                use: "file-loader?name=img/[name].[ext]",
            },
        ],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    compress: {
                        drop_console: false,
                    },
                    keep_classnames: true,
                    keep_fnames: true,
                },
            }),
        ],
    },
    plugins: [
        new ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "./styles/[id].css",
        }),
        new CircularDependencyPlugin({
            exclude: /a\.js|node_modules/,
            failOnError: true,
        }),
        //new ErrorLoggerPlugin({showColumn: false}),
    ],
};
