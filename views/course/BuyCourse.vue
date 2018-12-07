<template>
    <div class="flex1">
        <PageState :state="state" />
        <el-card shadow="hover">
            <TableHeader title="购买课程"></TableHeader>

            <el-tabs v-model="activeTab" @tab-click="tabClick" class="tab-toolbar">
                <el-tab-pane label="购买课程" name="course"></el-tab-pane>
                <el-tab-pane label="购买课程包" name="coursePack"></el-tab-pane>
            </el-tabs>

            <el-form :model="courseForm" label-width="110px" size="small" :rules="courseRules" ref="courseForm" class="form-box mt-20">
                <p class="head-info">购买信息</p>
                <div class="mt-10 d-f">
                    <div class="list-item">
                        <el-form-item label="课程名称：" prop="course_id" v-if="activeTab === 'course'" key="course_change">
                            <el-select v-model="courseForm.course_id" placeholder="选择课程" @change="courseChange">
                                <el-option v-for="(item, index) in courseLists" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="课程包名称：" prop="course_package_id" v-if="activeTab === 'coursePack'" key="coursepack_change">
                            <el-select v-model="courseForm.course_package_id" placeholder="选择课程包" @change="coursePackChange">
                                <el-option v-for="(item, index) in $store.state.coursePackLists" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="购课类型：" prop="type">
                            <el-select v-model="courseForm.type" placeholder="选择购课类型">
                                <el-option label="新签约" :value="1"></el-option>
                                <el-option label="续约" :value="2"></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="list-item">
                        <el-form-item label="购课日期：" prop="pay_at">
                            <el-date-picker v-model="courseForm.pay_at" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                        </el-form-item>

                        <div v-if="buyCourse_type == 1 && activeTab === 'course'" key="grade_course_begrade">
                            <el-form-item label="选择班级：">
                                <el-select v-model="courseForm.grade_id" placeholder="请选择" :clearable="true">
                                    <el-option v-for="(grade, index) in gradeLists" :key="index" :label="grade.name" :value="grade.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </div>

                        <div v-if="buyCourse_type == 2 && activeTab === 'course'" key="teacher_coursepack_begrade">
                            <el-form-item label="选择老师：" prop="teacher_id">
                                <el-select placeholder="请选择" v-model="courseForm.teacher_id">
                                    <el-option v-for="(item, index) in gradeLists" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </div>

                        <el-form-item label="上课班级：" v-if="activeTab === 'coursePack' && beGradeLists.length" key="grade_course_nograde">
                          <div class="d-f"><MyButton @click.native="coursePackGradeClick" type="border" fontColor="fc-m" :minWidth="0">选择</MyButton></div>
                        </el-form-item>
                    </div>
                    <div class="list-item">
                        <el-form-item label="课程有效期：" prop="expire" label-width="110px">
                            <el-input type="number" placeholder="课程有效期" v-model.number="courseForm.expire"></el-input><span class="pl-10">月</span>
                        </el-form-item>
                        <el-form-item label="分配老师：" v-if="activeTab === 'coursePack' && noGradeLists.length" key="teacher_coursepack_nograde">
                          <div class="d-f"><MyButton @click.native="coursePackTeacherClick" type="border" fontColor="fc-m" :minWidth="0">分配</MyButton></div>
                        </el-form-item>
                    </div>
                </div>

                <p class="head-info">课程信息</p>
                <div class="mt-10 d-f">
                    <div class="list-item">
                        <el-form-item label="购买课时：" prop="lesson_num">
                            <el-input type="number" placeholder="购买课时" v-model.number="courseForm.lesson_num"></el-input><span class="pl-10">课时</span>
                        </el-form-item>

                        <el-form-item label="已扣课时：" prop="lesson_num_already">
                            <el-input type="number" placeholder="已扣课时" v-model.number="courseForm.lesson_num_already"></el-input><span class="pl-10">课时</span>
                        </el-form-item>
                    </div>
                    <div class="list-item">
                        <el-form-item label="课时单价：" prop="unit_price">
                            <el-input placeholder="课时单价" type="number"  v-model.number="courseForm.unit_price"></el-input><span class="pl-10">元/课时</span>
                        </el-form-item>

                        <el-form-item label="赠送课时：" prop="given_num">
                            <el-input type="number" placeholder="赠送课时" v-model.number="courseForm.given_num"></el-input><span class="pl-10">课时</span>
                        </el-form-item>
                    </div>
                    <div class="list-item">
                        <el-form-item label="课程优惠：" prop="preferential_class_price" label-width="110px">
                            <el-input type="number" placeholder="优惠金额" v-model.number="courseForm.preferential_class_price"></el-input><span class="pl-10">元</span>
                        </el-form-item>
                    </div>
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

                                        <span class="textbool-close mb-17 ml-10 cursor-pointer" @click="textbookRemove(index)" v-if="textbookFormLists.length"><i class="el-tag__close el-icon-close"></i></span>
                                    </div>
                                </el-form>
                            </div>
                            <div class="textbook-add" @click="textbookAddClick">添加</div>

                            <el-form-item label="教材优惠：" prop="preferential_textbook_price" label-width="85px" class="mt-20" v-if="textbookFormLists.length">
                                <el-input type="number" placeholder="教材优惠" v-model.number="courseForm.preferential_textbook_price" :disabled="preferentialDisabled"></el-input><span class="pl-10">元</span>
                            </el-form-item>
                        </div>
                    </div>
                    <!-- <el-form-item label="教材费用：" class="ml-50">
                        {{courseForm.textbook_price}}
                    </el-form-item> -->
                </div>

                <p class="head-info">付费信息</p>
                <div class="mt-20">
                    <el-form-item label="付款方式：" prop="pay_way">
                        <el-select v-model="courseForm.pay_way" placeholder="付款方式">
                            <el-option v-for="(item, index) in paymentMethod" :key="index" :label="item.name" :value="item.id">
                                <span class="iconfont pr-5" :class="item.icon" :style="{color: item.font_color}"></span>
                                <span>{{item.name}}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="购买说明：" class="mt-30 textarea-cls explain-input" prop="explain">
                        <el-input type="textarea" :rows="4" placeholder="购买说明" v-model.trim="courseForm.explain"></el-input>
                    </el-form-item>
                </div>

                <div class="pl-100">业绩归属：<span>{{courseForm.advisor_name}}</span></div>

                <!-- <div class="pl-28 mt-30"><span>总金额：</span><span>￥{{buyTotalMoney}}</span></div> -->
                <div v-if="Number(courseForm.deposit_money) >= 0">
                  <p class="head-info">定金信息</p>
                  <div class="mt-10">
                    <el-form-item label="已交定金：">{{courseForm.deposit_money}}元</el-form-item>
                  </div>
                </div>
                <div class="pl-12 mt-10"><span>应交金额：</span><span class="fc-m fs-30">￥{{buyTotalMoney}}</span></div>
                <div class="fs-12 pl-12 mt-10">
                  <span>注：</span>应交金额=（课程费用-课程优惠）+（教材费用-教材优惠）<span v-if="Number(courseForm.deposit_money) >= 0">-已交定金</span>
                </div>

                <div class="d-f f-j-c mt-30">
                    <MyButton @click.native="doneHandle" :loading="submitLoading">提交生成合约</MyButton>
                </div>
            </el-form>
        </el-card>

        <!-- 分班弹窗 -->
        <DivideClasses v-model="dialogStatus.divideClass" :gradeLists="divideClassLists" @CB-divideSuccess="CB_divideSuccess" divideType="buycourse" @input="CB_dialogClose"></DivideClasses>

        <!-- 购课合约弹窗 -->
        <ContractDialog v-model="dialogStatus.contract" :contractData="contractData" @CB-dialogStatus="CB_dialogStatus"></ContractDialog>

        <!-- 分配老师弹窗 -->
        <el-dialog title="分配老师" width="600px" center :visible.sync="dialogStatus.teacher" :close-on-click-modal="false">
          <el-form :model="teacherForm" label-width="110px" size="small" :rules="teacherRules" ref="teacherForm" class="teacher-form-box" v-for="(teacherForm, index) in noGradeLists" :key="index">
            <el-form-item :label="teacherForm.course.name + '：'" prop="teacher_id">
                <el-select v-model="teacherForm.teacher_id" placeholder="选择老师">
                  <el-option v-for="item in teacherForm.grades" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </el-form-item>
          </el-form>
          <div class="d-f f-j-c mt-30">
              <MyButton @click.native="divideTeacherDone">确定</MyButton>
          </div>
        </el-dialog>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import ContractDialog from '../../components/dialog/Contract';
