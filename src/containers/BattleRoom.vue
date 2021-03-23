<template>
  <div class="room-container">
    <div class="players-pseudo">
      <p
        v-for="(player, index) in players"
        :key="index"
        :style="`color:${player.color}`"
      >
        {{ player.pseudo }}
      </p>
    </div>
    <Map />
    <div class="action-bar"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Map from "@/components/Map.vue";

export default {
  name: "BattleRoom",
  components: {
    Map
  },
  data: () => ({
    socket: {}
  }),
  computed: {
    ...mapState(["players"])
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
    height: 60px;
    margin-top: 15px;
    background-color: #223;
    border: solid 2px #112;
  }

  .players-pseudo {
    width: 80%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 22px;
    margin-bottom: 10px;
  }
}
</style>