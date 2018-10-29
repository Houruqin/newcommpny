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
    };
  },
  async created () {
    let result = await this.$$request.post('/auth/index');

    if (!result) {
      this.loading = false;
      this.$$cache.loginOut();
    } else {
      this.isSchoolArea();
    }
  },
  methods: {
    async isSchoolArea () {
      let result = await this.$$request.post('/school/exists');

      if (!result) {
        this.loading = false;
        this.$router.replace({path: '/login'});
      } else if (result && result.status === 0) {
        this.loading = false;
        this.$router.push({path: '/addschool'});
      } else {
        this.getAllRoleMenus();
      }
    },
    // 获取所有角色 菜单
    getAllRoleMenus () {
      this.$store.commit('saveAuthority', d => {
        if (d) {
          this.loading = false;
        }
      });
    }
  }
};
</script>
