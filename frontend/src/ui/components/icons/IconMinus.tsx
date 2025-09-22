import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const IconMinus: React.FC<IconProps> = ({
  width = 12,
  height = 2,
  color = "#ffffff",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 12 2"
    fill={color}
  >
    <path
      d="M11 0C11.5523 0 12 0.447715 12 1C12 1.55228 11.5523 2 11 2H1C0.447715 2 0 1.55228 0 1C0 0.447715 0.447715 0 1 0H11Z"
      fill={color}
    />
  </svg>
);

export default IconMinus;
