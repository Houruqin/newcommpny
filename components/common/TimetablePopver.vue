<template>
    <el-popover placement="bottom" width="380" trigger="click" ref="myPopver">
        <div class="course-popver">
            <div class="d-f f-j-b">
                <span class="fs-17 fc-m">{{item.grade_name}}</span>
                <div class="d-f btn" v-if="!pastdue && item.begin_time > new Date().getTime() / 1000">
                    <a class="cursor-pointer" @click="detailEdit(item)" v-if="$$tools.isAuthority('editScheduling') && (item.course_type === 1 || (item.student_grades.length && item.course_type === 2))">编辑</a>
                    <a v-if="$$tools.isAuthority('deleteTimetable')" class="cursor-pointer ml-10" @click="detailDelete(item)">删除</a>
                </div>
                <div class="btn" v-else-if="!item.lesson_end_time && $$tools.isAuthority('endingCourse')
                    && item.end_time < new Date().getTime() / 1000
                    && (item.course_type === 1 || (item.student_grades.length && item.course_type === 2))">
                    <a class="cursor-pointer" @click="endTimeTable(item)">结课</a>
                </div>
                <div class="teachBtn" v-if="item.isRecord">
                    <a class="cursor-pointer"  @click="addTeachRecord(item)" >添加教学记录</a>
                </div>
                <div class="teachBtn"
                  v-if=" (item.timetable_record && item.timetable_record[0] && item.timetable_record[0].record_content ) ">
                    <a class="cursor-pointer" @click="watchTeachRecord(item.id, item.student_grades[0].type, item)" >查看教学记录</a>
                </div>
            </div>
            <p class="mt-10"><span>{{item.course_name}}</span><span class="ml-50">{{item.teacher.name}}</span></p>
            <p class="mt-5"><span>{{`${item.time_quantum.begin_time}-${item.time_quantum.end_time}`}}</span><span class="ml-50">{{Math.round((item.end_time - item.begin_time) / 60)}}分钟</span></p>
            <p class="mt-20 fc-9">课时：<span class="fc-5">{{item.lesson_num}}课时</span></p>
            <p class="mt-10 fc-9">教室：<span class="fc-5">{{item.room_name}}</span></p>
            <p class="mt-10 d-f fc-9">
                <span>上课学员：</span>
                <span class="d-f flex1 fc-5 f-w-w student-box">
                    <i v-for="(student, m) in item.student_grades" :key="m" class="mr-10">{{student.name}}</i>
                </span>
            </p>
            <p class="mt-10 d-f fc-9" v-if="item.student_audition.length">
                <span>试听学员：</span>
                <span class="d-f flex1 fc-5 f-w-w student-box">
                    <i v-for="(student, m) in item.student_audition" :key="m" class="mr-10">{{student.name}}</i>
                </span>
            </p>
        </div>
        <div class="course-item pl-13 pr-10 pt-8 p-r"
                :class="{
                    'gray': item.lesson_end_time,
                    'green': !item.lesson_end_time && item.course_type === 1 && item.student_grades.length < item.grade_limit_num,
                    'yellow': !item.lesson_end_time && (item.course_type !== 1 || (item.student_grades.length == item.grade_limit_num)),
                    'red': !item.lesson_end_time && item.course_type === 1 && item.student_grades.length > item.grade_limit_num}"
                    slot="reference">
            <div class="proportion-box p-a" v-if="!item.lesson_end_time && item.student_grades.length < item.grade_limit_num">
                <div class="proportion p-a" :style="{height: (item.student_grades.length / item.grade_limit_num * 100) + '%'}"></div>
            </div>

            <div class="leave-status p-a fs-13" :class="{'gray': item.lesson_end_time}" v-if="item.student_grades.length && item.course_type === 2 && item.student_grades[0].status === -1">已请假</div>

            <p class="t-a-l">{{item.grade_name}}</p>

            <p class="pt-5 d-f f-a-s">
                <span class="fs-12">
                    <i class="iconfont fs-13 icon-laoshi"></i>
                    <span>{{item.teacher[0].name}}</span>
                </span>

                <span class="ml-20 fs-12">
                    <i class="iconfont fs-13" :class="item.course_type === 2 ? 'icon-renyuan' : 'icon-renshu'"></i>
                    <span v-if="item.course_type === 2"><i v-if="item.student_grades.length > 0">{{item.student_grades[0].student_name}}</i></span>
                    <span v-else>{{item.student_grades.length}}/{{item.grade_limit_num}}</span>
                </span>
            </p>
            <p class="pt-5 d-f f-a-c">
                <i class="iconfont fs-13 icon-shijian"></i>
                <span class="pl-5 fs-12">{{`${item.time_quantum.begin_time}-${item.time_quantum.end_time}`}}</span>
            </p>

            <div class="rm-table" v-if="item.origin == 3">手动消课</div>
        </div>

        <!-- 添加教学记录 -->
        <el-dialog class="teachRecord" title="教学记录" :visible.sync="showTeachRecord" center  label-width="800px" :modal-append-to-body="false">
          <el-form  v-model="formData">
              <el-form-item>
                <span v-if="addperson" style="margin-right: 20px">添加人：{{formData.teacher[0] && formData.teacher[0].name}}</span>
                <span style="margin-right: 20px">课程： {{formData.course_name}}</span>
                <span style="margin-right: 20px">班级： {{formData.grade_name}}</span>
                <span v-if="item.course_type === 2" style="margin-right: 30px">学员： {{formData.student_grades.student_name}}</span>
                <span>上课时间： {{formData.time_quantum.week}} {{formData.time_quantum.begin_time}}-{{formData.time_quantum.end_time}}</span>
            </el-form-item>
            <el-form-item>
              <el-input v-if="item.course_type === 1" @keyup.enter="submit" ref="txt" @input="descInput" v-model="desc" resize="none" :autosize="{ minRows: 8, maxRows: 12}" type="textarea" ></el-input>
              <el-input  v-if="item.course_type === 2"  @keyup.enter="submit" ref="txt" @input="descInput" v-model="desc" resize="none" :autosize="{ minRows: 4, maxRows: 8}" type="textarea" ></el-input>
            </el-form-item>
            <span v-if="desc.length > 0">已输入{{remnant}}字</span>
            <el-alert
              v-if="elasticFrame"
              title=" 输入的内容不能大于300个字"
              type="warning"
              show-icon>
            </el-alert>
            <el-alert
              v-if="emptyRecord"
              title="教学记录不能为空"
              type="warning"
              show-icon>
            </el-alert>

          </el-form>
          <div slot="footer" class="dialog-footer" style="text-align:center">
            <el-button
              v-if="!(item.isRecord) && (item.timetable_record && item.timetable_record[0] && item.timetable_record[0].record_content && item.timetable_record[0].record_content !== null) "
              @click="deleteRecord=true">删 除</el-button>
             <el-button type="primary"
              v-if="!(item.isRecord) &&  (item.timetable_record && item.timetable_record[0] && item.timetable_record[0].record_content && item.timetable_record[0].record_content !== null)"
              @click="editTeachRecord(desc, item.timetable_record, item.student_grades[0].type )">编 辑</el-button>
            <el-button
              v-if="item.isRecord"
              type="primary"
              @click="handelTeach($refs.txt.value, item.id, item.student_grades.type, item)">{{item.student_grades.type}}提 交</el-button>
          </div>
        </el-dialog>
        <el-dialog
          :visible.sync="deleteRecord"
          :modal-append-to-body="false"
          width="30%">
          <span>教学记录删除后数据不能恢复，请确认进行删除操作</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="deleteRecord = false">取 消</el-button>
            <el-button type="primary" @click="deleteTeachRecord(item.course_type, item.timetable_record, item)">确 定</el-button>
          </span>
        </el-dialog>
    </el-popover>
