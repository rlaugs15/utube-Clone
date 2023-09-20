const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const BASE_JS = "./src/client/js/"

module.exports = {
    entry: {
        main: BASE_JS + "main.js",
        videoPlayer: BASE_JS + "videoPlayer.js",
        recorder: BASE_JS + "recorder.js",
        commentSection: BASE_JS + "commentSection.js"
    },
    //mode: "development", //개발모드, 코드를 압축하지 않는다. -> 배포시 코드압축이 필요해서 삭제
    //watch: true,//webpack은 해석 된 파일의 변경 사항을 계속 감시->development모드에서만 turo
    plugins: [new MiniCssExtractPlugin({
        filename: "css/styles.css"
    })],
    output: {
        filename: "js/[name].js",
        path: path.resolve(__dirname, "assets"),
        clean: true,//output폴더를 실행하기 전에 청소
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",//test에 설정된 모든 js파일들을 바벨로 변환해줌
                    options: {
                        presets: [
                            ["@babel/preset-env", { targets: "defaults" }],
                        ]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            }
        ]
    }
}