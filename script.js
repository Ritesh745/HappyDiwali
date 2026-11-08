/* =========================================
   DIWALI MAGIC - INTERACTIVE JAVASCRIPT
========================================= */

const body = document.body;

const lightButton = document.getElementById("lightButton");
const againButton = document.getElementById("againButton");

const welcomeScreen = document.getElementById("welcomeScreen");
const celebrationScreen = document.getElementById("celebrationScreen");

const lightString = document.getElementById("lightString");
const fireworksCanvas = document.getElementById("fireworks");
const ctx = fireworksCanvas.getContext("2d");

const soundButton = document.getElementById("soundButton");

let isLit = false;
let soundEnabled = false;

let fireworks = [];
let particles = [];
let animationFrame;

let audioContext = null;
let soundTimer = null;

/* =========================================
   1. HANGING FESTIVE LIGHTS
========================================= */

function createLights() {
    for (let i = 0; i < 32; i++) {
        const light = document.createElement("div");
        light.className = "hanging-light";

        lightString.appendChild(light);

        setTimeout(() => {
            light.classList.add("lit");
        }, 2500 + i * 100);
    }
}

createLights();

/* =========================================
   2. CANVAS RESIZE
========================================= */

function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    fireworksCanvas.width = window.innerWidth * ratio;
    fireworksCanvas.height = window.innerHeight * ratio;

    fireworksCanvas.style.width = window.innerWidth + "px";
    fireworksCanvas.style.height = window.innerHeight + "px";

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* =========================================
   3. LIGHT THE DIYA
========================================= */

function lightDiya() {
    if (isLit) return;

    isLit = true;

    body.classList.add("lit-mode");

    // Change button state
    lightButton.innerHTML = "✨ The magic has begun!";

    lightButton.disabled = true;

    // Gradually reveal the festive scene
    setTimeout(() => {
        welcomeScreen.style.opacity = "0";
        welcomeScreen.style.transform = "translateY(-30px)";
    }, 800);

    setTimeout(() => {
        welcomeScreen.style.display = "none";

        celebrationScreen.style.display = "block";

        requestAnimationFrame(() => {
            celebrationScreen.classList.add("show");
        });

    }, 2400);

    // Start Diwali effects
    setTimeout(() => {
        startFireworks();
        createBurst(window.innerWidth / 2, window.innerHeight / 2);
        startPetals();
    }, 1300);

    // More fireworks during celebration
    setTimeout(() => {
        createBurst(
            window.innerWidth * 0.2,
            window.innerHeight * 0.3
        );
    }, 3500);

    setTimeout(() => {
        createBurst(
            window.innerWidth * 0.8,
            window.innerHeight * 0.25
        );
    }, 5000);

    // Start sound if the user enabled it
    if (soundEnabled) {
        startAmbientSound();
    }
}

lightButton.addEventListener("click", lightDiya);

/* =========================================
   4. FIREWORK PARTICLE CLASS
========================================= */

class Particle {
    constructor(x, y, color, velocityX, velocityY, size) {
        this.x = x;
        this.y = y;

        this.velocityX = velocityX;
        this.velocityY = velocityY;

        this.color = color;
        this.size = size;

        this.alpha = 1;
        this.gravity = 0.045;

        this.friction = 0.985;
        this.decay = 0.008 + Math.random() * 0.012;
    }

    update() {
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        this.velocityY += this.gravity;

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.alpha -= this.decay;
        this.size *= 0.995;
    }

    draw() {
        ctx.save();

        ctx.globalAlpha = Math.max(0, this.alpha);

        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            Math.max(0, this.size),
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}

/* =========================================
   5. FIREWORK BURST
========================================= */

const fireworkColors = [
    "#ffd166",
    "#ff6b35",
    "#ff3d81",
    "#ffffff",
    "#70e1ff",
    "#c6ff73",
    "#d8a6ff",
    "#ffcc66"
];

function createBurst(x, y) {
    const color = fireworkColors[
        Math.floor(Math.random() * fireworkColors.length)
    ];

    const count = 75 + Math.floor(Math.random() * 45);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;

        const speed = 1.2 + Math.random() * 5;

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        particles.push(
            new Particle(
                x,
                y,
                color,
                vx,
                vy,
                1.5 + Math.random() * 2.5
            )
        );
    }

    // Extra sparkling particles
    for (let i = 0; i < 20; i++) {
        particles.push(
            new Particle(
                x,
                y,
                "#fff2bf",
                (Math.random() - 0.5) * 9,
                (Math.random() - 0.5) * 9,
                1 + Math.random() * 2
            )
        );
    }
}

/* =========================================
   6. FIREWORK ROCKETS
========================================= */

