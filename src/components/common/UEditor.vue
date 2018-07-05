<template>
  <div id="ueditor">
    <script id="container" type="text/plain" style="width:100%;height:100%;min-height:500px;"></script>
  </div>
</template>

<script>
import "../../../static/UE/ueditor.config";
import "../../../static/UE/ueditor.all";
import "../../../static/UE/lang/zh-cn/zh-cn";
export default {
  name: "UEditor",
  data() {
    return {
      ue: null
    };
  },
  methods: {
    get_content() {
      return this.ue.getContent();
    },
    get_content_length() {
      return this.ue.getPlainTxt().replace(/\s+/g, "").length;
    }
  },
  mounted() {
    this.ue = UE.getEditor("container", {
      BaseUrl: "",
      UEDITOR_HOME_URL: "static/UE/",
    //   serverUrl: "api/ueditor/server"
    });
  },
  //编辑器实例只渲染一次 路由跳转后回到该页面编辑器内容显示空白  所以必须在组件销毁前销毁编辑器实例
  beforeDestroy() {
    UE.delEditor("container");
  }
};
</script>
<style lang="less" scoped>
#ueditor {
  width: 100%;
  min-height: 500px;
}
</style>
