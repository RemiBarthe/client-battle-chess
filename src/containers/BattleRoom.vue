<template class="test">
  <div class="room-container">
    <Map />
    <div class="action-bar"></div>
  </div>
</template>

<script>
import Map from "@/components/Map.vue";

export default {
  name: "BattleRoom",
  components: {
    Map
  }
};
</script>

<style lang="scss" scoped>
.room-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #444;

  .action-bar {
    width: 800px;
    height: 70px;
    margin-top: 15px;
    background-color: #223;
    border: solid 2px #112;
  }
}
</style>