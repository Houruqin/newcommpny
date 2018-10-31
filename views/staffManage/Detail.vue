<template>
    <div class="flex1">
        <PageState :state="state" />
        <el-card shadow="hover">
            <div class="d-f detail-header f-a-c">
                <div class="pl-20 pr-36 left">
                    <a>
                      <img v-if="userDetail.sex === 1" :src="manICon" alt="">
                      <img v-if="userDetail.sex === 0" :src="womanICon" alt="">
                    </a>
                    <div class="mt-5 t-a-c">
                        <span class="fs-16">{{userDetail.name}}</span>
                        <span v-if="userDetail.is_enable == 1" class="iconfont icon-bianji cursor-pointer" @click="editHandle"></span>
                    </div>
                </div>
                <div class="right ml-36">
                    <p><i>职　　位：</i><span v-for="(type,index) in userDetail.type_all" :key="index"><span v-if="index !== 0"> | </span>{{type.type_cn}}</span></p>
                    <p class="mt-10"><i>联系电话：</i><span>{{userDetail.mobile}}</span></p>
                    <p class="mt-10"><i>入职时间：</i><span>{{$$tools.format(userDetail.created_at)}}</span></p>
                </div>
            </div>
        </el-card>

        <el-card class="mt-20" shadow="hover">
            <!-- <TableHeader title="员工数据"></TableHeader> -->
            <el-tabs v-model="activeTab" @tab-click="tabClick" class="tab-toolbar mt-10">
                <el-tab-pane label="跟进名单" name="followUp"></el-tab-pane>
                <el-tab-pane label="签约学员" name="student"></el-tab-pane>
                <el-tab-pane label="任课班级" name="grade"></el-tab-pane>
            </el-tabs>
            <div class="bottom-table">
                <!-- 跟进名单 -->
                <el-table :data="bottomLists.data" stripe v-loading="loading" v-if="activeTab === 'followUp'" key="followUp" class="followup-table">
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                          <router-link v-if="$$tools.isAuthority('studentDetail')" :to="{path: '/student/nosigndetail', query: {student_id: scope.row.id}}" class="fc-m">{{scope.row.name}}</router-link>
                          <span v-else>{{scope.row.name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" align="center" prop="mobile"></el-table-column>
                    <el-table-column label="跟进状态" align="center">
                        <template slot-scope="scope">
                            <div class="d-f f-a-c f-j-c">
                                <span class="follow-status fs-12" :class="{'green': scope.row.followup_status === 2 || scope.row.followup_status === 3 || scope.row.followup_status === 4 || scope.row.followup_status === 5,
                                'red': scope.row.followup_status === 1 || scope.row.followup_status === 6 || scope.row.followup_status === -2, 'gray': scope.row.followup_status === 0 || scope.row.followup_status === -1}">
                                    {{scope.row.followup_status_describe}}
                                </span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="最后跟进日期" align="center">
                        <template slot-scope="scope"><span>{{$$tools.format(scope.row.followup_at)}}</span></template>
                    </el-table-column>
                </el-table>
                <!-- 签约学员列表 -->
                <el-table :data="bottomLists.data" stripe v-loading="loading" v-if="activeTab === 'student'" key="student" class="student-table">
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                            <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student_name}}</router-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" align="center" prop="mobile"></el-table-column>
                    <el-table-column label="购买课程" align="center" prop="course_name"></el-table-column>
                    <el-table-column label="购买日期" align="center">
                        <template slot-scope="scope"><span>{{$$tools.format(scope.row.created_at)}}</span></template>
                    </el-table-column>
                    <el-table-column label="签约人" align="center" prop="user_name"></el-table-column>
                    <el-table-column label="操作" align="center">
                        <template slot-scope="scope"><span class="cursor-pointer fc-m" @click="showContract(scope.row)">查看</span></template>
                    </el-table-column>
                </el-table>
                <!-- 任课班级列表 -->
                <el-table :data="bottomLists.data" stripe v-loading="loading" v-if="activeTab === 'grade'" key="grade" class="grade-table">
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="课程名称" align="center">
                        <template slot-scope="scope"><span v-if="scope.row.course">{{scope.row.course.name}}</span></template>
                    </el-table-column>
                    <el-table-column label="班级名称" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.course">{{scope.row.course.class_pattern == 1 ? scope.row.name : '无'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="课程性质" align="center">
                        <template slot-scope="scope"><span v-if="scope.row.course">{{scope.row.course.type === 1 ? '一对多' : '一对一'}}</span></template>
                    </el-table-column>
                    <el-table-column label="学员人数" align="center" prop="student_num"></el-table-column>
                    <el-table-column label="状态" align="center">
                        <template slot-scope="scope">
                            <div class="fs-12 course-status" v-if="scope.row.gradeStatus">
                                <div class="d-f f-a-c f-j-c">
                                    <span :class="{'green': scope.row.gradeStatus.id === 'yes', 'red': scope.row.gradeStatus.id === 'no', 'gray': scope.row.gradeStatus.id === 'stop'}">
                                        {{scope.row.gradeStatus.name}}
                                    </span>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination v-if="bottomLists.total"
                    class="d-f f-j-c mt-50 mb-50"
                    :page-size="bottomLists.per_page"
                    background layout="total, prev, pager, next"
                    :total="bottomLists.total"
                    :current-page="bottomLists.current_page"
                    @current-change="paginationClick">
                </el-pagination>
            </div>
        </el-card>

        <!-- 新增员工弹窗 -->
        <AddStaffDialog v-model="dialogStatus.detail" :editDetail="editDetail" :staffType="userType"
            @CB-dialogStatus="CB_dialogStatus" @CB-AddStaff="CB_addStaff">
        </AddStaffDialog>

        <!-- 购课合约弹窗 -->
        <ContractDialog :dialogStatus="dialogStatus.contract" :routerAble="false" :contractData="contractData" @CB-dialogStatus="CB_dialogStatus"></ContractDialog>
    </div>
