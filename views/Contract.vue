<template>
    <div>
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
                    <td>优惠金额</td>
                    <td>赠送课时</td>
                    <td>已扣课时</td>
                    <td>合同金额</td>
                </tr>
                <tr>
                    <td>{{contractData.course.name}}</td>
                    <td>{{contractData.lesson_num}}</td>
                    <td>{{contractData.unit_price}}</td>
                    <td>{{contractData.preferential_price}}</td>
                    <td>{{contractData.given_num}}</td>
                    <td>{{contractData.lesson_num_already}}</td>
                    <td>{{contractData.real_price}}</td>
                </tr>
            </table>

            <p>课程有效期：<span>{{contractData.expire}}</span>个月</p>
            <p>购买日期：<span>{{$$tools.format(contractData.pay_at)}}</span></p>
            <p>购买说明：<i>{{contractData.explain}}</i></p>
            <p>
                <img :src="`data:image/png;base64,${contractData.qr}`" /><br/>
                <span>扫码获取合约信息</span>
            </p>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      contractData: {}
      // replace_path: '',
      // query: null
    };
  },
  created () {
    if (this.$route.query.contractData) {
      this.contractData = JSON.parse(this.$route.query.contractData);
      // this.replace_path = this.$route.query.replace_path;
      // this.query = this.$route.query.path_query ? this.$route.query.path_query : null
    }
  },
  mounted () {
    window.print();

    this.$router.go(-1);
    // if(this.query) {
    //     this.$router.replace({path: this.replace_path, query: this.query});    //详情购课，需要传参，回到学员详情
    // }else {
    //     this.$router.replace(this.replace_path);     //列表购课，直接跳转列表，不需要参数
    // }
  }
};

</script>

<style lang="less" scoped>
    .contract-box {
        padding: 50px 30px;
        width: 850px;
        margin: 0 auto;
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


