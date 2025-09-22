import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const IconGlass: React.FC<IconProps> = ({
  width = 19,
  height = 19,
  color = "#ffffff",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 19 19"
    fill={color}
  >
    <path
      d="M6.65 0C2.98856 0 0 2.98856 0 6.65C0 10.3114 2.98856 13.3 6.65 13.3C8.3106 13.3 9.82776 12.6806 10.9955 11.6672L11.4 12.0717V13.3L17.1 19L19 17.1L13.3 11.4H12.0717L11.6672 10.9955C12.6806 9.82776 13.3 8.3106 13.3 6.65C13.3 2.98856 10.3114 0 6.65 0ZM6.65 1.9C9.2846 1.9 11.4 4.01539 11.4 6.65C11.4 9.2846 9.2846 11.4 6.65 11.4C4.01539 11.4 1.9 9.2846 1.9 6.65C1.9 4.01539 4.01539 1.9 6.65 1.9Z"
      fill={color}
    />
  </svg>
);

export default IconGlass;
