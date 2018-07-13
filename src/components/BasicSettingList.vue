<template>
    <div class="basic-list d-f f-a-c" :class="{'bgc-m': (+index)%2 != 0}">
        <a class="flex1">{{list.name}}</a>
        <i class="t-a-c cursor-pointer" @click="modifyClick"><img src="../images/common/modify-icon.png"></i>
        <i class="t-a-c cursor-pointer" @click="deleteClick"><img src="../images/common/delete-icon.png"></i>
    </div>
</template>

<script>
export default {
    props: ['list', 'index'],
    data() {
        return {}
    },
    methods: {
        modifyClick() {

        },
        deleteClick() {

        }
    }
}
</script>

<style lang="less" scoped>
    .basic-list {
        height: 50px;
        padding: 0 50px;
        i {
            width: 50px;
        }
    }
</style>


