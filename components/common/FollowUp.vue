<template>
  <div class="d-f followup-lists-item">
      <h5 class="fs-13 fc-9 mt-32">{{$$tools.format(followUpList.created_at, 'second')}}</h5>
      <div class="line p-r"></div>
      <div class="content p-r">
          <div class="title">
            <span class="fc-m">【{{followUpList.type_name}}】</span>
            <span class="fc-7 ml-10">操作人：{{followUpList.user_name}}</span>
          </div>
          <!--学员登记,顾问变更-->
          <div v-if="followUpList.type_id === 1 || followUpList.type_id === 3" class="item">
              <p>跟进顾问：<i>{{followUpList.advisor_name ? followUpList.advisor_name : '无'}}</i></p>
          </div>
          <!--购课-->
          <div v-else-if="followUpList.type_id === 2" class="item">
              <p>购买课程：<i>{{followUpList.course_name}}</i></p>
              <p>业绩归属：<i>{{followUpList.advisor_name}}</i></p>
          </div>
          <!--续约-->
          <div v-else-if="followUpList.type_id === 4" class="item">
              <p>续约课程：<i>{{followUpList.course_name}}</i></p>
              <p>业绩归属：<i>{{followUpList.advisor_name}}</i></p>
          </div>
          <!--售前跟进，售后跟进-->
          <div v-else class="item">
              <p>跟进形式：<i>{{followUpList.way_name}}</i></p>
              <p>
                  跟进结果：<i>{{followUpList.status_name}}</i>
                  <i v-if="followUpList.status === 1 && !!followUpList.reason">
                      （<i>{{followUpList.reason}}</i>）
                  </i>
                  <i v-if="followUpList.status === 2">
                      （<i>{{$$tools.format(followUpList.invited_at, 'second')}}</i>）
                  </i>
                  <i v-if="followUpList.status === 4 && !!followUpList.listen">
                      （<i>{{$$tools.format(followUpList.listen.begin_time, 'second')}}</i>
                      <i class="pl-10">{{followUpList.listen.grade_name}}</i>
                      <i class="pl-10">{{followUpList.listen.teachers.length > 0 ? followUpList.listen.teachers[0].name : ''}}</i>）
                  </i>
              </p>
              <p class="d-f"><span>跟进内容：</span><i class="flex1">{{followUpList.content}}</i></p>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  props: ['list'],
  data () {
    return {};
  },
  computed: {
    followUpList: function() {
      return this.list;
    }
  }
};
</script>

<style lang="less" scoped>
  .followup-lists-item {
      h5 {
          font-weight: normal;
          width: 130px;
      }
      p {
        color: #777;
        i {
          color: #303133;
          word-break: break-all;
        }
      }
      .line {
        width: 1px;
        background-color: #e3e3e3 ;
        &::after {
          content: '';
          display: block;
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #fff;
          border: 1px #e3e3e3 solid;
          border-radius: 50%;
          top: 35px;
          left: 50%;
          transform: translateX(-50%);
        }
      }
      .content {
        padding: 20px;
        margin: 15px 0 15px 25px;
        width: 820px;
        background-color: #F5F5F5;
        .title {
          border-bottom: 1px #e9e9e9  solid;
          padding-bottom: 15px;
        }
        .item {
          font-size: 13px;
          margin-top: 10px;
          p {
            margin-top: 8px;
          }
        }
        &::before {
          content: '';
          display: block;
          position: absolute;
          left: -10px;
          top: 20px;
          width: 0;
          height: 0;
          border-top: 5px solid transparent;
          border-right: 10px solid #F5F5F5;
          border-bottom: 5px solid transparent;
        }
    }
}
</style>


