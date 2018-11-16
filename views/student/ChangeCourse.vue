<template>
    <div class="flex1 change-course-container">
        <PageState :state="state" />
        <el-card shadow="hover">
            <TableHeader title="转课"></TableHeader>

            <el-form :model="courseForm" label-width="95px" size="small" :rules="courseRules" ref="courseForm" class="form-box mt-20">

                <p class="head-info">转出课程：
                    <span>{{course_name}}</span>
                </p>
                <div class="mt-10 d-f">
                    <el-table :data="orderInfo" v-loading="loading" row-class-name="row-header">
                        <el-table-column label="订单编号" prop="orderno" align="center"></el-table-column>
                        <el-table-column label="购买课时" prop="lesson_num" align="center"></el-table-column>
                        <el-table-column label="已消课时" prop="eliminate_num" align="center"></el-table-column>
                        <el-table-column label="赠送课时" prop="given_num" align="center"></el-table-column>
                        <el-table-column label="剩余课时" prop="lesson_num_left" align="center"></el-table-column>
                        <el-table-column label="课程单价(元/课时)" prop="unit_price" align="center"></el-table-column>
                        <el-table-column label="课程有效期" prop="expired_at" align="center">
                            <template slot-scope="scope">{{scope.row.expired_at | date('yyyy-MM-dd')}}</template>
                        </el-table-column>
                        <el-table-column label="转出课时" align="center">
                            <template slot-scope="scope" v-if="courseForm.out_lesson_num.length > 0">
                                <el-form-item :prop="`out_lesson_num[${scope.$index}]`" :rules="[{ required: true, message: '请输入转出课时', trigger: 'change' },{ validator: courseValidator('out_lesson_num',scope.$index) }]">
                                    <el-input type="number" size="small" placeholder="转出课时" v-model.number="courseForm.out_lesson_num[scope.$index]"></el-input>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="转出课时金额" align="center">
                            <template slot-scope="scope">
                                <span class='fc-m'>{{(courseForm.out_lesson_num[scope.$index] * scope.row.unit_price).toFixed(2)}}</span>元
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <p class="head-info">转入课程</p>
                <div class="mt-10 d-f">
                    <el-table :data="[courseForm]" v-loading="loading" row-class-name="row-header">

                        <el-table-column label="课程名称" align="center">
                            <template slot-scope="scope">
                                <el-form-item prop="toCourseId">
                                    <el-select size="small" v-model="courseForm.toCourseId" placeholder="选择课程" @change="addCourseChange">
                                        <el-option v-for="(item, index) in courseLists" :key="index" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                            </template>
                        </el-table-column>

                        <el-table-column :label="buyCourse_type === 1 ? '选择班级' : '选择老师'" align="center">
                            <template slot-scope="scope">
                                <div v-if="buyCourse_type === 1">
                                    <el-select size="small" v-model="courseForm.grade_id" placeholder="选择班级" :clearable="true">
                                        <el-option v-for="(grade, index) in gradeLists" :key="index" :label="grade.name" :value="grade.id"></el-option>
                                    </el-select>
                                </div>
                                <div v-if="buyCourse_type === 2">
                                    <el-form-item prop="teacher_id">
                                        <el-select size="small" v-model="courseForm.teacher_id" placeholder="选择老师" :clearable="true">
                                            <el-option v-for="(grade, index) in gradeLists" :key="index" :label="grade.name" :value="grade.id"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="转入课时" align="center">
                            <template slot-scope="scope">
                                <el-form-item prop="inLessonNum">
                                    <el-input size="small" type="number" placeholder="转入课时" v-model.number="courseForm.inLessonNum"></el-input>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="赠送课时" align="center">
                            <template slot-scope="scope">
                                <el-form-item prop="inGivenNum">
                                    <el-input size="small" type="number" placeholder="赠送课时" v-model.number="courseForm.inGivenNum"></el-input>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="转入课程单价(元/课时)" align="center">
                            <template slot-scope="scope">
                                <el-form-item prop="inUnitPrice">
                                    <el-input size="small" placeholder="课时单价" type="number" v-model.number="courseForm.inUnitPrice"></el-input>
                                </el-form-item>
                            </template>
                        </el-table-column>
                        <el-table-column label="课程有效期" align="center">
                            <template slot-scope="scope">
                                <el-date-picker size="small" v-model="courseForm.expired_at" type="date" placeholder="选择日期" :picker-options="pickerOptions">
                                </el-date-picker>
                            </template>
                        </el-table-column>
                        <el-table-column label="转入课时金额" align="center">
                            <template slot-scope="scope">
                                <span class='fc-m'>{{(courseForm.inUnitPrice * courseForm.inLessonNum).toFixed(2)}}</span>元
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <p class="head-info">教材信息</p>
                <div class="d-f mt-20 textbook-form">
                    <div class="d-f">
                        <span class="p-r textbook-label pl-12">购买教材：</span>
                        <div class="ml-12">
                            <div class="add-textbook-box pr-100">
                                <el-form :model="textbookForm" size="small" ref="textbookForm" v-for="(textbookForm, index) in textbookFormLists" :key="index" :rules="textbookRules">
                                    <div class="d-f f-a-c">
                                        <el-form-item label-width="0" class="textbook-select">
                                            <el-select v-model="textbookForm.goods_id" placeholder="选择教材" @change="textbookChange(textbookForm, index)">
                                                <el-option v-for="(item, index) in textbookList" :key="index" :label="item.name" :value="item.id"></el-option>
                                            </el-select>
                                        </el-form-item>

                                        <el-form-item prop="num" label-width="0" class="ml-10 textbook-num">
                                            <el-input type="number" placeholder="数量" v-model.number="textbookForm.num" @input="textbookNumChange"></el-input>
                                        </el-form-item>

                                        <el-form-item class="fc-m ml-10">单价：{{textbookForm.unit_price}}元</el-form-item>

                                        <span class="textbool-close mb-17 ml-10 cursor-pointer" @click="textbookRemove(index)" v-if="textbookFormLists.length">
                                            <i class="el-tag__close el-icon-close"></i>
                                        </span>
                                    </div>
                                </el-form>
                            </div>
                            <div class="textbook-add" @click="textbookAddClick">添加</div>

                            <el-form-item label="教材优惠：" prop="preferentialTextbookPrice" label-width="85px" class="mt-20" v-if="textbookFormLists.length">
                                <el-input type="number" placeholder="教材优惠" v-model.number="courseForm.preferentialTextbookPrice" :disabled="preferentialDisabled"></el-input>
                                <span class="pl-10">元</span>
                            </el-form-item>
                        </div>
                    </div>
                    <!-- <el-form-item label="教材费用：" class="ml-50">
                        {{courseForm.textbookPrice}}
                    </el-form-item> -->
                </div>

                <p class="head-info">结算信息</p>
                <div class="mt-20">
                    <el-form-item label="付款方式：" prop="payWay">
                        <el-select v-model="courseForm.payWay" placeholder="付款方式">
                            <el-option v-for="(item, index) in paymentMethod" :key="index" :label="item.name" :value="item.id">
                                <span class="iconfont pr-5" :class="item.icon" :style="{color: item.font_color}"></span>
                                <span>{{item.name}}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="转课说明：" class="mt-30 textarea-cls explain-input" prop="explain">
                        <el-input type="textarea" :rows="4" placeholder="转课说明" v-model.trim="courseForm.explain"></el-input>
                    </el-form-item>
                </div>
                <div class="pl-12 mt-10">
                    <span v-if="SettlementMoney >= 0">应补交：</span>
                    <span v-else>应退费：</span>
                    <span class="fc-m fs-30">￥{{Math.abs(SettlementMoney.toFixed(2))}}</span>
                </div>
                <div class="mt-10">
                    <el-form-item prop="realPrice" :label="SettlementMoney >= 0 ? '实际补交：' : '实际退费：'">
                        <el-input type="number" :placeholder="SettlementMoney >= 0 ? '实际补交' : '实际退费'" v-model.number="courseForm.realPrice"></el-input>
                    </el-form-item>
                </div>

                <div class="d-f f-j-c mt-30">
                    <MyButton @click.native="doneHandle" :loading="submitLoading">确认转课</MyButton>
                </div>
            </el-form>
        </el-card>

        <!-- 转课详情弹窗 -->
        <ContractDialog v-model="dialogStatus.contract" :contractData="contractData" @CB-dialogStatus="CB_dialogStatus"></ContractDialog>
    </div>
