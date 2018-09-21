<template>
  <el-popover popper-class="grade-student-popver" placement="right" trigger="hover" :content="explain[title].text">
      <div slot="reference" class="cursor-pointer popver-item" ref="popverItem">
          <span>{{explain[title].title}}</span>
          <i class="iconfont icon-wenhao"></i>
      </div>
  </el-popover>
</template>

<script>


import {explainLists} from '../../script/static';

export default {
  props: ['title'],
  data () {
    return {
      explain: explainLists
    };
  },
  mounted () {
    this.$refs.popverItem.parentElement.style.cssText = 'display: -webkit-flex; display: flex;';
  }
};
</script>

<style lang="less" scoped>
  .popver-item {
    padding: 0;
  }
</style>



