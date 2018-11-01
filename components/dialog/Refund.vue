<template>
    <el-dialog title="退费详情" width="900px" center :visible.sync="refundDialogStatus"
        :close-on-click-modal="false" id="refund" @close="dialogClose('refund')">
        <div class="contract-box my-scrollbar pl-40 pr-20" v-if="Object.keys(refundData).length">
            <el-scrollbar style="height: 100%;">
              <div class="pr-20">
                <p class="fs-16">基本信息：</p>
                <p class="mt-10">
                    <span>甲方：<i>{{refundDataInfo.quitCourseDetail.institution.name}}</i></span>
                    <span>签约校区：<i>{{refundDataInfo.quitCourseDetail.school.name}}</i></span>
                    <span>操作人：<i>{{refundDataInfo.quitCourseDetail.user ? refundDataInfo.quitCourseDetail.user.name : '无'}}</i></span>
                </p>
                <p v-if="refundDataInfo.parent" class="mt-10">
                    <span>乙方：<i>{{refundDataInfo.parent.name}}</i></span>
                    <span>电话：<i>{{refundDataInfo.parent.mobile}}</i></span>
                </p>
                <p class="mt-10">
                  <span>上课学员：<i>{{refundDataInfo.quitCourseDetail.student.name}}</i></span>
                  <span>签约日期：<i>{{$$tools.format(refundDataInfo.quitCourseDetail.created_at)}}</i></span>
                </p>
                <!-- <p class="pr-20"><span>签约日期：<i>{{$$tools.format(contractData.pay_at)}}</i></span></p> -->

                <p class="fs-16 mt-20">退费信息：</p>
                <table class="course-table">
                    <tr>
                        <td>退费课程</td>
                        <td>购买课时</td>
                        <td>剩余课时</td>
                        <td>实交课时费</td>
                        <td>剩余课时费</td>
                        <td>剩余教材费</td>
                        <td>课时实际退费</td>
                        <td>教材实际退费</td>
                    </tr>
                    <tr>
                        <td>{{refundDataInfo.quitCourseDetail.course.name}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.lesson_num}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.remain_num}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.class_num_price}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.remain_class_num_price}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.remain_textbook_price_remain}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.remain_lesson_price}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.remain_textbook_price}}</td>
                    </tr>
                </table>
                <p class="mt-10">退费金额：{{refundDataInfo.quitCourseDetail.rel_remain}}</p>
                <p class="mt-10">退费日期：<i>{{refundDataInfo.quitCourseDetail.created_at | date('yyyy-MM-dd')}}</i></p>
                <p class="mt-10">退费说明：<i>{{refundDataInfo.quitCourseDetail.explain}}</i></p>
                <div class="d-f f-j-e mt-20">
                    <MyButton @click.native="dialogClose">确定</MyButton>
                    <MyButton @click.native="printCompact" class="ml-20">打印</MyButton>
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
    refundData: {default: () => {
      return {};
    }}
  },
  components: {MyButton},
  watch: {
    dialogStatus (newVal) {
      this.refundDialogStatus = newVal;
    },
    refundData (newVal) {
      console.log(newVal);
      this.refundDataInfo = newVal;
    }
  },
  data () {
    return {
      refundDialogStatus: false,
      refundDataInfo: null
    };
  },
  methods: {
    dialogClose () {
      this.$emit('CB-dialogStatus', 'refund');
    },
    //打印合同
    printCompact () {
      this.$router.push({path: '/refundPrint', query: {refundDataInfo: JSON.stringify(this.refundDataInfo)}});
    }
  }
};
</script>

<style lang="less" scoped>
    .contract-box {
        height: 400px;
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

