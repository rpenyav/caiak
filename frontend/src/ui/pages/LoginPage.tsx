import { useTranslation } from "react-i18next";

const chatMode = import.meta.env.VITE_CHAT_MODE as "mini" | "desktop";

const LoginPage = () => {
  const { t } = useTranslation();

  return chatMode === "mini" ? (
    <div>Chat Mini Mode</div>
  ) : (
    <div>Chat Desktop Mode</div>
  );
};

export default LoginPage;
