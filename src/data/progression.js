
function limiter(valeur, minimum = 50, maximum = 99) {
  return Math.max(minimum, Math.min(maximum, Math.round(valeur)));
}

// Génère une valeur stable à partir du nom du joueur.
function nombreStable(nom) {
  let resultat = 0;

  for (let i = 0; i < nom.length; i++) {
    resultat = (resultat * 31 + nom.charCodeAt(i)) >>> 0;
  }

  return resultat;
}

function calculerOVR(joueur) {
  const age = Number(joueur.age) || 24;
  const hasard = nombreStable(joueur.nom || "Joueur") % 9;

  let cote;

  if (age <= 20) cote = 68 + hasard;
  else if (age <= 23) cote = 72 + hasard;
  else if (age <= 26) cote = 76 + hasard;
  else if (age <= 29) cote = 78 + hasard;
  else if (age <= 32) cote = 76 + hasard;
  else if (age <= 35) cote = 73 + hasard;
  else cote = 68 + hasard;

  return limiter(cote);
}

function calculerPotentiel(joueur, ovr) {
  const age = Number(joueur.age) || 24;
  const hasard = nombreStable(joueur.nom || "Joueur") % 10;

  let potentiel;

  if (age <= 20) potentiel = ovr + 12 + hasard;
  else if (age <= 23) potentiel = ovr + 8 + hasard;
  else if (age <= 26) potentiel = ovr + 4 + hasard;
  else if (age <= 29) potentiel = ovr + hasard;
  else potentiel = ovr;

  return limiter(Math.max(ovr, potentiel));
}

// Initialise les cotes sans remplacer les notes personnalisées.
export function preparerJoueurs(joueurs) {
  return joueurs.map((joueur) => {
    const age = Number(joueur.age) || 24;

    const ovrExistant = Number(joueur.ovr);
    const ovr =
      Number.isFinite(ovrExistant) &&
      ovrExistant >= 50 &&
      ovrExistant <= 99 &&
      ovrExistant !== 75
        ? ovrExistant
        : calculerOVR(joueur);

    const potentielExistant = Number(joueur.potentiel);

    const potentiel =
      Number.isFinite(potentielExistant) &&
      potentielExistant >= ovr &&
      potentielExistant <= 99
        ? potentielExistant
        : calculerPotentiel(joueur, ovr);

    return {
      ...joueur,
      age,
      ovr,
      potentiel,
      progressionAnnuelle: joueur.progressionAnnuelle || 0
    };
  });
}

// Fait avancer les joueurs d'une saison.
export function developperJoueurs(joueurs) {
  return joueurs.map((joueur) => {
    const age = (Number(joueur.age) || 24) + 1;
    const ovr = Number(joueur.ovr) || 75;
    const potentiel = Number(joueur.potentiel) || ovr;

    let evolution = 0;

    // Développement des jeunes.
    if (age <= 21 && ovr < potentiel) {
      evolution = 1 + Math.floor(Math.random() * 3);
    } else if (age <= 24 && ovr < potentiel) {
      evolution = Math.floor(Math.random() * 3);
    } else if (age <= 27 && ovr < potentiel) {
      evolution = Math.floor(Math.random() * 2);
    }

    // Régression graduelle avec l'âge.
    if (age >= 31) {
      evolution = -Math.floor(Math.random() * 2);
    }

    if (age >= 35) {
      evolution = -1 - Math.floor(Math.random() * 2);
    }

    const nouvelOVR = limiter(
      Math.min(potentiel, ovr + evolution)
    );

    return {
      ...joueur,
      age,
      ovr: nouvelOVR,
      potentiel: Math.max(potentiel, nouvelOVR),
      progressionAnnuelle: evolution
    };
  });
}
