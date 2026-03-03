import confetti from "canvas-confetti";

export const triggerRandomConfetti = () => {
    const effectVariations = [
        // 1. Fireworks
        () => {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
            return () => clearInterval(interval);
        },
        // 2. Realistic Look
        () => {
            const count = 200;
            const defaults = { origin: { y: 0.7 } };

            function fire(particleRatio: number, opts: any) {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio)
                });
            }

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });

            return () => { }; // Cleanup not needed
        },
        // 3. School Pride (Left to Right)
        () => {
            const end = Date.now() + 3000;
            const colors = ['#bb0000', '#ffffff', '#0000bb', '#00bb00', '#bbbb00'];

            (function frame() {
                confetti({
                    particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: colors
                });
                confetti({
                    particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

            return () => { }; // Cleanup handled by date end
        }
    ];

    // Pick a random effect and run it
    const randomEffect = effectVariations[Math.floor(Math.random() * effectVariations.length)];
    return randomEffect();
};
