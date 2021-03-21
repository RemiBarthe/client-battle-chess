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

export default {
  name: "Map",
  data: () => ({
    context: null,
    tiles: [],
    walls: [
      {
        x: 200,
        y: 80,
        w: 40,
        h: 40,
        id: 0
      },
      {
        x: 200,
        y: 120,
        w: 40,
        h: 40,
        id: 1
      },
      {
        x: 200,
        y: 160,
        w: 40,
        h: 40,
        id: 2
      }
    ],
    units: [
      {
        x: 40,
        y: 80,
        w: 40,
        h: 40,
        id: 0,
        selected: false,
        hovered: false,
        movement: 130
      },
      {
        x: 80,
        y: 320,
        w: 40,
        h: 40,
        id: 1,
        selected: false,
        hovered: false,
        movement: 160
      },
      {
        x: 160,
        y: 480,
        w: 40,
        h: 40,
        id: 2,
        selected: false,
        hovered: false,
        movement: 100
      }
    ],
    tileRowCount: 20,
    tileColumnCount: 30,
    selectedUnit: null
  }),
  mounted() {
    this.context = this.$refs.map.getContext("2d");
    this.drawMap();
    this.redraw();
  },
  computed: {
    possibleTiles() {
      return this.tiles.filter(tile => tile.movementPossible);
    }
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
        this.context.fillStyle = "#212F45";
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
        this.context.fillStyle = "black";
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
    collides(rects, x, y) {
      let isCollision = false;

      rects.forEach(rect => {
        const left = rect.x,
          right = rect.x + rect.w;
        const top = rect.y,
          bottom = rect.y + rect.h;
        if (right >= x && left <= x && bottom >= y && top <= y) {
          isCollision = rect;
        }
      });
      return isCollision;
    },
    lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
      const uA =
        ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
        ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
      const uB =
        ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
        ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

      if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return true;
      }
      return false;
    },
    lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
      const left = this.lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
      const right = this.lineLine(
        x1,
        y1,
        x2,
        y2,
        rx + rw,
        ry,
        rx + rw,
        ry + rh
      );
      const top = this.lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
      const bottom = this.lineLine(
        x1,
        y1,
        x2,
        y2,
        rx,
        ry + rh,
        rx + rw,
        ry + rh
      );

      if (left || right || top || bottom) {
        return true;
      }
      return false;
    },
    getPossibleMovements(rects) {
      rects.forEach(rect => {
        const collisionX = rect.x - this.selectedUnit.x;
        const collisionY = rect.y - this.selectedUnit.y;
        rect.movementPossible = false;
        if (
          this.selectedUnit.movement >
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
        this.selectUnit(unitSelected);
      } else {
        const tile = this.collides(this.possibleTiles, e.offsetX, e.offsetY);

        if (tile && this.selectedUnit) {
          this.moveUnitToTile(tile);
        }
      }

      if (this.selectedUnit) {
        this.getPossibleMovements(this.tiles);
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
      this.selectedUnit.x = tile.x;
      this.selectedUnit.y = tile.y;
    }
  }
};
</script>

<style lang="scss" scoped>
.canvas-map {
  background-color: grey;
}
</style>
