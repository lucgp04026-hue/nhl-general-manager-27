
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

const STATS_VIDES = {
  MJ: 0, B: 0, A: 0, PTS: 0,
  plusMoins: 0, PUN: 0, AN: 0, DN: 0, BAG: 0
};

const STATS_GARDIEN_VIDES = {
  MJ: 0, V: 0, D: 0, DP: 0,
  BC: 0, ARR: 0, TIRS: 0, SO: 0, MIN: 0
};

function lireSauvegarde() {
  try {
    const data = localStorage.getItem(CLE_SAUVEGARDE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function cleJoueur(joueur) {
  return String(joueur.idNhl || joueur.id || joueur.nom);
}

function App() {
  const [sauvegardeInitiale] = useState(() => lireSauvegarde());

  const equipeDepart =
    teams.find((e) => e.id === "MTL") || teams[0];

  const [onglet, setOnglet] = useState("Accueil");

  const [equipeSelectionnee, setEquipeSelectionnee] = useState(
    () =>
      teams.find(
        (e) => e.id === sauvegardeInitiale?.equipeSelectionnee
      ) || equipeDepart
  );

  const [effectif, setEffectif] = useState(
    () => sauvegardeInitiale?.effectif || players
  );

  const [agentsLibres, setAgentsLibres] = useState(
    () => sauvegardeInitiale?.agentsLibres || AGENTS_LIBRES_DEPART
  );

  const [offres, setOffres] = useState(
    () =>
      sauvegardeInitiale?.offres ||
      Object.fromEntries(
        AGENTS_LIBRES_DEPART.map((a) => [a.id, String(a.offre)])
      )
  );

  const [saison, setSaison] = useState(
    () => sauvegardeInitiale?.saison ?? 2026
  );

  const [victoires, setVictoires] = useState(
    () => sauvegardeInitiale?.victoires ?? 0
  );

  const [defaites, setDefaites] = useState(
    () => sauvegardeInitiale?.defaites ?? 0
  );

  const [defaitesProlongation, setDefaitesProlongation] =
    useState(() => sauvegardeInitiale?.defaitesProlongation ?? 0);

  const [historiqueMatchs, setHistoriqueMatchs] = useState(
    () => sauvegardeInitiale?.historiqueMatchs || []
  );

  const [historiqueEchanges, setHistoriqueEchanges] = useState(
    () => sauvegardeInitiale?.historiqueEchanges || []
  );

  const [statistiques, setStatistiques] = useState(
    () => sauvegardeInitiale?.statistiques || {}
  );

  // Fatigue et historique des départs des gardiens.
  const [fatigueGardiens, setFatigueGardiens] = useState(
    () => sauvegardeInitiale?.fatigueGardiens || {}
  );

  const [dernierGardienDepart, setDernierGardienDepart] = useState(
    () => sauvegardeInitiale?.dernierGardienDepart || {}
  );

  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState("");

  const [equipeEchange1, setEquipeEchange1] = useState("MTL");
  const [equipeEchange2, setEquipeEchange2] = useState("TOR");
  const [joueurEchange1, setJoueurEchange1] = useState("");
  const [joueurEchange2, setJoueurEchange2] = useState("");

  const [filtreStats, setFiltreStats] = useState("TOUS");

  const styleCarte = {
    background: "#172638",
    color: "white",
    border: "1px solid #34465c",
    borderRadius: "12px",
    padding: "15px",
    margin: "12px 0"
  };

  const styleBouton = {
    padding: "11px 16px",
    margin: "5px",
    border: "none",
    borderRadius: "8px",
    background: "#164e91",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold"
  };

  const styleSelect = {
    padding: "10px",
    borderRadius: "7px",
    margin: "5px",
    maxWidth: "100%"
  };

  // Chargement des joueurs.
  useEffect(() => {
    let actif = true;

    async function charger() {
      if (sauvegardeInitiale) {
        setChargement(false);
        return;
      }

      try {
        const liste = await chargerTousLesJoueurs(teams, players);
        const avecContrats = await chargerContrats(liste);

        if (actif) {
          setEffectif(preparerJoueurs(avecContrats));
        }
      } catch (error) {
        console.error(error);

        if (actif) {
          setEffectif(preparerJoueurs(players));
          setMessage("Certaines données NHL n'ont pas pu être chargées.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();

    return () => {
      actif = false;
    };
  }, []);

  // Sauvegarde automatique.
  useEffect(() => {
    if (chargement) return;

    const partie = {
      effectif,
      equipeSelectionnee: equipeSelectionnee.id,
      agentsLibres,
      offres,
      saison,
      victoires,
      defaites,
      defaitesProlongation,
      historiqueMatchs,
      historiqueEchanges,
      statistiques,
      fatigueGardiens,
      dernierGardienDepart
    };

    try {
      localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(partie));
    } catch (error) {
      console.error("Erreur de sauvegarde", error);
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
    historiqueEchanges,
    statistiques,
    fatigueGardiens,
    dernierGardienDepart
  ]);

  const joueursEquipe = effectif.filter(
    (j) => j.equipe === equipeSelectionnee.name
  );

  const masseSalariale = joueursEquipe.reduce(
    (total, j) => total + (Number(j.salaire) || 0),
    0
  );

  function positionType(pos) {
    const p = String(pos || "").toUpperCase();

    if (["G", "GK", "GB", "GOALIE"].includes(p)) return "G";
    if (["D", "LD", "RD", "DEF", "DEFENSE"].includes(p)) return "D";

    return "A";
  }

  function trierAttaquants(liste) {
    const ordre = {
      C: 1, AG: 2, AD: 3, LW: 2, RW: 3
    };

    return [...liste].sort(
      (a, b) =>
        (ordre[String(a.pos).toUpperCase()] || 4) -
        (ordre[String(b.pos).toUpperCase()] || 4)
    );
  }

  const attaquants = trierAttaquants(
    joueursEquipe.filter((j) => positionType(j.pos) === "A")
  );

  const defenseurs = joueursEquipe.filter(
    (j) => positionType(j.pos) === "D"
  );

  const gardiens = joueursEquipe.filter(
    (j) => positionType(j.pos) === "G"
  );

  function salaireTexte(salaire) {
    const montant = Number(salaire) || 0;

    if (montant <= 0) return "Non disponible";

    return (montant * 1000000).toLocaleString("fr-CA", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });
  }

  function sauvegarderPartie() {
    if (chargement) {
      setMessage("Attends la fin du chargement.");
      return;
    }

    const partie = {
      effectif,
      equipeSelectionnee: equipeSelectionnee.id,
      agentsLibres,
      offres,
      saison,
      victoires,
      defaites,
      defaitesProlongation,
      historiqueMatchs,
      historiqueEchanges,
      statistiques,
      fatigueGardiens,
      dernierGardienDepart
    };

    try {
      localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(partie));
      setMessage("💾 Partie sauvegardée !");
    } catch {
      setMessage("Erreur pendant la sauvegarde.");
    }
  }

  function chargerPartie() {
    const partie = lireSauvegarde();

    if (!partie?.effectif) {
      setMessage("Aucune sauvegarde trouvée.");
      return;
    }

    if (!window.confirm("Charger la partie sauvegardée ?")) return;

    setEffectif(partie.effectif);

    setEquipeSelectionnee(
      teams.find((e) => e.id === partie.equipeSelectionnee) ||
      equipeDepart
    );

    setAgentsLibres(partie.agentsLibres || []);
    setOffres(partie.offres || {});
    setSaison(partie.saison ?? 2026);
    setVictoires(partie.victoires ?? 0);
    setDefaites(partie.defaites ?? 0);
    setDefaitesProlongation(partie.defaitesProlongation ?? 0);
    setHistoriqueMatchs(partie.historiqueMatchs || []);
    setHistoriqueEchanges(partie.historiqueEchanges || []);
    setStatistiques(partie.statistiques || {});
    setFatigueGardiens(partie.fatigueGardiens || {});
    setDernierGardienDepart(partie.dernierGardienDepart || {});

    setOnglet("Accueil");
    setMessage("📂 Partie chargée !");
  }

  // Choix du gardien partant.
  function choisirGardienPartant(nomEquipe, listeGardiens, fatigue, derniersDeparts) {
    if (!listeGardiens.length) return null;

    const gardiensTries = [...listeGardiens].sort((a, b) => {
      const cleA = cleJoueur(a);
      const cleB = cleJoueur(b);

      const fatigueA = Number(fatigue[cleA]) || 0;
      const fatigueB = Number(fatigue[cleB]) || 0;

      const dernier = derniersDeparts[nomEquipe];

      // OVR élevé = meilleur gardien.
      const ovrA = Number(a.ovr) || 65;
      const ovrB = Number(b.ovr) || 65;

      // La fatigue diminue la priorité.
      // Un gardien qui vient de jouer reçoit une pénalité supplémentaire.
      const scoreA =
        ovrA - fatigueA * 0.65 - (cleA === dernier ? 18 : 0);

      const scoreB =
        ovrB - fatigueB * 0.65 - (cleB === dernier ? 18 : 0);

      return scoreB - scoreA;
    });

    return gardiensTries[0];
  }

  function choisirAleatoirement(liste, nombre) {
    const melange = [...liste];

    for (let i = melange.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [melange[i], melange[j]] = [melange[j], melange[i]];
    }

    return melange.slice(0, Math.min(nombre, melange.length));
  }

  // Statistiques des joueurs et des gardiens.
  function genererStatistiquesMatch(
    locaux,
    visiteurs,
    butsLocaux,
    butsVisiteurs,
    nomLocal,
    nomVisiteur,
    prolongation,
    gardienLocal,
    gardienVisiteur,
    victoireLocale
  ) {
    const nouvelles = { ...statistiques };

    function modifier(joueur, changements) {
      const cle = cleJoueur(joueur);
      const ancienne = nouvelles[cle] || {};

      const stats = {
        ...STATS_VIDES,
        ...ancienne
      };

      Object.entries(changements).forEach(([nom, valeur]) => {
        stats[nom] = (Number(stats[nom]) || 0) + valeur;
      });

      stats.PTS = stats.B + stats.A;

      nouvelles[cle] = {
        ...ancienne,
        ...stats
      };
    }

    const skatersLocaux = locaux.filter(
      (j) => positionType(j.pos) !== "G"
    );

    const skatersVisiteurs = visiteurs.filter(
      (j) => positionType(j.pos) !== "G"
    );

    // Matchs joués.
    [...skatersLocaux, ...skatersVisiteurs].forEach((j) => {
      modifier(j, { MJ: 1 });
    });

    const buteurs = [];

    function ajouterButs(attaque, defense, nombre, nomEquipe) {
      for (let i = 0; i < nombre; i++) {
        if (!attaque.length) continue;

        const buteur =
          attaque[Math.floor(Math.random() * attaque.length)];

        const passeurs = choisirAleatoirement(
          attaque.filter((j) => j !== buteur),
          Math.floor(Math.random() * 3)
        );

        const tirage = Math.random();

        const type =
          tirage < 0.2 ? "AN" :
          tirage < 0.27 ? "DN" : "REG";

        modifier(buteur, {
          B: 1,
          ...(type === "AN" ? { AN: 1 } : {}),
          ...(type === "DN" ? { DN: 1 } : {})
        });

        passeurs.forEach((p) => modifier(p, { A: 1 }));

        // Le différentiel ne compte pas les buts en avantage numérique.
        if (type !== "AN") {
          attaque.forEach((j) => {
            if (j !== buteur) modifier(j, { plusMoins: 1 });
          });

          defense.forEach((j) => {
            modifier(j, { plusMoins: -1 });
          });

          modifier(buteur, { plusMoins: 1 });
        }

        buteurs.push({
          nom: buteur.nom,
          equipe: nomEquipe,
          type,
          passeurs: passeurs.map((p) => p.nom)
        });
      }
    }

    ajouterButs(
      skatersLocaux,
      skatersVisiteurs,
      butsLocaux,
      nomLocal
    );

    ajouterButs(
      skatersVisiteurs,
      skatersLocaux,
      butsVisiteurs,
      nomVisiteur
    );

    // Pénalités.
    for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
      const equipe =
        Math.random() < 0.5 ? skatersLocaux : skatersVisiteurs;

      if (!equipe.length) continue;

      const joueur =
        equipe[Math.floor(Math.random() * equipe.length)];

      modifier(joueur, {
        PUN: Math.random() < 0.8 ? 2 : 4
      });
    }

    // Bagarre.
    let bagarre = null;

    if (
      skatersLocaux.length &&
      skatersVisiteurs.length &&
      Math.random() < 0.18
    ) {
      const j1 =
        skatersLocaux[
          Math.floor(Math.random() * skatersLocaux.length)
        ];

      const j2 =
        skatersVisiteurs[
          Math.floor(Math.random() * skatersVisiteurs.length)
        ];

      modifier(j1, { BAG: 1, PUN: 5 });
      modifier(j2, { BAG: 1, PUN: 5 });

      bagarre = {
        joueur1: j1.nom,
        joueur2: j2.nom
      };
    }

    // Statistiques du gardien partant.
    function enregistrerGardien(gardien, butsContre, resultat) {
      if (!gardien) return;

      const cle = cleJoueur(gardien);
      const ancienne = nouvelles[cle] || {};

      const stats = {
        ...STATS_GARDIEN_VIDES,
        ...(ancienne.gardien || {})
      };

      const tirs = butsContre + 25 + Math.floor(Math.random() * 11);

      stats.MJ += 1;
      stats.BC += butsContre;
      stats.TIRS += tirs;
      stats.ARR += tirs - butsContre;
      stats.MIN += 60;

      if (resultat === "V") stats.V += 1;
      if (resultat === "D") stats.D += 1;
      if (resultat === "DP") stats.DP += 1;

      if (butsContre === 0) stats.SO += 1;

      nouvelles[cle] = {
        ...ancienne,
        gardien: stats
      };
    }

    const victoireVisiteur = !victoireLocale;

    enregistrerGardien(
      gardienLocal,
      butsVisiteurs,
      victoireLocale ? "V" : prolongation ? "DP" : "D"
    );

    enregistrerGardien(
      gardienVisiteur,
      butsLocaux,
      victoireVisiteur ? "V" : prolongation ? "DP" : "D"
    );

    return {
      statistiques: nouvelles,
      buteurs,
      bagarre
    };
  }

  // Simulation d'un match avec rotation des gardiens.
  function simulerMatch() {
    const adversaires = teams.filter(
      (e) => e.id !== equipeSelectionnee.id
    );

    if (!adversaires.length) return;

    const adversaire =
      adversaires[Math.floor(Math.random() * adversaires.length)];

    const joueursAdverses = effectif.filter(
      (j) => j.equipe === adversaire.name
    );

    const gardiensLocaux = joueursEquipe.filter(
      (j) => positionType(j.pos) === "G"
    );

    const gardiensAdverses = joueursAdverses.filter(
      (j) => positionType(j.pos) === "G"
    );

    const gardienLocal = choisirGardienPartant(
      equipeSelectionnee.name,
      gardiensLocaux,
      fatigueGardiens,
      dernierGardienDepart
    );

    const gardienAdverse = choisirGardienPartant(
      adversaire.name,
      gardiensAdverses,
      fatigueGardiens,
      dernierGardienDepart
    );

    let butsEquipe = Math.floor(Math.random() * 5) + 1;
    let butsAdversaire = Math.floor(Math.random() * 5) + 1;

    const egaliteAvantProlongation = butsEquipe === butsAdversaire;
    const prolongation =
      egaliteAvantProlongation && Math.random() < 0.3;

    if (butsEquipe === butsAdversaire) {
      if (Math.random() < 0.5) butsEquipe++;
      else butsAdversaire++;
    }

    const victoire = butsEquipe > butsAdversaire;

    const resultat = genererStatistiquesMatch(
      joueursEquipe,
      joueursAdverses,
      butsEquipe,
      butsAdversaire,
      equipeSelectionnee.name,
      adversaire.name,
      prolongation,
      gardienLocal,
      gardienAdverse,
      victoire
    );

    setStatistiques(resultat.statistiques);

    // Mise à jour de la fatigue de tous les gardiens.
    const nouvelleFatigue = { ...fatigueGardiens };

    [...gardiensLocaux, ...gardiensAdverses].forEach((gardien) => {
      const cle = cleJoueur(gardien);

      nouvelleFatigue[cle] = Math.max(
        0,
        (Number(nouvelleFatigue[cle]) || 0) - 12
      );
    });

    if (gardienLocal) {
      const cle = cleJoueur(gardienLocal);
      nouvelleFatigue[cle] =
        Math.min(100, (nouvelleFatigue[cle] || 0) + 25);
    }

    if (gardienAdverse) {
      const cle = cleJoueur(gardienAdverse);
      nouvelleFatigue[cle] =
        Math.min(100, (nouvelleFatigue[cle] || 0) + 25);
    }

    setFatigueGardiens(nouvelleFatigue);

    const nouveauxDerniersDeparts = {
      ...dernierGardienDepart
    };

    if (gardienLocal) {
      nouveauxDerniersDeparts[equipeSelectionnee.name] =
        cleJoueur(gardienLocal);
    }

    if (gardienAdverse) {
      nouveauxDerniersDeparts[adversaire.name] =
        cleJoueur(gardienAdverse);
    }

    setDernierGardienDepart(nouveauxDerniersDeparts);

    const match = {
      id: Date.now() + Math.random(),
      saison,
      equipe: equipeSelectionnee.name,
      adversaire: adversaire.name,
      butsEquipe,
      butsAdversaire,
      victoire,
      prolongation,
      gardienLocal: gardienLocal?.nom || "Aucun gardien",
      gardienAdverse: gardienAdverse?.nom || "Aucun gardien",
      buteurs: resultat.buteurs,
      bagarre: resultat.bagarre
    };

    setHistoriqueMatchs((anciens) => [match, ...anciens]);

    if (victoire) {
      setVictoires((v) => v + 1);
      setMessage(
        `🏆 Victoire ! Gardien partant : ${gardienLocal?.nom || "Non disponible"}`
      );
    } else if (prolongation) {
      setDefaitesProlongation((d) => d + 1);
      setMessage(
        `Défaite en prolongation. Gardien partant : ${gardienLocal?.nom || "Non disponible"}`
      );
    } else {
      setDefaites((d) => d + 1);
      setMessage(
        `Défaite. Gardien partant : ${gardienLocal?.nom || "Non disponible"}`
      );
    }
  }

  function prochaineSaison() {
    if (!window.confirm("Terminer la saison et avancer ?")) return;

    setEffectif((anciens) => developperJoueurs(anciens));
    setSaison((s) => s + 1);
    setVictoires(0);
    setDefaites(0);
    setDefaitesProlongation(0);

    // Les gardiens récupèrent pendant l'entre-saison.
    setFatigueGardiens({});

    setMessage("Nouvelle saison commencée !");
  }

  // Échanges.
  const nomEchange1 = teams.find(
    (e) => e.id === equipeEchange1
  )?.name;

  const nomEchange2 = teams.find(
    (e) => e.id === equipeEchange2
  )?.name;

  const joueursEchange1 = effectif.filter(
    (j) => j.equipe === nomEchange1
  );

  const joueursEchange2 = effectif.filter(
    (j) => j.equipe === nomEchange2
  );

  function effectuerEchange() {
    if (!joueurEchange1 || !joueurEchange2) {
      setMessage("Choisis deux joueurs.");
      return;
    }

    const index1 = Number(joueurEchange1);
    const index2 = Number(joueurEchange2);

    const j1 = effectif[index1];
    const j2 = effectif[index2];

    if (!j1 || !j2 || j1.equipe === j2.equipe) {
      setMessage("Échange invalide.");
      return;
    }

    if (!window.confirm(`Échanger ${j1.nom} contre ${j2.nom} ?`)) {
      return;
    }

    const copie = [...effectif];

    copie[index1] = { ...j1, equipe: j2.equipe };
    copie[index2] = { ...j2, equipe: j1.equipe };

    setEffectif(copie);

    setHistoriqueEchanges((anciens) => [
      {
        id: Date.now(),
        saison,
        equipe1: j1.equipe,
        equipe2: j2.equipe,
        joueur1: j1.nom,
        joueur2: j2.nom
      },
      ...anciens
    ]);

    setJoueurEchange1("");
    setJoueurEchange2("");
    setMessage("Échange effectué !");
  }

  // Agents libres.
  function signerAgent(agent) {
    const montant = Number(offres[agent.id]);

    if (!Number.isFinite(montant) || montant <= 0) {
      setMessage("Entre un salaire valide.");
      return;
    }

    if (!window.confirm(`Signer ${agent.nom} ?`)) return;

    const nouveau = {
      ...agent,
      idNhl: agent.idNhl || agent.id,
      pos: agent.position || agent.pos || "À déterminer",
      equipe: equipeSelectionnee.name,
      salaire: montant,
      contratDisponible: false,
      finContrat: "Nouveau contrat"
    };

    setEffectif((anciens) => [...anciens, nouveau]);

    setAgentsLibres((anciens) =>
      anciens.filter((a) => a.id !== agent.id)
    );

    setMessage(`${agent.nom} a signé !`);
  }

  // Affichage des joueurs.
  function afficherJoueur(joueur, index) {
    return (
      <div key={cleJoueur(joueur) + index} style={styleCarte}>
        <h3>
          {joueur.numero ? `#${joueur.numero} ` : ""}
          {joueur.nom}
        </h3>

        {joueur.photo && (
          <img
            src={joueur.photo}
            alt={joueur.nom}
            style={{
              width: "85px",
              height: "85px",
              objectFit: "cover",
              borderRadius: "10px"
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        <p>{joueur.pos} · {joueur.age} ans</p>
        <p>Équipe : {joueur.equipe}</p>
        <p>Salaire : {salaireTexte(joueur.salaire)}</p>
        <p>OVR : <strong>{joueur.ovr}</strong></p>
        <p>Potentiel : {joueur.potentiel}</p>
      </div>
    );
  }

  function afficherSection(titre, liste, emoji) {
    return (
      <div>
        <h3>{emoji} {titre} ({liste.length})</h3>
        {liste.length
          ? liste.map((j) => afficherJoueur(j, effectif.indexOf(j)))
          : <p>Aucun joueur.</p>}
      </div>
    );
  }

  // Statistiques.
  function statsJoueur(joueur) {
    return {
      ...STATS_VIDES,
      ...(statistiques[cleJoueur(joueur)] || {})
    };
  }

  function statsGardien(joueur) {
    return {
      ...STATS_GARDIEN_VIDES,
      ...(statistiques[cleJoueur(joueur)]?.gardien || {})
    };
  }

  function afficherTableauJoueurs(liste) {
    const skaters = liste.filter(
      (j) => positionType(j.pos) !== "G"
    );

    return (
      <div style={{ overflowX: "auto", ...styleCarte }}>
        <table style={{
          width: "100%",
          minWidth: "760px",
          borderCollapse: "collapse"
        }}>
          <thead>
            <tr>
              {["Joueur", "MJ", "B", "A", "PTS", "+/-", "PUN", "AN", "DN", "BAG"].map((t) => (
                <th key={t} style={{ padding: "9px", background: "#26394e" }}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {skaters
              .map((j) => ({ joueur: j, stats: statsJoueur(j) }))
              .sort((a, b) =>
                b.stats.PTS - a.stats.PTS || b.stats.B - a.stats.B
              )
              .map(({ joueur, stats }) => (
                <tr key={cleJoueur(joueur)} style={{ borderBottom: "1px solid #34465c" }}>
                  <td style={{ padding: "9px" }}>{joueur.nom}</td>
                  <td align="center">{stats.MJ}</td>
                  <td align="center">{stats.B}</td>
                  <td align="center">{stats.A}</td>
                  <td align="center"><strong>{stats.PTS}</strong></td>
                  <td align="center">
                    {stats.plusMoins > 0 ? `+${stats.plusMoins}` : stats.plusMoins}
                  </td>
                  <td align="center">{stats.PUN}</td>
                  <td align="center">{stats.AN}</td>
                  <td align="center">{stats.DN}</td>
                  <td align="center">{stats.BAG}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }

  function afficherTableauGardiens(liste) {
    const listeGardiens = liste.filter(
      (j) => positionType(j.pos) === "G"
    );

    return (
      <div style={{ overflowX: "auto", ...styleCarte }}>
        <table style={{
          width: "100%",
          minWidth: "850px",
          borderCollapse: "collapse"
        }}>
          <thead>
            <tr>
              {["Gardien", "MJ", "V", "D", "DP", "BC", "ARR", "TIRS", "%ARR", "MBC", "BL", "Fatigue"].map((t) => (
                <th key={t} style={{ padding: "9px", background: "#26394e" }}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {listeGardiens.map((gardien) => {
              const s = statsGardien(gardien);
              const cle = cleJoueur(gardien);

              const pourcentage =
                s.TIRS > 0
                  ? (s.ARR / s.TIRS).toFixed(3).replace(/^0/, "")
                  : ".000";

              const moyenne =
                s.MIN > 0
                  ? ((s.BC * 60) / s.MIN).toFixed(2)
                  : "0.00";

              const fatigue = Math.round(
                Number(fatigueGardiens[cle]) || 0
              );

              return (
                <tr key={cle} style={{ borderBottom: "1px solid #34465c" }}>
                  <td style={{ padding: "9px" }}>{gardien.nom}</td>
                  <td align="center">{s.MJ}</td>
                  <td align="center">{s.V}</td>
                  <td align="center">{s.D}</td>
                  <td align="center">{s.DP}</td>
                  <td align="center">{s.BC}</td>
                  <td align="center">{s.ARR}</td>
                  <td align="center">{s.TIRS}</td>
                  <td align="center">{pourcentage}</td>
                  <td align="center">{moyenne}</td>
                  <td align="center">{s.SO}</td>
                  <td align="center">{fatigue}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function afficherStatistiquesToutesEquipes() {
    const equipesAffichees = teams.filter(
      (e) => filtreStats === "TOUS" || e.id === filtreStats
    );

    return (
      <section>
        <h2>📊 Statistiques NHL</h2>

        <p>
          Statistiques individuelles des joueurs et gardiens des 32 équipes.
        </p>

        <select
          value={filtreStats}
          onChange={(e) => setFiltreStats(e.target.value)}
          style={{ ...styleSelect, width: "100%" }}
        >
          <option value="TOUS">Toutes les équipes</option>

          {teams.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        {equipesAffichees.map((equipe) => {
          const liste = effectif.filter(
            (j) => j.equipe === equipe.name
          );

          return (
            <div key={equipe.id} style={{ marginTop: "30px" }}>
              <h2 style={{
                background: "#164e91",
                padding: "13px",
                borderRadius: "9px"
              }}>
                🏒 {equipe.name}
              </h2>

              <h3>🏒 Statistiques des joueurs</h3>
              {afficherTableauJoueurs(liste)}

              <h3>🥅 Statistiques des gardiens</h3>
              {afficherTableauGardiens(liste)}
            </div>
          );
        })}

        <p style={{ color: "#a9c5df", fontSize: "12px" }}>
          Les statistiques sont cumulatives dans ta partie.
          Les performances sont simulées par le jeu.
        </p>
      </section>
    );
  }

  function afficherMatch(match) {
    return (
      <div key={match.id} style={styleCarte}>
        <h3 style={{ textAlign: "center" }}>
          {match.equipe} {match.butsEquipe} - {match.butsAdversaire} {match.adversaire}
        </h3>

        <p style={{ textAlign: "center" }}>
          {match.victoire
            ? "Victoire"
            : match.prolongation
              ? "Défaite en prolongation"
              : "Défaite"}
        </p>

        <p>
          🥅 Gardien partant : {match.gardienLocal || "Non disponible"}
        </p>

        <p>
          🥅 Gardien adverse : {match.gardienAdverse || "Non disponible"}
        </p>

        <hr style={{ borderColor: "#34465c" }} />

        <h4>🏒 Buteurs et passeurs</h4>

        {match.buteurs?.map((b, i) => (
          <p key={i}>
            <strong>{b.nom}</strong> — {b.equipe}
            {b.type === "AN" ? " (AN)" : ""}
            {b.type === "DN" ? " (DN)" : ""}
            {" · "}
            {b.passeurs?.length
              ? "Passes : " + b.passeurs.join(", ")
              : "Sans assistance"}
          </p>
        ))}

        {match.bagarre && (
          <p>
            🥊 Bagarre : {match.bagarre.joueur1} contre {match.bagarre.joueur2}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b1624",
      color: "white",
      padding: "15px",
      fontFamily: "Arial, sans-serif"
    }}>
      <header style={{ textAlign: "center" }}>
        <h1>🏒 NHL GENERAL MANAGER 27</h1>
        <p>Saison {saison}-{String(saison + 1).slice(-2)}</p>

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
          📂 Charger
        </button>
      </header>

      <nav style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        margin: "15px 0"
      }}>
        {[
          "Accueil",
          "Effectif",
          "Échanges",
          "Agents libres",
          "Saison",
          "Statistiques",
          "Finances"
        ].map((nom) => (
          <button
            key={nom}
            style={{
              ...styleBouton,
              background: onglet === nom ? "#2879c7" : "#26394e"
            }}
            onClick={() => {
              setOnglet(nom);
              setMessage("");
            }}
          >
            {nom}
          </button>
        ))}
      </nav>

      {chargement && <p>Chargement des joueurs NHL...</p>}

      {message && (
        <div style={{ ...styleCarte, background: "#173c31" }}>
          {message}
        </div>
      )}

      {onglet === "Accueil" && (
        <section>
          <h2>Bienvenue dans ta franchise !</h2>

          <div style={styleCarte}>
            <h2>{equipeSelectionnee.name}</h2>
            <p>Joueurs : {joueursEquipe.length}</p>
            <p>Masse salariale : {salaireTexte(masseSalariale)}</p>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={equipeSelectionnee.id}
              onChange={(e) => {
                const equipe = teams.find((t) => t.id === e.target.value);
                if (equipe) setEquipeSelectionnee(equipe);
              }}
            >
              {teams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        </section>
      )}

      {onglet === "Effectif" && (
        <section>
          <h2>Effectif — {equipeSelectionnee.name}</h2>

          <select
            style={styleSelect}
            value={equipeSelectionnee.id}
            onChange={(e) => {
              const equipe = teams.find((t) => t.id === e.target.value);
              if (equipe) setEquipeSelectionnee(equipe);
            }}
          >
            {teams.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          {afficherSection("ATTAQUANTS", attaquants, "🏒")}
          {afficherSection("DÉFENSEURS", defenseurs, "🛡️")}
          {afficherSection("GARDIENS", gardiens, "🥅")}
        </section>
      )}

      {onglet === "Échanges" && (
        <section>
          <h2>Échanges entre équipes</h2>

          <div style={styleCarte}>
            <h3>Première équipe</h3>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={equipeEchange1}
              onChange={(e) => {
                setEquipeEchange1(e.target.value);
                setJoueurEchange1("");
              }}
            >
              {teams.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={joueurEchange1}
              onChange={(e) => setJoueurEchange1(e.target.value)}
            >
              <option value="">Choisir un joueur</option>
              {joueursEchange1.map((j) => (
                <option key={effectif.indexOf(j)} value={effectif.indexOf(j)}>
                  {j.nom} — OVR {j.ovr}
                </option>
              ))}
            </select>
          </div>

          <div style={styleCarte}>
            <h3>Deuxième équipe</h3>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={equipeEchange2}
              onChange={(e) => {
                setEquipeEchange2(e.target.value);
                setJoueurEchange2("");
              }}
            >
              {teams.map((e) => (
                <option
                  key={e.id}
                  value={e.id}
                  disabled={e.id === equipeEchange1}
                >
                  {e.name}
                </option>
              ))}
            </select>

            <select
              style={{ ...styleSelect, width: "100%" }}
              value={joueurEchange2}
              onChange={(e) => setJoueurEchange2(e.target.value)}
            >
              <option value="">Choisir un joueur</option>
              {joueursEchange2.map((j) => (
                <option key={effectif.indexOf(j)} value={effectif.indexOf(j)}>
                  {j.nom} — OVR {j.ovr}
                </option>
              ))}
            </select>
          </div>

          <button
            style={{ ...styleBouton, background: "#18834a" }}
            onClick={effectuerEchange}
          >
            Confirmer l'échange
          </button>

          <h3>Historique des échanges</h3>

          {historiqueEchanges.map((e) => (
            <div key={e.id} style={styleCarte}>
              <p>{e.equipe1} reçoit {e.joueur2}</p>
              <p>{e.equipe2} reçoit {e.joueur1}</p>
              <small>Saison {e.saison}</small>
            </div>
          ))}
        </section>
      )}

      {onglet === "Agents libres" && (
        <section>
          <h2>Agents libres</h2>

          <select
            style={{ ...styleSelect, width: "100%" }}
            value={equipeSelectionnee.id}
            onChange={(e) => {
              const equipe = teams.find((t) => t.id === e.target.value);
              if (equipe) setEquipeSelectionnee(equipe);
            }}
          >
            {teams.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          <p>Agents disponibles : {agentsLibres.length}</p>

          {agentsLibres.map((agent) => (
            <div key={agent.id} style={styleCarte}>
              <h3>{agent.nom}</h3>
              <p>{agent.position} · {agent.age} ans</p>
              <p>Ancienne équipe : {agent.ancienneEquipe}</p>
              <p>OVR : {agent.ovr} · Potentiel : {agent.potentiel}</p>

              <label>Offre salariale (millions USD)</label>

              <input
                type="number"
                min="0.1"
                step="0.1"
                value={offres[agent.id] ?? ""}
                onChange={(e) =>
                  setOffres((anciens) => ({
                    ...anciens,
                    [agent.id]: e.target.value
                  }))
                }
                style={{
                  ...styleSelect,
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />

              <p>Offre : {salaireTexte(offres[agent.id])}</p>

              <button
                style={{ ...styleBouton, background: "#18834a" }}
                onClick={() => signerAgent(agent)}
              >
                Signer
              </button>
            </div>
          ))}
        </section>
      )}

      {onglet === "Saison" && (
        <section>
          <h2>Saison {saison}-{String(saison + 1).slice(-2)}</h2>

          <div style={styleCarte}>
            <p>Victoires : {victoires}</p>
            <p>Défaites : {defaites}</p>
            <p>Défaites en prolongation : {defaitesProlongation}</p>
            <p>Points : {victoires * 2 + defaitesProlongation}</p>

            <button style={styleBouton} onClick={simulerMatch}>
              🏒 Simuler un match
            </button>
          </div>

          <button
            style={{ ...styleBouton, background: "#18834a" }}
            onClick={prochaineSaison}
          >
            Terminer la saison et avancer
          </button>

          <h3>Historique des matchs</h3>

          {historiqueMatchs
            .filter((m) => m.saison === saison)
            .map(afficherMatch)}
        </section>
      )}

      {onglet === "Statistiques" && afficherStatistiquesToutesEquipes()}

      {onglet === "Finances" && (
        <section>
          <h2>Finances — {equipeSelectionnee.name}</h2>

          <div style={styleCarte}>
            <p>Joueurs : {joueursEquipe.length}</p>
            <h2>{salaireTexte(masseSalariale)}</h2>
            <p>Masse salariale totale des joueurs de l'effectif.</p>
            <p>Montants en dollars américains (USD).</p>
          </div>
        </section>
      )}

      <footer style={{
        textAlign: "center",
        padding: "25px 5px",
        color: "#7892aa",
        fontSize: "12px"
      }}>
        NHL General Manager 27 · Jeu gratuit
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
