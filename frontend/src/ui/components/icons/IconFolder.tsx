import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string; // color por defecto
  hoverColor?: string; // color al hacer hover
  className?: string;
}

const IconFolder: React.FC<IconProps> = ({
  width = 22,
  height = 20,
  color = "#ffffff",
  hoverColor,
  className,
}) => {
  const style = {
    ["--icon-color" as any]: color,

    ...(hoverColor ? { ["--icon-hover-color" as any]: hoverColor } : {}),
  } as React.CSSProperties;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 22 20"
      className={`icon-hover ${className ?? ""}`}
      style={style}
    >
      <path d="M8 0C8.33435 0 8.64657 0.167114 8.83203 0.445312L10.5352 3H19C19.7956 3 20.5585 3.3163 21.1211 3.87891C21.6837 4.44152 22 5.20435 22 6V17C22 17.7957 21.6837 18.5585 21.1211 19.1211C20.5585 19.6837 19.7957 20 19 20H3C2.20435 20 1.44152 19.6837 0.878906 19.1211C0.316297 18.5585 0 17.7956 0 17V3C0 2.20435 0.316297 1.44152 0.878906 0.878906C1.44152 0.316297 2.20435 0 3 0H8ZM3 2C2.73478 2 2.48051 2.10543 2.29297 2.29297C2.10543 2.48051 2 2.73478 2 3V17C2 17.2652 2.10543 17.5195 2.29297 17.707C2.48051 17.8946 2.73478 18 3 18H19C19.2652 18 19.5195 17.8946 19.707 17.707C19.8946 17.5195 20 17.2652 20 17V6C20 5.73478 19.8946 5.48051 19.707 5.29297C19.5195 5.10543 19.2652 5 19 5H10C9.66565 5 9.35343 4.83289 9.16797 4.55469L7.46484 2H3Z" />
    </svg>
  );
};

export default IconFolder;
