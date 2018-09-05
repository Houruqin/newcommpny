<template>
  <div class="flex1">
    <PageState :state="state" />
    <el-card shadow="hover">
      <TableHeader title="老师课时记录"></TableHeader>
      <el-tabs v-model="activeTab" @tab-click="tabClick">
          <el-tab-pane v-for="(item, index) in tabHeader" :key="index" :label="item.name" :name="item.id"></el-tab-pane>
      </el-tabs>
      <div class="fifter-toolbar mt-10 mb-10">
        <ul class="d-f f-a-c">
          <li>
              <el-date-picker size="small" :editable="false" :clearable="false"
                  @change="dateChange" v-model="searchFilter.begin_time"
                  type="date" placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
          </li>
          <li class="ml-10 mr-10 text">至</li>
          <li>
              <el-date-picker size="small" :editable="false" :clearable="false"
                  @change="dateChange" v-model="searchFilter.end_time"
                  type="date" placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
          </li>
          <li class="ml-20">
            <el-select size="small" placeholder="全部课程" v-model="searchFilter.course_id">
                <el-option label="全部课程" value=""></el-option>
                <el-option v-for="(item, index) in $store.state.course" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </li>
          <li class="name ml-20"><el-input size="small" placeholder="请输入物品名称" v-model.trim="searchFilter.keyword"></el-input></li>
          <li class="ml-20"><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
        </ul>
      </div>
    </el-card>

    <el-dialog title="上课详情" width="650px" center :visible.sync="dialogStatus.course" :close-on-click-modal="false" @close="dialogClose">
      <p class="fs-15">{{courseDetail.teacher_name}}</p>
    </el-dialog>
  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'

export default {
  components: {TableHeader, MyButton},
  data() {
    return {
      state: 'loading',
      activeTab: 'teacher',
      tabHeader: [{id: 'teacher', name: '任课老师'}, {id: 'counselor', name: '辅助老师'}],
      dialogStatus: {course: false},
      searchFilter: {
        begin_time: new Date(this.$format_date(new Date(), "yyyy/MM/01")),
        end_time: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0),
        course_id: '', keyword: ''
      },
      courseDetail: {
        teacher_name: '张三老师'
      }
    }
  },
  methods: {
    dialogClose() {

    },
    tabClick() {
      console.log(this.activeTab)
    },
    searchHandle() {

    },
    dateChange() {

    }
  },
  created() {

  },
  mounted() {
    this.state = 'loaded';
  }
}
</script>

<style lang="less" scoped>
  .fifter-toolbar {
        ul li {
            &:not(:last-child) {
                width: 150px;
            }
            .el-select, .el-date-editor {
                width: 100%;
            }
            &.name {
                width: auto;
            }
            &.text {
                width: 15px;
            }
        }
    }
</style>


