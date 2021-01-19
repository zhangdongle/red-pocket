const RedPocket = artifacts.require("RedPocket");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
 
// Start test block
contract('RedPocket (proxy)', function () {
  beforeEach(async function () {
    // 为每个测试部署一个新的Box合约 
    this.box = await deployProxy(Box, [42], {initializer: 'store'});
  });
 
  // 测试用例
  it('retrieve returns a value previously initialized', async function () {
    // 测试是否返回了同一个设置的值
    // 注意需要使用字符串去对比256位的整数
    expect((await this.box.retrieve()).toString()).to.equal('42');
  });
});