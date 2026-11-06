
const BASE =
  "https://proxy.cors.dev/https://github.com/ehlersio/nhl-contracts/releases/download/contracts";

const SAISON = "2026-27";

function normaliser(nom) {
  return String(nom || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

async function chargerJSON(fichier) {
  const reponse = await fetch(`${BASE}/${fichier}`);

  if (!reponse.ok) {
    throw new Error(
      `Erreur lors du chargement de ${fichier}: ${reponse.status}`
    );
  }

  return reponse.json();
}

function extraireListe(donnees) {
  if (Array.isArray(donnees)) return donnees;

  if (Array.isArray(donnees?.data)) {
    return donnees.data;
  }

  return [];
}

function estContratActif(contrat) {
  const debut = contrat.start_season;
  const fin = contrat.end_season;

  if (debut && SAISON < debut) return false;
  if (fin && SAISON > fin) return false;

  return true;
}

function valeurPositive(...valeurs) {
  for (const valeur of valeurs) {
    const nombre = Number(valeur);

    if (
      valeur !== null &&
      valeur !== undefined &&
      Number.isFinite(nombre) &&
      nombre > 0
    ) {
      return nombre;
    }
  }

  return null;
}

function rangSource(tier) {
  const rangs = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1
  };

  return rangs[String(tier || "").toUpperCase()] || 0;
}

function trouverContrats(joueur, contrats) {
  const idJoueur = Number(joueur.idNhl);

  // Priorité absolue à l'identifiant NHL.
  if (Number.isFinite(idJoueur) && idJoueur > 0) {
    const parId = contrats.filter(
      (contrat) =>
        contrat.player_id &&
        Number(contrat.player_id) === idJoueur
    );

    if (parId.length > 0) {
      return parId;
    }
  }

  // Si aucun identifiant ne correspond, recherche exacte du nom.
  const nomJoueur = normaliser(joueur.nom);

  if (!nomJoueur) return [];

  return contrats.filter(
    (contrat) =>
      normaliser(contrat.player_name) === nomJoueur
  );
}

function trouverSaison(contrat, saisons) {
  return saisons
    .filter(
      (saison) =>
        saison.contract_key === contrat.contract_key &&
        saison.season === SAISON
    )
    .sort(
      (a, b) =>
        rangSource(b.best_tier) - rangSource(a.best_tier)
    )[0] || null;
}

function choisirMeilleurContrat(joueur, contrats, saisons) {
  const candidats = trouverContrats(joueur, contrats)
    .filter(estContratActif)
    .map((contrat) => {
      const saison = trouverSaison(contrat, saisons);

      const capHit = valeurPositive(
        saison?.cap_hit_usd,
        saison?.aav_usd,
        contrat.cap_hit_usd,
        contrat.aav_usd
      );

      return {
        contrat,
        saison,
        capHit
      };
    });

  candidats.sort((a, b) => {
    // Un montant confirmé pour la saison est prioritaire.
    if (Boolean(a.capHit) !== Boolean(b.capHit)) {
      return a.capHit ? -1 : 1;
    }

    // Ensuite, la meilleure source.
    const rangA = rangSource(
      a.saison?.best_tier || a.contrat.best_tier
    );

    const rangB = rangSource(
      b.saison?.best_tier || b.contrat.best_tier
    );

    if (rangA !== rangB) return rangB - rangA;

    // Enfin, le nombre de sources.
    return (
      Number(b.contrat.n_sources || 0) -
      Number(a.contrat.n_sources || 0)
    );
  });

  return candidats[0] || null;
}

export async function chargerContrats(joueurs) {
  try {
    console.log("Chargement des contrats NHL 2026-2027...");

    const [contratsBruts, saisonsBrutes] = await Promise.all([
      chargerJSON("contracts.json"),
      chargerJSON("contract_seasons.json")
    ]);

    const contrats = extraireListe(contratsBruts);
    const saisons = extraireListe(saisonsBrutes);

    if (contrats.length === 0) {
      throw new Error("Aucun contrat trouvé dans contracts.json");
    }

    console.log("Contrats chargés :", contrats.length);
    console.log("Données saisonnières :", saisons.length);

    let joueursAvecSalaire = 0;
    let joueursSansSalaire = 0;

    const resultat = joueurs.map((joueur) => {
      const meilleur = choisirMeilleurContrat(
        joueur,
        contrats,
        saisons
      );

      if (!meilleur) {
        joueursSansSalaire++;

        return {
          ...joueur,
          salaire: 0,
          capHitUsd: null,
          contratDisponible: false,
          salaireDisponible: false,
          niveauSource: null,
          saisonContrat: SAISON
        };
      }

      const { contrat, saison, capHit } = meilleur;

      if (capHit) {
        joueursAvecSalaire++;
      } else {
        joueursSansSalaire++;
      }

      return {
        ...joueur,

        // Le salaire est conservé en millions pour main.jsx.
        salaire: capHit ? capHit / 1000000 : 0,

        // Montant original en dollars américains.
        capHitUsd: capHit,

        contratDuree: contrat.term_years ?? null,
        contratDebut: contrat.start_season ?? null,
        contratFin: contrat.end_season ?? null,

        statutFinContrat: contrat.expiry_status ?? null,
        typeContrat: contrat.contract_type ?? null,

        contratDisponible: true,
        salaireDisponible: Boolean(capHit),

        niveauSource:
          saison?.best_tier ||
          contrat.best_tier ||
          null,

        nombreSources: contrat.n_sources ?? null,
        saisonContrat: SAISON,
        contractKey: contrat.contract_key ?? null
      };
    });

    console.log("Joueurs avec salaire :", joueursAvecSalaire);
    console.log("Joueurs sans salaire confirmé :", joueursSansSalaire);

    return resultat;
  } catch (erreur) {
    console.error(
      "Erreur de chargement des contrats NHL :",
      erreur
    );

    return joueurs.map((joueur) => ({
      ...joueur,
      salaire: 0,
      capHitUsd: null,
      contratDisponible: false,
      salaireDisponible: false,
      niveauSource: null,
      saisonContrat: SAISON
    }));
  }
}
