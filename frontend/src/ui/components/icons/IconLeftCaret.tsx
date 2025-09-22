import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const IconLeftCaret: React.FC<IconProps> = ({
  width = 6,
  height = 10,
  color = "#ffffff",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 8 14"
    fill={color}
  >
    <path
      d="M6.29289 0.292893C6.68342 -0.0976311 7.31643 -0.0976311 7.70696 0.292893C8.0974 0.683424 8.09745 1.31646 7.70696 1.70696L2.41399 6.99992L7.70696 12.2929C8.0974 12.6834 8.09745 13.3165 7.70696 13.707C7.31646 14.0975 6.68342 14.0974 6.29289 13.707L0.292893 7.70696C-0.0976311 7.31643 -0.0976311 6.68342 0.292893 6.29289L6.29289 0.292893Z"
      fill={color}
    />
  </svg>
);

export default IconLeftCaret;
