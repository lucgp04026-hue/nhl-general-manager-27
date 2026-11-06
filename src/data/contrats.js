
const BASE =
  "https://proxy.cors.dev/https://github.com/ehlersio/nhl-contracts/releases/download/contracts";

const SAISON = "2026-27";

function normaliser(nom) {
  return (nom || "")
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

export async function chargerContrats(joueurs) {
  try {
    const [contratsBruts, saisonsBrutes] = await Promise.all([
      chargerJSON("contracts.json"),
      chargerJSON("contract_seasons.json")
    ]);

    const contrats = Array.isArray(contratsBruts)
      ? contratsBruts
      : contratsBruts.data || [];

    const saisons = Array.isArray(saisonsBrutes)
      ? saisonsBrutes
      : saisonsBrutes.data || [];

    return joueurs.map((joueur) => {
      const contrat = contrats.find((c) => {
        if (
          joueur.idNhl &&
          c.player_id &&
          Number(joueur.idNhl) === Number(c.player_id)
        ) {
          return true;
        }

        return (
          normaliser(c.player_name) === normaliser(joueur.nom)
        );
      });

      if (!contrat) {
        return {
          ...joueur,
          contratDisponible: false,
          salaire: joueur.salaire || 0
        };
      }

      const saison = saisons.find(
        (s) =>
          s.contract_key === contrat.contract_key &&
          s.season === SAISON
      );

      const capHit =
        saison?.cap_hit_usd ??
        saison?.aav_usd ??
        contrat.cap_hit_usd ??
        contrat.aav_usd ??
        null;

      return {
        ...joueur,

        salaire:
          capHit !== null
            ? Number(capHit) / 1000000
            : joueur.salaire || 0,

        contratDuree: contrat.term_years ?? null,
        contratDebut: contrat.start_season ?? null,
        contratFin: contrat.end_season ?? null,
        statutFinContrat: contrat.expiry_status ?? null,
        typeContrat: contrat.contract_type ?? null,

        contratDisponible: true,
        niveauSource: contrat.best_tier ?? null
      };
    });
  } catch (erreur) {
    console.error("Erreur de chargement des contrats NHL :", erreur);

    return joueurs.map((joueur) => ({
      ...joueur,
      contratDisponible: false
    }));
  }
}
