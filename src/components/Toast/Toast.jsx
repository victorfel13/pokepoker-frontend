import "./Toast.css";

function Toast({ titulo, sub, carga }) {
  if (!titulo) {
    return null;
  }

  return (
    <div
      className={carga ? "toast toast_carga" : "toast"}
      role="status"
      aria-live="polite"
    >
      <div className="toast__caja" key={`${titulo}-${sub || ""}`}>
        {carga ? <div className="toast__rueda" aria-hidden="true" /> : null}
        <p className="toast__titulo">{titulo}</p>
        {sub ? <p className="toast__sub">{sub}</p> : null}
      </div>
    </div>
  );
}

export default Toast;
