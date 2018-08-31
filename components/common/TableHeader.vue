<template>
    <div class="table-header d-f f-a-c f-j-b fc-5">
        <div class="d-f f-a-c">
            <span class="fs-16">{{title}}</span>
            <i v-if="icon" class="iconfont icon-bianji ml-10 cursor-pointer" @click="imgClick"></i>
        </div>
        <div class="d-f" :class="{'flex1': other}"><slot></slot></div>
    </div>
</template>

<script>

export default {
    props: {
        title: {default: ''},
        other: {default: false},
        icon: {default: false}
    },
    data() {
        return {}
    },
    methods: {
        imgClick() {
            this.$emit('clicked');
        }
    }
}
</script>

<style lang="less" scoped>
    .table-header {
        height: 50px;
        border-bottom: 1px #e3e3e3 solid;
        img {
            display: block;
        }
    }
</style>


