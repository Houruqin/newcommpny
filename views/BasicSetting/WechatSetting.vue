<template>
    <div class="flex1 alarm_setting">
        <el-card shadow="hover">
            <TableHeader title="微信设置"></TableHeader>
            <el-row>
                <el-col class="student_alarm" :span="9" :offset="1">
                    <el-row>
                        <el-col>学员提醒</el-col>
                        <el-col></el-col>
                    </el-row>
                    <el-row>
                        <el-col>购买成功通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.studentCourse.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>分班通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.studentGrade.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>排课通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.timetableStudent.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row class="input_row">
                        <el-col>上课提醒</el-col>
                        <el-col>
                            <div>
                                <el-switch v-model="setting.studentLessonRemind.status">
                                </el-switch>
                            </div>
                            <div>
                                <label>提前多少小时</label>
                                <el-input @change="show_button.studentLessonRemind = true" :disabled="!setting.studentLessonRemind.status" v-model="setting.studentLessonRemind.num" size="small"></el-input>
                                <div v-if="show_button.studentLessonRemind" class="button">保存</div>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>课时消耗提醒</el-col>
                        <el-col>
                            <el-switch v-model="setting.studentLessonEnd.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>请假审核通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.studentLeaveTicketProcessRemind.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>课程变更通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.studentTimetableChange.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>课程取消通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.studentTimetableCancel.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row class="input_row">
                        <el-col>学费即将到期提醒</el-col>
                        <el-col>
                            <div>
                                <el-switch v-model="setting.studentLessonRemainRemind.status">
                                </el-switch>
                            </div>
                            <div>
                                <label>剩余多少小时</label>
                                <el-input v-model="setting.studentLessonRemainRemind.num" size="small"></el-input>
                                <div class="button">保存</div>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>课程结课通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.studentLessonEndRemind.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                </el-col>
                <el-col class="staff_alarm" :span="9" :offset="3">
                    <el-row>
                        <el-col>员工提醒</el-col>
                        <el-col></el-col>
                    </el-row>
                    <el-row>
                        <el-col>老师-排课通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.timetableTeacher.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row class="input_row">
                        <el-col>老师-上课提醒</el-col>
                        <el-col>
                            <div>
                                <el-switch v-model="setting.teacherLessonRemind.status">
                                </el-switch>
                            </div>
                            <div>
                                <label>提前多少小时</label>
                                <el-input v-model="setting.teacherLessonRemind.num" size="small"></el-input>
                                <div class="button">保存</div>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row class="input_row">
                        <el-col>老师-上课结课提醒</el-col>
                        <el-col>
                            <div>
                                <el-switch v-model="setting.teacherLessonEndReminding.status">
                                </el-switch>
                            </div>
                            <div>
                                <label>课后多少小时</label>
                                <el-input v-model="setting.teacherLessonEndReminding.num" size="small"></el-input>
                                <div class="button">保存</div>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>老师-学员请假提醒</el-col>
                        <el-col>
                            <el-switch v-model="setting.teacherLeaveTicketRemind.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>老师-课程变更通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.teacherTimetableChange.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>老师-课程取消通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.teacherTimetableCancel.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row class="input_row">
                        <el-col>老师-学员学费即将到期提醒</el-col>
                        <el-col>
                            <div>
                                <el-switch v-model="setting.teacherStudentLessonRemainRemind.status">
                                </el-switch>
                            </div>
                            <div>
                                <label>剩余多少小时</label>
                                <el-input v-model="setting.teacherStudentLessonRemainRemind.num" size="small"></el-input>
                                <div class="button">保存</div>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>顾问-学员分配提醒</el-col>
                        <el-col>
                            <el-switch v-model="setting.sellerStudentDistribute.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                    <el-row class="input_row">
                        <el-col>老师-客户跟进提醒</el-col>
                        <el-col>
                            <div>
                                <el-switch v-model="setting.sellerFollowUpReminding.status">
                                </el-switch>
                            </div>
                            <div>
                                <label>提前多少小时</label>
                                <el-input v-model="setting.sellerFollowUpReminding.num" size="small"></el-input>
                                <div class="button">保存</div>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col>顾问-签约成功通知</el-col>
                        <el-col>
                            <el-switch v-model="setting.sellerStudentSign.status">
                            </el-switch>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>
<script>
import TableHeader from "../../components/common/TableHeader";

export default {
  data() {
    return {
      setting: {
          //学员-购买通知
          studentCourse: {num: 0,status: 0},
          //学员-分班通知
          studentGrade: {num: 0,status: 0},
          //学员-排课通知
          timetableStudent: {num: 0,status: 0},
          //学员-上课提醒
          studentLessonRemind: {num: 0,status: 0},
          //学员-课时消耗提醒
          studentLessonEnd: {num: 0,status: 0},
          //学员-请假审核通知
          studentLeaveTicketProcessRemind: {num: 0,status: 0},
          //学员-修改课表
          studentTimetableChange: {num: 0,status: 0},
          //学员-课程取消
          studentTimetableCancel: {num: 0,status: 0},
          //学员-学费即将到期提醒
          studentLessonRemainRemind: {num: 0,status: 0},
          //学员-结课通知
          studentLessonEndRemind: {num: 0,status: 0},
          //教师-排课通知
          timetableTeacher: {num: 0,status: 0},
          //老师-上课提醒
          teacherLessonRemind: {num: 0,status: 0},
          //老师-课程结束未结课时间提醒
          teacherLessonEndReminding: {num: 0,status: 0},
          //教师-学员请假提醒
          teacherLeaveTicketRemind: {num: 0,status: 0},
          //老师-修改课表
          teacherTimetableChange: {num: 0,status: 0},
          //教师-课程取消
          teacherTimetableCancel: {num: 0,status: 0},
          //老师-学员剩余课时提醒
          teacherStudentLessonRemainRemind: {num: 0,status: 0},
          //顾问-学员分配提醒
          sellerStudentDistribute: {num: 0,status: 0},
          //顾问-客户跟进提醒
          sellerFollowUpReminding: {num: 0,status: 0},
          //顾问-签约成功通知
          sellerStudentSign: {num: 0,status: 0},
      },
      show_button: {
          studentLessonRemind: false,
        //   studentLessonRemind: false,
        //   studentLessonRemind: false,
        //   studentLessonRemind: false,
      }
    };
  },
  methods: {
    get_alarm_setting_info() {
      this.$$request.get("api/school/weixinRemindSetLists").then(res => {
        this.setting = res.datas;
        let result = res.datas;
        Object.keys(result).forEach(i => {
            result[i].status = Boolean(result[i].status)
        })
      });
    }
  },
  created() {
    this.get_alarm_setting_info();
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
          }
      }
  }
}
</style>
