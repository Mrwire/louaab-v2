export const triggerConfetti = () => {
  // Animation confetti coeur
  const count = 20;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999
  };

  function fire(particleRatio: number, opts: any) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#FF6B9D', '#FFA07A', '#FF69B4', '#FFB6C1'];

    for (let i = 0; i < count * particleRatio; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        size: Math.random() * 8 + 4,
        speedY: -(Math.random() * 6 + 4),
        speedX: Math.random() * 4 - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        opacity: 1
      });
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX;
        particle.speedY += 0.2; // gravity
        particle.rotation += particle.rotationSpeed;
        particle.opacity -= 0.015;

        if (particle.opacity <= 0) {
          particles.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.opacity;
        
        // Dessiner un coeur
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        const size = particle.size;
        ctx.moveTo(0, size / 4);
        ctx.bezierCurveTo(-size / 2, -size / 4, -size, size / 8, 0, size);
        ctx.bezierCurveTo(size, size / 8, size / 2, -size / 4, 0, size / 4);
        ctx.fill();
        
        ctx.restore();
      });

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    }

    animate();
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
