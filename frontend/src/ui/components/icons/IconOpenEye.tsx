import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const IconOpenEye: React.FC<IconProps> = ({
  width = 20,
  height = 15,
  color = "#c8c8c8",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 20 15"
    fill={color}
  >
    <path
      d="M10 0C3.63636 0 0 7.5 0 7.5C0 7.5 3.63636 15 10 15C16.3636 15 20 7.5 20 7.5C20 7.5 16.3636 0 10 0ZM9.93086 4.6875C11.4371 4.6875 12.6581 5.9467 12.6581 7.5C12.6581 9.05334 11.4371 10.3125 9.93086 10.3125C8.42458 10.3125 7.20358 9.05334 7.20358 7.5C7.20358 5.9467 8.42458 4.6875 9.93086 4.6875Z"
      fill={color}
    />
  </svg>
);

export default IconOpenEye;
