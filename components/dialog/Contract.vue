<template>
    <el-dialog title="购课合约" width="900px" center :visible.sync="contractDialogStatus"
        :close-on-click-modal="false" id="contract" @close="dialogClose('contract')">
        <div class="contract-box my-scrollbar pl-40 pr-20" v-if="Object.keys(contractData).length">
            <el-scrollbar style="height: 100%;">
              <div class="pr-20">
                <p class="fs-16">基本信息：</p>
                <p class="mt-10">
                    <span>甲方：<i>{{contractData.institution.name}}</i></span>
                    <span>签约校区：<i>{{contractData.school.name}}</i></span>
                    <span>签约人：<i>{{contractData.user.name}}</i></span>
                </p>
                <p v-if="contractData.parent" class="mt-10">
                    <span>乙方(学员)：<i>{{contractData.student.name}}</i></span>
                    <span>乙方家长：<i>{{contractData.parent.name}}</i></span>
                    <span>电话：<i>{{contractData.parent.mobile}}</i></span>
                </p>
                <p class="mt-10"><span>签约日期：<i>{{$$tools.format(contractData.pay_at)}}</i></span></p>

                <p class="fs-16 mt-20">购课信息：</p>
                <table class="course-table">
                    <tr>
                        <td>课程名称</td>
                        <td>购买课时</td>
                        <td>课时单价</td>

                        <td>教材原价</td>
                        <td>优惠总额</td>

                        <td>赠送课时</td>
                        <td>已扣课时</td>
                        <td>实交课时费</td>
                        <td>实交教材费</td>
                    </tr>
                    <tr>
                        <td>{{contractData.course.name}}</td>
                        <td>{{contractData.lesson_num}}</td>
                        <td>{{contractData.unit_price}}</td>
                        <td>{{contractData.textbook_price + Number(contractData.preferential_textbook_price)}}</td>
                        <td>{{contractData.preferential_price}}</td>
                        <td>{{contractData.given_num}}</td>
                        <td>{{contractData.lesson_num_already}}</td>
                        <td>{{contractData.lesson_price}}</td>
                        <td>{{contractData.textbook_price}}</td>
                    </tr>
                </table>
                <p class="mt-10">合同金额：{{contractData.real_price}}</p>
                <p class="mt-10" v-if="contractData.deposit_money >= 0">已交定金：{{contractData.deposit_money}}</p>
                <p class="mt-10">课程有效期：<i>{{contractData.expired_at * 1000 | date}}</i></p>
                <p class="mt-10">购买说明：<i>{{contractData.explain}}</i></p>
                <p class="mt-10">
                    <img :src="`data:image/png;base64,${contractData.qr}`" /><br/>
                    <span>扫码获取合约信息</span>
                </p>
                <div class="d-f f-j-e">
                    <MyButton @click.native="goSignedLists">确定</MyButton>
                    <MyButton @click.native="printCompact" class="ml-20">打印合同</MyButton>
                </div>
              </div>
            </el-scrollbar>
        </div>
    </el-dialog>
</template>

<script>

import MyButton from '../common/MyButton';

export default {
  props: {
    dialogStatus: '',
    contractData: {default: {}},
    routerAble: {default: true} //如果是购课流程，购完课会跳到签约学员详情页
  },
  components: {MyButton},
  watch: {
    dialogStatus (newVal, oldVal) {
      this.contractDialogStatus = newVal;
    }
  },
  data () {
    return {
      contractDialogStatus: false
    };
  },
  methods: {
    dialogClose () {
      this.$emit('CB-dialogStatus', 'contract');
      if (this.routerAble) {
        this.$router.push({path: '/student/signeddetail', query: {id: this.contractData.student_id}});
      }
    },
    //合约确定按钮，跳转签约学员详情
    goSignedLists () {
      this.contractDialogStatus = false;
      if (this.routerAble) {
        this.$router.push({path: '/student/signeddetail', query: {id: this.contractData.student_id}});
      }
    },
    //打印合同
    printCompact () {
      this.$router.push({path: '/contract', query: {contractData: JSON.stringify(this.contractData), replace_path: 'student/signed'}});
    }
  }
};
</script>

<style lang="less" scoped>
    .contract-box {
        height: 480px;
        p {
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

