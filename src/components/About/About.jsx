import "./About.css";

function About() {
  return (
    <section className="about">
      <h2 className="about__titulo">Que es PokePoker</h2>
      <p className="about__texto">
        PokePoker es un juego de cartas Pokemon. Te reparte tres, el rival va
        tapado, y gana el tipo o el poder. Si te sale la carta dorada, eliges
        otro Pokemon para esa mano.
      </p>
      <p className="about__texto">Hecho por Victor Camara para TripleTen.</p>
    </section>
  );
}

export default About;
