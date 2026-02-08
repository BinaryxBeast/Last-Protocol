/**
 * Antigravity (AG) - A lightweight game engine mock
 * Mimics the structure requested by the user: AG.Scene, AG.Game
 */

const AG = {
    Game: class {
        constructor(config) {
            this.width = config.width || 800;
            this.height = config.height || 600;
            this.parent = config.parent || document.body;
            this.scenes = {};
            this.currentScene = null;
            this.lastTime = 0;

            // Create Canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.ctx = this.canvas.getContext('2d');

            if (typeof this.parent === 'string') {
                document.getElementById(this.parent).appendChild(this.canvas);
            } else {
                this.parent.appendChild(this.canvas);
            }

            // Bind loop
            this.loop = this.loop.bind(this);
            requestAnimationFrame(this.loop);
        }

        addScene(key, sceneClass) {
            this.scenes[key] = new sceneClass();
            this.scenes[key].game = this;
            this.scenes[key].width = this.width;
            this.scenes[key].height = this.height;
            this.scenes[key].key = key;
        }

        start(key) {
            if (this.currentScene) {
                // simple cleanup if needed
            }
            this.currentScene = this.scenes[key];
            if (this.currentScene) {
                console.log(`Starting scene: ${key}`);
                this.currentScene.create();
            } else {
                console.error(`Scene ${key} not found!`);
            }
        }

        loop(timestamp) {
            const deltaTime = timestamp - this.lastTime;
            this.lastTime = timestamp;

            if (this.currentScene) {
                this.ctx.clearRect(0, 0, this.width, this.height);
                this.currentScene.update(deltaTime, timestamp);
                this.currentScene.render(this.ctx);
            }

            requestAnimationFrame(this.loop);
        }
    },

    Scene: class {
        constructor(key) {
            this.key = key;
            this.children = [];
            this.tweens = {
                active: [],
                add: (config) => this.addTween(config)
            };
            this.input = {
                on: (event, callback) => this.addOnInput(event, callback)
            };
            // Factory for adding objects
            this.add = {
                rectangle: (x, y, w, h, color) => {
                    const rect = new AG.Rectangle(x, y, w, h, color);
                    this.children.push(rect);
                    return rect;
                },
                text: (x, y, text, style) => {
                    const txt = new AG.Text(x, y, text, style);
                    this.children.push(txt);
                    return txt;
                },
                sprite: (x, y, key) => {
                    const spr = new AG.Sprite(x, y, key);
                    this.children.push(spr);
                    return spr;
                },
                tilemap: (mapData, tileSize) => {
                    const tm = new AG.Tilemap(mapData, tileSize);
                    this.children.push(tm);
                    return tm;
                },
                image: (x, y, key) => {
                    // For scanlines or background images
                    const img = new AG.Image(x, y, key);
                    this.children.push(img);
                    return img;
                }
            };
            // Scene management
            this.scene = {
                start: (key) => this.game.start(key)
            }
        }

        create() { /* Override me */ }
        update(dt, time) {
            // Update tweens
            this.tweens.active.forEach(t => t.update(dt));
            this.tweens.active = this.tweens.active.filter(t => !t.complete);

            // Update children
            this.children.forEach(c => {
                if (c.update) c.update(dt);
            });
        }

        render(ctx) {
            this.children.forEach(c => c.render(ctx));
        }

        addTween(config) {
            const tween = new AG.Tween(config);
            this.tweens.active.push(tween);
            return tween;
        }

        addOnInput(event, callback) {
            // Very basic input handling hooked to the canvas
            if (event === 'pointerdown') {
                this.game.canvas.addEventListener('mousedown', (e) => {
                    const rect = this.game.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    callback({ x, y });
                });
            }
        }
    },

    // --- Game Objects ---

    Rectangle: class {
        constructor(x, y, w, h, color) {
            this.x = x; this.y = y; this.width = w; this.height = h;
            this.color = typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : color;
            this.alpha = 1;
        }
        render(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
        setOrigin(x, y) { return this; } // Stub
    },

    Text: class {
        constructor(x, y, text, style) {
            this.x = x; this.y = y; this.text = text;
            this.style = style || {};
            this.originX = 0; this.originY = 0;
            this.alpha = 1;
        }
        setOrigin(x, y = x) {
            this.originX = x; this.originY = y;
            return this;
        }
        setInteractive() { return this; } // Stub for menu
        on(event, callback) {
            // Stub for button interactions in pure canvas
            // Real implementation would need hit testing
            return this;
        }
        setStyle(style) {
            Object.assign(this.style, style);
            return this;
        }
        render(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.font = `${this.style.fontWeight || ''} ${this.style.fontSize || '16px'} ${this.style.fontFamily || 'sans-serif'}`;
            ctx.fillStyle = this.style.color || '#fff';
            ctx.textAlign = 'center'; // Simplified
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    },

    Sprite: class {
        constructor(x, y, key) {
            this.x = x;
            this.y = y;
            this.key = key; // In a real engine, this looks up a texture
            this.angle = 0;
            this.scale = 1;
        }
        render(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(this.scale, this.scale);

            // Placeholder rendering if no image system
            if (this.key === 'assassin') {
                // Draw a simple glowing triangle for the player
                ctx.beginPath();
                ctx.moveTo(0, -10);
                ctx.lineTo(8, 10);
                ctx.lineTo(-8, 10);
                ctx.closePath();
                ctx.fillStyle = '#00ffcc';
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00ffcc';
                ctx.stroke();
            } else {
                ctx.fillStyle = 'red';
                ctx.fillRect(-10, -10, 20, 20);
            }
            ctx.restore();
        }
    },

    // For rendering the maze
    Tilemap: class {
        constructor(mapData, tileSize) {
            this.map = mapData;
            this.tileSize = tileSize;
            // Pre-render visuals can be optimized, but instant draw is fine for 32x32 grid
        }

        render(ctx) {
            const rows = this.map.length;
            const cols = this.map[0].length;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const tile = this.map[y][x];
                    const px = x * this.tileSize;
                    const py = y * this.tileSize;

                    if (tile === 1) {
                        // WALL
                        ctx.fillStyle = '#111';
                        ctx.fillRect(px, py, this.tileSize, this.tileSize);
                        // Neon border
                        ctx.strokeStyle = '#00ffcc';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
                    } else {
                        // FLOOR
                        ctx.fillStyle = '#222';
                        ctx.fillRect(px, py, this.tileSize, this.tileSize);
                        // Faint hex/grid pattern
                        ctx.strokeStyle = '#333';
                        ctx.lineWidth = 0.5;
                        ctx.strokeRect(px, py, this.tileSize, this.tileSize);
                    }
                }
            }
        }
    },

    Image: class {
        constructor(x, y, key) {
            this.x = x; this.y = y; this.key = key;
            this.width = 800; this.height = 600; // default full
            this.alpha = 1;
            this.player = null; // Reference for lighting
        }
        render(ctx) {
            if (this.key === 'scanlines') {
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                for (let i = 0; i < ctx.canvas.height; i += 4) {
                    ctx.fillRect(0, i, ctx.canvas.width, 1);
                }
                ctx.restore();
            } else if (this.key === 'lighting_overlay') {
                // Pseudo-3D Lighting
                if (!this.offscreenCanvas) {
                    this.offscreenCanvas = document.createElement('canvas');
                    this.offscreenCanvas.width = ctx.canvas.width;
                    this.offscreenCanvas.height = ctx.canvas.height;
                }
                const lCtx = this.offscreenCanvas.getContext('2d');

                // Clear offscreen
                lCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

                // 1. Dark Overlay
                lCtx.globalCompositeOperation = 'source-over';
                lCtx.fillStyle = 'rgba(0, 0, 0, 0.85)'; // Dark atmosphere
                lCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

                // 2. Cutout Circle around Player
                if (this.player && this.player.x !== undefined) {
                    lCtx.globalCompositeOperation = 'destination-out';

                    const p = this.player;
                    const radius = 200; // Light radius

                    // Create gradient for soft edge
                    const grad = lCtx.createRadialGradient(p.x, p.y, 50, p.x, p.y, radius);
                    grad.addColorStop(0, 'rgba(0, 0, 0, 1)'); // Clear center
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fade to dark

                    lCtx.fillStyle = grad;
                    lCtx.beginPath();
                    lCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                    lCtx.fill();
                }

                // 3. Draw offscreen lighting to main canvas
                ctx.drawImage(this.offscreenCanvas, 0, 0);
            }
        }
    },

    // --- Audio System ---
    Audio: class {
        constructor(url, loop = false, volume = 0.5) {
            this.url = url;
            this.loop = loop;
            this.volume = volume;
            this.audio = new Audio(url);
            this.audio.loop = loop;
            this.audio.volume = volume;
        }

        play() {
            // Don't reset currentTime here, allow resume
            const promise = this.audio.play();
            if (promise !== undefined) {
                promise.then(() => {
                    console.log("Audio playing: " + this.url);
                }).catch(error => {
                    console.warn("Audio playback prevented. Waiting for user interaction...", error);
                });
            }
        }

        stop() {
            this.audio.pause();
            this.audio.currentTime = 0;
        }

        // Add volume control
        setVolume(v) {
            this.volume = Math.max(0, Math.min(1, v));
            this.audio.volume = this.volume;
        }
    },

    Tween: class {
        constructor(config) {
            this.targets = config.targets;
            this.duration = config.duration || 1000;
            this.props = config.alpha || config.x || config.y ? config : {}; // Simplified
            this.elapsed = 0;
            this.complete = false;
            this.onComplete = config.onComplete;

            // simple linear interpolation for now
            this.startValues = {};
            if (config.x) this.startValues.x = this.targets.x;
            if (config.y) this.startValues.y = this.targets.y;

            this.endValues = {};
            if (config.x) this.endValues.x = typeof config.x === 'object' ? config.x.to : config.x;
            if (config.y) this.endValues.y = typeof config.y === 'object' ? config.y.to : config.y;
        }

        update(dt) {
            this.elapsed += dt;
            const progress = Math.min(this.elapsed / this.duration, 1);

            if (this.startValues.x !== undefined) {
                this.targets.x = this.startValues.x + (this.endValues.x - this.startValues.x) * progress;
            }
            if (this.startValues.y !== undefined) {
                this.targets.y = this.startValues.y + (this.endValues.y - this.startValues.y) * progress;
            }

            if (progress >= 1) {
                this.complete = true;
                if (this.onComplete) this.onComplete();
            }
        }
    }
};

window.AG = AG;
