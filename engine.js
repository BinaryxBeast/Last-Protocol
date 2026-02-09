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
    },

    // --- Procedural SFX Module (Director's Cut) ---
    SFX: {
        ctx: null,
        init: function () {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        },

        // Helper for noise buffer
        createNoiseBuffer: function () {
            if (!this.ctx) return null;
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            return buffer;
        },

        // --- UI SOUNDS ---

        // Click: "Mechanical Blue Switch" (Sharp, high-freq tack)
        playClick: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // Short, sharp burst
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(2000, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.05);
        },

        // Select: "Low-Pass Digital Chirp" (Muted beep)
        playSelect: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            const osc = this.ctx.createOscillator();
            osc.type = 'sine'; // Sine is naturally cleaner/muted compared to square
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.linearRampToValueAtTime(400, t + 0.1);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
        },

        // Ambient: "60Hz Sub-Drone + Steam Hiss"
        startAmbient: function () {
            if (!this.ctx) this.init();
            // Prevent multiple loops
            if (this.ambientOsc) return;

            const t = this.ctx.currentTime;

            // 1. The Drone (60Hz hum)
            this.ambientOsc = this.ctx.createOscillator();
            this.ambientOsc.type = 'sawtooth';
            this.ambientOsc.frequency.setValueAtTime(60, t);

            const humFilter = this.ctx.createBiquadFilter();
            humFilter.type = 'lowpass';
            humFilter.frequency.setValueAtTime(120, t); // Muffles the harsh saw

            const humGain = this.ctx.createGain();
            humGain.gain.setValueAtTime(0.05, t); // Very quiet

            this.ambientOsc.connect(humFilter);
            humFilter.connect(humGain);
            humGain.connect(this.ctx.destination);
            this.ambientOsc.start(t);

            // 2. The Steam Hiss (Random interval)
            this.steamInterval = setInterval(() => {
                if (this.ctx.state === 'running' && Math.random() > 0.7) {
                    this.playSteam();
                }
            }, 5000);
        },

        stopAmbient: function () {
            if (this.ambientOsc) {
                this.ambientOsc.stop();
                this.ambientOsc = null;
            }
            if (this.steamInterval) {
                clearInterval(this.steamInterval);
            }
        },

        playSteam: function () {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;

            const buffer = this.createNoiseBuffer();
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1000, t);
            filter.Q.value = 1;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.05, t + 0.5);
            gain.gain.linearRampToValueAtTime(0, t + 2.0);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + 2.0);
        },

        // --- GAMEPLAY SOUNDS ---

        // Footsteps: "Heavy Metal Grate" (Clink-Thud)
        playStep: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // Thud (Low impact)
            const thudOsc = this.ctx.createOscillator();
            thudOsc.type = 'square';
            thudOsc.frequency.setValueAtTime(50, t);
            thudOsc.frequency.exponentialRampToValueAtTime(10, t + 0.1);

            const thudGain = this.ctx.createGain();
            thudGain.gain.setValueAtTime(0.2, t);
            thudGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

            thudOsc.connect(thudGain);
            thudGain.connect(this.ctx.destination);
            thudOsc.start(t);
            thudOsc.stop(t + 0.1);

            // Clink (Metallic high end)
            const clinkOsc = this.ctx.createOscillator();
            clinkOsc.type = 'triangle';
            clinkOsc.frequency.setValueAtTime(800, t);

            const clinkGain = this.ctx.createGain();
            clinkGain.gain.setValueAtTime(0.05, t);
            clinkGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

            clinkOsc.connect(clinkGain);
            clinkGain.connect(this.ctx.destination);
            clinkOsc.start(t);
            clinkOsc.stop(t + 0.05);
        },

        // Dash: "Pneumatic Burst" (Air brake shhh + whir)
        playDash: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // 1. Air release (Noise)
            const buffer = this.createNoiseBuffer();
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(800, t);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.3, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + 0.3);

            // 2. Mechanical Whir (Rising Tone)
            const whirOsc = this.ctx.createOscillator();
            whirOsc.type = 'sawtooth';
            whirOsc.frequency.setValueAtTime(200, t);
            whirOsc.frequency.linearRampToValueAtTime(600, t + 0.2);

            const whirGain = this.ctx.createGain();
            whirGain.gain.setValueAtTime(0.1, t);
            whirGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

            whirOsc.connect(whirGain);
            whirGain.connect(this.ctx.destination);
            whirOsc.start(t);
            whirOsc.stop(t + 0.2);
        },

        // Robot Alert: "Bitcrushed Dual-Tone" (High-Low Siren)
        playAlert: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';

            // Dual tone pattern: High -> Low
            osc.frequency.setValueAtTime(880, t);
            osc.frequency.setValueAtTime(440, t + 0.15);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.setValueAtTime(0.1, t + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

            // Distortion for "Bitcrushed" feel
            const dist = this.ctx.createWaveShaper();
            dist.curve = this.makeDistortionCurve(400); // Heavy distortion
            dist.oversample = 'none';

            osc.connect(dist);
            dist.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.4);
        },

        makeDistortionCurve: function (amount) {
            const k = typeof amount === 'number' ? amount : 50,
                n_samples = 44100,
                curve = new Float32Array(n_samples),
                deg = Math.PI / 180;
            for (let i = 0; i < n_samples; ++i) {
                let x = i * 2 / n_samples - 1;
                curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
            }
            return curve;
        },

        // Robot Death: "Scrapyard Crunch + Spark"
        playKill: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // 1. Metallic Crunch (Low noise burst)
            const buffer = this.createNoiseBuffer();
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const lowFilter = this.ctx.createBiquadFilter();
            lowFilter.type = 'lowpass';
            lowFilter.frequency.setValueAtTime(300, t);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.5, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

            noise.connect(lowFilter);
            lowFilter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + 0.3);

            // 2. Spark (High zaps)
            const zapOsc = this.ctx.createOscillator();
            zapOsc.type = 'sawtooth';
            zapOsc.frequency.setValueAtTime(2000, t);
            zapOsc.frequency.linearRampToValueAtTime(100, t + 0.2); // Pitch drop

            const zapGain = this.ctx.createGain();
            zapGain.gain.setValueAtTime(0.1, t);
            zapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

            zapOsc.connect(zapGain);
            zapGain.connect(this.ctx.destination);
            zapOsc.start(t);
            zapOsc.stop(t + 0.2);
        },

        // Collect: "Glassy Synth Ping" (Major Key)
        playCollect: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // Major key Arpeggio (fast): C5, E5
            const notes = [523.25, 659.25];

            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t + i * 0.05);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0, t + i * 0.05);
                gain.gain.linearRampToValueAtTime(0.1, t + i * 0.05 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.05 + 0.4);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t + i * 0.05);
                osc.stop(t + i * 0.05 + 0.5);
            });
        },

        // Player Death: "The Flatline Boom"
        playDie: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // 1. Bass Drop
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.exponentialRampToValueAtTime(10, t + 1.0);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.linearRampToValueAtTime(0, t + 1.0);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.0);

            // 2. White Noise Static (fades in)
            const buffer = this.createNoiseBuffer();
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0, t);
            noiseGain.gain.linearRampToValueAtTime(0.2, t + 0.5);
            noiseGain.gain.linearRampToValueAtTime(0, t + 1.5);

            noise.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + 1.5);
        },

        // Level Win: "Rising Data Uplink"
        playWin: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // Fast ascending scale simulating data stream
            const freqs = [440, 554, 659, 880, 1108, 1318]; // A Major scale tones

            freqs.forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                osc.type = 'square';
                osc.frequency.setValueAtTime(f, t + i * 0.1);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.05, t + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t + i * 0.1);
                osc.stop(t + i * 0.1 + 0.2);
            });
        },

        // --- "LAST PROTOCOL" SIGNATURE SOUNDS ---

        // Enemy Idle Chatter: "Sub-Vocal Radio Hum"
        // Uses spatial params (distance 0-1)
        playChatter: function (distance, isMuffled) {
            if (!this.ctx) this.init();
            // throttle to prevent overlap chaos
            const t = this.ctx.currentTime;

            // 1. Radio Static Layer (Pink Noise)
            const buffer = this.createNoiseBuffer();
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            // 2. Vocoded Mumble (Sawtooth + Lowpass LFO)
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100 + Math.random() * 50, t); // Low pitch

            // LFO for "speech" rhythm
            const lfo = this.ctx.createOscillator();
            lfo.type = 'square';
            lfo.frequency.setValueAtTime(8 + Math.random() * 4, t); // Syllable rate

            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = 500;

            lfo.connect(lfoGain);
            // lfoGain.connect(osc.frequency); // FM Synthesis style speech

            // Filter
            const filter = this.ctx.createBiquadFilter();
            filter.type = isMuffled ? 'lowpass' : 'bandpass';
            filter.frequency.setValueAtTime(isMuffled ? 400 : 1200, t);
            filter.Q.value = 1;

            // Volume dropoff
            // distance is approx pixels, say max hearing range is 600
            const volume = Math.max(0, 1 - (distance / 600));
            if (volume <= 0) return; // Too far

            const masterGain = this.ctx.createGain();
            masterGain.gain.setValueAtTime(volume * 0.15, t); // Relatively quiet
            masterGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

            // Connect graph
            // noise -> filter -> master -> dest
            // osc -> filter -> master -> dest

            noise.connect(filter);
            osc.connect(filter);
            filter.connect(masterGain);
            masterGain.connect(this.ctx.destination);

            noise.start(t);
            osc.start(t);
            noise.stop(t + 0.5);
            osc.stop(t + 0.5);
        },

        // Suspicion: "The Dissonant Sting"
        playSuspicion: function () {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // Aggressive Metallic Pluck
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            // Dissonant interval (Tritone-ish)
            osc.frequency.setValueAtTime(587.33, t); // D5
            osc.frequency.exponentialRampToValueAtTime(580, t + 0.3); // Pitch bend down

            const osc2 = this.ctx.createOscillator();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(830.61, t); // G#5 (Tritone away)

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

            // Metallic Ring Filter
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2000, t);
            filter.frequency.exponentialRampToValueAtTime(100, t + 0.1);

            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc2.start(t);
            osc.stop(t + 0.3);
            osc2.stop(t + 0.3);
        },

        // Typewriter: "EMI Taps"
        playTypewriter: function (isDistorted) {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // Short burst of noise + click
            const buffer = this.createNoiseBuffer();
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(isDistorted ? 400 : 2000, t); // Distorted is lower/muddier or weird
            filter.Q.value = isDistorted ? 5 : 1;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(isDistorted ? 0.2 : 0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + 0.05);

            // Add a little pop for distortion
            if (isDistorted) {
                const osc = this.ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(50, t);
                osc.frequency.exponentialRampToValueAtTime(10, t + 0.1);

                const dGain = this.ctx.createGain();
                dGain.gain.setValueAtTime(0.2, t);
                dGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

                osc.connect(dGain);
                dGain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.1);
            }
        },

        // Heatbeat: "Industrial Throttle"
        // Intensity 0.0 to 1.0 (1.0 is danger/low health)
        lastHeartbeatTime: 0,
        playHeartbeat: function (intensity) {
            if (!this.ctx) this.init();
            const t = this.ctx.currentTime;

            // Formula: rate = 1.0 + (1.0 - health) -> mapped to intensity
            // intensity = (1 - health). So 0 health -> 1 intensity -> rate 2.0?
            // User formula: rate = 1 + intensity
            const rate = 1.0 + intensity * 2.0; // Speed multiplier
            const interval = 1.2 / rate; // Base interval ~1.2s

            if (t - this.lastHeartbeatTime >= interval) {
                this.lastHeartbeatTime = t;

                // 1. The Thump (Kick)
                const osc = this.ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.5 + intensity * 0.5, t); // Louder when intense
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.1);

                // 2. The Hiss (Steam release) - Increases with intensity
                if (intensity > 0.3) {
                    const buffer = this.createNoiseBuffer();
                    const noise = this.ctx.createBufferSource();
                    noise.buffer = buffer;

                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'highpass';
                    filter.frequency.setValueAtTime(1000, t);

                    const hissGain = this.ctx.createGain();
                    hissGain.gain.setValueAtTime(intensity * 0.3, t + 0.1); // Starts after thump
                    hissGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

                    noise.connect(filter);
                    filter.connect(hissGain);
                    hissGain.connect(this.ctx.destination);
                    noise.start(t + 0.1); // Delayed hiss
                    noise.stop(t + 0.4);
                }
            }
        }
    }
};

window.AG = AG;
