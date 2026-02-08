// Last Protocol - Step 3: Tactical Navigation & Robot Patrolling

// ============================================
// ASSASSIN CLASS - Player with Seek Movement
// ============================================
class Assassin {
    constructor(x, y, gridSize) {
        this.x = x;
        this.y = y;
        this.gridSize = gridSize;

        // Movement Physics
        this.velocity = { x: 0, y: 0 };
        this.inputVelocity = { x: 0, y: 0 }; // Added for manual input
        this.acceleration = 1500; // Pixel/s^2
        this.friction = 0.92;     // High friction for snappy stop
        this.maxSpeed = 220;      // Normal run speed
        this.lungeSpeed = 550;    // Attack dash speed

        // Pathfinding
        this.path = [];
        this.pathIndex = 0;
        this.angle = 0;

        // State Machine
        this.state = 'IDLE'; // IDLE, MOVING, ASSASSINATING, DEAD
        this.target = null;  // For assassination logic

        // Visuals
        this.footstepTimer = 0;
        this.idleTimer = 0;
    }

    setPath(newPath) {
        if (!newPath || newPath.length === 0) return;
        this.path = newPath;
        this.pathIndex = 0;
        this.state = 'MOVING';
    }

    // Trigger assassination lunge
    lungeAt(targetRobot) {
        this.target = targetRobot;
        this.state = 'ASSASSINATING';
        this.path = []; // Ignore pathfinding, go straight
    }

    update(dt, maze) { // Added maze for collision
        if (this.state === 'DEAD') return;

        const dtSec = dt / 1000;

        // --- STATE BEHAVIOR ---

        if (this.state === 'ASSASSINATING') {
            if (!this.target || !this.target.active) {
                this.state = 'IDLE';
                return;
            }

            // Lunge straight at target
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.angle = Math.atan2(dy, dx);

            // Move at high speed
            this.x += Math.cos(this.angle) * this.lungeSpeed * dtSec;
            this.y += Math.sin(this.angle) * this.lungeSpeed * dtSec;

            // Check for impact (very close range)
            if (dist < 20) {
                // Return to idle appropriately handled by GamePlay logic 
                // when it detects kill distance
                this.velocity = { x: 0, y: 0 };
            }

        } else if (this.state === 'MOVING') {
            // Check for manual input override first
            if (this.inputVelocity.x !== 0 || this.inputVelocity.y !== 0) {
                this.state = 'IDLE'; // Break pathfinding
                this.path = [];
            }
            else if (this.path.length > 0) {
                // Get current target node
                const target = this.path[this.pathIndex];
                const targetX = target.x * this.gridSize + this.gridSize / 2;
                const targetY = target.y * this.gridSize + this.gridSize / 2;

                const dx = targetX - this.x;
                const dy = targetY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Steering
                if (dist > 5) {
                    const steerAngle = Math.atan2(dy, dx);

                    // Instant Turn and Move (Snappy)
                    this.angle = steerAngle;
                    this.velocity.x = Math.cos(steerAngle) * this.maxSpeed;
                    this.velocity.y = Math.sin(steerAngle) * this.maxSpeed;
                } else {
                    // Reached node
                    this.pathIndex++;
                    if (this.pathIndex >= this.path.length) {
                        this.state = 'IDLE';
                    }
                }
            } else {
                this.state = 'IDLE';
            }
        }

        // --- PHYSICS INTEGRATION (Friction & Cap) ---

        if (this.state !== 'ASSASSINATING') {
            // Instant stop if IDLE
            if (this.state === 'IDLE') {
                this.velocity.x = 0;
                this.velocity.y = 0;
            }

            // Apply manual input if not pathfinding/lunging
            if (this.state === 'IDLE' || this.state === 'MANUAL_MOVE') {
                if (this.inputVelocity.x !== 0 || this.inputVelocity.y !== 0) {
                    this.state = 'MANUAL_MOVE';
                    this.velocity.x = this.inputVelocity.x;
                    this.velocity.y = this.inputVelocity.y;
                    this.angle = Math.atan2(this.velocity.y, this.velocity.x);
                } else {
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    if (this.state === 'MANUAL_MOVE') this.state = 'IDLE';
                }
            }

            // Proposed next position
            let nextX = this.x + this.velocity.x * dtSec;
            let nextY = this.y + this.velocity.y * dtSec;

            // Collision Detection for Manual Movement
            if (this.state === 'MANUAL_MOVE' && maze) {
                // Check X axis
                if (!this.checkCollision(nextX, this.y, maze)) {
                    this.x = nextX;
                }
                // Check Y axis
                if (!this.checkCollision(this.x, nextY, maze)) {
                    this.y = nextY;
                }
            } else {
                // Standard movement for pathfinding/lunging (assumes valid path)
                this.x = nextX;
                this.y = nextY;
            }
        }

        // --- FOOTSTEP RINGS ---
        // --- FOOTSTEP RINGS ---
        if (this.state === 'MOVING' || this.state === 'ASSASSINATING' || this.state === 'MANUAL_MOVE') {
            const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > 50) {
                this.footstepTimer += dt;
                // Faster movement = faster steps
                const stepInterval = this.state === 'ASSASSINATING' ? 150 : 300;

                if (this.footstepTimer > stepInterval) {
                    this.footstepTimer = 0;
                    if (this.scene && this.scene.effects) {
                        this.scene.effects.push(new FootstepRing(this.x, this.y));
                    }
                }
            }
        }
    }

    checkCollision(x, y, maze) {
        // Simple bounding circle/box check against grid
        const radius = 10; // Collision radius
        const checks = [
            { x: x, y: y }, // Center
            { x: x + radius, y: y },
            { x: x - radius, y: y },
            { x: x, y: y + radius },
            { x: x, y: y - radius }
        ];

        for (const p of checks) {
            const gx = Math.floor(p.x / this.gridSize);
            const gy = Math.floor(p.y / this.gridSize);

            // Bounds check
            if (gy < 0 || gy >= maze.length || gx < 0 || gx >= maze[0].length) return true;

            // Wall check
            if (maze[gy][gx] === 1) return true;
        }
        return false;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);

        // IDLE BREATHING ANIMATION
        const breathe = this.state === 'IDLE' ? Math.sin(Date.now() / 200) * 0.5 : 0;

        // 1. FOOTSTEP RIPPLES (Visualized noise) handled by separate class
        // (Shadow removed per user request)

        // 2. THE HOOD (Shoulders/Cape)
        // Vibrant Red/Orange for high contrast
        ctx.fillStyle = '#FF3300';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF3300';

        ctx.beginPath();
        // V-shape silhouette for "Predator" look
        ctx.moveTo(0, -12); // Front tip (Head)
        ctx.lineTo(11, 8);  // Right shoulder
        ctx.lineTo(0, 4);   // Back notch
        ctx.lineTo(-11, 8); // Left shoulder
        ctx.closePath();
        ctx.fill();

        // 3. DIRECTIONAL INDICATOR (Arrow)
        // Helps player know exactly where they will strike
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(4, -8);
        ctx.lineTo(-4, -8);
        ctx.closePath();
        ctx.fill();

        // 4. CENTER MASS (Darker tactical vest)
        ctx.fillStyle = '#661100';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ============================================
