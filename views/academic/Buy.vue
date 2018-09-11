<template>
  <div class="flex1">
    <PageState :state="state" />
    <el-card shadow="hover">
      <TableHeader title="购课记录">
      </TableHeader>

      <div class="toolbar mt-20">
        <ul class="d-f">
          <li>
            <el-date-picker size="small" class="date-select" @change="date_change" v-model="search_info.begin" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <span>至</span>
            <el-date-picker size="small" class="date-select" @change="date_change" v-model="search_info.end" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
          </li>
          <li class="name ml-20">
            <el-input size="small" placeholder="请输入学员姓名" v-model.trim="search_info.name"></el-input>
          </li>
          <li>
            <MyButton @click.native="search" :radius="false">搜索</MyButton>
          </li>
        </ul>
      </div>

      <el-table stripe class="student-table mt-30" :data="buy_info.data" v-loading="loading" :show-header="true">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="姓名" prop="stu_name" align="center">
          <template slot-scope="scope">
            <div>
              <NameRoute :id="scope.row.stu_id">{{scope.row.stu_name}}</NameRoute>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="购买课程" prop="cour_name" align="center"></el-table-column>
        <el-table-column label="购买课时" prop="lesson_num" align="center"></el-table-column>
        <el-table-column label="总金额" prop="real_price" align="center"></el-table-column>
        <el-table-column label="购买日期" align="center">
          <template slot-scope="scope">
            <div>
              <div>{{scope.row.pay_at | date('yyyy-MM-dd')}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学员状态" align="center">
          <template slot-scope="scope">
            <div>
              <div>
                <span :class="[scope.row.state === 0 ? 'in_school' : 'graduation','student_status']">{{scope.row.state === 0  ? '在校' : '结业'}}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="合约详情" align="center">
          <template slot-scope="scope">
            <div>
              <div>
                <span class="fc-m cursor-pointer" @click="show_contract(scope.row.id)">购课详情</span>
              </div>
            </div>
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

export default {
  data () {
    return {
      state: 'loading',
      //搜索信息
      search_info: {
        begin: new Date(this.$format_date(new Date(), 'yyyy/MM/01')),
        end: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
          24
        ),
        name: ''
      },
      //购课信息
      buy_info: {
        data: []
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
    init_search_info () {
      let search_info = {
        begin: new Date(this.$format_date(new Date(), 'yyyy/MM/01')),
        end: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
          24
        ),
        name: ''
      };

      this.search_info = search_info;
    },
    tab_change () {
      this.page_info.page = 1;
      this.init_search_info();
      this.get_data();
    },
    date_change () {
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
        start_date: this.get_seconde(this.search_info.begin),
        end_date: this.get_seconde(this.search_info.end),
        stu_name: this.search_info.name,
        page: this.page_info.page,
        page_num: this.page_info.page_num
      };
      let res = await this.$$request.post('/eduCount/studentCourseLists', params);

      if (!res) {
        return false;
      }
      this.buy_info.data = res.studentCourseLists.data;
      this.page_info.total = res.studentCourseLists.total;
      this.loading = false;

      return true;
    },
    //将时间转换为秒数
    get_seconde (date) {
      return new Date(date).getTime() / 1000;
    },
    //查看合约详情
    show_contract (id) {
      this.$$request
        .get('/studentCourse/detail', { sc_id: id })
        .then(res => {
          this.dialog.contract.data = res.data;
          this.dialog.contract.show = true;
        });
    },
    //弹窗关闭回调
    close () {
      this.dialog.contract.data = {};
      // this.contract_data = {};
      this.dialog.contract.show = false;
    }
  },
  async created () {
    let res = await this.get_data();

    if (!res) {
      return false;
    }
    this.state = 'loaded';
  },
  components: { TableHeader, MyButton, ContractDialog, NameRoute}
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
.t_button {
  display: inline-block;
  background-color: #fff;
  color: #45dad5;
  border: 1px solid #45dad5;
  box-sizing: border-box;
  height: 32px;
  line-height: 32px;
  padding: 0 16px;
  border-radius: 3px;
  margin-left: 22px;
  cursor: pointer;
}
.student_status {
  display: inline-block;
  width: 60px;
  height: 24px;
  line-height: 24px;
  border-radius: 4px;
  margin: auto;
}
.graduation {
  background-color: #f1f1f1;
  color: #777777;
}
.in_school {
  background-color: #dcf2e2;
  color: #13782f;
}
</style>


