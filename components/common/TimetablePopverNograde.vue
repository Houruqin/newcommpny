<template>
    <el-popover placement="bottom" width="380" trigger="click" ref="myPopver">
        <div class="course-popver">
            <div class="d-f f-j-b">
                <span class="fs-17 fc-m">{{item.course_name}}</span>
                <div class="d-f btn" v-if="!pastdue && item.begin_time > new Date().getTime() / 1000">
                    <a class="cursor-pointer" @click="detailEdit(item)" v-if="$$tools.isAuthority('noClassScheduling') && (item.course_type === 1 || (item.student_grades.length && item.course_type === 2))">编辑</a>
                    <a v-if="$$tools.isAuthority('deleteTimetable')" class="cursor-pointer ml-10" @click="detailDelete(item)">删除</a>
                </div>
                <div class="btn" v-else-if="!item.lesson_end_time
                && $$tools.isAuthority('endingCourse')
                && $$cache.getMemberInfo().lesson_end
                && item.end_time < new Date().getTime() / 1000
                && item.course_type === 1 || (item.student_grades.length && item.course_type === 2)">
                    <a class="cursor-pointer" @click="endTimeTable(item)">结课</a>
                </div>
            </div>
            <p class="mt-10"><span>{{`${item.time_quantum.begin_time}-${item.time_quantum.end_time}`}}</span><span class="ml-50">{{Math.round((item.end_time - item.begin_time) / 60)}}分钟</span></p>
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
            :class="{'gray': item.lesson_end_time,
                    'green': !item.lesson_end_time && item.course_type == 1,
                    'yellow': !item.lesson_end_time && item.course_type == 2}" slot="reference">
            <div class="proportion-box p-a" v-if="!item.lesson_end_time && item.student_grades.length < item.grade_limit_num">
                <div class="proportion p-a" :style="{height: (item.student_grades.length / item.grade_limit_num * 100) + '%'}"></div>
            </div>

            <div class="leave-status p-a fs-13" :class="{'gray': item.lesson_end_time}" v-if="item.student_grades.length && item.course_type === 2 && item.student_grades[0].status === -1">已请假</div>

            <p class="t-a-l">{{item.course_name}}</p>

            <p class="pt-5 d-f f-a-s">
                <span class="fs-12">
                    <i class="iconfont fs-13 icon-laoshi"></i>
                    <span>{{item.teacher[0].name}}</span>
                </span>

                <span class="ml-20 fs-12">
                    <i class="iconfont fs-13" :class="item.course_type === 2 ? 'icon-renyuan' : 'icon-renshu'"></i>
                    <span v-if="item.course_type === 2"><i v-if="item.student_grades.length > 0">{{item.student_grades[0].student_name}}</i></span>
                    <span v-else class="ml-5">{{item.student_grades.length}}</span>
                </span>
            </p>
            <p class="pt-5 d-f f-a-c">
                <i class="iconfont fs-13 icon-shijian"></i>
                <span class="pl-5 fs-12">{{`${item.time_quantum.begin_time}-${item.time_quantum.end_time}`}}</span>
            </p>

            <div class="rm-table" v-if="item.origin == 3">手动消课</div>
            <!-- <div class="course-type p-a fs-12" v-if="item.course_type == 2" :class="item.lesson_end_time ? 'gray' : 'yellow'">一对一</div> -->
        </div>
    </el-popover>
</template>

<script>

export default {
  props: {
    pastdue: {default: false},
    item: {default: {}}
  },
  data () {
    return {};
  },
  methods: {
    detailEdit (item) {
      this.$refs.myPopver.showPopper = false;
      this.$emit('CB-detailEdit', item);
    },
    detailDelete (item) {
      this.$confirm('确定删除排课吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteHandle(item.id);
      }).catch(() => {
        return 0;
      });
    },
    //结课
    async endTimeTable (item) {
      let result = await this.$$request.get('/timetable/finishClassInfo', {timetable_id: item.id});

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

      this.$confirm(title, '确定结课吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        center: true
      }).then(() => {
        this.endTimeTableHandle(item.id);
      }).catch(() => {
        return 0;
      });
    },
    async endTimeTableHandle (id) {
      let result = await this.$$request.post('/timetable/lessonEnd', {timetable_id: id});

      if (!result) {
        return 0;
      }

      this.$emit('CB-deleteTable');
      this.$message.success('已结课');
    },
    async deleteHandle (id) {
      let result = await this.$$request.post('/timetable/delete', {id: id});

      if (!result || !result.status) {
        return 0;
      }

      this.$refs.myPopver.showPopper = false;
      this.$emit('CB-deleteTable');
      this.$message.success('删除成功');
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
                background-color: #C8C8C8;
            }
            &.yellow {
                background-color: #FBBF3F;
            }
        }
        &.gray {
            border: 1px #C8C8C8 solid;
            background-color: #f5f5f5;
        }
        &.green {
            border: 1px #3FD88A solid;
            background-color: #fff;
            padding-left: 18px;
        }
        &.yellow {
            border: 1px #FBBF3F solid;
            background-color: #fff;
            border-left-width: 5px !important;
        }
        &.red {
            border: 1px #FC5A5A solid;
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
          background-color: #FBBF3F;
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
                display: block;
                width: 54px;
                box-sizing: border-box;
                height: 28px;
                line-height: 28px;
                text-align: center;
                border: 1px #45DAD5 solid;
                color: #45DAD5;
                border-radius: 3px;
            }
        }
        i {
            margin-bottom: 5px;
        }
    }
    .proportion-box {
        width: 5px;
        height: 100%;
        left: 0;
        top: 0;
        background-color: #f5f5f5;
        .proportion {
            background-color: #3FD88A;
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


