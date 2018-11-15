<template>
  <div class="pb-50 pt-20">
    <el-menu
      :default-active="$store.state.guide ? '' : $route.meta.menu ? $route.meta.menu : $route.path"
      class="left-menu"
      background-color="#223243"
      text-color="#7F9CB9"
      active-text-color="#45DAD5"
      :router="true">

      <div v-for="(list, index) in menuLists" :key="index" class="menu-item" :class="'mymenu-' + index">
        <el-submenu v-if="list.itemLists && list.itemLists.length" :index="list.id">
          <template slot="title" >
            <i class="iconfont" :class="list.icon"></i><span class="fs-16 pl-10">{{list.text}}</span>
          </template>
          <el-menu-item v-for="(item, key) in list.itemLists" :key="key" :index="item.id">{{item.text}}</el-menu-item>
        </el-submenu>

        <el-menu-item v-else :index="list.id">
          <i class="iconfont" :class="list.icon"></i><span class="fs-16 pl-10">{{list.text}}</span>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script>
import Cache from '../script/cache';

export default {
  data () {
    return {
      menuLists: [],
      menuData: {
        workBench: {id: '/', icon: 'icon-zhuye-copy'},
        student: {id: '/student/nosign', icon: 'icon-xueyuanguanli', itemLists: [
          {id: '/student/nosign', name: 'nosign', text: '未签约学员'},
          {id: '/student/signed', name: 'signed', text: '签约学员'}
        ]},
        timetable: {id: `/timetable/${Cache.getMemberInfo().class_pattern === 2 ? 'nograde' : 'begrade'}`, icon: 'icon-paike', itemLists: [
          {id: '/timetable/begrade', name: 'begrade', text: '有班课表'},
          {id: '/timetable/nograde', name: 'nograde', text: '无班课程'}
        ]},
        academic: {id: '/academic/classElimination', icon: 'icon-jiaowuguanli', itemLists: [
          {id: '/academic/teacherLesson', name: 'teacherLesson', text: '老师课时记录'},
          {id: '/academic/classElimination', name: 'classElimination', text: '学员消课记录'},
          {id: '/academic/audition', name: 'audition', text: '试听课记录'},
          {id: '/academic/buy', name: 'buy', text: '购课记录'},
          {id: '/academic/changeCourse', name: 'changeCourse', text: '转课记录'}
        ]},
        course: {id: `/course/${Cache.getMemberInfo().class_pattern === 2 ? 'nograde' : 'begrade'}`, icon: 'icon-kecheng-', itemLists: [
          {id: '/course/begrade', name: 'begradeCourse', text: '有班课程'},
          {id: '/course/nograde', name: 'nogradeCourse', text: '无班课程'}
        ]},
        staff: {id: '/staff', icon: 'icon-yuangongguanli'},
        inventory: {id: '/inventory', icon: 'icon-kucunguanli', itemLists: [
          {id: '/inventory/commodity', name: 'commodity', text: '物品管理'},
          {id: '/inventory/storage', name: 'storage', text: '出入库明细'},
          {id: '/inventory/borrow', name: 'borrow', text: '借用记录'}
        ]},
        finance: {id: '/finance', icon: 'icon-finance', itemLists: [
          {id: '/finance/income', name: 'income', text: '收款管理'},
          {id: '/finance/outlay', name: 'outlay', text: '支出管理'},
          {id: '/finance/refund', name: 'refund', text: '退费管理'},
          {id: '/finance/assign', name: 'assign', text: '业绩分配'}
        ]},
        setting: {id: '/setting', icon: 'icon-shezhi1', itemLists: [
          {id: '/setting', name: 'classRoom', text: '教室渠道'},
          {id: '/setting/wechat', name: 'wechat', text: '微信设置'},
          {id: '/setting/system', name: 'system', text: '系统设置'},
          {id: '/setting/authority', name: 'authority', text: '权限设置'}
        ]},
        statistics: {id: '/statistics', icon: 'icon-xuexiao'}
      }
    };
  },
  methods: {
    // 获取所有角色 菜单
    async getAllRoleMenus () {
      let roleList = this.$store.state.allMenusData.roleList;
      let menuData = this.$store.state.allMenusData.menu;
      let arr = roleList.map(v => {
        return v.enName;
      });

      console.log(menuData);

      this.menuLists.splice(0, this.menuLists.length);
      if (arr.includes('master') || arr.includes('institution')) {
        this.menuLists = menuData.map(v => {
          let itemLists = [];

          if (v.description === 'timetable' || v.description === 'course') {
            itemLists = this.$$cache.getMemberInfo().class_pattern === 0 ? this.menuData[v.description].itemLists : [];
          } else {
            itemLists = this.menuData[v.description].itemLists ? this.menuData[v.description].itemLists : [];
          }

          return {
            id: this.menuData[v.description].id,
            text: v.name,
            icon: this.menuData[v.description].icon,
            itemLists: itemLists
          };
        });
      } else {
        menuData.forEach(v => {
          if (v.display_status) {
            let childItem = [];

            if (v.children) {
              this.menuData[v.description].itemLists.forEach(k => {
                v.children.forEach(m => {
                  if (m.description === k.name) {
                    childItem.push(k);
                  }
                });
              });
            }
            this.menuLists.push({
              id: childItem.length > 1 || !childItem.length ? this.menuData[v.description].id : childItem[0].id,
              text: v.name,
              icon: this.menuData[v.description].icon,
              itemLists: childItem.length > 1 ? childItem : []
            });
          }
        });
      }

      console.log(this.menuLists);
    }
  },
  created () {
    this.getAllRoleMenus();
  }
};
</script>

<style lang="less" scoped>
.left-menu {
  border: none;
//   margin-top: 20px;
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

