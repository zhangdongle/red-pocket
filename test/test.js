// const math = require('/common/math.js');

// var array = [1,2,3.4,6];
// console.log(math.sum(array));
// //执行定义变量来表示不同的合约
// const Greeter  = artifacts.require('Greeter.sol');
// //执行变量，便于进行更改
// const var_a = 'hello';
// const var_b = 'Hello World';
// //执行定义合约中的其他操作
// contract('Greeter',accounts => {
//     before(async () => {
//     //构建合约(可以设置两种方式)
//     //01
//     let a = await Greeter.deployed(var_a);
//     //02
//     //let Contract_Ches       = await Ches.new(var_a);
//     let c = await a.greet();
//     let d = await a.setGreeting(var_b);
//     let f = await a.greet();
//     //在原有的合约上进行获取
//     let g = await Greeter.at('0xf002106450478c6cA78bff228df50157e1EaF7e9');
//     let h = await g.greet();
//     let i = await g.setGreeting('您好，世界！');
//     let k = await g.greet();
//     console.log("合约地址:",a.address);
//     console.log("获取原数据:",c);
//     console.log("获取新数据:",f);
//     console.log("获取原来的合约地址:",g.address);
//     console.log("获取原来的合约值:",h);
//     console.log("更改原来合约的值，并且显示出来:",k);
//     //console.log("02合约地址:",Contract_Ches.address);
//     });
//     it('Check whether the contract has been issued successfully', async () => {
//       console.log("测试合约的操作:");
//     }); 
// });