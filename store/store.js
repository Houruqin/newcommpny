
import Vuex from 'vuex';
import Vue from 'vue';
import Request from '../script/request';

Vue.use(Vuex);

const state = {
  isOutOfLine: false, // 是否被挤下线了  用于解决挤下线弹窗提示多次问题
  pageState: 'loading', // 页面加载状态  loading loaded error
  pageErrorText: '',
  errorType: '',
  guide: false, //是否引导页
  advisor: [], //顾问列表
  teacherList: [], //老师列表
  source: [], //渠道列表
  sourceState: 'loading',
  classRoom: [], //教室列表
  classRoomState: 'loading',
  course: [], //课程列表
  grade: [], //班级列表
  listen_grade: [], //试听班级列表
  listen_status: [], //试听状态
  familyRelations: [], //家长关系
  allUser: [], //所有用户列表
  roleLists: [], //所有用户角色列表
  systemSetting: {},
  followupStatus: [],

  allMenusData: {} // 初始化菜单数据，包含权限、菜单、角色
  // authorityLists: [] //权限列表(只包含操作权限)
};

const mutations = {
  stateChange (state, pageStateObj) {
    state.pageState = pageStateObj.state;
    switch (pageStateObj.state) {
      case 'loading':
        // document.title = '加载中...';
        state.pageErrorText = '';
        break;
      case 'loaded':
        // document.title = pageStateObj.title;
        state.pageErrorText = '';
        break;
      default:
        state.errorType = pageStateObj.errorType;
        state.pageErrorText = pageStateObj.errorMsg;
    }
  },
  async getSynstemSetLists (state) {
    let result = await Request.get('/school/systemSetLists');

    if (!result) {
      return 0;
    }

    state.systemSetting = result.datas;
  },
  //引导页改变
  guideChange (state, type) {
    state.guide = type;
  },
  async getAllUser (state) {
    let result = await Request.get('/financeManage/searchUser', {
      student: { types: ['sign'], status: [1] },
      user: { types: ['all'], status: [1] }
    });

    console.log(result);
    if (!result) {
      return 0;
    }

    state.allUser = result.users;
  },
  async getRoleLists (state, data) {
    state.roleLists = data;
  },
  async getAdvisor (state) {
    let result = await Request.get('/user/normalLists', {type: 'seller'});

    console.log(result);
    if (!result) {
      return 0;
    }

    state.advisor = result.lists;
  },
  async getSource (state) {
    let result = await Request.post('/source/lists');

    console.log(result);
    if (!result) {
      return 0;
    }
    state.sourceState = 'loaded';
    state.source = result.lists;
  },
  async getClassRoom () {
    let result = await Request.post('/classRoom/lists');

    console.log(result);
    if (!result) {
      return 0;
    }
    state.classRoomState = 'loaded';
    state.classRoom = result.lists;
  },
  async getCourse (state) {
    let result = await Request.post('/course/normalLists');

    console.log(result);
    if (!result) {
      return 0;
    }

    state.course = result.lists;
  },
  async getGrade (state) {
    let result = await Request.post('/eduCount/gradeLists', {is_listen: 0});

    if (!result) {
      return 0;
    }
    state.grade = result.grades;
  },
  async getListenGrade (state) {
    let result = await Request.post('/eduCount/gradeLists', {is_listen: 1});

    if (!result) {
      return 0;
    }
    state.listen_grade = result.grades;
  },
  async getStatus (state) {
    let result = await Request.post('/eduCount/listenStatus');

    if (!result) {
      return 0;
    }
    state.listen_status = result.status;
  },
  async getRelation (state) {
    let result = await Request.post('/student/familyRelations');

    if (!result) {
      return 0;
    }
    console.log(result);
    state.familyRelations = result.relations;
  },
  async getTeacher (state) {
    let result = await Request.get('/user/normalLists', {type: 'teacher'});

    if (!result) {
      return 0;
    }
    console.log(result);
    state.teacherList = result.lists;
  },
  async getFollowupStatusLists (state) {
    let result = await Request.get('/followUp/status');

    if (!result) {
      return 0;
    }
    console.log(result);
    state.followupStatus = result.status;
  },
  // 保存权限
  saveAuthority (state, data) {
    state.allMenusData = data;
  }
};

const actions = {
  guideChange (context, type) {
    context.commit('guideChange', type);
  },

  getSynstemSetLists (context) {
    context.commit('getSynstemSetLists');
  },

  getAllUser (context) {
    context.commit('getAllUser');
  },

  getAdvisor (context) {
    context.commit('getAdvisor');
  },

  getSource (context) {
    context.commit('getSource');
  },

  getClassRoom (context) {
    context.commit('getClassRoom');
  },

  getCourse (context) {
    context.commit('getCourse');
  },

  getGrade (context) {
    context.commit('getGrade');
  },

  getListenGrade (context) {
    context.commit('getListenGrade');
  },

  getStatus (context) {
    context.commit('getStatus');
  },

  getRelation (context) {
    context.commit('getRelation');
  },

  getTeacher (context) {
    context.commit('getTeacher');
  },

  getFollowupStatus (context) {
    context.commit('getFollowupStatusLists');
  }
};


export default new Vuex.Store({
  state,
  mutations,
  actions
});