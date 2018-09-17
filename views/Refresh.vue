<template>

</template>

<script>
export default {
  data () {
    return {
      url: this.$route.query.url
    };
  },
  mounted () {
    console.log(this.url)
    this.$router.replace(this.url);
  }
};
</script>
