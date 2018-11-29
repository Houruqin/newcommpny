import Vue from 'vue';
import store from '../store/store';
import cache from './cache';
import config from 'config';


const VALIDATE_RULE = {
  number: {reg: /^[0-9]+.?[0-9]*$/, message: '请输入数字'}, //纯数字验证
  phone: {reg: /^(1\d{10})?$/, message: '请输入正确的11位手机号码'}, // 手机号码
  code: {reg: /^\d{4}$/, message: '请输入正确的4位数字验证码'}, // 验证码
  tel: {reg: /(^0\d{2,3}-\d{7,8}(-\d{1,6})?$)|(^1\d{10}$)/, message: '座机格式不对'}, // 座机或者电话
  tel_qq: {reg: /^(\d{5,11})?$/, message: '请输入正确的QQ号'}, // 意见反馈QQ或者电话
  face: {reg: /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/, message: '不能输入表情'} // 不能使用表情
};


// const NUMBER_RULE = {
//     num: {validate: val => {return isNaN(val)}, message: '请输入数字'},
//     positive: {validate: val => {return val < 0}, message: '请输入正数'},
//     float: {validate: val => {return String(val).split('.')[1] && String(val).split('.')[1].length > 2}, message: '最多两位小数'},
//     int: {validate: val => {return String(val).indexOf('.') > -1}, message: '不能输入小数'},
//     price: {validate: val => {return val > 9999}, message: '价格不能超过9999'}
// };

const Tools = {
  // 权限验证
  isAuthority (authority) {

    let permission = [];

    store.state.allMenusData.permission.forEach(v => {
      if (v.type === 'permission') {
        permission.push(v.description);
      }
    });

    if (cache.getMemberInfo().type === 'master' || cache.getMemberInfo().type === 'institution') {
      return true;
    }
    if (authority instanceof Array) {
      return authority.some(v => {return permission.includes(v)});
    }
    return permission.includes(authority);
  },
  // 部门判断
  isDepartment(type) {
    let departmentList = store.state.allMenusData.departmentList;

    console.log(departmentList);

    if (type) {
      return departmentList.length === 1 && departmentList[0].name === type;
    }

    if (cache.getMemberInfo().type === 'master' || cache.getMemberInfo().type === 'institution') {
      return true;
    }

    return departmentList.some(v => v.name === 'academic_department' || v.name === 'marketing_department' || v.name === 'education_department' || v.name === 'functions_department');

    // let res = store.state.allMenusData.departmentList.find(v => {
    //   return v.name === type
    // });
    // return !!res;
  },
  getAdvisorLists () {
    if (!this.isAuthority('viewAllData') && this.isDepartment('consulting_department')) {
      return store.state.personaladvisor;
    } else {
      return store.state.advisor;
    }
  },
  //表单验证
  formValidate (type) {
    return (rule, value, callback) => {
      if (!VALIDATE_RULE[type].reg.test(value)) {
        return callback(new Error(VALIDATE_RULE[type].message));
      }

      return callback();
    };
  },

  //表单非正则验证
  formOtherValidate (type, num) {
    return (rule, value, callback) => {
      //小数验证
      if (type === 'decimals') {
        if (isNaN(value)) {
          return callback(new Error('请输入数字'));
        } else if (value < 0) {
          return callback(new Error('不能为负数'));
        } else if (String(value).split('.')[1] && String(value).split('.')[1].length > num) {
          return callback(new Error(`最多${num}位小数`));
        }

        return callback();
      }

      //整数验证
      if (type === 'int') {
        if (isNaN(value)) {
          return callback(new Error('请输入数字'));
        } else if (value < 1) {
          return callback(new Error('数值最小为1'));
        } else if (String(value).indexOf('.') > -1) {
          return callback(new Error('不能输入小数'));
        }

        return callback();
      }

      //数值验证
      if (type === 'total') {
        if (value > num) {
          return callback(new Error(`数值不能大于${num}`));
        }

        return callback();
      }

      //课时验证
      if (type === 'lesson_num') {
        if (isNaN(value)) {
          return callback(new Error('请输入数字'));
        } else if (value < 0) {
          return callback(new Error('不能为负数'));
        } else if (String(value).indexOf('.') > -1) {
          return callback(new Error('不能输入小数'));
        }

        return callback();
      }
    };
  },

  /**
     * 时间格式化
     * @param {time} //秒数
	 * @param {time} //秒数
     */
  format (time, type = 'day') {
    if ('number' !== typeof +time) {
      throw '时间格式不对！';
    }

    let createData = new Date(time * 1000);
    let dayData = [createData.getFullYear(), createData.getMonth() + 1, createData.getDate()].join('-').replace(/\b\d\b/g, '0$&');
    let secondData = [createData.getHours(), createData.getMinutes()].join(':').replace(/\b\d\b/g, '0$&');

    if (type === 'second') {
      dayData = `${dayData}　${secondData}`;
    }
    if (type === 'hours') {
      return secondData;
    }

    return dayData;
  },

  //普通验证，返回值
  validate (type, value) {
    if (!value) {
      Vue.prototype.$message.warning(VALIDATE_RULE[type].message);

      return false;
    }
    if (!VALIDATE_RULE[type].reg.test(value)) {
      Vue.prototype.$message.warning(VALIDATE_RULE[type].message);

      return false;
    }

    return true;
  },

  formatTime (time, type = 'minute') {
    if ('number' !== typeof +time) {
      throw '时间格式不对！';
    }
    let createData = new Date(time * 1000), newDate = '';
    let weekLists = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    if (type === 'minute') {
      newDate = [createData.getHours(), createData.getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
    } else if (type === 'day') {
      newDate = [createData.getMonth() + 1, createData.getDate()].join('-').replace(/\b\d\b/g, '0$&');
    } else if (type === 'week') {
      newDate = weekLists[createData.getDay()];
    }

    return newDate;
  },

  //上课时间，课表时间格式转换
  courseTime (time1, time2, type = 'day') {
    let date1 = new Date(time1 * 1000), date2 = new Date(time2 * 1000);

    let day = [date1.getMonth() + 1, date1.getDate()].join('-').replace(/\b\d\b/g, '0$&');
    let weekLists = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    let week = weekLists[date1.getDay()];

    let begin = [date1.getHours(), date1.getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
    let end = [date2.getHours(), date2.getMinutes()].join(':').replace(/\b\d\b/g, '0$&');

    // if(type === 'timetable') return `${week}  ${begin}-${end}`;
    if (type == 'time') {
      return `${begin}-${end}`;
    }
    if (type == 'day') {
      return `${day}(${week})`;
    }

    return `${begin}-${end}`;
  },

  getImgUrl (url) {
    let newUrl = /^http/.test(url) ? url : config.imgUrl + url;
    return newUrl;
  }
};

export default Vue.prototype.$$tools = Tools;