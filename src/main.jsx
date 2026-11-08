
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

function melanger(liste) {
  const copie = [...liste];

  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }

  return copie;
}

// Calendrier de 84 journées : 16 matchs par journée.
function creerCalendrier(equipes) {
  if (equipes.length !== 32) {
    throw new Error("Le calendrier nécessite 32 équipes.");
  }

  const rotation = equipes.map((e) => e.id);
  const rondes = [];

  for (let jour = 0; jour < 31; jour++) {
    const matchs = [];

    for (let i = 0; i < 16; i++) {
      matchs.push([
        rotation[i],
        rotation[31 - i]
      ]);
    }

    rondes.push(matchs);

    const dernier = rotation.pop();
    rotation.splice(1, 0, dernier);
  }

  return [
    ...rondes,
    ...rondes,
    ...rondes.slice(0, 22)
  ];
}

function creerClassement() {
  return teams.map((e) => ({
    id: e.id,
    equipe: e.name,
    MJ: 0,
    V: 0,
    D: 0,
    DP: 0,
    PTS: 0,
    BP: 0,
    BC: 0
  }));
}

function trierClassement(classement) {
  return [...classement].sort(
    (a, b) =>
      b.PTS - a.PTS ||
      b.V - a.V ||
      (b.BP - b.BC) - (a.BP - a.BC) ||
      b.BP - a.BP
  );
}

