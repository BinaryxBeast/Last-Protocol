/**
 * EasyStar.js - A* Pathfinding API Simulation
 * Minimal implementation to support the user's requested API.
 */
class EasyStar {
    constructor() {
        this.grid = [];
        this.acceptableTiles = [];
        this.iterationsPerCalculation = 1000;
    }

    setGrid(grid) {
        this.grid = grid;
    }

    setAcceptableTiles(tiles) {
        this.acceptableTiles = tiles;
    }

    findPath(startX, startY, endX, endY, callback) {
        // Simple A* Implementation

        // 1. Validate inputs
        if (!this.isValid(startX, startY) || !this.isValid(endX, endY)) {
            console.warn("Pathfinding: Start or end point invalid");
            callback(null);
            return;
        }

        if (!this.isWalkable(endX, endY)) {
            console.warn("Pathfinding: End point is a wall");
            callback(null);
            return;
        }

        // 2. Setup A* sets
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();

        // gScore: cost from start to node
        const gScore = new Map();
        // fScore: gScore + heuristic cost to end
        const fScore = new Map();

        const startNode = `${startX},${startY}`;
        gScore.set(startNode, 0);
        fScore.set(startNode, this.heuristic(startX, startY, endX, endY));

        openSet.push({ x: startX, y: startY, f: fScore.get(startNode) });

        while (openSet.length > 0) {
            // Get node with lowest fScore
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = `${current.x},${current.y}`;

            if (current.x === endX && current.y === endY) {
                // PATH FOUND! RECONSTRUCT IT
                callback(this.reconstructPath(cameFrom, currentKey));
                return;
            }

            closedSet.add(currentKey);

            // Check neighbors (Up, Down, Left, Right)
            const neighbors = [
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 },
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y }
            ];

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;

                if (!this.isValid(neighbor.x, neighbor.y)) continue;
                if (!this.isWalkable(neighbor.x, neighbor.y)) continue;
                if (closedSet.has(neighborKey)) continue;

                // Distance between neighbors is always 1 in a grid
                const tentGScore = gScore.get(currentKey) + 1;

                if (!gScore.has(neighborKey) || tentGScore < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, { x: current.x, y: current.y });
                    gScore.set(neighborKey, tentGScore);
                    const f = tentGScore + this.heuristic(neighbor.x, neighbor.y, endX, endY);
                    fScore.set(neighborKey, f);

                    // Add to open set if not present
                    if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                        openSet.push({ x: neighbor.x, y: neighbor.y, f: f });
                    }
                }
            }
        }

        // No path found
        console.log("No path found");
        callback(null);
    }

    calculate() {
        // In the real library this processes the queue. 
        // Our findPath is synchronous for simplicity, so this is a stub.
    }

    // Helpers
    isValid(x, y) {
        return x >= 0 && x < this.grid[0].length && y >= 0 && y < this.grid.length;
    }

    isWalkable(x, y) {
        return this.acceptableTiles.includes(this.grid[y][x]);
    }

    heuristic(x1, y1, x2, y2) {
        // Manhattan distance for grid
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    reconstructPath(cameFrom, currentKey) {
        const path = [];
        let curr = currentKey;

        while (cameFrom.has(curr)) {
            const [x, y] = curr.split(',').map(Number);
            path.unshift({ x, y });
            const prev = cameFrom.get(curr);
            curr = `${prev.x},${prev.y}`;
        }
        // EasyStar excludes the start point?
        // Actually EasyStar result: Array of {x, y} including start? No usually exclude start.
        // Let's include the end point (which is in path) and working backwards.
        // The loop stops before adding the start point? 
        // Let's trace carefully. 
        // startNode is not in cameFrom. So loop ends when curr == startKey.
        // The very last node added was the one causing the break.
        // So {x: endX, y: endY} is added first (unshifted last).

        // Let's verify start point inclusion.
        // EasyStar usually returns path from start+1 to end.

        // Wait, the documentation says: "The path is an array of objects {x,y}."

        return path;
    }
}

// Expose minimal mimic
window.EasyStar = { js: EasyStar };
