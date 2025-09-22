import { useUser } from "@/application/contexts";
import React from "react";

const AvatarComponent = () => {
  const { user, loading, error } = useUser();
  console.log(user);
  if (loading) return <p>Cargando usuario…</p>;
  if (error) return <p style={{ color: "crimson" }}>Error: {error}</p>;
  if (!user) return <p>No autenticado</p>;

  return (
    <div className="row align-items-center m-0 mb-5">
      <div className="col-4">
        <div className="circular-avatar">
          <span className="avatar-initial">S</span>
        </div>
      </div>
      <div className="col-8 ">
        <p>
          <span className="avatar-name">{user.email}</span>
        </p>
        <p>
          <small>{user.roles.join(", ")}</small>
        </p>
      </div>
    </div>
  );
};

export default AvatarComponent;
