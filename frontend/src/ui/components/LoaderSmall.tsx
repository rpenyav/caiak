// src/ui/components/LoaderSmall.tsx
import React from "react";

type LoaderSmallProps = {
  /** Tamaño del spinner en px (ancho/alto) */
  size?: number;
  /** Color del trazo (por defecto hereda currentColor) */
  color?: string;
  /** Grosor del trazo */
  thickness?: number;
  /** Texto accesible anunciado por lectores de pantalla */
  label?: string;
  /** Centrar dentro del contenedor (usa flex) */
  center?: boolean;
  /** Clases extra para el contenedor */
  className?: string;
  /** Estilos inline extra */
  style?: React.CSSProperties;
};

const srOnlyStyle: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const LoaderSmall: React.FC<LoaderSmallProps> = ({
  size = 24,
  color = "currentColor",
  thickness = 3,
  label = "Cargando…",
  center = true,
  className,
  style,
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={className}
      style={{
        display: center ? "flex" : "inline-flex",
        alignItems: center ? "center" : undefined,
        justifyContent: center ? "center" : undefined,
        minHeight: center ? Math.max(size, 20) : undefined,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        aria-hidden="true"
        focusable="false"
      >
        {/* pista de fondo */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeOpacity="0.25"
          strokeWidth={thickness}
        />
        {/* arco animado */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray="80 140"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      {/* Texto accesible sin ocupar espacio visual */}
      {label && <span style={srOnlyStyle}>{label}</span>}
    </div>
  );
};

export default LoaderSmall;
