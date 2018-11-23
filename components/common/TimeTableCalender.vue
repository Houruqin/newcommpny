<script>
/**
 * 属性：
 *  v-model： 日期
 *  type: 类型 day/week
 * 事件：
 *  type-change day/week切换 参数：type
 * 方法：
 *  setTips 参数 Array<Date>  设置有小圆点的
 */
const ONE_DAY_TIMES = 24 * 60 * 60 * 1000;

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export default {
  props: {
    value: {
      default() {
        return new Date();
      }
    },
    // 如果type是week，value为本周第一天的时间
    type: { default: "day" }, // week
    showWeek: { default: false },
    tips: {default: []},
    beforeTodayAble: { default: false },

  },
  data() {
    return {
      currentValue: this.value,
      currentType: this.type,
      defaultDate: this.value,
      isShowWeek: this.showWeek,
      isBeforeTodayAble: this.beforeTodayAble
    };
  },
  methods: {
    chooseDate() {
      if ("day" === this.currentType) {
        this.defaultDate = this.currentValue;
        // this.$refs.time.open();
      } else {
        this.currentValue = new Date();
        let week = this.currentValue.getDay() || 7;
        if (1 !== week) {
          this.currentValue = new Date(
            this.currentValue.getTime() - (week - 1) * ONE_DAY_TIMES
          );
        }
        this.$emit("input", this.currentValue);
      }
    },
    typeChange() {
      this.currentValue = new Date();
      if ("day" === this.currentType) {
        this.currentType = "week";
        // 如果不是周的第一天 设置为一周的第一天
        let week = this.currentValue.getDay() || 7;
        if (1 !== week) {
          this.currentValue = new Date(
            this.currentValue.getTime() - (week - 1) * ONE_DAY_TIMES
          );
        }
      } else {
        this.currentType = "day";
      }
      this.$emit("input", this.currentValue);
      this.$emit("type-change", this.currentType);
    },
    goNowClick () {
      this.currentValue = new Date();
    },
    prevClick() {
      if ((this.currentValue.getYear() <= new Date().getYear()) && (this.currentValue.getMonth() <= new Date().getMonth()) && !this.isBeforeTodayAble) return 0;

      if ("day" === this.currentType) {
        let thisMonthLastDate = new Date(
          this.currentValue.getFullYear(),
          this.currentValue.getMonth(),
          0
        ).getDate();
        this.currentValue = new Date(
          this.currentValue.getFullYear(),
          this.currentValue.getMonth() - 1,
          Math.min(thisMonthLastDate, this.currentValue.getDate())
        );
        if (this.currentValue < new Date()) this.currentValue = new Date();
      } else {
        this.currentValue = new Date(
          this.currentValue.getTime() - 7 * ONE_DAY_TIMES
        );
      }
      this.$emit("input", this.currentValue);
    },
    nextClick() {
      if ("day" === this.currentType) {
        let thisMonthLastDate = new Date(
          this.currentValue.getFullYear(),
          this.currentValue.getMonth() + 2,
          0
        ).getDate();
        this.currentValue = new Date(
          this.currentValue.getFullYear(),
          this.currentValue.getMonth() + 1,
          Math.min(thisMonthLastDate, this.currentValue.getDate())
        );
      } else {
        this.currentValue = new Date(
          this.currentValue.getTime() + 7 * ONE_DAY_TIMES
        );
      }
      this.$emit("input", this.currentValue);
    },
    selectDate(time, d, type) {

      if (time < new Date().setHours(0, 0, 0, 0)) return false;

      // if (
      //   d < new Date().getDate() &&
      //   this.isNowMonthOrWeek &&
      //   !this.isBeforeTodayAble
      // )
      //   return false;
      if ("now" === type) {
        this.currentValue = new Date(
          this.currentValue.getFullYear(),
          this.currentValue.getMonth(),
          d
        );
      } else if ("prev" === type) {
        // if (new Date().getMonth() >= this.currentValue.getMonth()) return false;
        this.currentValue = new Date(
          this.currentValue.getFullYear(),
          this.currentValue.getMonth() - 1,
          d
        );
      } else {
        this.currentValue = new Date(
          this.currentValue.getFullYear(),
          this.currentValue.getMonth() + 1,
          d
        );
      }

      this.$emit("input", this.currentValue);
    },
    //确认选择时间
    select(time) {
      this.$emit("input", (this.currentValue = new Date(time)));
    }
  },
  computed: {
    calcTypeName() {
      return "day" === this.currentType ? "月" : "周";
    },
    calcCenterText() {
      if ("day" === this.currentType) {
        return `${this.currentValue.getFullYear()}-${this.currentValue.getMonth() + 1}`;
      } else {
        return "本周";
      }
    },
    // 是否为本月或本周
    isNowMonthOrWeek() {
      let date = new Date();
      if ("day" === this.currentType) {
        return (
          this.currentValue.getMonth() === date.getMonth() &&
          this.currentValue.getFullYear() === date.getFullYear()
        );
      } else {
        let week = date.getDay() || 7;
        if (1 !== week) date = new Date(date - (week - 1) * ONE_DAY_TIMES);
        return (
          this.currentValue.getMonth() === date.getMonth() &&
          this.currentValue.getFullYear() === date.getFullYear() &&
          this.currentValue.getDate() === date.getDate()
        );
      }
    },
    calcData() {
      let data = [];
      let week = new Date(
        this.currentValue.getFullYear(),
        this.currentValue.getMonth(),
        1
      ).getDay();
      let maxDays = new Date(
        this.currentValue.getFullYear(),
        this.currentValue.getMonth() + 1,
        0
      ).getDate();
      // let lastSpace = (week || 7) - 1 + maxDays;
      // lastSpace = Math.ceil(lastSpace / 7) * 7 - lastSpace;
      // console.log(week)
      // console.log(lastSpace)
      let prevLast = new Date(
        this.currentValue.getFullYear(),
        this.currentValue.getMonth(),
        0
      ).getDate();
      for (let i = (week || 7) - 1; i > 0; i--)
        data.push({
          type: "prev",
          date: prevLast - i + 1,
          dateTime: new Date(this.currentValue.getFullYear(), this.currentValue.getMonth() - 1, prevLast - i + 1).getTime()
        });
      for (let i = 1; i <= maxDays; i++)
        data.push({
          type: "now",
          date: i,
          dateTime: new Date(this.currentValue.getFullYear(), this.currentValue.getMonth(), i).getTime()
        });
      for (let i = 0, j = data.length; i < 42 - j ; i++)
        data.push({
          type: "next",
          date: i + 1,
          dateTime: new Date(this.currentValue.getFullYear(), this.currentValue.getMonth() + 1, i + 1).getTime()
        });
      this.$emit("date-change", {start_time: data[0].dateTime, end_time: data[data.length - 1].dateTime});
      return data;
    }
  },
  watch: {
    value(v) {
      this.currentValue = this.defaultDate = v;
    },
    type(v) {
      this.currentValue = v;
    },
    showWeek(v) {
      this.isShowWeek = v;
    },
    beforeTodayAble(v) {
      this.isBeforeTodayAble = v;
    }
  }
};
</script>