</template>

<script>
import TableHeader from "../../components/common/TableHeader";
import MyButton from "../../components/common/MyButton";
import ContractDialog from "../../components/dialog/ChangeCourseContract";
import { StudentStatic } from "../../script/static";

export default {
  data() {
    return {
      loading: false,
      dialogStatus: { contract: false },

      state: "loading",
      submitLoading: false,

      course_name: "",

      contractData: {},

      buyCourse_type: 1, //选择课程的类型    有班/无班
      courseLists: [], //课程列表
      textbookList: [], //教材列表
      gradeLists: [], //班级列表
      paymentMethod: StudentStatic.paymentMethod, //付款方式
      orderInfo: [], //订单详情
      courseForm: {
        //表单填写信息
        fromCourseId: "", //转出课程id
        toCourseId: "", //转入课程id
        inLessonNum: "", //转入课时
        inPrice: "", //转入金额
        inUnitPrice: "", //转入课时单价
        expired_at: "", //转入课程过期时间
        preferentialTextbookPrice: "", //教材优惠
        realPrice: "", //实际价格
        planPrice: "", //预算价格
        explain: "", //说明
        payWay: "", //支付方式
        studentId: "", //学员id
        inGivenNum: "", //转入赠送课时

        out_lesson_num: [], //转出课时
        teacher_id: "", //老师id
        grade_id: "", //班级id
        textbookPrice: "" //教材总价
      },
      textbookFormLists: [],
      preferentialDisabled: true,
      textbookForm: { goods_id: "", num: "", unit_price: "" },
      courseRules: {
        toCourseId: [
          { required: true, message: "请选择课程", trigger: "change" }
        ],
        teacher_id: [
          { required: true, message: "请选择老师", trigger: "change" }
        ],
        inLessonNum: [
          { required: true, message: "请输入转入课时数" },
          { validator: this.$$tools.formOtherValidate("int") }
        ],
        inUnitPrice: [
          { required: true, message: "请输入转入课程单价" },
          { validator: this.$$tools.formOtherValidate("decimals", 2) },
          { validator: this.$$tools.formOtherValidate("total", 9999) }
        ],
        inGivenNum: [
          { validator: this.$$tools.formOtherValidate("lesson_num") },
          { validator: this.$$tools.formOtherValidate("total", 999) }
        ],
        payWay: [
          { required: true, message: "请选择付款方式", trigger: "change" }
        ],
        preferentialTextbookPrice: [
          { validator: this.$$tools.formOtherValidate("decimals", 2) },
          { validator: this.courseValidator("text_book") }
        ],
        explain: [{ max: 100, message: "长度不能超过100个字符" }],
        realPrice: [
          { required: true, message: "请输入实际金额" },
          { validator: this.$$tools.formOtherValidate("decimals", 2) }
        ]
      },
      textbookRules: {
        num: [
          { validator: this.$$tools.formOtherValidate("int") },
          { validator: this.$$tools.formOtherValidate("total", 200) }
        ]
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() <= Date.now();
        }
      }
    };
  },
  computed: {
    //购课总金额
    buyTotalMoney() {
      let coursePrice =
        Number(this.courseForm.unit_price) *
        Number(this.courseForm.lesson_num) -
        Number(this.courseForm.preferential_class_price);

      let money = coursePrice + this.courseForm.textbookPrice - Number(this.courseForm.preferentialTextbookPrice);

      if (Number(this.courseForm.deposit_money) >= 0) {
        money = money - Number(this.courseForm.deposit_money);
      }

      let b = money.toFixed(2);;
      this.courseForm.totalMoney = isNaN(b) ? "--" : b;

      return isNaN(b) ? "--" : b;
    },
    //结算金额
    SettlementMoney() {
      let out_money = 0;
      for (let i = 0; i < this.orderInfo.length; i++) {
        out_money += this.orderInfo[i].unit_price * this.courseForm.out_lesson_num[i];
      }
      let in_money = this.courseForm.inLessonNum * this.courseForm.inUnitPrice;
      let textbook_money = this.courseForm.textbookPrice - this.courseForm.preferentialTextbookPrice;
      let result = textbook_money + in_money - out_money;

      return isNaN(result) ? "--" : result;
    }
  },
  methods: {
    async getOrderDetail(course_id, student_id) {
      this.courseForm.out_lesson_num = [];
      const params = {
        courseId: course_id,
        studentId: student_id
      };
      let res = await this.$$request.get("/studentCourse/getOrderList", params);
      if (!res) return false;
      this.orderInfo = res;
      if (res.length > 0) {
        this.courseForm.expired_at = res[0].expired_at * 1000;
        for (let i = 0; i < this.orderInfo.length; i++) {
          this.courseForm.out_lesson_num.push(
            this.orderInfo[i].lesson_num_left
          );
        }
      }
      return true;
    },
    dialogClose() {
      this.$refs.courseForm.resetFields();
      Object.keys(this.courseForm).forEach(v => {
        this.courseForm[v] = "";
      });
      this.$emit("CB-dialogStatus", "course");
    },
    //优惠 输入验证   课程优惠 <= 课程费用    教材优惠 <= 教材费用
    courseValidator(type, query) {
      return (rule, value, callback, event, e, d) => {
        if (type === "course") {
          let coursePrice =
            Number(this.courseForm.unit_price) *
            Number(this.courseForm.lesson_num);

          if (value > coursePrice) {
            return callback(new Error("课程优惠不能大于课程费用"));
          }

          return callback();
        }

        if (type === "text_book") {
          if (value > this.courseForm.textbookPrice) {
            return callback(new Error("教材优惠不能大于教材费用"));
          }

          return callback();
        }

        if (type === "out_lesson_num") {
          let i = query;
          if (value > this.orderInfo[i].lesson_num_left) {
            return callback(new Error("转出课时不能大于剩余课时"));
          } else {
            return callback();
          }
        }

        if (type === "lesson_num_already") {
          if (value > this.courseForm.lesson_num) {
            return callback(new Error("已扣课时数不能超过购买课时数"));
          }

          return callback();
        }
      };
    },
    //弹窗变比，改变dialog状态回调
    CB_dialogStatus(type) {
      if (type === "contract") {
        this.contractData = {};
        return 0;
      }
    },
    //根据school_id获取课程列表
    async getCourseLists(id) {
      if (!id) {
        return 0;
      }
      let result = await this.$$request.post("/studentCourse/lists", {
        student_id: id
      });

      console.log(result);
      if (!result) {
        return 0;
      }
      this.courseLists = result.lists;

      return true;
    },
    //购买课程，选择课程change
    addCourseChange(val) {
      //   this.$refs.courseForm.clearValidate();
      this.courseForm.teacher_id = this.courseForm.grade_id = "";
      this.getGradeLists(val, true);
    },
    //课本数量修改
    textbookNumChange() {
      console.log("课本数量修改");
      let textbookPrice = 0;

      this.textbookFormLists.forEach(v => {
        let num = v.num ? Number(v.num) : 0;

        textbookPrice += num * v.unit_price;
      });

      if (textbookPrice > 0) {
        this.preferentialDisabled = false;
      } else {
        this.courseForm.preferentialTextbookPrice = "";
        this.preferentialDisabled = true;
      }

      this.courseForm.textbookPrice = textbookPrice;
      console.log(this.courseForm.textbookPrice);
    },
    //教材change
    textbookChange(textbook, num) {
      console.log("教材修改");
      this.textbookList.forEach(v => {
        if (v.id == textbook.goods_id) {
          textbook.unit_price = Number(v.price);
        }
      });
      this.textbookNumChange(num);
    },
    //教材新增
    textbookAddClick() {
      this.textbookFormLists.push({ goods_id: "", num: "", unit_price: "" });
    },
    //教材删除
    textbookRemove(index) {
      this.textbookFormLists.splice(index, 1);

      let textbookPrice = 0;

      this.textbookFormLists.forEach(v => {
        let num = v.num ? Number(v.num) : 0;

        textbookPrice += num * v.unit_price;
      });

      this.courseForm.textbookPrice = textbookPrice;

      if (!textbookPrice) {
        this.courseForm.preferentialTextbookPrice = "";
        this.preferentialDisabled = true;
      }
    },
    getGradeLists(val, change) {
      this.courseLists.forEach(v => {
        if (v.id == val) {
          console.log(v);
          this.$nextTick(() => {
            this.gradeLists = v.grades;
            this.buyCourse_type = v.class_pattern;
          });
        }
      });
    },
    //表单确定
    doneHandle() {
      this.$refs.courseForm.validate(valid => {
        if (valid) {
          this.submitBuyCourse();
        }
      });
    },
    //提交购买课程
    async submitBuyCourse() {
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;

      let params = {};

      const ignoreList = [
        "out_lesson_num",
        "grade_id",
        "teacher_id",
        "textbookPrice"
      ];

      for (let key in this.courseForm) {
        if (typeof this.courseForm[key] === undefined) {
          params[key] = "";
        } else if (key === "expired_at") {
          params[key] = new Date(this.courseForm[key]).getTime() / 1000;
        } else if (!ignoreList.includes(key)) {
          params[key] = this.courseForm[key];
        }
      }

      params.inPrice = (this.courseForm.inUnitPrice * this.courseForm.inLessonNum).toFixed(2) || 0;
      params.planPrice = this.SettlementMoney.toFixed(2);
      params.fromStudentCourseList = [];

      if(params.planPrice < 0) params.realPrice = (-params.realPrice);

      for (let i = 0; i < this.orderInfo.length; i++) {
        let q = this.orderInfo[i];
        params.fromStudentCourseList.push({
          id: q.id,
          outUnitPrice: q.unit_price,
          outPrice: q.unit_price * this.courseForm.out_lesson_num[i],
          outLessonNum: this.courseForm.out_lesson_num[i],
          outEliminateNum: q.eliminate_num
        });
      }
      params.dataId = this.buyCourse_type == 1 ? this.courseForm.grade_id : this.courseForm.teacher_id;
      params.textbook = this.textbookFormLists.map(k => {
        return {
          goods_id: k.goods_id,
          num: k.num,
          price: +k.unit_price * +k.num
        };
      });

      let result = await this.$$request.post("/studentCourse/transferCourse", params);

      if (!result) {
        this.submitLoading = false;
        return 0;
      }

      this.getContractDetail(result.id);
    },
    //转课后获取转课详情
    async getContractDetail(id) {
      let result = await this.$$request.get("/studentCourse/getTransferDetail", {id: id});

      this.submitLoading = false;
      if (!result) {
        return 0;
      }

      this.contractData = result;
      this.dialogStatus.contract = true;
    },
    async getTextBookLists() {
      let result = await this.$$request.get("/goods/textbookList");

      if (!result) {
        return 0;
      }
      this.textbookList = result.lists;

      return true;
    },
    textbookNumValidate() {
      return (rule, value, callback) => {
        if (isNaN(value)) {
          return callback(new Error("请输入数字"));
        } else if (value < 0) {
          return callback(new Error("请输入正数!"));
        } else if (String(value).indexOf(".") > -1) {
          return callback(new Error("不能输入小数"));
        } else if (value > 200) {
          return callback(new Error("不能超过200"));
        }

        return callback();
      };
    }
  },
  async created() {
    if (this.$route.query) {
      let query = this.$route.query;
      this.courseForm.fromCourseId = query.c_id;
      this.courseForm.studentId = query.s_id;
      this.course_name = query.c_name;

      let [a, b, c] = await Promise.all([this.getTextBookLists(), this.getOrderDetail(query.c_id, query.s_id), this.getCourseLists(query.s_id)]);

      if (a && b && c) {
        this.state = "loaded";
      }

      // this.getContractDetail(1661);
    }
  },
  components: { TableHeader, MyButton, ContractDialog }
};
</script>

