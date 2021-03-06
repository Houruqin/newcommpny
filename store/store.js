
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
  personaladvisor: [], // 个人顾问数据
  teacherList: [], //老师列表
  source: [], //渠道列表
  sourceState: 'loading',
  classRoom: [], //教室列表
  classRoomState: 'loading',
  uncommitted: [], //未承诺上门列表
  uncommittedState: 'loading',
  course: [], //课程列表
  personalCourse: [], //个人课程列表
  grade: [], //班级列表
  listen_grade: [], //试听班级列表
  listen_status: [], //试听状态
  familyRelations: [], //家长关系
  allUser: [], //所有用户列表
  roleLists: [], //所有用户角色列表
  systemSetting: {},
  followupStatus: [],

  coursePackLists: [], //课程包列表

  allMenusData: {}, // 初始化菜单数据，包含权限、菜单、角色
  httpState: 'normal' // 请求状态 normal menu authority
};

const mutations = {
  stateChange (state, pageStateObj) {
    state.pageState = pageStateObj.state;
    switch (pageStateObj.state) {
      case 'loading':
        state.pageErrorText = '';
        break;
      case 'loaded':
        state.pageErrorText = '';
        break;
      default:
        // state.errorType = pageStateObj.errorType;
        state.pageErrorText = pageStateObj.errorMsg;
    }
  },
  httpStateChange (state, httpState) {
    state.httpState = httpState;
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
  async getAdvisor (state, type) {
    let result = await Request.get('/user/consultingList', {
      type: 0
    });

    console.log(result);
    if (!result) {
      return 0;
    }

    state.advisor = result;
    let result2 = await Request.get('/user/consultingList', {
      type: 1
    });

    console.log(result2);
    if (!result2) {
      return 0;
    }

    state.personaladvisor = result2;
  },
  async getTeacher (state) {
    let result = await Request.get('/user/educationList', {type: 0});

    if (!result) {
      return 0;
    }
    console.log(result);
    state.teacherList = result;
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
  async getClassRoom (state, fn) {
    let result = await Request.post('/classRoom/lists');

    console.log(result);

    if (!result) {
      if (fn && typeof fn === 'function') {
        fn(false);
      }
    } else {
      state.classRoomState = 'loaded';
      state.classRoom = result.lists;
      if (fn && typeof fn === 'function') {
        fn(true);
      }
    }
  },
  async getUncommitted (state, fn) {
    let result = await Request.get('/uncommittedReason/lists');

    if (!result) {
      return 0;
    }
    state.uncommitted = result.reasons;
    if (fn && 'function' === typeof fn) fn();
  },
  async getCourse (state) {
    let result = await Request.post('/course/normalLists', {type: 0});

    console.log(result);
    if (!result) {
      return 0;
    }

    state.course = result.lists;
    let result2 = await Request.post('/course/normalLists', {type: 1});

    if (!result2) {
      return 0;
    }
    state.personalCourse = result2.lists;
  },
  async getCoursePack (state) {
    let res = await Request.get('/coursePackage/lists');
    console.log(res);

    if (!res) {
      return 0;
    }
    state.coursePackLists = res.lists;
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
  async getFollowupStatusLists (state, fn) {
    let result = await Request.get('/followUp/status');

    if (!result) {
      return 0;
    }
    console.log(result);
    state.followupStatus = result.status;
    if (fn && 'function' === typeof fn) fn();
  },
  // 保存权限
  async saveAuthority (state, fn) {
    let res = await Request.get('/user/permission');

    console.log(res);
    if (!res) {
      if (fn && typeof fn === 'function') {
        fn(false);
      }
    } else {
      state.allMenusData = res;
      if (fn && typeof fn === 'function') {
        fn(true);
      }
    }
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

  getAdvisor (context, type = 'all') {
    context.commit('getAdvisor', type);
  },

  getSource (context) {
    context.commit('getSource');
  },

  getClassRoom (context, fn) {
    context.commit('getClassRoom', fn);
  },

  getUncommitted (context, fn) {
    context.commit('getUncommitted', fn);
  },

  getCourse (context) {
    context.commit('getCourse');
  },

  getCoursePack (context) {
    context.commit('getCoursePack');
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

  getFollowupStatus (context, fn) {
    context.commit('getFollowupStatusLists', fn);
  }
};


export default new Vuex.Store({
  state,
  mutations,
  actions
});