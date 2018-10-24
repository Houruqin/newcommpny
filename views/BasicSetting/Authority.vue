<template>
  <div class="flex1">
    <PageState :state="state"/>
    <el-card shadow="hover">
      <TableHeader title="权限设置"></TableHeader>
      <el-tabs v-model="staffType" @tab-click="tabClick" class="tab-toolbar">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane v-for="(item, index) in $store.state.roleLists" :key="index" :label="item.display_name" :name="item.name"></el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';

export default {
  components: {TableHeader, MyButton},
  data () {
    return {
      state: 'loading',
      roles: [
        {
          id: 1,
          name: '教务部',
          itemLists: [{id: 1, name: '教务主管'}, {id: 2, name: '教务'}, {id: 3, name: '教务1'}, {id: 4, name: '教务2'}]
        },
        {
          id: 2,
          name: '学术部',
          itemLists: [{id: 1, name: '学术主管'}, {id: 2, name: '学术'}, {id: 3, name: '学术1'}, {id: 4, name: '学术2'}]
        },
        {
          id: 3,
          name: '咨询部',
          itemLists: [{id: 1, name: '咨询主管'}, {id: 2, name: '咨询'}, {id: 3, name: '咨询1'}, {id: 4, name: '咨询2'}]
        }
      ],

    };
  },
  mounted () {
    this.state = 'loaded';
  }
};
</script>

<style lang="less" scoped>

</style>


