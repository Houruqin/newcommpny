<template> 
    <div class="table-header d-f f-a-c f-j-b fc-5">
        <div class="d-f">
            <span class="fs-16">{{title}}</span>
            <div v-if="icon" class="ml-10 d-f f-a-c f-j-c cursor-pointer" @click="imgClick"><img :src="modifyIcon"></div>
        </div>
        <div class="d-f"><slot></slot></div>
    </div>
</template>

<script>
import modifyIcon from '../../images/common/edit-icon.png'

export default {
    props: {
        title: {default: ''},
        icon: {default: false}
    },
    data() {
        return {modifyIcon: modifyIcon}
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


