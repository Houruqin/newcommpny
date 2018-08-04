<template>
  <div class="pb-50">
    <el-menu
      :default-active="$store.state.guide ? '' : $route.meta.menu ? $route.meta.menu : $route.path"
      class="left-menu"
      background-color="#223243"
      text-color="#7F9CB9"
      active-text-color="#45DAD5"
      :router="true">

      <div v-for="(list, index) in menuLists" :key="index" class="menu-item" :class="'mymenu-' + index">
        <el-submenu v-if="list.item" :index="list.id">
          <template slot="title" >
            <i class="iconfont" :class="list.icon"></i><span class="fs-16 pl-10">{{list.text}}</span>
          </template>
          <el-menu-item v-for="(item, key) in list.itemList" :key="key" :index="item.id">{{item.text}}</el-menu-item>
        </el-submenu>

        <el-menu-item v-else :index="list.id">
          <i class="iconfont" :class="list.icon"></i><span class="fs-16 pl-10">{{list.text}}</span>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script>
import Bus from "../script/bus";
import Cache from '../script/cache';

export default {
    data() {
        return {
            menuLists: [
                {id: "/home/workbench", text: "工作台", item: false, icon: "icon-zhuye-copy"},
                {id: "/student/signed", text: "学员管理", item: true, icon: "icon-xueyuanguanli", itemList: [
                    { id: "/student/nosign", text: "未签约学员" }, { id: "/student/signed", text: "签约学员" }
                ]},
                {id: `/home/timetable/${Cache.getMemberInfo().class_pattern == 1 ? 'begrade' : 'nograde'}`, text: "排课管理", item: true, icon: "icon-paike", itemList: [
                    { id: `/home/timetable/${Cache.getMemberInfo().class_pattern == 1 ? 'begrade' : 'nograde'}`, text: `${Cache.getMemberInfo().class_pattern == 1 ? '班级' : '课程'}课表`},
                    { id: `/timetable/${Cache.getMemberInfo().class_pattern == 1 ? 'begrade' : 'nograde'}_teacher`, text: "老师课表" },
                    { id: `/timetable/${Cache.getMemberInfo().class_pattern == 1 ? 'begrade' : 'nograde'}_class`, text: "教室课表" }
                ]},
                {id: "/home/academic/classElimination", text: "教务统计", item: true, icon: "icon-jiaowuguanli", itemList: [
                    { id: "/academic/classElimination", text: "学员消课记录" },
                    { id: "/academic/audition", text: "试听课记录" },
                    { id: "/academic/buy", text: "购课记录" }
                ]},
                {id: `/course/${Cache.getMemberInfo().class_pattern == 1 ? 'begrade' : 'nograde'}`, text: "课程管理", item: false, icon: "icon-kecheng-", 
                    // itemList: [
                    //     {id: '/course/begrade', text: '班课管理'},
                    //     {id: '/course/nograde', text: '无班课管理'}
                    // ]
                },
                {id: "/home/staff", text: "员工管理", item: false, icon: "icon-yuangongguanli"},
                {id: "/home/setting", text: "基础设置", item: false, icon: "icon-shezhi"},
                {id: "/home/statistics", text: "校区统计", item: false, icon: "icon-xuexiao"}
                // {
                //   id: '/home/statistics',
                //   text: '更新日志',
                //   item: false,
                //   icon: 'icon-xiaoqutongji'
                // }
            ]
        };
    }
};
</script>

<style lang="less" scoped>
.left-menu {
  border: none;
  margin-top: 20px;
  .menu-item {
    width: 230px;
  }
}
.menu-item > .el-menu-item {
  &.is-active {
    background-color: #2a3c50 !important;
    border-right: 5px #45dad5 solid;
    i {
      color: #45dad5;
    }
  }
}
</style>

