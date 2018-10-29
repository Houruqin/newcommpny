<template>
  <div>
    <div>
      <span v-if="$$tools.isAuthority('studentDetail')" class="fc-m cursor-pointer" @click="detail">
        <slot></slot>
      </span>
      <span v-else>
        <slot></slot>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    id: { type: Number, default: () => 0 },
    type: { type: String, default: () => "sign" }
  },
  methods: {
    detail() {
      let url =
        this.type === "sign"
          ? "/student/signeddetail"
          : "/student/nosigndetail";
      let query =
        this.type === "sign" ? { id: this.id } : { student_id: this.id };
      let router_config = {
        path: url,
        query: query
      };

      this.$router.push(router_config);
    }
  }
};
</script>
