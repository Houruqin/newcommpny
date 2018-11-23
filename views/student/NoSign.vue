<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
          <TableHeader title="未签约学员">
              <MyButton v-if="$$tools.isAuthority('registerStudent')" class="mr-20" @click.native="addStudent">登记学员</MyButton>
              <router-link v-if="$$tools.isAuthority('importStudent')" :to="{path: '/student/importstudent'}"><MyButton icon="import" type="border" fontColor="fc-m">导入学员</MyButton></router-link>
          </TableHeader>
          <div class="filter-box d-f pt-30">
            <ul class="d-f"><li v-for="item in timeTab" :key="item.id" @click="timeTabClick(item.id)" :class="{active: item.id === timeFilter.type}">{{item.name}}</li></ul>
            <div class="ml-20">
              <el-date-picker size="small" :editable="false" :clearable="false"
                  @change="dateChange" v-model="timeFilter.begin_time"
                  type="date" placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
              <span class="pl-5 pr-5">至</span>
              <el-date-picker size="small" :editable="false" :clearable="false"
                  @change="dateChange" v-model="timeFilter.end_time"
                  type="date" placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
            </div>
          </div>
          <div class="header-tab-box d-f f-j-b mt-30 mb-20">
              <Classify v-for="(tab, index) in tabLists" :key="index" :tab="tab" :active="activeTab == tab.type" @tabclick="tabClick(tab)"></Classify>
          </div>
        </el-card>
        <el-card shadow="hover" class="mt-20">
            <div class="fifter-toolbar mt-30 d-f">
                <ul class="d-f flex1">
                    <li v-if="activeTab !== 'no_advisor'">
                        <el-select size="small" placeholder="全部顾问" v-model="searchFilter.advisor_id" @change="searchHandle">
                            <el-option label="全部顾问" value=""></el-option>
                            <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </li>
                    <li>
                        <el-select size="small" placeholder="所有渠道" v-model="searchFilter.source_id" @change="searchHandle">
                            <el-option label="所有渠道" value=""></el-option>
                            <el-option v-for="(item, index) in $store.state.source" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </li>
                    <li v-if="activeTab !== 'no_advisor' && activeTab !== 'invalid'">
                        <el-select size="small" placeholder="全部跟进" v-model="searchFilter.follow_status" @change="searchHandle">
                            <el-option label="全部跟进" value=""></el-option>
                            <el-option v-for="(item, index) in $store.state.followupStatus" :key="index"
                              :label="item.comment" :value="item.code" v-if="(activeTab !== 'following' && item.code !== -1 && item.code !== -2) || (activeTab === 'following' && item.code !== 0 && item.code !== -1 && item.code !== -2)">
                            </el-option>
                        </el-select>
                    </li>
                    <li class="name"><el-input size="small" placeholder="请输入学员姓名或手机号" v-model.trim="searchKeyWord"></el-input></li>
                    <li><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>

                <MyButton v-if="$$tools.isAuthority('exportStudent')" icon="import" type="border" fontColor="fc-m" class="ml-20" @click.native="exportAuthority">导出学员</MyButton>
            </div>

            <el-table class="student-table mt-20" :data="studentTable.data" v-loading="loading" stripe @selection-change="handleSelectionChange" ref="studentTable">
                <el-table-column type="selection" width="30" v-if="isShowCheckbox"></el-table-column>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="学员姓名" align="center">
                    <template slot-scope="scope">
                        <router-link v-if="$$tools.isAuthority('unSignDetail')" :to="{path: '/student/nosigndetail', query: {student_id: scope.row.id}}" class="fc-m">{{scope.row.name}}</router-link>
                        <span v-else>{{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="联系电话" prop="parent_info.mobile" align="center"></el-table-column>
                <el-table-column label="课程顾问" align="center">
                    <template slot-scope="scope">
                        <div v-if="scope.row.advisor_info">{{scope.row.advisor_info.name}}</div>
                        <div v-else-if="(activeTab !== 'invalid') && $$tools.isAuthority('assignConsultant')" class="d-f f-a-c f-j-c">
                            <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                <span class="el-dropdown-link">
                                    <div class="allocation-advisor-btn" slot="reference" @click="listStudentId = scope.row.id">分配</div>
                                </span>
                                <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                    <el-scrollbar style="height: 100%;">
                                        <el-dropdown-item v-for="(item, index) in $store.state.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                    </el-scrollbar>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                        <div v-if="!scope.row.advisor_info && (activeTab !== 'invalid') && !$$tools.isAuthority('assignConsultant')">暂无顾问</div>
                    </template>
                </el-table-column>
                <el-table-column label="最新跟进状态" align="center">
                    <template slot-scope="scope">
                        <span class="follow-status fc-5" :class="{'green': scope.row.follow_status === 9 || scope.row.follow_status === 10,
                          'fc-subm': scope.row.follow_status === 4 || scope.row.follow_status === 7 || scope.row.follow_status === 1 || scope.row.follow_status === 8}">
                          {{scope.row.follow_cn}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="定金金额（元）" align="center" v-if="activeTab !== 'no_advisor' && activeTab !== 'unFollowed'" key="deposit_money">
                  <template slot-scope="scope">{{scope.row.deposit_money > 0 ? scope.row.deposit_money : '-'}}</template>
                </el-table-column>
                <el-table-column label="渠道来源" prop="source_info.name" align="center"></el-table-column>
                <template>
                  <el-table-column label="学员登记时间" v-if="activeTab === 'unsign' || activeTab === 'no_advisor'" prop="created_at"
                    :formatter="dateForamt" align="center" key="student_create"></el-table-column>
                  <el-table-column label="分配顾问时间" v-if="activeTab === 'unFollowed'" prop="updated_at" :formatter="dateForamt" align="center" key="advisor_create"></el-table-column>
                  <el-table-column label="下次跟进时间" v-if="activeTab === 'following'" prop="updated_at" :formatter="dateForamt" align="center" key="next_follow"></el-table-column>
                  <el-table-column label="判为无效时间" v-if="activeTab === 'invalid'" prop="updated_at" :formatter="dateForamt" align="center" key="invalid_list"></el-table-column>
                </template>
                <el-table-column label="操作" align="center" v-if="operationLists.length && activeTab !== 'no_advisor'" key="operation">
                    <template slot-scope="scope">
                        <span v-for="(operation, num) in operationLists" :key="num" class="fc-m cursor-pointer" @click="handleCommand({type: operation.type, data: scope.row})"
                          :class="{'ml-10': num}" v-if="operationLists.length <= 3 && num < 3 || operationLists.length > 3 && num < 2">
                          {{operation.text}}
                        </span>
                        <el-dropdown trigger="click" @command="handleCommand" placement="bottom" v-if="operationLists.length > 3">
                          <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                          <el-dropdown-menu slot="dropdown" class="operation-lists">
                            <el-dropdown-item v-for="(operation, index) in operationLists" :key="index"
                              v-if="index > 1 && (operation.type === 'edit'
                              || (operation.type === 'down_payment' && scope.row.deposit_money <= 0)
                              || (operation.type === 'back_payment' && scope.row.deposit_money > 0)
                              || operation.type == 'delete')"
                              :command="{type: operation.type, data: scope.row}">{{ operation.text}}
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>

            <div class="d-f p-r" v-if="$$tools.isAuthority('delereUnsigned')">
              <div class="multiple-del-box d-f f-a-c">
                <span v-if="isShowCheckbox" class="fc-9 cursor-pointer" :class="{'fc-m': selectedIds.length}" @click="distributionAdvisor">批量分配</span>
                <span v-if="isShowCheckbox" class="fc-9 cursor-pointer ml-20" :class="{'fc-m': selectedIds.length}" @click="deleteStudent('all')">批量删除</span>
                <MyButton v-if="!isShowCheckbox" @click.native="isShowCheckbox = true" type="border" fontColor="fc-m">批量管理</MyButton>
                <MyButton v-if="isShowCheckbox" type="border" fontColor="fc-m" class="ml-20" :minWidth="70" @click.native="cancelMultipleDel">取消</MyButton>
              </div>
            </div>

            <el-pagination v-if="studentTable.total"
              class="d-f f-j-c mt-50 mb-50"
              :page-size="studentTable.per_page"
              background layout="total, prev, pager, next"
              :total="studentTable.total"
              :current-page="studentTable.current_page"
              @current-change="paginationClick"
              @next-click="nextClick"
              @prev-click="prevClick">
            </el-pagination>
        </el-card>

        <!-- 登记学员弹窗 -->
        <AddStudentDialog  :dialogStatus="dialogStatus.student" :editDetail="editDetail" :type="studentType"
            @CB-dialogStatus="CB_dialogStatus" @CB-buyCourse="CB_buyCourse" @CB-addStudent="CB_addStudent">
        </AddStudentDialog>

        <!-- 试听弹窗 -->
        <AddAudition v-model="dialogStatus.audition" :studentId="listStudentId" @CB-auditionSuccess="CB_auditionSuccess"></AddAudition>

        <!-- 缴纳定金/退回定金 -->
        <PayDeposit v-model="dialogStatus.payment" :paymentDetail="paymentDetail" @CB-payment="CB_payment"></PayDeposit>

        <!-- 批量分配顾问 -->
        <el-dialog title="批量分配顾问" width="540px" center :visible.sync="dialogStatus.advisor" :close-on-click-modal="false" @close="dialogClose('advisor')">
            <p class="t-a-c">
              <span>将</span>
              <span class="fc-m" v-for="(item, index) in selectedIds" :key="index" v-if="index <= 2">
                {{item.student_name}}
                <i v-if="selectedIds.length > 1 && index < (selectedIds.length <= 3 ? selectedIds.length - 1 : 2)">、</i>
              </span>
              <span class="fc-m" v-if="selectedIds.length > 3">等{{selectedIds.length}}名学员</span>
              <span>分配给</span>
            </p>
            <div class="d-f f-j-c mt-20">
              <el-select v-model="advisorId" placeholder="请选择" size="small">
                  <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <div class="d-f f-j-c mt-40">
              <MyButton @click.native="dialogStatus.advisor = false" type="border" fontColor="fc-m">取消</MyButton>
              <MyButton @click.native="advisorMultipleDone()" :loading="submitLoading" class="ml-20">确定</MyButton>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import Classify from '../../components/common/StudentClassify';

import AddStudentDialog from '../../components/dialog/AddStudent';
import AddAudition from '../../components/dialog/AddAudition';
import PayDeposit from '../../components/dialog/PayDeposit';
import Bus from '../../script/bus';
import qs from 'qs';
import config from 'config';

const OperationLists = [
  {type: 'buy_course', text: '购课', permission: 'purchaseViewCourse'},
  {type: 'audition', text: '试听', permission: 'handleAudition'},
  {type: 'edit', text: '编辑', permission: 'editUnsigned'},
  {type: 'delete', text: '删除', permission: 'delereUnsigned'},
  {type: 'down_payment', text: '缴纳定金', permission: 'payReturnDeposit'},
  {type: 'back_payment', text: '退回定金', permission: 'payReturnDeposit'}
];

export default {
  data () {
    return {
      state: 'loading',
      activeTab: 'unsign',
      isShowCheckbox: false,
      selectedIds: [], //批量删除学员列表
      loading: true,
      tabLists: [],

      currPage: false,
      activePage: 1,

      submitLoading: false,

      paymentDetail: {},

      listStudentId: '',
      advisorId: '',
      operationLists: [],

      studentTable: {},
      searchKeyWord: '',

      timeTab: [{id: 'all', name: '全部'}, {id: 'month', name: '本月'}, {id: 'week', name: '本周'}],

      searchFilter: {type: 'unsign', name: '', mobile: '', advisor_id: '', source_id: '', follow_status: ''}, //搜索筛选条件
      timeFilter: {type: 'all', begin_time: '', end_time: ''},
      dialogStatus: {student: false, course: false, contract: false, audition: false, payment: false, advisor: false},
      studentType: '',

      editDetail: {},

      studentLists: [],
      editStudentData: {},
      sourceRules: {
        name: [
          {required: true, message: '请输入渠道'},
          {max: 20, message: '长度不能超过20个字符'}
        ]
      },
      courseRules: {
        course_id: [
          {required: true, message: '请选择课程', trigger: 'change'}
        ],
        lesson_num: [
          {required: true, message: '请输入购买课时数'}
        ],
        given_num: [
          {required: true, message: '请输入赠送课时数'}
        ],
        expire: [
          {required: true, message: '请输入课程有效期'}
        ],
        pay_at: [
          {required: true, message: '请选择购课日期', trigger: 'change'}
        ],
        pay_way: [
          {required: true, message: '请选择付款方式', trigger: 'change'}
        ],
        preferential_price: [
          {required: true, message: '请输入优惠金额'}
        ],
        unit_price: [
          {required: true, message: '请输入课时单价'}
        ],
        explain: [
          {max: 200, message: '长度不能超过200个字符'}
        ]
      },
      pickerBeginDateAfter: {
        disabledDate: (time) => {
          return time.getTime() > new Date().getTime();
        }
      }
    };
  },
  methods: {
    dialogClose (type) {
      if (type === 'advisor') {
        this.advisorId = '';
      }
    },
    //删除学员
    deleteStudent (id) {
      if (id === 'all' && !this.selectedIds.length) {
        return this.$message.error('请至少选中一条数据');
      }

      this.$confirm(`学员删除之后数据不能恢复，请确认进行${id === 'all' ? '批量' : ''}删除操作！`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteHandle(id);
      }).catch(() => {
        return 0;
      });
    },
    async deleteHandle (id) {
      let result = await this.$$request.post('/student/delete', {id: id === 'all' ? this.selectedIds.map(v => v.student_id) : [id]});

      if (!result) {
        return 0;
      }

      this.getAllLists(true);
      this.$message.success('已删除');
      if (id === 'all') {
        this.isShowCheckbox = false;
        this.selectedIds.splice(0, this.selectedIds.length);
      }
    },
    //批量分配
    distributionAdvisor () {
      if (!this.selectedIds.length) {
        return this.$message.error('请至少选中一条数据');
      }

      this.dialogStatus.advisor = true;
    },
    // 批量分配顾问确定
    advisorMultipleDone () {
      if (!this.advisorId) {
        return this.$message.error('请选择顾问');
      }
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;
      this.listAdvisorChange('all');
    },
    timeTabClick (id) {
      this.timeFilter.type = id;

      let date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDay();

      if (id === 'month') {
        this.timeFilter.begin_time = new Date(y, m, 1);
        this.timeFilter.end_time = new Date(y, m + 1, 0);
      } else if (id === 'week') {
        this.timeFilter.begin_time = new Date(date.getTime() - (d - 1) * 864e5);
        this.timeFilter.end_time = new Date(date.getTime() + (7 - d) * 864e5);
      }
    },
    dateChange () {

    },
    //列表顾问选择
    async listAdvisorChange (id) {
      let params = {
        student_id: id === 'all' ? this.selectedIds.map(v => v.student_id) : [this.listStudentId],
        advisor_id: id === 'all' ? this.advisorId : id
      };
      console.log(params);

      let result = await this.$$request.post('/student/distribute', params);
      console.log(result);

      this.submitLoading = false;
      if (!result) {
        return 0;
      }

      this.dialogStatus.advisor = false;
      this.getAllLists(true);
      this.$message.success('分配成功');
      if (id === 'all') {
        this.isShowCheckbox = false;
        this.selectedIds.splice(0, this.selectedIds.length);
      }
    },
    // 取消批量删除
    cancelMultipleDel () {
      this.isShowCheckbox = false;
      this.selectedIds.splice(0, this.selectedIds.length);
      this.$refs.studentTable.clearSelection();
    },
    handleSelectionChange (x) {
      this.selectedIds = x.map(v => {
        return {student_id: v.id, student_name: v.name};
      });
    },
    tabClick (tab) {
      this.searchKeyWord = '';
      if (tab.type != this.activeTab) {
        this.loading = true;
        for (let key in this.searchFilter) {
          if (this.searchFilter.hasOwnProperty(key)) {
            this.searchFilter[key] = key === 'type' ? tab.type : '';
          }
        }

        this.activeTab = tab.type;
        this.getStudentLists();
        this.isShowCheckbox = false;
      }
    },
    CB_payment () {
      this.paymentDetail = {};
      this.getAllLists(true);
    },
    CB_auditionSuccess () {
      this.getStudentLists(this.activePage);
    },
    handleCommand (d) {
      console.log(d);
      switch (d.type) {
        case 'buy_course':
          this.buyCourse(d.data);
          break;
        case 'audition':
          this.listStudentId = d.data.id;
          this.dialogStatus.audition = true;
          break;
        case 'edit':
          this.studentType = 'edit';
          this.editDetail = d.data;
          this.dialogStatus.student = true;
          break;
        case 'delete':
          this.deleteStudent(d.data.id);
          break;
        case 'down_payment':
          this.paymentDetail = {
            id: d.data.id,
            paymentType: 'add'
          };
          this.dialogStatus.payment = true;
          break;
        case 'back_payment':
          this.paymentDetail = {
            id: d.data.id,
            name: d.data.name,
            paymentType: 'back',
            depositMoney: d.data.deposit_money
          };
          this.dialogStatus.payment = true;
          break;
        default:
          console.log(111);
      }
    },
    //购课
    buyCourse (data) {
      let params = {
        student_id: data.id,
        advisor_id: data.advisor_id,
        advisor: data.advisor_info,
        parent_id: data.parent_id,
        deposit_money: data.deposit_money
      };

      this.$router.push({path: '/student/nosignbuycourse', query: {buyCourseData: JSON.stringify(params)}});
    },
    addStudent () {
      this.studentType = 'add';
      this.dialogStatus.student = true;
    },
    async exportAuthority () {
      let res = await this.$$request.get('/student/exportShadow');
      console.log(res)
      if (!res) {
        return 0;
      }
      this.exportStudent();
    },
    //导出学员
    async exportStudent () {
      if (this.searchKeyWord) {
        if (isNaN(this.searchKeyWord)) {
          this.searchFilter.name = this.searchKeyWord;
          this.searchFilter.mobile = '';
        } else {
          this.searchFilter.mobile = this.searchKeyWord;
          this.searchFilter.name = '';
        }
      } else {
        this.searchFilter.mobile = '';
        this.searchFilter.name = '';
      }

      let baseUrl = config.api;
      let token = this.$$cache.get('TOKEN') || this.$$cache.getSession('TOKEN') || '';
      let params = {data: this.searchFilter, token: token.replace('bearer ', '')};

      window.location.href = `${baseUrl}student/export?${qs.stringify(params)}`;
    },
    //弹窗变比，改变dialog状态回调
    CB_dialogStatus (type) {
      if (type === 'student') {
        this.dialogStatus.student = false;
        this.editDetail = {};
        this.studentType = '';
      }
    },
    //登记成功，刷新列表
    CB_addStudent (type) {
      this.getAllLists(type === 'edit');
      this.dialogStatus.student = false;
    },
    //登记成功，购课回调
    CB_buyCourse (data) {
      let params = {
        student_id: data.id,
        advisor_id: data.advisor_id,
        advisor: data.advisor,
        parent_id: data.parent_id,
        deposit_money: data.deposit_money
      };

      this.$router.push({path: '/student/nosignbuycourse', query: {buyCourseData: JSON.stringify(params)}});
    },
    //单元格时间格式化
    dateForamt (row, column, cellValue) {
      return this.$$tools.format(cellValue);
    },
    //搜索
    searchHandle () {
      this.getStudentLists();
    },
    nextClick (currentPage) {
      this.currPage = true;
      this.getStudentLists(currentPage);
    },
    prevClick (currentPage) {
      this.currPage = true;
      this.getStudentLists(currentPage);
    },
    //分页
    paginationClick (currentPage) {
      if (!this.currPage) {
        this.getStudentLists(currentPage);
      }
      this.currPage = false;
    },
    async getAllLists (isCurrPage) {
      let [a, b] = await Promise.all([this.getTabLists(), this.getStudentLists(isCurrPage ? this.activePage : false)]);

      return a && b;
    },
    //获取tab列表
    async getTabLists () {
      let result = await this.$$request.post('/student/tab');

      console.log(result);
      if (!result) {
        return 0;
      }
      this.tabLists = result.lists;

      return true;
    },
    //获取学员列表
    async getStudentLists (currentPage) {
      this.loading = true;
      if (this.searchKeyWord) {
        if (isNaN(this.searchKeyWord)) {
          this.searchFilter.name = this.searchKeyWord;
          this.searchFilter.mobile = '';
        } else {
          this.searchFilter.mobile = this.searchKeyWord;
          this.searchFilter.name = '';
        }
      } else {
        this.searchFilter.mobile = '';
        this.searchFilter.name = '';
      }
      this.searchFilter.startTime = new Date().getTime()/1000;
      this.searchFilter.endTime = new Date().getTime()/1000;
      let params = {data: this.searchFilter};

      if (currentPage) {
        params.page = currentPage;
      }
      console.log(params);

      let result = await this.$$request.post('/student/lists', params);

      console.log(result);
      if (!result) {
        return 0;
      }

      this.activePage = currentPage ? currentPage : 1;
      this.studentTable = result.lists;
      this.loading = false;

      return true;
    }
  },
  async created () {
    Bus.$on('refresh', (type) => {
      if (type === 'student') {
        this.getAllLists();
      }
    });

    this.operationLists = OperationLists.filter(v => {
      return this.$$tools.isAuthority(v.permission);
    });
    console.log(this.operationLists)
    let datas = await this.getAllLists();

    if (datas) {
      this.state = 'loaded';
    }
  },
  beforeRouteEnter (to, from, next) {
    //判断如果是未签约详情过来，那么就不用刷新，直接取缓存即可，否则其他页面过来的，都需要刷新整个页面
    if (from.name === 'nosignDetail') {
      to.meta.keepAlive = true;
    } else {
      to.meta.keepAlive = false;
    }
    next(); //来到页面，包括通过返回
  },
  beforeRouteLeave (to, from, next) {
    next(); //离开页面时，做判断
  },
  beforeDestroy () {
    Bus.$off('refresh');
  },
  components: {Classify, MyButton, TableHeader, AddStudentDialog, AddAudition, PayDeposit}
};
</script>

<style lang="less" scoped>
    .header-tab-box {
        padding: 0 100px;
    }
    .filter-box {
      ul li {
        width: 62px;
        height: 32px;
        box-sizing: border-box;
        border: 1px #45DAD5 solid;
        color: #45DAD5;
        text-align: center;
        line-height: 32px;
        margin-left: 20px;
        cursor: pointer;
        &.active {
          background-color: #45DAD5;
          color: #fff;
        }
      }
      /deep/ .el-input {
        width: 180px;
      }
    }
    .fifter-toolbar {
        ul li {
            margin-right: 20px;
            &:not(:last-child) {
                width: 105px;
            }
            &.name {
                width: auto;
            }
        }
    }
    .student-table {
        border-top: 1px #e3e3e3 solid;
        .follow-status {
            &.red {
                color: #ff853c;
            }
            &.green {
                color: #4bc584;
            }
            &.blue {
                color: #4bb1ff;
            }
        }
        .allocation-advisor-btn {
            width: 50px;
            line-height: 22px;
            border: 1px #45DAD5 solid;
            border-radius: 3px;
            text-align: center;
            color: #45DAD5;
            cursor: pointer;
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
    .multiple-del-box {
      position: absolute;
      top: 20px;
      left: 0;
    }
</style>


