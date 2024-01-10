const path = require("path");

module.exports = {
    outputDir: path.resolve(__dirname, './mygraphs.github.io'),
    devServer: {
        disableHostCheck: true,
        public: '0.0.0.0',
        host: '0.0.0.0',
        https: false,
        transportMode: 'ws',
    },
}
