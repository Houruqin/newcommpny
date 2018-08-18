<template>
    <el-dialog title="退费详情" width="850px" center :visible.sync="refundDialogStatus" 
        :close-on-click-modal="false" id="refund" @close="dialogClose('refund')">
        <div class="contract-box my-scrollbar pl-40" v-if="Object.keys(refundData).length">
            <el-scrollbar style="height: 100%;">
                <p class="pr-20">
                    <span>甲方：<i>{{refundData.student.name}}</i></span>
                    <span>签约校区：<i>{{refundData.student.name}}</i></span>
                    <span>操作人：<i>{{refundData.student.name}}</i></span>
                </p>
                <p v-if="refundData.parent" class="pr-20">
                    <span>乙方(学员)：<i>{{refundData.student.name}}</i></span>
                    <span>乙方家长：<i>{{refundData.student.name}}</i></span>
                    <span>电话：<i>{{refundData.student.name}}</i></span>
                </p>
                <!-- <p class="pr-20"><span>签约日期：<i>{{$$tools.format(contractData.pay_at)}}</i></span></p> -->

                <p class="pr-20">退费课程详情：</p>
                <div class="pr-20">
                    <table class="course-table">
                        <tr>
                            <td>课程名称</td>
                            <td>购买课时</td>
                            <td>剩余课时</td>
                            <td>课时退费</td>
                            <td>教材退费</td>
                            <td>退费金额</td>
                        </tr>
                        <tr>
                            <td>{{refundData.course.name}}</td>
                            <td>{{refundData.lesson_num}}</td>
                            <td>{{refundData.remain_num}}</td>
                            <td>{{refundData.rel_remain}}</td>
                            <td>{{refundData.rel_remain}}</td>
                            <td>{{refundData.rel_remain}}</td>
                        </tr>
                    </table>
                </div>
                <p class="pr-20">课程有效期：<i>{{refundData.expire}}</i>个月</p>
                <p class="pr-20">退费日期：<i>{{$$tools.format(refundData.pay_at)}}</i></p>
                <p class="pr-20">退费说明：<i>{{refundData.explain}}</i></p>
                <!-- <p class="pr-20">
                    <img :src="`data:image/png;base64,${contractData.qr}`" /><br/>
                    <span>扫码获取合约信息</span>
                </p> -->
                <div class="d-f f-j-e pr-20">
                    <MyButton @click.native="goSignedLists">确定</MyButton>
                    <MyButton @click.native="printCompact" class="ml-20">打印</MyButton>
                </div>
            </el-scrollbar>
        </div>
    </el-dialog>
</template>

<script>

import MyButton from '../common/MyButton'

export default {
    props: {
        dialogStatus: '',
        refundData: {default: {}},
    },
    components: {MyButton},
    watch: {
        dialogStatus(newVal, oldVal) {
            this.refundDialogStatus = newVal;
        }
    },
    data() {
        return {
            refundDialogStatus: false
        }
    },
    methods: {
        dialogClose() {
            this.$emit('CB-dialogStatus', 'refund');
        },
        //打印合同
        printCompact() {
            this.$router.push({name: 'contractView', params: {contractData: this.refundData, replace_path: 'student/signed'}});
        }
    },
    created() {
        console.log(this.refundData)
    }
}
</script>

<style lang="less" scoped>
    .contract-box {
        height: 480px;
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

