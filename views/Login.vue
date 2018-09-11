<template lang="pug">
  .login-box
    PageState(:state="state")
    .login-bg
      .login-box-inner
        p 欢迎登录
        div.login-input
          div.input-box.phone-input
            input(placeholder="请输入手机号码" v-model="phone" @keydown.enter="onLogin")
        div.login-input
          div.input-box.check-code.d-f
            input(placeholder="请输入验证码" v-model="verificationCode" @keydown.enter="onLogin")
            span.code-btn(@click="sendCode") {{ -1 === codeTime ? '发送中...' : 0 === codeTime ? '获取验证码' : codeTime + '秒重发' }}
        .remmber-me(:class="{ active: checked }" @click="checked = !checked") #[i]记住账号
        .login-btn(@click="onLogin" :class="{ loading: loginState }") {{ loginState ? '登录中...' : '立即登录' }}
      .login-inner-footer #[span(@click="footerClick('www')") 官网]#[span(@click="footerClick('use')") 申请试用]#[span(@click="footerClick('help')") 帮助]
    .login-footer
</template>

<script>
import config from 'config';

export default {
  data () {
    return {
      state: 'loading',
      loginState: false,
      phone: this.$$cache.get('phone') || '',
      verificationCode: '',
      checked: true,
      codeTime: 0
    };
  },
  methods: {
    async sendCode() {
      if(!this.$$tools.validate('phone', this.phone.trim())) return 0;
      if(this.codeTime != 0) return 0;
      this.codeTime = -1;

      let result = await this.$$request.post('/auth/smsSend', { mobile: this.phone.trim(), type: 'login' });

      this.codeTime = 60;
      if(result) {
          let timer = setInterval(() => {this.codeTime <= 0 ? clearInterval(timer) : this.codeTime--}, 1000);
      }else {
          this.codeTime = 0;
      }
    },
    async onLogin() {

      if (this.loginState) {
        return void 0;
      }

      if(!this.$$tools.validate('phone', this.phone.trim())) return 0;

      if(!this.$$tools.validate('code', this.verificationCode.trim())) return 0;

      this.loginState = true;

      let result = await this.$$request.post('/auth/login', {
        mobile: this.phone.trim(),
        sms_code: this.verificationCode.trim()
      });

      this.loginState = false;

      if(!result) return 0;

      this.$store.state.isOutOfLine = false;

      this.$store.dispatch('guideChange', result.user.is_boot);   //判断用户是否需要进入引导页

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
    async isSchoolArea() {
      let result = await this.$$request.post('/school/exists');

      if(!result) return 0;

      if(!result.status) {
        this.$router.push({path: '/addschool'});
      }else {
        this.$router.replace({path: '/'});
      }

      this.$$cache.set('phone',this.phone.trim())
    },
    footerClick(type) {
      if(type === 'www' ) return window.open(config.www);
      if(type === 'use' ) return window.open(`${config.www}apply.html`);
      if(type === 'help') return window.open(`${location.protocol}//${location.host}/help`);
    }
  },
  mounted () {
    this.state = 'loaded';
  }
}
</script>


<style lang="less" scoped>
@log-top: 140px;
.login-box {
  background: #ffffff;
  position: absolute;
  width: 100%;
  min-height: 100%;
}
.login-footer {
  position: absolute;
  width: 100%;
  height: 358px;
  bottom: 0;
  left: 0;
  background: url(../images/login/footer-bg.png) no-repeat center center;
}
.login-bg {
  position: relative;
  z-index: 1;
  width: 1300px;
  height: 885px;
  margin: auto;
  overflow: hidden;
  background:
    url(../images/login/logo.png) no-repeat center 140px,
    url(../images/login/icon-1.png) no-repeat right 0,
    url(../images/login/icon-2.png) no-repeat 1150px 394px,
    url(../images/login/icon-3.png) no-repeat 203px 188px,
    url(../images/login/icon-4.png) no-repeat 50px 377px,
    url(../images/login/icon-5.png) no-repeat 380px 267px,
    url(../images/login/icon-6.png) no-repeat 940px 283px,
    url(../images/login/icon-7.png) no-repeat 140px 538px,
    url(../images/login/icon-8.png) no-repeat 150px 723px,
    url(../images/login/icon-9.png) no-repeat 1120px 602px;
}
.login-box-inner {
  width: 405px;
  height: 441px;
  box-shadow: 0px 8px 24px -5px rgba(69, 218, 213, 0.6);
  margin: @log-top + 120px + 64px auto 0;
  background: #fff;
  p {
    font-size: 24px;
    color: #45dad5;
    text-align: center;
    padding-top: 60px;
    padding-bottom: 24px;
  }
}
.login-input {
  width: 282px;
  height: 48px;
  display: flex;
  margin: auto;
  border-radius: 24px;
  border: 1px solid #e3e3e3;
  overflow: hidden;
  margin-top: 28px;
  align-items: center;
  box-sizing: border-box;
  padding: 0 20px;
  input {
    outline: none;
    border: none;
    font-size: 14px;
    color: #999;
  }
  .code-btn {
    width: 90px;
    text-align: center;
    border-left: 1px solid #fd965d;
    color: #fd965d;
    cursor: pointer;
  }
  .input-box {
    position: relative;
    padding-left: 30px;
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
    }
    &.phone-input {
      &::before {
        background: url(../images/login/phone.png) no-repeat;
        background-size: cover;
      }
    }
    &.check-code {
      &::before {
        background: url(../images/login/verification.png) no-repeat;
        background-size: cover;
      }
      input {
        width: 120px;
      }
    }
  }
}
.remmber-me {
  box-sizing: border-box;
  width: 282px;
  font-size: 12px;
  color: #999;
  margin: 15px auto 0;
  padding-left: 40px;
  cursor: pointer;
  background: url(../images/login/check-not.png) no-repeat 24px center;
  &.active {
    color: #45dad5;
    background-image: url(../images/login/check.png);
  }
}
.login-btn {
  width: 282px;
  height: 48px;
  display: flex;
  margin: auto;
  border-radius: 24px;
  font-size: 18px;
  color: #fff;
  background: #45dad5;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
  cursor: pointer;
  &.loading {
    background: #a3f3f0;
  }
}
.login-inner-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 85px;
  color: #45dad5;
  font-size: 16px;
  span {
    height: 30px;
    padding: 0 20px;
    border-radius: 15px;
    border: 1px solid #45dad5;
    display: flex;
    align-items: center;
    transition: all 150ms;
    &:not(:last-child) {
      margin-right: 56px;
    }
    &:hover {
      cursor: pointer;
      color: #fff;
      background: #45dad5;
    }
  }
}
</style>
