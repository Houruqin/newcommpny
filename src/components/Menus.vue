<template>
  <div>
    <el-menu
      :default-active="$store.state.guide ? '' : $route.meta.menu ? $route.meta.menu : $route.path"
      class="left-menu"
      background-color="#223243"
      text-color="#7F9CB9"
      active-text-color="#45DAD5"
      :router="true"
      :default-openeds="$store.state.guide ? ['/student/signed', '/home/timetable/index'] : null">

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

export default {
    data() {
        return {
            menuLists: [
                {id: "/home/workbench", text: "工作台", item: false, icon: "icon-gongzuotai"},
                {id: "/student/signed", text: "学员管理", item: true, icon: "icon-xueyuanguanli", itemList: [
                    { id: "/student/nosign", text: "未签约学员" }, { id: "/student/signed", text: "签约学员" }
                ]},
                {id: "/home/timetable/index", text: "排课管理", item: true, icon: "icon-kebiao", itemList: [
                    { id: "/timetable/index", text: "课程表" },
                    { id: "/timetable/teacher", text: "老师课表" },
                    { id: "/timetable/class", text: "教室课表" }
                ]},
                {id: "/home/course", text: "课程管理", item: false, icon: "icon-kechengbiao"},
                {id: "/home/staff", text: "员工管理", item: false, icon: "icon-yuangongguanli"},
                {id: "/home/setting", text: "基础设置", item: false, icon: "icon-set"},
                {id: "/home/statistics", text: "校区统计", item: false, icon: "icon-xiaoqutongji"}
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

