
<template>
    <div class="content-bg bgc-m">
        <div class="d-f f-j-c"><img :src="logo"></div>
        <div class="content-box bgc-f">
            <div class="school-area">
                <h3 class="t-a-c fs-18 fc-5">创建校区信息</h3>
                <div v-for="(form, index) in formLists" :key="index" class="p-r" :class="{'line': index > 0}">
                    <el-form :model="form" label-width="120px" size="small" :rules="rules" ref="schoolForm">
                        <div class="form-box">
                            <el-form-item label="机构名称：" prop="organization_id">
                                <el-select v-model="form.organization_id" placeholder="机构名称">
                                    <el-option v-for="(item, index) in organizationInfo" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                                <a v-if="formLists.length > 1" class="p-a cursor-pointer" @click="formLists.splice(index, 1)"><img src="../images/common/deleteSchool.png"></a>
                            </el-form-item>

                            <el-form-item label="校区名称：" prop="school" class="mt-30">
                                <el-input v-model.trim="form.school" placeholder="校区名称"></el-input>
                            </el-form-item>

                            <el-form-item label="校长姓名：" prop="principalName" class="mt-30">
                                <el-input v-model.trim="form.principalName" placeholder="校长姓名"></el-input>
                            </el-form-item>

                            <el-form-item label="校长手机号：" prop="principalPhone" class="mt-30">
                                <el-input v-model.trim="form.principalPhone" placeholder="校长手机号"></el-input>
                            </el-form-item>

                            <el-form-item label="校区座机号：" prop="tel" class="mt-30">
                                <el-input v-model.trim="form.tel" placeholder="校区座机号"></el-input>
                            </el-form-item>

                            <el-form-item label="校区地址：" prop="address" class="mt-30">
                                <el-input v-model.trim="form.address" placeholder="校区地址"></el-input>
                            </el-form-item>

                            <el-form-item label="课程模式：" prop="class_pattern" class="mt-30">
                                <el-radio-group v-model="form.class_pattern">
                                    <el-radio :label="0">全部</el-radio>
                                    <el-radio :label="1">有班课程</el-radio>
                                    <el-radio :label="2">无班课程</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </div>
                    </el-form>
                </div>
            </div>
            <div class="d-f mt-60 f-j-c">
                <MyButton @click.native="doneHandle('schoolForm')">确定</MyButton>
                <MyButton type="subm" @click.native="addHandle('schoolForm')" class="ml-20">继续添加</MyButton>
                <MyButton type="gray" @click.native="quitHandle" class="ml-20">退出</MyButton>
            </div>
        </div>
    </div>
</template>

<script>

import MyButton from '../components/common/MyButton'
import Logo from '../images/common/organization-logo.png'

export default {
    data() {
        return {
            logo: Logo,
            addShow: true,    //是否展示添加校区表单
            organizationInfo: [],
            formLists: [{
                organization_id: '',    //机构名称
                school: '',    //校区名称
                principalName: '',    //校长姓名
                principalPhone: '',   //校长手机号
                tel: '',    //联系电话
                address: '',   //校区
                class_pattern: ''
            }],
            rules: {
                organization_id: [
                    {required: true, message: '请选择机构', trigger: 'change'}
                ],
                school: [
                    {required: true, message: '请输入校区名称'},
                    {max: 20, message: '长度不能超过20个字符'}
                ],
                principalName: [
                    {required: true, message: '请输入分校长姓名'},
                    {max: 7, message: '长度不能超过7个字符'}
                ],
                principalPhone: [
                    {required: true, message: '请输入分校长电话'},
                    {validator: this.$$tools.formValidate('phone')}
                ],
                tel: [
                    {required: true, message: '请输入联系电话'},
                    {validator: this.$$tools.formValidate('tel')}
                ],
                address: [
                    {required: true, message: '请输入校区地址'},
                    {max: 50, message: '长度不能超过50个字符'}
                ],
                class_pattern: [
                    {required: true, message: '请选择课程模式', trigger: 'change'}
                ]
            }
        }
    },
    methods: {
        //添加
        addHandle(formName) {
            let result = this.$refs[formName].map(v => {
                let validate;
                v.validate((valid) => {validate = valid});
                return validate;
            });

            if(result.every(d => {return d})) {
                this.formLists.push({
                    organization_id: '',    //机构名称
                    school: '',    //校区名称
                    principalName: '',    //校长姓名
                    principalPhone: '',   //校长手机号
                    tel: '',    //联系电话
                    address: '',   //校区
                    class_pattern: ''    //校区课程模式
                });
            }
        },

        //确定
        doneHandle(formName) {
            let result = this.$refs[formName].map(v => {
                let validate;
                v.validate((valid) => {validate = valid});
                return validate;
            });

            if(result.every(d => {return d})) this.submitHandle();
        },
        //退出
        async quitHandle() {
            let result = await this.$$request.post('api/auth/logout');
            console.log(result);
            if(!result) return 0;
            this.$$cache.loginOut();
            this.formLists.splice(0, this.formLists.length);
            this.$message('已退出登录！');
        },
        //提交数据
        async submitHandle() {
            let params = this.formLists.map(v => {
                return {
                    school: {
                        institution_id: v.organization_id,
                        name: v.school,
                        type: '',
                        contact: v.tel,
                        class_pattern: v.class_pattern,
                        address: v.address
                    },
                    user: {
                        institution_id: v.organization_id,
                        mobile: v.principalPhone,
                        name: v.principalName
                    }
                }
            });

            let result = await this.$$request.post('api/school/add', {lists: params.reverse()});
            console.log(result);
            if(!result) return 0;
            let memberInfo = this.$$cache.getMemberInfo();
            memberInfo.school_id = result.school_id;
            this.$$cache.setMemberInfo(memberInfo);

            this.formLists.splice(0, this.formLists.length);
            this.$router.replace({path: '/home'});
        }
    },
    async created() {
        let result = await this.$$request.post('api/user/orgLists');
        console.log(result);
        if(!result) return 0;
        this.organizationInfo = result.lists;
    },
    components: {MyButton}
}
</script>

<style lang="less" scoped>
    .content-bg {
        width: 100%;
        height: 100%;
        display: table;
        padding: 80px 0;
    }
    .content-box {
        width: 1200px;
        padding: 40px 0 70px;
        margin: 0 auto;
        margin-top: 50px;
        .school-area {
            padding: 0 310px;
            h3 {
                font-weight: normal;
                padding-bottom: 40px;
            }
            .el-select {
                width: 100%;
            }
            .line {
                margin-top: 100px;
                &::before {
                    content: '';
                    position: absolute;
                    width: 1060px;
                    border: 0.5px #e3e3e3 dashed;
                    top: -50px;
                    left: 50%;
                    transform: translateX(-50%);
                }
            }
            a {
                right: -40px;
                top: 5px;
                img {
                    display: block;
                }
            }
        }
    }
    .form-box {
        padding: 0 30px;
    }
    .el-select-dropdown__item.selected {
        color: #45DAD5;
        font-weight: normal;
    }
</style>


