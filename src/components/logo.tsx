import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "horizontal" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({
  variant = "horizontal",
  size = "md",
  className,
  showSubtitle = true,
}: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: "size-6",
      text: "text-base font-semibold",
      subtitle: "text-[9px] tracking-[0.22em]",
      gap: "gap-2",
    },
    md: {
      icon: "size-8",
      text: "text-lg font-semibold",
      subtitle: "text-[10px] tracking-[0.26em]",
      gap: "gap-2.5",
    },
    lg: {
      icon: "size-11",
      text: "text-2xl font-medium",
      subtitle: "text-xs tracking-[0.3em]",
      gap: "gap-3.5",
    },
    xl: {
      icon: "size-20",
      text: "text-4xl font-light",
      subtitle: "text-xs tracking-[0.35em]",
      gap: "gap-4",
    },
  }[size];

  // High-Tech SVG Emblem with Gradient & Drop-Shadow
  const Emblem = ({ className }: { className?: string }) => (
    <div className={cn("relative shrink-0 flex items-center justify-center", className)}>
      <div className="absolute inset-0 bg-primary/20 blur-md rounded-full pointer-events-none" />
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_0_12px_rgba(0,102,255,0.4)]"
        aria-label="Malaca Mail Logo"
      >
        <defs>
          <linearGradient id="malacaLogoGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        {/* Outer Rounded M emblem */}
        <path
          d="M 46 142 V 76 C 46 62 58 52 72 52 C 81 52 90 56 95 64 L 100 72 L 105 64 C 110 56 119 52 128 52 C 142 52 154 62 154 76 V 142"
          stroke="url(#malacaLogoGlowGrad)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner envelope fold V chevron */}
        <path
          d="M 68 96 L 100 132 L 132 96"
          stroke="url(#malacaLogoGlowGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  if (variant === "icon") {
    return <Emblem className={cn(sizeClasses.icon, className)} />;
  }

  if (variant === "full") {
    return (
      <div className={cn("flex flex-col items-center text-center", className)}>
        <Emblem className={cn(sizeClasses.icon, "mb-4")} />
        <span className={cn("font-display text-foreground tracking-tight", sizeClasses.text)}>
          Malaca Mail
        </span>
        {showSubtitle && (
          <span className={cn("mt-1 uppercase text-primary/80 font-mono font-medium", sizeClasses.subtitle)}>
            E-MAIL PROFISSIONAL
          </span>
        )}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn("flex items-center", sizeClasses.gap, className)}>
      <Emblem className={sizeClasses.icon} />
      <div className="flex flex-col">
        <span className={cn("font-display leading-tight text-foreground tracking-tight", sizeClasses.text)}>
          Malaca Mail
        </span>
        {showSubtitle && size !== "sm" && (
          <span className={cn("uppercase text-primary/80 font-mono font-medium leading-none mt-0.5", sizeClasses.subtitle)}>
            E-MAIL PROFISSIONAL
          </span>
        )}
      </div>
    </div>
  );
}
