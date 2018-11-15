<template>
    <el-dialog title="转课详情" width="1200px" center :visible.sync="contractDialogStatus" :close-on-click-modal="false" id="contract" @close="dialogClose('contract')">
        <div class="contract-box my-scrollbar pl-40 pr-20" v-if="Object.keys(contractData).length">
            <el-scrollbar style="height: 100%;">
                <p class="head-info">转出课程：
                    <span>{{contractData.transferFromCourse[0].courseName}}</span>
                </p>
                <div class="mt-10 d-f">
                    <el-table :data="contractData.transferFromCourse" row-class-name="row-header">
                        <el-table-column label="订单编号" prop="orderno" align="center" width="200"></el-table-column>
                        <el-table-column label="购买课时" prop="lessonNum" align="center"></el-table-column>
                        <el-table-column label="已消课时" prop="transferEliminateNum" align="center"></el-table-column>
                        <el-table-column label="赠送课时" prop="givenNum" align="center"></el-table-column>
                        <el-table-column label="剩余课时" prop="lessonNumRemain" align="center"></el-table-column>
                        <el-table-column label="课程单价(元/课时)" prop="unitPrice" align="center"></el-table-column>
                        <el-table-column label="课程有效期" prop="expired_at" align="center">
                            <template slot-scope="scope">{{scope.row.expired_at | date('yyyy-MM-dd')}}</template>
                        </el-table-column>
                        <el-table-column label="转出课时" prop="outLessonNum" align="center"></el-table-column>
                        <el-table-column label="转出课时金额" align="center">
                            <template slot-scope="scope">{{scope.row.price}}元</template>
                        </el-table-column>
                    </el-table>
                </div>

                <p class="head-info">转入课程</p>
                <div class="mt-10 d-f">
                    <el-table :data="[contractData.transToCourse]" row-class-name="row-header">
                        <el-table-column label="课程名称" prop="courseName" align="center"></el-table-column>
                        <el-table-column :label="contractData.transToCourse.classPattern === 1 ? '班级' : '老师'" align="center">
                            <template slot-scope="scope">{{scope.row.classPattern === 1 ? (scope.row.gradeName || '--') : scope.row.teacherName}}</template>
                        </el-table-column>
                        <el-table-column label="转入课时" prop="lessonNum" align="center"></el-table-column>
                        <el-table-column label="赠送课时" prop="givenNum" align="center"></el-table-column>
                        <el-table-column label="转入课程单价(元/课时)" prop="unitPrice" align="center"></el-table-column>
                        <el-table-column label="课程有效期" prop="expiredAt" align="center">
                            <template slot-scope="scope">{{scope.row.expiredAt | date('yyyy-MM-dd')}}</template>
                        </el-table-column>
                        <el-table-column label="转入课时金额" align="center">
                            <template slot-scope="scope">{{scope.row.inPrice}}元</template>
                        </el-table-column>
                    </el-table>
                </div>

                <p class="head-info">教材信息</p>
                <div class="d-f mt-20">
                    <div class="d-f span-info">
                        <span class="p-r pl-12">惠前价格：
                            <span>{{contractData.textBookInfo.textbookPrice}}元</span>
                        </span>
                        <span class="p-r pl-12">教材优惠：
                            <span>{{contractData.textBookInfo.preferentialTextbookPrice}}元</span>
                        </span>
                        <span class="p-r pl-12">实交教材费：
                            <span>{{contractData.textBookInfo.realTextBookPrice}}元</span>
                        </span>
                    </div>
                </div>

                <p class="head-info">结算信息</p>
                <div class="mt-20">
                    <div class="d-f span-info">
                        <span class="p-r pl-12">
                            <span v-if="contractData.settlementInfo.planPrice < 0">应退费：</span>
                            <span v-else>应补交：</span>
                            <span>{{Math.abs(contractData.settlementInfo.planPrice)}}元</span>
                        </span>
                        <span class="p-r pl-12">
                            <span v-if="contractData.settlementInfo.planPrice < 0">实际退费：</span>
                            <span v-else>实际补交：</span>
                            <span>{{Math.abs(contractData.settlementInfo.realPrice)}}元</span>
                        </span>
                    </div>
                    <div class="d-f span-info">
                        <span class="p-r pl-12">结算方式：
                            <span>{{contractData.settlementInfo.payWay}}</span>
                        </span>
                        <span class="p-r pl-12">转课时间：
                            <span>{{contractData.settlementInfo.created_at | date('yyyy-MM-dd')}}</span>
                        </span>
                        <span class="p-r pl-12">操作人：
                            <span>{{contractData.settlementInfo.operation}}</span>
                        </span>
                    </div>
                </div>
                <div class="mt-20">
                    <div class="d-f explain">
                        <span class="p-r pl-12">转课说明：</span>
                        <div>{{contractData.settlementInfo.explain}}</div>
                    </div>
                </div>

                <div class="d-f f-j-c mt-30">
                    <MyButton @click.native="goSignedLists()">确定</MyButton>
                </div>
            </el-scrollbar>
        </div>
    </el-dialog>
</template>

<script>
import MyButton from "../common/MyButton";

export default {
  props: {
    dialogStatus: "",
    contractData: { default: {} }
  },
  components: { MyButton },
  watch: {
    dialogStatus(newVal, oldVal) {
      this.contractDialogStatus = newVal;
    }
  },
  data() {
    return {
      contractDialogStatus: false
    };
  },
  methods: {
    dialogClose() {
      this.$emit("CB-dialogStatus", "contract");
      this.$router.push({path: '/student/signeddetail', query: {id: this.contractData.studentId}});
    },
    //确定按钮，跳转签约学员详情
    goSignedLists() {
      this.contractDialogStatus = false;
      this.$router.push({path: '/student/signeddetail', query: {id: this.contractData.studentId}});
    }
  }
};
</script>

<style lang="less" scoped>
.contract-box {
  height: 600px;
  p {
    span {
      margin-right: 30px;
    }
  }
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
      content: "";
      display: block;
      position: absolute;
      left: 0;
      top: 3px;
      width: 4px;
      height: 16px;
      background-color: #45dad5;
      border-radius: 5px;
    }
  }
  .list-item {
    width: 380px;
  }
  .explain {
    > span {
      float: left;
      width: auto;
    }
    > div {
      float: left;
      width: 600px;
    }
  }
  .course-table {
    border-collapse: collapse;
    margin-top: 10px;
    td {
      border: 1px #bfbfbf solid;
      width: 120px;
      text-align: center;
    }
  }
  .span-info {
    > span {
      display: inline-block;
      min-width: 250px;
      padding-top: 5px;
    }
  }
}
</style>

