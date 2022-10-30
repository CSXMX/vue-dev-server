<template>
  <div>
    {{ msg }}
    {{ hello }}
  </div>
</template>

<script>

export default {
  data() {   
    return { 
      msg: 'hello,world',
      hello: 'hello'
    }
  }
} 
</script>

<style scoped>
div {
  color: red;
}
</style>
