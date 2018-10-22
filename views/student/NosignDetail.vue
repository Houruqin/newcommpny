<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <div class="d-f detail-header p-r">
              <div class="left t-a-c">
                <img v-if="detail.sex" src="../../images/student/boy.png" alt="">
                <img v-else src="../../images/student/girl.png" alt="">
                <p class="mt-5">
                  <span class="fs-16">{{detail.name}}</span>
                  <i class="iconfont icon-bianji cursor-pointer" @click="editStudent"></i>
                </p>
                <p class="mt-10"><span class="fc-9">学员编号：</span>{{detail.id}}</p>
                <p><span class="fc-9">课堂评分：</span>{{detail.score}}</p>
              </div>
              <div class="right flex1 pl-20 pt-20" v-if="detail.parent_info">
                <p><span>性　　别：</span>{{detail.sex ? '男' : '女'}}</p>
                <p><span>出生日期：</span>{{detail.birthday > 0 ? $$tools.format(detail.birthday) : ''}}</p>
                <div class="d-f parent-info">
                  <div class="fc-9">家长信息：</div>
                  <div class="flex1 fc-2">
                    <p v-if="!detail.parent_info.name && detail.parent_info.pivot.relation === 7">
                      <span>暂无</span>
                      <span class="pl-20">{{detail.parent_info.mobile}}</span>
                    </p>
                    <p v-if="detail.parent_info.name">
                      <span>{{detail.parent_info.name}}({{getRelations(detail.parent_info.relation)}})</span>
                      <span class="pl-20">{{detail.parent_info.mobile}}</span>
                    </p>
                    <div v-if="detail.deputyParentInfo.length">
                      <div v-for="(item, num) in detail.deputyParentInfo" :key="num">
                        <p v-if="!item.name">
                          <span>暂无</span>
                          <span class="pl-20">{{item.mobile}}</span>
                        </p>
                        <p v-if="item.name">
                          <span>{{item.name}}({{getRelations(item.pivot.relation)}})</span>
                          <span class="pl-20">{{item.mobile}}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p><span>联系电话：</span>{{detail.parent_info.mobile}}</p>
                <p><span>家庭住址：</span>{{detail.address}}</p>
                <p><span>登记时间：</span>{{$$tools.format(detail.registerInfo.created_at)}}</p>
                <p><span>登记人员：</span>{{detail.registerInfo.operator.name}}</p>
                <div class="d-f">
                  <span>学员备注：</span>
                  <template v-if="detail.remark && detail.remark.length > 30">
                      <el-popover popper-class="grade-student-popver" placement="right" trigger="hover" width="200" :content="detail.remark">
                          <div slot="reference" class="cursor-pointer">
                              <a class="fc-2">{{detail.remark.substring(0, 30)}}...</a>
                          </div>
                      </el-popover>
                  </template>
                  <span v-else>{{detail.remark}}</span>
                </div>
              </div>
              <div class="p-a d-f btn-toolbar">
                <MyButton class="ml-20" v-if="$$cache.getMemberInfo().class_pattern !== 2" @click.native="addListenHandle">试听</MyButton>
                <MyButton class="ml-20" @click.native="buyCourse">购课</MyButton>
              </div>
            </div>
        </el-card>

        <el-card class="mt-20" shadow="hover">
            <TableHeader title="跟进记录"></TableHeader>
            <div class="followup-lists-box pl-80" v-loading="loading">
                <div class="d-f"><MyButton class="ml-156 mt-20" @click.native="addFollowUp">添加跟进</MyButton></div>
                <div v-if="followUpLists.total">
                    <FollowUpList v-for="(item, index) in followUpLists.data" :list="item" :key="index"></FollowUpList>
                </div>
                <div v-else class="d-f f-a-c f-j-c fc-9 nothing"><span>暂无数据</span></div>
            </div>
        </el-card>

        <!-- 添加跟进弹窗 -->
        <el-dialog title="添加跟进" width="600px" center :visible.sync="maskFollowUp" :close-on-click-modal="false" @close="dialogClose('followUpForm')">
            <el-form :model="followUpForm" label-width="125px" size="small" :rules="followUpRules" ref="followUpForm">
                <div class="form-box">
                    <el-form-item label="跟进方式：" prop="way_id" class="mt-30">
                        <el-select v-model="followUpForm.way_id" placeholder="请选择">
                            <el-option v-for="(item, index) in wayIdArr" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="跟进结果：" prop="status" class="mt-30">
                        <el-select v-model="followUpForm.status" placeholder="请选择" @change="followUpStatusChange">
                            <el-option v-for="(item, index) in $store.state.followupStatus"
                            :key="index" :label="item.comment" :value="item.code" v-if="item.code !== 10 && item.code !== -2 && item.code !== 0 "></el-option>
                        </el-select>
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
                        <el-date-picker type="datetime" :editable="false" v-model="followUpForm.next_at" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                    </el-form-item>

                    <div class="d-f f-j-c mt-50"><MyButton @click.native="followUpDoneHandle('followUpForm')" :loading="submitLoading">确定</MyButton></div>
                </div>
            </el-form>
        </el-dialog>

        <!-- 试听弹窗 -->
        <AddAudition v-model="dialogStatus.audition" :studentId="studentId" :auditionType="auditionType" @CB-audition="CB_audition"></AddAudition>

        <!-- 登记学员弹窗 -->
        <AddStudentDialog  :dialogStatus="dialogStatus.student" :editDetail="editDetail" :type="studentType"
            @CB-dialogStatus="CB_dialogStatus" @CB-addStudent="CB_addStudent">
        </AddStudentDialog>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import FollowUpList from '../../components/common/FollowUp';

