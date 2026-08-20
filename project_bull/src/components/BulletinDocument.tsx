/**
 * BulletinDocument — Rendu fidèle aux modèles officiels INPTIC (LP ASUR / DTS)
 * Réf : assets/images/Ex_BulletinS5.png / Ex_BulletinS6.png / Ex_BullAnnuel.png
 */
import React from "react";
import logoInptic from "../../assets/images/logo_inptic.png";

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface MatiereData {
  libelle: string;
  coefficient: number;
  credits: number;
  cc?: number;
  examen?: number;
  rattrapage?: number;
  moyenne?: number;
  moyenneClasse?: number;
  rang?: number;
  appreciation?: string;
  absences?: number;
}

export interface UEData {
  code: string;
  libelle: string;
  matieres: MatiereData[];
  moyenne?: number;
  moyenneClasse?: number;
  rang?: number;
  appreciation?: string;
  creditsTotal: number;
  creditsAcquis: number;
  acquise: boolean;
  compense?: boolean;
}

export interface StatistiquesData {
  moyenneClasse?: number;
  min?: number;
  max?: number;
  ecartType?: number;
  rang?: number;
  nbEtudiants?: number;
}

export interface BulletinSemestreData {
  type: "semestre";
  etudiant: {
    nom: string;
    prenom: string;
    matricule: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    classeNom?: string;
  };
  semestre: {
    code: string;
    libelle: string;
    anneeUniversitaire: string;
  };
  ues: UEData[];
  moyenneSemestre?: number;
  moyenneClasseSemestre?: number;
  rangSemestre?: number;
  appreciation?: string;
  creditsTotal: number;
  creditsAcquis: number;
  valide?: boolean;
  compense?: boolean;
  absencesHeures?: number;
  statistiques?: StatistiquesData;
  dateEdition?: string;
  nomDirecteurEtudes?: string;
}

export interface BulletinAnnuelData {
  type: "annuel";
  etudiant: {
    nom: string;
    prenom: string;
    matricule: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    classeNom?: string;
    bacType?: string;
    anneeBac?: number;
    provenance?: string;
  };
  anneeUniversitaire: string;
  semestre5?: { libelle: string; moyenne?: number; creditsAcquis: number; creditsTotal: number; valide: boolean };
  semestre6?: { libelle: string; moyenne?: number; creditsAcquis: number; creditsTotal: number; valide: boolean };
  moyenneAnnuelle?: number;
  moyenneClasseAnnuelle?: number;
  creditsTotal: number;
  creditsAcquis: number;
  decisionJury?: string;
  mention?: string;
  rangAnnuel?: number;
  nbEtudiants?: number;
  statistiques?: StatistiquesData;
  dateEdition?: string;
  nomDirecteurEtudes?: string;
}

export type BulletinData = BulletinSemestreData | BulletinAnnuelData;

// ─── Helpers de Formatage ──────────────────────────────────────────────────────
const fmt = (n?: number | null) =>
  n != null && !isNaN(n) ? Number(n).toFixed(2).replace(".", ",") : "—";

/**
 * Règle de coloration demandée :
 * - < 6 : Rouge
 * - >= 6 et < 10 : Jaune / Orange
 * - >= 10 à 20 : Vert
 */
const getMoyenneColorStyle = (score?: number | null): React.CSSProperties => {
  if (score === undefined || score === null || isNaN(score)) return {};
  if (score < 6) {
    return {
      backgroundColor: "#fee2e2", // Rouge clair
      color: "#991b1b",           // Rouge foncé
      fontWeight: "bold",
    };
  } else if (score < 10) {
    return {
      backgroundColor: "#fef08a", // Jaune clair
      color: "#854d0e",           // Brun / Jaune foncé
      fontWeight: "bold",
    };
  } else {
    return {
      backgroundColor: "#dcfce7", // Vert clair
      color: "#166534",           // Vert foncé
      fontWeight: "bold",
    };
  }
};

