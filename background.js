const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

// Performance optimization
let animationId;
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

// Set canvas size to window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reinitialize elements after resize
    initializeElements();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Arrays for different elements
const stars = [];
const shootingStars = [];
const particles = [];
const nebulaClouds = [];

// Configuration
const config = {
    stars: {
        count: Math.min(200, Math.floor((canvas.width * canvas.height) / 8000)),
        maxRadius: 2.5,
        minRadius: 0.5,
        twinkleSpeed: 0.02
    },
    shootingStars: {
        count: 2,
        trailLength: 25,
        speed: { min: 3, max: 8 }
    },
    particles: {
        count: Math.min(80, Math.floor((canvas.width * canvas.height) / 15000)),
        maxRadius: 1.5,
        minRadius: 0.3
    },
    nebula: {
        layers: 4,
        animationSpeed: 0.0005
    }
};

// Enhanced Star class
class Star {
    constructor() {
        this.reset();
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * config.stars.twinkleSpeed + 0.005;
        this.color = this.getStarColor();
        this.brightness = Math.random() * 0.8 + 0.2;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * (config.stars.maxRadius - config.stars.minRadius) + config.stars.minRadius;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.8 + 0.2;
    }

    getStarColor() {
        const colors = [
            { r: 255, g: 255, b: 255 },  // White
            { r: 0, g: 212, b: 255 },    // Cyan
            { r: 255, g: 182, b: 193 },  // Light pink
            { r: 173, g: 216, b: 230 },  // Light blue
            { r: 255, g: 255, b: 224 },  // Light yellow
            { r: 255, g: 107, b: 157 }   // Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
        const twinkle = Math.sin(this.twinklePhase) * 0.4 + 0.6;
        const currentOpacity = this.opacity * twinkle * this.brightness;
        
        // Main star
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentOpacity})`;
        ctx.fill();
        
        // Glow effect for larger stars
        if (this.radius > 1.8) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentOpacity * 0.15})`;
            ctx.fill();
        }
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.twinklePhase += this.twinkleSpeed;

        // Wrap around edges
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
    }
}

// Enhanced Shooting Star class
class ShootingStar {
    constructor() {
        this.reset();
        this.trail = [];
        this.trailLength = config.shootingStars.trailLength;
        this.color = { r: 0, g: 212, b: 255 };
    }

    reset() {
        // Start from random edge
        const edge = Math.floor(Math.random() * 4);
        switch(edge) {
            case 0: // Top
                this.x = Math.random() * canvas.width;
                this.y = -50;
                break;
            case 1: // Right
                this.x = canvas.width + 50;
                this.y = Math.random() * canvas.height;
                break;
            case 2: // Bottom
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 50;
                break;
            case 3: // Left
                this.x = -50;
                this.y = Math.random() * canvas.height;
                break;
        }
        
        // Random direction towards center with some variation
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(centerY - this.y, centerX - this.x) + (Math.random() - 0.5) * 0.8;
        const speed = Math.random() * (config.shootingStars.speed.max - config.shootingStars.speed.min) + config.shootingStars.speed.min;
        
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        this.opacity = 1;
        this.life = 120;
        this.trail = [];
    }

    draw() {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const trailOpacity = (i / this.trail.length) * this.opacity * 0.6;
            const radius = (i / this.trail.length) * 2 + 0.5;
            
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${trailOpacity})`;
            ctx.fill();
        }

        // Draw main shooting star
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();

        // Add bright glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.3})`;
        ctx.fill();
    }

    update() {
        // Add current position to trail
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.pop();
        }

        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.opacity = Math.max(0, this.life / 120);

        // Reset when off screen or life ends
        if (this.isOffScreen() || this.life <= 0) {
            setTimeout(() => this.reset(), Math.random() * 5000 + 2000);
        }
    }

    isOffScreen() {
        return this.x < -100 || this.x > canvas.width + 100 || 
               this.y < -100 || this.y > canvas.height + 100;
    }
}

// Floating Particle class
class Particle {
    constructor() {
        this.reset();
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * (config.particles.maxRadius - config.particles.minRadius) + config.particles.minRadius;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.color = { r: 0, g: 212, b: 255 };
    }

    draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        const currentOpacity = this.opacity * pulse;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentOpacity})`;
        ctx.fill();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulsePhase += this.pulseSpeed;

        // Wrap around edges
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
    }
}

// Nebula Cloud class
class NebulaCloud {
    constructor(index) {
        this.index = index;
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 300 + 200;
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.speedY = (Math.random() - 0.5) * 0.1;
        this.opacity = Math.random() * 0.15 + 0.05;
        this.color = this.getNebulaColor();
    }

    getNebulaColor() {
        const colors = [
            { r: 75, g: 0, b: 130 },    // Indigo
            { r: 72, g: 61, b: 139 },   // Dark slate blue
            { r: 0, g: 212, b: 255 },   // Cyan
            { r: 255, g: 107, b: 157 }, // Pink
            { r: 138, g: 43, b: 226 }   // Blue violet
        ];
        return colors[this.index % colors.length];
    }

    draw(time) {
        const offsetX = Math.sin(time * config.nebula.animationSpeed + this.index) * 30;
        const offsetY = Math.cos(time * config.nebula.animationSpeed * 0.7 + this.index) * 20;
        
        const gradient = ctx.createRadialGradient(
            this.x + offsetX, this.y + offsetY, 0,
            this.x + offsetX, this.y + offsetY, this.radius
        );
        
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < -this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = -this.radius;
    }
}

// Initialize all elements
function initializeElements() {
    // Clear existing arrays
    stars.length = 0;
    shootingStars.length = 0;
    particles.length = 0;
    nebulaClouds.length = 0;

    // Create stars
    for (let i = 0; i < config.stars.count; i++) {
        stars.push(new Star());
    }

    // Create shooting stars
    for (let i = 0; i < config.shootingStars.count; i++) {
        shootingStars.push(new ShootingStar());
    }

    // Create particles
    for (let i = 0; i < config.particles.count; i++) {
        particles.push(new Particle());
    }

    // Create nebula clouds
    for (let i = 0; i < config.nebula.layers; i++) {
        nebulaClouds.push(new NebulaCloud(i));
    }
}

// Mouse interaction
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let mouseInfluence = 0;

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouseInfluence = 1;
});

canvas.addEventListener('mouseleave', () => {
    mouseInfluence = 0;
});

function drawMouseEffect() {
    if (mouseInfluence > 0) {
        const gradient = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,
            mouse.x, mouse.y, 150
        );
        gradient.addColorStop(0, `rgba(0, 212, 255, ${0.1 * mouseInfluence})`);
        gradient.addColorStop(0.5, `rgba(255, 107, 157, ${0.05 * mouseInfluence})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Gradually reduce mouse influence
        mouseInfluence *= 0.95;
    }
}

// Constellation connections (optimized)
function drawConstellations() {
    if (Math.random() < 0.1) { // Only draw occasionally for performance
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < Math.min(stars.length, 50); i += 5) {
            for (let j = i + 5; j < Math.min(stars.length, 50); j += 5) {
                const star1 = stars[i];
                const star2 = stars[j];
                const distance = Math.sqrt((star1.x - star2.x) ** 2 + (star1.y - star2.y) ** 2);
                
                if (distance < 120 && Math.random() < 0.003) {
                    ctx.beginPath();
                    ctx.moveTo(star1.x, star1.y);
                    ctx.lineTo(star2.x, star2.y);
                    ctx.stroke();
                }
            }
        }
    }
}

// Main animation loop with performance optimization
function animate(currentTime) {
    if (currentTime - lastTime >= frameInterval) {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.3, '#1a0a2e');
        gradient.addColorStop(0.7, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw nebula clouds
        nebulaClouds.forEach(cloud => {
            cloud.draw(currentTime);
            cloud.update();
        });
        
        // Draw constellations
        drawConstellations();
        
        // Draw and update particles
        particles.forEach(particle => {
            particle.draw();
            particle.update();
        });
        
        // Draw and update stars
        stars.forEach(star => {
            star.draw();
            star.update();
        });
        
        // Draw and update shooting stars
        shootingStars.forEach(shootingStar => {
            shootingStar.draw();
            shootingStar.update();
        });
        
        // Draw mouse effect
        drawMouseEffect();
        
        lastTime = currentTime;
    }
    
    animationId = requestAnimationFrame(animate);
}

// Initialize and start animation
initializeElements();
animate(0);

// Cleanup function
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});
