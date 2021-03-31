export default {
    methods: {
        getPossibleMovements(rects) {
            this.setTilesToDefault()
            rects.forEach(rect => {
                const collisionX = rect.x - this.selectedUnit.x
                const collisionY = rect.y - this.selectedUnit.y
                rect.movementPossible = false
                if (
                    this.selectedUnit.movement >=
                    Math.sqrt(collisionX * collisionX + collisionY * collisionY)
                ) {

                    const collisionWall = this.getWallCollision(this.selectedUnit.x, this.selectedUnit.y, this.selectedUnit.w, this.selectedUnit.h, rect.x, rect.y, rect.w, rect.h)

                    if (!collisionWall) rect.movementPossible = true
                }
            })
        },
        getPossibleAttacks(rects) {
            this.setTilesToDefault()

            rects.forEach(rect => {
                const collisionX = rect.x - this.selectedUnit.x
                const collisionY = rect.y - this.selectedUnit.y
                rect.attackPossible = false
                if (
                    this.selectedUnit.attackDistance >=
                    Math.sqrt(collisionX * collisionX + collisionY * collisionY)
                ) {
                    const collisionWall = this.getWallCollision(this.selectedUnit.x, this.selectedUnit.y, this.selectedUnit.w, this.selectedUnit.h, rect.x, rect.y, rect.w, rect.h)

                    if (!collisionWall) rect.attackPossible = true
                }
            })
        },
        getPossibleAttackWalls(rects) {
            let possibleAttackWalls = []
            rects.forEach(rect => {
                const collisionX = rect.x - this.selectedUnit.x
                const collisionY = rect.y - this.selectedUnit.y
                if (
                    this.selectedUnit.attackDistance >=
                    Math.sqrt(collisionX * collisionX + collisionY * collisionY)
                ) {
                    possibleAttackWalls.push(rect)
                }
            })

            return possibleAttackWalls
        }
    }
}