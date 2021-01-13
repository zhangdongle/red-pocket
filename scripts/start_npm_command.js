var process = require('child_process');
var cmd = 'cd ./app/redpocket & npm run serve';
process.exec(cmd, function(error, stdout, stderr) {
    console.log("error: "+error);
    console.log("stdout: "+stdout);
    console.log("stderr: "+stderr);
});