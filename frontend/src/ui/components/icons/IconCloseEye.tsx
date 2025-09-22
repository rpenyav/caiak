import React from "react";

interface IconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const IconCloseEye: React.FC<IconProps> = ({
  width = 21,
  height = 15,
  color = "#c8c8c8",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 21 15"
    fill={color}
  >
    <path
      d="M7.50293 8.11328C7.78332 9.37106 8.90492 10.3123 10.248 10.3125C10.362 10.3125 10.4738 10.3036 10.584 10.29L15.1875 13.54C13.8029 14.3989 12.1743 15 10.3193 15C3.75246 14.9997 0 7.5 0 7.5C0.00364742 7.49281 0.761864 5.99941 2.1709 4.34863L7.50293 8.11328ZM19.1328 12.3408L18.0732 13.8252L1.9209 2.31055L2.98047 0.826172L19.1328 12.3408ZM10.3193 0C16.8825 0 20.6351 7.49089 20.6396 7.5C20.6396 7.5 20.0544 8.65274 18.9609 10.0508L6.20898 1.03418C7.41965 0.410787 8.7917 7.80897e-05 10.3193 0Z"
      fill={color}
    />
  </svg>
);

export default IconCloseEye;
