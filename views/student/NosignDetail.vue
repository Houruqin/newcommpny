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
                  <i v-if="$$tools.isAuthority('editUnsigned')" class="iconfont icon-bianji cursor-pointer" @click="editStudent"></i>
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
                    <p v-if="!detail.parent_info.name && detail.parent_info.relation === 0">
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
                <!-- <p><span>联系电话：</span>{{detail.parent_info.mobile}}</p> -->
                <p><span>家庭住址：</span>{{detail.address}}</p>
                <p><span>登记时间：</span>{{$$tools.format(detail.registerInfo.created_at)}}</p>
                <p><span>登记人员：</span>{{detail.registerInfo.operator.name}}</p>
                <p><span>渠道来源：</span>{{detail.source_info.name}}</p>
                <p><span>就读学校：</span>{{detail.school_name}}</p>
                <div class="d-f">
                  <span>学员备注：</span>
                  <template v-if="detail.remark && detail.remark.length > 30">
                      <el-popover popper-class="grade-student-popver" placement="right" trigger="hover" width="200" :content="detail.remark">
                          <div slot="reference" class="cursor-pointer">
                              <a class="fc-2">{{detail.remark.substring(0, 30)}}...</a>
                          </div>
                      </el-popover>
                  </template>
                  <a v-else>{{detail.remark}}</a>
                </div>
              </div>
              <div class="p-a d-f btn-toolbar">
                <MyButton class="ml-20" v-if="$$cache.getMemberInfo().class_pattern !== 2 && $$tools.isAuthority('handleAudition') && !!detail.advisor" @click.native="addListenHandle">试听</MyButton>
                <MyButton class="ml-20" v-if="$$tools.isAuthority('purchaseViewCourse') && !!detail.advisor" @click.native="buyCourse">购课</MyButton>
              </div>
            </div>
        </el-card>

        <el-card class="mt-20" shadow="hover">
            <TableHeader title="跟进记录"></TableHeader>
            <div class="followup-lists-box pl-80" v-loading="loading">
                <div class="d-f"><MyButton v-if="$$tools.isAuthority('addFollow') && !!detail.advisor" class="ml-156 mt-20" @click.native="addFollowUp">添加跟进</MyButton></div>
                <div v-if="followUpLists.total">
                    <FollowUpList v-for="(item, index) in followUpLists.data" :list="item" :key="index"></FollowUpList>
                </div>
                <div v-else class="d-f f-a-c f-j-c fc-9 nothing"><span>暂无数据</span></div>
            </div>
        </el-card>

        <!-- 添加跟进 -->
        <AddFollowUp v-model="dialogStatus.followUp" :studentId="studentId" @CB-followUpSuccess="CB_followUpSuccess"></AddFollowUp>

        <!-- 试听弹窗 -->
        <AddAudition v-model="dialogStatus.audition" :studentId="studentId" @CB-auditionSuccess="CB_auditionSuccess"></AddAudition>

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

import AddStudentDialog from '../../components/dialog/AddStudent';
import AddAudition from '../../components/dialog/AddAudition';
import AddFollowUp from '../../components/dialog/AddFollowUp';

export default {
  components: {TableHeader, MyButton, AddStudentDialog, FollowUpList, AddAudition, AddFollowUp},
  data () {
    return {
      submitLoading: false,
      state: 'loading',
      detail: {},
      studentId: '',
      loading: true,
      currPage: false,

      dialogStatus: {student: false, course: false, contract: false, audition: false, followUp: false},
      editDetail: {},
      studentType: '',

      followUpLists: [], //跟进列表
      sourceRules: {
        name: [
          {required: true, message: '请输入渠道'},
          {max: 20, message: '长度不能超过20个字符'}
        ]
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
    // 直接试听成功
    CB_auditionSuccess () {
      this.getFollowUpLists();
    },
    CB_followUpSuccess () {
      this.getFollowUpLists();
    },
    //添加跟进
    addFollowUp () {
      this.dialogStatus.followUp = true;
    },
    //添加试听
    addListenHandle () {
      this.dialogStatus.audition = true;
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


