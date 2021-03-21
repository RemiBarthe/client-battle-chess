<template>
  <BattleRoom />
</template>

<script>
import BattleRoom from "./containers/BattleRoom.vue";

export default {
  name: "App",
  components: {
    BattleRoom
  }
};
</script>

<style>
* {
  margin: 0;
}

#app {
  width: 100vw;
  height: 100vh;
}
</style>