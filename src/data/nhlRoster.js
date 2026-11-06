
const API_NHL =
  "https://proxy.cors.dev/https://api-web.nhle.com/v1/roster";

function nomTexte(valeur) {
  if (typeof valeur === "string") return valeur;
  return valeur?.default || "";
}

function calculerAge(dateNaissance) {
  if (!dateNaissance) return 0;

  const naissance = new Date(dateNaissance);
  const aujourdHui = new Date();

  let age = aujourdHui.getFullYear() - naissance.getFullYear();

  if (
    aujourdHui.getMonth() < naissance.getMonth() ||
    (aujourdHui.getMonth() === naissance.getMonth() &&
      aujourdHui.getDate() < naissance.getDate())
  ) {
    age--;
  }

  return age;
}

function convertirJoueur(joueur, equipe) {
  const positions = {
    C: "C",
    L: "AG",
    R: "AD",
    D: "D",
    G: "G"
  };

  return {
    nom: `${nomTexte(joueur.firstName)} ${nomTexte(
      joueur.lastName
    )}`.trim(),
    idNhl: joueur.id,
    numero: joueur.sweaterNumber ?? "",
    pos: positions[joueur.positionCode] || joueur.positionCode || "?",
    age: calculerAge(joueur.birthDate),
    ovr: 75,
    salaire: 0,
    equipe: equipe.name,
    photo: joueur.headshot || null
  };
}

function cleNom(nom) {
  return (nom || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export async function chargerTousLesJoueurs(
  teams,
  joueursPersonnalises = []
) {
  const resultats = await Promise.all(
    teams.map(async (equipe) => {
      try {
        const reponse = await fetch(
          `${API_NHL}/${equipe.id}/current`
        );

        if (!reponse.ok) {
          throw new Error(`Erreur HTTP ${reponse.status}`);
        }

        const donnees = await reponse.json();

        const joueurs = [
          ...(donnees.forwards || []),
          ...(donnees.defensemen || []),
          ...(donnees.goalies || [])
        ];

        return joueurs.map((joueur) =>
          convertirJoueur(joueur, equipe)
        );
      } catch (erreur) {
        console.error(
          `Erreur pour ${equipe.name}:`,
          erreur
        );

        return [];
      }
    })
  );

  const joueursNHL = resultats.flat();

  const joueursMontreal = joueursPersonnalises.filter(
    (joueur) =>
      joueur.equipe === "Canadiens de Montréal" ||
      joueur.equipe === "Montreal Canadiens" ||
      joueur.equipe === "Montréal"
  );

  const nomsPersonnalises = new Map(
    joueursMontreal.map((joueur) => [
      cleNom(joueur.nom),
      joueur
    ])
  );

  const joueursFusionnes = joueursNHL.map((joueur) => {
    const cle = cleNom(joueur.nom);
    const personnalise = nomsPersonnalises.get(cle);

    if (!personnalise) return joueur;

    nomsPersonnalises.delete(cle);

    return {
      ...joueur,
      ...personnalise,
      photo: personnalise.photo || joueur.photo
    };
  });

  const joueursMontrealRestants = [
    ...nomsPersonnalises.values()
  ];

  return [
    ...joueursFusionnes,
    ...joueursMontrealRestants
  ];
}
