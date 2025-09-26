"use client";
import Link from "next/link";
import { useTransitionContext } from "@/context/transition-context/transition-context";
import { usePathname } from "next/navigation";

export default function AnimatedLink({ href, children, ...props }) {
    const { triggerAnimation } = useTransitionContext();
    const path = usePathname();

    const handleClick = () => {
        console.log("Current path:", path);
        console.log("Link href:", href);
        if (path === href) return;
        triggerAnimation();
    };

    return (
        <Link href={href} {...props} onClick={handleClick}>
            {children}
        </Link>
    );
}
