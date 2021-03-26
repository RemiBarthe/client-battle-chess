<template>
  <div class="action-bar">
    <div class="infos">{{ selectedUnit }}</div>

    <!-- mettre des icons pour les actions -->
    <div class="actions" v-if="isMyTurn">
      <div class="action">Se déplacer</div>
      <div class="action">Attaquer</div>
      <div class="action" @click="skipTurn()">Passer son tour</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { socket } from "@/service/socket";

export default {
  name: "ActionBar",
  data: () => ({
    socket: {},
    turn: ""
  }),
  computed: {
    ...mapState(["selectedUnit", "players", "currentPlayer", "isMyTurn"])
  },
  methods: {
    skipTurn() {
      let opponent;

      this.players.forEach(player => {
        if (player.id !== this.currentPlayer.id) {
          opponent = player;
        }
      });

      socket.emit("playerTurn", opponent);
    }
  }
};
</script>

<style lang="scss" scoped>
.action-bar {
  width: 800px;
  height: 60px;
  margin-top: 15px;
  background-color: #223;
  border: solid 2px #112;
  display: flex;
  user-select: none;

  .infos {
    width: 500px;
    color: white;
  }

  .actions {
    display: flex;

    .action {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      color: white;
      text-align: center;
      padding: 5px;
      border-left: 1px solid rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.03);
      }

      &:active {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>