function creerSerie(equipe1, equipe2, numero) {
  return {
    id: `serie-${numero}-${equipe1.id}-${equipe2.id}`,
    equipe1: equipe1.id,
    equipe2: equipe2.id,
    nom1: equipe1.equipe,
    nom2: equipe2.equipe,
    victoires1: 0,
    victoires2: 0,
    terminee: false,
    gagnant: null
  };
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
        AGENTS_LIBRES_DEPART.map((a) => [a.id, String(a.offre || 0.8)])
      )
  );

  const [saison, setSaison] = useState(
    () => sauvegardeInitiale?.saison ?? 2026
  );

  const [phase, setPhase] = useState(
    () => sauvegardeInitiale?.phase || "REGULIERE"
  );

  const [journee, setJournee] = useState(
    () => sauvegardeInitiale?.journee || 0
  );

  const [classement, setClassement] = useState(
    () => sauvegardeInitiale?.classement || creerClassement()
  );

  const [series, setSeries] = useState(
    () => sauvegardeInitiale?.series || []
  );

  const [rondeSeries, setRondeSeries] = useState(
    () => sauvegardeInitiale?.rondeSeries || 1
  );

  const [champion, setChampion] = useState(
    () => sauvegardeInitiale?.champion || null
  );

  const [historiqueMatchs, setHistoriqueMatchs] = useState(
    () => sauvegardeInitiale?.historiqueMatchs || []
  );

  const [historiqueEchanges, setHistoriqueEchanges] = useState(
    () => sauvegardeInitiale?.historiqueEchanges || []
  );

  const [statistiques, setStatistiques] = useState(
    () => sauvegardeInitiale?.statistiques || {}
  );

  const [fatigueGardiens, setFatigueGardiens] = useState(
    () => sauvegardeInitiale?.fatigueGardiens || {}
  );

  const [dernierGardienDepart, setDernierGardienDepart] = useState(
    () => sauvegardeInitiale?.dernierGardienDepart || {}
  );

  const [choixRepêchage, setChoixRepêchage] = useState(
    () => sauvegardeInitiale?.choixRepêchage || []
  );

  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState("");

  const [equipeEchange1, setEquipeEchange1] = useState("MTL");
  const [equipeEchange2, setEquipeEchange2] = useState("TOR");
  const [joueurEchange1, setJoueurEchange1] = useState("");
  const [joueurEchange2, setJoueurEchange2] = useState("");
  const [filtreStats, setFiltreStats] = useState("TOUS");

  const calendrier = React.useMemo(
    () => creerCalendrier(teams),
    []
  );

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
      phase,
      journee,
      classement,
      series,
      rondeSeries,
      champion,
      historiqueMatchs,
      historiqueEchanges,
      statistiques,
      fatigueGardiens,
      dernierGardienDepart,
      choixRepêchage
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
    phase,
    journee,
    classement,
    series,
    rondeSeries,
    champion,
    historiqueMatchs,
    historiqueEchanges,
    statistiques,
    fatigueGardiens,
    dernierGardienDepart,
    choixRepêchage
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

    try {
      const partie = {
        effectif,
        equipeSelectionnee: equipeSelectionnee.id,
        agentsLibres,
        offres,
        saison,
        phase,
        journee,
        classement,
        series,
        rondeSeries,
        champion,
        historiqueMatchs,
        historiqueEchanges,
        statistiques,
        fatigueGardiens,
        dernierGardienDepart,
        choixRepêchage
      };

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
    setPhase(partie.phase || "REGULIERE");
    setJournee(partie.journee || 0);
    setClassement(partie.classement || creerClassement());
    setSeries(partie.series || []);
    setRondeSeries(partie.rondeSeries || 1);
    setChampion(partie.champion || null);
    setHistoriqueMatchs(partie.historiqueMatchs || []);
    setHistoriqueEchanges(partie.historiqueEchanges || []);
    setStatistiques(partie.statistiques || {});
    setFatigueGardiens(partie.fatigueGardiens || {});
    setDernierGardienDepart(partie.dernierGardienDepart || {});
    setChoixRepêchage(partie.choixRepêchage || []);

    setOnglet("Accueil");
    setMessage("📂 Partie chargée !");
  }

  // Suppression complète de la sauvegarde.
  function recommencerPartie() {
    const confirmer = window.confirm(
      "ATTENTION ! Supprimer définitivement cette partie et recommencer à zéro ? " +
      "Les joueurs signés, les échanges, les statistiques et les résultats seront effacés."
    );

    if (!confirmer) return;

    localStorage.removeItem(CLE_SAUVEGARDE);
    window.location.reload();
  }

  function choisirAleatoirement(liste, nombre) {
    const melange = melanger(liste);
    return melange.slice(0, Math.min(nombre, melange.length));
  }

  // Contexte partagé : évite d'écraser les statistiques entre plusieurs matchs.
  function creerContexteSimulation() {
    return {
      statistiques: { ...statistiques },
      fatigue: { ...fatigueGardiens },
      derniers: { ...dernierGardienDepart },
      matchs: []
    };
  }

  function choisirGardienPartant(nomEquipe, listeGardiens, contexte) {
    if (!listeGardiens.length) return null;

    const tries = [...listeGardiens].sort((a, b) => {
      const cleA = cleJoueur(a);
      const cleB = cleJoueur(b);

      const fatigueA = Number(contexte.fatigue[cleA]) || 0;
      const fatigueB = Number(contexte.fatigue[cleB]) || 0;
      const dernier = contexte.derniers[nomEquipe];

      const scoreA =
        (Number(a.ovr) || 65) -
        fatigueA * 0.65 -
        (cleA === dernier ? 18 : 0);

      const scoreB =
        (Number(b.ovr) || 65) -
        fatigueB * 0.65 -
        (cleB === dernier ? 18 : 0);

      return scoreB - scoreA;
    });

    return tries[0];
  }

  function ajouterStatistique(contexte, joueur, changements) {
    const cle = cleJoueur(joueur);
    const ancienne = contexte.statistiques[cle] || {};

    const stats = {
      ...STATS_VIDES,
      ...ancienne
    };

    Object.entries(changements).forEach(([nom, valeur]) => {
      stats[nom] = (Number(stats[nom]) || 0) + valeur;
    });

    stats.PTS = stats.B + stats.A;

    contexte.statistiques[cle] = {
      ...ancienne,
      ...stats
    };
  }

  function simulerMatchEquipes(idLocal, idVisiteur, contexte) {
    const equipeLocale = teams.find((e) => e.id === idLocal);
    const equipeVisiteuse = teams.find((e) => e.id === idVisiteur);

    if (!equipeLocale || !equipeVisiteuse) return null;

    const locaux = effectif.filter(
      (j) => j.equipe === equipeLocale.name
    );

    const visiteurs = effectif.filter(
      (j) => j.equipe === equipeVisiteuse.name
    );

    const gardiensLocaux = locaux.filter(
      (j) => positionType(j.pos) === "G"
    );

    const gardiensVisiteurs = visiteurs.filter(
      (j) => positionType(j.pos) === "G"
    );

    const gardienLocal = choisirGardienPartant(
      equipeLocale.name,
      gardiensLocaux,
      contexte
    );

    const gardienVisiteur = choisirGardienPartant(
      equipeVisiteuse.name,
      gardiensVisiteurs,
      contexte
    );

    let butsLocaux = Math.floor(Math.random() * 5);
    let butsVisiteurs = Math.floor(Math.random() * 5);

    const egalite = butsLocaux === butsVisiteurs;
    const prolongation = egalite;

    if (egalite) {
      if (Math.random() < 0.5) butsLocaux++;
      else butsVisiteurs++;
    }

    const victoireLocale = butsLocaux > butsVisiteurs;

    const skatersLocaux = locaux.filter(
      (j) => positionType(j.pos) !== "G"
    );

    const skatersVisiteurs = visiteurs.filter(
      (j) => positionType(j.pos) !== "G"
    );

    [...skatersLocaux, ...skatersVisiteurs].forEach((j) => {
      ajouterStatistique(contexte, j, { MJ: 1 });
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

        ajouterStatistique(contexte, buteur, {
          B: 1,
          ...(type === "AN" ? { AN: 1 } : {}),
          ...(type === "DN" ? { DN: 1 } : {})
        });

        passeurs.forEach((p) => {
          ajouterStatistique(contexte, p, { A: 1 });
        });

        if (type !== "AN") {
          attaque.forEach((j) => {
            if (j !== buteur) {
              ajouterStatistique(contexte, j, { plusMoins: 1 });
            }
          });

          defense.forEach((j) => {
            ajouterStatistique(contexte, j, { plusMoins: -1 });
          });

          ajouterStatistique(contexte, buteur, { plusMoins: 1 });
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
      equipeLocale.name
    );

    ajouterButs(
      skatersVisiteurs,
      skatersLocaux,
      butsVisiteurs,
      equipeVisiteuse.name
    );

    // Pénalités et bagarres.
    for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
      const attaque =
        Math.random() < 0.5 ? skatersLocaux : skatersVisiteurs;

      if (!attaque.length) continue;

      const joueur =
        attaque[Math.floor(Math.random() * attaque.length)];

      ajouterStatistique(contexte, joueur, {
        PUN: Math.random() < 0.8 ? 2 : 4
      });
    }

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

      ajouterStatistique(contexte, j1, { BAG: 1, PUN: 5 });
      ajouterStatistique(contexte, j2, { BAG: 1, PUN: 5 });

      bagarre = {
        joueur1: j1.nom,
        joueur2: j2.nom
      };
    }

    function enregistrerGardien(gardien, butsContre, resultat) {
      if (!gardien) return;

      const cle = cleJoueur(gardien);
      const ancienne = contexte.statistiques[cle] || {};

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

      contexte.statistiques[cle] = {
        ...ancienne,
        gardien: stats
      };
    }

    enregistrerGardien(
      gardienLocal,
      butsVisiteurs,
      victoireLocale ? "V" : prolongation ? "DP" : "D"
    );

    enregistrerGardien(
      gardienVisiteur,
      butsLocaux,
      !victoireLocale ? "V" : prolongation ? "DP" : "D"
    );

    // Récupération et fatigue des gardiens.
    [...gardiensLocaux, ...gardiensVisiteurs].forEach((g) => {
      const cle = cleJoueur(g);
      contexte.fatigue[cle] = Math.max(
        0,
        (Number(contexte.fatigue[cle]) || 0) - 12
      );
    });

    if (gardienLocal) {
      const cle = cleJoueur(gardienLocal);
      contexte.fatigue[cle] = Math.min(
        100,
        (Number(contexte.fatigue[cle]) || 0) + 25
      );
      contexte.derniers[equipeLocale.name] = cle;
    }

    if (gardienVisiteur) {
      const cle = cleJoueur(gardienVisiteur);
      contexte.fatigue[cle] = Math.min(
        100,
        (Number(contexte.fatigue[cle]) || 0) + 25
      );
      contexte.derniers[equipeVisiteuse.name] = cle;
    }

    return {
      id: Date.now() + Math.random(),
      saison,
      equipe: equipeLocale.name,
      adversaire: equipeVisiteuse.name,
      idEquipe: idLocal,
      idAdversaire: idVisiteur,
      butsEquipe: butsLocaux,
      butsAdversaire: butsVisiteurs,
      victoire: victoireLocale,
      prolongation,
      gardienLocal: gardienLocal?.nom || "Aucun gardien",
      gardienAdverse: gardienVisiteur?.nom || "Aucun gardien",
      buteurs,
      bagarre
    };
  }

  function enregistrerResultatClassement(ancienClassement, match) {
    const copie = ancienClassement.map((e) => ({ ...e }));

    const local = copie.find((e) => e.id === match.idEquipe);
    const visiteur = copie.find((e) => e.id === match.idAdversaire);

    if (!local || !visiteur) return copie;

    local.MJ++;
    visiteur.MJ++;

    local.BP += match.butsEquipe;
    local.BC += match.butsAdversaire;
    visiteur.BP += match.butsAdversaire;
    visiteur.BC += match.butsEquipe;

    if (match.victoire) {
      local.V++;
      local.PTS += 2;

      if (match.prolongation) {
        visiteur.DP++;
        visiteur.PTS++;
      } else {
        visiteur.D++;
      }
    } else {
      visiteur.V++;
      visiteur.PTS += 2;

      if (match.prolongation) {
        local.DP++;
        local.PTS++;
      } else {
        local.D++;
      }
    }

    return copie;
  }

  function simulerJournee() {
    if (phase !== "REGULIERE") return;

    if (journee >= 84) {
      setMessage("La saison régulière est terminée.");
      return;
    }

    const contexte = creerContexteSimulation();
    let nouveauClassement = classement;

    const matchsDuJour = calendrier[journee];

    matchsDuJour.forEach(([id1, id2]) => {
      const match = simulerMatchEquipes(id1, id2, contexte);

      if (!match) return;

      contexte.matchs.push(match);
      nouveauClassement = enregistrerResultatClassement(
        nouveauClassement,
        match
      );
    });

    setStatistiques(contexte.statistiques);
    setFatigueGardiens(contexte.fatigue);
    setDernierGardienDepart(contexte.derniers);
    setHistoriqueMatchs((anciens) => [
      ...contexte.matchs.reverse(),
      ...anciens
    ]);

    setClassement(nouveauClassement);
    setJournee((j) => j + 1);

    if (journee + 1 >= 84) {
      const classementFinal = trierClassement(nouveauClassement);
      const qualifies = classementFinal.slice(0, 16);

      const nouvellesSeries = [];

      for (let i = 0; i < 8; i++) {
        nouvellesSeries.push(
          creerSerie(
            qualifies[i],
            qualifies[15 - i],
            i + 1
          )
        );
      }

      setClassement(classementFinal);
      setSeries(nouvellesSeries);
      setRondeSeries(1);
      setPhase("SERIES");

      setMessage(
        "🏆 Les 84 matchs sont terminés ! Les 16 meilleures équipes accèdent aux séries."
      );
    } else {
      setMessage(
        `Journée ${journee + 1}/84 terminée : 16 matchs simulés.`
      );
    }
  }

  // Une simulation fait jouer un match dans chaque série encore active.
  function simulerJourneeSeries() {
    if (phase !== "SERIES") return;

    const contexte = creerContexteSimulation();
    const nouvellesSeries = series.map((s) => ({ ...s }));

    nouvellesSeries.forEach((serie) => {
      if (serie.terminee) return;

      const equipe1 = teams.find((e) => e.id === serie.equipe1);
      const equipe2 = teams.find((e) => e.id === serie.equipe2);

      if (!equipe1 || !equipe2) return;

      const match = simulerMatchEquipes(
        equipe1.id,
        equipe2.id,
        contexte
      );

      if (!match) return;

      // En séries, chaque match doit avoir un gagnant.
      if (match.victoire) {
        serie.victoires1++;
      } else {
        serie.victoires2++;
      }

      contexte.matchs.push({
        ...match,
        type: "SERIES",
        ronde: rondeSeries
      });

      if (serie.victoires1 >= 4) {
        serie.terminee = true;
        serie.gagnant = serie.equipe1;
      }

      if (serie.victoires2 >= 4) {
        serie.terminee = true;
        serie.gagnant = serie.equipe2;
      }
    });

    setStatistiques(contexte.statistiques);
    setFatigueGardiens(contexte.fatigue);
    setDernierGardienDepart(contexte.derniers);
    setHistoriqueMatchs((anciens) => [
      ...contexte.matchs.reverse(),
      ...anciens
    ]);

    if (nouvellesSeries.every((s) => s.terminee)) {
      if (rondeSeries === 4) {
        const gagnant = nouvellesSeries[0]?.gagnant;
        const equipeChampionne = teams.find((e) => e.id === gagnant);

        setChampion(equipeChampionne?.name || "Équipe inconnue");
        setPhase("REPECHAGE");

        setMessage(
          `🏆 ${equipeChampionne?.name || "Une équipe"} remporte la Coupe Stanley ! Le repêchage est maintenant disponible.`
        );
      } else {
        const gagnants = nouvellesSeries.map((s) =>
          teams.find((e) => e.id === s.gagnant)
        ).filter(Boolean);

        const prochaineRonde = [];

        for (let i = 0; i < gagnants.length; i += 2) {
          if (gagnants[i] && gagnants[i + 1]) {
            prochaineRonde.push(
              creerSerie(
                {
                  id: gagnants[i].id,
                  equipe: gagnants[i].name
                },
                {
                  id: gagnants[i + 1].id,
                  equipe: gagnants[i + 1].name
                },
                i + 1
              )
            );
          }
        }

        setSeries(prochaineRonde);
        setRondeSeries((r) => r + 1);
        setMessage(
          `La ronde ${rondeSeries} est terminée. Place à la ronde ${rondeSeries + 1} !`
        );
      }
    } else {
      setSeries(nouvellesSeries);
      setMessage("Journée de séries simulée !");
    }
  }

  // Repêchage de 7 rondes, 32 équipes, 224 choix.
  function effectuerRepechage() {
    if (phase !== "REPECHAGE") return;

    if (!window.confirm("Effectuer le repêchage complet de 7 rondes ?")) {
      return;
    }

    const classementInverse = trierClassement(classement).reverse();
    const ordre = classementInverse.map((e) => e.id);

    const prospects = [];
    const nouveauxChoix = [];
    const positions = ["C", "AG", "AD", "D", "G"];

    for (let i = 1; i <= 224; i++) {
      const ronde = Math.ceil(i / 32);

      prospects.push({
        id: `prospect-${saison}-${i}`,
        nom: `Espoir ${saison}-${i}`,
        equipe: "Repêchage",
        pos: positions[Math.floor(Math.random() * positions.length)],
        age: 18,
        ovr: 58 + Math.floor(Math.random() * 13),
        potentiel: 75 + Math.floor(Math.random() * 21),
        salaire: 0.85,
        photo: "",
        numero: "",
        contratDisponible: false,
        finContrat: "Contrat recrue"
      });

      const equipeId = ordre[(i - 1) % 32];
      const equipe = teams.find((e) => e.id === equipeId);

      nouveauxChoix.push({
        ronde,
        choix: i,
        equipe: equipe?.name || "Équipe inconnue",
        prospect: prospects[i - 1].nom,
        position: prospects[i - 1].pos
      });

      // Ajoute immédiatement le prospect à l'équipe qui le sélectionne.
      prospects[i - 1].equipe = equipe?.name || "Équipe inconnue";
    }

    setEffectif((anciens) => [...anciens, ...prospects]);
    setChoixRepêchage(nouveauxChoix);
    setPhase("AGENTS_LIBRES");

    setMessage(
      "Le repêchage est terminé : 224 joueurs ont été sélectionnés. La période des agents libres commence."
    );
  }

  function commencerNouvelleSaison() {
    if (phase !== "AGENTS_LIBRES") return;

    if (!window.confirm("Commencer la nouvelle saison ?")) return;

    setEffectif((anciens) => developperJoueurs(anciens));

    setSaison((s) => s + 1);
    setPhase("REGULIERE");
    setJournee(0);
    setClassement(creerClassement());
    setSeries([]);
    setRondeSeries(1);
    setChampion(null);

    // Remise à zéro des statistiques de tous les joueurs et gardiens.
    setStatistiques({});
    setFatigueGardiens({});
    setDernierGardienDepart({});

    setVictoiresAnciennes();
  }

  // Échanges entre équipes.
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
    const gardiens = liste.filter(
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
            {gardiens.map((gardien) => {
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

        <p>🥅 Gardien partant : {match.gardienLocal}</p>
        <p>🥅 Gardien adverse : {match.gardienAdverse}</p>

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

  const classementTrie = trierClassement(classement);

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
        <p>
          {phase === "REGULIERE" && "Saison régulière"}
          {phase === "SERIES" && `Séries éliminatoires — Ronde ${rondeSeries}/4`}
          {phase === "REPECHAGE" && "Repêchage"}
          {phase === "AGENTS_LIBRES" && "Période des agents libres"}
        </p>

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

        <button
          style={{ ...styleBouton, background: "#b83232" }}
          onClick={recommencerPartie}
        >
          🗑️ Supprimer la partie
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

          <div style={styleCarte}>
            <h3>Progression de la saison</h3>
            <p>Journée : {journee}/84</p>
            <p>Phase : {phase}</p>
            <p>Équipes : {teams.length}</p>
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

          {(() => {
            const ordre = { C: 1, AG: 2, AD: 3, LW: 2, RW: 3 };
            const attaquants = joueursEquipe
              .filter((j) => positionType(j.pos) === "A")
              .sort((a, b) =>
                (ordre[String(a.pos).toUpperCase()] || 4) -
                (ordre[String(b.pos).toUpperCase()] || 4)
              );

            const defenseurs = joueursEquipe.filter(
              (j) => positionType(j.pos) === "D"
            );

            const gardiens = joueursEquipe.filter(
              (j) => positionType(j.pos) === "G"
            );

            return (
              <>
                {afficherSection("ATTAQUANTS", attaquants, "🏒")}
                {afficherSection("DÉFENSEURS", defenseurs, "🛡️")}
                {afficherSection("GARDIENS", gardiens, "🥅")}
              </>
            );
          })()}
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
              <p>{agent.position || agent.pos} · {agent.age} ans</p>
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

          {phase === "REGULIERE" && (
            <div style={styleCarte}>
              <h3>🏒 Saison régulière</h3>
              <p>Journée : {journee}/84</p>
              <p>Matchs simulés : {journee * 16}/1344</p>

              <button
                style={{ ...styleBouton, background: "#18834a" }}
                onClick={simulerJournee}
                disabled={chargement || journee >= 84}
              >
                🏒 Simuler la journée (16 matchs)
              </button>
            </div>
          )}

          {phase === "SERIES" && (
            <div style={styleCarte}>
              <h3>🏆 Séries éliminatoires</h3>
              <p>Ronde {rondeSeries}/4</p>
              <p>Chaque série se joue au meilleur de 7 matchs.</p>

              {series.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #34465c"
                  }}
                >
                  <strong>{s.nom1}</strong> {s.victoires1} - {s.victoires2}{" "}
                  <strong>{s.nom2}</strong>
                  {s.terminee && <p>Gagnant : {s.gagnant}</p>}
                </div>
              ))}

              <button
                style={{ ...styleBouton, background: "#18834a" }}
                onClick={simulerJourneeSeries}
              >
                🏒 Simuler les matchs des séries
              </button>
            </div>
          )}

          {phase === "REPECHAGE" && (
            <div style={styleCarte}>
              <h3>🏆 Champion : {champion}</h3>
              <h3>Repêchage NHL</h3>
              <p>7 rondes · 32 équipes · 224 choix.</p>

              <button
                style={{ ...styleBouton, background: "#18834a" }}
                onClick={effectuerRepechage}
              >
                Effectuer le repêchage complet
              </button>
            </div>
          )}

          {phase === "AGENTS_LIBRES" && (
            <div style={styleCarte}>
              <h3>📋 Période des agents libres</h3>
              <p>
                Tu peux signer des joueurs dans l'onglet Agents libres.
              </p>

              <button
                style={{ ...styleBouton, background: "#18834a" }}
                onClick={commencerNouvelleSaison}
              >
                Commencer la nouvelle saison
              </button>
            </div>
          )}

          <h3>📊 Classement général</h3>

          <div style={{ overflowX: "auto", ...styleCarte }}>
            <table style={{
              width: "100%",
              minWidth: "650px",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr>
                  {["#", "Équipe", "MJ", "V", "D", "DP", "PTS", "BP", "BC"].map((t) => (
                    <th key={t} style={{ padding: "8px", background: "#26394e" }}>
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {classementTrie.map((e, i) => (
                  <tr
                    key={e.id}
                    style={{
                      borderBottom: "1px solid #34465c",
                      background: i < 16 ? "#173c31" : "transparent"
                    }}
                  >
                    <td align="center">{i + 1}</td>
                    <td style={{ padding: "8px" }}>{e.equipe}</td>
                    <td align="center">{e.MJ}</td>
                    <td align="center">{e.V}</td>
                    <td align="center">{e.D}</td>
                    <td align="center">{e.DP}</td>
                    <td align="center"><strong>{e.PTS}</strong></td>
                    <td align="center">{e.BP}</td>
                    <td align="center">{e.BC}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {choixRepêchage.length > 0 && (
            <>
              <h3>📋 Résultats du repêchage</h3>
              <div style={{ overflowX: "auto", ...styleCarte }}>
                <table style={{ width: "100%", minWidth: "500px" }}>
                  <thead>
                    <tr>
                      <th>Choix</th>
                      <th>Ronde</th>
                      <th>Équipe</th>
                      <th>Prospect</th>
                      <th>Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {choixRepêchage.map((c) => (
                      <tr key={c.choix}>
                        <td>{c.choix}</td>
                        <td>{c.ronde}</td>
                        <td>{c.equipe}</td>
                        <td>{c.prospect}</td>
                        <td>{c.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

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
