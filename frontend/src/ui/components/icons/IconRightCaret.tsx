import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const IconRightCaret: React.FC<IconProps> = ({
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
      d="M0.293091 0.293091C0.683615 -0.0974335 1.31663 -0.0974335 1.70715 0.293091L7.70715 6.29309C8.0976 6.68362 8.09765 7.31665 7.70715 7.70715L1.70715 13.7072C1.31665 14.0977 0.683621 14.0976 0.293091 13.7072C-0.0974335 13.3166 -0.0974335 12.6836 0.293091 12.2931L5.58606 7.00012L0.293091 1.70715C-0.0974335 1.31663 -0.0974335 0.683615 0.293091 0.293091Z"
      fill={color}
    />
  </svg>
);

export default IconRightCaret;
