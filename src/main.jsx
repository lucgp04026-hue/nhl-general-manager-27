
import { teams } from "./data/teams.js";
import { players } from "./data/players.js";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const joueurs = players;

function App() {
  const [onglet, setOnglet] = useState("Accueil");
  const [victoires, setVictoires] = useState(0);
  const [defaites, setDefaites] = useState(0);
  const [equipe, setEquipe] = useState("Canadiens de Montréal");
  const [joueurSelectionne, setJoueurSelectionne] = useState(null);
  const [saison, setSaison] = useState("2026-2027");
  const [message, setMessage] = useState("Bienvenue dans ton bureau de DG!");

  function simulerMatch() {
    if (victoires + defaites >= 82) {
      setMessage("La saison régulière est terminée!");
      return;
    }

    if (Math.random() < 0.53) {
      setVictoires(v => v + 1);
      setMessage("Victoire! Ton équipe remporte le match!");
    } else {
      setDefaites(d => d + 1);
      setMessage("Défaite. Il faudra rebondir au prochain match.");
    }
  }

  function contenu() {

    // FICHE DU JOUEUR
    if (joueurSelectionne) {
      return (
        <section className="panel">
          <div style={{ textAlign: "center" }}>
            {joueurSelectionne.photo ? (
              <img
                src={joueurSelectionne.photo}
                alt={joueurSelectionne.nom}
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "contain",
                  borderRadius: "12px"
                }}
              />
            ) : (
              <div style={{ fontSize: "90px" }}>🏒</div>
            )}

            <h2>{joueurSelectionne.nom}</h2>
            <h3>#{joueurSelectionne.numero}</h3>
          </div>

          <div className="stat">
            <span>Équipe</span>
            <b>{joueurSelectionne.equipe}</b>
          </div>

          <div className="stat">
            <span>Position</span>
            <b>{joueurSelectionne.pos}</b>
          </div>

          <div className="stat">
            <span>Âge</span>
            <b>{joueurSelectionne.age} ans</b>
          </div>

          <div className="stat">
            <span>Note générale</span>
            <b>{joueurSelectionne.ovr} OVR</b>
          </div>

          <div className="stat">
            <span>Salaire</span>
            <b>{joueurSelectionne.salaire} M$</b>
          </div>

          <button onClick={() => setJoueurSelectionne(null)}>
            Retour à l'effectif
          </button>
        </section>
      );
    }

    // EFFECTIF
    if (onglet === "Effectif") {
      const joueursEquipe = joueurs.filter(j => j.equipe === equipe);

      const attaquants = joueursEquipe.filter(j =>
        ["C", "AG", "AD", "C/AG"].includes(j.pos)
      );

      const defenseurs = joueursEquipe.filter(j => j.pos === "D");
      const gardiens = joueursEquipe.filter(j => j.pos === "G");

      function afficherJoueurs(liste) {
        return (
          <div className="table">
            <div className="ligne entete">
              <span>Joueur</span>
              <span>#</span>
              <span>Pos.</span>
              <span>Âge</span>
              <span>OVR</span>
              <span>Salaire</span>
            </div>

            {liste.map(j => (
              <div
                className="ligne"
                key={j.nom}
                onClick={() => setJoueurSelectionne(j)}
                style={{ cursor: "pointer" }}
              >
                <b>{j.nom}</b>
                <span>{j.numero}</span>
                <span>{j.pos}</span>
                <span>{j.age}</span>
                <b>{j.ovr}</b>
                <span>{j.salaire} M$</span>
              </div>
            ))}
          </div>
        );
      }

      return (
        <section className="panel">
          <h2>Effectif - {equipe}</h2>
          <p>{joueursEquipe.length} joueurs</p>

          <h3>🏒 Attaquants ({attaquants.length})</h3>
          {afficherJoueurs(attaquants)}

          <h3>🛡️ Défenseurs ({defenseurs.length})</h3>
          {afficherJoueurs(defenseurs)}

          <h3>🥅 Gardiens ({gardiens.length})</h3>
          {afficherJoueurs(gardiens)}
        </section>
      );
    }

    // ÉCHANGES
    if (onglet === "Échanges") {
      return (
        <section className="panel">
          <h2>Centre des échanges</h2>
          <p>Prépare tes offres et améliore ton équipe.</p>
          <div className="placeholder">
            🤝<br />
            Le marché des échanges arrive bientôt!
          </div>
        </section>
      );
    }

    // FINANCES
    if (onglet === "Finances") {
      return (
        <section className="panel">
          <h2>Finances de la franchise</h2>
          <div className="stat">
            <span>Plafond salarial</span>
            <b>À configurer</b>
          </div>
          <div className="stat">
            <span>Budget de l'équipe</span>
            <b>À configurer</b>
          </div>
          <p>La gestion financière complète sera ajoutée prochainement.</p>
        </section>
      );
    }

    // SAISON
    if (onglet === "Saison") {
      return (
        <section className="panel">
          <h2>Saison {saison}</h2>

          <div className="stat">
            <span>Matchs joués</span>
            <b>{victoires + defaites} / 82</b>
          </div>

          <div className="stat">
            <span>Victoires</span>
            <b>{victoires}</b>
          </div>

          <div className="stat">
            <span>Défaites</span>
            <b>{defaites}</b>
          </div>

          <button onClick={() => {
            setSaison("2027-2028");
            setVictoires(0);
            setDefaites(0);
            setMessage("Nouvelle saison commencée!");
          }}>
            Nouvelle saison
          </button>
        </section>
      );
    }

    // ACCUEIL
    return (
      <section className="panel">
        <p className="eyebrow">TON BUREAU DE DIRECTEUR GÉNÉRAL</p>
        <h2>{equipe}</h2>
        <p>Saison {saison}</p>

        <div className="stats">
          <div>
            <small>VICTOIRES</small>
            <strong>{victoires}</strong>
          </div>
          <div>
            <small>DÉFAITES</small>
            <strong>{defaites}</strong>
          </div>
          <div>
            <small>MATCHS JOUÉS</small>
            <strong>{victoires + defaites}/82</strong>
          </div>
        </div>

        <p className="message">{message}</p>

        <button onClick={simulerMatch}>
          Simuler le prochain match
        </button>

        <p className="note">Objectif : remporter la Coupe Stanley!</p>
      </section>
    );
  }

  return (
    <div className="app">
      <header>
        <div className="logo">🏒 NHL GENERAL MANAGER 27</div>
        <span className="gratuit">100 % GRATUIT</span>
      </header>

      <section className="hero">
        <p>À TOI DE BÂTIR UNE DYNASTIE</p>
        <h1>
          DEVENEZ LE MAÎTRE<br />
          DE VOTRE FRANCHISE.
        </h1>

        <select
          value={equipe}
          onChange={e => {
            setEquipe(e.target.value);
            setJoueurSelectionne(null);
          }}
        >
          {teams.map(t => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </section>

      <nav>
        {["Accueil", "Effectif", "Échanges", "Saison", "Finances"].map(t => (
          <button
            className={onglet === t ? "active" : ""}
            onClick={() => {
              setOnglet(t);
              setJoueurSelectionne(null);
            }}
            key={t}
          >
            {t}
          </button>
        ))}
      </nav>

      <main>{contenu()}</main>

      <footer>
        NHL GENERAL MANAGER 27<br />
        Projet indépendant · 100 % gratuit
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
