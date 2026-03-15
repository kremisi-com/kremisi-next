"use client";
import Link from "next/link";
import { useTransitionContext } from "@/context/transition-context/transition-context";
import { usePathname } from "next/navigation";

export default function AnimatedLink({ href, children, ...props }) {
    const { openLoader } = useTransitionContext();
    const path = usePathname();
    const isInternalPath = typeof href === "string" && href.startsWith("/");

    const handleClick = (e) => {
        if (props.onClick) props.onClick(e);
        if (!isInternalPath || path === href) return;
        openLoader();
    };

    return (
        <Link href={href} {...props} onClick={handleClick}>
            {children}
        </Link>
    );
}
