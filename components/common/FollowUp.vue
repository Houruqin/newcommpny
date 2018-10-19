<template>
  <div class="d-f followup-lists-item">
      <h5 class="fs-13 fc-9 mt-32">{{$$tools.format(list.created_at, 'second')}}</h5>
      <div class="line p-r"></div>
      <div class="content p-r">
          <div class="title">
            <span class="fc-m">【{{list.type_name}}】</span>
            <span class="fc-7 ml-10">操作人：{{list.user_name}}</span>
          </div>
          <!--学员登记,顾问变更-->
          <div v-if="list.type_id === 1 || list.type_id === 3" class="item">
              <p>跟进顾问：<i>{{list.advisor_name ? list.advisor_name : '无'}}</i></p>
          </div>
          <!--购课-->
          <div v-else-if="list.type_id === 2" class="item">
              <p>购买课程：<i>{{list.course_name}}</i></p>
              <p>业绩归属：<i>{{list.advisor_name}}</i></p>
          </div>
          <!--续约-->
          <div v-else-if="list.type_id === 4" class="item">
              <p>续约课程：<i>{{list.course_name}}</i></p>
              <p>业绩归属：<i>{{list.advisor_name}}</i></p>
          </div>
          <!--售前跟进，售后跟进-->
          <div v-else class="item">
              <p>跟进形式：<i>{{list.way_name}}</i></p>
              <p>
                  跟进结果：<i>{{list.status_name}}</i>
                  <i v-if="list.status === 2">
                      (<i>{{$$tools.format(list.invited_at, 'second')}}</i>)
                  </i>
                  <i v-if="list.status === 4">
                      (<i>{{$$tools.format(list.listen.begin_time, 'second')}}</i>
                      <i class="pl-10">{{list.listen.grade_name}}</i>
                      <i class="pl-10">{{list.listen.teachers.length > 0 ? list.listen.teachers[0].name : ''}}</i>)
                  </i>
              </p>
              <p class="d-f"><span>跟进内容：</span><i class="flex1">{{list.content}}</i></p>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  props: ['list'],
  data () {
    return {

    }
  }
}
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
          color: #000;
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


