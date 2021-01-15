const RedPocket = artifacts.require("RedPocketOfUSDT");
const TetherToken = artifacts.require("TetherToken");
const BN = require('bignumber.js');
const constants = require("../common/constants.js")
const utils = require("../common/utils.js")

let _initialSupply = 100000000000000; // Token总量
let _name = "USDT"; // Token名称
let _symbol = _name; // Token代号
let _decimals = 6; // Token精度
let baseAmount = 100*(10**6);
let token;
let tokenaddress = "0x27f46f1F96E6788E16d54c6DfEAa3B3BDA623194";

// /**
// * 批量转账
// * addrs 转账地址数组
// * amount 单个地址金额，单位ether
//  */
// async function batchTransfer(from, addrs, amount){
//   console.log("批量转账");
//   for(var i in addrs){
//     var addr = addrs[i];
//     token.transfer(addr,BN(amount).multipliedBy(10**6),{
//       from:from
//     }).then(res=>{
//         console.log("转账成功：", i, addr);
//     }).catch(err=>{
//         console.log(err);
//     });
//   }
// }

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

    if(network == 'development'){
        await deployer.deploy(TetherToken, _initialSupply,_name,_symbol,_decimals,{from: owner}).then(async instance=>{
            token = instance;
            tokenaddress = token.address;
            // await batchTransfer(owner, constants.accounts, 100000);
        }).catch(res=>{
            console.log("部署异常");
        });

    }
    
    console.log("USDT地址：",tokenaddress);
    let redpocket;
    await deployer.deploy(RedPocket,companyAddrs,techAddrs,tokenaddress,baseAmount,5).then(res=>{
        redpocket = res;
    });
    console.log("红包合约地址：",redpocket.address);
    console.log("配置Dapp前端服务");
    let script = require('../scripts/init_vue_config.js');
    script.run(network,true,redpocket.address,tokenaddress);
};