import "./PopupWithForm.css";

function PopupWithForm({
  abierto,
  titulo,
  onClose,
  onSubmit,
  boton,
  disabled,
  error,
  pista,
  cambioTexto,
  onCambio,
  children,
}) {
  if (!abierto) {
    return null;
  }

  const handleOverlay = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <div className="popup" onClick={handleOverlay} role="presentation">
      <div className="popup__caja">
        <button className="popup__cerrar" type="button" onClick={onClose}>
          ×
        </button>
        <h2 className="popup__titulo">{titulo}</h2>
        {pista ? <p className="popup__pista">{pista}</p> : null}
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          {children}
          <p className="popup__error">{error}</p>
          <button className="popup__boton" type="submit" disabled={disabled}>
            {boton}
          </button>
        </form>
        <button className="popup__cambio" type="button" onClick={onCambio}>
          {cambioTexto}
        </button>
      </div>
    </div>
  );
}

export default PopupWithForm;
