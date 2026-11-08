
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { teams } from "./data/teams.js";
import { players } from "./data/players.js";
import { AGENTS_LIBRES_DEPART } from "./data/agentsLibres.js";
import { chargerTousLesJoueurs } from "./data/nhlRoster.js";
import { chargerContrats } from "./data/contrats.js";

import {
  preparerJoueurs,
  developperJoueurs
} from "./data/progression.js";

import "./style.css";

const CLE_SAUVEGARDE = "nhl-general-manager-27-partie";

function lireSauvegarde() {
  try {
    const contenu = localStorage.getItem(CLE_SAUVEGARDE);
    return contenu ? JSON.parse(contenu) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function App() {
  const equipeDepart =
    teams.find((equipe) => equipe.id === "MTL") || teams[0];

  const [partieInitiale] = useState(() => lireSauvegarde());

  const [onglet, setOnglet] = useState("Accueil");

  const [equipeSelectionnee, setEquipeSelectionnee] = useState(() => {
    const id = partieInitiale?.equipeSelectionnee;
    return teams.find((equipe) => equipe.id === id) || equipeDepart;
  });

  const [effectif, setEffectif] = useState(
    () => partieInitiale?.effectif || players
  );

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  const [agentsLibres, setAgentsLibres] = useState(
    () => partieInitiale?.agentsLibres || AGENTS_LIBRES_DEPART
  );

  const [offres, setOffres] = useState(
    () =>
      partieInitiale?.offres ||
      Object.fromEntries(
        AGENTS_LIBRES_DEPART.map((agent) => [
          agent.id,
          String(agent.offre)
        ])
      )
  );

  const [saison, setSaison] = useState(
    () => partieInitiale?.saison ?? 2026
  );

  const [victoires, setVictoires] = useState(
    () => partieInitiale?.victoires ?? 0
  );

  const [defaites, setDefaites] = useState(
    () => partieInitiale?.defaites ?? 0
  );

  const [defaitesProlongation, setDefaitesProlongation] = useState(
    () => partieInitiale?.defaitesProlongation ?? 0
  );

  const [historiqueMatchs, setHistoriqueMatchs] = useState(
    () => partieInitiale?.historiqueMatchs || []
  );

  const [historiqueEchanges, setHistoriqueEchanges] = useState(
    () => partieInitiale?.historiqueEchanges || []
  );

  const [equipeEchange1, setEquipeEchange1] = useState("MTL");
  const [equipeEchange2, setEquipeEchange2] = useState("TOR");

  const [joueurEchange1, setJoueurEchange1] = useState("");
  const [joueurEchange2, setJoueurEchange2] = useState("");

  const [equipeEchangesFiltre, setEquipeEchangesFiltre] =
    useState("TOUS");

  // Chargement des données NHL au démarrage.
  useEffect(() => {
    let actif = true;

    async function chargerDonnees() {
      if (partieInitiale) {
        setChargement(false);
        return;
      }

      try {
        setChargement(true);
        setErreur("");

        const liste = await chargerTousLesJoueurs(teams, players);
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

  // Sauvegarde automatique.
  useEffect(() => {
    if (chargement) return;

    const partie = {
      version: 1,
      dateSauvegarde: new Date().toISOString(),
      effectif,
      equipeSelectionnee: equipeSelectionnee.id,
      agentsLibres,
      offres,
      saison,
      victoires,
      defaites,
      defaitesProlongation,
      historiqueMatchs,
      historiqueEchanges
    };

    try {
      localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(partie));
    } catch (error) {
      console.error("Erreur de sauvegarde automatique :", error);
    }
  }, [
    chargement,
    effectif,
    equipeSelectionnee,
    agentsLibres,
    offres,
    saison,
    victoires,
    defaites,
    defaitesProlongation,
    historiqueMatchs,
    historiqueEchanges
  ]);

  const joueursEquipe = effectif.filter(
    (joueur) => joueur.equipe === equipeSelectionnee.name
  );

  const totalMasseSalariale = joueursEquipe.reduce(
    (total, joueur) => total + (Number(joueur.salaire) || 0),
    0
  );

  const nomEquipeEchange1 =
    teams.find((equipe) => equipe.id === equipeEchange1)?.name;

  const nomEquipeEchange2 =
    teams.find((equipe) => equipe.id === equipeEchange2)?.name;

  const joueursEquipeEchange1 = effectif.filter(
    (joueur) => joueur.equipe === nomEquipeEchange1
  );

  const joueursEquipeEchange2 = effectif.filter(
    (joueur) => joueur.equipe === nomEquipeEchange2
  );

  function afficherSalaire(salaire) {
    const montant = Number(salaire) || 0;

    if (montant <= 0) return "Non disponible";

    return (montant * 1000000).toLocaleString("fr-CA", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });
  }

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

  function changerEquipeEchange1(id) {
    setEquipeEchange1(id);
    setJoueurEchange1("");
  }

  function changerEquipeEchange2(id) {
    setEquipeEchange2(id);
    setJoueurEchange2("");
  }

  function sauvegarderPartie() {
    if (chargement) {
      setMessage("Attends la fin du chargement avant de sauvegarder.");
      return;
    }

    const partie = {
      version: 1,
      dateSauvegarde: new Date().toISOString(),
      effectif,
      equipeSelectionnee: equipeSelectionnee.id,
      agentsLibres,
      offres,
      saison,
      victoires,
      defaites,
      defaitesProlongation,
      historiqueMatchs,
      historiqueEchanges
    };

    try {
      localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(partie));
      setMessage("💾 Partie sauvegardée avec succès !");
    } catch (error) {
      console.error(error);
      setMessage("Impossible de sauvegarder la partie.");
    }
  }

  function chargerPartie() {
    const partie = lireSauvegarde();

    if (!partie || !partie.effectif) {
      setMessage("Aucune sauvegarde trouvée sur cet appareil.");
      return;
    }

    const confirmer = window.confirm(
      "Charger la partie sauvegardée ? La partie actuelle sera remplacée."
    );

    if (!confirmer) return;

    setEffectif(partie.effectif);

    const equipe =
      teams.find((item) => item.id === partie.equipeSelectionnee) ||
      equipeDepart;

    setEquipeSelectionnee(equipe);
    setAgentsLibres(partie.agentsLibres || []);
    setOffres(partie.offres || {});
    setSaison(partie.saison ?? 2026);
    setVictoires(partie.victoires ?? 0);
    setDefaites(partie.defaites ?? 0);
    setDefaitesProlongation(partie.defaitesProlongation ?? 0);
    setHistoriqueMatchs(partie.historiqueMatchs || []);
    setHistoriqueEchanges(partie.historiqueEchanges || []);

    setMessage("📂 Partie chargée avec succès !");
    setOnglet("Accueil");
  }

  function categoriePosition(position) {
    const pos = String(position || "").toUpperCase().trim();

    if (["G", "GK", "GB", "GOALIE"].includes(pos)) {
      return "gardiens";
    }

    if (["D", "LD", "RD", "DEF", "DEFENSE"].includes(pos)) {
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

  // Création des buteurs d'un match.
  function genererButeurs(listeJoueurs, nombreButs, nomEquipe) {
    const candidats = listeJoueurs.filter(
      (joueur) => categoriePosition(joueur.pos) !== "gardiens"
    );

    if (candidats.length === 0) {
      return nombreButs > 0
        ? [{
            nom: "Buteur inconnu",
            equipe: nomEquipe,
            buts: nombreButs
          }]
        : [];
    }

    const buteurs = {};

    for (let i = 0; i < nombreButs; i++) {
      const joueur =
        candidats[Math.floor(Math.random() * candidats.length)];

      const cle = joueur.idNhl || joueur.id || joueur.nom;

      if (!buteurs[cle]) {
        buteurs[cle] = {
          nom: joueur.nom,
          equipe: nomEquipe,
          buts: 0
        };
      }

      buteurs[cle].buts++;
    }

    return Object.values(buteurs);
  }

  // Simulation d'un match avec les buteurs.
  function simulerMatch() {
    const adversaires = teams.filter(
      (equipe) => equipe.id !== equipeSelectionnee.id
    );

    if (adversaires.length === 0) return;

    const adversaire =
      adversaires[Math.floor(Math.random() * adversaires.length)];

    const joueursAdverses = effectif.filter(
      (joueur) => joueur.equipe === adversaire.name
    );

    let butsEquipe = Math.floor(Math.random() * 5) + 1;
    let butsAdversaire = Math.floor(Math.random() * 5) + 1;

    if (butsEquipe === butsAdversaire) {
      if (Math.random() < 0.5) {
        butsEquipe++;
      } else {
        butsAdversaire++;
      }
    }

    const victoire = butsEquipe > butsAdversaire;
    const prolongation = !victoire && Math.random() < 0.3;

    const buteursEquipe = genererButeurs(
      joueursEquipe,
      butsEquipe,
      equipeSelectionnee.name
    );

    const buteursAdverses = genererButeurs(
      joueursAdverses,
      butsAdversaire,
      adversaire.name
    );

    const nouveauMatch = {
      id: Date.now() + Math.random(),
      saison,
      equipe: equipeSelectionnee.name,
      adversaire: adversaire.name,
      butsEquipe,
      butsAdversaire,
      victoire,
      prolongation,
      buteurs: [...buteursEquipe, ...buteursAdverses]
    };

    setHistoriqueMatchs((anciens) => [
      nouveauMatch,
      ...anciens
    ]);

    if (victoire) {
      setVictoires((ancien) => ancien + 1);
      setMessage(
        "🏆 Victoire " + butsEquipe + "-" + butsAdversaire + " !"
      );
    } else if (prolongation) {
      setDefaitesProlongation((ancien) => ancien + 1);
      setMessage(
        "Défaite en prolongation " +
          butsEquipe +
          "-" +
          butsAdversaire +
          "."
      );
    } else {
      setDefaites((ancien) => ancien + 1);
      setMessage(
        "Défaite " + butsEquipe + "-" + butsAdversaire + "."
      );
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

  // Échange entre deux équipes.
  function effectuerEchange() {
    if (!joueurEchange1 || !joueurEchange2) {
      setMessage("Sélectionne deux joueurs.");
      return;
    }

    const index1 = Number(joueurEchange1);
    const index2 = Number(joueurEchange2);

    const joueur1 = effectif[index1];
    const joueur2 = effectif[index2];

    if (!joueur1 || !joueur2 || index1 === index2) {
      setMessage("Sélection d'échange invalide.");
      return;
    }

    if (joueur1.equipe === joueur2.equipe) {
      setMessage("Les joueurs doivent appartenir à deux équipes différentes.");
      return;
    }

    const confirmer = window.confirm(
      "Confirmer l'échange de " +
        joueur1.nom +
        " contre " +
        joueur2.nom +
        " ?"
    );

    if (!confirmer) return;

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

    setHistoriqueEchanges((anciens) => [
      {
        id: Date.now(),
        saison,
        equipe1: joueur1.equipe,
        equipe2: joueur2.equipe,
        joueur1: joueur1.nom,
        joueur2: joueur2.nom
      },
      ...anciens
    ]);

    setJoueurEchange1("");
    setJoueurEchange2("");

    setMessage(
      "Échange effectué : " +
        joueur1.nom +
        " contre " +
        joueur2.nom +
        " !"
    );
  }

  function modifierOffre(id, montant) {
    setOffres((anciennes) => ({
      ...anciennes,
      [id]: montant
    }));
  }

  function signerAgentLibre(agent) {
    const montant = Number(offres[agent.id]);

    if (!Number.isFinite(montant) || montant <= 0) {
      setMessage("Entre un salaire annuel valide.");
      return;
    }

    const confirmer = window.confirm(
      "Signer " +
        agent.nom +
        " avec " +
        equipeSelectionnee.name +
        " pour " +
        afficherSalaire(montant) +
        " par saison ?"
    );

    if (!confirmer) return;

    const nouveauJoueur = {
      idNhl: agent.idNhl || agent.id,
      nom: agent.nom,
      pos: agent.position,
      age: agent.age,
      equipe: equipeSelectionnee.name,
      salaire: montant,
      ovr: agent.ovr,
      potentiel: agent.potentiel,
      progressionAnnuelle: 0,
      photo: agent.photo,
      contratDisponible: false,
      finContrat: "Nouveau contrat",
      numero: null
    };

    setEffectif((anciens) => [
      ...anciens.filter(
        (joueur) =>
          String(joueur.idNhl || joueur.id) !==
          String(agent.idNhl || agent.id)
      ),
      nouveauJoueur
    ]);

    setAgentsLibres((anciens) =>
      anciens.filter((joueur) => joueur.id !== agent.id)
    );

    setMessage(
      "🏒 " +
        agent.nom +
        " a signé avec " +
        equipeSelectionnee.name +
        " !"
    );
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
              {joueur.pos || "Position inconnue"} · {joueur.age || "?"} ans
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
            Potentiel : <strong>{joueur.potentiel ?? joueur.ovr ?? 75}</strong>
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

  function afficherAgentLibre(agent) {
    return (
      <div key={agent.id} style={styleCarte}>
        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          {afficherPhoto({
            nom: agent.nom,
            photo: agent.photo
          })}

          <div style={{ flex: 1, minWidth: "160px" }}>
            <h3 style={{ margin: "0 0 8px" }}>{agent.nom}</h3>

            <p style={{ margin: "4px 0" }}>
              {agent.position} · {agent.age} ans
            </p>

            <p style={{ margin: "4px 0" }}>
              Ancienne équipe : {agent.ancienneEquipe}
            </p>

            <p style={{ margin: "4px 0" }}>
              Ancien salaire : {afficherSalaire(agent.ancienSalaire)}
            </p>

            <p style={{ margin: "4px 0", color: "#69c1ff" }}>
              Agent libre · {agent.statut}
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
              {agent.ovr}
            </div>
            <small>OVR</small>
          </div>
        </div>

        <hr style={{ borderColor: "#34465c" }} />

        <p>
          Potentiel : <strong>{agent.potentiel}</strong>
        </p>

        <label
          style={{
            display: "block",
            marginBottom: "7px",
            fontWeight: "bold"
          }}
        >
          Offre salariale annuelle (millions USD)
        </label>

        <input
          type="number"
          min="0.1"
          step="0.1"
          value={offres[agent.id] ?? ""}
          onChange={(e) =>
            modifierOffre(agent.id, e.target.value)
          }
          style={{
            ...styleSelect,
            width: "100%",
            boxSizing: "border-box"
          }}
        />

        <p style={{ color: "#a9c5df", fontSize: "13px" }}>
          Offre actuelle : {afficherSalaire(offres[agent.id])}
        </p>

        <button
          style={{
            ...styleBouton,
            background: "#18834a",
            width: "100%"
          }}
          onClick={() => signerAgentLibre(agent)}
        >
          Signer avec {equipeSelectionnee.name}
        </button>
      </div>
    );
  }

  function afficherMatch(match) {
    return (
      <div key={match.id} style={styleCarte}>
        <h3 style={{ textAlign: "center" }}>
          {match.equipe} {match.butsEquipe} - {match.butsAdversaire}{" "}
          {match.adversaire}
        </h3>

        <p style={{ textAlign: "center", color: "#69c1ff" }}>
          Saison {match.saison} ·{" "}
          {match.victoire
            ? "Victoire"
            : match.prolongation
              ? "Défaite en prolongation"
              : "Défaite"}
        </p>

        <hr style={{ borderColor: "#34465c" }} />

        <h4>🏒 Buteurs</h4>

        {match.buteurs.length === 0 ? (
          <p>Aucun buteur enregistré.</p>
        ) : (
          match.buteurs.map((buteur, index) => (
            <p key={index} style={{ margin: "7px 0" }}>
              <strong>{buteur.nom}</strong> — {buteur.equipe} :{" "}
              {buteur.buts} but(s)
            </p>
          ))
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

        <div style={{ marginTop: "12px" }}>
          <button
            style={{ ...styleBouton, background: "#18834a" }}
            onClick={sauvegarderPartie}
          >
            💾 Sauvegarder
          </button>

          <button
            style={{ ...styleBouton, background: "#6b4bb5" }}
            onClick={chargerPartie}
          >
            📂 Charger une partie
          </button>
        </div>
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
        {[
          "Accueil",
          "Effectif",
          "Échanges",
          "Agents libres",
          "Saison",
          "Finances"
        ].map((nom) => (
          <button
            key={nom}
            onClick={() => {
              setOnglet(nom);
              setMessage("");
            }}
            style={{
              ...styleBouton,
              background: onglet === nom ? "#2879c7" : "#26394e"
            }}
          >
            {nom}
          </button>
        ))}
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

            <p>Conférence : {equipeSelectionnee.conference}</p>
            <p>Division : {equipeSelectionnee.division}</p>
            <p>Joueurs : {joueursEquipe.length}</p>

            <p>
              Masse salariale : {afficherSalaire(totalMasseSalariale)}
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

          <p>Total : {joueursEquipe.length} joueurs</p>

          {afficherSection("ATTAQUANTS", attaquants, "🏒")}
          {afficherSection("DÉFENSEURS", defenseurs, "🛡️")}
          {afficherSection("GARDIENS", gardiens, "🥅")}
        </section>
      )}

      {onglet === "Échanges" && (
        <section>
          <h2>Marché des échanges</h2>

          <p>
            Choisis une équipe, puis sélectionne le joueur que tu veux
            échanger. Fais ensuite la même chose pour l'autre équipe.
          </p>

          <div style={styleCarte}>
            <h3>🏒 Première équipe</h3>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={equipeEchange1}
              onChange={(e) => changerEquipeEchange1(e.target.value)}
            >
              {teams.map((equipe) => (
                <option key={equipe.id} value={equipe.id}>
                  {equipe.name}
                </option>
              ))}
            </select>

            <p>Joueurs : {joueursEquipeEchange1.length}</p>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={joueurEchange1}
              onChange={(e) => setJoueurEchange1(e.target.value)}
            >
              <option value="">Choisir un joueur</option>

              {joueursEquipeEchange1.map((joueur) => {
                const index = effectif.indexOf(joueur);

                return (
                  <option key={index} value={index}>
                    {joueur.nom} - {joueur.pos} - OVR {joueur.ovr}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={styleCarte}>
            <h3>🛡️ Deuxième équipe</h3>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={equipeEchange2}
              onChange={(e) => changerEquipeEchange2(e.target.value)}
            >
              {teams.map((equipe) => (
                <option
                  key={equipe.id}
                  value={equipe.id}
                  disabled={equipe.id === equipeEchange1}
                >
                  {equipe.name}
                </option>
              ))}
            </select>

            <p>Joueurs : {joueursEquipeEchange2.length}</p>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={joueurEchange2}
              onChange={(e) => setJoueurEchange2(e.target.value)}
            >
              <option value="">Choisir un joueur</option>

              {joueursEquipeEchange2.map((joueur) => {
                const index = effectif.indexOf(joueur);

                return (
                  <option key={index} value={index}>
                    {joueur.nom} - {joueur.pos} - OVR {joueur.ovr}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            style={{
              ...styleBouton,
              background: "#18834a",
              width: "100%"
            }}
            onClick={effectuerEchange}
          >
            Confirmer l'échange
          </button>

          <h3 style={{ marginTop: "30px" }}>Historique des échanges</h3>

          <select
            style={{ ...styleSelect, width: "100%" }}
            value={equipeEchangesFiltre}
            onChange={(e) => setEquipeEchangesFiltre(e.target.value)}
          >
            <option value="TOUS">Toutes les équipes</option>

            {teams.map((equipe) => (
              <option key={equipe.id} value={equipe.name}>
                {equipe.name}
              </option>
            ))}
          </select>

          {historiqueEchanges
            .filter(
              (echange) =>
                equipeEchangesFiltre === "TOUS" ||
                echange.equipe1 === equipeEchangesFiltre ||
                echange.equipe2 === equipeEchangesFiltre
            )
            .map((echange) => (
              <div key={echange.id} style={styleCarte}>
                <p>
                  <strong>{echange.equipe1}</strong> reçoit{" "}
                  {echange.joueur2}
                </p>

                <p>
                  <strong>{echange.equipe2}</strong> reçoit{" "}
                  {echange.joueur1}
                </p>

                <small>Saison {echange.saison}</small>
              </div>
            ))}

          {historiqueEchanges.length === 0 && (
            <p>Aucun échange effectué pour le moment.</p>
          )}
        </section>
      )}

      {onglet === "Agents libres" && (
        <section>
          <h2>Marché des agents libres</h2>

          <div style={styleCarte}>
            <h3>Équipe qui souhaite signer</h3>

            <select
              style={{ ...styleSelect, width: "100%" }}
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
              Masse salariale actuelle :{" "}
              <strong>{afficherSalaire(totalMasseSalariale)}</strong>
            </p>

            <p>Agents libres disponibles : {agentsLibres.length}</p>
          </div>

          {agentsLibres.length === 0 ? (
            <div style={styleCarte}>
              Tous les agents libres ont été signés !
            </div>
          ) : (
            agentsLibres.map(afficherAgentLibre)
          )}

          <p style={{ color: "#a9c5df", fontSize: "12px" }}>
            Les offres sont des montants de simulation en millions
            de dollars américains.
          </p>
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
              🏒 Simuler un match
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

          <h3>📋 Historique des matchs</h3>

          {historiqueMatchs.filter(
            (match) => match.saison === saison
          ).length === 0 ? (
            <p>Aucun match joué cette saison.</p>
          ) : (
            historiqueMatchs
              .filter((match) => match.saison === saison)
              .map(afficherMatch)
          )}
        </section>
      )}

      {onglet === "Finances" && (
        <section>
          <h2>Finances - {equipeSelectionnee.name}</h2>

          <div style={styleCarte}>
            <h3>Masse salariale</h3>

            <p>Joueurs : {joueursEquipe.length}</p>

            <h2>{afficherSalaire(totalMasseSalariale)}</h2>

            <p>
              Total des salaires des joueurs affichés dans l'effectif.
            </p>

            <p style={{ color: "#a9c5df", fontSize: "13px" }}>
              Montants en dollars américains (USD).
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
