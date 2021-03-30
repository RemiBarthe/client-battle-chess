<template>
  <canvas
    width="1200"
    height="800"
    class="canvas-map"
    ref="map"
    @click="onClick"
    @mousemove="onMouseMove"
  ></canvas>
</template>

<script>
import _ from "lodash";
import { mapState } from "vuex";
import collisionMixin from "@/mixins/collisionMixin";
import actionMixin from "@/mixins/actionMixin";
import drawMixin from "@/mixins/drawMixin";
import { socket } from "@/service/socket";

export default {
  name: "Map",
  mixins: [collisionMixin, actionMixin, drawMixin],
  data: () => ({
    context: null,
    players: [],
    currentPlayer: null,
    tiles: [],
    walls: [],
    units: [],
    tileRowCount: 20,
    tileColumnCount: 30,
    selectedUnit: null,
    opponentSelectedUnit: null,
    colors: {
      tiles: "#eee",
      movementPossible: "#ccc",
      attackPossible: "#eaa",
      walls: "#666",
      hoverUnit: "#ccc",
      lifeBar: "red",
      actionPoint: "#39E11E",
      actionPointBorder: "#49b822"
    }
  }),
  computed: {
    ...mapState(["isMyTurn", "unitsMode"]),
    possibleTiles() {
      return this.tiles.filter(tile => tile.movementPossible);
    },
    selectedIsMine() {
      if (this.selectedUnit) {
        return this.selectedUnit.playerId === this.currentPlayer.id;
      }
      return false;
    },
    canDoAnAction() {
      if (this.selectedUnit) {
        return (
          this.selectedUnit.actionPoint > 0 &&
          this.selectedIsMine &&
          this.isMyTurn
        );
      }
      return false;
    }
  },
  watch: {
    unitsMode() {
      if (this.unitsMode === "move") this.getPossibleMovements(this.tiles);
      if (this.unitsMode === "attack") this.getPossibleAttacks(this.tiles);

      this.redraw();
    }
  },
  mounted() {
    socket.on("walls", data => {
      this.walls = data;
    });

    socket.on("currentPlayer", data => {
      this.currentPlayer = data;
      this.$store.dispatch("setCurrentPlayer", this.currentPlayer);
    });

    socket.on("players", data => {
      this.players = data;
      this.$store.dispatch("setPlayers", this.players);
    });

    socket.on("units", data => {
      this.units = data;
      this.redraw();
    });

    socket.on("selectedUnit", data => {
      this.selectedUnit = data;
      this.$store.dispatch("setSelectedUnit", this.selectedUnit);
      if (this.unitsMode === "move") this.getPossibleMovements(this.tiles);
      if (this.unitsMode === "attack") this.getPossibleAttacks(this.tiles);
    });

    socket.on("opponentSelectedUnit", data => {
      this.opponentSelectedUnit = data;

      if (this.selectedUnit) {
        if (this.selectedUnit.id === data.id) this.selectedUnit = data;
        this.getPossibleMovements(this.tiles);
      }
    });

    this.context = this.$refs.map.getContext("2d");
    this.drawMap();
    this.redraw();
  },
  methods: {
    redraw() {
      this.context.clearRect(0, 0, this.$refs.map.width, this.$refs.map.height);
      this.drawTiles();
      this.drawWalls();
      this.drawUnits();
      this.drawLifeBar();
      this.drawActionPoint();
      if (this.selectedUnit) this.drawUnitMovement(this.selectedUnit);
    },
    setTilesToDefault() {
      this.tiles.forEach(tile => {
        tile.movementPossible = false;
        tile.attackPossible = false;
      });
    },
    onClick(e) {
      const wallSelected = this.collides(this.walls, e.offsetX, e.offsetY);
      if (wallSelected) return true;

      const unitSelected = this.collides(this.units, e.offsetX, e.offsetY);

      if (unitSelected && this.currentPlayer) {
        socket.emit("selectUnit", unitSelected.id);
      } else {
        const tile = this.collides(this.possibleTiles, e.offsetX, e.offsetY);

        if (tile && this.canDoAnAction) {
          this.moveUnitToTile(tile);
        }
      }

      this.redraw();
    },
    onMouseMove: _.throttle(function(e) {
      // Reflexion : Enlever le hover sur les units?
      const unit = this.collides(this.units, e.offsetX, e.offsetY);

      this.units.forEach(unit => (unit.hovered = false));
      if (unit) {
        unit.hovered = true;
      }

      if (this.canDoAnAction) {
        const tile = this.collides(this.possibleTiles, e.offsetX, e.offsetY);

        this.possibleTiles.forEach(tile => (tile.hovered = false));
        if (tile) {
          tile.hovered = true;
        }
      }
      this.redraw();
    }, 50),
    moveUnitToTile(tile) {
      socket.emit("moveUnit", this.selectedUnit.id, tile.x, tile.y);
    }
  }
};
</script>

<style lang="scss" scoped>
.canvas-map {
  background-color: grey;
}
</style>
