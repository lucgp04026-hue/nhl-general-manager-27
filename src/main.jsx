import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { teams } from "./data/teams.js";
import { players } from "./data/players.js";
import "./style.css";

// PHOTO DU JOUEUR
function PhotoJoueur({ joueur, taille = 58 }) {
  const [erreur, setErreur] = useState(false);

  return (
    <div
      style={{
        width: taille,
        height: taille,
        minWidth: taille,
        borderRadius: "50%",
        overflow: "hidden",
        background: "#263449",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #46566d"
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
        <span style={{ fontSize: 25 }}>🏒</span>
      )}
    </div>
  );
}

function App() {
  const equipeDepart =
    teams.find((e) =>
      e.name.toLowerCase().includes("montréal")
    ) || teams[0];

  const [onglet, setOnglet] = useState("Accueil");
  const [equipeId, setEquipeId] = useState(equipeDepart?.id);
  const [effectif, setEffectif] = useState(players);

  const [victoires, setVictoires] = useState(0);
  const [defaites, setDefaites] = useState(0);
  const [nuls, setNuls] = useState(0);
  const [points, setPoints] = useState(0);
  const [matchs, setMatchs] = useState(0);
  const [dernierMatch, setDernierMatch] = useState("");

  const [joueurEchange, setJoueurEchange] = useState("");
  const [equipeEchange, setEquipeEchange] = useState("");

  const equipe = teams.find((e) => e.id === equipeId);

  const nomEquipe = equipe?.name || "Mon équipe";

  const joueursEquipe = effectif.filter(
    (j) => j.equipe === nomEquipe
  );

  const attaquants = joueursEquipe.filter(
    (j) => ["C", "AG", "AD", "C/AG", "C/AD"].includes(j.pos)
  );

  const defenseurs = joueursEquipe.filter(
    (j) => j.pos === "D"
  );

  const gardiens = joueursEquipe.filter(
    (j) => j.pos === "G"
  );

  const moyenne =
    joueursEquipe.length > 0
      ? Math.round(
          joueursEquipe.reduce((total, j) => total + (j.ovr || 0), 0) /
            joueursEquipe.length
        )
      : 0;

  const masseSalariale = joueursEquipe.reduce(
    (total, j) => total + (Number(j.salaire) || 0),
    0
  );

  function simulerMatch() {
    const butsNous = Math.floor(Math.random() * 6);
    const butsAdversaire = Math.floor(Math.random() * 6);

    setMatchs(matchs + 1);

    if (butsNous > butsAdversaire) {
      setVictoires(victoires + 1);
      setPoints(points + 2);
    } else if (butsNous < butsAdversaire) {
      setDefaites(defaites + 1);
    } else {
      setNuls(nuls + 1);
      setPoints(points + 1);
    }

    setDernierMatch(
      `${nomEquipe} ${butsNous} - ${butsAdversaire} Adversaire`
    );
  }

  function recommencerSaison() {
    setVictoires(0);
    setDefaites(0);
    setNuls(0);
    setPoints(0);
    setMatchs(0);
    setDernierMatch("");
  }

  function effectuerEchange() {
    if (!joueurEchange || !equipeEchange) {
      alert("Choisis un joueur et une équipe.");
      return;
    }

    const joueur = effectif.find(
      (j) => j.nom === joueurEchange && j.equipe === nomEquipe
    );

    if (!joueur) {
      alert("Joueur introuvable.");
      return;
    }

    setEffectif((anciens) =>
      anciens.map((j) =>
        j.nom === joueurEchange
          ? { ...j, equipe: equipeEchange }
          : j
      )
    );

    alert(
      `${joueur.nom} a été transféré à ${equipeEchange}.`
    );

    setJoueurEchange("");
    setEquipeEchange("");
  }

  const boutonStyle = {
    background: "#e63946",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "11px 18px",
    fontWeight: "bold",
    cursor: "pointer"
  };

  const carteStyle = {
    background: "#172438",
    border: "1px solid #2c3d54",
    borderRadius: 12,
    padding: 18
  };

  const onglets = [
    "Accueil",
    "Effectif",
    "Échanges",
    "Saison",
    "Finances"
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1422",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: 15
      }}
    >
      {/* EN-TÊTE */}

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          borderBottom: "1px solid #34445b",
          paddingBottom: 18
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 25 }}>
            🏒 NHL GENERAL MANAGER 27
          </h1>

          <p style={{ color: "#9eafc4", marginBottom: 0 }}>
            Saison 2026-2027 · Jeu gratuit
          </p>
        </div>

        <span
          style={{
            background: "#146c43",
            padding: "7px 13px",
            borderRadius: 20,
            fontSize: 12
          }}
        >
          100 % GRATUIT
        </span>
      </header>

      {/* CHOIX DE L'ÉQUIPE */}

      <div style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Ton équipe
        </label>

        <select
          value={equipeId ?? ""}
          onChange={(e) => setEquipeId(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 400,
            padding: 12,
            background: "#172438",
            color: "white",
            border: "1px solid #46566d",
            borderRadius: 8
          }}
        >
          {teams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {/* NAVIGATION */}

      <nav
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          marginTop: 22,
          paddingBottom: 12
        }}
      >
        {onglets.map((nom) => (
          <button
            key={nom}
            onClick={() => setOnglet(nom)}
            style={{
              ...boutonStyle,
              background:
                onglet === nom ? "#e63946" : "#263449",
              whiteSpace: "nowrap"
            }}
          >
            {nom}
          </button>
        ))}
      </nav>

      {/* ACCUEIL */}

      {onglet === "Accueil" && (
        <section>
          <h2>{nomEquipe}</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 12
            }}
          >
            <div style={carteStyle}>
              <h3>{victoires}</h3>
              <p>Victoires</p>
            </div>

            <div style={carteStyle}>
              <h3>{defaites}</h3>
              <p>Défaites</p>
            </div>

            <div style={carteStyle}>
              <h3>{points}</h3>
              <p>Points</p>
            </div>

            <div style={carteStyle}>
              <h3>{moyenne || "-"}</h3>
              <p>Moyenne équipe</p>
            </div>
          </div>

          <div style={{ ...carteStyle, marginTop: 18 }}>
            <h3>Dernier match</h3>

            <p>
              {dernierMatch || "Aucun match joué."}
            </p>

            <button
              style={boutonStyle}
              onClick={simulerMatch}
            >
              Jouer un match
            </button>
          </div>
        </section>
      )}

      {/* EFFECTIF */}

      {onglet === "Effectif" && (
        <section>
          <h2>Effectif - {nomEquipe}</h2>

          <p style={{ color: "#aab8ca" }}>
            {joueursEquipe.length} joueurs · Note moyenne : {moyenne || "-"}
          </p>

          {joueursEquipe.length === 0 ? (
            <div style={carteStyle}>
              Aucun joueur n'est encore ajouté à cette équipe.
            </div>
          ) : (
            <>
              <h3>Attaquants</h3>

              {attaquants.map((j) => (
                <div
                  key={j.nom}
                  style={{
                    ...carteStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 10
                  }}
                >
                  <PhotoJoueur joueur={j} />

                  <div style={{ flex: 1 }}>
                    <strong>{j.nom}</strong>
                    <p style={{ margin: "5px 0", color: "#aab8ca" }}>
                      #{j.numero} · {j.pos} · {j.age} ans
                    </p>
                  </div>

                  <strong style={{ color: "#f5c451" }}>
                    {j.ovr} OVR
                  </strong>
                </div>
              ))}

              <h3>Défenseurs</h3>

              {defenseurs.map((j) => (
                <div
                  key={j.nom}
                  style={{
                    ...carteStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 10
                  }}
                >
                  <PhotoJoueur joueur={j} />

                  <div style={{ flex: 1 }}>
                    <strong>{j.nom}</strong>
                    <p style={{ margin: "5px 0", color: "#aab8ca" }}>
                      #{j.numero} · {j.pos} · {j.age} ans
                    </p>
                  </div>

                  <strong style={{ color: "#f5c451" }}>
                    {j.ovr} OVR
                  </strong>
                </div>
              ))}

              <h3>Gardiens</h3>

              {gardiens.map((j) => (
                <div
                  key={j.nom}
                  style={{
                    ...carteStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 10
                  }}
                >
                  <PhotoJoueur joueur={j} />

                  <div style={{ flex: 1 }}>
                    <strong>{j.nom}</strong>
                    <p style={{ margin: "5px 0", color: "#aab8ca" }}>
                      #{j.numero} · {j.pos} · {j.age} ans
                    </p>
                  </div>

                  <strong style={{ color: "#f5c451" }}>
                    {j.ovr} OVR
                  </strong>
                </div>
              ))}
            </>
          )}
        </section>
      )}

      {/* ÉCHANGES */}

      {onglet === "Échanges" && (
        <section>
          <h2>Centre des échanges</h2>

          <div style={carteStyle}>
            <h3>Proposer un échange</h3>

            <label>Joueur à échanger</label>

            <select
              value={joueurEchange}
              onChange={(e) => setJoueurEchange(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 8,
                marginBottom: 16,
                background: "#263449",
                color: "white",
                borderRadius: 8
              }}
            >
              <option value="">Choisir un joueur</option>

              {joueursEquipe.map((j) => (
                <option key={j.nom} value={j.nom}>
                  {j.nom}
                </option>
              ))}
            </select>

            <label>Équipe destinataire</label>

            <select
              value={equipeEchange}
              onChange={(e) => setEquipeEchange(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 8,
                marginBottom: 16,
                background: "#263449",
                color: "white",
                borderRadius: 8
              }}
            >
              <option value="">Choisir une équipe</option>

              {teams
                .filter((e) => e.name !== nomEquipe)
                .map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.name}
                  </option>
                ))}
            </select>

            <button
              style={boutonStyle}
              onClick={effectuerEchange}
            >
              Effectuer le transfert
            </button>
          </div>

          <p style={{ color: "#aab8ca", marginTop: 15 }}>
            Cette première version permet de transférer un joueur vers
            une autre équipe. Les échanges complets avec plusieurs
            joueurs et choix de repêchage restent à développer.
          </p>
        </section>
      )}

      {/* SAISON */}

      {onglet === "Saison" && (
        <section>
          <h2>Saison 2026-2027</h2>

          <div style={carteStyle}>
            <h3>Statistiques de la saison</h3>

            <p>Matchs joués : {matchs}</p>
            <p>Victoires : {victoires}</p>
            <p>Défaites : {defaites}</p>
            <p>Matchs nuls : {nuls}</p>
            <p>Points : {points}</p>

            <button
              style={boutonStyle}
              onClick={simulerMatch}
            >
              Simuler un match
            </button>

            <button
              onClick={recommencerSaison}
              style={{
                ...boutonStyle,
                background: "#46566d",
                marginLeft: 8
              }}
            >
              Nouvelle saison
            </button>
          </div>
        </section>
      )}

      {/* FINANCES */}

      {onglet === "Finances" && (
        <section>
          <h2>Finances de l'équipe</h2>

          <div style={carteStyle}>
            <h3>Masse salariale</h3>

            <h1 style={{ color: "#f5c451" }}>
              {masseSalariale.toFixed(3)} M$
            </h1>

            <p>Nombre de joueurs : {joueursEquipe.length}</p>

            <h3>Détail des contrats</h3>

            {joueursEquipe.map((j) => (
              <div
                key={j.nom}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #34445b",
                  padding: "10px 0",
                  gap: 10
                }}
              >
                <span>{j.nom}</span>
                <strong>{j.salaire} M$</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PIED DE PAGE */}

      <footer
        style={{
          textAlign: "center",
          color: "#71839a",
          marginTop: 40,
          padding: 20,
          borderTop: "1px solid #34445b"
        }}
      >
        NHL GENERAL MANAGER 27 · Projet gratuit
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <App />
);
