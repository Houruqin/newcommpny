<template>
    <el-dialog :title="mode + formLabel" width="500px" center :visible.sync="show" append-to-body :close-on-click-modal="false" @close="dialogClose">
        <el-form :model="formInfo" label-width="100px" size="small" :rules="formRules" ref="customForm" @submit.native.prevent>
            <div class="form-box">
                <el-form-item :label="label+':'" prop="value">
                    <el-input v-model.trim="formInfo.value" :placeholder="formLabel"></el-input>
                </el-form-item>
                <div class="d-f f-j-c mt-40">
                    <MyButton @click.native="doneHandle()" :loading="submitLoading">确定</MyButton>
                </div>
            </div>
        </el-form>
    </el-dialog>
</template>
<script>
import MyButton from "../common/MyButton";

export default {
  props: {
    visible: {default: false},
    type: {default: "add"},
    label: {default: ""},
  },
  data() {
    return {
      submitLoading: false,
      show: this.visible,
      mode: '添加',
      formLabel: this.label,
      formInfo: {
        value: ""
      },
      formRules: {
        value: [
          { required: true, message: "请输入跟进名称" },
          { max: 10, message: "长度不能超过10个字符" }
        ]
      }
    };
  },
  methods: {
    dialogClose(obj) {
      this.$emit("close",obj);
    },
    doneHandle() {
      this.$refs.customForm.validate(valid => {
        if (valid) {
          this.submitCourse();
        }
      });
    },
    async submitCourse() {
      const params = {
        reason: this.formInfo.value
      };
      let result = await this.$$request.post("/uncommittedReason/add", params);
      if (!result) return false;
      this.$message.success(`${this.mode}成功`);
      this.dialogClose(result);
    }
  },
  watch: {
    visible: function(v) {
      this.show = v;
      this.$refs.customForm.resetFields();
      if(this.type === 'add') this.formInfo.value = "";
    },
    label: function(v) {
      this.formLabel = v;
    },
    type: function(v) {
      this.mode = v === 'add' ? '添加' : '修改';
    }
  },
  components: { MyButton }
};
</script>
<style lang="less" scoped>
</style>
