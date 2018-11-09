<template>
  <div class="flex1">
    <PageState :state="state"/>
    <el-card shadow="hover">
      <TableHeader title="系统设置"></TableHeader>
      <ul class="setting-list mt-30" v-if="Object.keys(setting).length">
        <li v-for="(list, index) in SETTING_SORT" :key="index" class="d-f f-j-b">
          <span class="fc-5">{{setting[list].description}}</span>

          <!-- 课程大纲 -->
          <div v-if="list === 'outline'">
            <el-switch v-model="setting[list].status" active-color="#45DAD5" :disabled="!$$tools.isAuthority('editSystem')" inactive-color="#e3e3e3" @change="switchChange(list)" :active-value="1" :inactive-value="0"></el-switch>
          </div>

          <!-- 请假是否扣课时 -->
          <div v-else-if="list === 'LeaveTicketDeductLessonNum'">
            <el-radio-group v-model="setting[list].num" @change="saveSetting(list)" :disabled="!$$tools.isAuthority('editSystem')">
              <el-radio v-for="(option, k) in lessonNumOptions" :key="k" :label="option.id">{{option.name}}</el-radio>
            </el-radio-group>
          </div>

          <!-- 流失学员 -->
          <div v-else-if="list === 'longTimeNoByCourse'" class="d-f f-d-c f-a-e">
            <el-switch v-model="setting[list].status" active-color="#45DAD5" :disabled="!$$tools.isAuthority('editSystem')" inactive-color="#e3e3e3" @change="switchChange(list)" :active-value="1" :inactive-value="0"></el-switch>
            <div class="mt-20 fc-7 p-r">
              <span>在课程结束后</span>
              <el-input type="number" class="ml-10 mr-10" v-model.trim="setting[list].num" size="small" :disabled="!setting[list].status || !$$tools.isAuthority('editSystem')"/>
              <span>天未续费，自动进入流失学员名单</span>
              <div v-if="setting[list].num != setting[list].oldVal" class="save-btn" @click="saveSetting(list)">保存</div>
            </div>
          </div>

          <!-- 分配顾问 公共池 -->
          <div v-else-if="list === 'longTimeNoFollowUp'" class="d-f f-d-c f-a-e">
            <el-switch v-model="setting[list].status" active-color="#45DAD5" :disabled="!$$tools.isAuthority('editSystem')" inactive-color="#e3e3e3" @change="switchChange(list)" :active-value="1" :inactive-value="0"></el-switch>
            <div class="mt-20 fc-7 p-r">
              <span>分配顾问后</span>
              <el-input type="number" class="ml-10 mr-10" v-model.trim="setting[list].num" size="small" :disabled="!setting[list].status || !$$tools.isAuthority('editSystem')"/>
              <span>天未跟进，自动进入公共池再分配顾问</span>
              <div v-if="setting[list].num != setting[list].oldVal" class="save-btn" @click="saveSetting(list)">保存</div>
            </div>
          </div>

          <!-- 其他输入值 -->
          <div v-else class="p-r">
            <el-input type="number" v-model.trim="setting[list].num" size="small" :disabled="!$$tools.isAuthority('editSystem')"/>
            <span class="pl-10 fc-9 fs-12">{{setting[list].unit}}</span>
            <div v-if="setting[list].num != setting[list].oldVal" class="save-btn" @click="saveSetting(list)">保存</div>
          </div>
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';

const SETTING_SORT = ['studentCourseRemain', 'studentAppointCourse', 'studentCancelAppointCourse', 'teacherSign',
'studentLeaveTicket', 'outline', 'LeaveTicketDeductLessonNum', 'longTimeNoByCourse', 'longTimeNoFollowUp'];

export default {
  components: {TableHeader, MyButton},
  data () {
    return {
      state: 'loading',
      SETTING_SORT,
      setting: {},
      lessonNumOptions: [
        {id: 1, name: '不扣课时'},
        {id: 2, name: '直接扣课时'},
        {id: 3, name: '自由选择'}
      ]
    };
  },
  methods: {
    async getSystemSetLists () {
      let result = await this.$$request.get('/school/systemSetLists');

      if (!result) {
        return 0;
      }

      Object.keys(result.datas).forEach(key => {
        result.datas[key].oldVal = result.datas[key].num;

        if (key === 'studentCourseRemain') {
          result.datas[key].unit = '课时';
          result.datas[key].min = 1;
        } else if (key === 'longTimeNoByCourse') {
          result.datas[key].min = 1;
        } else if (key === 'teacherSign') {
          result.datas[key].unit = '分钟';
          result.datas[key].min = 0;
          result.datas[key].max = 180;
        } else if (key === 'studentAppointCourse' || key === 'studentCancelAppointCourse' || key === 'studentLeaveTicket') {
          result.datas[key].unit = '小时';
          result.datas[key].min = 0;
          result.datas[key].max = 24;
        }
      });

      this.setting = result.datas;

      return true;
    },
    switchChange (name) {
      if (!this.setting[name].status) {
        this.setting[name].num = this.setting[name].oldVal;
      }
      this.saveSetting(name);
    },
    // 保存设置值
    async saveSetting (name) {

      let nowSetting = this.setting[name];

      if (!Number.isInteger(+nowSetting.num)) {
        return this.$message.error('请输入整数');
      }

      if (+nowSetting.num < nowSetting.min) {
        return this.$message.error(`最小值：${nowSetting.min}`);
      }

      if (+nowSetting.num > nowSetting.max) {
        return this.$message.error(`最大值：${nowSetting.max}`);
      }

      let params = {};

      params[name] = {name: name, status: nowSetting.status, num: nowSetting.num};

      console.log(params);

      let result = await this.$$request.post('/school/systemSet', params);

      if (!result) {
        return 0;
      }

      this.$store.dispatch('getSynstemSetLists');
      this.setting[name].oldVal = nowSetting.num;
      this.$message.success('保存成功');
    }
  },
  async created () {
    let datas = await this.getSystemSetLists();

    if (datas) {
      this.state = 'loaded';
    }
  }
};
</script>

<style lang="less" scoped>
  .setting-list {
    padding: 0 70px 0 40px;
    li {
      border-bottom: 1px #e9e9e9 dashed;
      padding: 15px 0;
      /deep/ .el-input__inner {
        height: 24px;
        line-height: 24px;
        padding: 0;
        text-align: center;
      }
      /deep/ .el-input {
        width: 50px;
      }
      .save-btn {
        width: 50px;
        height: 24px;
        line-height: 24px;
        border-radius: 2px;
        text-align: center;
        background-color: #45dad5;
        color: #fff;
        cursor: pointer;
        position: absolute;
        top: 0;
        right: -60px;
        font-size: 12px;
      }
    }
  }
</style>


