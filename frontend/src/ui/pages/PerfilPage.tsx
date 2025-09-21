import { useTranslation } from "react-i18next";

const PerfilPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("perfil.title")}</h1>
    </div>
  );
};

export default PerfilPage;
