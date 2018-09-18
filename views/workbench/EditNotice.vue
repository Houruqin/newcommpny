<template>
  <div class="content flex1">
    <PageState :state="state" />
    <el-row :gutter="20" class="card-box">
      <el-col :span="24">
        <el-card class="edit_content" shadow="hover">
          <TableHeader title="发通知"></TableHeader>
          <el-row>
            <el-col :span="1.5"> 通知标题：　　</el-col>
            <el-col :span="8">
              <el-input v-model="title"></el-input>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="1.5"> 通知正文：　　</el-col>
            <el-col :span="21" class="ueditor_content">
              <UEditor ref="ueditor"></UEditor>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="1.5"> 通知部门：　　</el-col>
            <el-col :span="22">
              <el-checkbox v-model="all_authority" @change="checkAll">全选</el-checkbox>
              <el-checkbox-group v-model="authority" @change="check">
                <el-checkbox v-for="auth in auth_options" :key="auth" :label="auth">{{auth}}</el-checkbox>
              </el-checkbox-group>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="1.5"> 被通知人：　</el-col>
            <el-col :span="22">
              <span v-if="notice_person.length>0" v-for="(person,index) in show_notice_person" :key="person.id" class="person">
                {{person.name}}
                <i @click="del_person(index)" class='el-icon-circle-close del'></i>
              </span>
              <span class="person" v-if="notice_person.length<1">无</span>
            </el-col>
          </el-row>
          <el-row>
            <el-button @click.native="publish">发布</el-button>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import TableHeader from '../../components/common/TableHeader';
import UEditor from '../../components/common/UEditor';

export default {
  data () {
    return {
      state: 'loading',
      title: '',
      all_authority: false,
      authority: [],
      auth_options: ['校长', '老师', '教务', '顾问', '销售主管', '教务主管', '学术主管'],
      notice_person: [],
      show_notice_person: [],
      master_lists: [], //校长
      teacher_lists: [], //老师
      seller_lists: [], //顾问
      educate_lists: [], //教务
      director_lists: [], //销售主管
      dean_lists: [], //教务主管
      academic_lists: [], //教务主管
      all_lists: []
    };
  },
  created () {
    console.log(11111);
  },
  methods: {
    checkAll (val) {
      console.log(val);
      this.authority = val ? this.auth_options : [];
      this.notice_person = val ? this.all_lists : [];
      this.get_not_repeat_notice_person(this.notice_person);
    },
    check (value) {
      console.log(value);
      this.notice_person = [];
      for (let auth of value) {
        switch (auth) {
          case '校长':
            this.notice_person.push(...this.master_lists);
            break;
          case '老师':
            this.notice_person.push(...this.teacher_lists);
            break;
          case '教务':
            this.notice_person.push(...this.educate_lists);
            break;
          case '顾问':
            this.notice_person.push(...this.seller_lists);
            break;
          case '销售主管':
            this.notice_person.push(...this.director_lists);
            break;
          case '教务主管':
            this.notice_person.push(...this.dean_lists);
            break;
          case '学术主管':
            this.notice_person.push(...this.academic_lists);
            break;
        }
      }
      console.log(this.notice_person);
      this.get_not_repeat_notice_person(this.notice_person);
      let checkedCount = value.length;

      this.all_authority = checkedCount === this.auth_options.length;
    },
    get_not_repeat_notice_person (arr) {
      console.log(arr)
      let hash = {};

      arr = arr.reduce((item, next) => {
        hash[next.mobile] ? '' : hash[next.mobile] = true && item.push(next);

        return item;
      }, []);
      this.show_notice_person = arr;
    },
    async get_notice_person () {
      let res = await this.$$request.get('/notification/fill');

      console.log(res);
      if (!res) {
        return false;
      }
      this.master_lists = [...res.master];
      this.teacher_lists = [...res.teacher];
      this.seller_lists = [...res.seller];
      this.educate_lists = [...res.register];
      this.director_lists = [...res.director];
      this.dean_lists = [...res.dean];
      this.academic_lists = [...res.academic];
      this.all_lists = [
        ...this.master_lists,
        ...this.teacher_lists,
        ...this.seller_lists,
        ...this.educate_lists,
        ...this.director_lists,
        ...this.dean_lists,
        ...this.academic_lists
      ];

      return true;
    },
    del_person (i) {
      // console.log(i);
      let del_mobile = this.show_notice_person[i].mobile;
      // console.log(this.show_notice_person[i])

      for (let i = 0; i < this.notice_person.length; i++) {
        if (this.notice_person[i].mobile === del_mobile) {
          this.notice_person.splice(i, 1);
        }
      }
      this.show_notice_person.splice(i, 1);
    },
    publish () {
      console.log(this.$refs.ueditor.get_content_text_length());
      if (this.title.length < 1) {
        this.$message.warning('请输入标题');

        return false;
      } else if (this.$refs.ueditor.get_content_length() < 1) {
        this.$message.warning('请输入通知内容');

        return false;
      } else if (this.$refs.ueditor.get_content_text_length() > 10000) {
        this.$message.warning('内容已超过最大限制，请删减部分内容');

        return false;
      } else if (this.notice_person.length < 1) {
        this.$message.warning('请选择被通知人');

        return false;
      }

      let persons_id = [];

      for (let person of this.notice_person) {
        persons_id.push(person.id);
      }

      const params = {
        title: this.title,
        content: this.$refs.ueditor.get_content(),
        receivers: persons_id
      };

      this.$$request.post('/notification/send', params).then(res => {
        this.$message.success('已发送');
        this.$router.replace({ path: '/' });
      });
    }
  },
  async created () {
    let res = await this.get_notice_person();

    console.log(res);
    if (!res) {
      return false;
    }
    this.state = 'loaded';
  },

  components: {
    TableHeader,
    UEditor
  }
};
</script>

<style lang="less" scoped>
.content /deep/ {
  width: 100%;
  .el-row {
    // min-height: 250px;
    .el-col {
      height: 100%;
      .el-card {
        height: 100%;
      }
    }
  }
  .el-button {
    padding: 8px 30px;
    background-color: #45dad5;
    outline: none;
    border: none;
    color: #ffffff;
  }
  .card-box {
    margin-top: 20px;
  }
  .edit_content {
    .el-row {
      padding: 30px 20px 10px;
    }
  }
  .ueditor_content {
    min-height: 500px;
    position: relative;
    z-index: 1;
  }
  .person {
    display: inline-block;
    padding: 0 5px;
    margin-left: 10px;
  }
  .del {
    color: #f56c6c;
    cursor: pointer;
  }
}
</style>
