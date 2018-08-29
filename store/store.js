
import Vuex from 'vuex';
import Vue from 'vue';
import Request from '../script/request'

Vue.use(Vuex);

const state = {
    pageState: 'loading', // 页面加载状态  loading loaded error
    pageErrorText: '',
    errorType: '',
    guide: false,     //是否引导页
    advisor: [],    //顾问列表
    teacherList: [],   //老师列表
    source: [],   //渠道列表
    classRoom: [],   //教室列表
    course: [],   //课程列表
    grade: [],    //班级列表
    listen_grade: [],    //试听班级列表
    listen_status: [],    //试听状态
    familyRelations: [],   //家长关系
    allUser: [],   //所有用户列表
    roleLists: []   //所有用户角色列表
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
    //引导页改变
    guideChange(state, type) {
        state.guide = type;
    },
    async getAllUser(state) {
        let result = await Request.get('/financeManage/searchUser', {
            student: { types: ['sign'], status: [1] },
            user: { types: ['all'], status: [1] }
        });
        console.log(result);
        if(!result) return 0;

        state.allUser = result.users;
    },
    async getRoleLists(state) {
        let result = await Request.post('/permission/roleLists');
        console.log(result);

        if(!result) return 0;
        state.roleLists = result.lists;
    },
    async getAdvisor(state) {
        let result = await Request.get('/user/normalLists', {type: 'seller'});
        console.log(result)
        if(!result) return 0;

        state.advisor = result.lists;
    },
    async getSource(state) {
        let result = await Request.post('/source/lists');
        console.log(result)
        if(!result) return 0;

        state.source = result.lists;
    },
    async getClassRoom() {
        let result = await Request.post('/classRoom/lists');
        console.log(result)
        if(!result) return 0;

        state.classRoom = result.lists;
    },
    async getCourse(state) {
        let result = await Request.post('/course/normalLists');
        console.log(result)
        if(!result) return 0;

        state.course = result.lists;
    },
    async getGrade(state) {
        let result = await Request.post('/eduCount/gradeLists', {is_listen: 0});
        if(!result) return 0;
        state.grade = result.grades;
    },
    async getListenGrade(state) {
        let result = await Request.post('/eduCount/gradeLists', {is_listen: 1});
        if(!result) return 0;
        state.listen_grade = result.grades;
    },
    async getStatus(state) {
        let result = await Request.post('/eduCount/listenStatus');
        if(!result) return 0;
        state.listen_status = result.status;
    },
    async getRelation(state) {
        let result = await Request.post('/student/familyRelations');
        console.log(result);
        state.familyRelations = result.relations;
    },
    async getTeacher(state) {
        let result = await Request.get('/user/normalLists', {type: 'teacher'});
        console.log(result);
        state.teacherList = result.lists;
    }
};

const actions = {
    guideChange(context, type) {
        context.commit('guideChange', type);
    },

    getAllUser(context) {
        context.commit('getAllUser');
    },

    getRoleLists(context) {
        context.commit('getRoleLists');
    },

    getAdvisor(context) {
        context.commit('getAdvisor');
    },

    getSource(context) {
        context.commit('getSource');
    },

    getClassRoom(context) {
        context.commit('getClassRoom');
    },

    getCourse(context) {
        context.commit('getCourse');
    },

    getGrade(context) {
        context.commit('getGrade');
    },

    getListenGrade(context) {
        context.commit('getListenGrade');
    },

    getStatus(context) {
        context.commit('getStatus');
    },

    getRelation(context) {
        context.commit('getRelation');
    },

    getTeacher(context) {
        context.commit('getTeacher');
    }
};


export default  new Vuex.Store({
    state,
    mutations,
    actions
});