import Modal from "./Modal.jsx";

export default function DeleteConfirmModal({ product, onConfirm, onCancel }) {
  return (
    <Modal title="Eliminar producto" size="sm" onClose={onCancel} labelledBy="delete-modal-title">
      <div className="adm-modal__body">
        <p className="adm-confirm__text">¿Estás seguro de que deseas eliminar este producto?</p>
        <p className="adm-confirm__name"><span>{product.marca}</span> {product.nombre}</p>
        <p className="adm-hint">Desaparecerá del catálogo y su enlace dejará de funcionar. Esta acción no se puede deshacer.</p>
      </div>
      <footer className="adm-modal__foot">
        <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel} data-autofocus>Cancelar</button>
        <button type="button" className="adm-btn adm-btn--danger" onClick={onConfirm}>Sí, eliminar</button>
      </footer>
    </Modal>
  );
}
