<template>
  <canvas
    width="1200"
    height="800"
    class="canvas-map"
    ref="map"
    @click="onClick"
    @mousemove="onMouseMove"
    :class="{ 'hover-movement': hoverMovement, 'hover-attack': hoverAttack }"
  ></canvas>
</template>

<script>
import _ from "lodash";
import { mapState } from "vuex";
import collisionMixin from "@/mixins/collisionMixin";
import actionMixin from "@/mixins/actionMixin";
import drawMixin from "@/mixins/drawMixin";
import { socket } from "@/service/socket";

const MOVE_MODE = "move";
const ATTACK_MODE = "attack";

export default {
  name: "Map",
  mixins: [collisionMixin, actionMixin, drawMixin],
  data: () => ({
    context: null,
    players: [],
    currentPlayer: null,
    tiles: [],
    walls: [],
    possibleAttackWalls: [],
    possibleAttackUnits: [],
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
    },
    hoverMovement: false,
    hoverAttack: false,
    animationCoord: {}
  }),
  computed: {
    ...mapState(["isMyTurn", "actionMode"]),
    myUnits() {
      return this.units.filter(unit => unit.playerId === this.currentPlayer.id);
    },
    opponentUnits() {
      return this.units.filter(unit => unit.playerId !== this.currentPlayer.id);
    },
    possibleMovementTiles() {
      return this.tiles.filter(tile => tile.movementPossible);
    },
    possibleAttackTiles() {
      return this.tiles.filter(tile => tile.attackPossible);
    },
    possibleTiles() {
      if (this.actionMode === MOVE_MODE) {
        return this.possibleMovementTiles;
      }
      if (this.actionMode === ATTACK_MODE) {
        return this.possibleAttackTiles;
      }

      return false;
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
    actionMode() {
      if (this.actionMode === MOVE_MODE && this.selectedUnit)
        this.getPossibleMovements(this.tiles);
      if (this.actionMode === ATTACK_MODE && this.selectedUnit) {
        this.getPossibleAttacks(this.tiles);
        this.possibleAttackWalls = this.getPossibleAttackWalls(this.walls);
        this.possibleAttackUnits = this.getPossibleAttackUnits(
          this.opponentUnits
        );
      }

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
      if (this.actionMode === MOVE_MODE) this.getPossibleMovements(this.tiles);
      if (this.actionMode === ATTACK_MODE) this.getPossibleAttacks(this.tiles);
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
    },
    setTilesToDefault() {
      this.tiles.forEach(tile => {
        tile.movementPossible = false;
        tile.attackPossible = false;
      });
    },
    onClick(e) {
      const unitSelected = this.collides(this.myUnits, e.offsetX, e.offsetY);

      if (unitSelected) {
        socket.emit("selectUnit", unitSelected.id);
      } else {
        if (this.actionMode === MOVE_MODE) this.onClickMoveMode(e);
        if (this.actionMode === ATTACK_MODE) this.onClickAttackMode(e);
      }
    },
    onClickMoveMode(e) {
      let wallSelected = this.collides(this.walls, e.offsetX, e.offsetY);
      if (wallSelected) return true;

      const tile = this.collides(this.possibleTiles, e.offsetX, e.offsetY);

      if (tile && this.canDoAnAction) {
        this.moveUnitToTile(tile);
      }

      this.redraw();
    },
    onClickAttackMode(e) {
      const attackWall = this.collides(
        this.possibleAttackWalls,
        e.offsetX,
        e.offsetY
      );

      if (attackWall && this.canDoAnAction) {
        this.animationCoord = {
          startX: attackWall.x,
          startY: attackWall.y,
          endX: attackWall.x - 20,
          endY: attackWall.y - 20,
          frame: 0
        };
        requestAnimationFrame(this.attackAnimation);
        attackWall.x = -40;
      }

      const attackOpponent = this.collides(
        this.possibleAttackUnits,
        e.offsetX,
        e.offsetY
      );

      if (attackOpponent && this.canDoAnAction) {
        this.animationCoord = {
          startX: attackOpponent.x,
          startY: attackOpponent.y,
          endX: attackOpponent.x - 20,
          endY: attackOpponent.y - 20,
          frame: 0
        };
        requestAnimationFrame(this.attackAnimation);
      }
      this.getPossibleAttacks(this.tiles);

      this.redraw();
    },
    moveUnitToTile(tile) {
      socket.emit("moveUnit", this.selectedUnit.id, tile.x, tile.y);
    },
    onMouseMove: _.throttle(function(e) {
      const unit = this.collides(this.units, e.offsetX, e.offsetY);

      this.units.forEach(unit => (unit.hovered = false));
      if (unit) {
        unit.hovered = true;
      }

      if (this.actionMode === MOVE_MODE) this.mouseHoverMoveMode(e);
      if (this.actionMode === ATTACK_MODE) this.mouseHoverAttackMode(e);

      this.redraw();
    }, 50),
    mouseHoverMoveMode(e) {
      this.hoverMovement = false;
      if (this.canDoAnAction) {
        const tile = this.collides(this.possibleTiles, e.offsetX, e.offsetY);

        this.possibleTiles.forEach(tile => (tile.hovered = false));
        if (tile) {
          this.hoverMovement = true;
          tile.hovered = true;
        }
      }
    },
    mouseHoverAttackMode(e) {
      this.hoverAttack = false;

      if (this.canDoAnAction) {
        const attackWall = this.collides(
          this.possibleAttackWalls,
          e.offsetX,
          e.offsetY
        );

        const attackUnits = this.collides(
          this.possibleAttackUnits,
          e.offsetX,
          e.offsetY
        );

        if (attackWall || attackUnits) {
          this.hoverAttack = true;
        }
      }
    },
    attackAnimation() {
      this.redraw();
      this.context.strokeStyle = "#fff";
      this.context.lineWidth = 5;
      this.context.beginPath();
      this.context.moveTo(this.animationCoord.endX, this.animationCoord.endY);
      this.context.lineTo(
        this.animationCoord.startX,
        this.animationCoord.startY
      );
      this.context.stroke();

      this.animationCoord.frame++;

      if (this.animationCoord.frame > 5) {
        this.animationCoord.startX += 3;
        this.animationCoord.startY += 3;
        this.animationCoord.endX += 4;
        this.animationCoord.endY += 4;
      }

      if (this.animationCoord.endX >= this.animationCoord.startX) {
        cancelAnimationFrame(this.attackAnimation);
        this.redraw();
        return;
      }

      requestAnimationFrame(this.attackAnimation);
    }
  }
};
</script>

<style lang="scss" scoped>
.canvas-map {
  background-color: grey;

  &.hover-movement {
    cursor: pointer;
  }

  &.hover-attack {
    cursor: crosshair;
  }
}
</style>
