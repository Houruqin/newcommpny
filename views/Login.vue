<template>
    <div class="login-bg">
        <div class="login-logo pt-80"><img :src="logo"></div>
        <div class="login-content pt-60">
            <div class="login-box fc-f">
                <h3 class="t-a-c">手机登录</h3>
                <div class="phone-input input-box d-f bgc-f b-radius f-a-c">
                    <i class="phone-icon"></i>
                    <input type="text" maxlength="11" class="fc-9" v-model.trim="phone" placeholder="手机号" id="iphone">
                </div>
                <div class="verification-input d-f">
                    <div class="input-box d-f bgc-f f-a-c b-radius">
                        <i class="pwd-icon"></i>
                        <input type="text" class="fc-9" v-model.trim="verificationCode" placeholder="验证码" id="code">
                    </div>
                    <span class="flex1 t-a-c cursor-pointer b-radius fs-14" :class="{'sending': codeTime != 0}" @click="sendCode">{{ -1 === codeTime ? '发送中...' : 0 === codeTime ? '获取验证码' : codeTime + '秒重发' }}</span>
                </div>
                <p :class="{'active': checked}" class="save-account fs-14 p-r cursor-pointer" @click="checked = !checked">自动登录</p>
                <p class="login-btn b-radius t-a-c fs-17 cursor-pointer" @click="onLogin">立即登录</p>
            </div>
            <!-- <ul class="footer d-f f-j-b">
                <li class="t-a-c fc-f fs-13 cursor-pointer" :class="{'active': item.type == footerIndex}" v-for="(item, index) in footer" :key="index" @click="footerIndex = item.type">{{item.name}}</li>
            </ul> -->
        </div>
    </div>
</template>

<script>

import Logo from '../images/common/logo.png'
import cache from '../script/cache'

export default {
    name: 'Login',
    data() {
        return{
            logo: Logo,
            phone: this.$$cache.get('phone') || '',
            verificationCode: '',
            footer: [
                {name: '申请试用', type: '0'},
                {name: '官网', type: '1'},
                {name: '帮助与反馈', type: '2'}
            ],
            checked: true,
            codeTime: 0,  //验证码倒计时
            footerIndex: 0
        }
    },
    methods: {
        //发送验证码
        async sendCode() {
            if(!this.$$tools.validate('phone', this.phone.trim())) return 0;
            if(this.codeTime != 0) return 0;
            this.codeTime = -1;

            let result = await this.$$request.post('/auth/smsSend', {
                mobile: this.phone.trim(),
                type: 'login'
            });

            this.codeTime = 60;
            if(result) {
                let timer = setInterval(() => {this.codeTime <= 0 ? clearInterval(timer) : this.codeTime--}, 1000);
            }else {
                this.codeTime = 0;
            }
        },
        //登录
        async onLogin() {

            if(!this.$$tools.validate('phone', this.phone.trim())) return 0;

            if(!this.$$tools.validate('code', this.verificationCode.trim())) return 0;

            let result = await this.$$request.post('/auth/login', {
                mobile: this.phone.trim(),
                sms_code: this.verificationCode.trim()
            });

            console.log(result);

            if(!result) return 0;

            this.$$cache.removeMemberInfo();    //request拦截器统一做了token处理，已经保存过一次值，登录重新赋值

            if(this.checked) {
                this.$$cache.set('isRemember', true);
                this.$$cache.set('TOKEN', result.token);
            }else {
                this.$$cache.set('isRemember', false);
                this.$$cache.setSession('TOKEN', result.token);
            }
            this.$$cache.setMemberInfo(result.user);

            this.isSchoolArea();
        },
        //登录成功，判断是否有校区
        async isSchoolArea() {
            let result = await this.$$request.post('/school/exists');
            console.log(result)
            if(!result) return 0;

            if(!result.status) {
                this.$router.push({path: '/addschool'});
                this.$store.dispatch('guideChange', true);   //首次创建校区，进入引导页
            }else {
                this.$router.replace({path: '/home'});
            }

            this.$$cache.set('phone',this.phone.trim())
        }
    },
    // beforeRouteEnter(to, from, next) {
    //     next(vm => {
    //         if(cache.get('TOKEN') || cache.getSession('TOKEN')) vm.$router.replace('home/workbench');
    //     });
    // },
    mounted() {
        document.onkeydown = event  => {
            let e = event  || window.event;
            if(e && e.keyCode === 13) {
                let focusDom = document.activeElement.id;
                if(focusDom == 'iphone' || focusDom == 'code') this.onLogin();
            }
        }
        this.$store.dispatch('guideChange', false);
    },
    beforeDestroy() {
        document.onkeydown = null;
    }
}
</script>

<style lang="less" scoped>
    .login-bg {
        width: 100%;
        height: 100%;
        min-width: 800px;
        min-height: 940px;
        background: url(../images/common/login-bg.png) no-repeat;
        background-size: cover;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        zoom: 1;
        background-position: center 0;
    }
    .login-logo {
        width: 120px;
        margin: 0 auto;
    }
    .login-content {
        width: 800px;
        margin: 0 auto;
    }
    .login-box {
        margin: 0 auto;
        width: 375px;
        height: 425px;
        background: rgba(255, 255, 255, 0.3);
        h3 {
            padding: 40px 0 50px 0;
            font-weight: normal;
            font-size: 17px;
        }
        button {
            width: 100%;
            margin-top: 20px;
        }
        .save-account {
            margin: 25px 30px 0;
            padding-left: 20px;
            &::before {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                left: 0;
                top: 2px;
                background: url(../images/login/check_not.png) no-repeat;
                background-size: 100%;
            }
            &.active {
                &::before {
                    background: url(../images/login/check.png) no-repeat;
                }
            }
        }
        .login-btn {
            margin: 40px 30px 0;
            background-color: #45DAD5;
            line-height: 50px;
        }

    }
    .footer {
        margin: 0 auto;
        margin-top: 160px;
        width: 375px;
        li {
            line-height: 38px;
            width: 110px;
            &.active {
                border: 1px #45DAD5 solid;
                border-radius: 3px;
                color: #45DAD5;
            }
        }
    }
    .input-box {
        height: 45px;
        i {
            width: 24px;
            height: 24px;
            background-size: 100%;
            margin-left: 10px;
        }
    }
    input {
        border: none;
        width: 100%;
        padding: 0;
        margin: 0;
        padding-left: 5px;
    }
    .phone-input {
        margin: 0 30px 35px;
    }
    .verification-input {
        margin: 0 30px;
        .input-box {
            width: 195px;
        }
        span {
            background-color: #FFBD49;
            margin-left: 10px;
            line-height: 45px;
            &.sending {
                background-color: #e3e3e3;
                color: #999;
            }
        }
    }
    .phone-icon {
        background: url(../images/login/phone.png) no-repeat;
    }
    .pwd-icon {
        background: url(../images/login/verification.png) no-repeat;
    }
</style>


