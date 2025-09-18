"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import styles from "./page-transition.module.css";

export default function PageTransition({ children }) {
    const pathname = usePathname();

    /* <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={styles.overlay}
            /> */
    return (
        <motion.div
            key={pathname} // cambia ad ogni route
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={styles.page}
        >
            {children}
        </motion.div>
    );
}
