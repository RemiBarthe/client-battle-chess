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
    units: [
      { x: 40, y: 80, w: 40, h: 40, id: 0, selected: false, hovered: false },
      { x: 80, y: 320, w: 40, h: 40, id: 1, selected: false, hovered: false },
      { x: 160, y: 480, w: 40, h: 40, id: 2, selected: false, hovered: false }
    ],
    tileRowCount: 20,
    tileColumnCount: 30,
    tileWidth: 40,
    tileHeight: 40,
    selectedUnit: null,
    hoveredTile: null
  }),
  mounted() {
    this.context = this.$refs.map.getContext("2d");
    this.drawMap();
    this.redraw();
  },
  methods: {
    drawMap() {
      this.tiles = [];
      let id = 0;
      for (let c = 0; c < this.tileColumnCount; c++) {
        for (let r = 0; r < this.tileRowCount; r++) {
          const tileX = c * this.tileWidth;
          const tileY = r * this.tileHeight;

          this.tiles.push({
            x: tileX,
            y: tileY,
            w: this.tileWidth,
            h: this.tileHeight,
            id: id++,
            hovered: false
          });
        }
      }
    },
    drawTiles() {
      this.tiles.forEach(tile => {
        this.context.fillStyle = "#eee";
        this.context.strokeStyle = "#bbb";
        this.context.lineWidth = 1;

        if (tile.hovered) {
          this.context.fillStyle = "lightblue";
        }
        this.context.fillRect(tile.x, tile.y, this.tileWidth, this.tileHeight);
        this.context.strokeRect(
          tile.x,
          tile.y,
          this.tileWidth,
          this.tileHeight
        );
      });
    },
    drawUnits() {
      this.units.forEach(unit => {
        this.drawUnitMovement(unit);

        this.context.fillStyle = "#448";
        this.context.lineWidth = 8;

        if (unit.hovered) {
          this.context.strokeStyle = "lightblue";
          this.context.strokeRect(unit.x, unit.y, unit.w, unit.h);
        }
        if (unit.selected) {
          this.context.strokeStyle = "orange";
          this.context.strokeRect(unit.x, unit.y, unit.w, unit.h);
        }

        this.context.fillRect(unit.x, unit.y, unit.w, unit.h);
      });
    },
    drawUnitMovement(unit) {
      this.context.lineWidth = 1;
      this.context.beginPath();
      const circleX = unit.x + unit.w / 2;
      const circleY = unit.y + unit.h / 2;
      this.context.arc(circleX, circleY, 110, 0, 2 * Math.PI, false);
      this.context.stroke();
    },
    redraw() {
      this.context.clearRect(0, 0, this.$refs.map.width, this.$refs.map.height);
      this.drawTiles();
      this.drawUnits();
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
    onClick(e) {
      const unitSelected = this.collides(this.units, e.offsetX, e.offsetY);

      if (unitSelected) {
        this.selectUnit(unitSelected);
      } else {
        const tile = this.collides(this.tiles, e.offsetX, e.offsetY);

        if (tile) {
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
      if (this.selectedUnit === null) {
        const unit = this.collides(this.units, e.offsetX, e.offsetY);

        this.units.forEach(unit => (unit.hovered = false));
        if (unit) {
          this.units[unit.id].hovered = true;
        }
      } else {
        const tile = this.collides(this.tiles, e.offsetX, e.offsetY);

        this.tiles.forEach(tile => (tile.hovered = false));
        if (tile) {
          this.hoveredTile = tile;
          this.hoveredTile.hovered = true;
        }
      }
      this.redraw();
    }, 50),
    moveUnitToTile(tile) {
      this.units[this.selectedUnit.id].x = tile.x;
      this.units[this.selectedUnit.id].y = tile.y;
    }
  }
};
</script>

<style lang="scss" scoped>
.canvas-map {
  background-color: grey;
}
</style>
