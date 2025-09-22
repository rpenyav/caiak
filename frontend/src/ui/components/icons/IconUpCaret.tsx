import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const IconUpCaret: React.FC<IconProps> = ({
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
      d="M6.36926 0.224854C6.76204 -0.0954969 7.34104 -0.0729031 7.70715 0.293213L13.7072 6.29321C14.0975 6.68375 14.0976 7.3168 13.7072 7.70728C13.3167 8.09767 12.6836 8.09762 12.2931 7.70728L7.00012 2.41431L1.70715 7.70728C1.31667 8.09767 0.683601 8.09762 0.293091 7.70728C-0.097407 7.31678 -0.097354 6.68374 0.293091 6.29321L6.29309 0.293213L6.36926 0.224854Z"
      fill={color}
    />
  </svg>
);

export default IconUpCaret;
