import "./Preloader.css";

function Preloader({ texto = "Buscando pokemon..." }) {
  return (
    <div className="preloader">
      <div className="preloader__rueda" />
      <p className="preloader__texto">{texto}</p>
    </div>
  );
}

export default Preloader;
