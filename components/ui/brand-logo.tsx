import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  tone?: "color" | "white";
  priority?: boolean;
};

const wordmarks = {
  color: "/brand/sewaka-wordmark.png",
  white: "/brand/sewaka-wordmark-white.png",
} as const;

const symbols = {
  color: "/brand/sewaka-symbol.png",
  white: "/brand/sewaka-symbol-white.png",
} as const;

export function BrandLogo({ className, tone = "color", priority = false }: BrandLogoProps) {
  return (
    <Image
      src={wordmarks[tone]}
      alt="Sewaka"
      width={2172}
      height={724}
      sizes="(max-width: 768px) 128px, 180px"
      className={className}
      priority={priority}
    />
  );
}

export function BrandSymbol({
  className,
  tone = "color",
  size = 48,
}: BrandLogoProps & { size?: number }) {
  return (
    <Image
      src={symbols[tone]}
      alt="Sewaka"
      width={size}
      height={size}
      className={className}
    />
  );
}