<style lang="less" scoped>
.form-box {
  /deep/ .el-table {
    .row-header {
      > td {
        padding: 0;
        height: 60px;
        /deep/ .el-form-item__content {
          margin: 18px 0 0 !important;
        }
        /deep/ .el-form-item__error {
          width: 150px;
          left: 50%;
          text-align: left;
          transform: translateX(-50%);
        }
      }
    }
  }
  padding: 0 0 0 20px;
  h3 {
    font-weight: normal;
    font-size: 14px;
    padding-left: 38px;
    margin-bottom: 15px;
  }
  /deep/ .el-input {
    width: 150px;
  }
  .head-info {
    margin-top: 20px;
    position: relative;
    font-size: 16px;
    position: relative;
    padding-left: 10px;
    &::before {
      content: "";
      display: block;
      position: absolute;
      left: 0;
      top: 3px;
      width: 4px;
      height: 16px;
      background-color: #45dad5;
      border-radius: 5px;
    }
  }
  .list-item {
    width: 380px;
  }
  .explain-input {
    width: 1020px;
  }
}

.textbook-form {
  .textbook-num {
    /deep/ .el-input {
      width: 100px;
    }
  }
  .textbook-label {
    top: 5px;
  }
  .textbook-add {
    width: 56px;
    line-height: 28px;
    border: 1px #45dad5 solid;
    text-align: center;
    border-radius: 3px;
    color: #45dad5;
    cursor: pointer;
  }
  .add-textbook-box {
    max-height: 250px;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>


