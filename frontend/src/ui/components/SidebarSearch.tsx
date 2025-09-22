import React from "react";
import IconGlass from "./icons/IconGlass";

const SidebarSearch = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input") as HTMLInputElement;
    const searchValue = input?.value || "";
    console.log("Búsqueda:", searchValue);
    // Lógica de búsqueda aquí (ej: enviar a una API)
  };

  return (
    <div className="mb-5 position-relative">
      <form className="input-with-icon" onSubmit={handleSubmit}>
        <input
          type="search"
          className="form-control form-control-custom"
          placeholder="Search..."
        />
        <button type="submit" className="input-group-append button-search">
          <IconGlass width={16} height={16} color="#6B7280" />
        </button>
      </form>
    </div>
  );
};

export default SidebarSearch;
