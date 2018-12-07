<template>
  <el-dialog :title="type == 'edit' ? '修改课程包' : '添加课程包'" width="750px" center :visible.sync="dialogStatus.coursePack" :close-on-click-modal="false" @close="dialogClose('coursePackForm')">
    <el-form :model="coursePackForm" label-width="125px" size="small" ref="coursePackForm" :rules="rules" class="form-box">
      <div class="d-f">
        <el-form-item label="课程包名字：" prop="name">
          <el-input v-model.trim="coursePackForm.name" placeholder="课程包名称"></el-input>
        </el-form-item>
        <el-form-item label="课时数：" prop="lesson_num">
          <el-input v-model.trim="coursePackForm.lesson_num" placeholder="课时数" type="number"></el-input>
        </el-form-item>
      </div>
      <el-form-item label="包含课程：">
        <ul class="d-f course-form-box">
          <li v-for="(course, index) in checkCourseForm" :key="index" :class="{'ml-10': index}">
            <span>{{course.name}}</span>
            <i @click="checkCourseForm.splice(index, 1)" class="p-a delete-time el-tag__close el-icon-close" v-if="type === 'add'"></i>
          </li>
        </ul>
        <div class="d-f" v-if="type === 'add'" :class="{'mt-10': checkCourseForm.length}">
          <MyButton @click.native="addCourseHandle" type="border" fontColor="fc-m">{{checkCourseForm.length ? '重新选择' : '添加课程'}}</MyButton>
        </div>
      </el-form-item>
      <div class="d-f f-j-c mt-40 mb-10">
        <MyButton @click.native="submitDone">提交</MyButton>
        <MyButton @click.native="deleteCoursePack" type="border" fontColor="fc-m" class="ml-20">删除</MyButton>
      </div>
    </el-form>

    <el-dialog title="添加课程" width="800px" center :visible.sync="dialogStatus.course" :close-on-click-modal="false" append-to-body @close="dialogClose('courseCheck')">
      <div class="form-box">
        <div v-if="courseLists.begrade.length" class="check-box">
          <h3>有班课程</h3>
          <el-checkbox-group v-model="checkCourse.begrade" class="pl-20 pr-20 mt-10 check-course-group">
            <el-checkbox v-for="(item, index) in courseLists.begrade" :label="item.id" :key="index"><span :title="item.name">{{item.name}}</span></el-checkbox>
          </el-checkbox-group>
        </div>

        <div v-if="courseLists.nograde.length" class="check-box mt-20">
          <h3>无班课程</h3>
          <el-checkbox-group v-model="checkCourse.nograde" class="pl-20 pr-20 mt-10 check-course-group">
            <el-checkbox v-for="(item, index) in courseLists.nograde" :label="item.id" :key="index">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="d-f f-j-c mt-40 mb-10"><MyButton @click.native="checkCourseDone" :loading="submitLoading">确定</MyButton></div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import MyButton from '../common/MyButton';

