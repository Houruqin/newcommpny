<template>
  <el-dialog title="请假确认" width="600px" center :visible.sync="dialogStatus" :close-on-click-modal="false" @close="dialogClose">
    <div class="pl-30 pr-30">
      <p class="d-f fs-16">
        <span>该学员已请假次数：{{leaveNum}}次</span>
        <span v-if="$store.state.lesson_num">扣课时数：{{lessonNum}}</span>
      </p>
      <p class="fs-16 mt-10" v-if="Object.keys($store.state.systemSetting).length">
        <span v-if="$store.state.systemSetting.LeaveTicketDeductLessonNum.num == 1">此次请假将不会扣除课时，确认同意请假？</span>
        <span v-else-if="$store.state.systemSetting.LeaveTicketDeductLessonNum.num == 2">此次请假将会扣除课时，确认同意请假？</span>
        <span v-else>此次请假是否需要扣除课时？</span>
      </p>
      <p class="btn-bar d-f mt-40 f-j-c">
        <el-button @click="cancel">否</el-button>
        <el-button type="primary" class="ml-40" @click="done">是</el-button>
      </p>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    value: {default: false},
    leaveNum: {default: 2},
    lessonNum: {default: 2}
  },
  watch: {
    value (newVal) {
      this.dialogStatus = newVal;
    }
  },
  data () {
    return {
      dialogStatus: this.value
    };
  },
  methods: {
    dialogClose () {
      this.dialogStatus = false;
      this.$emit('input', this.dialogStatus);
    },
    done () {
      this.$emit('CB-confirm');
      this.dialogStatus = false;
    },
    cancel () {
      // this.$emit('CB-confirm', 0);
      this.dialogStatus = false;
    }
  }
};
</script>

<style lang="less" scoped>
  .btn-bar {
    a {
      width: 80px;
      height: 35px;
      box-sizing: border-box;
      // border-
    }
  }
</style>


