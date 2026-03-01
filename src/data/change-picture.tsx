"use client";

import { useTheme } from "next-themes";

export function changePicture() {
  const { theme } = useTheme();

  return theme === "dark" ? "/me-dark.png" : "/me-light.jpg";
}