const DECISIONS: Record<string, string> = {
  DIPLOME: "DIPLÔMÉ(E)",
  SEMESTRE_VALIDE: "Semestre validé",
  REPRISE_SOUTENANCE: "REPRISE DE SOUTENANCE",
  REDOUBLE: "REDOUBLE LA LICENCE 3",
};

const MENTIONS: Record<string, string> = {
  TRES_BIEN: "Très Bien",
  BIEN: "Bien",
  ASSEZ_BIEN: "Assez Bien",
  PASSABLE: "Passable",
};

// ─── Styles d'impression & conteneur ──────────────────────────────────────────
const containerStyle: React.CSSProperties = {
  width: "210mm",
  minHeight: "297mm",
  padding: "12mm 15mm",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  fontFamily: "'Segoe UI', Arial, sans-serif",
  color: "#000000",
  fontSize: "10px",
  boxSizing: "border-box",
  lineHeight: "1.3",
};

// ───────────── COMPOSANT BULLETIN SEMESTRIEL ──────────────────────────────────
const BulletinSemestrielDoc: React.FC<{ d: BulletinSemestreData }> = ({ d }) => {
  const nomClasse =
    d.etudiant.classeNom ||
    "Licence Professionnelle Réseaux et Télécommunications Option Administration et Sécurité des Réseaux (ASUR)";

  const rangText = d.statistiques?.rang
    ? `${d.statistiques.rang}${d.statistiques.rang === 1 ? "er" : "ème"}/${d.statistiques.nbEtudiants || ""}`
    : "Non classé";

  const mentionText =
    d.moyenneSemestre && d.moyenneSemestre >= 16
      ? "Très Bien"
      : d.moyenneSemestre && d.moyenneSemestre >= 14
      ? "Bien"
      : d.moyenneSemestre && d.moyenneSemestre >= 12
      ? "Assez Bien"
      : d.moyenneSemestre && d.moyenneSemestre >= 10
      ? "Passable"
      : "Ajourné";

  const semestreNum = d.semestre.code.replace(/[^0-9]/g, "") || "5";

  return (
    <div style={containerStyle}>
      {/* En-tête Institutionnel (Deux colonnes + Logo INPTIC au centre) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ textAlign: "center", width: "45%", fontSize: "8.5px", fontWeight: "bold", color: "#1b365d" }}>
          INSTITUT NATIONAL DE LA POSTE, DES TECHNOLOGIES<br />
          DE L'INFORMATION ET DE LA COMMUNICATION<br />
          <img src={logoInptic} alt="INPTIC Logo" style={{ height: "42px", margin: "4px auto", display: "block" }} />
          DIRECTION DES ETUDES ET DE LA PEDAGOGIE
        </div>
        <div style={{ textAlign: "center", width: "40%", fontSize: "8.5px", fontWeight: "bold", color: "#1b365d" }}>
          RÉPUBLIQUE GABONAISE<br />
          -------------------<br />
          <span style={{ fontSize: "8px", fontWeight: "normal", fontStyle: "italic" }}>Union - Travail - Justice</span><br />
          -------------------
        </div>
      </div>

      {/* Titre du Bulletin */}
      <div style={{ textAlign: "center", margin: "8px 0 10px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#002060", margin: "0", letterSpacing: "0.2px" }}>
          Bulletin de Notes du {d.semestre.libelle}
        </h2>
        <div style={{ fontSize: "11px", fontStyle: "italic", color: "#002060", marginTop: "2px" }}>
          Année Académique : {d.semestre.anneeUniversitaire}
        </div>
      </div>

      {/* Boîte d'identification de la Classe */}
      <div style={{ border: "2px double #1b365d", padding: "4px 8px", margin: "0 0 8px 0", fontSize: "10px", fontWeight: "bold", color: "#1b365d" }}>
        Classe : {nomClasse}
      </div>

      {/* Tableau d'informations Étudiant */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "10px", fontSize: "9.5px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", width: "30%", backgroundColor: "#f8fafc" }}>
              Nom(s) et Prénom(s)
            </td>
            <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", color: "#002060" }}>
              {d.etudiant.nom.toUpperCase()} {d.etudiant.prenom}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f8fafc" }}>
              Date et lieu de naissance
            </td>
            <td style={{ border: "1px solid #000", padding: "3px 6px" }}>
              Né(e) le {d.etudiant.dateNaissance ? new Date(d.etudiant.dateNaissance).toLocaleDateString("fr-FR") : "—"} {d.etudiant.lieuNaissance ? `à ${d.etudiant.lieuNaissance}` : ""}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tableau Principal des Notes */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", fontSize: "9px" }}>
        <thead>
          <tr style={{ backgroundColor: "#ffffff" }}>
            <th style={{ border: "1px solid #000", width: "46%" }}></th>
            <th style={{ border: "1px solid #000", padding: "3px", width: "9%", fontWeight: "bold" }}>Crédits</th>
            <th style={{ border: "1px solid #000", padding: "3px", width: "11%", fontWeight: "bold" }}>Coefficients</th>
            <th style={{ border: "1px solid #000", padding: "3px", width: "17%", color: "#002060", fontWeight: "bold" }}>Notes de l'étudiant</th>
            <th style={{ border: "1px solid #000", padding: "3px", width: "17%", fontWeight: "bold" }}>Moyenne de classe</th>
          </tr>
        </thead>
        <tbody>
          {d.ues.map((ue) => {
            const totalCoefUE = ue.matieres.reduce((sum, m) => sum + (m.coefficient || 0), 0);
            return (
              <React.Fragment key={ue.code}>
                {/* En-tête de l'UE */}
                <tr>
                  <td colSpan={5} style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", color: "#002060", backgroundColor: "#ffffff" }}>
                    {ue.code} : {ue.libelle}
                  </td>
                </tr>
                {/* Lignes de matières */}
                {ue.matieres.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #000", padding: "2px 6px 2px 14px" }}>{m.libelle}</td>
                    <td style={{ border: "1px solid #000", textAlign: "center" }}>{m.credits}</td>
                    <td style={{ border: "1px solid #000", textAlign: "center" }}>{fmt(m.coefficient)}</td>
                    <td style={{ border: "1px solid #000", textAlign: "center", ...getMoyenneColorStyle(m.moyenne ?? m.examen ?? m.cc) }}>{fmt(m.moyenne ?? m.examen ?? m.cc)}</td>
                    <td style={{ border: "1px solid #000", textAlign: "center", ...getMoyenneColorStyle(m.moyenneClasse) }}>{fmt(m.moyenneClasse)}</td>
                  </tr>
                ))}
                {/* Ligne récapitulative Moyenne UE */}
                <tr style={{ backgroundColor: "#ffffff" }}>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold" }}>
                    Moyenne {ue.code}
                  </td>
                  <td style={{ border: "1px solid #000", textAlign: "center", fontWeight: "bold" }}>{ue.creditsTotal}</td>
                  <td style={{ border: "1px solid #000", textAlign: "center", fontWeight: "bold" }}>{fmt(totalCoefUE)}</td>
                  {/* Application Règle de Couleurs Moyenne UE (<6 rouge, 6-10 jaune, >=10 vert) */}
                  <td style={{ border: "1px solid #000", textAlign: "center", fontSize: "9.5px", ...getMoyenneColorStyle(ue.moyenne) }}>
                    {fmt(ue.moyenne)}
                  </td>
                  <td style={{ border: "1px solid #000", textAlign: "center", fontWeight: "bold", ...getMoyenneColorStyle(ue.moyenneClasse) }}>{fmt(ue.moyenneClasse)}</td>
                </tr>
              </React.Fragment>
            );
          })}

          {/* Pénalités d'absences */}
          <tr>
            <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold" }}>Pénalités d'absences</td>
            <td colSpan={2} style={{ border: "1px solid #000", textAlign: "center" }}>—</td>
            <td style={{ border: "1px solid #000", textAlign: "center", color: d.absencesHeures ? "#dc2626" : "inherit" }}>
              {d.absencesHeures ? `${d.absencesHeures} heure(s)` : "0 heure(s)"}
            </td>
            <td style={{ border: "1px solid #000", textAlign: "center" }}>0 heure(s)</td>
          </tr>

          {/* Ligne Moyenne Générale du Semestre */}
          <tr style={{ backgroundColor: "#ffffff" }}>
            <td colSpan={3} style={{ border: "1px solid #000", padding: "4px 8px", textAlign: "right", fontWeight: "bold", fontSize: "10px" }}>
              Moyenne au Semestre {semestreNum}
            </td>
            {/* Application Règle de Couleurs Moyenne Finale (<6 rouge, 6-10 jaune, >=10 vert) */}
            <td style={{ border: "2px solid #000", textAlign: "center", fontSize: "11px", ...getMoyenneColorStyle(d.moyenneSemestre) }}>
              {fmt(d.moyenneSemestre)}
            </td>
            <td style={{ border: "1px solid #000", textAlign: "center", fontWeight: "bold", fontSize: "9.5px", ...getMoyenneColorStyle(d.moyenneClasseSemestre || d.statistiques?.moyenneClasse) }}>
              {fmt(d.moyenneClasseSemestre || d.statistiques?.moyenneClasse)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Rang et Mention */}
      <div style={{ display: "flex", justifySelf: "center", justifyContent: "center", margin: "8px 0" }}>
        <table style={{ width: "65%", borderCollapse: "collapse", border: "1px solid #000", textAlign: "center", fontSize: "9px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th style={{ border: "1px solid #000", padding: "3px", fontWeight: "bold" }}>Rang de l'étudiant au Semestre</th>
              <th style={{ border: "1px solid #000", padding: "3px", fontWeight: "bold" }}>Mention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "4px" }}>{rangText}</td>
              <td style={{ border: "1px solid #000", padding: "4px", fontWeight: "bold" }}>{mentionText}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Etat de la Validation des Crédits */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", margin: "8px 0", textAlign: "center", fontSize: "9px" }}>
        <thead>
          <tr>
            <th colSpan={d.ues.length + 1} style={{ border: "1px solid #000", padding: "3px", backgroundColor: "#f8fafc", fontWeight: "bold" }}>
              Etat de la Validation des Crédits au Semestre {semestreNum}
            </th>
          </tr>
          <tr>
            {d.ues.map((ue) => (
              <th key={ue.code} style={{ border: "1px solid #000", padding: "2px", width: `${80 / (d.ues.length || 1)}%` }}>{ue.code}</th>
            ))}
            <th style={{ border: "1px solid #000", padding: "2px", width: "22%" }}>Crédits Acquis au Semestre {semestreNum}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {d.ues.map((ue) => (
              <td key={ue.code} style={{ border: "1px solid #000", padding: "4px 2px" }}>
                <div><strong>{ue.creditsAcquis} Crédits / {ue.creditsTotal}</strong></div>
                <div style={{ color: ue.acquise ? "#15803d" : "#dc2626", fontStyle: "italic", fontSize: "8.5px" }}>
                  {ue.acquise ? (ue.compense ? "UE Acquise par Compensation" : "UE Acquise") : "UE non Acquise"}
                </div>
              </td>
            ))}
            <td style={{ border: "1px solid #000", padding: "4px 2px" }}>
              <div><strong>{d.creditsAcquis} Crédits /{d.creditsTotal}</strong></div>
              <div style={{ color: d.valide ? "#15803d" : "#dc2626", fontStyle: "italic", fontSize: "8.5px" }}>
                {d.valide ? (d.compense ? "Semestre Acquis par Compensation" : "Semestre Acquis") : "Semestre non Acquis"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Décision du Jury */}
      <div style={{ margin: "10px 0", fontSize: "10.5px" }}>
        <span>Décision du Jury : </span>
        <strong style={{ marginLeft: "14px", fontSize: "11.5px", color: d.valide ? "#002060" : "#dc2626" }}>
          {d.valide ? `Semestre ${semestreNum} validé` : "Semestre non validé"}
        </strong>
      </div>

      {/* Signature & Date */}
      <div style={{ marginTop: "20px", textWrap: "nowrap", textAlign: "center", fontSize: "9.5px" }}>
        <div>
          Fait à Libreville, le{" "}
          {d.dateEdition
            ? new Date(d.dateEdition).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            : "6 Mai 2016"}
        </div>
        <div style={{ fontWeight: "bold", color: "#002060", marginTop: "3px" }}>
          LE DIRECTEUR DES ETUDES ET DE LA PEDAGOGIE
        </div>
        <div style={{ height: "45px" }}></div>
        <div style={{ fontWeight: "bold", color: "#002060" }}>
          {d.nomDirecteurEtudes || "Davy Edgard MOUSSAVOU"}
        </div>
      </div>

      {/* Note légale en bas de page */}
      <div style={{ marginTop: "30px", textAlign: "center", fontSize: "7.5px", fontStyle: "italic", color: "#374151" }}>
        Il ne sera délivré qu'un seul et unique exemplaire de bulletins de notes. L'étudiant est donc prié d'en faire plusieurs copies légalisées.
      </div>
    </div>
  );
};

