"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { changePicture } from "@/data/change-picture";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function HeroAvatar() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dynamicAvatarUrl = changePicture();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const avatarUrl = mounted ? dynamicAvatarUrl : DATA.avatarUrl;

  return (
    <Avatar className="size-40 md:size-48 border rounded-xl shadow-lg ring-4 ring-muted">
      <AvatarImage
        className={cn("object-cover scale-[120%]", {
          "object-contain scale-[300%]": theme === "light",
        })}
        alt={DATA.name}
        src={avatarUrl}
      />
      <AvatarFallback>{DATA.initials}</AvatarFallback>
    </Avatar>
  );
}
