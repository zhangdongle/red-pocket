<template>
  <div id="app">
    <div v-if="page=='index'">
      <index />
    </div>
    <div v-if="page=='owner'">
      <owner />
    </div>
  </div>
</template>

<script>
import index from './components/index.vue'
import owner from './components/owner.vue'

export default {
  name: 'App',
  components: {
    index,
    owner
  },
  data() {
    return {
      page: 'index'
    }
  },
  created(){
    console.log('当前');
    let domain = window.location.href;
    if(domain.indexOf("#") != -1){
      this.page = domain.split("#")[1];
      console.log(this.page);
    }
  }
}
</script>

<style>

</style>
