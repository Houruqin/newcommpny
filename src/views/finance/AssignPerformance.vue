<template>
    <div class="flex1">
        <el-card shadow="hover" class="container">
            <TableHeader title="业绩分配">
            </TableHeader>

            <div class="toolbar mt-20">
                <ul class="d-f">
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
                    <li class="name ml-20">
                        <el-input size="small" placeholder="请输入学员姓名" v-model.trim="search_info.name"></el-input>
                    </li>
                    <li>
                        <MyButton @click.native="search" :radius="false">搜索</MyButton>
                    </li>
                </ul>
            </div>

            <el-table stripe class="student-table mt-30" :data="assign_info.data" v-loading="loading" :show-header="true">
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="业绩归属" prop="cour_name" align="center"></el-table-column>
                <el-table-column label="合同编号" prop="stu_name" align="center"></el-table-column>
                <el-table-column label="购课学员" prop="stu_name" align="center">
                    <template slot-scope="scope">
                        <div>
                            <NameRoute :id="scope.row.stu_id">{{scope.row.stu_name}}</NameRoute>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="购买课程" prop="cour_name" align="center"></el-table-column>
                <el-table-column label="签约日期" align="center">
                    <template slot-scope="scope">
                        <div>
                            <div>{{scope.row.pay_at | date('yyyy-MM-dd')}}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="支付方式" prop="cour_name" align="center"></el-table-column>
                <el-table-column label="业绩金额" prop="cour_name" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <div>
                            <div>
                                <span class="fc-m cursor-pointer" @click="show_contract(scope.row.id)">调整业绩</span>
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
                            <span>00010</span>
                        </el-col>
                        <el-col :span="8">签约时间：
                            <span>00010</span>
                        </el-col>
                        <el-col :span="8">操作人：
                            <span>00010</span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">学员姓名：
                            <span>00010</span>
                        </el-col>
                        <el-col :span="8">收款方式：
                            <span>00010</span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">课时费：
                            <span>00010</span>
                        </el-col>
                        <el-col :span="8">教材费：
                            <span>00010</span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">合同金额：
                            <span class="fc-m fs-24">00010</span>
                        </el-col>
                    </el-row>
                </el-row>
                <el-row class="performance_setting">
                    <el-col :span="6" class="t-a-r">个人业绩分配：</el-col>
                    <el-col :span="18">
                        <el-form :model="dialog.performance" label-width="100px" size="small" :rules="performanceRules" class="commodity-type-formbox">
                            <el-row v-for="(member,index) in dialog.performance.members" :key="index">
                                <el-col :span="8" class="ml-30">
                                    <el-form-item prop="name">
                                        <el-input v-model.trim="member.name" placeholder="请输入分配人员"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8" class="ml-10">
                                    <el-form-item prop="price">
                                        <el-input v-model.trim="member.price" placeholder="请输入分配金额"></el-input>
                                        <div class="p-a reduce_button ver-c cursor-pointer" @click="delete_member"><img src="../../images/common/add.png" alt=""></div>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row class="pt-20">
                                <el-col>
                                    <div class="p-a add_button ver-c cursor-pointer" @click="add_member"><img src="../../images/common/add.png" alt=""></div>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-col>
                </el-row>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="dialog.performance.show = false">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
import TableHeader from "../../components/common/TableHeader";
import MyButton from "../../components/common/MyButton";
import ContractDialog from "../../components/dialog/Contract";
import NameRoute from "../../components/common/NameRoute";
import {StudentStatic} from '../../script/static';

export default {
  data() {
    return {
      //搜索信息
      search_info: {
        begin: new Date(this.$format_date(new Date(), "yyyy/MM/01")),
        end: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
          24
        ),
        name: "",
        date_type: "",
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
        contract: {
          data: new Object(),
          show: false
        },
        performance: {
          show: false,
          members: [
            {
              name: "",
              price: ""
            }
          ]
        }
      },
      performanceRules: {
        name: [{ required: true, message: "请输入分配人员" }],
        price: [
          { required: true, message: "请输入分配金额" },
          {validator: this.$$tools.formOtherValidate('decimals', 2)},
          {validator: this.$$tools.formOtherValidate('total', 9999)}
        //   { validator: this.$$tools.formOtherValidate("price") }
        ]
      },
      contract_data: {},
      loading: false
    };
  },
  methods: {
    init_search_info() {
      let search_info = {
        begin: new Date(this.$format_date(new Date(), "yyyy/MM/01")),
        end: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
          24
        ),
        name: ""
      };
      this.search_info = search_info;
    },
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
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
            24
          );
          break;
        case "last_month":
          this.search_info.begin = new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            0,
            24
          );
          this.search_info.end = new Date(
            this.$format_date(new Date(), "yyyy/MM/01")
          );
          break;
        case "current_year":
          this.search_info.begin = new Date(
            this.$format_date(new Date(), "yyyy/01/01")
          );
          this.search_info.end = new Date(
            new Date().getFullYear() + 1,
            0,
            0,
            24
          );
          break;
      }
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
        pay_type: this.search_info.pay_method,
        search_info: this.search_info.name,
        page: this.page_info.page,
        page_num: this.page_info.page_num
      };
      console.log(params);
      this.$$request
        .get("api/financeManage/achievement/lists", params)
        .then(res => {
          this.assign_info.data = res.lists.data;
          this.page_info.total = res.lists.total;
          this.loading = false;
        });
    },
    add_member() {
      this.dialog.performance.members.push({ name: "", price: "" });
    },
    delete_member() {
      if (this.dialog.performance.members.length < 2) return false;
      this.dialog.performance.members.splice(
        this.dialog.performance.members.length - 1,
        1
      );
    },
    //将时间转换为秒数
    get_seconde(date) {
      return new Date(date).getTime() / 1000;
    },
    //查看合约详情
    show_contract(id) {
      this.$$request
        .get("api/studentCourse/detail", { sc_id: id })
        .then(res => {
          this.dialog.contract.data = res.data;
          this.dialog.contract.show = true;
        });
    },
    //弹窗关闭回调
    close() {
      this.dialog.contract.data = {};
      // this.contract_data = {};
      this.dialog.contract.show = false;
    }
  },
  created() {
    this.get_data();
  },
  components: { TableHeader, MyButton, ContractDialog, NameRoute }
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
    text-indent: 50px;
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
.selected {
  background-color: #45dad5 !important;
  color: #fff !important;
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
  img {
    display: block;
  }
}
.reduce_button {
  right: -10px;
  img {
    display: block;
  }
}
</style>


