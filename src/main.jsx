
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { teams } from "./data/teams.js";
import { players } from "./data/players.js";
import { chargerTousLesJoueurs } from "./data/nhlRoster.js";
import { chargerContrats } from "./data/contrats.js";

import {
  preparerJoueurs,
  developperJoueurs
} from "./data/progression.js";

import "./style.css";

function App() {
  const equipeDepart =
    teams.find((equipe) => equipe.id === "MTL") || teams[0];

  const [onglet, setOnglet] = useState("Accueil");
  const [equipeSelectionnee, setEquipeSelectionnee] =
    useState(equipeDepart);

  const [effectif, setEffectif] = useState(players);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const [saison, setSaison] = useState(2026);
  const [victoires, setVictoires] = useState(0);
  const [defaites, setDefaites] = useState(0);
  const [defaitesProlongation, setDefaitesProlongation] =
    useState(0);

  const [joueurEchange1, setJoueurEchange1] = useState("");
  const [joueurEchange2, setJoueurEchange2] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let actif = true;

    async function chargerDonnees() {
      try {
        setChargement(true);
        setErreur("");

        const liste = await chargerTousLesJoueurs(
          teams,
          players
        );

        const listeAvecContrats = await chargerContrats(liste);

        if (actif) {
          setEffectif(preparerJoueurs(listeAvecContrats));
        }
      } catch (error) {
        console.error("Erreur de chargement :", error);

        if (actif) {
          setErreur(
            "Impossible de charger toutes les données NHL. Les joueurs de départ sont affichés."
          );

          setEffectif(preparerJoueurs(players));
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    chargerDonnees();

    return () => {
      actif = false;
    };
  }, []);

  const joueursEquipe = effectif.filter(
    (joueur) => joueur.equipe === equipeSelectionnee.name
  );

  const totalMasseSalariale = joueursEquipe.reduce(
    (total, joueur) =>
      total + (Number(joueur.salaire) || 0),
    0
  );

  const styleBouton = {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#164e91",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    margin: "5px"
  };

  const styleCarte = {
    background: "#172638",
    color: "white",
    borderRadius: "12px",
    padding: "15px",
    margin: "10px 0",
    border: "1px solid #34465c"
  };

  const styleSelect = {
    padding: "10px",
    borderRadius: "7px",
    margin: "5px",
    maxWidth: "100%"
  };

  // Classe les joueurs selon leur position.
  function categoriePosition(position) {
    const pos = String(position || "")
      .toUpperCase()
      .trim();

    if (["G", "GK", "GB", "GOALIE"].includes(pos)) {
      return "gardiens";
    }

    if (
      ["D", "LD", "RD", "DEF", "DEFENSE"].includes(pos)
    ) {
      return "defenseurs";
    }

    return "attaquants";
  }

  function trierAttaquants(liste) {
    const ordre = {
      C: 1,
      CENTER: 1,
      AG: 2,
      L: 2,
      LW: 2,
      A: 2,
      AD: 3,
      R: 3,
      RW: 3
    };

    return [...liste].sort((a, b) => {
      const posA = String(a.pos || "").toUpperCase();
      const posB = String(b.pos || "").toUpperCase();

      return (ordre[posA] || 4) - (ordre[posB] || 4);
    });
  }

  const attaquants = trierAttaquants(
    joueursEquipe.filter(
      (joueur) => categoriePosition(joueur.pos) === "attaquants"
    )
  );

  const defenseurs = joueursEquipe.filter(
    (joueur) => categoriePosition(joueur.pos) === "defenseurs"
  );

  const gardiens = joueursEquipe.filter(
    (joueur) => categoriePosition(joueur.pos) === "gardiens"
  );

  function simulerMatch() {
    const resultat = Math.random();

    if (resultat < 0.55) {
      setVictoires((ancien) => ancien + 1);
      setMessage("Victoire ! 🏒");
    } else if (resultat < 0.75) {
      setDefaitesProlongation((ancien) => ancien + 1);
      setMessage("Défaite en prolongation.");
    } else {
      setDefaites((ancien) => ancien + 1);
      setMessage("Défaite.");
    }
  }

  function prochaineSaison() {
    const confirmer = window.confirm(
      "Terminer la saison et faire progresser tous les joueurs ?"
    );

    if (!confirmer) return;

    setEffectif((anciensJoueurs) =>
      developperJoueurs(anciensJoueurs)
    );

    setSaison((ancienneSaison) => ancienneSaison + 1);
    setVictoires(0);
    setDefaites(0);
    setDefaitesProlongation(0);

    setMessage("La nouvelle saison commence ! 🏒");
  }

  function effectuerEchange() {
    if (!joueurEchange1 || !joueurEchange2) {
      setMessage("Sélectionne deux joueurs.");
      return;
    }

    if (joueurEchange1 === joueurEchange2) {
      setMessage("Sélectionne deux joueurs différents.");
      return;
    }

    const index1 = Number(joueurEchange1);
    const index2 = Number(joueurEchange2);

    const joueur1 = effectif[index1];
    const joueur2 = effectif[index2];

    if (!joueur1 || !joueur2) {
      setMessage("Échange impossible.");
      return;
    }

    if (joueur1.equipe === joueur2.equipe) {
      setMessage("Les joueurs doivent appartenir à deux équipes différentes.");
      return;
    }

    const nouvelEffectif = [...effectif];

    nouvelEffectif[index1] = {
      ...joueur1,
      equipe: joueur2.equipe
    };

    nouvelEffectif[index2] = {
      ...joueur2,
      equipe: joueur1.equipe
    };

    setEffectif(nouvelEffectif);
    setJoueurEchange1("");
    setJoueurEchange2("");

    setMessage(
      "Échange effectué entre " +
        joueur1.nom +
        " et " +
        joueur2.nom +
        " !"
    );
  }

  function afficherSalaire(salaire) {
    const montant = Number(salaire) || 0;

    if (montant === 0) return "Non disponible";

    return montant.toFixed(2) + " M$";
  }

  function afficherPhoto(joueur) {
    if (joueur.photo) {
      return (
        <img
          src={joueur.photo}
          alt={joueur.nom}
          style={{
            width: "85px",
            height: "85px",
            objectFit: "cover",
            borderRadius: "10px",
            background: "#26394e"
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: "85px",
          height: "85px",
          borderRadius: "10px",
          background: "#26394e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px"
        }}
      >
        🏒
      </div>
    );
  }

  function afficherJoueur(joueur, index) {
    return (
      <div
        key={joueur.idNhl || joueur.nom + index}
        style={styleCarte}
      >
        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          {afficherPhoto(joueur)}

          <div style={{ flex: 1, minWidth: "160px" }}>
            <h3 style={{ margin: "0 0 8px" }}>
              {joueur.numero ? `#${joueur.numero} ` : ""}
              {joueur.nom}
            </h3>

            <p style={{ margin: "4px 0" }}>
              {joueur.pos || "Position inconnue"} ·{" "}
              {joueur.age || "?"} ans
            </p>

            <p style={{ margin: "4px 0" }}>
              Équipe : {joueur.equipe}
            </p>

            <p style={{ margin: "4px 0" }}>
              Salaire : {afficherSalaire(joueur.salaire)}
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#69c1ff"
              }}
            >
              {joueur.ovr ?? 75}
            </div>
            <small>OVR</small>
          </div>
        </div>

        <hr style={{ borderColor: "#34465c" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <span>
            Potentiel :{" "}
            <strong>
              {joueur.potentiel ?? joueur.ovr ?? 75}
            </strong>
          </span>

          <span>
            Progression :{" "}
            <strong>
              {(joueur.progressionAnnuelle ?? 0) > 0
                ? `+${joueur.progressionAnnuelle}`
                : joueur.progressionAnnuelle ?? 0}
            </strong>
          </span>
        </div>

        {joueur.contratDisponible && (
          <p style={{ marginBottom: 0 }}>
            Contrat :{" "}
            {joueur.finContrat ||
              joueur.anneeFin ||
              "Données disponibles"}
          </p>
        )}
      </div>
    );
  }

  function afficherSection(titre, liste, emoji) {
    return (
      <div style={{ marginTop: "25px" }}>
        <h3
          style={{
            background: "#26394e",
            padding: "13px",
            borderRadius: "9px",
            borderLeft: "5px solid #328bd1"
          }}
        >
          {emoji} {titre} ({liste.length})
        </h3>

        {liste.length === 0 ? (
          <p style={{ color: "#a9c5df" }}>
            Aucun joueur dans cette catégorie.
          </p>
        ) : (
          liste.map((joueur) =>
            afficherJoueur(joueur, effectif.indexOf(joueur))
          )
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1624",
        color: "white",
        padding: "15px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <header style={{ textAlign: "center", padding: "15px 0" }}>
        <h1 style={{ marginBottom: "5px" }}>
          🏒 NHL GENERAL MANAGER 27
        </h1>

        <p style={{ color: "#a9c5df" }}>
          Saison {saison}-{String(saison + 1).slice(-2)}
        </p>
      </header>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "5px",
          marginBottom: "20px"
        }}
      >
        {["Accueil", "Effectif", "Échanges", "Saison", "Finances"].map(
          (nom) => (
            <button
              key={nom}
              onClick={() => {
                setOnglet(nom);
                setMessage("");
              }}
              style={{
                ...styleBouton,
                background:
                  onglet === nom ? "#2879c7" : "#26394e"
              }}
            >
              {nom}
            </button>
          )
        )}
      </nav>

      {chargement && (
        <p style={{ textAlign: "center" }}>
          Chargement des joueurs NHL...
        </p>
      )}

      {erreur && (
        <p style={{ color: "#ffcc66", textAlign: "center" }}>
          {erreur}
        </p>
      )}

      {message && (
        <div
          style={{
            ...styleCarte,
            textAlign: "center",
            background: "#173c31"
          }}
        >
          {message}
        </div>
      )}

      {onglet === "Accueil" && (
        <section>
          <h2>Bienvenue dans ton équipe !</h2>

          <div style={styleCarte}>
            <h2>{equipeSelectionnee.name}</h2>

            <p>
              Conférence : {equipeSelectionnee.conference}
            </p>

            <p>
              Division : {equipeSelectionnee.division}
            </p>

            <p>Joueurs : {joueursEquipe.length}</p>

            <p>
              Masse salariale :{" "}
              {totalMasseSalariale.toFixed(2)} M$
            </p>
          </div>

          <h3>Choisir une équipe</h3>

          <select
            style={styleSelect}
            value={equipeSelectionnee.id}
            onChange={(e) => {
              const equipe = teams.find(
                (item) => item.id === e.target.value
              );

              if (equipe) setEquipeSelectionnee(equipe);
            }}
          >
            {teams.map((equipe) => (
              <option key={equipe.id} value={equipe.id}>
                {equipe.name}
              </option>
            ))}
          </select>
        </section>
      )}

      {onglet === "Effectif" && (
        <section>
          <h2>Effectif - {equipeSelectionnee.name}</h2>

          <select
            style={styleSelect}
            value={equipeSelectionnee.id}
            onChange={(e) => {
              const equipe = teams.find(
                (item) => item.id === e.target.value
              );

              if (equipe) setEquipeSelectionnee(equipe);
            }}
          >
            {teams.map((equipe) => (
              <option key={equipe.id} value={equipe.id}>
                {equipe.name}
              </option>
            ))}
          </select>

          <p>
            Total : {joueursEquipe.length} joueurs
          </p>

          {afficherSection("ATTAQUANTS", attaquants, "🏒")}
          {afficherSection("DÉFENSEURS", defenseurs, "🛡️")}
          {afficherSection("GARDIENS", gardiens, "🥅")}
        </section>
      )}

      {onglet === "Échanges" && (
        <section>
          <h2>Marché des échanges</h2>

          <p>
            Sélectionne deux joueurs de deux équipes différentes.
          </p>

          <div style={styleCarte}>
            <h3>Joueur offert</h3>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={joueurEchange1}
              onChange={(e) => setJoueurEchange1(e.target.value)}
            >
              <option value="">Choisir un joueur</option>

              {effectif.map((joueur, index) => (
                <option key={index} value={index}>
                  {joueur.nom} - {joueur.equipe}
                </option>
              ))}
            </select>

            <h3>Joueur demandé</h3>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={joueurEchange2}
              onChange={(e) => setJoueurEchange2(e.target.value)}
            >
              <option value="">Choisir un joueur</option>

              {effectif.map((joueur, index) => (
                <option key={index} value={index}>
                  {joueur.nom} - {joueur.equipe}
                </option>
              ))}
            </select>

            <button
              style={styleBouton}
              onClick={effectuerEchange}
            >
              Confirmer l'échange
            </button>
          </div>
        </section>
      )}

      {onglet === "Saison" && (
        <section>
          <h2>
            Saison {saison}-{String(saison + 1).slice(-2)}
          </h2>

          <div style={styleCarte}>
            <h3>Résultats de la saison</h3>

            <p>Victoires : {victoires}</p>
            <p>Défaites : {defaites}</p>
            <p>Défaites en prolongation : {defaitesProlongation}</p>

            <p>
              Points : {victoires * 2 + defaitesProlongation}
            </p>

            <button
              style={styleBouton}
              onClick={simulerMatch}
            >
              Simuler un match
            </button>
          </div>

          <div style={styleCarte}>
            <h3>Développement des joueurs</h3>

            <p>
              Les jeunes joueurs peuvent progresser selon leur potentiel.
            </p>

            <p>
              Les joueurs plus âgés peuvent perdre des points OVR.
            </p>

            <button
              style={{
                ...styleBouton,
                background: "#18834a"
              }}
              onClick={prochaineSaison}
            >
              Terminer la saison et avancer
            </button>
          </div>
        </section>
      )}

      {onglet === "Finances" && (
        <section>
          <h2>Finances - {equipeSelectionnee.name}</h2>

          <div style={styleCarte}>
            <h3>Masse salariale</h3>

            <p>Joueurs : {joueursEquipe.length}</p>

            <h2>
              {totalMasseSalariale.toFixed(2)} M$
            </h2>

            <p>
              Total des salaires des joueurs affichés dans l'effectif.
            </p>
          </div>
        </section>
      )}

      <footer
        style={{
          textAlign: "center",
          padding: "25px 5px",
          color: "#7892aa",
          fontSize: "12px"
        }}
      >
        NHL General Manager 27 · Jeu gratuit
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
