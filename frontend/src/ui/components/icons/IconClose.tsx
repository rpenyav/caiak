import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const IconClose: React.FC<IconProps> = ({
  width = 20,
  height = 20,
  color = "#ffffff",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill={color}
  >
    <path
      d="M20 2.01465L12.0146 10L20 17.9854L17.9854 20L10 12.0146L2.01465 20L0 17.9854L7.98535 10L0 2.01465L2.01465 0L10 7.98535L17.9854 0L20 2.01465Z"
      fill={color}
    />
  </svg>
);

export default IconClose;
