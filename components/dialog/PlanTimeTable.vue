<template>
  <el-dialog title="批量排课" width="900px" center :visible.sync="dialogStatus.timetable" :close-on-click-modal="false" @close="dialogClose('addTimeTable')">
      <el-form label-width="120px" :model="timetableForm" size="small" ref="addTimeTable" :rules="timetableRules">
          <div class="form-box">
              <el-row>
                  <el-col :span="11">
                      <!-- <el-form-item label="选择班级：" prop="grade_info">
                          <el-cascader :options="timetableFull.course" v-model="timetableForm.grade_info" @change="formGradeChange" expand-trigger="hover"></el-cascader>
                      </el-form-item> -->

                      <el-form-item label="排课班级：" >{{timetableForm.class_name}}</el-form-item>

                      <el-form-item label="开课日期：" prop="start_time">
                          <el-date-picker v-model="timetableForm.start_time" @change="startTimeChange" type="date" :editable="false" :picker-options="pickerBeginDateAfter" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                      </el-form-item>

                      <el-form-item label="上课老师：" prop="teacher_ids">
                          <el-select placeholder="请选择" v-model="timetableForm.teacher_ids">
                              <el-option v-for="(item, index) in classSelectInfo.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                          </el-select>
                      </el-form-item>

                      <el-form-item label="上课教室：" prop="room_id">
                          <el-select placeholder="请选择"  v-model="timetableForm.room_id" multiple>
                              <el-option v-for="(item, index) in classSelectInfo.room" :key="index" :label="item.name" :value="item.id"></el-option>
                          </el-select>
                      </el-form-item>

                      <el-form-item label="重复规则：" prop="loop" v-if="courseType !== 1">
                          <el-select placeholder="请选择" v-model="timetableForm.loop">
                              <el-option label="无" value="no"></el-option>
                              <el-option label="按周循环" value="yes"></el-option>
                          </el-select>
                      </el-form-item>
                  </el-col>

                  <el-col :span="11" :offset="1">
                      <el-form-item label="课程属性：">
                          <span>{{courseType === 1 ? '普通课程' : '一对一课程'}}</span>
                          <span class="ml-10" v-if="timetableForm.lesson_time">{{timetableForm.lesson_time}}分钟</span>
                          <span class="fc-m ml-10" v-if="timetableForm.no_timetable !== '' && courseType === 1">未排课时：{{timetableForm.no_timetable}}</span>
                      </el-form-item>

                      <el-form-item label="扣课时数：" prop="lesson_num">
                          <el-input-number v-model="timetableForm.lesson_num" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">课时</span>
                      </el-form-item>

                      <el-form-item label="辅助老师：" prop="counselor_ids">
                          <el-select placeholder="请选择" v-model="timetableForm.counselor_ids" clearable>
                              <el-option v-for="(item, index) in classSelectInfo.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                          </el-select>
                      </el-form-item>

                      <el-form-item label="重复规则：" prop="loop" v-if="courseType === 1">
                          <el-select placeholder="请选择" v-model="timetableForm.loop">
                              <el-option label="无" value="no"></el-option>
                              <el-option label="按周循环" value="yes"></el-option>
                          </el-select>
                      </el-form-item>

                      <el-form-item label="上课学员：" prop="counselor_ids" class="addtimetable-student" v-if="courseType !== 1">
                          <div class="d-f">
                              <div class="d-f">
                                  <MyButton type="border" fontColor="fc-m" @click.native="addStudentClick">
                                      {{addStudentBtnChange()}}
                                  </MyButton>
                              </div>
                              <span class="fc-m ml-10" v-if="timetableForm.no_timetable !== ''">学员未排课时：{{timetableForm.no_timetable}}</span>
                          </div>
                      </el-form-item>

                      <el-form-item label="排课次数：" prop="loop_time" v-if="courseType !== 1">
                          <el-input-number :disabled="timetableForm.loop == 'no'" v-model="timetableForm.loop_time" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">次</span>
                      </el-form-item>
                  </el-col>
              </el-row>


              <el-row>
                  <el-col :span="12">
                      <el-row class="add-date-box d-f">
                          <el-col class="title p-r is-required">上课时间：</el-col>
                          <el-col class="flex1">
                              <div class="list">
                                  <el-form :model="addDate" size="small" ref="addDateForm" :rules="timeRules" v-for="(addDate, num) in formAddDate" :key="num">
                                      <el-row class="p-r">
                                          <el-col :span="8">
                                              <el-form-item label-width="0" prop="week">
                                                  <el-select placeholder="某天" v-model="addDate.week" @change="formWeekChange">
                                                      <el-option v-for="(item, index) in weekList" :key="index" :label="item.name" :value="item.id"></el-option>
                                                  </el-select>
                                              </el-form-item>
                                          </el-col>

                                          <el-col :span="12" class="p-r" :offset="1">
                                              <el-form-item  label-width="0" prop="begin_time" class="p-r">
                                                  <el-time-select
                                                      :editable="false"
                                                      v-model="addDate.begin_time"
                                                      :picker-options="timePicker"
                                                      placeholder="时间">
                                                  </el-time-select>
                                              </el-form-item>
                                          </el-col>

                                          <el-col :span="2" v-if="formAddDate.length > 1" class="p-r delete-time ml-5" @click.native="deleteDateHandle(num)"><i class="el-tag__close el-icon-close"></i></el-col>
                                      </el-row>
                                  </el-form>
                              </div>
                              <div class="d-f mt-10"><MyButton type="border" fontColor="fc-m"  @click.native="addDateHandle">添加时间</MyButton></div>
                          </el-col>
                      </el-row>
                  </el-col>

                  <el-col :span="11" class="d-f f-a-s addtimetable-student" v-if="courseType === 1">
                      <div class="label"><span>上课学员：</span></div>
                      <div class="flex1">
                          <ul v-if="courseType === 1 && checkStudentForm.length" class="d-f f-w-w">
                              <li v-for="(item, index) in checkStudentForm" :key="index" class="mb-10 ml-10">
                                  <span>{{getStudentName(item)}}</span>
                              </li>
                          </ul>
                          <div class="d-f">
                              <MyButton type="border" fontColor="fc-m" @click.native="addStudentClick">
                                  {{addStudentBtnChange()}}
                              </MyButton>
                          </div>
                      </div>
                  </el-col>
              </el-row>
          </div>

          <div class="d-f f-j-c mt-30">
              <MyButton @click.native="addTimeTableDone" :loading="submitLoading.timetable">确定</MyButton>
          </div>
      </el-form>

      <el-dialog :title="courseType === 1 ? '选择普通上课学员' : '选择一对一上课学员'" width="670px" center :visible.sync="addStudentDialog" :close-on-click-modal="false" append-to-body>
          <div class="form-box">
              <template v-if="courseType === 1">
                  <el-checkbox v-model="timetable_studentCheckAll" @change="timetable_studentCheckAllChange" class="pl-20">全选</el-checkbox>
                  <el-checkbox-group v-model="timetable_studentLists" @change="timetable_studentCheckChange" v-if="allStudentLists.length" class="time-table-student-check pl-20 pr-20 mt-10">
                      <el-checkbox v-for="(item, index) in allStudentLists" :label="item.student_id" :key="index">{{item.student_name}}</el-checkbox>
                  </el-checkbox-group>
              </template>
              <el-radio-group v-model="studentRadio" class="time-table-student-check pl-20 pr-20" v-else>
                  <el-radio v-for="(item, index) in allStudentLists" :disabled="!(item.buy_lesson_num - item.scheduled)" :key="index" :label="item.student_id">{{item.student_name}}</el-radio>
              </el-radio-group>

              <div class="d-f f-j-c mt-30"><MyButton @click.native="checkStudentDone">确定</MyButton></div>
          </div>
      </el-dialog>
  </el-dialog>
</template>

<script>
export default {
  props: {
    value: {default: false}
  },
  watch: {
    value () {
      this.dialogStatus.timetable = newVal;
    }
  },
  data () {
    return {
      dialogStatus: {
        timetable: this.dialogStatus.timetable, contract: false
      },
      timetableForm: {
        no_timetable: '', //未排课时
        course_id: '',
        grade_id: '',
        class_name: '',
        start_time: '',
        lesson_time: '',
        lesson_num: '',
        teacher_ids: '',
        counselor_ids: '',
        room_id: [],
        loop: 'no',
        loop_time: ''
      }
    };
  }
};
</script>

<style lang="less" scoped>

</style>


