interface HeroImageProps {
  className?: string;
  width?: number;
  height?: number;
  src?: string;
  alt?: string;
}

export function HeroSavingsImage({
  className = "",
  width = 500,
  height = 400,
  src = "/images/hero-savings.png",
  alt = "Community Savings - Save together, grow together",
}: HeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <img src={src} alt={alt} width={width} height={height} />
    </div>
  );
}
