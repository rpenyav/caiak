import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string; // color por defecto
  hoverColor?: string; // color al hacer hover
  className?: string;
}

const IconLogout: React.FC<IconProps> = ({
  width = 20,
  height = 20,
  color = "#ffffff",
  hoverColor,
  className,
}) => {
  // Pasamos los colores como CSS variables al SVG
  const style = {
    // color base
    ["--icon-color" as any]: color,
    // color hover opcional
    ...(hoverColor ? { ["--icon-hover-color" as any]: hoverColor } : {}),
  } as React.CSSProperties;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 27 27"
      className={`icon-hover ${className ?? ""}`}
      style={style}
    >
      <path d="M27 0V27H0V18H3V24H24V3H3V9H0V0H27ZM20.25 13.5L12.75 21L10.6348 18.8848L14.5049 15H0V12H14.5049L10.6348 8.11523L12.75 6L20.25 13.5Z" />
    </svg>
  );
};

export default IconLogout;
