<template>
    <el-popover placement="bottom" width="380" trigger="click" ref="myPopver">
        <div class="course-popver">
            <div class="d-f f-j-b">
                <span class="fs-17 fc-m">{{item.grade_name}}</span>
                <div class="d-f btn" v-if="!pastdue && item.begin_time > new Date().getTime() / 1000">
                    <a class="cursor-pointer" @click="detailEdit(item)">编辑</a>
                    <a class="cursor-pointer ml-10" @click="detailDelete(item)">删除</a>
                </div>
                <div class="btn" v-else-if="!item.lesson_end_time && $$cache.getMemberInfo().lesson_end && item.end_time < new Date().getTime() / 1000">
                    <a class="cursor-pointer" @click="endTimeTable(item)">结课</a>
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

            <p class="t-a-l">{{item.grade_name}}</p>

            <p class="pt-5 d-f f-a-s">
                <span class="fs-12">
                    <i class="iconfont fs-13 icon-laoshi"></i>
                    <span>{{item.teacher[0].name}}</span>
                </span>

                <span class="ml-20 fs-12">
                    <i class="iconfont fs-13" :class="item.course_type === 2 ? 'icon-renyuan' : 'icon-renshu'"></i>
                    <span v-if="item.course_type === 2">{{item.student_grades[0].student_name}}</span>
                    <span v-else>{{item.student_grades.length}}/{{item.grade_limit_num}}</span>
                </span>
            </p>
            <p class="pt-5 d-f f-a-c">
                <i class="iconfont fs-13 icon-shijian"></i>
                <span class="pl-5 fs-12">{{`${item.time_quantum.begin_time}-${item.time_quantum.end_time}`}}</span>
            </p>
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
    async deleteHandle (id) {
      let result = await this.$$request.post('/timetable/delete', {id: id});

      if (!result || !result.status) {
        return 0;
      }

      this.$refs.myPopver.showPopper = false;
      this.$emit('CB-deleteTable');
      this.$message.success('删除成功');
    },
    //结课
    endTimeTable (item) {
      this.$confirm('确定结课吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
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

      this.$refs.myPopver.showPopper = false;
      this.$emit('CB-deleteTable');
      this.$message.success('已结课');
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