<template lang="pug">
.c-time-table-calender
  .c-time-table-calender-header
    .header-show
      .go-now(@click="goNowClick") 今天
      .prev.iconfont.icon-icon--left.fc-m.cursor-pointer.fs-20(@click="prevClick" :class="{disabled: (currentValue.getYear() <= new Date().getYear()) && (currentValue.getMonth() <= new Date().getMonth()) && !isBeforeTodayAble}")
      .header-text.now(:class="{ fill: isNowMonthOrWeek }" @click="chooseDate") {{ calcCenterText }}
      .next.iconfont.fc-m.cursor-pointer.icon-you.fs-20(@click="nextClick")
  .c-time-table-calender-body(v-if="'day' === currentType")
    ul.calender-week
      - for (let i of "一二三四五六日")
        li= '周' + i
    ul.calender-body
      li(v-for="d in calcData"
      :class="{ active: 'now' === d.type && d.date === currentValue.getDate(), 'disable' : (d.date < new Date().getDate() && isNowMonthOrWeek && !isBeforeTodayAble),'not-nowmonth': 'now' !== d.type, tips: tips.includes(d.dateTime / 1000), 'today' : d.date === new Date().getDate() && isNowMonthOrWeek}"
      @click="selectDate(d.dateTime, d.date, d.type)") {{ d.date }}
</template>

<style lang="less" scoped>
  @color-main: #45DAD5; // 主色调
  .c-time-table-calender {
    font-size: 14px;
    // margin-top: 20px;
  }
  .c-time-table-calender-header {
    display: flex;
    height: 48px;
    padding: 0 12px;
    align-items: center;
    .header-show {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      .prev {
        &.disabled {
          color: #e3e3e3;
          cursor: auto;
        }
      }
      .header-text {
        line-height: 26px;
        color: @color-main;
        margin: 0 12px;
      }
      .go-now {
        color: @color-main;
        margin-right: 20px;
        line-height: 26px;
        cursor: pointer;
      }
    }
    .header-btn {
      height: 24px;
      border-radius: 24px;
      padding: 0 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid @color-main;
      color: @color-main;
      &:active {
        background: #edfffe;
      }
      &.fill {
        background: @color-main;
        color: #fff;
      }
      &.orange {
        color: #febfa9;
        border-color: #febfa9;
        &:active {
          background: #fff5f1;
        }
      }
    }
  }
  .c-time-table-calender-body {
    border: 1px #e3e3e3 solid;
    .calender-week {
      display: flex;
      align-items: center;
      background-color: #F1F1F1;
      li {
        flex: 1;
        text-align: center;
        height: 40px;
        line-height: 40px;
        color: #7c7c7c;
      }
    }
    .calender-body {
      &::after {
        content: "";
        display: block;
        clear: both;
      }
      li {
        width: 50px;
        font-size: 14px;
        height: 40px;
        // border: 1px #e3e3e3 solid;
        position: relative;
        cursor: pointer;
        color: #373737;
        display: flex;
        align-items: center;
        justify-content: center;
        float: left;
        &:hover {
          background-color: #f2f2f2;
        }
        &.not-nowmonth {
          color: #c0c4cc;
        }
        &.disable {
          color: #c0c4cc;
        }
        &.today {
          color: @color-main;
          border: none;
        }
        &.active {
          background: @color-main;
          color: #fff;
        }
        &.tips {
          position: relative;
          &::after {
            position: absolute;
            content: "";
            width: 5px;
            height: 5px;
            background: @color-main;
            border-radius: 5px;
            left: 50%;
            bottom: 5px;
            transform: translateX(-50%);
          }
        }
      }
    }
  }
</style>
