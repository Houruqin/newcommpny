<template>
  <div id="app">
    <div class="full-page-loadding-box page-loadding-box" v-if="loading">
        <div class="loading-icon"><span>加载中</span><i></i></div>
        <p class="loading-text">正在努力加载，请耐心等候</p>
    </div>
    <router-view v-else/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      loading: true
    }
  },
  async created() {
    let result = await this.$$request.post('/auth/index');
    if(!result) {
      this.loading = false;
      this.$router.replace({path: '/login'});
    }
    else this.isSchoolArea();
    // else this.$router.replace({path: '/addschool'});
    // this.isSchoolArea();
  },
  methods: {
    async isSchoolArea() {
        let result = await this.$$request.post('/school/exists');
        this.loading = false;
        if(!result) this.$router.replace({path: '/login'});
        else if(result && result.status == 0) {
          this.$router.push({path: '/addschool'});
        }
    }
  }
}
</script>
