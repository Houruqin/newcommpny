<template>
  <div class="flex1">
    <PageState :state="state"/>
    <el-card shadow="hover">
      <TableHeader title="系统设置"></TableHeader>
      <ul class="setting-list mt-30">
        <li v-for="(list, index) in SETTING_SORT" :key="index" class="d-f f-j-b">
          <span class="fc-5">{{setting[list].name}}</span>
          <div v-if="'num' in setting[list]" key="num">
            <el-input type="number" v-model="setting[list].num" size="small"/><span class="pl-10 fc-9">{{setting[list].unit}}</span>
          </div>
          <div v-else-if="list === 'studentLoss'" class="d-f f-d-c f-a-e">
            <el-switch v-model="setting[list].switch" active-color="#45DAD5" inactive-color="#e3e3e3"></el-switch>
            <p class="mt-20 fc-7">
              <span>在课程结束后</span>
              <el-input type="number" class="ml-10 mr-10" v-model="setting[list].lossNum" size="small" :disabled="!setting[list].switch" />
              <span>天未续费，自动进入流失学员名单</span>
            </p>
          </div>
          <div v-else-if="list === 'courseSyllabus'">
            <el-switch v-model="setting[list].switch" active-color="#45DAD5" inactive-color="#e3e3e3"></el-switch>
          </div>
          <div v-else-if="'radio' in setting[list]">
            <el-radio-group v-model="setting[list].value">
              <el-radio v-for="(option, k) in setting[list].item" :key="k" :label="option.id">{{option.name}}</el-radio>
            </el-radio-group>
          </div>
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';

const SETTING_SORT = ['contractStudent', 'courseOtder', 'cancelOtder', 'teacherSign', 'studentLeave', 'courseSyllabus', 'lessonNum', 'studentLoss'];

export default {
  components: {TableHeader, MyButton},
  data () {
    return {
      state: 'loading',
      SETTING_SORT,
      setting: {
        contractStudent: {name: '当学员剩余多少课时时分类为需续约学员？', num: 0, unit: '课时'},   //学员需续约
        courseOtder: {name: '学员课前至少提前多久可以预约课程？', num: 0, unit: '小时'},    //课程预约
        cancelOtder: {name: '学员课前至少提前多久可以取消预约？', num: 0, unit: '小时'},    //取消预约
        teacherSign: {name: '老师课前最多提前多久可以开始签到？', num: 0, unit: '分钟'},    //老师签到
        studentLeave: {name: '学员课前至少提前多久可以请假？', num: 0, unit: '小时'},    //学员请假
        courseSyllabus: {name: '是否使用课程大纲', switch: true, unit: '小时'},    //课程大纲
        lessonNum: {name: '请假是否扣课时', radio: true, value: 1, item: [{id: 0, name: '不扣课时'}, {id: 1, name: '直接扣课时'}, {id: 2, name: '自由选择'}]},   //请假扣课时
        studentLoss: {name: '长期未续费的结业学员是否自动进入流失学员名单？', switch: true, lossNum: 0}   //学员流失
      }
    };
  },
  mounted () {
    this.state = 'loaded';
  }
};
</script>

<style lang="less" scoped>
  .setting-list {
    padding: 0 20px;
    li {
      border-bottom: 1px #e9e9e9 dashed;
      padding: 20px;
      /deep/ .el-input__inner {
        height: 24px;
        line-height: 24px;
        padding: 0;
        text-align: center;
      }
      /deep/ .el-input {
        width: 45px;
      }
    }
  }
</style>


