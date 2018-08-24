<template lang="pug">
  .flex1.alarm_setting
    el-card(shadow="hover")
      TableHeader(title="微信设置")
      el-row

        //- 左侧设置列表
        el-col.student_alarm(:span="9" :offset="1")
          el-row #[el-col 学员提醒]#[el-col]

          el-row(v-for="(name, index) in LEFT_SETTING_SORT" :key="index" :class="{ input_row: 'num' in setting[name] }")
            el-col {{ setting[name].label }}
            el-col
              el-switch(v-model="setting[name].status" @change="switchChangeHandler(name)")
              div(v-if="'num' in setting[name]")
                label {{ setting[name].prefix }}
                el-input(v-model="setting[name].num" size="small" :disabled="!setting[name].status")
                .button(:class="{ disabled: !setting[name].status }" v-if="setting[name].num !== setting[name].oldval" @click="buttonClickHandler(name)") 保存

        //- 右侧设置列表
        el-col.student_alarm(:span="9" :offset="3")
          el-row #[el-col 员工提醒]#[el-col]

          el-row(v-for="(name, index) in RIGHT_SETTING_SORT" :key="index" :class="{ input_row: 'num' in setting[name] }")
            el-col {{ setting[name].label }}
            el-col
              el-switch(v-model="setting[name].status" @change="switchChangeHandler(name)")
              div(v-if="'num' in setting[name]")
                label {{ setting[name].prefix }}
                el-input(v-model="setting[name].num" size="small" :disabled="!setting[name].status")
                .button(:class="{ disabled: !setting[name].status }" v-if="setting[name].num !== setting[name].oldval" @click="buttonClickHandler(name)") 保存
</template>
<script>
import TableHeader from '../../components/common/TableHeader';

// 设置项的顺序
const LEFT_SETTING_SORT = ['studentCourse', 'studentGrade', 'timetableStudent', 'studentLessonRemind', 'studentLessonEnd', 'studentLeaveTicketProcessRemind', 'studentTimetableChange', 'studentTimetableCancel', 'studentLessonRemainRemind', 'studentLessonEndRemind'];
const RIGHT_SETTING_SORT = ['timetableTeacher', 'teacherLessonRemind', 'teacherLessonEndReminding', 'teacherLeaveTicketRemind', 'teacherTimetableChange', 'teacherTimetableCancel', 'teacherStudentLessonRemainRemind', 'sellerStudentDistribute', 'sellerFollowUpReminding', 'sellerStudentSign'];

export default {
  data () {
    return {
      LEFT_SETTING_SORT,
      RIGHT_SETTING_SORT,
      setting: {
        // 有num属性表示有input输入框
        studentCourse: { status: 0, label: '学员-购买通知'},
        studentGrade: { status: 0, label: '学员-分班通知' },
        timetableStudent: { status: 0, label: '学员-排课通知' },
        studentLessonRemind: { status: 0, label: '学员-上课提醒', oldval: 0, num: 0, prefix: '提前多少小时' },
        studentLessonEnd: { status: 0, label: '学员-课时消耗提醒' },
        studentLeaveTicketProcessRemind: { status: 0, label: '学员-请假审核通知' },
        studentTimetableChange: { status: 0, label: '学员-修改课表' },
        studentTimetableCancel: { status: 0, label: '学员-课程取消' },
        studentLessonRemainRemind: { status: 0, label: '学员-学费即将到期提醒', oldval: 0, num: 0, prefix: '剩余多少小时' },
        studentLessonEndRemind: { status: 0, label: '学员-结课通知' },
        timetableTeacher: { status: 0, label: '教师-排课通知' },
        teacherLessonRemind: { status: 0, label: '老师-上课提醒', oldval: 0, num: 0, prefix: '提前多少小时' },
        teacherLessonEndReminding: { status: 0, label: '老师-课程结束未结课时间提醒', oldval: 0, num: 0, prefix: '课后多少小时' },
        teacherLeaveTicketRemind: { status: 0, label: '教师-学员请假提醒' },
        teacherTimetableChange: { status: 0, label: '老师-修改课表' },
        teacherTimetableCancel: { status: 0, label: '教师-课程取消' },
        teacherStudentLessonRemainRemind: { status: 0, label: '老师-学员剩余课时提醒', oldval: 0, num: 0, prefix: '剩余多少小时' },
        sellerStudentDistribute: { status: 0, label: '顾问-学员分配提醒' },
        sellerFollowUpReminding: { status: 0, label: '顾问-客户跟进提醒', oldval: 0, num: 0, prefix: '提前多少小时' },
        sellerStudentSign: { status: 0, label: '顾问-签约成功通知' },
      }
    };
  },
  methods: {
    async getWechatSettings () {
      let { datas } = await this.$$request.get('school/weixinRemindSetLists') || {};

      if (!datas) {
        return void 0;
      }

      Object.keys(this.setting).forEach(v => {
        this.setting[v].status = !!datas[v].status;
        this.setting[v].label = datas[v].description;
        if ('num' in this.setting[v]) {
          this.setting[v].num = datas[v].num;
          this.setting[v].oldval = datas[v].num;
        }
      });
    },
    async saveWechatSettings (name) {
      return await this.$$request.post('school/weixinRemindSet', { [name]: { name, ...this.setting[name] } });
    },
    async switchChangeHandler (name) {
      let result = await this.saveWechatSettings(name);

      // 保存失败
      if (null === result) {
        this.setting[name].status = !this.setting[name].status;
      }
    },
    async buttonClickHandler (name) {
      if (!this.setting[name].status) {
        return void 0;
      }

      let result = await this.saveWechatSettings(name);

      // 保存失败
      if (null === result) {
        return void 0;
      }

      // 保存成功
      this.setting[name].oldval = this.setting[name].num;
      this.$message.success('保存成功');
    }
  },
  created () {
    this.getWechatSettings();
  },
  components: {
    TableHeader
  }
};
</script>
<style lang="less" scoped>
.alarm_setting {
  /deep/ .el-switch.is-checked .el-switch__core {
    border-color: #45dad5;
    background-color: #45dad5;
  }
  /deep/ .el-input__inner {
    height: 24px;
    line-height: 24px;
    padding: 0;
    text-align: center;
  }
}

.student_alarm,.staff_alarm {
  > .el-row {
    min-height: 50px;
    padding: 15px 0;
    border-bottom: 1px dashed #e9e9e9;
    color: #555555;
    > .el-col {
      width: 50%;
      &:nth-of-type(2) {
        text-align: right;
      }
    }
    .el-input{
        width: 50px;
    }
  }
  .input_row{
      position: relative;
      .el-col {
          padding: 0;
          height: 55px;
          &:nth-of-type(1){
              line-height: 55px;
          }
          >div{
              height: 20px;
              line-height: 20px;
              &:nth-of-type(2){
                  margin-top: 15px;
                  font-size: 12px;
                  color: #999999;
              }
          }
          .button{
              position: absolute;
              right: -54px;
              bottom: 10px;
              width: 50px;
              height: 26px;
              line-height: 26px;
              border-radius: 2px;
              text-align: center;
              background-color: #45dad5;
              color: #fff;
              cursor: pointer;
              &.disabled {
                background: #dcdfe6;
              }
          }
      }
  }
}
</style>
