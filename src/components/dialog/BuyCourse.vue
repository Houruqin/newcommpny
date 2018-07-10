<template>
    <el-dialog title="购买课程" width="1100px" center :visible.sync="courseDialogStatus" :close-on-click-modal="false" @close="dialogClose">
        <el-form :model="courseForm" label-width="95px" size="small" :rules="courseRules" ref="courseForm">
            <div class="form-box">
                <p class="head-info">购买信息</p>
                <el-row class="mt-10">
                    <el-col :span="7">
                        <el-form-item label="选择课程：" prop="course_id">
                            <el-select v-model="courseForm.course_id" placeholder="选择课程" @change="addCourseChange">
                                <el-option v-for="(item, index) in $store.state.course" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-form-item label="购课日期：" prop="pay_at">
                            <el-date-picker v-model="courseForm.pay_at" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-form-item label="课程有效期：" prop="expire" label-width="110px">
                            <el-input-number v-model="courseForm.expire" controls-position="right" :min="1" :max="120"></el-input-number><span class="pl-10">月</span>
                        </el-form-item>
                    </el-col>
                </el-row>

                <p class="head-info">课程信息</p>
                <el-row class="mt-10 course-form-box">
                    <el-col :span="7">
                        <el-form-item label="购买课时：" prop="lesson_num">
                            <el-input-number v-model="courseForm.lesson_num" controls-position="right" :min="1" :max="200"></el-input-number><span class="pl-10">课时</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-form-item label="课时单价：" prop="unit_price" class="price-input">
                            <el-input placeholder="课时单价" v-model="courseForm.unit_price"></el-input><span class="pl-10">元/课时</span>
                            <!-- <el-input-number v-model="courseForm.unit_price" controls-position="right" :min="0" :max="9999"></el-input-number><span class="pl-10">元/课时</span> -->
                        </el-form-item>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-form-item label="允许请假数：" prop="leave_num" label-width="110px">
                            <el-input-number v-model="courseForm.leave_num" controls-position="right" :min="0" :max="200"></el-input-number><span class="pl-10">次</span>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row class="course-form-box">
                    <el-col :span="7">
                        <el-form-item label="已扣课时：" prop="lesson_num_already">
                            <el-input-number v-model="courseForm.lesson_num_already" controls-position="right" :min="0" :max="200"></el-input-number><span class="pl-10">课时</span>
                        </el-form-item>
                    </el-col>
                </el-row>

                <p class="head-info">购课优惠及费用</p>
                <el-row class="mt-10 course-form-box">
                    <el-col :span="7">
                        <el-form-item label="赠送课时：" prop="given_num">
                            <el-input-number v-model="courseForm.given_num" controls-position="right" :min="0" :max="200"></el-input-number><span class="pl-10">课时</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-form-item label="优惠金额：" prop="preferential_price" class="price-input">
                            <el-input placeholder="优惠金额" v-model="courseForm.preferential_price"></el-input><span class="pl-10">元</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-form-item label="付款方式：" prop="pay_way" label-width="110px">
                            <el-select v-model="courseForm.pay_way" placeholder="付款方式">
                                <el-option v-for="(item, index) in paymentMethod" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="购买说明：" class="mt-10 textarea-cls" prop="explain">
                    <el-col :span="21">
                        <el-input type="textarea" :rows="4" placeholder="购买说明" v-model.trim="courseForm.explain"></el-input>
                    </el-col>
                </el-form-item>

                <div class="pl-100">业绩归属：<span>{{courseForm.advisor_name}}</span></div>

                <div class="mt-10">
                    <el-form-item label="总金额：" prop="pay_way" label-width="95px">
                        <span class="fc-m fs-22">￥{{(courseForm.unit_price * courseForm.lesson_num - courseForm.preferential_price).toFixed(2)}}</span>
                    </el-form-item>
                </div>
                <div class="d-f f-j-c mt-30">
                    <MyButton @click.native="doneHandle">提交生成合约</MyButton>
                </div>
            </div>
        </el-form>
    </el-dialog>
</template>

<script>

import {StudentStatic} from '../../script/static'
import MyButton from '../common/MyButton'