class Rocket {
    constructor() {
        this.x = Math.random() * window.innerWidth;

        this.y = window.innerHeight + 10;

        this.targetY = 70 + Math.random() * window.innerHeight * 0.45;

        this.velocityY = -(7 + Math.random() * 4);

        this.color = fireworkColors[
            Math.floor(Math.random() * fireworkColors.length)
        ];

        this.exploded = false;
    }

    update() {
        this.y += this.velocityY;
        this.velocityY += 0.035;

        if (this.y <= this.targetY || this.velocityY >= 0) {
            this.explode();
        }
    }

    draw() {
        ctx.save();

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    explode() {
        if (this.exploded) return;

        this.exploded = true;
        createBurst(this.x, this.y);
    }
}

/* =========================================
   7. FIREWORK ANIMATION LOOP
========================================= */

let rockets = [];
let lastRocketTime = 0;

function animateFireworks(time) {
    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    // Launch rockets at intervals
    if (isLit && time - lastRocketTime > 900) {
        if (Math.random() > 0.25) {
            rockets.push(new Rocket());
        }

        lastRocketTime = time;
    }

    // Update rockets
    rockets.forEach(rocket => {
        rocket.update();
        rocket.draw();
    });

    rockets = rockets.filter(rocket => !rocket.exploded);

    // Update particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    particles = particles.filter(
        particle => particle.alpha > 0 && particle.size > 0.2
    );

    animationFrame = requestAnimationFrame(animateFireworks);
}

function startFireworks() {
    if (animationFrame) return;

    animationFrame = requestAnimationFrame(animateFireworks);
}

/* =========================================
   8. FLOATING MARIGOLD PETALS
========================================= */

function createPetal() {
    const petal = document.createElement("div");

    petal.className = "petal";

    const symbols = ["✿", "✧", "❀", "✦", "•"];

    petal.textContent = symbols[
        Math.floor(Math.random() * symbols.length)
    ];

    petal.style.left = Math.random() * 100 + "vw";

    petal.style.top = "-30px";

    petal.style.fontSize = (10 + Math.random() * 17) + "px";

    petal.style.animationDuration = (6 + Math.random() * 7) + "s";

    document.body.appendChild(petal);

    setTimeout(() => petal.remove(), 14000);
}

let petalInterval;

function startPetals() {
    if (petalInterval) return;

    petalInterval = setInterval(createPetal, 350);
}

/* =========================================
   9. AMBIENT FESTIVE SOUND
   Generated using Web Audio API
========================================= */

function startAmbientSound() {
    if (!audioContext) {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    if (soundTimer) return;

    function playBell() {
        if (!soundEnabled || !audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";

        // Soft, bell-like tones
        const notes = [523.25, 659.25, 783.99, 1046.5];

        const frequency = notes[
            Math.floor(Math.random() * notes.length)
        ];

        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.08,
            audioContext.currentTime + 0.03
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 1.5
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(audioContext.currentTime + 1.6);
    }

    playBell();

    soundTimer = setInterval(playBell, 2200);
}

function stopAmbientSound() {
    if (soundTimer) {
        clearInterval(soundTimer);
        soundTimer = null;
    }
}

/* =========================================
   10. SOUND BUTTON
========================================= */

soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        soundButton.innerHTML = "♫ <span>Sound On</span>";

        if (isLit) {
            startAmbientSound();
        }
    } else {
        soundButton.innerHTML = "♪ <span>Sound Off</span>";
        stopAmbientSound();
    }
});

/* =========================================
   11. CELEBRATE AGAIN
========================================= */

againButton.addEventListener("click", () => {

    // Reset visual states
    isLit = false;

    body.classList.remove("lit-mode");

    welcomeScreen.style.display = "block";
    welcomeScreen.style.opacity = "0";
    welcomeScreen.style.transform = "translateY(25px)";

    celebrationScreen.classList.remove("show");
    celebrationScreen.style.display = "none";
    celebrationScreen.style.opacity = "0";

    // Clear previous fireworks
    fireworks = [];
    particles = [];
    rockets = [];

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    // Stop animations
    cancelAnimationFrame(animationFrame);
    animationFrame = null;

    clearInterval(petalInterval);
    petalInterval = null;

    document.querySelectorAll(".petal").forEach(
        petal => petal.remove()
    );

    // Turn off hanging lights
    document.querySelectorAll(".hanging-light").forEach(
        light => light.classList.remove("lit")
    );

    // Reset button
    lightButton.disabled = false;
    lightButton.innerHTML = "🪔 Light the Diya";

    // Show opening screen again
    setTimeout(() => {
        welcomeScreen.style.opacity = "1";
        welcomeScreen.style.transform = "translateY(0)";
    }, 100);

    // Restart sound only if enabled
    stopAmbientSound();

    if (soundEnabled) {
        startAmbientSound();
    }
});