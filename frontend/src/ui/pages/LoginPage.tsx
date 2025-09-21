import { LoginDesktop, LoginMini } from "../components";

const chatMode = import.meta.env.VITE_CHAT_MODE as "mini" | "desktop";

const LoginPage = () => {
  return chatMode === "mini" ? <LoginMini /> : <LoginDesktop />;
};

export default LoginPage;
