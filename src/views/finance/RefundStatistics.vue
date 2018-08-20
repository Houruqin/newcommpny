<template>
  <div class="flex1">
    <el-card shadow="hover">
      <TableHeader title="退费管理">
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
            <el-select size="small" placeholder="选择课程类型" v-model="search_info.course_type_id" @change="search">
              <el-option label="全部课程类型" :value="0"></el-option>
              <el-option label="普通课程" :value="1"></el-option>
              <el-option label="一对一课程" :value="2"></el-option>
            </el-select>
          </li>
          <li class="name ml-20">
            <el-input size="small" placeholder="请输入学员姓名" v-model.trim="search_info.name"></el-input>
          </li>
          <li>
            <MyButton @click.native="search" :radius="false">搜索</MyButton>
          </li>
        </ul>
      </div>

      <el-table stripe class="student-table mt-30" :data="refund_info.data" v-loading="loading" :show-header="true" show-summary :summary-method="get_sum">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="退费学员" align="center">
          <template slot-scope="scope">
            <div>
              <NameRoute :id="scope.row.student.id">{{scope.row.student.name}}</NameRoute>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="退费课程" prop="course.name" align="center"></el-table-column>
        <el-table-column label="退费时间" align="center">
          <template slot-scope="scope">
            <div>
              <div>{{scope.row.created_at | date('yyyy-MM-dd')}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="剩余课时" prop="remain_num" align="center"></el-table-column>
        <el-table-column label="课时退费" prop="remain_lesson_price" align="center"></el-table-column>
        <el-table-column label="教材退费" prop="remain_textbook_price" align="center"></el-table-column>
        <el-table-column label="实退金额" prop="rel_remain" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div>
              <div>
                <span class="fc-m cursor-pointer" @click="show_refund(scope.row)">退费详情</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-if="page_info.total > 10" class="d-f f-j-c mt-50 mb-50" :page-size="10" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.page" @current-change="go_page">
      </el-pagination>
    </el-card>
    <RefundDialog :routerAble="false" :dialogStatus="dialog.refund.show" :refundData="dialog.refund.data" @CB-dialogStatus="close"></RefundDialog>
  </div>
</template>

<script>
import TableHeader from "../../components/common/TableHeader";
import MyButton from "../../components/common/MyButton";
import RefundDialog from "../../components/dialog/Refund";
import NameRoute from "../../components/common/NameRoute";

export default {
  data() {
    return {
      //搜索信息
      search_info: {
        begin: new Date(this.$format_date(new Date(), "yyyy/MM/01")),
        end: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0),
        name: "",
        date_type: "current_month",
        course_id: 0,
        course_type_id: 0
      },
      //退费信息
      refund_info: {
        data: [],
        total: ""
      },
      //分页信息
      page_info: {
        page_num: 10,
        page: 1,
        total: 0
      },
      //弹窗
      dialog: {
        refund: {
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
    choose_date(type) {
      console.log(type);
      this.search_info.date_type = type;
      switch (type) {
        case "current_month":
          this.search_info.begin = new Date(
            this.$format_date(new Date(), "yyyy/MM/01")
          );
          this.search_info.end = new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0);
          break;
        case "last_month":
          this.search_info.begin = new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            0,
            24
          );
          this.search_info.end = new Date(new Date().setDate(0));
          break;
        case "current_year":
          this.search_info.begin = new Date(
            this.$format_date(new Date(), "yyyy/01/01")
          );
          this.search_info.end = new Date(new Date().setMonth(12)).setDate(0);
          break;
      }
      this.get_data();
      console.log(this.search_info.begin, this.search_info.end);
    },
    date_change() {
      this.search_info.date_type = "";
      if (this.search_info.end < this.search_info.begin)
        return this.$message.warning("结束时间不能小于开始时间，请从新选择");
      this.page_info.page = 1;
      this.get_data();
    },
    search() {
      this.page_info.page = 1;
      this.get_data();
    },
    go_page(page) {
      this.page_info.page = page;
      this.get_data();
    },
    get_data() {
      this.loading = true;
      const params = {
        time_type: "custom",
        begin: this.$format_date(this.search_info.begin, "yyyy-MM-dd"),
        end: this.$format_date(this.search_info.end, "yyyy-MM-dd"),
        course_id: this.search_info.course_id,
        course_type_id: this.search_info.course_type_id,
        user_name: this.search_info.name,
        page: this.page_info.page,
        page_num: this.page_info.page_num
      };
      console.log(params);
      this.$$request
        .get("api/financeManage/studentCourse/quitCourseLists", params)
        .then(res => {
          this.refund_info.data = res.lists.data;
          this.refund_info.total = res.total;
          this.page_info.total = res.lists.total;
          this.loading = false;
        });
    },
    //将时间转换为秒数
    get_seconde(date) {
      return new Date(date).getTime() / 1000;
    },
    //查看退费详情
    show_refund(obj) {
      const params = {
        quit_course_id: obj.id
      };
      this.$$request
        .get("api/financeManage/quitCourseDetail", params)
        .then(res => {
          console.log(res);
          this.dialog.refund.data = res;
          this.dialog.refund.show = true;
        });
    },
    //弹窗关闭回调
    close() {
      this.dialog.refund.data = {};
      // this.contract_data = {};
      this.dialog.refund.show = false;
    },
    get_sum(param) {
      let sums = [];
      const { columns, data } = param;
      sums[1] = "合计";
      columns.forEach((item, index) => {
        switch (item.label) {
          case "课时退费":
            return (sums[index] =
              this.refund_info.total.total_lesson_price + " 元");
            break;
          case "教材退费":
            return (sums[index] =
              this.refund_info.total.total_textbook_price + " 元");
            break;
          case "实退金额":
            return (sums[index] = this.refund_info.total.total_price + " 元");
            break;
        }
      });
      return sums;
    }
  },
  created() {
    this.get_data();
  },
  components: { TableHeader, MyButton, RefundDialog, NameRoute }
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


