<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="未签约学员">
                <MyButton v-if="$$tools.isAuthority('registerStudent')" class="mr-20" @click.native="addStudent">登记学员</MyButton>
                <router-link v-if="$$tools.isAuthority('importStudent')" :to="{path: '/student/importstudent'}"><MyButton icon="import" type="border" fontColor="fc-m">导入学员</MyButton></router-link>
            </TableHeader>

            <div class="header-tab-box d-f f-j-b mt-50">
                <Classify v-for="(tab, index) in tabLists" :key="index" :tab="tab" :active="activeTab == tab.type" @tabclick="tabClick(tab)"></Classify>
            </div>
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

                <MyButton v-if="$$tools.isAuthority('exportUnsigned')" icon="import" type="border" fontColor="fc-m" class="ml-20" @click.native="exportStudent">导出学员</MyButton>
            </div>

            <el-table class="student-table mt-20" :data="studentTable.data" v-loading="loading" stripe @selection-change="handleSelectionChange" ref="studentTable">
                <el-table-column type="selection" width="30" v-if="isShowCheckbox"></el-table-column>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="学员姓名" align="center">
                    <template slot-scope="scope">
                        <router-link v-if="$$tools.isAuthority('studentDetail')" :to="{path: '/student/nosigndetail', query: {student_id: scope.row.id}}" class="fc-m">{{scope.row.name}}</router-link>
                        <span v-else>{{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="联系电话" prop="parent_info.mobile" align="center"></el-table-column>
                <el-table-column label="课程顾问" align="center">
                    <template slot-scope="scope">
                        <div v-if="scope.row.advisor_info">{{scope.row.advisor_info.name}}</div>
                        <div v-else-if="activeTab == 'unsign' || activeTab == 'no_advisor' || activeTab == 'following'" class="d-f f-a-c f-j-c">
                            <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                <span class="el-dropdown-link">
                                    <div v-if="$$tools.isAuthority('assignConsultant')" class="allocation-advisor-btn" slot="reference" @click="listStudentId = scope.row.id">分配</div>
                                </span>
                                <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                    <el-scrollbar style="height: 100%;">
                                        <el-dropdown-item v-for="(item, index) in $store.state.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                    </el-scrollbar>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
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
                <el-table-column label="定金金额（元）" align="center">
                  <template slot-scope="scope">{{scope.row.deposit_money > 0 ? scope.row.deposit_money : '-'}}</template>
                </el-table-column>
                <el-table-column label="渠道来源" prop="source_info.name" align="center"></el-table-column>
                <el-table-column label="学员登记时间" prop="created_at" :formatter="dateForamt" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <span v-if="$$tools.isAuthority('purchaseCourse')" class="cursor-pointer fc-m" @click="handleCommand({type: 'buyCourse', data: scope.row})">购课</span>
                        <span v-if="$$tools.isAuthority('handleAudition')" class="cursor-pointer fc-m ml-10" @click="handleCommand({type: 'audition', data: scope.row})">试听</span>
                        <el-dropdown trigger="click" @command="handleCommand" placement="bottom">
                          <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                          <el-dropdown-menu slot="dropdown" class="operation-lists">
                            <el-dropdown-item v-for="(operation, index) in operationLists" :key="index"
                              v-if="(operation.type === 'edit' && $$tools.isAuthority('editUnsigned'))
                              || (operation.type === 'down_payment' && $$tools.isAuthority('payDeposit') && scope.row.deposit_money <= 0)
                              || (operation.type === 'back_payment' && $$tools.isAuthority('returnDeposit') && scope.row.deposit_money > 0)
                              || (operation.type == 'delete' && $$tools.isAuthority('delereUnsigned'))"
                              :command="{type: operation.type, data: scope.row}">{{ operation.text}}
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>

            <div class="d-f p-r" v-if="$$tools.isAuthority('delereUnsigned')">
              <div class="multiple-del-box d-f f-a-c">
                <span v-if="isShowCheckbox" class="fc-9 cursor-pointer" :class="{'fc-m': selectedIds.length}" @click="deleteStudent('all')">批量删除</span>
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

      paymentDetail: {},

      listStudentId: '',
      operationLists: [
        // {type: 'buy_course', text: '购课'},
        // {type: 'audition', text: '试听'},
        {type: 'edit', text: '编辑'},
        {type: 'delete', text: '删除'},
        {type: 'down_payment', text: '缴纳定金'},
        {type: 'back_payment', text: '退回定金'}
      ],

      headTab: ['意向学员', '未分配顾问学员', '跟进中学员', '无效学员'],
      studentTable: {},
      searchKeyWord: '',

      searchFilter: {type: 'unsign', name: '', mobile: '', advisor_id: '', source_id: '', follow_status: ''}, //搜索筛选条件
      dialogStatus: {student: false, course: false, contract: false, audition: false, payment: false},
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
      let result = await this.$$request.post('/student/delete', {id: id === 'all' ? this.selectedIds : [id]});

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
    // 取消批量删除
    cancelMultipleDel () {
      this.isShowCheckbox = false;
      this.selectedIds.splice(0, this.selectedIds.length);
      this.$refs.studentTable.clearSelection();
    },
    handleSelectionChange (x) {
      this.selectedIds = x.map(v => v.id);
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
        case 'buyCourse':
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

      window.location.href = `${baseUrl}student/lists?${qs.stringify(params)}`;
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
    //列表顾问选择
    async listAdvisorChange (val) {
      let result = await this.$$request.post('/student/distribute', {student_id: this.listStudentId, advisor_id: val});

      console.log(result);
      if (!result) {
        return 0;
      }

      this.getAllLists(true);
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
      this.tabLists = result.lists.map((v, index) => {
        v.name = this.headTab[index];

        return v;
      });

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


