import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const IconDownCaret: React.FC<IconProps> = ({
  width = 10,
  height = 6,
  color = "#ffffff",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 14 8"
    fill={color}
  >
    <path
      d="M12.2929 0.292893C12.6834 -0.0976311 13.3164 -0.0976311 13.707 0.292893C14.0974 0.683424 14.0975 1.31646 13.707 1.70696L7.70696 7.70696C7.31646 8.09745 6.68342 8.0974 6.29289 7.70696L0.292893 1.70696C-0.0976311 1.31643 -0.0976311 0.683418 0.292893 0.292893C0.683418 -0.0976311 1.31643 -0.0976311 1.70696 0.292893L6.99992 5.58586L12.2929 0.292893Z"
      fill={color}
    />
  </svg>
);

export default IconDownCaret;
