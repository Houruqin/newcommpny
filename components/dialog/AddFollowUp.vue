<template>
  <el-dialog title="添加跟进" width="600px" center :visible.sync="dialogStatus.followUp" :close-on-click-modal="false" @close="dialogClose('followUpForm')">
      <el-form :model="followUpForm" label-width="125px" size="small" :rules="followUpRules" ref="followUpForm">
          <div class="form-box">
              <el-form-item label="跟进方式：" prop="way_id" class="mt-30">
                  <el-select v-model="followUpForm.way_id" placeholder="请选择">
                      <el-option v-for="(item, index) in wayIdArr" :key="index" :label="item.name" :value="item.id"></el-option>
                  </el-select>
              </el-form-item>

              <el-form-item label="跟进结果：" prop="status" class="mt-30">
                  <el-select v-model="followUpForm.status" placeholder="请选择" @change="followUpStatusChange">
                      <el-option v-for="(item, index) in $store.state.followupStatus" :key="index" :label="item.comment" :value="item.code"
                      v-if="(item.code === 4 && $$tools.isAuthority('handleAudition')) || (item.code === 9 && $$tools.isAuthority('payReturnDeposit')) || ![-2,0,4,9,10].includes(item.code) "></el-option>
                  </el-select>
              </el-form-item> 

              <el-form-item label="未上门原因：" prop="reason" v-if="followUpForm.status === 1" key="uncommitted">
                <el-select v-model="followUpForm.reason" placeholder="请选择未上门原因">
                    <el-option v-for="(item, index) in $store.state.uncommitted" :key="index" :label="item.reason" :value="item.id"></el-option>
                </el-select>
                <div class="p-a add-room ver-c cursor-pointer" @click="addUncommitted"><img src="../../images/common/add.png" alt=""></div>
              </el-form-item>

              <el-form-item v-if="followUpForm.status === 4 && checkListenCourse.timetable_id">
                  <span>试听课程：{{checkListenCourse.course_name}}</span>
                  <span class="ml-10">上课时间: {{checkListenCourse.begin_time}}</span>
              </el-form-item>

              <el-form-item label="定金金额：" prop="money" v-if="followUpForm.status === 9" key="depositMoney">
                <el-input type="number" v-model.number="followUpForm.money" placeholder="请输入定金金额"></el-input>
              </el-form-item>

              <el-form-item v-if="followUpForm.status === 2" label="邀约到访时间：" prop="invited_at" class="mt-30">
                  <el-date-picker type="datetime" :editable="false" v-model="followUpForm.invited_at" placeholder="选择日期" value-format="timestamp"></el-date-picker>
              </el-form-item>

              <el-form-item label="跟进内容：" prop="content" class="mt-30 textarea-cls">
                  <el-input type="textarea" :rows="6" v-model.trim="followUpForm.content" placeholder="请输入跟进内容"></el-input>
              </el-form-item>

              <el-form-item label="下次跟进：" class="mt-30" prop="next_at">
                  <el-date-picker type="datetime" :editable="false" v-model="followUpForm.next_at" :picker-options="pickListenDisable" placeholder="选择日期" value-format="timestamp"></el-date-picker>
              </el-form-item>

              <div class="d-f f-j-c mt-50"><MyButton @click.native="followUpDoneHandle()" :loading="submitLoading">确定</MyButton></div>
          </div>
      </el-form>

      <!-- 试听弹窗 -->
      <AddAudition v-model="dialogStatus.audition" :studentId="studentId" auditionType="followup_audition" @CB-audition="CB_audition" :istoBody="true"></AddAudition>
      
      <!-- 添加未承诺上门原因 -->
      <AddUncommitted :visible="dialogStatus.uncommitted" label="跟进状态" @close="$store.dispatch('getUncommitted');dialogStatus.uncommitted = false"/>
  </el-dialog>
</template>

<script>
import MyButton from '../common/MyButton';
import {StudentStatic} from '../../script/static';
import AddAudition from '../../components/dialog/AddAudition';
import AddUncommitted from '../../components/dialog/AddUncommitted';

