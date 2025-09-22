// src/ui/pages/SettingsPage.tsx
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("settings.title", { defaultValue: "Preferencias" })}</h1>
      <p className="mini-text">
        {t("settings.description", {
          defaultValue: "Configura tu experiencia.",
        })}
      </p>
    </div>
  );
};

export default SettingsPage;
