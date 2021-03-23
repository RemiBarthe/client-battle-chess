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
import io from "socket.io-client";
import collisionMixin from "@/mixins/collisionMixin";

export default {
  name: "Map",
  mixins: [collisionMixin],
  data: () => ({
    socket: {},
    context: null,
    currentId: "",
    tiles: [],
    walls: [],
    units: [],
    tileRowCount: 20,
    tileColumnCount: 30,
    selectedUnit: null,
    myUnits: []
  }),
  computed: {
    possibleTiles() {
      return this.tiles.filter(tile => tile.movementPossible);
    }
  },
  created() {
    this.socket = io("http://localhost:3000");
  },
  mounted() {
    this.socket.on("walls", data => {
      this.walls = data;
    });

    this.socket.on("currentId", data => {
      this.currentId = data;
      this.$store.dispatch("setCurrentId", data);
    });

    this.socket.on("players", data => {
      this.$store.dispatch("setPlayers", data);
    });

    this.socket.on("units", data => {
      this.units = data;
      this.redraw();
    });

    this.socket.on("selectedUnit", data => {
      this.selectedUnit = data;
      this.getPossibleMovements(this.tiles);
    });

    this.context = this.$refs.map.getContext("2d");
    this.drawMap();
    this.redraw();
  },
  methods: {
    drawMap() {
      let id = 0;
      for (let c = 0; c < this.tileColumnCount; c++) {
        for (let r = 0; r < this.tileRowCount; r++) {
          const tileW = 40;
          const tileH = 40;
          const tileX = c * tileW;
          const tileY = r * tileH;

          this.tiles.push({
            x: tileX,
            y: tileY,
            w: tileW,
            h: tileH,
            id: id++,
            hovered: false,
            movementPossible: false
          });
        }
      }
    },
    drawTiles() {
      this.tiles.forEach(tile => {
        this.context.fillStyle = "#eee";
        this.context.strokeStyle = "rgba(0,0,0,0.1)";
        this.context.lineWidth = 1;

        if (tile.movementPossible) {
          this.context.fillStyle = "#008C8F";
        }
        if (tile.hovered) {
          this.context.fillStyle = "orange";
        }
        if (tile.isWall) {
          this.context.fillStyle = "black";
        }
        this.context.fillRect(tile.x, tile.y, tile.w, tile.h);
        this.context.strokeRect(tile.x, tile.y, tile.w, tile.h);
      });
    },
    drawUnits() {
      this.units.forEach(unit => {
        this.context.fillStyle = unit.color;
        this.context.lineWidth = 8;
        this.context.strokeStyle = "transparent";

        if (unit.hovered) this.context.strokeStyle = "#008C8F";

        if (unit.selected) this.context.strokeStyle = "orange";

        this.context.strokeRect(unit.x, unit.y, unit.w, unit.h);
        this.context.fillRect(unit.x, unit.y, unit.w, unit.h);
      });
    },
    drawWalls() {
      this.walls.forEach(wall => {
        this.context.fillStyle = "#999";
        this.context.fillRect(wall.x, wall.y, wall.w, wall.h);
      });
    },
    drawUnitMovement(unit) {
      this.context.strokeStyle = "transparent";
      this.context.lineWidth = 1;
      this.context.beginPath();
      const circleX = unit.x + unit.w / 2;
      const circleY = unit.y + unit.h / 2;
      this.context.arc(circleX, circleY, unit.movement, 0, 2 * Math.PI, false);
      this.context.stroke();
    },
    redraw() {
      this.context.clearRect(0, 0, this.$refs.map.width, this.$refs.map.height);
      this.drawTiles();
      this.drawUnits();
      this.drawWalls();
      if (this.selectedUnit) this.drawUnitMovement(this.selectedUnit);
    },
    getPossibleMovements(rects) {
      rects.forEach(rect => {
        const collisionX = rect.x - this.selectedUnit.x;
        const collisionY = rect.y - this.selectedUnit.y;
        rect.movementPossible = false;
        if (
          this.selectedUnit.movement >=
          Math.sqrt(collisionX * collisionX + collisionY * collisionY)
        ) {
          const unitX = this.selectedUnit.x + this.selectedUnit.w / 2;
          const unitY = this.selectedUnit.y + this.selectedUnit.h / 2;

          const tileX = rect.x + rect.w / 2;
          const tileY = rect.y + rect.h / 2;
          let collisionWall = false;

          this.walls.every(wall => {
            collisionWall = this.lineRect(
              unitX,
              unitY,
              tileX,
              tileY,
              wall.x + 0.5,
              wall.y + 0.5,
              wall.w - 1,
              wall.h - 1
            );
            if (collisionWall) return false;
            else return true;
          });

          if (!collisionWall) rect.movementPossible = true;
        }
      });
    },
    onClick(e) {
      const wallSelected = this.collides(this.walls, e.offsetX, e.offsetY);
      if (wallSelected) return true;

      const unitSelected = this.collides(this.units, e.offsetX, e.offsetY);

      if (unitSelected) {
        if (unitSelected.playerId === this.currentId) {
          this.selectUnit(unitSelected);
          this.getPossibleMovements(this.tiles);
        }
      } else {
        const tile = this.collides(this.possibleTiles, e.offsetX, e.offsetY);

        if (tile && this.selectedUnit) {
          this.moveUnitToTile(tile);
        }
      }

      this.redraw();
    },
    selectUnit(unitSelected) {
      this.units.forEach(unit => {
        unit.selected = false;
        unit.hovered = false;
      });
      this.selectedUnit = unitSelected;
      this.selectedUnit.selected = true;
    },
    onMouseMove: _.throttle(function(e) {
      // Reflexion : Enlever le hover sur les units?
      const unit = this.collides(this.units, e.offsetX, e.offsetY);

      this.units.forEach(unit => (unit.hovered = false));
      if (unit) {
        unit.hovered = true;
      }

      if (this.selectedUnit) {
        const tile = this.collides(this.possibleTiles, e.offsetX, e.offsetY);

        this.possibleTiles.forEach(tile => (tile.hovered = false));
        if (tile) {
          tile.hovered = true;
        }
      }
      this.redraw();
    }, 50),
    moveUnitToTile(tile) {
      this.socket.emit("moveUnit", this.selectedUnit.id, tile.x, tile.y);
    }
  }
};
</script>

<style lang="scss" scoped>
.canvas-map {
  background-color: grey;
}
</style>
