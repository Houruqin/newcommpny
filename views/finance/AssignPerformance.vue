<template>
  <div class="flex1">
    <PageState :state="state" />
    <el-card shadow="hover" class="container">
      <TableHeader title="业绩分配">
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
            <el-select size="small" placeholder="支付方式" v-model="search_info.pay_method" @change="search">
              <el-option label="全部支付方式" :value="0"></el-option>
              <el-option v-for="(item, index) in pay_list" :key="index" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </li>
          <li class="name ml-20 search mr-20">
            <el-input size="small" placeholder="请输入学员姓名/员工/合同编号" v-model.trim="search_info.name"></el-input>
          </li>
          <li>
            <MyButton @click.native="search" :radius="false">搜索</MyButton>
          </li>
        </ul>
      </div>

      <el-table stripe class="student-table mt-30" :data="assign_info.data" v-loading="loading" :show-header="true">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="业绩归属" prop="achieve_user.name" align="center"></el-table-column>
        <el-table-column label="合同编号" prop="orderno" align="center"></el-table-column>
        <el-table-column label="购课学员" align="center">
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
              <div>{{scope.row.created_at | date('yyyy-MM-dd')}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" prop="student_course.pay_way" align="center">
          <template slot-scope="scope">{{pay_list[scope.row.student_course.pay_way - 1].name}}</template>
        </el-table-column>
        <el-table-column label="业绩金额" prop="achieve_price" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div>
              <div>
                <span class="fc-m cursor-pointer" @click="open_setting(scope.row)">调整业绩</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-if="page_info.total > 10" class="d-f f-j-c mt-50 mb-50" :page-size="10" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.page" @current-change="go_page">
      </el-pagination>

      <!-- 调整业绩弹窗 -->
      <el-dialog title="调整业绩" :visible.sync="dialog.performance.show" width="800px" center>
        <el-row class="performance_info">
          <el-row>
            <el-col :span="8">合同编号：
              <span>{{dialog.performance.data.number}}</span>
            </el-col>
            <el-col class="pl-50" :span="8">签约时间：
              <span>{{dialog.performance.data.date | date('yyyy-MM-dd')}}</span>
            </el-col>
            <el-col class="pl-50" :span="8">操作人：
              <span>{{dialog.performance.data.operater}}</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">学员姓名：
              <span>{{dialog.performance.data.student_name}}</span>
            </el-col>
            <el-col class="pl-50" :span="8">收款方式：
              <span>{{dialog.performance.data.pay_way}}</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">课时费：
              <span>{{dialog.performance.data.course_price}}</span>
            </el-col>
            <el-col class="pl-50" :span="8">教材费：
              <span>{{dialog.performance.data.textbook_price}}</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">合同金额：
              <span class="fc-m fs-24">{{dialog.performance.data.total_price}}</span>
            </el-col>
          </el-row>
        </el-row>
        <el-row class="performance_setting">
          <el-col :span="6" class="t-a-r">个人业绩分配：</el-col>
          <el-col :span="18">
            <el-form :model="dialog.performance" ref="performance_valid" label-width="100px" size="small" class="commodity-type-formbox">
              <el-row v-for="(member,index) in dialog.performance.members" :key="index">
                <el-col :span="8" class="ml-30">
                  <el-form-item :prop="'members.' + index + '.belong_id'" :rules="performanceRules.name">
                    <el-select v-model="member.belong_id" filterable remote placeholder="请输入人员姓名">
                      <el-option :disabled="item.status !== 1" v-if="item.user_type !== 2" @click.native="member.achieve_user.name = item.name;" v-for="item in all_user" :key="item.id" :label="item.name" :value="String(item.id)">
                        <span style="float: left">{{ item.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">{{ item.type | role}}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8" class="ml-10">
                  <el-form-item :prop="'members.' + index + '.achieve_price'" :rules="performanceRules.price">
                    <el-input v-model.trim="member.achieve_price" placeholder="请输入分配金额"></el-input>
                    <i v-if="dialog.performance.members.length > 1" class="iconfont icon-jianhao reduce_button p-a ver-c cursor-pointer" @click="delete_member(index)"></i>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="pt-20">
                <el-col>
                  <i class="iconfont icon-jiahao add_button p-a ver-c cursor-pointer" @click="add_member"></i>
                </el-col>
              </el-row>
            </el-form>
          </el-col>
        </el-row>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="performance_confirm">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import TableHeader from "../../components/common/TableHeader";
import MyButton from "../../components/common/MyButton";
import NameRoute from "../../components/common/NameRoute";
import { StudentStatic } from "../../script/static";

export default {
  data() {
    return {
      state: "loading",
      //搜索信息
      search_info: {
        begin: new Date(this.$format_date(new Date(), "yyyy/MM/01")),
        end: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(
          0
        ),
        name: "",
        date_type: "current_month",
        course_id: 0,
        pay_method: 0
      },
      //支付方式
      pay_list: StudentStatic.paymentMethod,
      //分配信息
      assign_info: {
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
        performance: {
          show: false,
          data: {
            number: "",
            date: "",
            operater: "",
            student_name: "",
            pay_way: "",
            course_price: "",
            textbook_price: "",
            total_price: "",
            student_course_id: ""
          },
          members: [
            {
              belong_id: "",
              id: "",
              achieve_price: "",
              achieve_user: {
                name: ""
              }
            }
          ]
        }
      },
      performanceRules: {
        name: [{ required: true, message: "请选择分配人员" }],
        price: [
          { required: true, message: "请输入分配金额" },
          { validator: this.$$tools.formOtherValidate("decimals", 2) },
          { validator: this.$$tools.formOtherValidate("total", 9999) }
          //   { validator: this.$$tools.formOtherValidate("price") }
        ]
      },
      all_user: [],
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
          this.search_info.end = new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ).setDate(0);
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
      this.page_info.page = 1;
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
    async get_data() {
      this.loading = true;
      const params = {
        time_type: "custom",
        begin: this.$format_date(this.search_info.begin, "yyyy-MM-dd"),
        end: this.$format_date(this.search_info.end, "yyyy-MM-dd"),
        course_id: this.search_info.course_id,
        pay_type: this.search_info.pay_method,
        search_info: this.search_info.name,
        page: this.page_info.page,
        page_num: this.page_info.page_num
      };
      console.log(params);
      let res = await this.$$request.get(
        "/financeManage/achievement/lists",
        params
      );
      if (!res) return false;
      this.assign_info.data = res.lists.data;
      this.page_info.total = res.lists.total;
      this.loading = false;
      return true;
    },
    //获取全部员工+学员信息
    get_all_user() {
      this.$$request.get("/financeManage/allUser").then(res => {
        this.all_user = res.users;
      });
    },
    add_member() {
      this.dialog.performance.members.push({
        id: 0,
        belong_id: "",
        achieve_price: "",
        achieve_user: {
          name: ""
        }
      });
    },
    delete_member(index) {
      //   if (this.dialog.performance.members.length < 2) return false;
      this.dialog.performance.members.splice(index, 1);
    },
    //将时间转换为秒数
    get_seconde(date) {
      return new Date(date).getTime() / 1000;
    },
    //打开设置业绩弹窗
    open_setting(item) {
      this.dialog.performance.show = true;
      // this.$refs.performance_valid.resetFields();

      this.$nextTick(() => {
        this.$refs.performance_valid.resetFields();
      });
      const params = {
        student_course_id: item.student_course_id
      };
      this.$$request
        .get("/financeManage/achievement/singleLists", params)
        .then(res => {
          this.dialog.performance.members = res.lists;
          this.dialog.performance.data = {
            number: item.orderno,
            date: item.created_at,
            operater: item.achieve_allot_user.name,
            student_name: item.student.name,
            pay_way: this.pay_list[item.student_course.pay_way].name,
            course_price: res.studentCourse.lesson_price,
            textbook_price: res.studentCourse.textbook_price,
            total_price: item.student_course.real_price,
            student_course_id: item.student_course_id
          };
        });
    },
    performance_confirm() {
      this.$refs["performance_valid"].validate(async valid => {
        if (valid) {
          let query = this.dialog.performance;
          const params = {
            student_course_id: query.data.student_course_id,
            lists: query.members
          };
          let refund_total_price = 0;
          for (let member of query.members) {
            console.log(member.achieve_price);
            refund_total_price += member.achieve_price * 1;
          }
          if (refund_total_price > this.dialog.performance.data.total_price) {
            this.$message.warning("分配金额不能超过合同金额，请重新分配");
            return false;
          }
          let result = await this.$$request.post(
            "/financeManage/achievement/allot",
            params
          );

          if (!result) return false;

          this.$message.success("已分配");
          this.get_data();
          this.dialog.performance.show = false;
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  },
  filters: {
    role: value => {
      if (!value) return "";
      switch (value) {
        case "seller":
          return "课程顾问";
          break;
        case "director":
          return "顾问主管";
          break;
        case "register":
          return "教务";
          break;
        case "dean":
          return "教务主管";
          break;
        case "teacher":
          return "老师";
          break;
        case "master":
          return "校长";
          break;
      }
    }
  },
  async created() {
    let res = await this.get_data();
    if (!res) return false;
    this.get_all_user();
    this.state = "loaded";
  },
  components: { TableHeader, MyButton, NameRoute }
};
</script>

<style lang="less" scoped>
.container {
  /deep/ .el-dialog__body {
  }
}
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
.performance_info {
  color: #777777;
  padding-bottom: 30px;
  border-bottom: 1px solid #e9e9e9;
  .el-col {
    padding: 10px;
    span {
      color: #222222;
    }
  }
}
.performance_setting {
  padding: 30px;
  color: #777777;
  /deep/ .el-form-item__content {
    margin: 0 !important;
  }
  min-height: 250px;
  max-height: 350px;
  overflow: auto;
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
.fc-m {
  color: #45dad5 !important;
}
.commodity-type-formbox {
  /deep/ .el-input {
    width: 150px;
  }
}
.add_button {
  left: 30px;
}
.reduce_button {
  right: -10px;
}
.pl-50 {
  padding-left: 50px !important;
}
.iconfont {
  color: #45dad5;
  font-size: 20px;
}
.search {
  /deep/ .el-input {
    width: 220px;
  }
}
</style>


