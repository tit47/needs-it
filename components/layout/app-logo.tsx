import Image from "next/image";
import { cn } from "@/utils/cn";

export type AppLogoVariant = "on-brand" | "on-surface";
export type AppLogoSize = "sm" | "md" | "lg";

const sizeMap: Record<AppLogoSize, { className: string; width: number; height: number }> = {
  sm: { className: "h-8 w-auto", width: 96, height: 32 },
  md: { className: "h-12 w-auto", width: 144, height: 48 },
  lg: { className: "h-[72px] w-auto", width: 216, height: 72 },
};

export interface AppLogoProps {
  variant?: AppLogoVariant;
  size?: AppLogoSize;
  className?: string;
  priority?: boolean;
}

export function AppLogo({
  variant = "on-brand",
  size = "md",
  className,
  priority = false,
}: AppLogoProps) {
  const { className: sizeClass, width, height } = sizeMap[size];
  const src = variant === "on-brand" ? "/logo.png" : "/logo-dark.png";

  return (
    <Image
      src={src}
      alt="Need's it"
      width={width}
      height={height}
      priority={priority}
      className={cn(sizeClass, className)}
    />
  );
}
