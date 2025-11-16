import React, { useState } from 'react';

export default function PasswordModal({ isOpen, onClose, username }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTemporaryPassword = () => {
    setIsGenerating(true);
    console.log("Generando contraseña temporal para:", username);
    // Aquí iría la lógica para generar contraseña temporal
    setTimeout(() => {
      setIsGenerating(false);
      alert("Contraseña temporal generada exitosamente");
      onClose();
    }, 2000);
  };

  const handlePermanentPassword = () => {
    setIsGenerating(true);
    console.log("Generando contraseña permanente para:", username);
    // Aquí iría la lógica para generar contraseña permanente
    setTimeout(() => {
      setIsGenerating(false);
      alert("Contraseña permanente generada exitosamente");
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop show" onClick={onClose}></div>
      
      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{ display: 'block', paddingLeft: '17px' }}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Generar contraseña</h5>
              <button 
                type="button" 
                className="close" 
                aria-label="Close"
                onClick={onClose}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="container-fluid">
                <fieldset className="form-group">
                  <legend className="col-form-label pt-0">Nombre de usuario</legend>
                  <div>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={username}
                      readOnly
                    />
                  </div>
                </fieldset>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-default"
                onClick={onClose}
                disabled={isGenerating}
              >
                Cerrar
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleTemporaryPassword}
                disabled={isGenerating}
              >
                <i className="fas fa-exclamation-triangle"></i>
                Establecer contraseña temporal
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handlePermanentPassword}
                disabled={isGenerating}
              >
                <i className="fas fa-exclamation-triangle"></i>
                Contraseña permanente
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}