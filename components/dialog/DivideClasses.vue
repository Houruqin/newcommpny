<template>
  <el-dialog :title="type === 'add' ? '分班' : '转班'" width="800px" center :visible.sync="dialogStatus" :close-on-click-modal="false" @close="dialogClose('divideGrade')">
      <div class="form-box divide-grade-dialog">
          <div v-for="(item, index) in gradeDivideLists.lists" :key="index" :class="{'mt-30': index}">
              <div class="fc-m fs-16">{{item.course.name}}</div>
              <div v-if="item.grades.length">
                  <el-radio-group v-model="item.divideClassRadio">
                      <ul class="d-f f-w-w">
                          <li v-for="(list, index) in item.grades" :key="index" class="fs-15 mr-30 mt-20">
                              <el-radio :label="list.id">
                                  <span>{{list.name}}</span>
                                  <span class="ml-20">
                                    <i class="iconfont" :class="item.type == 1 ? 'fs-13 icon-renshu' : 'icon-renyuan'"></i>
                                    <i>{{list.join_num}}</i>
                                    <i v-if="item.type == 1">/{{list.limit_num}}</i>
                                  </span>
                              </el-radio>
                          </li>
                      </ul>
                  </el-radio-group>
              </div>
              <div v-else class="fc-7 mt-20">暂无班级</div>
          </div>
      </div>

      <div class="d-f f-j-c mt-30">
          <MyButton :type="gradeDivideLists.disabled ? 'gray': 'main'" @click.native="divideClassDone(gradeDivideLists.disabled)" :loading="submitLoading">确认</MyButton>
      </div>
  </el-dialog>
</template>

<script>
import MyButton from '../common/MyButton';

export default {
  props: {
    type: {default: 'add'},
    value: {default: false},
    courseId: '',
    gradeLists: {default: {}},
    divideType: {default: 'student'}, //分配类型  buycourse/student
  },
  components: {MyButton},
  watch: {
    value (val) {
      this.dialogStatus = val;
    },
    gradeLists (val) {
      if (val.length) {
        this.gradeDivideLists.lists = val;
        // this.gradeDivideLists.disabled = result.lists.every(k => {
        //   return k.grade.length ? false : true;
        // });
        console.log(this.gradeDivideLists)
      }
    }
  },
  data () {
    return {
      dialogStatus: this.value,
      gradeDivideLists: {
        lists: [], disabled: false
      },
      divideClassRadio: '',
      submitLoading: false
    }
  },
  methods: {
    dialogClose () {
      this.$emit('input', false);
    },
    divideClassDone () {
      if (this.divideType === 'buycourse') {
        let data = this.gradeDivideLists.lists.map(v => {
          return {
            course_id: v.course_id,
            grade_id: v.divideClassRadio,
            teacher_id: 0
          }
        });
        this.$emit('CB-divideSuccess', data);
        this.dialogStatus = false;
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .form-box {
    padding: 0 20px;
    .el-select, .el-date-editor {
        width: 100%;
    }
    h3 {
        font-weight: normal;
        font-size: 14px;
        padding-left: 38px;
        margin-bottom: 15px;
    }
    &.divide-grade-dialog {
        height: 250px;
        overflow: hidden;
        overflow-y: auto;
    }
  }
</style>

