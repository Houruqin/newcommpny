<template>
    <div class="home-bg bgc-m">
        <div class="aside-box">
            <div class="home-menu-box">
                <div class="logo d-f f-d-c f-a-c">
                    <a><img src="../images/common/haizi@2x.png"/></a>
                    <div class="select">
                        <div v-if="schoolLists.length > 1">
                            <el-dropdown trigger="click" @visible-change="schoolSelectShow" @command="schoolChange">
                                <div class="el-dropdown-link">
                                    <div class="school-title d-f f-j-b f-a-c cursor-pointer" :class="{'active': schoolSelect}">
                                        <span class="flex1">{{schoolTitle}}</span>
                                        <i class="el-icon-arrow-down el-icon--right" :class="{'active': schoolSelect}"></i>
                                    </div>
                                </div>
                                <el-dropdown-menu slot="dropdown" class="school-options">
                                    <el-scrollbar style="height: 100%;">
                                        <el-dropdown-item
                                            :title="item.name"
                                            v-for="(item, index) in schoolLists" 
                                            :command="item.id" :key="index" :class="{'active': item.id == schoolId}">
                                            <div class="t-o-e">{{item.name}}</div>
                                        </el-dropdown-item>
                                    </el-scrollbar>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                        <div v-else class="t-a-c t-o-e cursor-pointer" :title="schoolLists.length > 0 ? schoolLists[0].name : ''">{{schoolLists.length > 0 ? schoolLists[0].name : ''}}</div>
                    </div>
                </div>
                <Menu></Menu>
            </div>
        </div>
        <el-container class="content-right">
            <el-header class="header">
                <div class="d-f f-a-c header-box bgc-f">
                    <div class="flex1"></div>
                    <div class="d-f f-a-c pr-50">
                        <a class="ml-30"><img src="../images/common/service-icon.png"></a>

                        <el-dropdown trigger="click" @command="helpHandleCommand" @visible-change="helpShowHandle" class="help-dropdown">
                            <a class="cursor-pointer user-box p-r fc-5 el-dropdown-link pl-10" :class="{'rotate': helpShow}">在线帮助</a>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="helpCenter" class="d-f f-a-c">
                                    <i class="help-icon"></i>
                                    <span class="pl-5">帮助中心</span>
                                </el-dropdown-item>
                                <el-dropdown-item command="lineQQ" class="d-f f-a-c">
                                    <i class="qq-icon"></i>
                                    <span class="pl-5">在线客服</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>

                        <a class="avatar-box ml-50"><img :src="memberInfo.type ? role[memberInfo.type] : role.master" alt=""></a>

                        <el-dropdown trigger="click" @command="settingHandleCommand" @visible-change="settingShowHandle">
                            <a class="cursor-pointer user-box p-r fc-5 el-dropdown-link pl-10" :class="{'rotate': settingShow}">你好，{{memberInfo.name}}</a>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="schoolsetting" v-if="memberInfo.type == 'institution'"><span>校区设置</span></el-dropdown-item>
                                <el-dropdown-item command="loginOut"><span>安全退出</span></el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </div>
                <div class="border-bottom"></div>
            </el-header>
            <el-container class="home-main-box">
                <!-- <keep-alive><router-view v-if="$route.meta.keepAlive"></router-view></keep-alive>  v-if="!$route.meta.keepAlive"-->
                <router-view></router-view>
            </el-container>
        </el-container>

        <div class="guide-box" :class="{'guide-end': guideSetup > 5}" v-if="$store.state.guide">
            <div v-if="guideSetup > 5" class="p-r">
                <img src="../images/guide/done.png" alt="">
                <div class="guide-end-btn p-a btn-m fc-f t-a-c cursor-pointer" @click="guideEnd">立即使用</div>
            </div>

            <div class="p-r" v-else>
                <div class="left-tab p-a">
                    <div class="pl-20 tab-title">
                        <i class="iconfont" :class="guideData[guideSetup - 1].icon"></i><span class="fs-16 pl-10">{{guideData[guideSetup - 1].text}}</span>
                    </div>
                </div>
                <div class="bg-img p-a">
                    <div class="right p-a fc-f">
                        <p class="p1 d-f f-a-c f-j-c"><span>新手第</span><span class="step fs-16 t-a-c btn-m">{{guideSetup}}</span><span>步</span></p>
                        <template v-if="guideSetup === 1">
                            <p class="mt-15 p2 t-a-c">在基础设置里面<span class="fc-m pl-10 pr-10">"添加教室"</span>和</p>
                            <p class="p2 mt-5 pl-40"><span class="fc-m pr-10">"渠道来源"</span>哦~</p>
                        </template>

                        <template v-if="guideSetup === 2">
                            <p class="mt-15 p2 t-a-c">在员工管理里面<span class="fc-m pl-10 pr-10">"添加员工信息"</span></p>
                        </template>

                        <template v-if="guideSetup === 3">
                            <p class="mt-15 p2 t-a-c">在课程管理里面<span class="fc-m pl-10 pr-10">"添加课程"</span>以及</p>
                            <p class="p2 mt-5 pl-40"><span class="fc-m pr-10">"添加课程下的班级"</span></p>
                        </template>

                        <template v-if="guideSetup === 4">
                            <p class="mt-15 p2 t-a-c">在学员管理里面<span class="fc-m pl-10 pr-10">"登记学员-购课"</span>或者</p>
                            <p class="p2 mt-5 pl-10"><span class="fc-m pr-10">"导入未签约学员"</span>和<span class="fc-m pl-10 pr-10">"导入已签约学员"</span></p>
                        </template>

                        <template v-if="guideSetup === 5">
                            <p class="mt-15 p2 t-a-c">在排课管理里面给班级<span class="fc-m pl-10 pr-10">"批量排课"</span>，也可</p>
                            <p class="p2 mt-5 pl-5">以在课表处添加<span class="fc-m pl-10 pr-10">"单节排课"</span>哦~</p>
                        </template>
                        <div class="d-f f-j-c mt-30"><div class="next-step btn-m fc-f t-a-c cursor-pointer" @click="nextStepHandle">下一步</div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import Menu from '../components/Menus';
