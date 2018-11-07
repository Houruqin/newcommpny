<template>
  <div class="flex1">
    <PageState :state="state" />
    <el-card shadow="hover">
      <TableHeader title="收款管理">
      </TableHeader>
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
          <li class="ml-20">
            <el-select size="small" placeholder="选择课程" v-model="search_info.course_id" @change="search">
              <el-option label="全部课程" :value="0"></el-option>
              <el-option v-for="(item, index) in $store.state.course" :key="index" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </li>
          <li class="ml-20">
            <el-select size="small" placeholder="选择顾问" v-model="search_info.advisor_id" @change="search">
              <el-option label="全部顾问" :value="0"></el-option>
              <el-option v-for="(item, index) in $store.state.advisor" :key="index" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </li>
          <li class="ml-20">
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

      <el-table stripe class="student-table mt-30" :data="income_info.data" v-loading="loading" :show-header="true" show-summary :summary-method="get_sum">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="合同编号" prop="orderno" align="center"></el-table-column>
        <el-table-column label="学员姓名" align="center">
          <template slot-scope="scope">
            <div>
              <NameRoute :id="scope.row.student.id">{{scope.row.student.name}}</NameRoute>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="购买课程" prop="course.name" align="center"></el-table-column>
        <el-table-column label="签约日期" align="center">
          <template slot-scope="scope">
            <div>
              <div>{{scope.row.pay_at | date('yyyy-MM-dd')}}</div>
            </div>
          </template>
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
      <el-pagination v-if="page_info.total > 10" class="d-f f-j-c mt-50 mb-50" :page-size="10" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.page" @current-change="go_page">
      </el-pagination>
    </el-card>
    <ContractDialog :routerAble="false" :dialogStatus="dialog.contract.show" :contractData="dialog.contract.data" @CB-dialogStatus="close"></ContractDialog>
  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import ContractDialog from '../../components/dialog/Contract';
import NameRoute from '../../components/common/NameRoute';
import { StudentStatic } from '../../script/static';

export default {
  data () {
    return {
      state: 'loading',
      //搜索信息
      search_info: {
        begin: new Date(this.$format_date(new Date(), 'yyyy/MM/01')),
        end: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(
          0
        ),
        name: '',
        date_type: 'current_month',
        course_id: 0,
        advisor_id: 0,
        pay_method: 0
      },
      //支付列表
      pay_list: StudentStatic.paymentMethod,
      //购课信息
      income_info: {
        data: [],
        total: ''
      },
      //分页信息
      page_info: {
        page_num: 10,
        page: 1,
        total: 0
      },
      //弹窗
      dialog: {
        contract: {
          data: new Object(),
          show: false
        }
      },
      contract_data: {},
      loading: false
    };
  },
  methods: {
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
      this.page_info.page = 1;
      this.get_data();
      console.log(this.search_info.begin, this.search_info.end);
    },
    date_change () {
      this.search_info.date_type = '';
      if (this.search_info.end < this.search_info.begin) {
        return this.$message.warning('结束时间不能小于开始时间，请从新选择');
      }
      this.page_info.page = 1;
      this.get_data();
    },
    search () {
      this.page_info.page = 1;
      this.get_data();
    },
    go_page (page) {
      this.page_info.page = page;
      this.get_data();
    },
    async get_data () {
      this.loading = true;
      const params = {
        time_type: 'custom',
        begin: this.$format_date(this.search_info.begin, 'yyyy-MM-dd'),
        end: this.$format_date(this.search_info.end, 'yyyy-MM-dd'),
        course_id: this.search_info.course_id,
        seller_id: this.search_info.advisor_id,
        pay_type: this.search_info.pay_method,
        user_name: this.search_info.name,
        page: this.page_info.page,
        page_num: this.page_info.page_num
      };

      console.log(params);
      let res = await this.$$request.get(
        '/financeManage/studentCourse/lists',
        params
      );

      console.log(res);
      if (!res) {
        return false;
      }
      this.income_info.data = res.lists.data;
      this.income_info.total = res.total;
      this.page_info.total = res.lists.total;
      this.loading = false;

      return true;
    },
    //将时间转换为秒数
    get_seconde (date) {
      return new Date(date).getTime() / 1000;
    },
    //查看合约详情
    show_contract (id) {
      this.$$request.get('/studentCourse/detail', { sc_id: id }).then(res => {
        this.dialog.contract.data = res.data;
        this.dialog.contract.show = true;
      });
    },
    //弹窗关闭回调
    close () {
      this.dialog.contract.data = {};
      // this.contract_data = {};
      this.dialog.contract.show = false;
    },
    get_sum (param) {
      let sums = [];
      const { columns, data } = param;

      sums[1] = '合计';
      columns.forEach((item, index) => {
        switch (item.label) {
          case '课时费':
            return sums[index] =
              `${this.income_info.total.total_lesson_price } 元`;
            break;
          case '教材费':
            return sums[index] =
              `${this.income_info.total.total_textbook_price } 元`;
            break;
          case '合同总额':
            return sums[index] = `${this.income_info.total.total_price } 元`;
            break;
        }
      });

      return sums;
    }
  },
  async created () {
    let res = await this.get_data();

    if (!res) {
      return false;
    }
    this.state = 'loaded';
  },
  components: { TableHeader, MyButton, ContractDialog, NameRoute }
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