// FOOTSTEP RING - Visual Noise Indicator
// ============================================
class FootstepRing {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.maxRadius = 20;
        this.alpha = 0.6;
        this.complete = false;
    }

    update(dt) {
        this.radius += 30 * (dt / 1000); // Expand
        this.alpha -= 0.8 * (dt / 1000); // Fade

        if (this.alpha <= 0) {
            this.complete = true;
        }
    }

    render(ctx) {
        if (this.complete) return;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// ============================================
// GHOST EFFECT - Trail of the Assassin
// ============================================
class Ghost {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.alpha = 0.4;
        this.complete = false;
        this.fadeSpeed = 2.0; // Fade out speed
    }

    update(dt) {
        this.alpha -= this.fadeSpeed * (dt / 1000);
        if (this.alpha <= 0) {
            this.complete = true;
        }
    }

    render(ctx) {
        if (this.complete) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);

        // Ghost shape (same as assassin but single color)
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(10, 12);
        ctx.lineTo(-10, 12);
        ctx.closePath();

        ctx.fillStyle = `rgba(0, 255, 204, ${this.alpha})`;
        ctx.fill();
        ctx.restore();
    }
}

// ============================================
// TARGET PULSE CLASS - Click Feedback Effect
// ============================================
// ============================================
class TargetPulse {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.maxRadius = 35;
        this.alpha = 1;
        this.complete = false;
    }

    update(dt) {
        this.radius += 100 * (dt / 1000);
        this.alpha = 1 - (this.radius / this.maxRadius);
        if (this.radius >= this.maxRadius) {
            this.complete = true;
        }
    }

    render(ctx) {
        if (this.complete) return;
        ctx.save();
        ctx.strokeStyle = `rgba(0, 255, 204, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffcc';

        // Outer ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner crosshair
        if (this.alpha > 0.5) {
            ctx.beginPath();
            ctx.moveTo(this.x - 8, this.y);
            ctx.lineTo(this.x + 8, this.y);
            ctx.moveTo(this.x, this.y - 8);
            ctx.lineTo(this.x, this.y + 8);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// ============================================
// DISINTEGRATION EFFECT - Robot Death Animation
// ============================================
class DisintegrationEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.complete = false;
        this.lifetime = 0;
        this.maxLifetime = 800;

        // Spawn 18 binary code particles
        for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                char: Math.random() > 0.5 ? '1' : '0',
                alpha: 1,
                size: 10 + Math.random() * 8
            });
        }
    }

    update(dt) {
        this.lifetime += dt;
        if (this.lifetime >= this.maxLifetime) {
            this.complete = true;
            return;
        }

        const progress = this.lifetime / this.maxLifetime;

        for (const p of this.particles) {
            p.x += p.vx * (dt / 1000);
            p.y += p.vy * (dt / 1000);
            p.vy += 100 * (dt / 1000); // Gravity
            p.alpha = 1 - progress;
        }
    }

    render(ctx) {
        if (this.complete) return;
        ctx.save();
        ctx.font = 'bold 12px "Roboto Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const p of this.particles) {
            ctx.fillStyle = `rgba(255, 50, 50, ${p.alpha})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff0000';
            ctx.fillText(p.char, p.x, p.y);
        }
        ctx.restore();
    }
}

// ============================================
// SOUND PULSE - Alerts Nearby Robots
// ============================================
class SoundPulse {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.maxRadius = 200;
        this.alpha = 0.5;
        this.complete = false;
        this.hasAlerted = false; // Only alert once
    }

    update(dt) {
        this.radius += 400 * (dt / 1000); // Expand fast
        this.alpha = 0.5 * (1 - this.radius / this.maxRadius);

        if (this.radius >= this.maxRadius) {
            this.complete = true;
        }
    }

    // Check which robots are caught in pulse radius
    alertRobots(robots, maze, finder) {
        if (this.hasAlerted) return;
        this.hasAlerted = true;

        for (const robot of robots) {
            const dx = robot.x - this.x;
            const dy = robot.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.maxRadius && robot.state !== 'ALERT') {
                robot.investigate(this.x, this.y, maze, finder);
            }
        }
    }

    render(ctx) {
        if (this.complete) return;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 200, 50, ${this.alpha})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// ============================================
