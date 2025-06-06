const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Arrays for different elements
const stars = [];
const shootingStars = [];
const particles = [];
const numStars = 200;
const numShootingStars = 3;
const numParticles = 50;

// Enhanced Star class
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.color = this.getStarColor();
    }

    getStarColor() {
        const colors = [
            'rgba(255, 255, 255, ',
            'rgba(100, 255, 218, ',
            'rgba(255, 182, 193, ',
            'rgba(173, 216, 230, ',
            'rgba(255, 255, 224, '
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
        const twinkle = Math.sin(this.twinklePhase) * 0.3 + 0.7;
        const currentOpacity = this.opacity * twinkle;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color + currentOpacity + ')';
        ctx.fill();
        
        // Add glow effect for larger stars
        if (this.radius > 1.5) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color + (currentOpacity * 0.2) + ')';
            ctx.fill();
        }
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.twinklePhase += this.twinkleSpeed;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
}

// Shooting Star class
class ShootingStar {
    constructor() {
        this.reset();
        this.trail = [];
        this.trailLength = 20;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.3;
        this.speedX = Math.random() * 8 + 4;
        this.speedY = Math.random() * 4 + 2;
        this.opacity = 1;
        this.life = 100;
        this.trail = [];
    }

    draw() {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const trailOpacity = (i / this.trail.length) * this.opacity * 0.5;
            
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2 - (i / this.trail.length), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 255, 218, ${trailOpacity})`;
            ctx.fill();
        }

        // Draw main shooting star
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();

        // Add bright glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 255, 218, ${this.opacity * 0.3})`;
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
        this.opacity = this.life / 100;

        // Reset when off screen or life ends
        if (this.x > canvas.width + 50 || this.y > canvas.height + 50 || this.life <= 0) {
            this.reset();
        }
    }
}

// Floating Particle class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.color = `rgba(100, 255, 218, ${this.opacity})`;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
}

// Initialize all elements
for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
}

for (let i = 0; i < numShootingStars; i++) {
    shootingStars.push(new ShootingStar());
}

for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
}

// Enhanced nebula effect
function drawNebula() {
    const time = Date.now() * 0.001;
    
    // Multiple nebula layers
    for (let i = 0; i < 3; i++) {
        const offsetX = Math.sin(time * 0.1 + i) * 50;
        const offsetY = Math.cos(time * 0.15 + i) * 30;
        
        const gradient = ctx.createRadialGradient(
            canvas.width / 2 + offsetX, canvas.height / 2 + offsetY, 0,
            canvas.width / 2 + offsetX, canvas.height / 2 + offsetY, canvas.width / (1.5 + i * 0.5)
        );
        
        const colors = [
            ['rgba(75, 0, 130, 0.15)', 'rgba(25, 25, 112, 0.1)', 'rgba(0, 0, 0, 0)'],
            ['rgba(72, 61, 139, 0.1)', 'rgba(106, 90, 205, 0.05)', 'rgba(0, 0, 0, 0)'],
            ['rgba(100, 255, 218, 0.05)', 'rgba(64, 224, 208, 0.03)', 'rgba(0, 0, 0, 0)']
        ];
        
        gradient.addColorStop(0, colors[i][0]);
        gradient.addColorStop(0.5, colors[i][1]);
        gradient.addColorStop(1, colors[i][2]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Constellation connections
function drawConstellations() {
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            const star1 = stars[i];
            const star2 = stars[j];
            const distance = Math.sqrt((star1.x - star2.x) ** 2 + (star1.y - star2.y) ** 2);
            
            if (distance < 150 && Math.random() < 0.002) {
                ctx.beginPath();
                ctx.moveTo(star1.x, star1.y);
                ctx.lineTo(star2.x, star2.y);
                ctx.stroke();
            }
        }
    }
}

// Mouse interaction
let mouse = { x: 0, y: 0 };
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function drawMouseEffect() {
    const gradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 100
    );
    gradient.addColorStop(0, 'rgba(100, 255, 218, 0.1)');
    gradient.addColorStop(1, 'rgba(100, 255, 218, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Animation loop
function animate() {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a0a2e');
    gradient.addColorStop(1, '#16213e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw nebula
    drawNebula();
    
    // Draw constellations occasionally
    if (Math.random() < 0.3) {
        drawConstellations();
    }
    
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
    
    requestAnimationFrame(animate);
}

animate();