import bossIcon from '../images/common/boss-icon.png'
import masterIcon from '../images/common/master-icon.png'
import registerIcon from '../images/common/register-icon.png'
import Bus from '../script/bus'

export default {
    data() {
        return {
            settingShow: false,
            helpShow: false,
            schoolId: '',
            schoolSelect: false,    //默认校区不选择
            schoolTitle: '',   //校区title
            role: {
                master: masterIcon, 
                register: registerIcon,
                institution: bossIcon,
                seller: registerIcon
            },
            memberInfo: {},
            schoolLists: [],
            modalObj: null,   //遮罩层modal
            guideSetup: 1,   //引导页步骤
            guideData: [
                {icon: 'icon-set', text: '基础设置', dom: 'mymenu-5'},
                {icon: 'icon-yuangongguanli', text: '员工管理', dom: 'mymenu-4'},
                {icon: 'icon-kechengbiao', text: '课程管理', dom: 'mymenu-3'},
                {icon: 'icon-xueyuanguanli', text: '学员管理', dom: 'mymenu-1'},
                {icon: 'icon-kebiao', text: '排课管理', dom: 'mymenu-2'}
            ]
        }
    },
    methods: {
        //在线帮助下拉
        helpHandleCommand(val) {
            if(val == 'lineQQ') return window.open("http://wpa.qq.com/msgrd?v=3&uin=3266315153&site=qq&menu=yes");
            if(val == 'helpCenter') return window.open("http://csdoc.jiaoyf.com/");
        },
        //设置下拉
        settingHandleCommand(val) {
            if(val == 'user') return 0;
            if(val == 'schoolsetting') return this.$router.push({path: '/home/workbench/schoolsetting'});
            if(val == 'loginOut') this.loginOut();
        },
        //校区切换
        schoolChange(val) {
            if(val == this.schoolId) return 0;

            this.$confirm('确定切换校区吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.loginCheckOut(val);
            }).catch(() => {return 0});
        },
        //退出登录
        async loginOut() {
            let result = await this.$$request.post('api/auth/logout');
            console.log(result);
            if(!result) return 0;
            this.$$cache.loginOut();
            this.$message('已退出登录！');
        },
        schoolSelectShow(type) {
            this.schoolSelect = type;
        },
        //切换校区，切换登录
        async loginCheckOut(school_id) {
            let result = await this.$$request.post('api/auth/checkLogin', {school_id: school_id});
            console.log(result);
            if(!result) return 0;
            this.schoolId = school_id;
            this.getSchoolName();

            // this.$$cache.set('TOKEN', result.token);
            // this.$$cache.setSession('TOKEN', result.token);
            // this.memberInfo = result.user;
            // this.$$cache.setMemberInfo(result.user);
            this.$router.replace({path: '/refresh'});   //刷新工作台路由
        },
        getSchoolName() {
            console.log(this.schoolLists)
            this.schoolLists.forEach(v => {if(v.id == this.schoolId) this.schoolTitle = v.name});
        },
        //获取校区列表
        async getSchoolLists() {
            this.memberInfo = this.$$cache.getMemberInfo();
            console.log(this.memberInfo)
            this.schoolId = this.memberInfo.school_id;

            let result = await this.$$request.post('api/user/schoolLists');
            console.log(result)
            if(!result) return 0;
            this.schoolLists = result.lists;
            this.getSchoolName();
        },
        helpShowHandle(isShow) {
            this.helpShow = isShow;
        },
        settingShowHandle(isShow) {
            this.settingShow = isShow;
        },
        nextStepHandle() {
            if(this.guideSetup > 5) return 0;
            this.guideSetup = this.guideSetup +1;
            this.mymenuPosition();
        },
        showModal() {
            this.modalObj = document.createElement('div');
            this.modalObj.classList = 'v-modal'; this.modalObj.style.zIndex = '5000';
            document.body.appendChild(this.modalObj);
            document.body.style.overflow = 'hidden';
            this.mymenuPosition();
        },
        //计算引导tab位置
        mymenuPosition() {
            if(this.guideSetup > 5) return 0;
            let mymenu = document.querySelector(`.${this.guideData[this.guideSetup-1].dom}`);
            document.querySelector('.guide-box').style.top = `${mymenu.offsetTop + mymenu.clientHeight}px`;
        },
        //引导结束
        guideEnd() {
            this.guideSetup = 0;
            document.body.removeChild(this.modalObj);
            this.$store.dispatch('guideChange', false);
            document.body.removeAttribute('style');
            this.$router.replace({path: '/refresh'});   //刷新工作台路由
        }
    },
    mounted() {
        if(this.$store.state.guide) this.showModal();
    },
    created() {
        this.getSchoolLists();
        Bus.$on('refreshSchoolLists', () => {this.getSchoolLists()});
    },
    beforeDestroy() {
        Bus.$off('refreshSchoolLists');
    },
    components: {Menu}
}
</script>

