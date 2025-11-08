import React from "react";

interface ZarfaLogoProps {
  className?: string;
  imgClassName?: string;
  size?: number; // pixel size for the outer circle (default 32 -> w-8 h-8)
}

/**
 * ZarfaLogo
 * Renders the Zarfa logo from public/logo.png inside a circular brand background.
 * Usage: <ZarfaLogo /> or <ZarfaLogo className="w-10 h-10" />
 */
const ZarfaLogo: React.FC<ZarfaLogoProps> = ({
  className = "",
  imgClassName = "",
  size,
}) => {
  const inlineSize = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`rounded-full bg-brand-900 flex items-center justify-center overflow-hidden ${
        className || "w-8 h-8"
      }`}
      style={inlineSize}
      aria-label="Zarfa logo"
      title="Zarfa"
    >
      <img
        src="/logo.png"
        alt="Zarfa"
        className={`object-contain ${imgClassName || "w-6 h-6"}`}
      />
    </div>
  );
};

export default ZarfaLogo;
