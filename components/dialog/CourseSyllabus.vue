<template lang="pug">
  el-dialog(:title="type == 'course' ? '编辑课程大纲' : '编辑班级大纲'" width="800px" center :visible.sync="currentValue" :close-on-click-modal="false" @close="dialogClose")
    div.form-box
      el-input.content-box(:class="{edit: (type == 'course' && syllabusType == 'edit') || (type == 'grade' && syllabusType == 'edit' && isSync == 0)}" type="textarea"
        :readonly="(type == 'course' && syllabusType == 'look') || (type == 'grade' && !(syllabusType == 'edit' && isSync == 0))"
        :placeholder="type == 'course' ? '课程大纲' : '班级大纲'" resize="none" :autosize="{ minRows: 15, maxRows: 20}" v-model.trim="syllabusDeatil")
      p.mt-20(v-if="type == 'grade' && syllabusType == 'edit'")
        span 是否与课程栏的大纲同步？
        el-radio-group.ml-10(v-model="isSync" @change="isSyncChange")
          el-radio(:label="1") 是
          el-radio(:label="0") 否
      div.d-f.f-j-c.mt-30
        template(v-if="syllabusType == 'look'")
          MyButton(@click.native="editClick") 编辑
          MyButton.ml-20(@click.native="delClick") 删除
        template(v-else)
          MyButton(@click.native="doneClick" v-if="(type == 'course' && syllabusType == 'edit') || (type == 'grade' && syllabusType == 'edit')") 提交
</template>

<script>
import MyButton from '../../components/common/MyButton'

export default {
  props: {
    value: {default: false},
    syllabus: {default: {}},
    type: {default: 'course'}
  },
  watch: {
    value(newVal) {
      this.currentValue = newVal;
    },
    syllabus(newVal) {
      this.courseId = newVal.course_id;
      this.courseSyllabus = newVal.course_syllabus;

      if(this.type == 'grade') {
        this.gradeId = newVal.grade_id;
        this.gradeSyllabus = newVal.grade_syllabus;
        this.isSync = newVal.is_sync;

        if(this.isSync == 1) this.syllabusDeatil = newVal.course_syllabus;
        else this.syllabusDeatil = newVal.grade_syllabus;
      }else {
        this.syllabusDeatil = newVal.course_syllabus;
      }

      this.syllabusType = this.syllabusDeatil.length ? 'look' : 'edit';
    }
  },
  data() {
    return {
      currentValue: this.value,
      syllabusType: 'look',
      isSync: 1,
      courseId: '',
      gradeId: '',
      courseSyllabus: '',   //课程大纲
      gradeSyllabus: '',   //班级大纲
      syllabusDeatil: ''   //大纲输入框 v-model 绑定值
    }
  },
  methods: {
    dialogClose() {
      this.currentValue = false;
      this.syllabusDeatil = '';
      this.$emit('input', this.currentValue);
    },
    doneClick() {
      this.submitSyllabusContent();
    },
    editClick() {
      this.syllabusType = 'edit';
    },
    //删除大纲
    delClick() {
      this.$confirm('确定删除大纲？', '提醒', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
      }).then(() => {
        //排课
        this.submitDelSyllabus();
      }).catch(() => {return 0});
    },
    async submitDelSyllabus () {
      let params = {outlineType: this.type == 'course' ? 1 : 2, courseId: this.courseId};
      if(this.type == 'grade') params.gradeId = this.gradeId;

      let result = await this.$$request.post('course/delOutline', params);
      console.log(result);
      if(!result) return 0;

      this.currentValue = false;
      this.$emit('input', this.currentValue);
      if(this.type == 'grade') this.$emit('refreshGradeDetail');
    },
    //是否同步 radio change
    isSyncChange() {
      if(this.isSync) this.syllabusDeatil = this.courseSyllabus;
      else this.syllabusDeatil = this.gradeSyllabus;
    },
    //提交大纲内容
    async submitSyllabusContent() {
      let content = '';

      if(this.type == 'course') content = this.syllabusDeatil;
      else content = this.isSync ? this.gradeSyllabus : this.syllabusDeatil;

      let params = {
        outlineType: this.type == 'course' ? 1 : 2,
        outlineContent: content,
        courseId: this.courseId,
      };

      if(this.type == 'grade') {
        params.gradeId = this.gradeId;
        params.isSync = this.isSync;
      };

      console.log(params);

      let result = await this.$$request.post('course/editOutline', params);
      console.log(result);
      if(!result) return 0;

      this.$message.success(`修改${this.type == 'course' ? '课程' : '班级'}大纲成功!`);
      this.currentValue = false;
      this.$emit('input', this.currentValue);
      if(this.type == 'grade') this.$emit('refreshGradeDetail');
    }
  },
  components: {MyButton}
}
</script>

<style lang="less" scoped>
  .form-box {
    padding: 0 20px;
    /deep/ .content-box {
      &.edit {
        .el-textarea__inner {
           background-color: #F4F4F4;
        }
      }
      .el-textarea__inner {
        border: none;
      }
    }
    /deep/ .el-radio {
      margin-left: 20px;
    }
  }
</style>