</template>


<script>

import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import AddStaffDialog from '../../components/dialog/AddStaff';
import ContractDialog from '../../components/dialog/Contract';

import adminICon from '../../images/staff/admin.png';
import manICon from '../../images/staff/user-man.png';
import womanICon from '../../images/staff/user-woman.png';

export default {
  components: {TableHeader, MyButton, AddStaffDialog, ContractDialog},
  data () {
    return {
      adminICon: adminICon,
      manICon: manICon,
      womanICon: womanICon,

      state: 'loading',
      loading: false,
      userType: '',
      dialogStatus: {
        detail: false,
        contract: false
      },
      userId: '',
      userDetail: {},
      editDetail: {},
      activeTab: 'followUp',
      bottomLists: {},

      contractData: {}
    };
  },
  methods: {
    editHandle () {
      this.userType = 'edit';
      this.editDetail = this.userDetail;
      this.dialogStatus.detail = true;
    },
    CB_dialogStatus (type) {
      if (type === 'staff') {
        this.userType = '';
        this.editDetail = {};

        return 0;
      }
      if (type === 'contract') {
        this.contractData = {};
        this.dialogStatus.contract = false;

        return 0;
      }
    },
    CB_addStaff () {
      //修改成功，刷新
      this.dialogStatus.detail = false;
      this.getDetail();
    },
    tabClick () {
      this.getBottomLists();
    },
    paginationClick (curr_page) {
      this.getBottomLists(curr_page);
    },
    //任课班级状态
    gradeStatus (data) {
      let date = new Date().getTime() / 1000, result = {};

      if (data.status === -3) {
        result = {id: 'stop', name: '停课'};
      } else if (data.status === -2) {
        result = {id: 'no', name: '未开课'};
      } else {
        result = data.start_time < date ? {id: 'yes', name: '已开课'} : {id: 'no', name: '未开课'};
      }

      return result;
    },
    async getBottomLists (curr_page) {
      this.loading = true;
      let key = this.activeTab === 'followUp' ? 'followRoster' : this.activeTab === 'student' ? 'signRoster' : 'grade';
      let params = {user_id: this.userId};

      if (curr_page) {
        params.page = curr_page;
      }
      let result = await this.$$request.get(`user/${key}`, params);

      console.log(result);

      if (!result) {
        return 0;
      }
      if (this.activeTab == 'grade' && result.lists.data.length) {
        result.lists.data.forEach(d => {
          d.gradeStatus = this.gradeStatus(d);
        });
      }

      this.bottomLists = result.lists;
      this.loading = false;
    },
    async getDetail () {
      let result = await this.$$request.get('/user/detail', {user_id: this.userId});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.userDetail = result.user;

      this.getBottomLists();

      return true;
    },
    //课程信息列表查看合约
    async showContract (data) {
      let result = await this.$$request.get('/studentCourse/detail', {sc_id: data.id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.contractData = result.data;
      this.dialogStatus.contract = true;
    }
  },
  async created () {
    if (this.$route.query.user_id) {
      this.userId = this.$route.query.user_id;
    }
    let datas = await this.getDetail();

    if (datas) {
      this.state = 'loaded';
    }
  }
};
</script>

<style lang="less" scoped>
    .followup-table {
        .follow-status {
            width: 65px;
            text-align: center;
            height: 24px;
            line-height: 24px;
            border-radius: 5px;
            &.red {
                background-color: #FFF0EA;
                color: #aa4e2a;
            }
            &.green {
                background-color: #E4F3E8;
                color: #347924;
            }
            &.gray {
                background-color: #EDEDED;
                color: #555555;
            }
        }
    }
    .course-status {
        span {
            width: 60px;
            text-align: center;
            height: 25px;
            line-height: 25px;
            border-radius: 5px;
            &.green {
                background-color: #E4F3E8;
                color: #347924;
            }
            &.red {
                background-color: #FFF0EA;
                color: #aa4e2a;
            }
            &.gray {
                background-color: #EDEDED;
                color: #555555;
            }
        }
    }
    .dimission-btn {
        right: 0;
        top: 0;
    }
    .detail-header {
      margin: 40px 20px 20px;
      .left {
        border-right: 1px #e3e3e3 solid;
      }
      i {
        color: #999;
      }
    }
</style>

