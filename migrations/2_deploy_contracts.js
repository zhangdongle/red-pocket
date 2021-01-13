const RedPocket = artifacts.require("RedPocket");
const constants = require("../common/constants.js")

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

    deployer.deploy(RedPocket, companyAddrs, techAddrs).then(res=>{
        console.log("部署完成1");
    }).catch(res=>{
        console.log("部署异常");
    });
};