export default {
  components: {MyButton, AddAudition, AddUncommitted},
  props: {
    value: {default: false},
    studentId: {default: ''}
  },
  watch: {
    value (val) {
      this.dialogStatus.followUp = val;
    }
  },
  data () {
    return {
      dialogStatus: {followUp: this.value, audition: false, uncommitted: false},
      checkListenCourse: {timetable_id: '', course_name: '', begin_time: '', done_type: 'yes'}, //试听课程，跟进form显示
      wayIdArr: StudentStatic.followUp.wayId,
      followUpForm: {
        way_id: '', //跟进方式
        status: '', //跟进结果
        invited_at: '', //邀约时间
        content: '', //跟进内容
        next_at: '',
        money: '', //定金金额  如果选择跟进为已交定金
        reason: ''
      },
      followUpRules: {
        way_id: [
          {required: true, message: '请选择跟进方式', trigger: 'change'}
        ],
        status: [
          {required: true, message: '请选择跟进结果', trigger: 'change'}
        ],
        invited_at: [
          {required: true, message: '请选择邀约时间', trigger: 'change'}
        ],
        content: [
          {required: true, message: '请填写跟进内容'},
          {max: 150, message: '长度不能超过150个字符'}
        ],
        money: [
          {required: true, message: '请输入定金金额'},
          {validator: this.moneyValidate()},
          {validator: this.$$tools.formOtherValidate('decimals', 2)},
          {validator: this.$$tools.formOtherValidate('total', 9999)}
        ],
        next_at: [],
        // reason: [
        //   {required: true, message: '请选择未上门原因', trigger: 'change'}
        // ],
      },
      submitLoading: false,
      pickListenDisable: {
        disabledDate: (time) => {
          return time.getTime() < new Date().setHours(24, 0, 0, 0) - 864e5;
        }
      },
    }
  },
  methods: {
    // 跟进 选择试听关闭回调
    CB_audition (data) {
      this.checkListenCourse = data;
    },
    dialogClose () {
      this.$emit('input', false);
      this.$refs.followUpForm.resetFields();
    },
    moneyValidate () {
      return (rule, value, callback) => {
        if (value <= 0) {
          return callback(new Error('金额必须大于0'));
        }

        return callback();
      };
    },
    //添加未上门原因
    addUncommitted() {
      console.log(11111111)
      this.dialogStatus.uncommitted = true;
    },
    followUpStatusChange (value) {
      if (value === 4) {
        this.dialogStatus.audition = true;
      } else {
        this.followUpForm.money = '';
        this.listenCourseInit();
      }
    },
    //试听跟进弹窗关闭，数据重置
    listenCourseInit () {
      Object.keys(this.checkListenCourse).forEach(v => {
        this.checkListenCourse[v] = '';
      });
    },
    followUpDoneHandle () {
      this.$refs.followUpForm.validate(valid => {
        if (valid) {
          this.submitFollowUpInfo();
        }
      });
    },
    //提交跟进
    async submitFollowUpInfo () {
      if (this.followUpForm.status === 4 && this.checkListenCourse.done_type === 'yes' && !this.checkListenCourse.timetable_id) {
        return this.$message.warning('邀约试听，试听课程不能为空!');
      }

      if (this.followUpForm.next_at && this.followUpForm.next_at < new Date().getTime()) {
        return this.$message.warning('下次跟进时间不能小于当前时间');
      }

      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;

      let params = {
        type_id: 5, //type_id默认售前跟进5
        student_id: this.studentId,
        invited_at: this.followUpForm.invited_at / 1000,
        next_at: this.followUpForm.next_at / 1000,
        way_id: this.followUpForm.way_id,
        content: this.followUpForm.content,
        status: this.followUpForm.status,
        timetable_id: this.checkListenCourse.timetable_id,
        uncommitted_reason_id: this.followUpForm.reason
      };

      if (this.followUpForm.status === 9) {
        params.depositMoney = this.followUpForm.money;
      }
      console.log(params);

      let result = await this.$$request.post('/followUp/add', params);

      this.submitLoading = false;
      console.log(result);
      if (!result) {
        return 0;
      }
      this.$message.success('添加成功');
      this.dialogStatus.followUp = false;
      this.$emit('CB-followUpSuccess');
      this.listenCourseInit();
    }
  }
}
</script>

<style lang="less" scoped>
  .form-box {
      padding: 0 20px;
      /deep/ .el-input, .el-textarea {
        width: 350px;
      }
      .add-room {
            right: 0px;
            img {
                display: block;
            }
        }
      h3 {
          font-weight: normal;
          font-size: 14px;
          padding-left: 38px;
          margin-bottom: 15px;
      }
  }
</style>