</template>

<script>
export default {
  props: {
    pastdue: { default: false },
    item: { default() {return {}} }
  },
  data() {
    return {
      addperson:false, // 添加人的显示
      deleteRecord: false, // 删除教学记录确认
      elasticFrame:false, //提示输入字数
      emptyRecord: false, // 非空验证
      showTeachRecord: false, //显示添加弹框
      remnant: '',
      desc:'',
      formData:{
        time_quantum: '',
        teacher: [],
        student_grades: [ ],
        timetable_record: [ ],
      },
    };
  },
  methods: {
    // 查看教学记录
    async watchTeachRecord(id, type, item){
      this. deleteRecord = false
      this.showTeachRecord = false
      this.formData = item
      const res = await this.$$request.get('timetable/getTimetableRecordDetail', {timetableId: id, type: type});
      if (!res) return 0;
      this.desc = res.record_content
      this.remnant = this.desc.length
      this.showTeachRecord = true //显示编辑弹框
      this.deleteRecord = false
      this.addperson = true
    },

    // 删除教学记录
    async deleteTeachRecord(type, temetable_record, item){
      const res = await this.$$request.post('timetable/delTimetableRecord', {type: type, recordIdList: [item.timetable_record[0].id]})
      console.log(res)
      if (res) return void 0;
      this.desc = ' '
      this. deleteRecord = false
      this.showTeachRecord = false
      this.$refs.myPopver.showPopper = false //结课弹框

      item.isRecord = true;
      this.$set(item.timetable_record, 0, {record_content: ''})
    },
    //编辑教学记录
    async editTeachRecord(desc, temetable_record, type){
      let params = [];
      temetable_record.forEach(item => {
        params.push({
          id:item.id,
          content:item.record_content
        });
      });
      if (desc.length > 301) {
        this.elasticFrame = true
        return false
        }
        else if(desc.length < 301){
          this.elasticFrame = false
        }
      const res = await this.$$request.post('timetable/editTimetableRecord', { recordContent:  params, type: type})
      this.showTeachRecord = false
    },
    // 提交教学记录
    async handelTeach(desc, ID, type, item){
      if (desc.length > 301 || desc.length === 0) {
        this.elasticFrame = true
        return false
      }
        else if(desc.length < 301){
          this.elasticFrame = false
        }
      const res = await this.$$request.post('timetable/addTimetableRecord',{recordContent: desc, timetableId: ID, type: type})
      if(!res){return false}
      this.$refs.myPopver.showPopper = false
      console.log(item);
      item.isRecord = false;
      this.$set(item.timetable_record, 0, {record_content: this.desc})
      this.desc = ''
      this.showTeachRecord = false
    },
    // 教学记录显示剩余字数
    descInput(){
      const txtVal = this.desc.length
      this.remnant = txtVal
    },
    // 添加教学记录
    addTeachRecord(item, desc) {
      this.desc = ''
      this.formData = item
      this.showTeachRecord = true
    },
    detailEdit(item) {
      this.$refs.myPopver.showPopper = false;
      this.$emit("CB-detailEdit", item);
    },
    detailDelete(item) {
      this.$confirm("确定删除排课吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.deleteHandle(item.id);
        })
        .catch(() => {
          return 0;
        });
    },
    async deleteHandle(id) {
      let result = await this.$$request.post("/timetable/delete", { id: id });

      if (!result || !result.status) {
        return 0;
      }

      this.$refs.myPopver.showPopper = false;
      this.$emit("CB-deleteTable");
      this.$message.success("删除成功");
    },
    //结课
    async endTimeTable(item) {
      console.log(item)
      let result = await this.$$request.get("/timetable/finishClassInfo", {
        timetable_id: item.id
      });
      if (!result) {
        return 0;
      }

      this.$refs.myPopver.showPopper = false;

      let title = `<div class="d-f">
          <span class="flex1">应到人数：${result.should_come_num}</span>
          <span class="flex1">实到人数：${result.come_num}</span>
        </div>

        <div class="d-f">
          <span class="flex1">旷课人数：${result.not_come_num}</span>
          <span class="flex1">请假人数：${result.leave_ticket_num}</span>
        </div>`;
      this.$confirm(title, "确定结课吗?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        dangerouslyUseHTMLString: true,
        center: true
      })
        .then(() => {
          this.endTimeTableHandle(item.id);
        })
        .catch(() => {
          return 0;
        });
    },
    async endTimeTableHandle(id) {
      let result = await this.$$request.post("/timetable/lessonEnd", {
        timetable_id: id
      });
      if (!result) {
        return 0;
      }
      this.$emit("CB-deleteTable");
      this.$message.success("已结课");
    }

  },
  watch: {
    item: function(v) {
      console.log('item:',v)
    }
  }
};
</script>

