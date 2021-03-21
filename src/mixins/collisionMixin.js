export default {
    methods: {
        collides(rects, x, y) {
            let isCollision = false

            rects.forEach(rect => {
                const left = rect.x,
                    right = rect.x + rect.w
                const top = rect.y,
                    bottom = rect.y + rect.h
                if (right >= x && left <= x && bottom >= y && top <= y) {
                    isCollision = rect
                }
            })
            return isCollision
        },
        lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
            const uA =
                ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
                ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
            const uB =
                ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
                ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

            if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
                return true
            }
            return false
        },
        lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
            const left = this.lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh)
            const right = this.lineLine(
                x1,
                y1,
                x2,
                y2,
                rx + rw,
                ry,
                rx + rw,
                ry + rh
            )
            const top = this.lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry)
            const bottom = this.lineLine(
                x1,
                y1,
                x2,
                y2,
                rx,
                ry + rh,
                rx + rw,
                ry + rh
            )

            if (left || right || top || bottom) {
                return true
            }
            return false
        }
    }
}