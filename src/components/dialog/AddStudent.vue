<template>
    <el-dialog :title="type == 'add' ? '学员登记' : '学员修改'" width="950px" center :visible.sync="studentDialogStatus" :close-on-click-modal="false" @close="dialogClose('addStudent')">
        <el-form :model="studentForm" label-width="120px" size="small" ref="addStudent" :rules="rules">
            <div class="form-box mt-30">
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="学员姓名：" prop="student_name">
                            <el-input v-model.trim="studentForm.student_name"></el-input>
                        </el-form-item>

                        <el-form-item label="联系电话：" prop="mobile">
                            <el-input v-model.trim="studentForm.mobile" ref="mobileObj"></el-input>
                        </el-form-item>

                        <el-form-item label="就读学校：" prop="school_name">
                            <el-input v-model.trim="studentForm.school_name" placeholder="选填"></el-input>
                        </el-form-item>

                        <el-form-item label="家长姓名：" prop="parent_name">
                            <el-input v-model.trim="studentForm.parent_name"></el-input>
                        </el-form-item>

                        <el-form-item label="意向课程：" class="mt-50">
                            <el-select v-model="studentForm.like_course" placeholder="选择课程" clearable>
                                <el-option v-for="(item, index) in $store.state.course" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="渠道信息：" prop="source_id" class="p-r">
                            <el-select v-model="studentForm.source_id" placeholder="请选择">
                                <el-option v-for="(item, index) in $store.state.source" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                            <div class="p-a add-source ver-c cursor-pointer" @click="addSource"><img src="../../images/common/add.png" alt=""></div>
                        </el-form-item>
                    </el-col>

                    <el-col :span="10" :offset="2">
                        <el-form-item label="性别：" prop="sex" >
                            <el-select v-model="studentForm.sex" placeholder="选择性别">
                                <el-option label="男" :value="1"></el-option>
                                <el-option label="女" :value="0"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="出生日期：">
                            <el-date-picker v-model="studentForm.birthday" :picker-options="pickerBeginDateAfter" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                        </el-form-item>

                        <el-form-item label="家庭住址：" prop="address">
                            <el-input v-model.trim="studentForm.address" placeholder="选填"></el-input>
                        </el-form-item>

                        <el-form-item label="家长关系：" prop="relation">
                            <el-select v-model="studentForm.relation" placeholder="请选择">
                                <el-option v-for="(item, index) in $store.state.familyRelations" :key="index" :label="item" :value="index"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="课程意向：" class="mt-50">
                            <el-select v-model="studentForm.like_grade" placeholder="选择意向度" clearable>
                                <el-option v-for="(item, index) in likeGrade" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="分配顾问：">
                            <el-select v-model="studentForm.advisor_id" placeholder="选择顾问" clearable>
                                <el-option label="暂不分配" value=""></el-option>
                                <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                
                <el-row class="mt-10">
                    <el-col :span="22">
                        <el-form-item label="备注：" class="textarea-cls">
                            <el-input type="textarea" :rows="4" placeholder="请输入备注信息" v-model.trim="studentForm.remark"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <div class="d-f f-j-c mt-40 mb-20"><MyButton @click.native="doneHandle('addStudent')">确定</MyButton></div>
            </div>
        </el-form>

        <el-dialog title="添加渠道" width="500px" center :visible.sync="sourceDialogStatus" :close-on-click-modal="false" @close="dialogClose('sourseForm')" append-to-body>
            <el-form :model="sourceForm" label-width="100px" size="small" :rules="sourceRules" ref="sourseForm">
                <div class="form-box">
                    <el-form-item label="渠道来源：" prop="name">
                        <el-input v-model.trim="sourceForm.name" placeholder="渠道名称"></el-input>
                    </el-form-item>
                    <div class="d-f f-j-c mt-40 mb-20"><MyButton @click.native="doneHandle('sourseForm')">确定</MyButton></div>
                </div>
            </el-form>
        </el-dialog>
    </el-dialog>
</template>

<script>

import {StudentStatic} from '../../script/static'
import MyButton from '../common/MyButton'
import Bus from '../../script/bus'

