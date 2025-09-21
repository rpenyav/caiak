import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="container text-center mt-5">
      <h1 className="display-4">404</h1>
      <p className="lead">{t("notFound.message")}</p>
      <Link to="/" className="btn btn-primary mt-3">
        {t("notFound.backToHome")}
      </Link>
    </div>
  );
};

export default NotFoundPage;
