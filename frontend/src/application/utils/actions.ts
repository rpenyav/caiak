import Swal from "sweetalert2";

/**
 * Descarga un archivo creando un enlace temporal.
 * @param filePath Ruta del archivo a descargar.
 * @param filename Nombre del archivo para guardar localmente.
 */
export const handleDownload = (filePath: string, filename: string) => {
  const link = document.createElement("a");
  link.href = filePath;
  link.download = filename;
  link.click();
};

/**
 * Elimina un recurso mostrando confirmación con SweetAlert2.
 * @param itemId ID del recurso a eliminar.
 * @param name Nombre del recurso (para mostrar en el confirm).
 * @param endpoint URL base del endpoint.
 * @param onSuccess Callback opcional al eliminar con éxito.
 * @param onError Callback opcional si hay error en la eliminación.
 */
export const handleDelete = async (
  itemId: string,
  name: string,
  endpoint: string,
  onSuccess?: () => void,
  onError?: (err: any) => void
) => {
  const result = await Swal.fire({
    title: `¿Estás seguro de eliminar "${name}"?`,
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`${endpoint}/delete/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar: ${response.status}`);
      }

      await Swal.fire({
        title: "Eliminado",
        text: "El archivo ha sido eliminado correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      onSuccess?.();
    } catch (err) {
      console.error(err);
      onError?.(err);
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el archivo.",
        icon: "error",
      });
    }
  }
};
