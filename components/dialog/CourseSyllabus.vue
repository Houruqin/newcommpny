<template lang="pug">
  el-dialog(title="编辑课程大纲" width="800px" center :visible.sync="currentValue" :close-on-click-modal="false" @close="dialogClose")
    div.form-box
      el-input(type="textarea" :readonly="syllabusType == 'look'" placeholder="课程大纲" resize="none" :autosize="{ minRows: 15, maxRows: 20}" v-model.trim="syllabusForm.content")
      p.mt-20
        span 是否与课程栏的大纲同步？
        el-radio-group.ml-10(v-model="radio")
          el-radio(:label="1") 是
          el-radio(:label="0") 否
      div.d-f.f-j-c.mt-30
        template(v-if="syllabusType == 'look'")
          MyButton(@click.native="editClick") 编辑
          MyButton.ml-20(@click.native="delClick") 删除
        template(v-else)
          MyButton(@click.native="doneClick") 提交
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
      console.log(newVal)
      this.syllabusForm.course_id = newVal.course_id;
      this.syllabusForm.content = newVal.content;
      this.syllabusType = newVal.content.length ? 'look' : 'edit';
    }
  },
  data() {
    return {
      currentValue: this.value,
      syllabusType: 'look',
      radio: 1,
      syllabusForm: {
        content: '',
        course_id: ''
      }
    }
  },
  methods: {
    dialogClose() {
      this.currentValue = false;
      this.$emit('input', this.currentValue);
    },
    doneClick() {
      console.log(this.syllabusForm.content)
    },
    editClick() {
      this.syllabusType = 'edit';
    },
    delClick() {

    }
  },
  components: {MyButton}
}
</script>

<style lang="less" scoped>
  .form-box {
    padding: 0 20px;
    /deep/ .el-textarea__inner {
      background-color: #F4F4F4;
      border: none;
    }
    /deep/ .el-radio {
      margin-left: 20px;
    }
  }
</style>


