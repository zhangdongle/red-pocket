import Vue from 'vue'
import App from './App.vue'
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)
Vue.config.productionTip = false

console.log("当前环境模式：",process.env.NODE_ENV);
console.log("是否Token模式：",process.env.VUE_APP_TOKEN_MODE);
console.log("红包合约地址：",process.env.VUE_APP_REDPOCKET_ADDRESS);
new Vue({
    render: h => h(App),
}).$mount('#app')