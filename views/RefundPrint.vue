<template>
    <div>
        <div class="contract-box" v-if="Object.keys(refundDataInfo).length">
            <p class="pr-20">
                <span>甲方：
                    <i>{{refundDataInfo.quitCourseDetail.institution.name}}</i>
                </span>
                <span>签约校区：
                    <i>{{refundDataInfo.quitCourseDetail.school.name}}</i>
                </span>
                <span>操作人：
                    <i>{{refundDataInfo.quitCourseDetail.user ? refundDataInfo.quitCourseDetail.user.name : '无'}}</i>
                </span>
            </p>
            <p v-if="refundDataInfo.parent" class="pr-20">
                <span>乙方(学员)：
                    <i>{{refundDataInfo.quitCourseDetail.student.name}}</i>
                </span>
                <span>乙方家长：
                    <i>{{refundDataInfo.parent.name}}</i>
                </span>
                <span>电话：
                    <i>{{refundDataInfo.parent.mobile}}</i>
                </span>
            </p>

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
                        <td>{{refundDataInfo.quitCourseDetail.course.name}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.lesson_num}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.remain_num}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.remain_lesson_price}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.remain_textbook_price}}</td>
                        <td>{{refundDataInfo.quitCourseDetail.rel_remain}}</td>
                    </tr>
                </table>
            </div>
            <p class="pr-20">退费日期：
                <i>{{refundDataInfo.quitCourseDetail.created_at | date('yyyy-MM-dd')}}</i>
            </p>
            <p class="pr-20">退费说明：
                <i>{{refundDataInfo.quitCourseDetail.explain}}</i>
            </p>

        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      refundDataInfo: {}
      // replace_path: '',
      // query: null
    };
  },
  created () {
    if (this.$route.params.refundDataInfo) {
      this.refundDataInfo = this.$route.params.refundDataInfo;
      // this.replace_path = this.$route.params.replace_path;
      // this.query = this.$route.params.path_query ? this.$route.params.path_query : null
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
      border: 1px #bfbfbf solid;
      width: 120px;
      text-align: center;
      line-height: 40px;
    }
  }
}
</style>