<style lang="less" scoped>
.course-item {
  box-sizing: border-box;
  min-height: 80px;
  line-height: normal;
  .course-type {
    right: 0;
    top: 0;
    width: 18px;
    line-height: 13px;
    text-align: center;
    color: #fff;
    &.gray {
      background-color: #c8c8c8;
    }
    &.yellow {
      background-color: #fbbf3f;
    }
  }
  &.gray {
    border: 1px #c8c8c8 solid;
    background-color: #f5f5f5;
  }
  &.green {
    border: 1px #3fd88a solid;
    background-color: #fff;
    padding-left: 18px;
  }
  &.yellow {
    border: 1px #fbbf3f solid;
    background-color: #fff;
    border-left-width: 5px !important;
  }
  &.red {
    border: 1px #fc5a5a solid;
    background-color: #fff;
    border-left-width: 5px !important;
  }
  .icon {
    position: relative;
    top: 3px;
  }
  .rm-table {
    position: absolute;
    background-color: #fff;
    // padding: 2px 5px;
    top: 0;
    right: 0;
    font-size: 12px;
    width: 60px;
    line-height: 24px;
    text-align: center;
  }
  .leave-status {
    width: 54px;
    line-height: 20px;
    background-color: #fbbf3f;
    color: #fff;
    right: 5px;
    top: 5px;
    border-radius: 2px;
    &.gray {
      background-color: #f5f5f5;
      color: #999;
    }
  }
}
.course-popver {
  padding: 10px;
  .btn {
    a {
      display: inline-block;
      width: 54px;
      box-sizing: border-box;
      height: 28px;
      line-height: 28px;
      text-align: center;
      border: 1px #45dad5 solid;
      color: #45dad5;
      border-radius: 3px;
    }
  }
  i {
    margin-bottom: 5px;
  }
}
.course-popver {
  padding: 10px;
  .teachBtn {
    a {
      display: inline-block;
      width: 100px;
      box-sizing: border-box;
      height: 28px;
      line-height: 28px;
      text-align: center;
      border: 1px #45dad5 solid;
      color: #45dad5;
      border-radius: 3px;
    }
  }
}
.proportion-box {
  width: 5px;
  height: 100%;
  left: 0;
  top: 0;
  background-color: #f5f5f5;
  .proportion {
    background-color: #3fd88a;
    width: 100%;
    left: 0;
    bottom: 0;
  }
}
.student-box {
  i {
    width: 70px;
    text-align: left;
  }
}
</style>