// ───────────── COMPOSANT BULLETIN ANNUEL ──────────────────────────────────────
const BulletinAnnuelDoc: React.FC<{ d: BulletinAnnuelData }> = ({ d }) => {
  const nomClasse = d.etudiant.classeNom || "Diplôme de Technicien Supérieur Option Réseaux et Télécommunications";

  return (
    <div style={containerStyle}>
      {/* En-tête Institutionnel */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <div style={{ textAlign: "center", width: "40%", fontSize: "8.5px", fontWeight: "bold", color: "#1b365d" }}>
          RÉPUBLIQUE GABONAISE<br />
          -------------------<br />
          <span style={{ fontSize: "8px", fontWeight: "normal", fontStyle: "italic" }}>Union - Travail - Justice</span><br />
          -------------------
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "10px 0" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#002060", margin: 0 }}>
          Bulletin de notes Annuel
        </h2>
        <div style={{ fontSize: "11px", fontStyle: "italic", color: "#002060", marginTop: "2px" }}>
          Année universitaire : {d.anneeUniversitaire}
        </div>
      </div>

      <div style={{ border: "2px double #1b365d", padding: "4px 8px", marginBottom: "10px", fontSize: "10px", fontWeight: "bold", color: "#1b365d" }}>
        Classe : {nomClasse}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "10px", fontSize: "9.5px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", width: "35%", backgroundColor: "#f8fafc" }}>
              Nom(s) et Prénom(s) de l'étudiant(e) :
            </td>
            <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", color: "#002060" }}>
              {d.etudiant.nom.toUpperCase()} {d.etudiant.prenom}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f8fafc" }}>
              Date et lieu de naissance
            </td>
            <td style={{ border: "1px solid #000", padding: "3px 6px" }}>
              Né(e) le {d.etudiant.dateNaissance ? new Date(d.etudiant.dateNaissance).toLocaleDateString("fr-FR") : "—"} {d.etudiant.lieuNaissance ? `à ${d.etudiant.lieuNaissance}` : ""}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tableau des récapitulatifs par semestre et annuel */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", fontSize: "9px", marginBottom: "10px" }}>
        <thead>
          <tr style={{ backgroundColor: "#ffffff" }}>
            <th style={{ border: "1px solid #000", padding: "3px", width: "45%" }}></th>
            <th style={{ border: "1px solid #000", padding: "3px", width: "12%" }}>Coefficients</th>
            <th style={{ border: "1px solid #000", padding: "3px", width: "15%", color: "#002060" }}>Notes</th>
            <th style={{ border: "1px solid #000", padding: "3px", width: "12%" }}>Rang</th>
            <th style={{ border: "1px solid #000", padding: "3px", width: "16%" }}>Moyenne de classe</th>
          </tr>
        </thead>
        <tbody>
          {d.semestre5 && (
            <tr>
              <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{d.semestre5.libelle}</td>
              <td style={{ border: "1px solid #000", textAlign: "center" }}>30,00</td>
              <td style={{ border: "1px solid #000", textAlign: "center", ...getMoyenneColorStyle(d.semestre5.moyenne) }}>{fmt(d.semestre5.moyenne)}</td>
              <td style={{ border: "1px solid #000", textAlign: "center" }}>—</td>
              <td style={{ border: "1px solid #000", textAlign: "center" }}>—</td>
            </tr>
          )}
          {d.semestre6 && (
            <tr>
              <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{d.semestre6.libelle}</td>
              <td style={{ border: "1px solid #000", textAlign: "center" }}>30,00</td>
              <td style={{ border: "1px solid #000", textAlign: "center", ...getMoyenneColorStyle(d.semestre6.moyenne) }}>{fmt(d.semestre6.moyenne)}</td>
              <td style={{ border: "1px solid #000", textAlign: "center" }}>—</td>
              <td style={{ border: "1px solid #000", textAlign: "center" }}>—</td>
            </tr>
          )}
          <tr style={{ backgroundColor: "#f8fafc", fontWeight: "bold" }}>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>Moyenne Annuelle</td>
            <td style={{ border: "1px solid #000", textAlign: "center" }}>60,00</td>
            {/* Règle de couleurs sur la moyenne annuelle finale */}
            <td style={{ border: "2px solid #000", textAlign: "center", fontSize: "10.5px", ...getMoyenneColorStyle(d.moyenneAnnuelle) }}>
              {fmt(d.moyenneAnnuelle)}
            </td>
            <td style={{ border: "1px solid #000", textAlign: "center" }}>{d.rangAnnuel ? `${d.rangAnnuel}/${d.nbEtudiants || ""}` : "—"}</td>
            <td style={{ border: "1px solid #000", textAlign: "center" }}>{fmt(d.moyenneClasseAnnuelle)}</td>
          </tr>
        </tbody>
      </table>

      {/* Décision et Mention */}
      <div style={{ border: "1px solid #000", padding: "8px 12px", margin: "10px 0", fontSize: "10px" }}>
        <div style={{ marginBottom: "4px" }}>
          <span>Décision du Conseil d'Etablissement : </span>
          <strong style={{ marginLeft: "10px", fontSize: "11px", color: "#002060" }}>
            {d.decisionJury ? (DECISIONS[d.decisionJury] ?? d.decisionJury) : "DIPLÔMÉ(E)"}
          </strong>
        </div>
        <div>
          <span>Mention : </span>
          <strong style={{ marginLeft: "10px", color: "#002060" }}>
            {d.mention ? (MENTIONS[d.mention] ?? d.mention) : "Passable"}
          </strong>
        </div>
      </div>

      {/* Signature */}
      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "9.5px" }}>
        <div>
          Fait à Libreville, le{" "}
          {d.dateEdition
            ? new Date(d.dateEdition).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            : new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
        <div style={{ fontWeight: "bold", color: "#002060", marginTop: "3px" }}>
          LE DIRECTEUR DES ETUDES ET DE LA PEDAGOGIE
        </div>
        <div style={{ height: "45px" }}></div>
        <div style={{ fontWeight: "bold", color: "#002060" }}>
          {d.nomDirecteurEtudes || "Davy Edgard MOUSSAVOU"}
        </div>
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "7.5px", fontStyle: "italic", color: "#374151" }}>
        Il ne sera délivré qu'un seul et unique exemplaire de bulletins de notes.
      </div>
    </div>
  );
};

// ───────────── COMPOSANT PRINCIPAL EXPORTÉ ─────────────────────────────────────
export const BulletinDocument: React.FC<{ data: BulletinData }> = ({ data }) => {
  if (data.type === "semestre") {
    return <BulletinSemestrielDoc d={data as BulletinSemestreData} />;
  }
  return <BulletinAnnuelDoc d={data as BulletinAnnuelData} />;
};
