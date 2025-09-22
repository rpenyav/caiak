// src/ui/pages/PerfilPage.tsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IconClose } from "@/ui/components";

const PerfilPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/dashboard");
  };

  return (
    <div style={{ position: "relative", paddingTop: 8, paddingRight: 8 }}>
      <button
        type="button"
        onClick={handleClose}
        aria-label={t("common.close") || "Cerrar"}
        title={t("common.close") || "Cerrar"}
        className="page-close-button"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "transparent",
          border: 0,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
        }}
      >
        <IconClose width={14} height={14} color="#000" />
      </button>

      <h1>{t("perfil.title")}</h1>
    </div>
  );
};

export default PerfilPage;
