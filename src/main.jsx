
import { teams } from "./data/teams.js";
import { players } from "./data/players.js";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const joueurs = players;
  console.log("Nombre de joueurs :", players.length);

function App() {
  const [onglet, setOnglet] = useState("Accueil");
  const [victoires, setVictoires] = useState(0);
  const [defaites, setDefaites] = useState(0);
  const [equipe, setEquipe] = useState("Canadiens de Montréal");
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
  if (onglet === "Effectif") {
    return (
      <section className="panel">
        <h2>Ton effectif ({joueurs.length} joueurs au total)</h2>
        <p>Joueurs de cette équipe : {joueurs.filter(j => j.equipe === equipe).length}</p>
        <div className="table">

    if (onglet === "Échanges") {
      return <section className="panel">
        <h2>Centre des échanges</h2>
        <p>Prépare tes offres et améliore ton équipe.</p>
        <div className="placeholder">🤝<br/>Le marché des échanges arrive bientôt!</div>
      </section>;
    }

    if (onglet === "Finances") {
      return <section className="panel">
        <h2>Finances de la franchise</h2>
        <div className="stat"><span>Plafond salarial</span><b>À configurer</b></div>
        <div className="stat"><span>Budget de l'équipe</span><b>À configurer</b></div>
        <p>La gestion financière complète sera ajoutée prochainement.</p>
      </section>;
    }

    if (onglet === "Saison") {
      return <section className="panel">
        <h2>Saison {saison}</h2>
        <div className="stat"><span>Matchs joués</span><b>{victoires + defaites} / 82</b></div>
        <div className="stat"><span>Victoires</span><b>{victoires}</b></div>
        <div className="stat"><span>Défaites</span><b>{defaites}</b></div>
        <button onClick={() => {
          setSaison("2027-2028");
          setVictoires(0);
          setDefaites(0);
          setMessage("Nouvelle saison commencée!");
        }}>Nouvelle saison</button>
      </section>;
    }

    return <section className="panel">
      <p className="eyebrow">TON BUREAU DE DIRECTEUR GÉNÉRAL</p>
      <h2>{equipe}</h2>
      <p>Saison {saison}</p>
      <div className="stats">
        <div><small>VICTOIRES</small><strong>{victoires}</strong></div>
        <div><small>DÉFAITES</small><strong>{defaites}</strong></div>
        <div><small>MATCHS JOUÉS</small><strong>{victoires + defaites}/82</strong></div>
      </div>
      <p className="message">{message}</p>
      <button onClick={simulerMatch}>Simuler le prochain match</button>
      <p className="note">Objectif : remporter la Coupe Stanley!</p>
    </section>;
  }

  return <div className="app">
    <header>
      <div className="logo">🏒 NHL GENERAL MANAGER 27</div>
      <span className="gratuit">100 % GRATUIT</span>
    </header>

    <section className="hero">
  <p>À TOI DE BÂTIR UNE DYNASTIE</p>
  <h1>DEVENEZ LE MAÎTRE<br/>DE VOTRE FRANCHISE.</h1>
  <select value={equipe} onChange={e => setEquipe(e.target.value)}>{teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select>
</section>

    <nav>
      {["Accueil", "Effectif", "Échanges", "Saison", "Finances"].map(t =>
        <button className={onglet === t ? "active" : ""}
          onClick={() => setOnglet(t)} key={t}>{t}</button>
      )}
    </nav>

    <main>{contenu()}</main>
    <footer>
      NHL GENERAL MANAGER 27<br/>
      Projet indépendant · 100 % gratuit
    </footer>
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
