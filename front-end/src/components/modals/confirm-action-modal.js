// src/components/modals/ConfirmActionModal.js
"use client";

export default function ConfirmActionModal({
  type,
  userName,
  onClose,
  onConfirm,
}) {
  const isAdminPromotion = type === "admin";

  const title = isAdminPromotion
    ? "Confirmar promoção a administrador"
    : "Confirmar exclusão";

  const message = isAdminPromotion
    ? `Tem certeza que deseja tornar ${userName} um administrador?`
    : `Tem certeza que deseja excluir o usuário ${userName}?`;

  const confirmLabel = isAdminPromotion ? "Promover" : "Excluir";

  const confirmButtonClass = `px-4 py-2 text-white rounded ${
    isAdminPromotion
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-red-600 hover:bg-red-700"
  }`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button onClick={onConfirm} className={confirmButtonClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