import {StudentStatic} from '../../script/static';

import AddStudentDialog from '../../components/dialog/AddStudent';
import AddAudition from '../../components/dialog/AddAudition';

export default {
  components: {TableHeader, MyButton, AddStudentDialog, FollowUpList, AddAudition},
  data () {
    return {
      submitLoading: false,
      state: 'loading',

      detail: {},
      studentId: '',
      loading: true,

      auditionType: 'audition',

      checkListenCourse: {timetable_id: '', course_name: '', begin_time: ''}, //试听课程，跟进form显示
      currPage: false,

      auditionData: {time: new Date().getTime(), teacher_lists: [], course_lists: [], teacher_id: '', course_id: ''}, //试听数据
      maskFollowUp: false, //跟进弹窗

      dialogStatus: {student: false, course: false, contract: false, audition: false},
      editDetail: {},

      studentType: '',
      wayIdArr: StudentStatic.followUp.wayId,

      followUpLists: [], //跟进列表
      followUpForm: {
        way_id: '', //跟进方式
        status: '', //跟进结果
        invited_at: '', //邀约时间
        content: '', //跟进内容
        next_at: '',
        money: '' //定金金额  如果选择跟进为已交定金
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
        next_at: []
      },
      sourceRules: {
        name: [
          {required: true, message: '请输入渠道'},
          {max: 20, message: '长度不能超过20个字符'}
        ]
      },
      pickerBeginDateAfter: {
        disabledDate: (time) => {
          return time.getTime() > new Date().getTime();
        }
      },
      pickListenDisable: {
        disabledDate: (time) => {
          return time.getTime() < new Date().setHours(0, 0, 0, 0);
        }
      }
    };
  },
  methods: {
    getRelations (id) {
      let text = '';

      this.$store.state.familyRelations.forEach(v => {
        if (id == v.id) {
          text = v.name;
        }
      });

      return text;
    },
    dialogClose (form) {
      this.$refs[form].resetFields();
    },
    moneyValidate () {
      return (rule, value, callback) => {
        if (value <= 0) {
          return callback(new Error('金额必须大于0'));
        }

        return callback();
      };
    },
    //弹窗变比，改变dialog状态回调
    CB_dialogStatus (type) {
      if (type === 'student') {
        this.dialogStatus.student = false;
        this.editDetail = {};
      }
    },
    //修改详情成功，刷新列表
    CB_addStudent () {
      this.getStudentDetail();
      this.dialogStatus.student = false;
    },
    // 跟进 选择试听关闭回调
    CB_audition (data) {
      this.checkListenCourse = data;
    },
    //添加跟进
    addFollowUp () {
      Object.keys(this.followUpForm).forEach(v => {
        this.followUpForm[v] = '';
      });
      this.maskFollowUp = true;
    },
    //跟进结果选择
    followUpStatusChange (value) {
      if (value === 4) {
        this.auditionType = 'followup_audition';
        this.dialogStatus.audition = true;
      } else {
        this.followUpForm.money = '';
        this.listenCourseInit();
      }
    },
    //添加试听
    addListenHandle () {
      this.auditionType = 'audition';
      this.dialogStatus.audition = true;
    },
    //试听跟进弹窗关闭，数据重置
    listenCourseInit () {
      Object.keys(this.checkListenCourse).forEach(v => {
        this.checkListenCourse[v] = '';
      });
    },
    //购课
    buyCourse () {
      let params = {
        student_id: this.detail.id,
        advisor_id: this.detail.advisor_id,
        advisor: this.detail.advisor,
        parent_id: this.detail.parent_id,
        deposit_money: this.detail.deposit_money
      };

      this.$router.push({path: '/student/nosignbuycourse', query: {buyCourseData: JSON.stringify(params)}});
    },
    //表单确定
    followUpDoneHandle () {
      this.$refs.followUpForm.validate(valid => {
        if (valid) {
          this.submitFollowUpInfo();
        }
      });
    },
    nextClick (currentPage) {
      this.currPage = true;
      this.getFollowUpLists(currentPage);
    },
    prevClick (currentPage) {
      this.currPage = true;
      this.getFollowUpLists(currentPage);
    },
    //跟进分页
    paginationClick (currentPage) {
      if (!this.currPage) {
        this.getFollowUpLists(currentPage);
      }
      this.currPage = false;
    },
    //编辑
    editStudent () {
      this.studentType = 'edit';
      this.editDetail = this.detail;
      this.dialogStatus.student = true;
    },
    //提交跟进
    async submitFollowUpInfo () {
      if (this.followUpForm.status === 4 && !this.checkListenCourse.timetable_id) {
        return this.$message.warning('邀约试听，试听课程不能为空!');
      }

      if (this.submitLoading) {
        return 0;
      }

      this.submitLoading = true;
      let params = {
        type_id: 5, //type_id默认售前跟进5
        student_id: this.detail.id,
        invited_at: this.followUpForm.invited_at / 1000,
        next_at: this.followUpForm.next_at / 1000,
        way_id: this.followUpForm.way_id,
        content: this.followUpForm.content,
        status: this.followUpForm.status
      };

      if (this.checkListenCourse.timetable_id) {
        params.timetable_id = this.checkListenCourse.timetable_id;
      }

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
      this.maskFollowUp = false;
      this.listenCourseInit();
      this.getFollowUpLists();
    },
    //获取跟进列表
    async getFollowUpLists (currentPage) {
      this.loading = true;
      let params = {student_id: this.studentId};

      if (currentPage) {
        params.page = currentPage;
      }
      let result = await this.$$request.post('/followUp/lists', params);

      console.log(result);
      if (!result) {
        return 0;
      }
      this.followUpLists = result.lists;
      this.loading = false;

      return true;
    },
    //获取学员详情
    async getStudentDetail () {
      let result = await this.$$request.post('/student/detail', {id: this.studentId});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.$set(this, 'detail', result.detail);

      return true;
    },
    async pageInit () {
      let [a, b] = await Promise.all([this.getStudentDetail(), this.getFollowUpLists()]);

      if (a && b) {
        this.state = 'loaded';
      }
    }
  },
  created () {
    if (this.$route.query.student_id) {
      this.studentId = this.$route.query.student_id;
    }
    this.pageInit();
  },
  watch: {
    $route (val) {
      this.state = 'loading';
      this.studentId = val.query.student_id;
      this.pageInit();
    }
  }
};
</script>