export default {
    props: {
        type: {default: 'add'},
        dialogStatus: '',
        editDetail: {default: null}
    },
    components: {MyButton},
    watch: {
        dialogStatus(newVal, oldVal) {
            this.studentDialogStatus = newVal;
        },
        type(newVal, oldVal) {
            console.log(newVal);
            this.studentType = newVal;
        },
        editDetail(newVal, oldVal) {
            if(!Object.keys(newVal).length) return 0;
            for(let key in newVal) {
                if(key == 'address' || key == 'remark' || key == 'school_name' || key == 'source_id' || key == 'sex' || key == 'id') {
                    this.studentForm[key] = newVal[key];
                }else if(key == 'birthday') {
                    this.studentForm[key] = newVal[key] > 0 ? newVal[key] * 1000 : '';
                }else if(key == 'parent_info') {
                    this.studentForm.mobile = newVal[key].mobile;
                    this.studentForm.parent_name = newVal[key].name;
                    this.studentForm.relation = newVal[key].relation;
                }else if(key == 'name') this.studentForm.student_name = newVal[key]
                else if(key == 'advisor_id' || key == 'like_course' || key == 'like_grade') {
                    this.studentForm[key] = newVal[key] == 0 ? '' : newVal[key];
                }
            }
        }
    },
    data() {
        return {
            likeGrade: StudentStatic.likeGrade,
            studentForm: {
                id: '',
                student_name: '',
                parent_name: '',
                relation: '',
                mobile: '',
                address: '',
                sex: '',
                birthday: '',
                like_course: '',
                like_grade: '',
                source_id: '',   //渠道id
                advisor_id: '',    //顾问id
                remark: '',   //备注信息
                school_name: ''
            },
            studentType: '',
            sourceForm: {name: ''},
            studentDialogStatus: false,
            sourceDialogStatus: false,
            rules: {
                parent_name: [
                    {max: 7, message: '长度不能超过7个字符'}
                ],
                address: [
                    {max: 50, message: '长度不能超过50个字符'}
                ],
                school_name: [
                    {max: 20, message: '长度不能超过20个字符'}
                ],
                mobile: [
                    {required: true, message: '请输入家长电话'},
                    {validator: this.$$tools.formValidate('phone')}
                ],
                student_name: [
                    {required: true, message: '请输入学员姓名'},
                    {max: 7, message: '长度不能超过7个字符'}
                ],
                sex: [
                    {required: true, message: '请选择性别', trigger: 'change'}
                ],
                source_id: [
                    {required: true, message: '请选择渠道信息', trigger: 'change'}
                ],
                remark: [
                    {max: 50, message: '长度不能超过50个字符'}
                ]
            },
            sourceRules: {  
                name: [
                    {required: true, message: '请输入渠道'},
                    {max: 20, message: '长度不能超过20个字符'}
                ]
            },
            pickerBeginDateAfter: {
                disabledDate: (time) => {
                    return time.getTime() > new Date().getTime();
                }
            }
        }
    },
    methods: {
        dialogClose(form) {
            this.$refs[form].resetFields();
            if(form === 'addStudent') {
                this.$emit('CB-dialogStatus', 'student');
                Object.keys(this.studentForm).forEach(v =>{this.studentForm[v] = ''});
            }else this.sourceForm.name = '';
        },
        //添加渠道信息
        addSource() {
            this.sourceForm.name = '';
            this.sourceDialogStatus = true;
        },
        //表单确定
        doneHandle(type) {
            this.$refs[type].validate(valid => {
                if(valid) type == 'addStudent' ? this.submitStudentInfo() : this.submitSourceInfo();
            });
        },
        //提交学员信息
        async submitStudentInfo() {
            let params = {}, url = 'api/student/add';
            for(let key in this.studentForm) {
                if(key == 'birthday') {
                    params[key] = this.studentForm[key] / 1000;
                }else if(key != 'id') params[key] = this.studentForm[key];
            };

            if(this.studentType == 'edit') {
                params.id = this.studentForm.id; 
                url = 'api/student/edit';
            }
            
            console.log(params);
            
            let result = await this.$$request.post(url, params);
            console.log(result);
            if(!result) return 0;

            if(this.studentType == 'edit') {
                if(result.status) this.$message.success('修改成功');
                this.$emit('CB-addStudent');
            }else {
                if(result.status) {
                    this.$confirm('已存在该账号，是否将学员添加至该账号下？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '修改手机号',
                        type: 'warning'
                    }).then(() => {
                        this.studentRepeat(params);
                    }).catch(() => {
                        this.$refs.mobileObj.focus();
                    });
                }else {
                    this.studentSuccessMessage(result.data);
                }
            }
        },
        //提交渠道信息
        async submitSourceInfo() {
            let result = await this.$$request.post('api/source/add', this.sourceForm);
            console.log(result);

            if(!result) return 0;
            this.sourceDialogStatus = false;

            this.$store.dispatch('geySource');   //更新渠道信息
        }, 
        //登记学员重复手机号码，处理方法
        async studentRepeat(params) {
            let result = await this.$$request.post('api/student/add', {...params, parent_this: 'yes'});
            console.log(result)
            if(!result) return 0;
            this.studentSuccessMessage(result.data);
        },
        //登记学员成功，二次提醒是否购课
        studentSuccessMessage(data) {
            this.$confirm('已成功登记学员，是否选择购课?', '提示', {
                confirmButtonText: '购买课程',
                cancelButtonText: '暂不办理',
                type: 'success'
            }).then(() => {
                this.$emit('CB-buyCourse', data);
            }).catch(() => {return 0});

            this.$emit('CB-addStudent');
            Bus.$emit('refreshStudentLists');
        }
    }
}
</script>

<style lang="less" scoped>
    .form-box {
        padding: 0 40px;
        .el-select, .el-date-editor {
            width: 100%;
        }
        .add-source {
            right: -40px;
            img {
                display: block;
            }
        }
    }
</style>


