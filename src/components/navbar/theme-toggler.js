"use client";
import { useTheme } from "next-themes";
import Button from "@/components/button/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ styles }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  // console.log("Current theme:", theme);
  // console.log("Resolved theme:", resolvedTheme);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Evita mismatch SSR/CSR

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button className={styles.icon} animation={false} onClick={toggleTheme}>
      {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
}
