var Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  // Deploy the Migrations contract as our only task
  deployer.deploy(Migrations).then(res=>{
    console.log('执行脚本');
    // var process = require('child_process');
    // var cmd = 'ipconfig';
    // process.exec(cmd, function(error, stdout, stderr) {
    //     console.log("error: "+error);
    //     console.log("stdout: "+stdout);
    //     console.log("stderr: "+stderr);
    // });
  });
};