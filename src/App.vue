<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  async created() {
    this.$store.dispatch('guideChange', true);
    let result = await this.$$request.post('api/auth/index');
    if(!result) this.$router.replace({path: '/login'});
    else this.isSchoolArea();
    // else this.$router.replace({path: '/addschool'});
    // this.isSchoolArea();
  },
  methods: {
    async isSchoolArea() {
        let result = await this.$$request.post('api/school/exists');
        if(!result) this.$router.replace({path: '/login'});
        else if(result && result.status == 0) {
            this.$router.push({path: '/addschool'});
            this.$store.dispatch('guideChange', true);   //首次创建校区，进入引导页
        }
    }
  }
}
</script>
