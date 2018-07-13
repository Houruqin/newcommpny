<template>
    <div class="my-btn d-f f-a-c f-j-c cursor-pointer" 
    :class="{'b-radius': radius, 'fc-f': fontColor == 'fc-f', 'fc-m': fontColor == 'fc-m', 'border': type == 'border', 'btn-m': type == 'main', 'btn-subm': type == 'subm', 'btn-gray': type == 'gray'}">
        <img class="mr-5" v-if="icon" :src="ImportIcon">
        <span><slot></slot></span>
    </div>
</template>

<script>

import ImportIcon from '../../images/common/import-icon.png'

export default {
    props: {
        type: {default: 'main'},    //main: 绿色背景, subm: 黄色背景, gray: 灰色背景, none: 无背景， border： 边框
        icon: {default: false},    //默认按钮无图标
        fontColor: {default: 'fc-f'},
        radius: {default: true}   //字体颜色，默认白色
    },
    data() {
        return {ImportIcon: ImportIcon}
    }
}
</script>

<style lang="less" scoped>
    .my-btn {
        height: 32px;
        min-width: 94px;
        padding: 0 18px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        &.border {
            border: 1px #45DAD5 solid;
        }
        img {
            margin-right: 5px;
        }
    }
</style>


