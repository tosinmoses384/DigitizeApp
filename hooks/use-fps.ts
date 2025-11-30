import { useEffect, useRef } from 'react';

export const useFPS = () => {
    const frameCount = useRef(0);
    const lastTime = useRef(global.performance ? global.performance.now() : Date.now());
    const fps = useRef(0);

    useEffect(() => {
        let animationFrameId: number;

        const loop = () => {
            const now = global.performance ? global.performance.now() : Date.now();
            frameCount.current++;

            if (now - lastTime.current >= 1000) {
                fps.current = Math.round((frameCount.current * 1000) / (now - lastTime.current));
                console.log(`[Performance] JS FPS: ${fps.current}`);
                frameCount.current = 0;
                lastTime.current = now;
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
};
