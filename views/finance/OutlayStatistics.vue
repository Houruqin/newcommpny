<template>
  <div class="flex1 outlay_form">
    <PageState :state="state" />
    <el-card shadow="hover">
      <TableHeader title="支出管理">
        <MyButton @click.native="open_setting_dialog" type="border" fontColor="fc-m" v-if="$$tools.isAuthority('viewExpenditureType')">类型设置</MyButton>
        <MyButton @click.native="open_outlay_dialog" class="ml-20" v-if="$$tools.isAuthority('addExpenditure')">添加支出</MyButton>
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
            <el-select size="small" placeholder="全部支出类型" v-model="search_info.pay_method" @change="search">
              <el-option label="全部支出类型" :value="0"></el-option>
              <el-option v-for="(item, index) in dialog.add.data.type_lists" :key="index" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </li>
          <li class="name ml-20 mr-20">
            <el-input size="small" placeholder="请输入支出人员姓名" v-model.trim="search_info.name"></el-input>
          </li>
          <li>
            <MyButton @click.native="search" :radius="false">搜索</MyButton>
          </li>
        </ul>
      </div>

      <el-table stripe class="student-table mt-30" :data="outlay_info.data" v-loading="loading" :show-header="true" show-summary :summary-method="get_sum">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="支出类型" prop="expend_type.name" align="center"></el-table-column>
        <el-table-column label="支出人员" align="center">
          <template slot-scope="scope">
            <div>
              <div>{{scope.row.expend_user_type === 1 ? scope.row.expend_user.name : scope.row.expend_student.name}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="支出时间" align="center">
          <template slot-scope="scope">
            <div>
              <div>{{scope.row.created_at | date('yyyy-MM-dd')}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="user.name" align="center"></el-table-column>
        <el-table-column label="支出金额" prop="expend_price" align="center"></el-table-column>
        <el-table-column label="备注" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.remark.length > 16" class="d-f f-j-c">
                <el-popover popper-class="grade-student-popver" placement="right" trigger="hover" width="200" :content="scope.row.remark">
                    <div slot="reference" class="ml-5 cursor-pointer">
                        <span>{{scope.row.remark.substring(0, 16)}}...</span>
                        <!-- <i class="iconfont icon-zhuyidapx"></i> -->
                    </div>
                </el-popover>
            </div>
            <div v-else>{{scope.row.remark}}</div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-if="page_info.total > 10" class="d-f f-j-c mt-50 mb-50" :page-size="10" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.page" @current-change="go_page">
      </el-pagination>

      <!-- 添加支出弹窗 -->
      <el-dialog title="添加支出" width="720px" center :visible.sync="dialog.add.show" :close-on-click-modal="false">
        <el-form :model="dialog.add.data" label-width="125px" ref="add" size="small" :rules="addRules" class="form-box">
          <el-row>
            <el-col :span="11">
              <el-form-item label="支出人员：" prop="together_id">
                <el-select v-model="dialog.add.data.together_id" filterable placeholder="请输入支出人员" remote>
                  <el-option v-if="item.user_type !== 2" @click.native="dialog.add.data.id = item.id;dialog.add.data.name = item.name;dialog.add.data.user_type = item.user_type" v-for="item in $store.state.allUser" :key="item.id" :label="item.name" :value="item.together_id">
                    <span style="float: left">{{ item.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.user_type === 2 ? '学员' : ''}}</span>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="支出金额：" prop="price" class="units-input">
                <el-input placeholder="请输入支出金额" v-model="dialog.add.data.price"></el-input>
                <span class="pl-10">元</span>
              </el-form-item>

            </el-col>

            <el-col :span="11">
              <el-form-item label="支出类型：" prop="type_id" class="p-r">
                <el-select v-model="dialog.add.data.type_id" placeholder="请选择">
                  <el-option v-if="type.status === 1" @click.native="dialog.add.data.type = type.name" v-for="type of dialog.add.data.type_lists" :key="type.id" :label="type.name" :value="type.id"></el-option>
                </el-select>
                <div v-if="$$tools.isAuthority('addExpenditureType')" class="p-a add-commodity-type ver-c cursor-pointer" @click="open_outlay_type"><img src="../../images/common/add.png" alt=""></div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="22">
              <el-form-item label="备注：" prop="remark" class="units-input">
                <el-input type="textarea" :autosize="{minRows: 2, maxRows: 6}" resize="none" v-model="dialog.add.data.remark"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="d-f f-j-c mt-20">
            <MyButton @click.native="submitForm('add')">确定</MyButton>
          </div>
        </el-form>
      </el-dialog>

      <!-- 添加支出确认弹窗 -->
      <el-dialog class="outlay" title="确认添加？" width="720px" center :visible.sync="dialog.add_confirm.show" :close-on-click-modal="false">
        <el-row class="t-a-c">支出添加之后不能修改与删除，请确认信息准确无误！</el-row>
        <!-- <el-row class="outlay_info">
          <el-col :span="8">支出人员：
            <span>{{dialog.add.data.name}}</span>
          </el-col>
          <el-col :span="8">支出类型：
            <span>{{dialog.add.data.type}}</span>
          </el-col>
          <el-col :span="8">支出金额：
            <span>{{dialog.add.data.price}} 元</span>
          </el-col>
          <el-col :span="24">备注：
            <span>{{dialog.add.data.remark}}</span>
          </el-col>
        </el-row> -->
        <div class="d-f f-j-c mt-20">
          <MyButton @click.native="add_outlay">确定</MyButton>
          <MyButton type="border" class="fc-m ml-20" @click.native="dialog.add.show = true;dialog.add_confirm.show = false">返回编辑</MyButton>
        </div>
      </el-dialog>

      <!-- 类型设置弹窗 -->
      <el-dialog title="类型设置" width="700px" center :visible.sync="dialog.setting.show" :close-on-click-modal="false">
        <div class="d-f f-j-e">
          <MyButton @click.native="open_outlay_type" v-if="$$tools.isAuthority('addExpenditureType')">添加支出类型</MyButton>
        </div>

        <el-table class="mt-20 bor-t" :data="dialog.add.data.type_lists" v-loading="loading" stripe>
          <el-table-column label="序号" type="index" align="center"></el-table-column>
          <el-table-column label="支出类型" prop="name" align="center"></el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">{{scope.row.status === 1 ? '正常' : (scope.row.status === 0 ? '禁用' : '删除')}}</template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <span class="fc-m cursor-pointer" @click="type_edit(scope.row.id,scope.row.name)" v-if="$$tools.isAuthority('modifyExpenditureType')">修改</span>
              <span v-if="scope.row.status === 1 && $$tools.isAuthority('forbidEnableExpenditure')" class="fc-m cursor-pointer ml-10" @click="type_handle(scope.row.id,0)">禁用</span>
              <span v-if="scope.row.status === 0 && $$tools.isAuthority('forbidEnableExpenditure')" class="fc-m cursor-pointer ml-10" @click="type_handle(scope.row.id,1)">启用</span>
              <span class="fc-m cursor-pointer ml-10" @click="type_handle(scope.row.id,-1)" v-if="$$tools.isAuthority('deleteExpenditureType')">删除</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- <div class="d-f f-j-c mt-30 mb-10">
          <MyButton @click.native="dialog.setting.show = false">确定</MyButton>
        </div> -->
      </el-dialog>

      <el-dialog title="添加支出类型" width="500px" center :visible.sync="dialog.addType.show" :close-on-click-modal="false" append-to-body>
        <el-form :model="dialog.addType" ref="addType" label-width="100px" size="small" :rules="addTypeRules" class="commodity-type-formbox">
          <el-form-item label="支出类型" prop="type" class="pl-50">
            <el-input v-model.trim="dialog.addType.type" placeholder="请输入支出类型"></el-input>
          </el-form-item>
          <div class="d-f f-j-c mt-40 mb-10">
            <MyButton @click.native="add_outlay_type('addType')">确定</MyButton>
          </div>
        </el-form>
      </el-dialog>
    </el-card>
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
        end: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(
          0
        ),
        name: '',
        date_type: 'current_month',
        pay_method: 0
      },
      //支出信息
      outlay_info: {
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
        //添加支出
        add: {
          data: {
            id: '',
            name: '',
            user_type: '',
            price: '',
            remark: '',
            type_id: '',
            type: '',
            type_lists: [],
            together_id: ''
          },
          show: false
        },
        add_confirm: {
          show: false
        },
        //添加支出类型
        addType: {
          show: false,
          id: '', //类型id
          type: '', //类型名称
          handle: 'add' // 方式：新增、修改
        },
        //类型设置
        setting: {
          show: false
        }
      },
      loading: false,
      // all_user: [],
      timeout: null,
      filted_user: '',
      addRules: {
        together_id: [
          { required: true, message: '请选择支出人员', trigger: 'change' }
        ],
        type_id: [
          { required: true, message: '请选择支出类型', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入支出金额' },
          //   { validator: this.$$tools.formOtherValidate("price") }
          { validator: this.$$tools.formOtherValidate('decimals', 2) },
          { validator: this.$$tools.formOtherValidate('total', 999999) }
        ],
        remark: [{ max: 100, message: '备注长度不能超过100' }]
      },
      addTypeRules: {
        type: [{ required: true, message: '请输入支出类型' }]
      }
    };
  },
  methods: {
    //选择时间
    choose_date (type) {
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
    //时间改变回调
    date_change () {
      this.search_info.date_type = '';
      if (this.search_info.end < this.search_info.begin) {
        return this.$message.warning('结束时间不能小于开始时间，请从新选择');
      }
      this.page_info.page = 1;
      this.get_data();
    },
    //搜索学员
    search () {
      this.page_info.page = 1;
      this.get_data();
    },
    //翻页
    go_page (page) {
      this.page_info.page = page;
      this.get_data();
    },
    //获取支出记录数据
    async get_data () {
      this.loading = true;
      const params = {
        time_type: 'custom',
        begin: this.$format_date(this.search_info.begin, 'yyyy-MM-dd'),
        end: this.$format_date(this.search_info.end, 'yyyy-MM-dd'),
        user_name: this.search_info.name,
        expend_type_id: this.search_info.pay_method,
        page: this.page_info.page,
        page_num: this.page_info.page_num
      };
      let res = await this.$$request.get('/financeManage/expend/lists', params);

      if (!res) {
        return false;
      }
      console.log(res);
      this.outlay_info.data = res.expendRecords.data;
      this.outlay_info.total = res.total;
      this.page_info.total = res.expendRecords.total;
      this.loading = false;

      return true;
    },
    //获取支出类型
    async get_outlay_type () {
      let res = await this.$$request.get('/financeManage/expendType/lists');

      if (!res) {
        return false;
      }
      console.log(res);
      this.dialog.add.data.type_lists = res.expendTypes;

      return true;
    },
    //添加支出类型
    add_outlay_type (formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          if (this.dialog.addType.handle === 'add') {
            const params = {
              name: this.dialog.addType.type
            };
            let result = await this.$$request.post(
              '/financeManage/expendType/add',
              params
            );

            if (!result) {
              return false;
            }
            this.get_outlay_type().then(() => {
              let length = this.dialog.add.data.type_lists.length - 1;

              this.dialog.add.data.type_id = this.dialog.add.data.type_lists[
                length
              ].id;
            });
            this.$message.success('已添加！');
            this.dialog.addType.show = false;
          } else {
            const params = {
              id: this.dialog.addType.id,
              name: this.dialog.addType.type
            };
            let result = await this.$$request.post(
              '/financeManage/expendType/edit',
              params
            );

            if (!result) {
              return false;
            }
            this.get_outlay_type();
            this.$message.success('已修改！');
            this.dialog.addType.show = false;
            this.get_data();
          }
        } else {
          return false;
        }
      });
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
    //添加支出弹窗
    open_outlay_dialog () {
      this.dialog.add.show = true;
      this.dialog.add.data.id = '';
      this.dialog.add.data.together_id = '';
      this.dialog.add.data.type_id = '';
      this.$nextTick(() => {
        this.$refs.add.resetFields();
      });
    },
    //提交表单
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          switch (formName) {
            case 'add':
              this.dialog.add_confirm.show = true;
              this.dialog.add.show = false;
              break;
          }
        } else {
          return false;
        }
      });
    },
    //添加支出确定
    async add_outlay () {
      const params = {
        expend_user_type: this.dialog.add.data.user_type,
        expend_user_id: this.dialog.add.data.id,
        expend_type_id: this.dialog.add.data.type_id,
        expend_price: this.dialog.add.data.price,
        remark: this.dialog.add.data.remark
      };
      let result = await this.$$request.post(
        '/financeManage/expend/add',
        params
      );

      if (!result) {
        return false;
      }
      this.$message.success('已添加！');
      this.dialog.add.show = false;
      this.dialog.add_confirm.show = false;
      this.get_data();
    },
    //类型设置
    open_setting_dialog () {
      this.dialog.setting.show = true;
    },
    //类型设置——修改
    type_edit (id, type) {
      this.dialog.addType = {
        show: true,
        id: id,
        type: type,
        handle: 'edit'
      };
    },
    //类型设置——操作
    type_handle (id, status) {
      const params = {
        id: id,
        status: status
      };
      let word = status === -1 ? '删除' : status === 1 ? '启用' : '禁用';

      this.$confirm(`确定要${ word }该类型吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let result = await this.$$request.post(
          '/financeManage/expendType/set',
          params
        );

        if (!result) {
          return false;
        }
        this.$message.success(`已${ word}`);
        this.get_outlay_type();
      });
    },
    open_outlay_type () {
      this.dialog.addType = {
        show: true,
        id: '',
        type: '',
        handle: 'add'
      };
      this.$nextTick(() => {
        this.$refs.addType.resetFields();
      });
    },
    //获取合计的值
    get_sum (param) {
      let sums = [];
      const { columns, data } = param;

      sums[1] = '合计';
      columns.forEach((item, index) => {
        switch (item.label) {
          case '支出金额':
            return sums[index] = `${this.outlay_info.total } 元`;
            break;
        }
      });

      return sums;
    }
  },
  async created () {
    let [r1, r2] = await Promise.all([this.get_outlay_type(), this.get_data()]);

    if (r1 && r2) {
      this.state = 'loaded';
    }
    this.$store.dispatch('getAllUser');
    // this.$nextTick(() => {
    //   this.all_user = this.$store.state.allUser;
    // });
  },
  components: { TableHeader, MyButton, ContractDialog, NameRoute }
};
</script>

<style lang="less" scoped>
.student-table {
  border-top: 1px #e3e3e3 solid;
}
.form-box {
  .el-select,
  .el-date-editor {
    width: 100%;
  }
  /deep/ .el-input {
    width: 150px;
  }
}
.commodity-type-formbox {
  /deep/ .el-input {
    width: 200px;
  }
}
.outlay {
  /deep/ .el-dialog__title {
    color: #45dad5 !important;
  }
}
.outlay_info {
  color: #777777;
  padding: 30px 0;
  .el-col {
    text-indent: 50px;
    padding: 10px;
    span {
      color: #222222;
    }
  }
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
.add-commodity-type {
  right: -10px;
  img {
    display: block;
  }
}
</style>


