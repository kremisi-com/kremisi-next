"use client";
import Link from "next/link";
import { useTransitionContext } from "@/context/transition-context/transition-context";
import { usePathname } from "next/navigation";

export default function AnimatedLink({ href, children, ...props }) {
    const { triggerAnimation, openLoader, closeLoader } =
        useTransitionContext();
    const path = usePathname();

    const handleClick = () => {
        if (path === href) return;
        openLoader();
    };

    return (
        <Link href={href} {...props} onClick={handleClick}>
            {children}
        </Link>
    );
}
