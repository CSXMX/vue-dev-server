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
      msg: 'Hello w3orld12!',
      hello: '21'
    }
  }
} 
</script>

<style scoped>
div {
  color: red;
}
</style>
