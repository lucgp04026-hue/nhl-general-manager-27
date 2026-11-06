
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { teams } from "./data/teams.js";
import { players } from "./data/players.js";
import { chargerTousLesJoueurs } from "./data/nhlRoster.js";

import "./style.css";

function PhotoJoueur({ joueur, taille = 65 }) {
  const [erreur, setErreur] = useState(false);

  return (
    <div
      style={{
        width: taille,
        height: taille,
        borderRadius: "50%",
        overflow: "hidden",
        background: "#263449",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}
    >
      {joueur.photo && !erreur ? (
        <img
          src={joueur.photo}
          alt={joueur.nom}
          onError={() => setErreur(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      ) : (
        <span style={{ fontSize: taille / 2 }}>🏒</span>
      )}
    </div>
  );
}

function App() {
  const equipeDepart =
    teams.find((equipe) => equipe.id === "MTL") || teams[0];

  const [onglet, setOnglet] = useState("Accueil");
  const [equipeSelectionnee, setEquipeSelectionnee] =
    useState(equipeDepart?.id || "MTL");

  const [effectif, setEffectif] = useState(players);
  const [chargementNHL, setChargementNHL] = useState(true);
  const [erreurChargement, setErreurChargement] = useState("");

  const [victoires, setVictoires] = useState(0);
  const [defaites, setDefaites] = useState(0);
  const [defaitesProlongation, setDefaitesProlongation] =
    useState(0);

  const [joueurSelectionne, setJoueurSelectionne] = useState(null);
  const [joueurEchange, setJoueurEchange] = useState("");
  const [messageEchange, setMessageEchange] = useState("");

  const equipeActuelle = teams.find(
    (equipe) => equipe.id === equipeSelectionnee
  );

  const joueursEquipe = effectif.filter(
    (joueur) => joueur.equipe === equipeActuelle?.name
  );

  const totalMatchs =
    victoires + defaites + defaitesProlongation;

  const points = victoires * 2 + defaitesProlongation;

  const pourcentage =
    totalMatchs > 0
      ? Math.round((victoires / totalMatchs) * 100)
      : 0;

  useEffect(() => {
    let actif = true;

    chargerTousLesJoueurs(teams, players)
      .then((liste) => {
        if (actif && liste.length > 0) {
          setEffectif(liste);
          setErreurChargement("");
        }
      })
      .catch((erreur) => {
        console.error("Erreur NHL :", erreur);

        if (actif) {
          setErreurChargement(
            "Impossible de charger les effectifs NHL."
          );
        }
      })
      .finally(() => {
        if (actif) setChargementNHL(false);
      });

    return () => {
      actif = false;
    };
  }, []);

  function simulerMatch() {
    const resultat = Math.random();

    if (resultat < 0.45) {
      setVictoires((v) => v + 1);
      alert("Victoire ! 🏆");
    } else if (resultat < 0.85) {
      setDefaites((d) => d + 1);
      alert("Défaite.");
    } else {
      setDefaitesProlongation((d) => d + 1);
      alert("Défaite en prolongation.");
    }
  }

  function recommencerSaison() {
    if (!window.confirm("Recommencer la saison ?")) return;

    setVictoires(0);
    setDefaites(0);
    setDefaitesProlongation(0);
  }

  function effectuerEchange() {
    if (!joueurSelectionne || !joueurEchange) {
      setMessageEchange("Sélectionne deux joueurs.");
      return;
    }

    const joueurCible = effectif.find(
      (joueur) => String(joueur.idNhl) === String(joueurEchange)
    );

    if (!joueurCible) {
      setMessageEchange("Joueur introuvable.");
      return;
    }

    if (joueurSelectionne.idNhl === joueurCible.idNhl) {
      setMessageEchange("Tu ne peux pas échanger un joueur contre lui-même.");
      return;
    }

    const nouvelleListe = effectif.map((joueur) => {
      if (joueur.idNhl === joueurSelectionne.idNhl) {
        return {
          ...joueur,
          equipe: joueurCible.equipe
        };
      }

      if (joueur.idNhl === joueurCible.idNhl) {
        return {
          ...joueur,
          equipe: joueurSelectionne.equipe
        };
      }

      return joueur;
    });

    setEffectif(nouvelleListe);
    setJoueurSelectionne(null);
    setJoueurEchange("");
    setMessageEchange(
      "Échange effectué ! Les deux joueurs ont changé d'équipe."
    );
  }

  const styleBouton = {
    background: "#1769aa",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "bold"
  };

  const styleCarte = {
    background: "#172438",
    color: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1422",
        color: "white",
        fontFamily: "Arial, sans-serif",
        paddingBottom: 30
      }}
    >
      <header
        style={{
          background: "#101e32",
          padding: 20,
          textAlign: "center",
          borderBottom: "3px solid #1769aa"
        }}
      >
        <h1 style={{ margin: 0 }}>
          🏒 NHL GENERAL MANAGER 27
        </h1>

        <p style={{ color: "#aabbd0" }}>
          Construis ton équipe. Gère ta franchise. Gagne la Coupe !
        </p>
      </header>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
          padding: 15,
          background: "#101e32"
        }}
      >
        {[
          "Accueil",
          "Effectif",
          "Échanges",
          "Saison",
          "Finances"
        ].map((nom) => (
          <button
            key={nom}
            onClick={() => setOnglet(nom)}
            style={{
              ...styleBouton,
              background:
                onglet === nom ? "#e63946" : "#263449"
            }}
          >
            {nom}
          </button>
        ))}
      </nav>

      <main
        style={{
          maxWidth: 1100,
          margin: "auto",
          padding: 15
        }}
      >
        <div style={styleCarte}>
          <label>
            <strong>Équipe sélectionnée :</strong>
          </label>

          <select
            value={equipeSelectionnee}
            onChange={(e) => {
              setEquipeSelectionnee(e.target.value);
              setJoueurSelectionne(null);
              setMessageEchange("");
            }}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginTop: 10,
              borderRadius: 8,
              background: "#263449",
              color: "white",
              border: "1px solid #52647b"
            }}
          >
            {teams.map((equipe) => (
              <option key={equipe.id} value={equipe.id}>
                {equipe.name}
              </option>
            ))}
          </select>
        </div>

        {chargementNHL && (
          <div style={styleCarte}>
            Chargement des effectifs NHL...
          </div>
        )}

        {erreurChargement && (
          <div style={{ ...styleCarte, color: "#ffb4b4" }}>
            {erreurChargement}
          </div>
        )}

        {onglet === "Accueil" && (
          <>
            <h2>Tableau de bord</h2>

            <div style={styleCarte}>
              <h2>{equipeActuelle?.name}</h2>
              <p>
                Conférence : {equipeActuelle?.conference}
              </p>
              <p>
                Division : {equipeActuelle?.division}
              </p>
              <p>
                Joueurs dans l'effectif : {joueursEquipe.length}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 10
              }}
            >
              <div style={styleCarte}>
                <h3>Victoires</h3>
                <h1>{victoires}</h1>
              </div>

              <div style={styleCarte}>
                <h3>Défaites</h3>
                <h1>{defaites}</h1>
              </div>

              <div style={styleCarte}>
                <h3>Prolongations</h3>
                <h1>{defaitesProlongation}</h1>
              </div>

              <div style={styleCarte}>
                <h3>Points</h3>
                <h1>{points}</h1>
              </div>
            </div>

            <div style={styleCarte}>
              <h3>Saison 2026-2027</h3>
              <p>Matchs joués : {totalMatchs}</p>
              <p>Pourcentage de victoires : {pourcentage} %</p>

              <button
                style={styleBouton}
                onClick={simulerMatch}
              >
                Simuler un match
              </button>

              <button
                style={{
                  ...styleBouton,
                  background: "#7a3440",
                  marginLeft: 8
                }}
                onClick={recommencerSaison}
              >
                Recommencer
              </button>
            </div>
          </>
        )}

        {onglet === "Effectif" && (
          <>
            <h2>Effectif de {equipeActuelle?.name}</h2>

            <p>
              {joueursEquipe.length} joueur(s) dans l'équipe
            </p>

            {joueursEquipe.length === 0 ? (
              <div style={styleCarte}>
                Aucun joueur chargé pour cette équipe.
              </div>
            ) : (
              joueursEquipe.map((joueur, index) => (
                <div
                  key={`${joueur.idNhl || joueur.nom}-${index}`}
                  style={{
                    ...styleCarte,
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}
                >
                  <PhotoJoueur joueur={joueur} />

                  <div style={{ flex: 1 }}>
                    <strong>{joueur.nom}</strong>
                    <p style={{ margin: "5px 0", color: "#aabbd0" }}>
                      #{joueur.numero} · {joueur.pos} · {joueur.age} ans
                    </p>
                    <p style={{ margin: 0 }}>
                      OVR : {joueur.ovr}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {joueur.salaire
                      ? `${joueur.salaire} M$`
                      : "Salaire à ajouter"}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {onglet === "Échanges" && (
          <>
            <h2>Centre des échanges</h2>

            <div style={styleCarte}>
              <h3>1. Choisir ton joueur</h3>

              <select
                value={joueurSelectionne?.idNhl || ""}
                onChange={(e) => {
                  const joueur = effectif.find(
                    (j) =>
                      String(j.idNhl) === e.target.value &&
                      j.equipe === equipeActuelle?.name
                  );

                  setJoueurSelectionne(joueur || null);
                  setMessageEchange("");
                }}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8
                }}
              >
                <option value="">Choisir un joueur</option>

                {joueursEquipe.map((joueur, index) => (
                  <option
                    key={`${joueur.idNhl}-${index}`}
                    value={joueur.idNhl}
                  >
                    {joueur.nom}
                  </option>
                ))}
              </select>

              <h3>2. Choisir le joueur à recevoir</h3>

              <select
                value={joueurEchange}
                onChange={(e) => {
                  setJoueurEchange(e.target.value);
                  setMessageEchange("");
                }}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8
                }}
              >
                <option value="">Choisir un joueur</option>

                {effectif
                  .filter(
                    (joueur) =>
                      joueur.equipe !== equipeActuelle?.name
                  )
                  .map((joueur, index) => (
                    <option
                      key={`${joueur.idNhl}-${index}`}
                      value={joueur.idNhl}
                    >
                      {joueur.nom} — {joueur.equipe}
                    </option>
                  ))}
              </select>

              <button
                onClick={effectuerEchange}
                style={{ ...styleBouton, marginTop: 15 }}
              >
                Confirmer l'échange
              </button>

              {messageEchange && (
                <p>{messageEchange}</p>
              )}
            </div>
          </>
        )}

        {onglet === "Saison" && (
          <>
            <h2>Saison 2026-2027</h2>

            <div style={styleCarte}>
              <h3>Résultats de la saison</h3>
              <p>Matchs joués : {totalMatchs}</p>
              <p>Victoires : {victoires}</p>
              <p>Défaites : {defaites}</p>
              <p>Défaites en prolongation : {defaitesProlongation}</p>
              <p>Points au classement : {points}</p>
              <p>Pourcentage de victoires : {pourcentage} %</p>

              <button
                style={styleBouton}
                onClick={simulerMatch}
              >
                Jouer le prochain match
              </button>
            </div>

            <div style={styleCarte}>
              <h3>Classement</h3>
              <p>
                Le classement complet de la LNH sera ajouté dans
                la prochaine étape.
              </p>
            </div>
          </>
        )}

        {onglet === "Finances" && (
          <>
            <h2>Finances de la franchise</h2>

            <div style={styleCarte}>
              <h3>{equipeActuelle?.name}</h3>

              <p>
                Nombre de joueurs : {joueursEquipe.length}
              </p>

              <p>
                Masse salariale connue :{" "}
                {joueursEquipe
                  .reduce(
                    (total, joueur) =>
                      total + (Number(joueur.salaire) || 0),
                    0
                  )
                  .toFixed(2)}{" "}
                M$
              </p>

              <p>
                Les salaires non renseignés ne sont pas inclus
                dans ce total.
              </p>
            </div>
          </>
        )}
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: 20,
          color: "#8395aa"
        }}
      >
        NHL General Manager 27 · Jeu gratuit
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
