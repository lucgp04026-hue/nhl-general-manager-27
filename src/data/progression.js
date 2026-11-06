
function limiter(valeur, minimum = 50, maximum = 99) {
  return Math.max(minimum, Math.min(maximum, Math.round(valeur)));
}

// Cotes personnalisées des grandes vedettes NHL.
// Ces évaluations sont celles du jeu NHL GM 27.
const cotesVedettes = {
  "connor mcdavid": { ovr: 97, potentiel: 99 },
  "leon draisaitl": { ovr: 95, potentiel: 96 },
  "nathan mackinnon": { ovr: 96, potentiel: 97 },
  "nikita kucherov": { ovr: 95, potentiel: 95 },
  "auston matthews": { ovr: 95, potentiel: 97 },
  "sidney crosby": { ovr: 92, potentiel: 92 },
  "alex ovechkin": { ovr: 90, potentiel: 90 },
  "david pastrnak": { ovr: 94, potentiel: 95 },
  "cale makar": { ovr: 95, potentiel: 98 },
  "quinn hughes": { ovr: 94, potentiel: 97 },
  "jack hughes": { ovr: 92, potentiel: 96 },
  "kirill kaprizov": { ovr: 94, potentiel: 96 },
  "artemi panarin": { ovr: 92, potentiel: 92 },
  "brad marchand": { ovr: 90, potentiel: 90 },
  "mark stone": { ovr: 90, potentiel: 90 },
  "brayden point": { ovr: 92, potentiel: 94 },
  "victor hedman": { ovr: 91, potentiel: 91 },
  "mikko rantanen": { ovr: 93, potentiel: 95 },
  "william nylander": { ovr: 92, potentiel: 94 },
  "mitchell marner": { ovr: 93, potentiel: 95 },
  "matthew tkachuk": { ovr: 94, potentiel: 96 },
  "brady tkachuk": { ovr: 92, potentiel: 95 },
  "jack eichel": { ovr: 93, potentiel: 95 },
  "jason robertson": { ovr: 91, potentiel: 94 },
  "roope hintz": { ovr: 90, potentiel: 93 },
  "sebastian aho": { ovr: 92, potentiel: 94 },
  "roman josi": { ovr: 92, potentiel: 92 },
  "mitch marner": { ovr: 93, potentiel: 95 },
  "cole caufield": { ovr: 90, potentiel: 95 },
  "nick suzuki": { ovr: 89, potentiel: 93 },
  "ivan demidov": { ovr: 85, potentiel: 96 },
  "juraj slafkovsky": { ovr: 87, potentiel: 94 },
  "igor shesterkin": { ovr: 95, potentiel: 97 },
  "andrei vasilevskiy": { ovr: 94, potentiel: 94 },
  "connor hellebuyck": { ovr: 94, potentiel: 94 },
  "logan thompson": { ovr: 89, potentiel: 92 },
  "thatcher demko": { ovr: 91, potentiel: 93 },
  "jake oettinger": { ovr: 91, potentiel: 94 }
};

function normaliserNom(nom) {
  return (nom || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "")
    .trim();
}

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

// Prépare les joueurs et applique les cotes personnalisées.
export function preparerJoueurs(joueurs) {
  return joueurs.map((joueur) => {
    const nomNormalise = normaliserNom(joueur.nom);
    const vedette = cotesVedettes[nomNormalise];

    // Les cotes des vedettes ont priorité.
    if (vedette) {
      return {
        ...joueur,
        ovr: vedette.ovr,
        potentiel: vedette.potentiel,
        progressionAnnuelle: joueur.progressionAnnuelle || 0
      };
    }

    const age = Number(joueur.age) || 24;
    const ovrExistant = Number(joueur.ovr);

    // Préserve les évaluations personnalisées existantes.
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

// Développement annuel.
export function developperJoueurs(joueurs) {
  return joueurs.map((joueur) => {
    const age = (Number(joueur.age) || 24) + 1;
    const ovr = Number(joueur.ovr) || 75;
    const potentiel = Number(joueur.potentiel) || ovr;

    let evolution = 0;

    if (age <= 21 && ovr < potentiel) {
      evolution = 1 + Math.floor(Math.random() * 3);
    } else if (age <= 24 && ovr < potentiel) {
      evolution = Math.floor(Math.random() * 3);
    } else if (age <= 27 && ovr < potentiel) {
      evolution = Math.floor(Math.random() * 2);
    }

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
