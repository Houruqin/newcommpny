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
              <el-checkbox v-model="all_checked" @change="checkAll">全选</el-checkbox>
              <el-checkbox-group v-model="checked" @change="check">
                <el-checkbox v-for="auth in department_lists" :key="auth.departmentId" :label="auth.roleList">{{auth.departmentName}}</el-checkbox>
              </el-checkbox-group>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="1.5"> 被通知角色：　</el-col>
            <el-col :span="22">
              <span v-if="role_lists.length>0" v-for="(role,index) in role_lists" :key="role.id" class="person">
                {{role.cn_name}}
                <i @click="del_role(index)" class='el-icon-circle-close del'></i>
              </span>
              <span class="person" v-if="role_lists.length<1">无</span>
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
import TableHeader from "../../components/common/TableHeader";
import UEditor from "../../components/common/UEditor";

export default {
  data() {
    return {
      state: "loading",
      title: "",
      all_checked: false,
      department_lists: [],
      role_lists: [],
      checked: [],
    };
  },
  methods: {
    //全选
    checkAll(val) {
      let all_lists = [];
      for(let i=0;i<this.department_lists.length;i++){
        all_lists.push(this.department_lists[i].roleList)
      }
      this.checked = val ? all_lists : [];
      this.get_role(this.checked)
    },
    //单选
    check(value) {
      this.all_checked = value.length === this.department_lists.length;
      this.get_role(value)
    },
    //获取被通知部门列表
    async get_notice_person() {
      let res = await this.$$request.get("/notification/fill");

      if (!res) {
        return false;
      }
      this.department_lists = res;
      return true;
    },
    //获取角色列表
    get_role(role_arr) {
      let res = [];
      for (let i = 0; i < role_arr.length; i++) {
        res.push(...role_arr[i]);
      }
      this.role_lists = res;
    },
    //删除角色
    del_role(i) {
      this.role_lists.splice(i,1);
    },
    //发布通知
    async publish() {
      if (this.title.length < 1) {
        this.$message.warning("请输入标题");

        return false;
      } else if (this.$refs.ueditor.get_content_length() < 1) {
        this.$message.warning("请输入通知内容");

        return false;
      } else if (this.$refs.ueditor.get_content_text_length() > 10000) {
        this.$message.warning("内容已超过最大限制，请删减部分内容");

        return false;
      } else if (this.role_lists.length < 1) {
        this.$message.warning("请选择被通知角色");

        return false;
      }

      let roles_id = [];

      for (let role of this.role_lists) {
        roles_id.push(role.id);
      }

      const params = {
        title: this.title,
        content: this.$refs.ueditor.get_content(),
        receivers: roles_id
      };

      let res = await this.$$request.post("/notification/send", params);

      if (!res) {
        return false;
      }

      this.$message.success("已发送");
      this.$router.replace({ path: "/" });
    }
  },
  async created() {
    let res = await this.get_notice_person();

    if (!res) {
      return false;
    }
    this.state = "loaded";
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
