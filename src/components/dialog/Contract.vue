<template>
    <el-dialog title="购课合约" width="850px" center :visible.sync="contractDialogStatus" :close-on-click-modal="false" id="contract" @close="dialogClose('contract')">
        <div class="contract-box" v-if="Object.keys(contractData).length">
            <p>
                <span>甲方：<i>{{contractData.institution.name}}</i></span>
                <span>签约校区：<i>{{contractData.school.name}}</i></span>
                <span>签约人：<i>{{contractData.user.name}}</i></span>
            </p>
            <p v-if="contractData.parent">
                <span>乙方(学员)：<i>{{contractData.student.name}}</i></span>
                <span>乙方家长：<i>{{contractData.parent.name}}</i></span>
                <span>电话：<i>{{contractData.parent.mobile}}</i></span>
            </p>
            <p><span>签约日期：<i>{{$$tools.format(contractData.pay_at)}}</i></span></p>

            <p>购买课程详情：</p>
            <table class="course-table">
                <tr>
                    <td>课程名称</td>
                    <td>购买课时</td>
                    <td>课时单价</td>
                    <td>教材费用</td>
                    <td>优惠金额</td>
                    <td>赠送课时</td>
                    <td>已扣课时</td>
                    <td>合同金额</td>
                </tr>
                <tr>
                    <td>{{contractData.course.name}}</td>
                    <td>{{contractData.lesson_num}}</td>
                    <td>{{contractData.unit_price}}</td>
                    <td>{{contractData.textbook_price}}</td>
                    <td>{{contractData.preferential_price}}</td>
                    <td>{{contractData.given_num}}</td>
                    <td>{{contractData.lesson_num_already}}</td>
                    <td>{{contractData.real_price}}</td>
                </tr>
            </table>

            <p>课程有效期：<i>{{contractData.expire}}</i>个月</p>
            <p>购买日期：<i>{{$$tools.format(contractData.pay_at)}}</i></p>
            <p>购买说明：<i>{{contractData.explain}}</i></p>
            <p>
                <img :src="`data:image/png;base64,${contractData.qr}`" /><br/>
                <span>扫码获取合约信息</span>
            </p>
            <div class="d-f f-j-e">
                <MyButton @click.native="goSignedLists">确定</MyButton>
                <MyButton @click.native="printCompact" class="ml-20">打印合同</MyButton>
            </div>
        </div>
    </el-dialog>
</template>

<script>

import MyButton from '../common/MyButton'

export default {
    props: {
        dialogStatus: '',
        contractData: {default: {}},
        routerAble: {type: Boolean,default: () => true}
    },
    components: {MyButton},
    watch: {
        dialogStatus(newVal, oldVal) {
            this.contractDialogStatus = newVal;
        }
    },
    data() {
        return {
            contractDialogStatus: false
        }
    },
    methods: {
        dialogClose() {
            this.$emit('CB-dialogStatus', 'contract');
        },
        //合约确定按钮，跳转签约学员详情
        goSignedLists() {
            if(this.routerAble){
                this.contractDialogStatus = false;
                this.$router.replace({path: '/student/signeddetail', query: {id: this.contractData.student_id}});
            }else{
                this.$emit('CB-dialogStatus', 'contract');
            }
        },
        //打印合同
        printCompact() {
            this.$router.push({name: 'contractView', params: {contractData: this.contractData, replace_path: 'student/signed'}});
        }
    }
}
</script>

<style lang="less" scoped>
    .contract-box {
        padding: 0 30px;
        p {
            &:not(:first-child) {
                margin-top: 10px;
            }
            span {
                margin-right: 30px;
            }
        }
        .course-table {
            border-collapse: collapse;
            margin-top: 10px;
            td {
                border: 1px #BFBFBF solid;
                width: 120px;
                text-align: center;
                line-height: 40px;
            }
        }
    }
</style>