<style lang="less" scoped>
    .home-bg {
        min-width: 1900px;
        min-height: 100%;
    }
    .aside-box {
        background-color: #223243;
        color: #7F9CB9;
        width: 230px;
        height: 100%;
        position: fixed;
        z-index: 1000;
        overflow: hidden;
    }
    .home-menu-box {
        padding-top: 20px;
        height: 100%;
        width: 247px;   //滚动条只有17px宽
        overflow-y: auto;
        overflow-x: hidden;
    }
    .logo {
        padding-top: 50px;
        width: 230px;
        a {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
        }
        .select {
            width: 195px;
            margin-top: 20px;
            .el-dropdown {
                width: 100%;
                color: #7F9CB9;
            }
            .school-title {
                border: 1px #7f9cb9 solid;
                height: 30px;
                padding: 0 15px;
                span {
                    overflow: hidden;
                    white-space: nowrap;
                }
                &.active {
                    color: #45DAD5;
                    border-color: #45DAD5;
                }
                .el-icon-arrow-down {
                    -webkit-transition: transform 300ms;
                    transition: transform 300ms;
                    &.active {
                        -webkit-transform :rotate(180deg);
                        transform: rotate(180deg);
                    }
                }
            }
        }
    }
    .content-right {
        padding-left: 230px;
        padding-top: 90px;
        .header {
            width: 100%;
            height: auto !important;
            padding: 0;
            position: fixed;
            z-index: 800;
            top: 0;
            left: 0;
            .header-box {
                height: 70px;
            }
            .border-bottom {
                width: 100%;
                height: 20px;
                background-color: #F3F3F3;
            }
            .avatar-box {
                border-radius: 50%;
                width: 40px;
                height: 40px;
                overflow: hidden;
                img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: block;
                }
            }
            .user-box {
                &::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 0;
                    top: 5px;
                    margin-left: 5px;
                    border-left: 6px solid transparent; 
                    border-right: 6px solid transparent; 
                    border-top: 10px solid #9B9B9B;
                    -webkit-transition: transform 300ms;
                    transition: transform 300ms;
                }
                &.rotate {
                    &::after {
                        -webkit-transform :rotate(180deg);
                        transform: rotate(180deg);
                    }
                }
            }
        }
        .home-main-box {
            padding: 0 50px 20px 20px;
            min-width: 1300px;
            min-height: 842px;
        }
    }   
    .guide-box {
        position: fixed;
        z-index: 6000;
        left: 0;
        // top: 600px;
        &.guide-end {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .left-tab {
            width: 230px;
            height: 58px;
            background-color: #2A3C50;
            color: #45DAD5;
            left: 0;
            top: 164px;
            .tab-title {
                border-right: 5px #45DAD5 solid;
                height: 100%;
                line-height: 58px;
            }
        }
        .bg-img {
            width: 585px;
            height: 228px;
            background: url(../images/guide/guide-icon.png) no-repeat;
            background-size: 100%;
            left: 170px;
            top: -5px;
            .right {
                width: 350px;
                right: 13px;
                top: 50%;
                transform: translateY(-50%);
                .p1 {
                    font-size: 26px;
                }
                .p2 {
                    font-size: 18px;
                }
                .step {
                    width: 25px;
                    height: 25px;
                    line-height: 25px;
                    border-radius: 50%;
                    font-weight: bold;
                    margin: 0 5px;
                }
                .next-step {
                    width: 70px;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 5px;
                }
            }
        }
        .guide-end {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .guide-end-btn {
            top: 0;
            left: 0;
            border-radius: 5px;
            height: 30px;
            line-height: 30px;
            width: 80px;
            left: 50%;
            top: 140px;
            margin-left: -27px;
            transform: translate(-50%);
        }
    }
</style>


