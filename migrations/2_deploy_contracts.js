const RedPocket = artifacts.require("RedPocket");

module.exports = async function(deployer,network,accounts) {
    console.log("network：",network);
    let owner;
    let companyAddrs;
    let techAddrs;
    if("development" == network){
        // console.log("入参：{}，{}，{}",network,accounts);
        
        // 初始化合约参数
        owner = accounts[0];
        // console.log("部署合约", res);
        companyAddrs = accounts.slice(1,11);
        techAddrs = accounts.slice(11,16);
    }else{
        owner = "0xEAA5Df3Ef948b96269D1bf6C59cA2AD215B5997F";
        companyAddrs = [
            "0x13A01A598439D2894d4AEF4B0CB810f845a82148",
            "0xfFDDeF506F978A8888a89694B54013F311c54D8a",
            "0xE8d0B504a786D9C19B1451fb795A4fDD94DB359b",
            "0x10FBA3d753E31a23eEf7A3590B86d5A7cecf5720",
            "0x90A8AC2D268a4aA16523Ec35a6c9618e7d341902",
            "0x93ECba021eF015d6C3177E54140b5931CAc4A88C",
            "0x67B54A622c65A9506ccD25A4Ff5b9A79742FB303",
            "0xF0944b7519E59C97E5B1Ab9FEBf06cC47f40Db71",
            "0x7BcC8b8cEE2b2fe9d7b57ca861E0B09D4D8fDeC2",
            "0xF89dc58Da24bEb222E791E7E3A7C9b90651Ff5ce",
            ];
        techAddrs = [
            "0xc3F284bfb9f8b23F6b1922Ed84Ae3AE0eC906399",
            "0x2cf8cf35E87Ca530aa95f241431c0Fc5DA9D9693",
            "0xfefBc0864B67dADA68F88D9507A33ecaa5E3dB6E",
            "0x866484476625Eb08a866D0D62D7e6494d1e560A6",
            "0x81C7bB24e520694AfC07eBCA351D396562a48f53",
        ];
    }
    
    
    deployer.deploy(RedPocket, companyAddrs, techAddrs).then(res=>{
        console.log("部署完成1");
    }).catch(res=>{
        console.log("部署异常");
    });
};