const RedPocket = artifacts.require("RedPocket");
const constants = require("../common/constants.js")
const BN = require('bignumber.js');
let baseAmount = BN(0.001).multipliedBy(10**18).toFixed();
module.exports = async function(deployer,network,accounts) {
    console.log("network：",network);
    let owner;
    let companyAddrs;
    let techAddrs;
    if("development" == network){
        // 初始化合约参数
        owner = accounts[0];
        // console.log("部署合约", res);
        companyAddrs = accounts.slice(1,11);
        techAddrs = accounts.slice(11,16);
    }else{
        owner = constants.owner;
        companyAddrs = constants.companyAddrs;
        techAddrs = constants.techAddrs;
    }

    console.log(baseAmount);

    let redpocket;
    await deployer.deploy(RedPocket, companyAddrs, techAddrs, baseAmount, 10,{
      gasPrice: web3.utils.toWei('60','gwei')
    }).then(res=>{
      redpocket = res;
    });

    console.log("红包合约地址：",redpocket.address);
    console.log("配置Dapp前端服务");
    let script = require('../scripts/init_vue_config.js');
    script.run(network,false,redpocket.address,'');
};