<style lang="less" scoped>
    h5 {font-weight: normal}

    .table-header {
        height: 50px;
        border-bottom: 1px #e3e3e3 solid;
        span {
            padding-left: 20px;
        }
        a {
            width: 80px;
            line-height: 35px;
            border-radius: 3px;
            margin-left: 20px;
        }
    }
    .detail-header {
      padding: 20px;
      .btn-toolbar {
        top: 30px;
        right: 30px;
      }
      .left {
        border-right: 1px #e3e3e3 solid;
        padding: 20px;
      }
      .right {
        p {
          margin-bottom: 10px;
        }
        span {
          color: #999;
        }
      }
      .parent-info {
        span {
          color: #303133;
        }
      }
    }

    .followup-lists-box {
      .nothing {
          height: 200px;
      }
    }
    .form-box {
        padding: 0 20px;
        .el-select, .el-date-editor {
            width: 100%;
        }
        h3 {
            font-weight: normal;
            font-size: 14px;
            padding-left: 38px;
            margin-bottom: 15px;
        }
        .add-source {
            img {
                position: relative;
                top: 3px;
            }
        }
    }
    .contract-box {
        padding: 0 30px;
        p {
            &:not(:first-child) {
                margin-top: 10px;
            }
            span {
                margin-right: 30px;
            }
        }
        .course-table {
            border-collapse: collapse;
            margin-top: 10px;
            td {
                border: 1px #BFBFBF solid;
                width: 120px;
                text-align: center;
                line-height: 40px;
            }
        }
    }
    .listen-course-box {
        max-height: 350px;
        overflow: hidden;
        overflow-y: auto;
    }
    .listen-nothing {
        height: 120px;
    }
    .audition-lists {
        li {
            padding: 20px;
            &:not(:first-child) {
                border-top: 1px #e3e3e3 solid;
            }
            &::after {
                content: '';
                display: block;
                width: 20px;
                height: 20px;
                background: url(../../images/common/not-check.png) no-repeat;
                background-size: 100%;
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
            }
            &.active {
                &::after {
                    background: url(../../images/common/check-box.png) no-repeat;
                    background-size: 100%;
                }
            }
        }
    }
</style>


