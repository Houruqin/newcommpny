
import Vuex from 'vuex';
import Vue from 'vue';
import Request from '../script/request'

Vue.use(Vuex);

const state = { 
    guide: false, advisor: [], source: [], course: [], grade: [], listen_grade: [], status: []
};

const mutations = {
    //引导页改变
    guideChange(state, type) {
        state.guide = type;
    },
    async getAdvisor(state) {
        let result = await Request.post('api/user/normalLists', {type: 'seller'});
        console.log(result)
        if(!result) return 0;

        state.advisor = result.lists;
    },
    async geySource(state) {
        let result = await Request.post('api/source/lists');
        console.log(result)
        if(!result) return 0;

        state.source = result.lists;
    },
    async geyCourse(state) {
        let result = await Request.post('api/course/normalLists');
        console.log(result)
        if(!result) return 0;

        state.course = result.lists;
    },
    async getGrade(state) {
        let result = await Request.post('api/eduCount/gradeLists',{is_listen: 0});
        if(!result) return 0;
        state.grade = result.grades;
    },
    async getListenGrade(state) {
        let result = await Request.post('api/eduCount/gradeLists',{is_listen: 1});
        if(!result) return 0;
        state.listen_grade = result.grades;
    },
    async getStatus(state) {
        let result = await Request.post('api/eduCount/listenStatus');
        if(!result) return 0;
        state.status = result.status;
    }
};

const actions = {
    guideChange(context, type) {
        context.commit('guideChange', type);
    },

    getAdvisor(context) {
        context.commit('getAdvisor');
    },

    geySource(context) {
        context.commit('geySource');
    },
    
    geyCourse(context) {
        context.commit('geyCourse');
    },
    
    getGrade(context) {
        context.commit('getGrade');
    },
    
    getListenGrade(context) {
        context.commit('getListenGrade');
    },
    
    getStatus(context) {
        context.commit('getStatus');
    }
};


export default  new Vuex.Store({
    state,
    mutations,
    actions
});