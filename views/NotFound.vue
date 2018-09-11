<template>
    <div class="bg-box d-f f-a-c f-j-c">
        <a><img src="../images/network/net404.png" alt=""></a>
        <div class="fc-7 fs-15 ml-50 mb-40">
            <h1 class="fc-5">很抱歉！</h1>
            <p class="mt-20">您访问的页面不存在</p>
            <p class="mt-10">您还可以：</p>
            <MyButton type="border" class="mt-10" fontColor="fc-m" @click.native="goHome">返回首页</MyButton>
        </div>
    </div>
</template>

<script>

import MyButton from '../components/common/MyButton';

export default {
  data () {
    return {};
  },
  methods: {
    goHome () {
      this.$router.replace({path: '/'});
    }
  },
  components: {MyButton}
};
</script>

<style lang="less" scoped>
    .bg-box {
        height: 100%;
        width: 100%;
        position: absolute;
        img {
            display: block;
        }
    }
</style>


