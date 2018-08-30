<template lang="pug">
  .help-bg: .help-box
    .help-left
      img(src="../images/common/logo.png" width="105" height="130")
      h2 校区运营管理系统
      p #[span 每天5分钟]#[span 管理更轻松]
    .help-right
      h3 登录问题帮助中心
      h4 1. 提示“账号不存在”如何解决？
      p 首先确认您的账号是否输入正确，如果确认，请确认您的账号是否添加到系统。
      h4 2. 提示"验证码错误”如何解决?
      p 请确认您的验证码是否输入正确。
      h4 3. 提示"验证码发送频繁”如何解决?
      p 系统默认一个小时内同一账号可以发送5次验证码，请不要在短时间内进行频繁发送验证码的操作。
      h4 4. 提示"验证码已使用”如何解决?
      p 您输入的验证码为已经登录过的验证码，请输入最新发送的验证码或者新获取验证码。
      h4 5. 提示“验证码发送失败”如何解决?
      p 常规请重新获取验证码再次重试登录， 如果多次出现此类情况，请与客服联系。
      h4 6. 提示“机构账号无法正常使用，过期或禁止如何解决?
      p 出现此类提示，一种情况是机构购买的账号已经到期， 此种情况请及时续费;二是机构账号可能由于违规操作被教优方强行禁止，此种情况请与客服沟通协商。
      h4 7. 提示“账号没有登录权限”如何解决?
      p 您的账号已经被校长禁用，请与校长沟通解决。

</template>

<style lang="less" scoped>
.help-bg {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: url(../images/help-bg.png) no-repeat center center;
}
.help-box {
  width: 1098px;
  height: 736px;
  background: #ffffff;
  display: flex;
  box-shadow: 2px 2px 10px rgba(71, 170, 163, 0.41);
}
.help-left {
  width: 315px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    display: block;
  }
  h2 {
    font-size: 26px;
    color: #666;
    margin-top: 36px;
  }
  p {
    font-size: 18.6px;
    color: #777;
    margin-top: 2px;
    display: flex;
    width: 208px;
    justify-content: space-between;
  }
}
.help-right {
  flex: 1;
  word-break: break-all;
  padding-top: 55px;
  padding-right: 70px;
  h3 {
    font-size: 26px;
    color: #47bbb1;
  }
  h4 {
    margin-top: 30px;
    font-weight: normal;
    color: #333;
    font-size: 16px;
    line-height: 26px;
  }
  p {
    color: #777;
    font-size: 16px;
    line-height: 26px;
  }
}
</style>