export default {
    props: {
        dialogStatus: '',
        buyCourseData: {default: {}}
    },
    components: {MyButton},
    watch: {
        dialogStatus(newVal, oldVal) {
            this.courseDialogStatus = newVal;
        },
        buyCourseData(newVal, oldVal) {
            console.log(newVal);

            this.courseForm.student_id = newVal.id;
            this.courseForm.advisor_id = newVal.advisor_id;
            this.courseForm.advisor_name = newVal.advisor ? newVal.advisor.name : '';
            this.courseForm.parent_id = newVal.parent_id;
            this.courseForm.expire = 12;
            this.courseForm.preferential_price = 0;
            this.courseForm.unit_price = 0;
            this.courseForm.pay_at = new Date().getTime();
        }
    },
    data() {
        return {
            courseDialogStatus: false,
            paymentMethod: StudentStatic.paymentMethod, //付款方式
            courseForm: {
                student_id: '', //学员id
                parent_id: '',  //家长id
                advisor_id: '', //顾问id
                advisor_name: '',   //顾问
                course_id: '',  //课程id
                lesson_num: '',   //购买课时
                given_num: '',  //赠送课时
                lesson_num_already: '',  //已扣课时数
                expire: '',   //有效期
                leave_num: '',   //请假次数 
                pay_at: '',   //购课日期
                pay_way: '',   //付款方式
                unit_price: '',   //课时单价
                preferential_price: '',  //优惠价格
                explain: ''   //说明
            },
            courseRules: {
                course_id: [
                    {required: true, message: '请选择课程', trigger: 'change'}
                ],
                lesson_num: [
                    {required: true, message: '请输入购买课时数'},
                    {validator: this.$$tools.formOtherValidate('int')}
                ],
                given_num: [
                    {required: true, message: '请输入赠送课时数'},
                    {validator: this.$$tools.formOtherValidate('int')}
                ],
                expire: [
                    {required: true, message: '请输入课程有效期'},
                    {validator: this.$$tools.formOtherValidate('int')}
                ],
                pay_at: [
                    {required: true, message: '请选择购课日期', trigger: 'change'}
                ],
                pay_way: [
                    {required: true, message: '请选择付款方式', trigger: 'change'}
                ],
                preferential_price: [
                    {required: true, message: '请输入优惠金额'},
                    {validator: this.$$tools.formOtherValidate('price')}
                ],
                lesson_num_already: [
                    {validator: this.$$tools.formOtherValidate('int')}
                ],
                leave_num: [
                    {validator: this.$$tools.formOtherValidate('int')}
                ],
                unit_price: [
                    {required: true, message: '请输入课时单价'},
                    {validator: this.$$tools.formOtherValidate('price')}
                ],
                explain: [
                    {max: 200,  message: '长度不能超过200个字符'}
                ]
            },
        }
    },
    methods: {
        dialogClose() {
            this.$refs.courseForm.resetFields();
            Object.keys(this.courseForm).forEach(v =>{this.courseForm[v] = ''});
            this.$emit('CB-dialogStatus', 'course');
        },
        //购买课程，选择课程change
        addCourseChange(val) {
            this.$store.state.course.forEach(v => {
                if(v.id == val) {
                    this.courseForm.expire = v.expire;
                }
            });
        },
        //表单确定
        doneHandle() {
            this.$refs.courseForm.validate(valid => {if(valid) this.submitBuyCourse()});
        },
        //提交购买课程
        async submitBuyCourse() {
            if(this.courseForm.lesson_num_already > this.courseForm.lesson_num) return this.$message.warning('已扣课时数不能超过购买课时数!');
            if(this.courseForm.leave_num > this.courseForm.lesson_num) return this.$message.warning('请假次数不能超过购买课时数!');
            if(this.courseForm.preferential_price > this.courseForm.unit_price * this.courseForm.lesson_num) return this.$message.warning('优惠不能超过总金额!');

            let params = {};
            for(let key in this.courseForm) {
                if(typeof this.courseForm[key] === 'undefined') params[key] = '';
                else if(key == 'pay_at') params[key] = this.courseForm[key] / 1000;
                else if(key != 'advisor_name') params[key] = this.courseForm[key];
            };

            console.log(params);

            let result = await this.$$request.post('api/studentCourse/add', params);
            console.log(result);
            if(!result) return 0;

            this.$emit('CB-contract', result.data);
        }
    }
}
</script>

<style lang="less" scoped>
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
        input {
            width: 175px !important;
        }
    }
</style>


