"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { changePicture } from "@/data/change-picture";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function HeroAvatar() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dynamicAvatarUrl = changePicture();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  const getShyAvatarUrl = () => {
    return currentTheme === "dark" ? "/me-dark-shy.png" : "/me-light-shy.png";
  };

  const avatarUrl = mounted ? (isHovered ? getShyAvatarUrl() : dynamicAvatarUrl) : DATA.avatarUrl;

  return (
    <Avatar
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="size-40 md:size-48 border rounded-xl shadow-lg ring-4 ring-muted cursor-pointer">
      <AvatarImage
        className={cn("object-contain transition-all duration-300", {
          "scale-[200%]": !isHovered,
          "scale-[210%]": isHovered,
          "scale-[240%]": theme === "light",
        })}
        alt={DATA.name}
        src={avatarUrl}
      />
      <AvatarFallback>{DATA.initials}</AvatarFallback>
    </Avatar>
  );
}
