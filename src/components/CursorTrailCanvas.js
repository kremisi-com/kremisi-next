"use client";
import { useEffect, useRef } from "react";

export default function CursorTrailCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let trail = [];

        const handleMouseMove = (e) => {
            mouse = { x: e.clientX, y: e.clientY };
            trail.push({ ...mouse, life: 1 });
            if (trail.length > 80) trail.shift(); // max punti
        };
        window.addEventListener("mousemove", handleMouseMove);

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // aggiorna e disegna la scia
            trail.forEach((p, i) => {
                p.life -= 0.02;
                const alpha = Math.max(p.life, 0);
                const radius = 1.5 * alpha;

                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
                ctx.shadowBlur = 5;
                ctx.shadowColor = "red";
                ctx.fill();
            });

            // rimuovi i morti
            trail = trail.filter((p) => p.life > 0);

            requestAnimationFrame(draw);
        }

        draw();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none",
                zIndex: 9999,
            }}
        />
    );
}
