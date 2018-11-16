<template>
  <div class="flex1">
    <PageState :state="state" />
    <el-card shadow="hover">
      <TableHeader title="收款管理"></TableHeader>

      <el-tabs v-model="activeTab" @tab-click="tabClick" class="tab-toolbar">
          <el-tab-pane label="合同收款" name="contract"></el-tab-pane>
          <el-tab-pane label="转课差价" name="changeCourse"></el-tab-pane>
      </el-tabs>

      <div class="toolbar mt-20">
        <ul class="d-f date_type">
          <li @click="choose_date('current_month')">
            <div :class="[{'selected' : search_info.date_type === 'current_month'},'select_button']">本月</div>
          </li>
          <li @click="choose_date('last_month')">
            <div :class="[{'selected' : search_info.date_type === 'last_month'},'select_button']">上月</div>
          </li>
          <li @click="choose_date('current_year')">
            <div :class="[{'selected' : search_info.date_type === 'current_year'},'select_button']">本年</div>
          </li>
          <li class="ml-20">
            <el-date-picker size="small" class="date-select" @change="date_change" v-model="search_info.begin" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <span>至</span>
            <el-date-picker size="small" class="date-select" @change="date_change" v-model="search_info.end" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
          </li>
        </ul>
      </div>
      <div class="toolbar mt-20">
        <ul class="d-f">
          <li class="ml-20" v-if="activeTab === 'contract'">
            <el-select size="small" placeholder="选择课程" v-model="search_info.course_id" @change="search">
              <el-option label="全部课程" :value="0"></el-option>
              <el-option v-for="(item, index) in $store.state.course" :key="index" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </li>
          <li class="ml-20" v-if="activeTab === 'contract'">
            <el-select size="small" placeholder="选择顾问" v-model="search_info.advisor_id" @change="search">
              <el-option label="全部顾问" :value="0"></el-option>
              <el-option v-for="(item, index) in $store.state.advisor" :key="index" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </li>
          <li class="ml-20" v-if="activeTab === 'contract'">
            <el-select size="small" placeholder="支付方式" v-model="search_info.pay_method" @change="search">
              <el-option label="全部支付方式" :value="0"></el-option>
              <el-option v-for="(item, index) in pay_list" :key="index" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </li>
          <li class="name ml-20 mr-20">
            <el-input size="small" placeholder="请输入学员姓名" v-model.trim="search_info.name"></el-input>
          </li>
          <li>
            <MyButton @click.native="search" :radius="false">搜索</MyButton>
          </li>
        </ul>
      </div>
      <!-- 合同收款table -->
      <div v-if="activeTab === 'contract'" key="contractTable">
        <el-table stripe class="student-table mt-30" :data="buyCourseTable.lists.data" v-loading="loading" :show-header="true" show-summary :summary-method="get_sum">
          <el-table-column label="序号" type="index" align="center"></el-table-column>
          <el-table-column label="合同编号" prop="orderno" align="center"></el-table-column>
          <el-table-column label="学员姓名" align="center">
            <template slot-scope="scope">
              <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: scope.row.student.id}}" class="fc-m">{{scope.row.student.name}}</router-link>
              <span v-else>{{scope.row.student_name}}</span>
            </template>
          </el-table-column>
          <el-table-column label="购买课程" prop="course.name" align="center"></el-table-column>
          <el-table-column label="签约日期" align="center">
            <template slot-scope="scope">{{scope.row.pay_at | date('yyyy-MM-dd')}}</template>
          </el-table-column>
          <el-table-column label="支付方式" align="center">
            <template slot-scope="scope">
              <div>{{pay_list[scope.row.pay_way - 1] ? pay_list[scope.row.pay_way - 1].name : pay_list[scope.row.pay_way - 1]}}</div>
            </template>
          </el-table-column>
          <el-table-column label="业绩顾问" prop="advisor.name" align="center"></el-table-column>
          <el-table-column label="操作人" prop="user.name" align="center"></el-table-column>
          <el-table-column label="课时费" prop="lesson_price" align="center"></el-table-column>
          <el-table-column label="教材费" prop="textbook_price" align="center"></el-table-column>
          <el-table-column label="合同总额" prop="real_price" align="center"></el-table-column>
          <el-table-column label="操作" align="center" v-if="$$tools.isAuthority('purchaseViewCourse')">
            <template slot-scope="scope">
              <span class="fc-m cursor-pointer"  @click="show_contract(scope.row.id)">合同详情</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
       <el-pagination v-if="buyCourseTable.lists.total > buyCourseTable.lists.per_page"
          class="d-f f-j-c mt-50 mb-50" :page-size="buyCourseTable.lists.per_page"
          background layout="total, prev, pager, next"
          :total="buyCourseTable.lists.total" :current-page="buyCourseTable.lists.current_page" @current-change="go_page">
        </el-pagination>
      </div>

      <!-- 转课差价table -->
      <div v-else key="changeCourseTable">
        <el-table stripe class="student-table mt-30" :data="changeCourseTable.lists.data" v-loading="loading" :show-header="true" show-summary :summary-method="get_sum">
          <el-table-column label="序号" type="index" align="center"></el-table-column>
          <el-table-column label="学员姓名" align="center">
            <template slot-scope="scope">
              <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: scope.row.studentId}}" class="fc-m">{{scope.row.studentName}}</router-link>
              <span v-else>{{scope.row.student_name}}</span>
            </template>
          </el-table-column>
          <el-table-column label="转出课程" prop="outCourseName" align="center"></el-table-column>
          <el-table-column label="转入课程" prop="inCourseName" align="center"></el-table-column>
          <el-table-column label="转课时间" align="center">
            <template slot-scope="scope">{{scope.row.createdAt | date('yyyy-MM-dd')}}</template>
          </el-table-column>
          <el-table-column label="操作人" prop="operation" align="center"></el-table-column>
          <el-table-column label="转出课时金额" prop="outPrice" align="center"></el-table-column>
          <el-table-column label="转入课时金额" prop="inPrice" align="center"></el-table-column>
          <el-table-column label="教材费" prop="textbookPrice" align="center"></el-table-column>
          <el-table-column label="实际补交差价" prop="realPrice" align="center"></el-table-column>
          <el-table-column label="操作" align="center" v-if="$$tools.isAuthority('transferCourse')">
            <template slot-scope="scope">
              <span class="fc-m cursor-pointer" @click="changeCourseDetail(scope.row.studentCourseId)">转课详情</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination v-if="changeCourseTable.lists.total > changeCourseTable.lists.per_page"
          class="d-f f-j-c mt-50 mb-50" :page-size="10"
          background layout="total, prev, pager, next"
          :total="changeCourseTable.lists.total" :current-page="changeCourseTable.lists.current_page" @current-change="go_page">
        </el-pagination>
      </div>
    </el-card>

    <!-- 购课详情 -->
    <ContractDialog :routerAble="false" v-model="dialogStatus.contract" :contractData="contractData" @CB-dialogStatus="CB_dialogStatus"></ContractDialog>

    <!-- 转课详情弹窗 -->
    <ChangeCourseContract :routerAble="false" v-model="dialogStatus.changeCourse" :contractData="changeCourseData" @CB-dialogStatus="CB_dialogStatus"></ChangeCourseContract>
  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import ContractDialog from '../../components/dialog/Contract';