import DivideClasses from '../../components/dialog/DivideClasses';
import {StudentStatic} from '../../script/static';

export default {
  data () {
    return {
      dialogStatus: {contract: false, divideClass: false, teacher: false},

      state: 'loading',
      submitLoading: false,
      activeTab: 'course',
      contractData: {},

      divideClassLists: [], //分班列表
      beGradeLists: [], //课程包有班课程列表,传给后台的数据
      noGradeLists: [], //课程包无班课程列表

      buyCourse_type: null, //选择课程的类型    有班/无班
      courseLists: [],
      textbookList: [], //教材列表
      gradeLists: [],
      paymentMethod: StudentStatic.paymentMethod, //付款方式
      courseForm: {
        deposit_money: '',
        student_id: '', //学员id
        parent_id: '', //家长id
        advisor_id: '', //顾问id
        advisor_name: '', //顾问
        course_id: '', //课程id
        lesson_num: '', //购买课时
        given_num: '', //赠送课时
        lesson_num_already: '', //已扣课时数
        expire: '', //有效期
        leave_num: '', //请假次数
        pay_at: '', //购课日期
        pay_way: '', //付款方式
        unit_price: '', //课时单价
        preferential_class_price: '', //课时优惠
        preferential_textbook_price: '', //教材优惠
        explain: '', //说明
        type: 1, //购课类型 1：新签约 2：续约
        grade_id: '',
        teacher_id: '',
        is_order: '',
        textbook_price: 0, //教材费用

        course_package_id: '', //课程包id
      },

      textbookFormLists: [],
      preferentialDisabled: true,
      textbookForm: {goods_id: '', num: '', unit_price: ''},
      courseRules: {
        course_id: [
          {required: true, message: '请选择课程', trigger: 'change'}
        ],
        course_package_id: [
          {required: true, message: '请选择课程包', trigger: 'change'}
        ],
        lesson_num: [
          {required: true, message: '请输入购买课时数'},
          {validator: this.$$tools.formOtherValidate('lesson_num')},
          {validator: this.$$tools.formOtherValidate('total', 999)}
        ],
        given_num: [
          {validator: this.$$tools.formOtherValidate('lesson_num')},
          {validator: this.$$tools.formOtherValidate('total', 999)}
        ],
        expire: [
          {required: true, message: '请输入课程有效期'},
          {validator: this.$$tools.formOtherValidate('int')},
          {validator: this.$$tools.formOtherValidate('total', 120)}
        ],
        pay_at: [
          {required: true, message: '请选择购课日期', trigger: 'change'}
        ],
        pay_way: [
          {required: true, message: '请选择付款方式', trigger: 'change'}
        ],
        preferential_class_price: [
          {validator: this.$$tools.formOtherValidate('decimals', 2)},
          {validator: this.$$tools.formOtherValidate('total', 9999)},
          {validator: this.courseValidator('course')}
        ],
        lesson_num_already: [
          {validator: this.$$tools.formOtherValidate('lesson_num')},
          {validator: this.$$tools.formOtherValidate('total', 999)},
          {validator: this.courseValidator('lesson_num_already')}
        ],
        unit_price: [
          {required: true, message: '请输入课时单价'},
          {validator: this.$$tools.formOtherValidate('decimals', 2)},
          {validator: this.$$tools.formOtherValidate('total', 9999)}
        ],
        preferential_textbook_price: [
          {validator: this.$$tools.formOtherValidate('decimals', 2)},
          {validator: this.courseValidator('text_book')}
        ],
        explain: [
          {max: 100, message: '长度不能超过100个字符'}
        ],
        type: [
          {required: true, message: '请选择购课类型', trigger: 'change'}
        ],
        teacher_id: [
          {required: true, message: '请选择老师', trigger: 'change'}
        ]
      },
      teacherRules: {
        teacher_id: [
          {required: true, message: '请选择老师', trigger: 'change'}
        ]
      },
      textbookRules: {
        num: [
          {validator: this.$$tools.formOtherValidate('int')},
          {validator: this.$$tools.formOtherValidate('total', 200)}
        ]
      }
    };
  },
  computed: {
    //购课总金额
    buyTotalMoney () {
      let coursePrice = Number(this.courseForm.unit_price) * Number(this.courseForm.lesson_num) - Number(this.courseForm.preferential_class_price);
      let money = coursePrice + this.courseForm.textbook_price - Number(this.courseForm.preferential_textbook_price);

      if (Number(this.courseForm.deposit_money) >= 0) {
        money = money - Number(this.courseForm.deposit_money);
      }
      let b;

      b = money.toFixed(2);
      this.courseForm.totalMoney = isNaN(b) ? '--' : b;

      return isNaN(b) ? '--' : b;
    }
  },
  methods: {
    dialogClose () {
      this.$refs.courseForm.resetFields();
      Object.keys(this.courseForm).forEach(v =>{
        this.courseForm[v] = '';
      });
      this.$emit('CB-dialogStatus', 'course');
    },
    //优惠 输入验证   课程优惠 <= 课程费用    教材优惠 <= 教材费用
    courseValidator (type) {
      return (rule, value, callback, event, e, d) => {
        if (type === 'course') {
          let coursePrice = Number(this.courseForm.unit_price) * Number(this.courseForm.lesson_num);

          if (value > coursePrice) {
            return callback(new Error('课程优惠不能大于课程费用'));
          }

          return callback();
        }

        if (type === 'text_book') {
          if (value > this.courseForm.textbook_price) {
            return callback(new Error('教材优惠不能大于教材费用'));
          }

          return callback();
        }

        if (type === 'lesson_num_already') {
          if (value > this.courseForm.lesson_num) {
            return callback(new Error('已扣课时数不能超过购买课时数'));
          }

          return callback();
        }
      };
    },
    //弹窗变比，改变dialog状态回调
    CB_dialogStatus (type) {
      if (type === 'contract') {
        this.contractData = {};
        return 0;
      }
    },
    /**
     * 课程包相关
     */
    tabClick () {

    },
    CB_dialogClose (type) {
      // if (!type) {
      //   this.divideClassLists = [];
      // }
    },
    CB_divideSuccess (data) {
      console.log(data);
      this.beGradeLists = data;
    },
    coursePackChange () {
      this.beGradeLists = [];
      this.divideClassLists = [];
      this.noGradeLists = [];
      this.getStudentGradeLists();
    },
    coursePackGradeClick () {
      if (!this.courseForm.course_package_id) return this.$message.error('请选择课程包');
      this.dialogStatus.divideClass = true;
    },
    coursePackTeacherClick () {
      this.dialogStatus.teacher = true;
    },
    async getStudentGradeLists () {
      let res = await this.$$request.get('/studentCourse/gradeCoursePackage', {
        student_id: this.courseForm.student_id,
        course_package_id: this.courseForm.course_package_id
      });
      console.log(res)
      if (!res) {
        return 0;
      }

      let coursePackLists = JSON.parse(JSON.stringify(this.$store.state.coursePackLists));

      coursePackLists.forEach(v => {
        if (v.id === this.courseForm.course_package_id) {
          v.course_package.forEach(k => {
            if (k.course.class_pattern === 1) {
              k.divideClassRadio = 0;
              res.grades.forEach(m => {
                if (k.course_id === m.course_id) {
                  k.grades.forEach(n => {
                    if (n.id === m.student_grade_id) {
                      k.divideClassRadio = m.student_grade_id;   //默认选中的班级
                    }
                  });
                }
              });
              this.divideClassLists.push(k);
              this.beGradeLists.push({
                course_id: k.course_id,
                grade_id: k.divideClassRadio,
                teacher_id: 0
              });
            } else {
              this.noGradeLists.push({...k, teacher_id: ''});
            }
          });
        }
      });
    },
    divideTeacherDone () {
      let isValid = false;
      for (let i = 0, len = this.$refs.teacherForm.length; i < len; i++) {
        this.$refs.teacherForm[i].validate(valid => {
          isValid = valid ? true : false;
        });
      }
      if (isValid) {
        this.dialogStatus.teacher = false;
      }
      console.log(this.noGradeLists);
    },
    //根据school_id获取课程列表
    async getCourseLists (id) {
      if (!id) {
        return 0;
      }
      let result = await this.$$request.post('/studentCourse/lists', {student_id: id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.courseLists = result.lists;

      if (this.courseForm.course_id) {
        this.getGradeLists(this.courseForm.course_id);
      }
    },
    //购买课程，选择课程change
    courseChange (val) {
      this.$refs.courseForm.clearValidate();
      this.getGradeLists(val, true);
    },
    textbookNumChange () {
      let textbookPrice = 0;

      this.textbookFormLists.forEach(v => {
        let num = v.num ? Number(v.num) : 0;

        textbookPrice += num * v.unit_price;
      });

      if (textbookPrice > 0) {
        this.preferentialDisabled = false;
      } else {
        this.courseForm.preferential_textbook_price = '';
        this.preferentialDisabled = true;
      }

      this.courseForm.textbook_price = textbookPrice;
    },
    //教材change
    textbookChange (textbook, num) {
      this.textbookList.forEach(v => {
        if (v.id == textbook.goods_id) {
          textbook.unit_price = Number(v.price);
        }
      });
      this.textbookNumChange(num);
    },
    //教材新增
    textbookAddClick () {
      this.textbookFormLists.push({goods_id: '', num: '', unit_price: ''});
    },
    //教材删除
    textbookRemove (index) {
      this.textbookFormLists.splice(index, 1);

      let textbookPrice = 0;

      this.textbookFormLists.forEach(v => {
        let num = v.num ? Number(v.num) : 0;

        textbookPrice += num * v.unit_price;
      });

      this.courseForm.textbook_price = textbookPrice;

      if (!textbookPrice) {
        this.courseForm.preferential_textbook_price = '';
        this.preferentialDisabled = true;
      }
    },
    getGradeLists (val, change) {
      this.courseLists.forEach(v => {
        if (v.id == val) {
          console.log(v);
          this.courseForm.expire = v.expire;
          this.courseForm.is_order = v.is_order;
          this.gradeLists = v.grades;
          this.buyCourse_type = v.class_pattern;

          if (change) {
            if (this.buyCourse_type == 1) {
              this.courseForm.grade_id = '';
            } else {
              this.courseForm.teacher_id = '';
            }
          }
        }
      });
    },
    //表单确定
    doneHandle () {
      this.$refs.courseForm.validate(valid => {
        if (valid) {
          this.submitBuyCourse();
        }
      });
    },
    //提交购买课程
    async submitBuyCourse () {
      let nogradeTeacher = [];
      if (this.activeTab === 'coursePack') {
        nogradeTeacher = this.noGradeLists.map(v => {
          return {
            course_id: v.course_id,
            grade_id: 0,
            teacher_id: v.teacher_id
          }
        });
        console.log(nogradeTeacher)
        let isValid = nogradeTeacher.every(v => v.teacher_id);
        if (!isValid) {
          return this.$message.error('课程未分配老师');
        }
      }

      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;

      let params = {};

      for (let key in this.courseForm) {
        if (typeof this.courseForm[key] === 'undefined') {
          params[key] = '';
        } else if (key === 'pay_at') {
          params[key] = this.courseForm[key] / 1000;
        } else if (key !== 'advisor_name' && key !== 'grade_id' && key !== 'teacher_id' && key !== 'course_package_id' && key !== 'course_id') {
          params[key] = this.courseForm[key];
        }
      }

      params.data_id = this.buyCourse_type == 1 ? this.courseForm.grade_id : this.courseForm.teacher_id;
      params.textbook = this.textbookFormLists.map(k => {
        return {goods_id: k.goods_id, num: k.num, price: +k.unit_price * +k.num};
      });
      params.preferential_price = this.courseForm.preferential_class_price + this.courseForm.preferential_textbook_price;

      if (this.activeTab === 'coursePack') {
        params.course_package = this.beGradeLists.concat(nogradeTeacher);
        params.course_package_id = this.courseForm.course_package_id;
      } else {
        params.course_id = this.courseForm.course_id;
      }

      console.log(params);

      let result = await this.$$request.post(`/studentCourse/${this.activeTab === 'course' ? 'add' : 'addCoursePackage'}`, params);

      this.submitLoading = false;
      console.log(result);
      if (!result) {
        return 0;
      }

      this.contractData = result.data;
      this.dialogStatus.contract = true;
    },
    async getTextBookLists () {
      let result = await this.$$request.get('/goods/textbookList');

      if (!result) {
        return 0;
      }
      this.textbookList = result.lists;

      return true;
    },
    textbookNumValidate () {
      return (rule, value, callback) => {
        if (isNaN(value)) {
          return callback(new Error('请输入数字'));
        } else if (value < 0) {
          return callback(new Error('请输入正数!'));
        } else if (String(value).indexOf('.') > -1) {
          return callback(new Error('不能输入小数'));
        } else if (value > 200) {
          return callback(new Error('不能超过200'));
        }

        return callback();
      };
    }
  },
  async created () {
    if (this.$route.query.buyCourseData) {
      let queryData = JSON.parse(this.$route.query.buyCourseData);

      this.getCourseLists(queryData.student_id);

      this.courseForm.student_id = queryData.student_id;
      this.courseForm.advisor_id = queryData.advisor_id;
      this.courseForm.deposit_money = queryData.deposit_money;
      this.courseForm.advisor_name = queryData.advisor ? queryData.advisor.name : '';
      this.courseForm.parent_id = queryData.parent_id;
      this.courseForm.expire = queryData.expire || 12;
      this.courseForm.type = queryData.buy_type || 1;

      if (queryData.course_id) {
        this.courseForm.course_id = queryData.course_id;
        if (queryData.class_pattern == 2) {
          this.courseForm.teacher_id = +queryData.teacher_id;
        }
      }

      this.courseForm.pay_at = new Date().getTime();
    }

    let datas = await this.getTextBookLists();

    if (datas) {
      this.state = 'loaded';
    }
  },
  components: {TableHeader, MyButton, ContractDialog, DivideClasses}
};
</script>

<style lang="less" scoped>
    .form-box {
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
                content: '';
                display: block;
                position: absolute;
                left: 0;
                top: 3px;
                width: 4px;
                height: 16px;
                background-color: #45DAD5;
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
            width:56px;
            line-height: 28px;
            border: 1px #45DAD5 solid;
            text-align: center;
            border-radius: 3px;
            color: #45DAD5;
            cursor: pointer;
        }
        .add-textbook-box {
            max-height: 250px;
            overflow: hidden;
            overflow-y: auto;
        }
    }
</style>


