<template>
  <el-dialog v-if="Object.keys($store.state.systemSetting).length" :title="$store.state.systemSetting.LeaveTicketDeductLessonNum.num == 3 ? '请假确认' : '请假提醒'" width="600px" center :visible.sync="dialogStatus" :close-on-click-modal="false" @close="dialogClose">
    <div class="pl-50 pr-50">
      <p class="d-f f-j-b">
        <span>
          <i>{{detail.studentName}}</i>
          <i class="pl-20">已请假次数：{{detail.leaveNum}}次</i>
        </span>
        <span v-if="$store.state.systemSetting.LeaveTicketDeductLessonNum.num == 3">本次课时数为：{{detail.lessonNum}}课时</span>
      </p>
      <p class="mt-10">
        <span v-if="$store.state.systemSetting.LeaveTicketDeductLessonNum.num == 1">本次请假将不会扣除课</span>
        <span v-else-if="$store.state.systemSetting.LeaveTicketDeductLessonNum.num == 2">本次请假扣除课时：{{detail.lessonNum}}课时</span>
        <span v-else>本次请假是否扣除课时？</span>
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
    detail: {default: {}}
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


