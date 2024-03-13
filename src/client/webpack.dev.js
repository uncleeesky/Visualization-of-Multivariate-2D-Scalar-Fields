const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')
const spawn = require('child_process').spawn
const py = spawn('python', ['./src/server/image.py'])

// run the python file while start the sever page.
console.log('start')

py.stdout.on('data', function (res) {
    let data = res.toString();
    console.log('stdout: ', data)
})
py.stderr.on('data', function (res) {
    let data = res.toString();
    console.log('stderr: ', data)
})
py.on('close', (code) => {
    console.log(`out: ${code}`);
});

console.log('end.')
// configuring the server
module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, '../../dist/client'),
        },
        hot: true,
    },
})