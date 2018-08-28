<template>
    
</template>

<script>
export default {
    data() {
        return {}
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.$router.replace('home/workbench');
        })
    }
}
</script>
