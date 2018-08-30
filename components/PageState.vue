<template lang="pug">
</template>


<script>
export default {
    props: ['state'],
    data () {
        return {
            fullpath: this.$route.path
        }
    },
    methods: {
        loaded () {
            this.$store.commit('stateChange', { state: 'loaded', title: this.$route.meta.title });
        }
    },
    watch: {
        state (v) {
            if (this.$route.path === this.fullpath && 'loaded' === v) {
                this.loaded();
            }
        }
    },
}
</script>