export default {
  components: {MyButton},
  props: {
    value: {default: false},
    type: {default: 'add'},
    detail: {}
  },
  watch: {
    value (val) {
      this.dialogStatus.coursePack = val;
    },
    // courselists (val) {
    //   this.courseLists.nograde = val;
    // },
    detail (val) {
      if (Object.keys(val).length) {
        this.coursePackForm.name = val.name;
        this.coursePackForm.lesson_num = val.num;
        this.coursePackForm.id = val.id;
        if (val.course_package.length) {
          this.checkCourseForm = val.course_package.map(v => {
            return {
              id: v.course.id,
              name: v.course.name,
              type: v.course.class_pattern === 1 ? 'begrade' : 'nograde'
            }
          });
        }
      }
    }
  },
  data () {
    return {
      dialogStatus: {coursePack: this.value, course: false},
      submitLoading: false,
      coursePackForm: {
        id: '',
        name: '',
        lesson_num: ''
      },
      checkCourse: {begrade: [], nograde: []},
      courseLists: {begrade: [], nograde: []},
      checkCourseForm: [],
      rules: {
        name: [
          {required: true, message: '请输入课程名称'},
          {max: 20, message: '长度不能超过20个字符'}
        ]
      }
    }
  },
  methods: {
    dialogClose (type) {
      if (type === 'coursePackForm') {
        this.$refs[type].resetFields();
        this.dialogStatus.coursePack = false;
        this.checkCourseForm = [];
        Object.keys(this.coursePackForm).forEach(v => {this.coursePackForm[v] = ''});
        this.$emit('input', false);
      } else {
        this.checkCourse.begrade = [];
        this.checkCourse.nograde = [];
      }
    },
    addCourseHandle () {
      this.checkCourseForm.forEach(v => {
        if (v.type === 'begrade') {
          this.checkCourse.begrade.push(v.id);
        }else {
          this.checkCourse.nograde.push(v.id);
        }
      })
      this.dialogStatus.course = true;
    },
    checkCourseDone () {
      let begrade = this.checkCourse.begrade.map(v => {return {id: v, name: this.getCourseName('begrade', v),  type: 'begrade'}});
      let nograde = this.checkCourse.nograde.map(v => {return {id: v, name: this.getCourseName('nograde', v),  type: 'nograde'}});

      this.checkCourseForm = begrade.concat(nograde);
      this.dialogStatus.course = false;
    },
    getCourseName (type, id) {
      let name = '';
      this.courseLists[type].forEach(v => {
        if (v.id === id) {
          name = v.name;
        }
      });
      return name;
    },
    // 删除课程包
    deleteCoursePack () {
      this.$confirm('课程包删除后数据不能恢复，确定进行删除操作?', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteHandle();
      }).catch(() => {
        return 0;
      });
    },
    async deleteHandle () {
      let res = await this.$$request.post('/coursePackage/delete', {course_package_id: this.coursePackForm.id});
      if (!res) {
        return 0;
      }
      this.$message.success('删除成功');
      this.dialogStatus.coursePack = false;

      this.$emit('CB-success');
    },
    // 提交数据
    async submitDone () {
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;
      let params = {
        name: this.coursePackForm.name,
        num: this.coursePackForm.lesson_num
      };

      if (this.type === 'add') {
        params.course_ids = this.checkCourseForm.map(v => v.id);
      } else {
        params.course_package_id = this.coursePackForm.id;
      }

      console.log(params);

      let res = await this.$$request.post(`/coursePackage/${this.type}`, params);
      this.submitLoading = false;

      if (!res) return 0;
      this.$message.success('添加成功');
      this.dialogStatus.coursePack = false;

      this.$emit('CB-success');
    },
    async getAllCourse () {
      let res = await this.$$request.get('/course/allLists');
      console.log(res);
      if (!res) return 0;

      res.courses.forEach(v => {
        if (v.class_pattern === 1) {
          this.courseLists.begrade.push({name: v.name, id: v.id, type: 'begrade'});
        } else {
          this.courseLists.nograde.push({name: v.name, id: v.id, type: 'nograde'});
        }
      });
    }
  },
  created () {
    this.getAllCourse();
    // this.$store.state.course.forEach(v => {
    //   if (v.class_pattern === 1) {
    //     this.courseLists.begrade.push({name: v.name, id: v.id, type: 'begrade'});
    //   } else {
    //     this.courseLists.nograde.push({name: v.name, id: v.id, type: 'nograde'});
    //   }
    // });
  }
}
</script>

<style lang="less" scoped>
  .form-box {
    padding: 0 20px;
    /deep/ .el-input {
      width: 180px;
    }
    .course-form-box {
      li {
        position: relative;
        margin-right: 20px;
        .delete-time {
          right: -15px;
          top: 5px;
        }
      }
    }
  }
  .check-box {
    h3 {
      position: relative;
      font-size: 16px;
      position: relative;
      padding-left: 10px;
      font-weight: normal;
      &::before {
          content: '';
          display: block;
          position: absolute;
          left: 0;
          top: 3px;
          width: 4px;
          height: 16px;
          background-color: #45DAD5;
          border-radius: 5px;
      }
    }
    .check-course-group {
      max-height: 200px;
      overflow: hidden;
      overflow-y: auto;
      .el-checkbox, .el-radio {
        margin-left: 0;
        margin-bottom: 10px;
        width: 165px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>


