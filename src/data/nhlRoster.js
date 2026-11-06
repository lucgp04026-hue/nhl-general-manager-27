
const API_NHL = "https://api-web.nhle.com/v1/roster";

function nomTexte(valeur) {
  if (typeof valeur === "string") return valeur;
  return valeur?.default || "";
}

function calculerAge(dateNaissance) {
  if (!dateNaissance) return 0;

  const naissance = new Date(dateNaissance);
  const aujourdHui = new Date();

  let age = aujourdHui.getFullYear() - naissance.getFullYear();

  const anniversairePasEncorePasse =
    aujourdHui.getMonth() < naissance.getMonth() ||
    (aujourdHui.getMonth() === naissance.getMonth() &&
      aujourdHui.getDate() < naissance.getDate());

  if (anniversairePasEncorePasse) age--;

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
    nom: `${nomTexte(joueur.firstName)} ${nomTexte(joueur.lastName)}`.trim(),
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

export async function chargerTousLesJoueurs(teams, joueursPersonnalises = []) {
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
          `Impossible de charger ${equipe.name}:`,
          erreur
        );
        return [];
      }
    })
  );

  const joueursNHL = resultats.flat();

  // Les joueurs personnalisés de Montréal sont conservés.
  const joueursMontreal = joueursPersonnalises.filter(
    (joueur) => joueur.equipe === "Canadiens de Montréal" ||
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
    const personnalise = nomsPersonnalises.get(
      cleNom(joueur.nom)
    );

    if (!personnalise) return joueur;

    nomsPersonnalises.delete(cleNom(joueur.nom));

    return {
      ...joueur,
      ...personnalise,
      // On conserve la photo déjà corrigée dans ton fichier.
      photo: personnalise.photo || joueur.photo
    };
  });

  // On garde aussi les joueurs personnalisés absents de l'effectif actuel.
  const joueursMontrealRestants = [...nomsPersonnalises.values()];

  return [...joueursFusionnes, ...joueursMontrealRestants];
}
