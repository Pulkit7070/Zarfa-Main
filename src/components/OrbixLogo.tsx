import React from "react";

interface OrbixLogoProps {
  className?: string;
  imgClassName?: string;
  size?: number; // pixel size for the outer circle (default 32 -> w-8 h-8)
}

/**
 * OrbixLogo
 * Renders the Orbix logo from public/logo.png inside a circular brand background.
 * Usage: <OrbixLogo /> or <OrbixLogo className="w-10 h-10" />
 */
const OrbixLogo: React.FC<OrbixLogoProps> = ({
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
      aria-label="Orbix logo"
      title="Orbix"
    >
      <img
        src="/logo.png"
        alt="Orbix"
        className={`object-contain ${imgClassName || "w-6 h-6"}`}
      />
    </div>
  );
};

export default OrbixLogo;