// BLOOD SPLATTER - Floor Impact Effect
// ============================================
class BloodSplatter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.alpha = 1;
        this.complete = false;

        // Generate splatter particles outward
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 / 10) * i + (Math.random() - 0.5) * 0.5;
            const dist = 12 + Math.random() * 25;
            this.particles.push({
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                size: 3 + Math.random() * 5
            });
        }
    }

    update(dt) {
        // Fade very slowly (stays on floor for ~15 seconds)
        this.alpha -= dt / 15000;
        if (this.alpha <= 0) this.complete = true;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Dark red/oil color for robot "blood"
        ctx.fillStyle = '#550000';

        // Draw splatter blobs
        for (const p of this.particles) {
            ctx.beginPath();
            ctx.arc(this.x + p.x, this.y + p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Center pool (larger)
        ctx.fillStyle = '#330000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ============================================
// DATA GEM - Collectible Loot
// ============================================
class DataGem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.value = 15; // Score per gem

        // Burst physics - explode outward
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 100;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.phase = 'BURST';
        this.burstTime = 0;
        this.burstDuration = 300; // ms to burst before seeking
        this.collected = false;
        this.alpha = 1;
        this.size = 8;
        this.sparkle = 0;
    }

    update(dt, player) {
        if (this.collected) return;

        this.sparkle += dt * 0.01;

        if (this.phase === 'BURST') {
            this.burstTime += dt;
            this.x += this.vx * (dt / 1000);
            this.y += this.vy * (dt / 1000);
            this.vx *= 0.95; // Friction
            this.vy *= 0.95;

            if (this.burstTime >= this.burstDuration) {
                this.phase = 'SEEK';
            }
        } else if (this.phase === 'SEEK') {
            // Fly toward player
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 20) {
                this.collected = true;
            } else {
                const speed = 400;
                this.x += (dx / dist) * speed * (dt / 1000);
                this.y += (dy / dist) * speed * (dt / 1000);
            }
        }
    }

    render(ctx) {
        if (this.collected) return;

        const pulse = 1 + Math.sin(this.sparkle) * 0.2;
        const size = this.size * pulse;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Red diamond gem
        ctx.fillStyle = '#ff3366';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff0066';
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.6, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.6, 0);
        ctx.closePath();
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#ff88aa';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.4);
        ctx.lineTo(size * 0.2, 0);
        ctx.lineTo(0, size * 0.4);
        ctx.lineTo(-size * 0.2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// ============================================
// ROBOT AGENT CLASS - Enemy AI State Machine
// ============================================
class RobotAgent {
    constructor(x, y, gridSize, scene) {
        this.gridX = x;
        this.gridY = y;
        this.x = x * gridSize + gridSize / 2;
        this.y = y * gridSize + gridSize / 2;
        this.gridSize = gridSize;
        this.scene = scene;

        this.speed = 80; // Slower than player
        this.state = 'IDLE';
        this.idleTimer = 0;
        this.idleDuration = 2000 + Math.random() * 1000; // 2-3 seconds

        this.path = [];
        this.pathIndex = 0;
        this.angle = Math.random() * Math.PI * 2; // Random initial facing

        // Vision cone properties
        this.visionPolygon = [];
        this.isDetecting = false;
        this.viewDistance = 180; // Pixel range
        this.fov = Math.PI / 2; // 90 degrees
        this.rayCount = 25; // Number of rays

        // Investigation properties
        this.investigateTimer = 0;

        // Apply difficulty scaling from scene
        if (this.scene.difficultyModifier) {
            this.speed = 80 * this.scene.difficultyModifier.speedMult;
            this.viewDistance = 180 * this.scene.difficultyModifier.visionMult;
            // Chance for special types based on level could go here, but keeping it simple for now
            // or sticking to the requested "Vision Speed" increase
        }
    }

    // ========== VISION SYSTEM ==========

    // Cast a ray until it hits a wall or reaches max distance
    castRay(startX, startY, angle, maxDist, maze) {
        const step = 4; // Ray step size in pixels

        for (let d = step; d < maxDist; d += step) {
            const x = startX + Math.cos(angle) * d;
            const y = startY + Math.sin(angle) * d;

            // Convert to grid coordinates
            const gx = Math.floor(x / this.gridSize);
            const gy = Math.floor(y / this.gridSize);

            // Check bounds
            if (gy < 0 || gy >= maze.length || gx < 0 || gx >= maze[0].length) {
                return { x, y };
            }
            // Hit a wall
            if (maze[gy][gx] === 1) {
                return { x, y };
            }
        }
        // Reached max distance without hitting anything
        return {
            x: startX + Math.cos(angle) * maxDist,
            y: startY + Math.sin(angle) * maxDist
        };
    }

    updateVision(maze) {
        // Build vision polygon from raycasts
        this.visionPolygon = [{ x: this.x, y: this.y }];

        for (let i = 0; i <= this.rayCount; i++) {
            const rayAngle = (this.angle - this.fov / 2) + (i / this.rayCount) * this.fov;
            const hit = this.castRay(this.x, this.y, rayAngle, this.viewDistance, maze);
            this.visionPolygon.push(hit);
        }
    }

    // Point-in-polygon test using ray casting algorithm
    isPointInPolygon(px, py, polygon) {
        if (polygon.length < 3) return false;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            if (((yi > py) !== (yj > py)) &&
                (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
    }

    checkPlayerDetection(player) {
        if (!this.visionPolygon || this.visionPolygon.length < 3) return false;
        return this.isPointInPolygon(player.x, player.y, this.visionPolygon);
    }

    // ========== STATE MACHINE ==========

    update(dt, maze, finder, player) {
        // Update vision every frame
        this.updateVision(maze);

        // Check for player detection
        this.isDetecting = this.checkPlayerDetection(player);

        if (this.isDetecting) {
            // ALERT: Stop and track player
            this.state = 'ALERT';
            this.angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.path = []; // Clear patrol path
        } else if (this.state === 'ALERT') {
            // Lost sight of player, return to patrol
            this.resetIdle();
        }

        // Normal state behavior
        if (this.state === 'IDLE') {
            this.idleTimer += dt;
            if (this.idleTimer >= this.idleDuration) {
                this.startPatrol(maze, finder);
            }
        } else if (this.state === 'PATROL') {
            this.moveAlongPath(dt);
        } else if (this.state === 'INVESTIGATE') {
            // Move to investigation point, then look around
            if (this.path.length > 0 && this.pathIndex < this.path.length) {
                this.moveAlongPath(dt);
            } else {
                // Arrived at investigation point, look around
                this.investigateTimer -= dt;
                this.angle += 2 * (dt / 1000); // Slowly rotate looking
                if (this.investigateTimer <= 0) {
                    this.resetIdle();
                }
            }
        }
        // ALERT state: robot stays still, tracking player (handled above)
    }

    startPatrol(maze, finder) {
        // Find random floor tile within 5 units
        const nearby = [];
        for (let dy = -5; dy <= 5; dy++) {
            for (let dx = -5; dx <= 5; dx++) {
                const nx = this.gridX + dx;
                const ny = this.gridY + dy;
                if (maze[ny] && maze[ny][nx] === 0 && (dx !== 0 || dy !== 0)) {
                    nearby.push({ x: nx, y: ny });
                }
            }
        }

        if (nearby.length > 0) {
            const target = nearby[Math.floor(Math.random() * nearby.length)];
            finder.findPath(this.gridX, this.gridY, target.x, target.y, (path) => {
                if (path && path.length > 0) {
                    this.path = path;
                    this.pathIndex = 0;
                    this.state = 'PATROL';
                } else {
                    this.resetIdle();
                }
            });
            finder.calculate();
        } else {
            this.resetIdle();
        }
    }

    moveAlongPath(dt) {
        if (this.path.length === 0 || this.pathIndex >= this.path.length) {
            this.resetIdle();
            return;
        }

        const target = this.path[this.pathIndex];
        const targetX = target.x * this.gridSize + this.gridSize / 2;
        const targetY = target.y * this.gridSize + this.gridSize / 2;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            this.angle = Math.atan2(dy, dx);
            this.x += Math.cos(this.angle) * this.speed * (dt / 1000);
            this.y += Math.sin(this.angle) * this.speed * (dt / 1000);
        } else {
            this.gridX = target.x;
            this.gridY = target.y;
            this.pathIndex++;
            if (this.pathIndex >= this.path.length) {
                this.resetIdle();
            }
        }
    }

    resetIdle() {
        this.state = 'IDLE';
        this.idleTimer = 0;
        this.idleDuration = 2000 + Math.random() * 1000;
        this.path = [];
    }

    // Called when a nearby robot dies - go investigate
    investigate(targetX, targetY, maze, finder) {
        this.state = 'INVESTIGATE';
        this.investigateTimer = 2500; // Look around for 2.5s
        this.path = [];

        const targetGridX = Math.floor(targetX / this.gridSize);
        const targetGridY = Math.floor(targetY / this.gridSize);

        finder.findPath(this.gridX, this.gridY, targetGridX, targetGridY, (path) => {
            if (path && path.length > 0) {
                this.path = path;
                this.pathIndex = 0;
            }
        });
        finder.calculate();
    }

    // ========== RENDERING ==========

    // Render the vision cone (called before robot body)
    renderVision(ctx) {
        if (!this.visionPolygon || this.visionPolygon.length < 3) return;

        ctx.save();

        // Create radial gradient from robot center outward
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.viewDistance
        );

        if (this.isDetecting) {
            // Alert mode - red gradient
            gradient.addColorStop(0, 'rgba(255, 80, 80, 0.5)');
            gradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        } else {
            // Patrol mode - bright yellow flashlight
            gradient.addColorStop(0, 'rgba(255, 255, 150, 0.45)');
            gradient.addColorStop(0.6, 'rgba(255, 255, 100, 0.25)');
            gradient.addColorStop(1, 'rgba(255, 255, 50, 0)');
        }

        // Draw filled cone
        ctx.beginPath();
        ctx.moveTo(this.visionPolygon[0].x, this.visionPolygon[0].y);
        for (let i = 1; i < this.visionPolygon.length; i++) {
            ctx.lineTo(this.visionPolygon[i].x, this.visionPolygon[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Edge glow outline for visibility
        ctx.strokeStyle = this.isDetecting
            ? 'rgba(255, 100, 100, 0.6)'
            : 'rgba(255, 255, 150, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);

        // Leg animation (oscillate when patrolling)
        const isWalking = this.state === 'PATROLLING' || this.state === 'INVESTIGATING';
        const legOffset = isWalking ? Math.sin(Date.now() / 100) * 3 : 0;

        // Shadow beneath
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(2, 2, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs - dark metal color
        ctx.fillStyle = '#333333';
        ctx.shadowBlur = 0;
        // Left leg
        ctx.beginPath();
        ctx.roundRect(-6, 3 + legOffset, 5, 12, 2);
        ctx.fill();
        // Right leg
        ctx.beginPath();
        ctx.roundRect(1, 3 - legOffset, 5, 12, 2);
        ctx.fill();

        // Armored body (rectangular torso)
        const bodyColor = this.isDetecting ? '#ff2222' : '#cc3333';
        const armorColor = this.isDetecting ? '#aa0000' : '#882222';

        ctx.fillStyle = bodyColor;
        ctx.shadowBlur = this.isDetecting ? 15 : 8;
        ctx.shadowColor = this.isDetecting ? '#ff0000' : '#ff3333';
        ctx.beginPath();
        ctx.roundRect(-9, -10, 18, 18, 3);
        ctx.fill();

        // Armor plates
        ctx.fillStyle = armorColor;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.roundRect(-6, -8, 12, 6, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(-6, 0, 12, 5, 2);
        ctx.fill();

        // Visor/Eye - yellow when patrolling, red when alert
        ctx.fillStyle = this.isDetecting ? '#ff0000' : '#ffff00';
        ctx.shadowBlur = this.isDetecting ? 20 : 12;
        ctx.shadowColor = this.isDetecting ? '#ff0000' : '#ffff00';
        ctx.beginPath();
        ctx.roundRect(-5, -14, 10, 4, 2);
        ctx.fill();

        ctx.restore();
    }
}

class GamePlay extends AG.Scene {
    create() {
        this.gridSize = 64; // "Chunky" walls

        // Adjust map size to fit the screen
        this.mapWidth = Math.ceil(this.game.width / this.gridSize);
        this.mapHeight = Math.ceil(this.game.height / this.gridSize);

        // 1. Generate Assets (Programmatic Textures)
        this.generateAssets();

        // 2. Generate the "Cluster & Carve" Map
        console.log("Generating Data Center Map...");
        this.maze = this.generateClusterMap(this.mapWidth, this.mapHeight);

        // 3. Initialize Pathfinding (use window.EasyStar.js to avoid identifier shadowing)
        this.finder = new (window.EasyStar.js)();
        this.finder.setGrid(this.maze);
        this.finder.setAcceptableTiles([0]); // Only move on floors

        // 4. Setup Assassin (using new class with seek movement)
        const startPos = this.findValidSpawn();
        this.player = new Assassin(
            startPos.x * this.gridSize + this.gridSize / 2,
            startPos.y * this.gridSize + this.gridSize / 2,
            this.gridSize
        );
        this.player.scene = this; // Needed for spawning effects

        // 5. Initialize effect arrays
        this.targetPulses = [];
        this.robots = [];
        this.ghosts = []; // Array for ghost trails

        // 6. Spawn Robot Patrols (based on difficulty)
        // this.maxRobots is set in updateDifficultyStats, called in create
        this.spawnRobots(this.maxRobots || 4);

        // 7. Input Handling with visual feedback
        this.input.on('pointerdown', (pointer) => {
            this.handleClick(pointer.x, pointer.y);
        });

        // 8. Lighting Overlay (Last added = Top layer)
        this.lighting = this.add.image(0, 0, 'lighting_overlay');
        this.lighting.player = this.player; // Link for update logic

        // 9. Detection & Game Over System
        this.detectionTime = 0;
        this.maxDetectionTime = 1500; // 1.5 seconds to game over
        this.screenShake = 0;
        this.hitStop = 0;
        this.isGameOver = false;
        this.gameOverTimer = 0;
        this.alarmPlaying = false; // Track alarm state

        // 10. Stealth Kill Effects & Loot
        this.effects = [];        // DisintegrationEffects
        this.soundPulses = [];    // SoundPulses for alerting
        this.gems = [];           // DataGems (collectibles)
        this.bloodSplatters = []; // Floor blood/oil splatters

        // Level System
        if (!this.levelNumber) this.levelNumber = 1;
        this.updateDifficultyStats();

        // UI Overlay for Level
        this.updateLevelDisplay();

        this.score = 0;
        this.isTransitioning = false;

        // 11. Background Music
        if (window.backgroundMusic) {
            this.music = window.backgroundMusic;
        } else {
            // Fallback if game started directly without menu
            this.music = new AG.Audio('assets/music.wav', true, 0.5);
            window.backgroundMusic = this.music;
        }

        if (this.music.audio.paused) {
            this.music.play();
        }

        this.musicPlaying = !this.music.audio.paused;

        this.music.audio.addEventListener('playing', () => {
            this.musicPlaying = true;
            console.log("Music confirmed playing");
        });

        this.music.audio.addEventListener('pause', () => {
            this.musicPlaying = false;
        });

        // Resume audio context on user interaction (persist until success)
        const resumeAudio = () => {
            if (this.music.audio.paused) {
                this.music.play();
            }
        };

        window.addEventListener('click', resumeAudio);
        window.addEventListener('keydown', resumeAudio);

        // Input State for Arrow Keys
        this.cursors = {
            up: false, down: false, left: false, right: false
        };

        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.cursors.up = true;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.cursors.down = true;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.cursors.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.cursors.right = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.cursors.up = false;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.cursors.down = false;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.cursors.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.cursors.right = false;
        });

        // Remove listeners once we know it's playing
        this.music.audio.addEventListener('playing', () => {
            window.removeEventListener('click', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
        });
    }

    updateDifficultyStats() {
        // Linear difficulty scaling
        this.maxRobots = 4 + Math.floor((this.levelNumber - 1) / 2);

        // Cap detection speed increase
        const detectionSpeedMod = Math.min(0.5, (this.levelNumber - 1) * 0.05);
        this.robotDetectionSpeed = 1.0 + detectionSpeedMod;

        this.difficultyModifier = {
            speedMult: 1 + (this.levelNumber - 1) * 0.05, // 5% faster per level
            visionMult: 1 + (this.levelNumber - 1) * 0.02 // 2% range increase per level
        };

        // Decrease detection time (harder to survive detection)
        this.maxDetectionTime = Math.max(800, 1500 - (this.levelNumber - 1) * 100);
    }

    updateLevelDisplay() {
        const hud = document.getElementById('levelHud');
        if (hud) hud.textContent = `PROTOCOL LEVEL: ${this.levelNumber}`;
    }

    showBreachOverlay() {
        const overlay = document.getElementById('breachOverlay');
        const levelText = document.getElementById('breachLevelText');
        if (overlay && levelText) {
            levelText.textContent = `SECURITY LAYER ${this.levelNumber} COMPROMISED`;
            overlay.classList.remove('hidden');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 2500);
        }
    }

    checkLevelComplete() {
        if (this.robots.length === 0 && !this.isTransitioning) {
            this.isTransitioning = true;
            this.levelNumber++;

            // Save Progress
            const currentHigh = localStorage.getItem('lastProtocol_highLevel') || 1;
            if (this.levelNumber > currentHigh) {
                localStorage.setItem('lastProtocol_highLevel', this.levelNumber);
            }

            this.showBreachOverlay();

            // Wait 2 seconds, then generate new level
            setTimeout(() => {
                this.startNextLevel();
            }, 2000);
        }
    }

    startNextLevel() {
        this.isTransitioning = false;
        this.updateDifficultyStats();
        this.updateLevelDisplay();

        // Regenerate Map
        this.maze = this.generateClusterMap(this.mapWidth, this.mapHeight);
        this.finder.setGrid(this.maze);

        // Reset Player Position
        const startPos = this.findValidSpawn();
        this.player.x = startPos.x * this.gridSize + this.gridSize / 2;
        this.player.y = startPos.y * this.gridSize + this.gridSize / 2;
        this.player.path = [];
        this.player.isMoving = false;

        // Clear old entities
        this.robots = [];
        this.gems = [];
        this.effects = [];
        this.targetPulses = [];
        this.soundPulses = [];
        this.bloodSplatters = [];

        // Spawn new robots
        this.spawnRobots(this.maxRobots);

        // Reset detection
        this.detectionTime = 0;
        this.screenShake = 0;
    }

    // Handle click: show pulse and find path
    handleClick(x, y) {
        // If game over, click to retry
        if (this.isGameOver) {
            // Wait 1 second to prevent accidental clicks
            if (this.gameOverTimer > 1000) {
                this.levelNumber = 1; // Reset to level 1 on death
                this.scene.start('GamePlay');
            }
            return;
        }

        // 1. Check if clicked on a Robot (Targeting)
        let clickedRobot = null;
        for (const robot of this.robots) {
            const dx = robot.x - x;
            const dy = robot.y - y;
            if (dx * dx + dy * dy < 900) { // 30px radius click tolerance
                clickedRobot = robot;
                break;
            }
        }

        if (clickedRobot) {
            // Calculate distance to robot
            const dx = clickedRobot.x - this.player.x;
            const dy = clickedRobot.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // KILL RANGE CHECK (e.g. 180px)
            if (dist < 180) {
                // LUNGE ATTACK!
                this.player.lungeAt(clickedRobot);
                // Visual feedback for attack command
                this.targetPulses.push(new TargetPulse(clickedRobot.x, clickedRobot.y));
                return;
            } else {
                // Too far, walk towards it normally
                // (Fall through to pathfinding logic below using robot position)
                x = clickedRobot.x;
                y = clickedRobot.y;
            }
        }

        // 2. Navigation Logic
        // Convert to grid coordinates for pathfinding
        const endX = Math.floor(x / this.gridSize);
        const endY = Math.floor(y / this.gridSize);

        // Only proceed if clicking on a floor tile
        if (endX < 0 || endX >= this.mapWidth || endY < 0 || endY >= this.mapHeight) return;
        if (this.maze[endY][endX] !== 0) return;

        // Add visual feedback pulse at target location
        const targetWorldX = endX * this.gridSize + this.gridSize / 2;
        const targetWorldY = endY * this.gridSize + this.gridSize / 2;
        this.targetPulses.push(new TargetPulse(targetWorldX, targetWorldY));

        // Find path
        this.findAndMovePath(x, y);
    }

    // Spawn robots far from player
    spawnRobots(count) {
        const playerGridX = Math.floor(this.player.x / this.gridSize);
        const playerGridY = Math.floor(this.player.y / this.gridSize);

        for (let i = 0; i < count; i++) {
            let x, y, attempts = 0;
            do {
                x = Math.floor(Math.random() * (this.mapWidth - 2)) + 1;
                y = Math.floor(Math.random() * (this.mapHeight - 2)) + 1;
                attempts++;
            } while (
                (this.maze[y][x] !== 0 ||
                    Math.abs(x - playerGridX) + Math.abs(y - playerGridY) < 8) &&
                attempts < 100
            );

            if (attempts < 100) {
                this.robots.push(new RobotAgent(x, y, this.gridSize, this));
                console.log(`Robot ${i + 1} spawned at (${x}, ${y})`);
            }
        }
        console.log(`Spawned ${this.robots.length} robot patrols`);
    }

    update(dt, time) {
        // Hit Stop / Frame Freeze for impact
        if (this.hitStop > 0) {
            this.hitStop -= dt;
            return;
        }

        super.update(dt, time);

        this.checkLevelComplete();

        // Game over state: just update timer for animation
        if (this.isGameOver) {
            this.gameOverTimer += dt;
            return;
        }

        // Update player movement
        if (this.player) {
            this.player.scene = this; // Ensure scene reference is set

            // Process Input
            this.player.inputVelocity.x = 0;
            this.player.inputVelocity.y = 0;
            const speed = this.player.maxSpeed;

            if (this.cursors.up) this.player.inputVelocity.y = -speed;
            if (this.cursors.down) this.player.inputVelocity.y = speed;
            if (this.cursors.left) this.player.inputVelocity.x = -speed;
            if (this.cursors.right) this.player.inputVelocity.x = speed;

            // Normalize diagonal
            if (this.player.inputVelocity.x !== 0 && this.player.inputVelocity.y !== 0) {
                this.player.inputVelocity.x *= 0.707;
                this.player.inputVelocity.y *= 0.707;
            }

            this.player.update(dt, this.maze);
        }

        // Update ghosts
        for (const ghost of this.ghosts) {
            ghost.update(dt);
        }
        this.ghosts = this.ghosts.filter(g => !g.complete);

        // Update all robots (pass player for detection)
        for (const robot of this.robots) {
            robot.update(dt, this.maze, this.finder, this.player);
        }

        // Check if ANY robot is detecting the player
        let isDetected = false;
        for (const robot of this.robots) {
            if (robot.isDetecting) {
                isDetected = true;
                break;
            }
        }

        // Handle detection damage
        if (isDetected) {
            this.detectionTime += dt;
            this.screenShake = 5 + Math.sin(time / 50) * 2;

            // Check for game over
            if (this.detectionTime >= this.maxDetectionTime) {
                this.triggerGameOver();
            }

            // Play alarm sound if not already playing
            if (!this.alarmPlaying) {
                const alarm = document.getElementById('alarmSound');
                if (alarm) {
                    alarm.currentTime = 0;
                    alarm.play().catch(() => { });
                    this.alarmPlaying = true;
                }
            }

        } else {
            // Recover when not detected (slower than accumulation)
            this.detectionTime = Math.max(0, this.detectionTime - dt * 0.5);
            this.screenShake = Math.max(0, this.screenShake - dt * 0.02);

            this.alarmPlaying = false; // Reset alarm flag
        }

        // Update target pulses and remove completed ones
        for (const pulse of this.targetPulses) {
            pulse.update(dt);
        }
        this.targetPulses = this.targetPulses.filter(p => !p.complete);

        // Update effects
        for (const effect of this.effects) {
            effect.update(dt);
        }
        this.effects = this.effects.filter(e => !e.complete);

        // Update blood splatters (slow fade)
        for (const splatter of this.bloodSplatters) {
            splatter.update(dt);
        }
        this.bloodSplatters = this.bloodSplatters.filter(s => !s.complete);

        // Update sound pulses and trigger alerts
        for (const pulse of this.soundPulses) {
            pulse.update(dt);
            pulse.alertRobots(this.robots, this.maze, this.finder);
        }
        this.soundPulses = this.soundPulses.filter(p => !p.complete);

        // Update gems
        for (const gem of this.gems) {
            gem.update(dt, this.player);
            if (gem.collected) {
                this.score += gem.value;
                // Play collect sound
                const chime = document.getElementById('collectSound');
                if (chime) {
                    chime.currentTime = 0;
                    chime.play().catch(() => { });
                }
            }
        }
        this.gems = this.gems.filter(g => !g.collected);

        // Check for stealth takedowns
        this.checkTakedowns();
    }

    // Check if player is close enough to unaware robot for stealth kill
    checkTakedowns() {
        for (let i = this.robots.length - 1; i >= 0; i--) {
            const robot = this.robots[i];
            const dx = this.player.x - robot.x;
            const dy = this.player.y - robot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Kill if close AND robot is NOT detecting player
            if (dist < 40 && !robot.isDetecting) {
                this.executeSilentKill(robot, i);
            }
        }
    }

    // Execute a stealth kill
    executeSilentKill(robot, index) {
        // Spawn disintegration effect
        this.effects.push(new DisintegrationEffect(robot.x, robot.y));

        // Spawn blood/oil splatter on floor
        this.bloodSplatters.push(new BloodSplatter(robot.x, robot.y));

        // Camera shake for impact
        this.screenShake = 8;
        this.hitStop = 50; // Freeze frame for 50ms

        // Spawn sound pulse to alert nearby robots
        this.soundPulses.push(new SoundPulse(robot.x, robot.y));

        // Spawn 3-5 data gems
        const gemCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < gemCount; i++) {
            this.gems.push(new DataGem(robot.x, robot.y));
        }

        // Remove robot
        this.robots.splice(index, 1);
        this.score += 45;
        console.log(`Robot eliminated! Score: ${this.score}`);
    }

    triggerGameOver() {
        this.isGameOver = true;
        this.gameOverTimer = 0;
        console.log('CONNECTION TERMINATED - Game Over');
    }

    // Override render to implement Layered Rendering
    render(ctx) {
        ctx.save();

        // Apply screen shake when detected
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake * 2;
            const shakeY = (Math.random() - 0.5) * this.screenShake * 2;
            ctx.translate(shakeX, shakeY);
        }

        // 1. Draw Map Layers
        this.drawMap(ctx);

        // 2. Draw Target Pulses (on floor, below entities)
        for (const pulse of this.targetPulses) {
            pulse.render(ctx);
        }

        // 2b. Draw Blood Splatters (on floor, persists after kills)
        for (const splatter of this.bloodSplatters) {
            splatter.render(ctx);
        }

        // 3. Draw Sound Pulses
        for (const pulse of this.soundPulses) {
            pulse.render(ctx);
        }

        // Draw Ghost Trail
        for (const ghost of this.ghosts) {
            ghost.render(ctx);
        }

        // 4. Draw Data Gems
        for (const gem of this.gems) {
            gem.render(ctx);
        }

        // 5. Draw Vision Cones (below robots)
        for (const robot of this.robots) {
            robot.renderVision(ctx);
        }

        // 6. Draw Robots
        for (const robot of this.robots) {
            robot.render(ctx);
        }

        // 7. Draw Kill Effects (on top of robots)
        for (const effect of this.effects) {
            effect.render(ctx);
        }

        // 8. Draw Player (on top)
        if (this.player) this.player.render(ctx);

        // 9. Draw Lighting Overlay
        if (this.lighting) this.lighting.render(ctx);

        ctx.restore();

        // 10. Draw Score HUD
        this.drawHUD(ctx);

        // 11. Draw Detection Warning (red vignette when detected)
        if (this.detectionTime > 0 && !this.isGameOver) {
            this.drawDetectionOverlay(ctx);
        }

        // 12. Draw Game Over Screen
        if (this.isGameOver) {
            this.drawGameOver(ctx);
        }
    }

    // Draw score HUD
    drawHUD(ctx) {
        ctx.save();

        // Background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(10, 10, 180, 95, 5); // Increased height
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Score text with glow
        ctx.font = 'bold 20px "Roboto Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00ffcc';
        ctx.fillText(`SCORE: ${this.score}`, 22, 38);

        // Robot counter with red glow
        ctx.fillStyle = '#ff6666';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff3333';
        ctx.fillText(`TARGETS: ${this.robots.length}`, 22, 63);

        // Music Status
        ctx.font = '14px "Roboto Mono", monospace';
        ctx.fillStyle = this.musicPlaying ? '#00ffcc' : '#888888';
        ctx.shadowBlur = this.musicPlaying ? 8 : 0;
        ctx.fillText(`MUSIC: ${this.musicPlaying ? 'ON' : 'OFF'}`, 22, 88);

        // Level indicator
        ctx.fillStyle = '#ffcc00';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffcc00';
        ctx.font = '14px "Roboto Mono", monospace';
        ctx.fillText(`LEVEL ${this.levelNumber || 1}`, 130, 38);

        ctx.restore();
    }

    // Red vignette effect when being detected
    drawDetectionOverlay(ctx) {
        const intensity = Math.min(this.detectionTime / this.maxDetectionTime, 1);

        ctx.save();
        const gradient = ctx.createRadialGradient(
            ctx.canvas.width / 2, ctx.canvas.height / 2, 100,
            ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 1.5
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
        gradient.addColorStop(1, `rgba(255, 0, 0, ${intensity * 0.6})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    // Game Over screen with glitch effect
    drawGameOver(ctx) {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const t = this.gameOverTimer;

        // Fade in black overlay
        const alpha = Math.min(t / 500, 0.9);
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, w, h);

        // Glitch bars
        if (t > 200) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            for (let i = 0; i < 5; i++) {
                const barY = (Math.sin(t / 100 + i) * 0.5 + 0.5) * h;
                const barH = 5 + Math.random() * 10;
                ctx.fillRect(0, barY, w, barH);
            }
        }

        // Main text
        if (t > 400) {
            ctx.save();
            ctx.font = 'bold 48px "Roboto Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Glitch offset
            const glitchX = Math.random() > 0.9 ? (Math.random() - 0.5) * 10 : 0;
            const glitchY = Math.random() > 0.9 ? (Math.random() - 0.5) * 5 : 0;

            // Red shadow text (glitch)
            ctx.fillStyle = '#ff0000';
            ctx.fillText('CONNECTION TERMINATED', w / 2 + glitchX - 2, h / 2 + glitchY);

            // Cyan shadow text (glitch)
            ctx.fillStyle = '#00ffff';
            ctx.fillText('CONNECTION TERMINATED', w / 2 + glitchX + 2, h / 2 + glitchY);

            // Main white text
            ctx.fillStyle = '#ffffff';
            ctx.fillText('CONNECTION TERMINATED', w / 2 + glitchX, h / 2 + glitchY);

            // Subtitle
            if (t > 800) {
                ctx.font = '20px "Roboto Mono", monospace';
                ctx.fillStyle = '#ff3333';
                ctx.fillText('PROTOCOL FAILED', w / 2, h / 2 + 50);
            }

            // Restart hint
            if (t > 1500) {
                ctx.font = '16px "Roboto Mono", monospace';
                ctx.fillStyle = '#888888';
                ctx.fillText('[ CLICK TO RETRY ]', w / 2, h / 2 + 100);
            }

            ctx.restore();
        }
    }

    drawMap(ctx) {
        const map = this.maze;
        const size = this.gridSize;

        // First pass: Draw all floors
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const cell = map[y][x] || 0;
                const px = x * size;
                const py = y * size;

                if (cell === 0) {
                    ctx.drawImage(this.assets.floor, px, py);
                }
            }
        }

        // Second pass: Draw shadows
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const cell = map[y][x] || 0;
                const px = x * size;
                const py = y * size;

                if (cell === 1) {
                    ctx.drawImage(this.assets.shadow, px + 8, py + 8);
                }
            }
        }

        // Third pass: Draw crate sides (depth face)
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const cell = map[y][x] || 0;
                const px = x * size;
                const py = y * size;

                if (cell === 1) {
                    // Only draw side if tile below is floor
                    if (y + 1 < this.mapHeight && map[y + 1][x] === 0) {
                        ctx.drawImage(this.assets.wall_side, px, py + size);
                    }
                }
            }
        }

        // Fourth pass: Draw crate tops (on top of everything)
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const cell = map[y][x] || 0;
                const px = x * size;
                const py = y * size;

                if (cell === 1) {
                    ctx.drawImage(this.assets.wall_top, px, py);
                }
            }
        }
    }

    generateAssets() {
        this.assets = {};

        // Color palettes for Hunter Assassin style (selectable per level)
        this.colorPalettes = [
            { name: 'warehouse', top: '#8B4513', side: '#654321', highlight: '#A0522D', floor: '#9E9E9E' },
            { name: 'military', top: '#4A5D23', side: '#3A4D13', highlight: '#5A6D33', floor: '#7E8E6E' },
            { name: 'industrial', top: '#8B0000', side: '#5C0000', highlight: '#A52A2A', floor: '#A0A0A0' },
            { name: 'facility', top: '#2E8B57', side: '#1E6B47', highlight: '#3E9B67', floor: '#808080' }
        ];

        // Select random palette for this level
        this.currentPalette = this.colorPalettes[Math.floor(Math.random() * this.colorPalettes.length)];
        const palette = this.currentPalette;
        console.log(`Level theme: ${palette.name}`);

        // Helper to create texture canvas
        const createTexture = (w, h, drawFn) => {
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            const ctx = c.getContext('2d');
            drawFn(ctx, w, h);
            return c;
        };

        // 1. Crate Top (64x64): Wooden/Metal crate with planks
        this.assets.wall_top = createTexture(64, 64, (ctx, w, h) => {
            // Base color
            ctx.fillStyle = palette.top;
            ctx.fillRect(0, 0, w, h);

            // Wood grain / texture lines
            ctx.strokeStyle = palette.side;
            ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const y = 8 + i * 10;
                ctx.beginPath();
                ctx.moveTo(2, y + Math.random() * 2);
                ctx.lineTo(w - 2, y + Math.random() * 2);
                ctx.stroke();
            }

            // Border frame
            ctx.strokeStyle = palette.side;
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, w - 4, h - 4);

            // Cross braces (like a crate)
            ctx.strokeStyle = palette.highlight;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(4, 4);
            ctx.lineTo(w - 4, h - 4);
            ctx.moveTo(w - 4, 4);
            ctx.lineTo(4, h - 4);
            ctx.stroke();

            // Corner bolts
            ctx.fillStyle = '#333';
            const boltSize = 4;
            ctx.fillRect(4, 4, boltSize, boltSize);
            ctx.fillRect(w - 8, 4, boltSize, boltSize);
            ctx.fillRect(4, h - 8, boltSize, boltSize);
            ctx.fillRect(w - 8, h - 8, boltSize, boltSize);

            // Highlight top edge
            ctx.fillStyle = palette.highlight;
            ctx.fillRect(2, 2, w - 4, 2);
        });

        // 2. Crate Side (64x24): Darker depth face
        this.assets.wall_side = createTexture(64, 24, (ctx, w, h) => {
            // Gradient for depth illusion
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, palette.side);
            grad.addColorStop(1, '#1a1a1a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Vertical plank lines
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            for (let x = 8; x < w; x += 16) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }

            // Bottom shadow
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, h - 4, w, 4);
        });

        // 3. Floor (64x64): Concrete/Tile pattern
        this.assets.floor = createTexture(64, 64, (ctx, w, h) => {
            // Base concrete color
            ctx.fillStyle = palette.floor;
            ctx.fillRect(0, 0, w, h);

            // Noise/texture
            for (let i = 0; i < 100; i++) {
                const rx = Math.random() * w;
                const ry = Math.random() * h;
                const shade = Math.random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)';
                ctx.fillStyle = shade;
                ctx.fillRect(rx, ry, 2, 2);
            }

            // Grid lines (tile effect)
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, w, h);

            // Subtle cross pattern
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.beginPath();
            ctx.moveTo(w / 2, 0);
            ctx.lineTo(w / 2, h);
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();
        });

        // 4. Shadow (64x64): Soft drop shadow
        this.assets.shadow = createTexture(64, 64, (ctx, w, h) => {
            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, 35);
            grad.addColorStop(0, 'rgba(0,0,0,0.6)');
            grad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        });
    }

    // Box templates for Hunter Assassin style - each is [cells] relative to origin
    getBoxTemplates() {
        return [
            // 1x1 small crate
            { cells: [[0, 0]], weight: 3 },
            // 2x1 horizontal crate
            { cells: [[0, 0], [1, 0]], weight: 4 },
            // 1x2 vertical crate (good for walls)
            { cells: [[0, 0], [0, 1]], weight: 4 },
            // 2x2 large crate
            { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], weight: 3 },
            // 3x1 long horizontal
            { cells: [[0, 0], [1, 0], [2, 0]], weight: 2 },
            // 1x3 long vertical
            { cells: [[0, 0], [0, 1], [0, 2]], weight: 2 },
            // L-shape bottom-left
            { cells: [[0, 0], [0, 1], [1, 1]], weight: 2 },
            // L-shape top-right
            { cells: [[0, 0], [1, 0], [1, 1]], weight: 2 },
            // L-shape bottom-right
            { cells: [[0, 0], [1, 0], [0, 1]], weight: 2 },
            // L-shape top-left
            { cells: [[1, 0], [0, 1], [1, 1]], weight: 2 },
            // 3x2 block
            { cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], weight: 1 },
            // 2x3 block
            { cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]], weight: 1 }
        ];
    }

    // Check if a box can be placed - simpler validation
    canPlaceBox(map, cells, ox, oy, width, height) {
        // Check if all cells are within bounds and empty
        for (let [dx, dy] of cells) {
            const x = ox + dx;
            const y = oy + dy;

            // Bounds check with padding for borders (need 1 tile gap from edge)
            if (x < 2 || x >= width - 2 || y < 2 || y >= height - 2) return false;

            // Already occupied
            if (map[y][x] === 1) return false;
        }

        // Check that we don't create a 1-tile gap by looking at immediate surroundings
        // Only count non-border existing walls
        for (let [dx, dy] of cells) {
            const x = ox + dx;
            const y = oy + dy;

            // Count adjacent existing walls (not counting border or cells we're about to place)
            let adjacentWallCount = 0;
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

            for (let [ddx, ddy] of directions) {
                const nx = x + ddx;
                const ny = y + ddy;

                // Check if this neighbor is an existing wall (not part of current template)
                if (map[ny] && map[ny][nx] === 1) {
                    // Check if this is part of current template
                    const isCurrentTemplate = cells.some(([cdx, cdy]) =>
                        ox + cdx === nx && oy + cdy === ny
                    );
                    if (!isCurrentTemplate) {
                        adjacentWallCount++;
                    }
                }
            }

            // If cell would be surrounded by 3+ existing walls, skip (too cramped)
            if (adjacentWallCount >= 3) return false;
        }

        return true;
    }

    // Place a box on the map
    placeBox(map, cells, ox, oy) {
        for (let [dx, dy] of cells) {
            map[oy + dy][ox + dx] = 1;
        }
    }

    // Flood fill to check connectivity
    floodFill(map, startX, startY, width, height) {
        const visited = Array(height).fill().map(() => Array(width).fill(false));
        const stack = [[startX, startY]];
        let count = 0;

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            if (visited[y][x] || map[y][x] === 1) continue;

            visited[y][x] = true;
            count++;

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }

        return { visited, count };
    }

    generateHunterMap(width, height) {
        // 1. Initialize with floor (0)
        let map = Array(height).fill().map(() => Array(width).fill(0));

        // 2. Create border walls
        for (let x = 0; x < width; x++) {
            map[0][x] = 1;
            map[height - 1][x] = 1;
        }
        for (let y = 0; y < height; y++) {
            map[y][0] = 1;
            map[y][width - 1] = 1;
        }

        // 3. Get templates and compute weighted selection
        const templates = this.getBoxTemplates();
        const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);

        const selectTemplate = () => {
            let r = Math.random() * totalWeight;
            for (let t of templates) {
                r -= t.weight;
                if (r <= 0) return t;
            }
            return templates[0];
        };

        // 4. Place boxes in the interior
        // Calculate target based on INTERIOR space only (exclude border)
        const interiorWidth = width - 2;
        const interiorHeight = height - 2;
        const interiorTiles = interiorWidth * interiorHeight;
        const targetInteriorWalls = Math.floor(interiorTiles * 0.25); // 25% of interior

        let interiorWallCount = 0;
        let attempts = 0;
        const maxAttempts = 800;

        while (interiorWallCount < targetInteriorWalls && attempts < maxAttempts) {
            attempts++;

            const template = selectTemplate();
            // Place within interior bounds (avoiding border)
            const ox = Math.floor(Math.random() * (interiorWidth - 2)) + 2;
            const oy = Math.floor(Math.random() * (interiorHeight - 2)) + 2;

            if (this.canPlaceBox(map, template.cells, ox, oy, width, height)) {
                this.placeBox(map, template.cells, ox, oy);
                interiorWallCount += template.cells.length;
            }
        }

        // 5. Post-process: Remove any isolated floor sections
        // Find largest connected floor area and remove smaller isolated areas
        let largestCount = 0;
        let largestVisited = null;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (map[y][x] === 0) {
                    const { visited, count } = this.floodFill(map, x, y, width, height);
                    if (count > largestCount) {
                        largestCount = count;
                        largestVisited = visited;
                    }
                }
            }
        }

        // Fill in isolated floor tiles (not part of largest area)
        if (largestVisited) {
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    if (map[y][x] === 0 && !largestVisited[y][x]) {
                        map[y][x] = 1; // Fill isolated areas
                    }
                }
            }
        }

        // 6. Widen any remaining 1-tile corridors by removing walls
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (map[y][x] === 0) {
                    // Check if this is a 1-tile horizontal corridor
                    const leftWall = map[y][x - 1] === 1;
                    const rightWall = map[y][x + 1] === 1;
                    const topFloor = map[y - 1] && map[y - 1][x] === 0;
                    const bottomFloor = map[y + 1] && map[y + 1][x] === 0;

                    if (leftWall && rightWall && !topFloor && !bottomFloor) {
                        // 1-tile vertical gap - widen by removing one adjacent wall
                        if (Math.random() > 0.5 && x + 1 < width - 1) {
                            map[y][x + 1] = 0;
                        } else if (x - 1 > 0) {
                            map[y][x - 1] = 0;
                        }
                    }

                    // Check if this is a 1-tile vertical corridor
                    const topWall = map[y - 1] && map[y - 1][x] === 1;
                    const bottomWall = map[y + 1] && map[y + 1][x] === 1;
                    const leftFloor = map[y][x - 1] === 0;
                    const rightFloor = map[y][x + 1] === 0;

                    if (topWall && bottomWall && !leftFloor && !rightFloor) {
                        // 1-tile horizontal gap - widen
                        if (Math.random() > 0.5 && y + 1 < height - 1) {
                            map[y + 1][x] = 0;
                        } else if (y - 1 > 0) {
                            map[y - 1][x] = 0;
                        }
                    }
                }
            }
        }

        console.log(`Hunter Map generated: ${width}x${height}, ${interiorWallCount} interior walls placed, ${attempts} attempts`);
        return map;
    }

    // Keep old name for compatibility but redirect to new generator
    generateClusterMap(width, height) {
        return this.generateHunterMap(width, height);
    }

    findValidSpawn() {
        // Try random spots until floor
        let x, y;
        do {
            x = Math.floor(Math.random() * (this.mapWidth - 2)) + 1;
            y = Math.floor(Math.random() * (this.mapHeight - 2)) + 1;
        } while (this.maze[y][x] !== 0);
        return { x, y };
    }

    findAndMovePath(targetX, targetY) {
        const startX = Math.floor(this.player.x / this.gridSize);
        const startY = Math.floor(this.player.y / this.gridSize);
        const endX = Math.floor(targetX / this.gridSize);
        const endY = Math.floor(targetY / this.gridSize);

        // Bounds check
        if (endX < 0 || endX >= this.mapWidth || endY < 0 || endY >= this.mapHeight) return;

        this.finder.findPath(startX, startY, endX, endY, (path) => {
            if (path) {
                this.followPath(path);
            }
        });
        this.finder.calculate();
    }

    followPath(path) {
        if (path.length === 0) return;
        // Use the Assassin class's built-in seek movement
        this.player.setPath(path);
    }

    addGhost(x, y, angle) {
        this.ghosts.push(new Ghost(x, y, angle));
    }
}

