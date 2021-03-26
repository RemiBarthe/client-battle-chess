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

    <p class="player-turn" v-if="playerTurn">
      C'est au tour de {{ playerTurn.pseudo }}
    </p>

    <Map />

    <ActionBar />
  </div>
</template>

<script>
import { mapState } from "vuex";
import Map from "@/components/Map.vue";
import { socket } from "@/service/socket";
import ActionBar from "@/components/ActionBar.vue";

export default {
  name: "BattleRoom",
  components: {
    Map,
    ActionBar
  },
  data: () => ({
    socket: {},
    playerTurn: null
  }),
  computed: {
    ...mapState(["players"])
  },
  mounted() {
    socket.on("playerTurn", data => {
      this.playerTurn = data;

      this.$store.dispatch("setPlayerTurn", this.playerTurn);
    });
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

  .players-pseudo {
    width: 80%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 22px;
    margin-bottom: 10px;
  }

  .player-turn {
    color: white;
    font-size: 22px;
    position: absolute;
    top: 15px;
  }
}
</style>