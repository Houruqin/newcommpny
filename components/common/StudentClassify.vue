<template>
    <div class="classify-box cursor-pointer" :class="{'active': active, 'invalid': tab.type == 'loss'}" @click="classifyHandle">
        <div class="header p-r d-f">
          <Explain v-if="explain" :title="explain"></Explain>
          <span v-else>{{tab.name}}</span>
        </div>
        <h2>{{tab.num}}</h2>
    </div>
</template>

<script>
export default {
  props: {
    tab: {default: {}},
    active: {default: false}
  },
  data () {
    return {
      explain: ''
    };
  },
  created () {
    console.log(this.tab)
    this.explain = this.getExplain();
    
  },
  methods: {
    classifyHandle (tab) {
      this.$emit('tabclick', {tab: tab});
    },
    getExplain () {
      switch (this.tab.type) {
        case 'contract':
          return 'explain_a';
        case 'unsign':
          return 'explain_b';
        case 'invalid':
          return 'explain_c';
        case 'onCourse':
          return 'explain_d';
        case 'over':
          return 'explain_e';
        case 'loss':
          return 'explain_f';
        default:
          return null;
      }
    }
  }
};
</script>

<style lang="less" scoped>
    .classify-box {
        width: 140px;
        height: 95px;
        border: 1px #e3e3e3 solid;
        border-left-width: 5px;
        color: #536A81;
        .header {
            margin: 10px 0 0 15px;
            padding-left: 15px;
            &::after {
                content: '';
                width: 9px;
                height: 10px;
                position: absolute;
                left: 0;
                top: 5px;
                background: url(../../images/common/student_2.png) no-repeat;
                background-size: 100%;
            }
        }
        &.active {
            border-left-color: #45DAD5;
            color: #45DAD5 !important;
            .header {
                &::after {
                    background: url(../../images/common/student_1.png) no-repeat !important;
                    background-size: 100%;
                }
            }
        }
         &.invalid {
            color: #999;
            .header {
                &::after {
                    background: url(../../images/common/student_3.png) no-repeat;
                    background-size: 100%;
                }
            }
        }
        h2 {
            font-size: 32px;
            margin: 15px 0 0 15px;
        }
    }
</style>

