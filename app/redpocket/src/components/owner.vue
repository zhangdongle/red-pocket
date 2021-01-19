<template>
  <div class="content column align-center center" style="position: absolute; left: 30px; right: 30px;">
    <div>
      修改红包金额：<input type="text" v-model="baseAmount"/><button @click="setBaseAmount()">修改</button>
    </div>
    <div>
      修改分配比例：<input type="text" v-model="ratio"/><button @click="setRatio()">修改</button>
    </div>
    <div>
      修改owner：<input type="text" v-model="owner"/><button @click="setOwner()">修改</button>
    </div>
    <div class="toast" v-show="toastShow">
      {{toastText}}
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'
import contract from 'truffle-contract'
import rpAbi from '../../../../build/contracts/RedPocket.json'
export default {
  name: 'RedPocket',
  data() {
    return {
      baseAmount: 0,
      ratio: 0,
      owner: '',
      redpocket: '',
      timer:'',
      web3:'',
      toastShow: false,
      toastText: '',
    }
  },
  async created() {
    //  初始化 web3及账号
    await this.initWeb3Account()
    //  初始化合约实例
    await this.initContract()
    //  初始化配置信息
    await this.initConfigState();
  },
  methods: {
    toast (e) {
      let self = this
      self.toastText = e
      self.toastShow = true
      setTimeout(function(){
        self.toastShow = false
      }, 1500)
    },
    setBaseAmount:async function(){
      this.redpocket.setBaseAmount(this.web3.utils.toWei(''+this.baseAmount,'ether'), {
        from: this.account,
        gas: 200000
      }).then(()=>{
        this.toast('修改成功');
      }).catch(err=>{
        console.log("合约调用异常",err);
      });
    },
    setRatio:async function(){
      this.redpocket.setRatio(this.ratio, {
        from: this.account,
        gas: 200000
      }).then(()=>{
        this.toast('修改成功');
      }).catch(err=>{
        console.log("合约调用异常",err);
      });
    },
    setOwner:async function(){
      this.redpocket.transferOwnership(this.owner, {
        from: this.account,
        gas: 200000
      }).then(()=>{
        this.toast('修改成功');
      }).catch(err=>{
        console.log("合约调用异常",err);
      });
    },
    initWeb3Account: async function () {
      if (window.ethereum) {
        this.provider = window.ethereum
        try {
          await window.ethereum.enable()
        } catch (error) {
          //   console.log("User denied account access");
        }
      } else if (window.web3) {
        this.provider = window.web3.currentProvider
      } else {
        this.provider = new Web3.providers.HttpProvider(
          'http://192.168.1.118:7545',
        )
      }
      this.web3 = new Web3(this.provider)
      this.web3.eth.getAccounts().then((accs) => {
        this.account = accs[0]
      })
    },
    initContract: async function () {
      this.redpocketAddress = process.env.VUE_APP_REDPOCKET_ADDRESS;
      let RedPocketContract = contract(rpAbi);
      RedPocketContract.setProvider(this.provider)
      this.redpocket = await RedPocketContract.at(this.redpocketAddress)
    },
    initConfigState: async function(){
      await this.redpocket._baseAmount().then(res=>{
        this.baseAmount = this.web3.utils.fromWei(res,'ether');
          console.log("基数", this.baseAmount);
      });
      await this.redpocket._ratio().then(res=>{
        this.ratio = res;
          console.log("比例", this.ratio);
      });
      await this.redpocket.owner().then(res=>{
        this.owner = res;
          console.log("owner", this.owner);
      });
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
body {
  width: 100%;
  background-image: url('../assets/bg.png');
  background-size: 100% auto;
  background-repeat: no-repeat;
  display: flex;
  color: rgb(252, 245, 192);
}
div {
  font-size: 14px;
  font-family: STHeiti;
}
.title-en {
  opacity: 0.8;
  font-size: 12px;
  letter-spacing: 5px;
  font-weight: 200;
  margin-top: 330px;
}
.statistic {
  display: flex;
  background-color: rgb(206, 135, 138);
  widows: 100%;
  margin-bottom: 30px;
}
.text {
  color: rgb(252, 245, 192);
  line-height: 25px;
  font-weight: 600;
}
.btn2 {
  color: rgb(252, 245, 192);
  margin: 10px auto;
  background-color: rgb(244, 43, 51);
  height: 50px;
  font-size: 18px;
  line-height: 50px;
  text-align: center;
  width: 220px;
  border-radius: 50px;
}
.row {
  display: flex;
  flex-direction: row;
}
.column {
  display: flex;
  flex-direction: column;
}
.center {
  justify-content: center;
}
.between {
  justify-content: space-between;
}
.flex-start {
  justify-content: flex-start;
}
.align-center {
  align-items: center;
}
.align-start {
  align-items: flex-start;
}
.error {
  height: 30px;
  line-height: 30px;
}
.toast{
  position: fixed;
  z-index: 2000;
  left: 50%;
  top:45%;
  transition:all .5s;
  -webkit-transform: translateX(-50%) translateY(-50%);
      -moz-transform: translateX(-50%) translateY(-50%);
      -ms-transform: translateX(-50%) translateY(-50%);
        -o-transform: translateX(-50%) translateY(-50%);
          transform: translateX(-50%) translateY(-50%);
  text-align: center;
  border-radius: 5px;
  color:#FFF;
  background: rgba(17, 17, 17, 0.7);
  height: 45px;
  line-height: 45px;
  padding: 0 15px;
  max-width: 150px;
}
</style>
