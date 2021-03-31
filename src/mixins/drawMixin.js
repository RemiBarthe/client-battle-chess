export default {
    methods: {
        drawMap() {
            let id = 0
            for (let c = 0; c < this.tileColumnCount; c++) {
                for (let r = 0; r < this.tileRowCount; r++) {
                    const tileW = 40
                    const tileH = 40
                    const tileX = c * tileW
                    const tileY = r * tileH

                    this.tiles.push({
                        x: tileX,
                        y: tileY,
                        w: tileW,
                        h: tileH,
                        id: id++,
                        hovered: false,
                        movementPossible: false,
                        attackPossible: false
                    })
                }
            }
        },
        drawTiles() {
            this.tiles.forEach(tile => {
                this.context.fillStyle = this.colors.tiles
                this.context.strokeStyle = "rgba(0,0,0,0.1)"
                this.context.lineWidth = 1

                if (tile.movementPossible) {
                    this.context.fillStyle = this.colors.movementPossible
                }
                if (tile.attackPossible) {
                    this.context.fillStyle = this.colors.attackPossible
                }
                if (tile.hovered) {
                    this.context.fillStyle = this.currentPlayer.secondaryColor
                }
                this.context.fillRect(tile.x, tile.y, tile.w, tile.h)
                this.context.strokeRect(tile.x, tile.y, tile.w, tile.h)
            })
        },
        drawUnits() {
            this.units.forEach(unit => {
                this.context.fillStyle = unit.color
                this.context.lineWidth = 8
                this.context.strokeStyle = "transparent"

                if (unit.selected) {
                    this.players.forEach(player => {
                        if (player.id === unit.selected)
                            this.context.strokeStyle = player.secondaryColor
                    })
                }

                if (unit.hovered) this.context.strokeStyle = this.colors.hoverUnit

                this.context.strokeRect(unit.x, unit.y, unit.w, unit.h)
                this.context.fillRect(unit.x, unit.y, unit.w, unit.h)
            })
        },
        drawLifeBar() {
            this.units.forEach(unit => {
                this.context.fillStyle = this.colors.lifeBar
                this.context.lineWidth = 2
                this.context.strokeStyle = this.colors.lifeBar

                const centerBar = unit.x - (unit.maxLife - 40) / 2

                this.context.strokeRect(centerBar, unit.y - 26, unit.maxLife, 6)
                this.context.fillRect(centerBar, unit.y - 26, unit.life, 6)
            })
        },
        drawActionPoint() {
            this.units.forEach(unit => {
                let actionPointX = unit.x
                for (let i = 0; i < unit.actionPoint; i++) {
                    this.context.fillStyle = this.colors.actionPoint
                    this.context.lineWidth = 4
                    this.context.strokeStyle = this.colors.actionPointBorder

                    this.context.strokeRect(actionPointX, unit.y - 14, 6, 6)
                    this.context.fillRect(actionPointX, unit.y - 14, 6, 6)

                    actionPointX += 12
                }
            })
        },
        drawWalls() {
            this.walls.forEach(wall => {
                this.context.fillStyle = this.colors.walls
                this.context.fillRect(wall.x, wall.y, wall.w, wall.h)
            })
        }
    }
}
