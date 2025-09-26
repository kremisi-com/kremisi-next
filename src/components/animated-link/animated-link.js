"use client";
import Link from "next/link";
import { useTransitionContext } from "@/context/transition-context/transition-context";

export default function AnimatedLink({ href, children, ...props }) {
    const { triggerAnimation } = useTransitionContext();

    const handleClick = () => {
        triggerAnimation();
    };

    return (
        <Link href={href} {...props} onClick={handleClick}>
            {children}
        </Link>
    );
}