import ChangeCourseContract from '../../components/dialog/ChangeCourseContract';
import { StudentStatic } from '../../script/static';

export default {
  data () {
    return {
      state: 'loading',
      activeTab: 'contract',
      oldTab: 'contract',
      dialogStatus: {contract: false, changeCourse: false},
      loading: false,
      //搜索信息
      search_info: {
        begin: new Date(this.$format_date(new Date(), 'yyyy/MM/01')),
        end: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0),
        name: '',
        date_type: 'current_month',
        course_id: 0,
        advisor_id: 0,
        pay_method: 0
      },
      //支付列表
      pay_list: StudentStatic.paymentMethod,

      contractData: {}, //购课合约详情
      changeCourseData: {}, //转课详情

      buyCourseTable: {lists: {}, total: {}},  //购课table
      changeCourseTable: {lists: {}, total: {}},  //转课table
    };
  },
  methods: {
    tabClick () {
      if (this.oldTab === this.activeTab) return 0;
      this.oldTab = this.activeTab;

      this.search_info.name = '';
      this.search_info.course_id = 0;
      this.search_info.advisor_id = 0;
      this.search_info.pay_method = 0;
      this.choose_date('current_month');

      this.getTableData();
    },
    CB_dialogStatus (type) {
      if (type === 'contract') {
        this.contractData = {}
      } else {
        this.changeCourseData = {}
      }
    },
    //选择时间
    choose_date (type) {
      console.log(type);
      this.search_info.date_type = type;
      switch (type) {
        case 'current_month':
          this.search_info.begin = new Date(
            this.$format_date(new Date(), 'yyyy/MM/01')
          );
          this.search_info.end = new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ).setDate(0);
          break;
        case 'last_month':
          this.search_info.begin = new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            0,
            24
          );
          this.search_info.end = new Date(new Date().setDate(0));
          break;
        case 'current_year':
          this.search_info.begin = new Date(
            this.$format_date(new Date(), 'yyyy/01/01')
          );
          this.search_info.end = new Date(new Date().setMonth(12)).setDate(0);
          break;
      }
      this.getTableData();
    },
    date_change () {
      this.search_info.date_type = '';
      if (this.search_info.end < this.search_info.begin) {
        return this.$message.warning('结束时间不能小于开始时间，请从新选择');
      }
      this.getTableData();
    },
    search () {
      this.getTableData();
    },
    go_page (page) {
      this.getTableData(page);
    },

    // 获取两个列表数据
    async getTableData (page) {
      console.log(this.search_info);

      this.loading = true;
      let params = {};

      if (this.activeTab === 'contract') {
        params = {
          time_type: 'custom',
          begin: this.$format_date(this.search_info.begin, 'yyyy-MM-dd'),
          end: this.$format_date(this.search_info.end, 'yyyy-MM-dd'),
          course_id: this.search_info.course_id,
          seller_id: this.search_info.advisor_id,
          pay_type: this.search_info.pay_method,
          user_name: this.search_info.name
        }
      } else {
        params = {
          startTime: this.getSeconde(this.search_info.begin),
          endTime: this.getSeconde(this.search_info.end),
          studentName: this.search_info.name
        }
      }

      if (page) params.page = page;

      let url = this.activeTab === 'contract' ? '/financeManage/studentCourse/lists' : '/financeManage/getTransferCourse';
      let res = await this.$$request.get(url, params);

      console.log(res)
      if (!res) return 0;

      if (this.activeTab === 'contract') {
        this.buyCourseTable.lists = res.lists;
        this.buyCourseTable.total = res.total;
      } else {
        this.changeCourseTable.lists = res.lists;
        this.changeCourseTable.total = res.total;
      }

      this.loading = false;
      console.log(this.buyCourseTable)

      return true;
    },
    //将时间转换为秒数
    getSeconde (date) {
      return new Date(date).getTime() / 1000;
    },
    //查看合约详情
    async show_contract (id) {
      let res = await this.$$request.get('/studentCourse/detail', {sc_id: id});
      if (!res) {
        return 0;
      }
      this.contractData = res.data;
      this.dialogStatus.contract = true;
    },
    // 获取转课详情
    async changeCourseDetail (id) {
      let res = await this.$$request.get('/studentCourse/getTransferDetail', {id: id});
      if (!res) {
        return 0;
      }
      this.changeCourseData = res;
      this.dialogStatus.changeCourse = true;
    },
    get_sum (param) {
      let sums = [];
      const { columns, data } = param;

      sums[1] = '合计';

      if (this.activeTab === 'contract') {
        columns.forEach((item, index) => {
          switch (index) {
            case 8:
              return sums[index] = `${this.buyCourseTable.total.total_lesson_price } 元`;
              break;
            case 9:
              return sums[index] = `${this.buyCourseTable.total.total_textbook_price } 元`;
              break;
            case 10:
              return sums[index] = `${this.buyCourseTable.total.total_price } 元`;
              break;
          }
        });
      } else {
        columns.forEach((item, index) => {
          switch (index) {
            case 6:
              return sums[index] = `${this.changeCourseTable.total.transferOutPrice } 元`;
              break;
            case 7:
              return sums[index] = `${this.changeCourseTable.total.transferInPrice } 元`;
              break;
            case 8:
              return sums[index] = `${this.changeCourseTable.total.textbookPrice } 元`;
              break;
            case 9:
              return sums[index] = `${this.changeCourseTable.total.realPrice } 元`;
              break;
          }
        });
      }
      return sums;
    }
  },
  async created () {
    let res = await this.getTableData();

    if (!res) {
      return false;
    }
    this.state = 'loaded';
  },
  components: { TableHeader, MyButton, ContractDialog, ChangeCourseContract }
};
</script>

<style lang="less" scoped>
.student-table {
  border-top: 1px #e3e3e3 solid;
}
.toolbar /deep/ .el-input {
  width: 160px;
}
.toolbar /deep/ .el-input__inner {
  height: 32px;
  line-height: 32px;
}
.toolbar /deep/ .el-input__icon {
  line-height: 32px;
}

.select_button {
  border: 1px solid #45dad5;
  text-align: center;
  color: #45dad5;
  height: 30px;
  line-height: 30px;
  width: 60px;
  margin-left: 20px;
  cursor: pointer;
}
.date_type {
  .selected {
    background-color: #45dad5 !important;
    color: #fff !important;
  }
}
</style>


