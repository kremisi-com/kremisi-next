"use client";
import { useTransitionContext } from "@/context/transition-context/transition-context";
import { Link, usePathname } from "@/i18n/navigation";

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
