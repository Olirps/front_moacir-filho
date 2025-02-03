import React from 'react';
import '../styles/ConfirmDialog.css';

const ConfirmarLancarParcelas = ({ isOpen, message, onConfirm, onCancel, confirmText = "Lançar Parcelas", cancelText = "Cancelar" }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="dialog-buttons">
          <button className="button confirm" onClick={onConfirm}>{confirmText}</button>
          <button className="button cancel" onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarLancarParcelas;
