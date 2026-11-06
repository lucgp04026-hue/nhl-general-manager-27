
import { teams } from "./data/teams.js";
import { players } from "./data/players.js";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const joueurs = players;
  { nom: "Nick Suzuki", pos: "C", age: 27, ovr: 91, salaire: 7.875, equipe: "Canadiens de Montréal" },
  { nom: "Cole Caufield", pos: "AD", age: 25, ovr: 91, salaire: 7.85, equipe: "Canadiens de Montréal" },
  { nom: "Juraj Slafkovský", pos: "AG", age: 22, ovr: 87, salaire: 7.6, equipe: "Canadiens de Montréal" },
  { nom: "Lane Hutson", pos: "D", age: 22, ovr: 94, salaire: 8.85, equipe: "Canadiens de Montréal" },
  { nom: "Noah Dobson", pos: "D", age: 26, ovr: 89, salaire: 9.5, equipe: "Canadiens de Montréal" },
  { nom: "Kaiden Guhle", pos: "D", age: 24, ovr: 86, salaire: 5.55, equipe: "Canadiens de Montréal" },
  { nom: "Mike Matheson", pos: "D", age: 32, ovr: 85, salaire: 6.0, equipe: "Canadiens de Montréal" },
  { nom: "Alexandre Carrier", pos: "D", age: 30, ovr: 84, salaire: 3.75, equipe: "Canadiens de Montréal" },
  { nom: "Arber Xhekaj", pos: "D", age: 25, ovr: 82, salaire: 1.5, equipe: "Canadiens de Montréal" },
  { nom: "Adam Engström", pos: "D", age: 22, ovr: 79, salaire: 0.9, equipe: "Canadiens de Montréal" },
  { nom: "Patrik Laine", pos: "AD", age: 28, ovr: 84, salaire: 8.7, equipe: "Canadiens de Montréal" },
  { nom: "Kirby Dach", pos: "C", age: 25, ovr: 83, salaire: 3.6, equipe: "Canadiens de Montréal" },
  { nom: "Alex Newhook", pos: "C/AG", age: 25, ovr: 82, salaire: 2.9, equipe: "Canadiens de Montréal" },
  { nom: "Phillip Danault", pos: "C", age: 33, ovr: 84, salaire: 5.5, equipe: "Canadiens de Montréal" },
  { nom: "Josh Anderson", pos: "AD", age: 32, ovr: 82, salaire: 5.5, equipe: "Canadiens de Montréal" },
  { nom: "Jake Evans", pos: "C", age: 30, ovr: 82, salaire: 2.85, equipe: "Canadiens de Montréal" },
  { nom: "Zachary Bolduc", pos: "AG", age: 23, ovr: 83, salaire: 4.2, equipe: "Canadiens de Montréal" },
  { nom: "Ivan Demidov", pos: "AD", age: 20, ovr: 89, salaire: 0.941, equipe: "Canadiens de Montréal" },
  { nom: "Oliver Kapanen", pos: "C", age: 23, ovr: 81, salaire: 0.943, equipe: "Canadiens de Montréal" },
  { nom: "Alexandre Texier", pos: "AG", age: 27, ovr: 82, salaire: 2.5, equipe: "Canadiens de Montréal" },
  { nom: "Chris Kreider", pos: "AG", age: 35, ovr: 85, salaire: 2.15, equipe: "Canadiens de Montréal" },
  { nom: "Owen Beck", pos: "C", age: 22, ovr: 78, salaire: 0.79, equipe: "Canadiens de Montréal" },
  { nom: "Florian Xhekaj", pos: "AG", age: 22, ovr: 76, salaire: 0.943, equipe: "Canadiens de Montréal" },
  { nom: "Jakub Dobeš", pos: "G", age: 25, ovr: 84, salaire: 0.925, equipe: "Canadiens de Montréal" },
  { nom: "Jacob Fowler", pos: "G", age: 22, ovr: 87, salaire: 0.925, equipe: "Canadiens de Montréal" },
  { nom: "Samuel Montembeault", pos: "G", age: 30, ovr: 83, salaire: 3.15, equipe: "Canadiens de Montréal" }
];

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
      return <section className="panel">
        <h2>Ton effectif</h2>
        <div className="table">
          <div className="ligne entete">
            <span>Joueur</span><span>Pos.</span><span>Âge</span>
            <span>OVR</span><span>Salaire</span>
          </div>
          {joueurs.filter(j => j.equipe === equipe).map(j => ( <div className="ligne" key={j.nom}>
            <b>{j.nom}</b><span>{j.pos}</span><span>{j.age}</span>
            <b>{j.ovr}</b><span>{j.salaire} M$</span>
          </div>)}
        </div>
        <p className="note">Effectif de démonstration à compléter et à vérifier.</p>
      </section>;
    }

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
