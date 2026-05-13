/**
 * BulletinDocument — Rendu fidèle aux modèles INPTIC LP ASUR
 * Ref : assets/images/Ex_BulletinS5.png / Ex_BulletinS6.png / Ex_BullAnnuel.png
 */
import React from "react";
import logoInptic from "../../assets/images/logo_inptic.png";
import logoBullAsur from "../../assets/logos/logo_bull_asur.png";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MatiereData {
  libelle: string; coefficient: number; credits: number;
  cc?: number; examen?: number; rattrapage?: number; moyenne?: number; absences?: number;
}
export interface UEData {
  code: string; libelle: string; matieres: MatiereData[];
  moyenne?: number; creditsTotal: number; creditsAcquis: number;
  acquise: boolean; compense?: boolean;
}
export interface StatistiquesData {
  moyenneClasse?: number; min?: number; max?: number; ecartType?: number;
  rang?: number; nbEtudiants?: number;
}
export interface BulletinSemestreData {
  type: "semestre";
  etudiant: { nom: string; prenom: string; matricule: string; dateNaissance?: string; lieuNaissance?: string; };
  semestre: { code: string; libelle: string; anneeUniversitaire: string; };
  ues: UEData[];
  moyenneSemestre?: number; creditsTotal: number; creditsAcquis: number;
  valide?: boolean; statistiques?: StatistiquesData; dateEdition?: string;
}
export interface BulletinAnnuelData {
  type: "annuel";
  etudiant: { nom: string; prenom: string; matricule: string; dateNaissance?: string; lieuNaissance?: string; bacType?: string; anneeBac?: number; provenance?: string; };
  anneeUniversitaire: string;
  semestre5?: { libelle: string; moyenne?: number; creditsAcquis: number; creditsTotal: number; valide: boolean; };
  semestre6?: { libelle: string; moyenne?: number; creditsAcquis: number; creditsTotal: number; valide: boolean; };
  moyenneAnnuelle?: number; creditsTotal: number; creditsAcquis: number;
  decisionJury?: string; mention?: string; statistiques?: StatistiquesData; dateEdition?: string;
}
export type BulletinData = BulletinSemestreData | BulletinAnnuelData;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n?: number) => (n !== undefined ? n.toFixed(2) : "—");
const noteStyle = (n?: number): React.CSSProperties => ({
  color: n === undefined ? "#9ca3af" : n >= 10 ? "#15803d" : "#dc2626",
  fontWeight: n !== undefined ? 600 : 400,
});
const DECISIONS: Record<string,string> = { DIPLOME:"DIPLÔMÉ(E)", REPRISE_SOUTENANCE:"REPRISE DE SOUTENANCE", REDOUBLE:"REDOUBLE LA LICENCE 3" };
const MENTIONS: Record<string,string> = { TRES_BIEN:"Très Bien", BIEN:"Bien", ASSEZ_BIEN:"Assez Bien", PASSABLE:"Passable" };

// ─── Styles inline (résistants à Tailwind purge + impression) ─────────────────
const S = {
  doc: { border: "2px solid #1f2937", fontFamily: "Arial, sans-serif", fontSize: "11px", backgroundColor: "#fff" } as React.CSSProperties,
  headerGrid: { display: "grid", gridTemplateColumns: "110px 1fr 110px", alignItems: "center", padding: "10px 12px", gap: "8px", borderBottom: "2px solid #374151" } as React.CSSProperties,
  centerText: { textAlign: "center" as const },
  titleBand: (bg: string) => ({ backgroundColor: bg, color: "#fff", textAlign: "center" as const, padding: "8px 12px", borderTop: "2px solid #374151", borderBottom: "2px solid #374151" }),
  infoRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", padding: "8px 12px", backgroundColor: "#e9d5ff", borderBottom: "1px solid #d1d5db" } as React.CSSProperties,
  infoCell: { display: "flex", gap: "6px", alignItems: "baseline" } as React.CSSProperties,
  infoLabel: { color: "#6b7280", whiteSpace: "nowrap" as const, minWidth: "90px" },
  infoValue: { fontWeight: 700, color: "#111827" },
  ueHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#c4b5fd", padding: "5px 10px", borderTop: "1px solid #9ca3af", borderBottom: "1px solid #9ca3af" } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { backgroundColor: "#ddd6fe", padding: "4px 8px", border: "1px solid #9ca3af", fontWeight: 700, textAlign: "center" as const, fontSize: "10px" },
  thLeft: { backgroundColor: "#ddd6fe", padding: "4px 8px", border: "1px solid #9ca3af", fontWeight: 700, textAlign: "left" as const, fontSize: "10px" },
  td: { padding: "3px 8px", border: "1px solid #d1d5db", textAlign: "center" as const, fontSize: "10px" },
  tdLeft: { padding: "3px 8px", border: "1px solid #d1d5db", textAlign: "left" as const, fontSize: "10px" },
  resultBand: (ok?: boolean) => ({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", margin: "10px 12px 0", border: `2px solid ${ok ? "#16a34a" : ok === false ? "#dc2626" : "#9ca3af"}`, backgroundColor: ok ? "#f0fdf4" : ok === false ? "#fef2f2" : "#f9fafb", borderRadius: "6px" }),
  statsBand: { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", margin: "8px 12px 0", borderRadius: "4px" } as React.CSSProperties,
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", textAlign: "center" as const, padding: "6px 0" } as React.CSSProperties,
  sigGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", padding: "16px 12px 8px", borderTop: "1px solid #e5e7eb", marginTop: "12px" } as React.CSSProperties,
  footer: { backgroundColor: "#d1d5db", borderTop: "2px solid #6b7280", padding: "4px 12px", display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "9px", color: "#374151" } as React.CSSProperties,
};

// ─── En-tête institutionnel ───────────────────────────────────────────────────
const EnTete: React.FC<{ titre: string; sousTitre?: string; annee: string; titleBg?: string }> = ({ titre, sousTitre, annee, titleBg = "#4f46e5" }) => (
  <div style={{ borderBottom: "2px solid #374151" }}>
    <div style={S.headerGrid}>
      <img src={logoInptic} alt="INPTIC" style={{ height: "80px", objectFit: "contain" }} />
      <div style={S.centerText}>
        <div style={{ fontWeight: 700, fontSize: "11px", color: "#1f2937" }}>REPUBLIQUE DU CONGO</div>
        <div style={{ fontSize: "10px", color: "#374151" }}>Ministère de l'Enseignement Supérieur</div>
        <div style={{ fontWeight: 700, fontSize: "11px", color: "#1f2937", marginTop: "4px" }}>Institut National de la Poste, des TIC (INPTIC)</div>
        <div style={{ fontSize: "10px", color: "#374151" }}>Licence Professionnelle ASUR</div>
        <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "3px" }}>Année Universitaire : {annee}</div>
      </div>
      <img src={logoBullAsur} alt="Bull ASUR" style={{ height: "80px", objectFit: "contain" }} />
    </div>
    <div style={S.titleBand(titleBg)}>
      <div style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em" }}>{titre}</div>
      {sousTitre && <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", marginTop: "2px" }}>{sousTitre}</div>}
    </div>
  </div>
);

// ─── Infos étudiant ───────────────────────────────────────────────────────────
const InfosEtudiant: React.FC<{ nom: string; prenom: string; matricule: string; dateNaissance?: string; lieuNaissance?: string; extra?: {label:string;value:string}[] }> = ({ nom, prenom, matricule, dateNaissance, lieuNaissance, extra }) => (
  <div style={S.infoRow}>
    <div style={S.infoCell}><span style={S.infoLabel}>Nom :</span><span style={S.infoValue}>{nom}</span></div>
    <div style={S.infoCell}><span style={S.infoLabel}>Prénom :</span><span style={S.infoValue}>{prenom}</span></div>
    <div style={S.infoCell}><span style={S.infoLabel}>Matricule :</span><span style={S.infoValue}>{matricule}</span></div>
    {dateNaissance && <div style={S.infoCell}><span style={S.infoLabel}>Date naiss. :</span><span style={S.infoValue}>{new Date(dateNaissance).toLocaleDateString("fr-FR")}</span></div>}
    {lieuNaissance && <div style={S.infoCell}><span style={S.infoLabel}>Lieu naiss. :</span><span style={S.infoValue}>{lieuNaissance}</span></div>}
    {extra?.map(({label,value}) => <div key={label} style={S.infoCell}><span style={S.infoLabel}>{label} :</span><span style={S.infoValue}>{value}</span></div>)}
  </div>
);

// ─── Tableau UE ───────────────────────────────────────────────────────────────
const TableauUE: React.FC<{ ue: UEData }> = ({ ue }) => (
  <div style={{ margin: "0 12px 10px" }}>
    <div style={S.ueHeader}>
      <span style={{ fontWeight: 700, color: "#1e1b4b", fontSize: "11px" }}>{ue.code} : {ue.libelle}</span>
      <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "10px" }}>
        <span style={{ color: "#374151" }}>Crédits : <strong>{ue.creditsAcquis}/{ue.creditsTotal}</strong></span>
        <span style={{ fontWeight: 700, color: ue.acquise ? "#15803d" : ue.moyenne !== undefined ? "#dc2626" : "#6b7280" }}>
          Moy. : {fmt(ue.moyenne)}/20
        </span>
        {ue.compense && <span style={{ color: "#d97706", fontSize: "9px" }}>(Compensée)</span>}
      </div>
    </div>
    <table style={S.table}>
      <thead>
        <tr>
          <th style={{...S.thLeft, width:"35%"}}>Matière</th>
          <th style={{...S.th, width:"7%"}}>Coef.</th>
          <th style={{...S.th, width:"8%"}}>Crédits</th>
          <th style={{...S.th, width:"10%"}}>CC</th>
          <th style={{...S.th, width:"10%"}}>Examen</th>
          <th style={{...S.th, width:"12%"}}>Rattrapage</th>
          <th style={{...S.th, width:"10%"}}>Moyenne</th>
          <th style={{...S.th, width:"8%"}}>Absences</th>
        </tr>
      </thead>
      <tbody>
        {ue.matieres.map((m, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
            <td style={S.tdLeft}>{m.libelle}</td>
            <td style={S.td}>{m.coefficient}</td>
            <td style={S.td}>{m.credits}</td>
            <td style={{...S.td, ...noteStyle(m.cc)}}>{fmt(m.cc)}</td>
            <td style={{...S.td, ...noteStyle(m.examen)}}>{fmt(m.examen)}</td>
            <td style={{...S.td, ...noteStyle(m.rattrapage)}}>{fmt(m.rattrapage)}</td>
            <td style={{...S.td, ...noteStyle(m.moyenne), fontWeight: 700}}>{fmt(m.moyenne)}</td>
            <td style={S.td}>{m.absences !== undefined ? `${m.absences}h` : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Résultat semestre ────────────────────────────────────────────────────────
const ResultatSemestre: React.FC<{ valide?: boolean; moyenne?: number; creditsAcquis: number; creditsTotal: number }> = ({ valide, moyenne, creditsAcquis, creditsTotal }) => (
  <div style={S.resultBand(valide)}>
    <div>
      <div style={{ fontWeight: 700, fontSize: "14px", color: valide ? "#15803d" : valide === false ? "#dc2626" : "#374151" }}>
        {valide === true ? "✓ SEMESTRE VALIDÉ" : valide === false ? "✗ SEMESTRE NON VALIDÉ" : "— EN ATTENTE DE CALCUL"}
      </div>
      <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>Crédits acquis : <strong>{creditsAcquis}/{creditsTotal}</strong></div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: "22px", fontWeight: 700, color: valide ? "#15803d" : valide === false ? "#dc2626" : "#6b7280" }}>{fmt(moyenne)}/20</div>
      <div style={{ fontSize: "9px", color: "#9ca3af" }}>Moyenne générale</div>
    </div>
  </div>
);

// ─── Statistiques ─────────────────────────────────────────────────────────────
const Statistiques: React.FC<{ stats: StatistiquesData }> = ({ stats }) => (
  <div style={S.statsBand}>
    <div style={{ backgroundColor: "#bfdbfe", padding: "3px 10px", fontSize: "10px", fontWeight: 700, color: "#1e3a8a", borderBottom: "1px solid #93c5fd" }}>STATISTIQUES DE PROMOTION</div>
    <div style={S.statsGrid}>
      {[["Moy. Classe", fmt(stats.moyenneClasse)], ["Note Min", fmt(stats.min)], ["Note Max", fmt(stats.max)], ["Écart-type", fmt(stats.ecartType)], ["Rang", stats.rang ? `${stats.rang}${stats.nbEtudiants ? `/${stats.nbEtudiants}` : ""}` : "—"]].map(([label, value]) => (
        <div key={label} style={{ padding: "4px 0" }}>
          <div style={{ fontSize: "9px", color: "#6b7280" }}>{label}</div>
          <div style={{ fontWeight: 700, color: "#111827", fontSize: "11px" }}>{value}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Signatures ───────────────────────────────────────────────────────────────
const Signatures: React.FC = () => (
  <div style={S.sigGrid}>
    {["Le Directeur des Études", "Le Chef de Département", "Le Directeur"].map(titre => (
      <div key={titre} style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 600, fontSize: "10px", color: "#374151" }}>{titre}</div>
        <div style={{ borderBottom: "1px solid #9ca3af", margin: "28px 8px 4px" }} />
        <div style={{ fontSize: "9px", color: "#9ca3af" }}>Signature & Cachet</div>
      </div>
    ))}
  </div>
);

// ─── Pied de page ─────────────────────────────────────────────────────────────
const PiedDePage: React.FC<{ date?: string }> = ({ date }) => (
  <div style={S.footer}>
    <span>INPTIC — LP ASUR</span>
    <span>Édité le : {date ? new Date(date).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR")}</span>
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────
export const BulletinDocument: React.FC<{ data: BulletinData }> = ({ data }) => {
  if (data.type === "semestre") {
    const d = data as BulletinSemestreData;
    return (
      <div style={S.doc}>
        <EnTete titre={`BULLETIN DE NOTES — ${d.semestre.libelle.toUpperCase()}`} sousTitre="LP ASUR — INPTIC" annee={d.semestre.anneeUniversitaire} />
        <InfosEtudiant nom={d.etudiant.nom} prenom={d.etudiant.prenom} matricule={d.etudiant.matricule} dateNaissance={d.etudiant.dateNaissance} lieuNaissance={d.etudiant.lieuNaissance} />
        <div style={{ paddingTop: "8px" }}>
          {d.ues.map(ue => <TableauUE key={ue.code} ue={ue} />)}
          <ResultatSemestre valide={d.valide} moyenne={d.moyenneSemestre} creditsAcquis={d.creditsAcquis} creditsTotal={d.creditsTotal} />
          {d.statistiques && <Statistiques stats={d.statistiques} />}
          <Signatures />
        </div>
        <PiedDePage date={d.dateEdition} />
      </div>
    );
  }

  const d = data as BulletinAnnuelData;
  return (
    <div style={S.doc}>
      <div style={{ borderBottom: "2px solid #374151" }}>
        <div style={S.headerGrid}>
          <img src={logoInptic} alt="INPTIC" style={{ height: "80px", objectFit: "contain" }} />
          <div style={S.centerText}>
            <div style={{ fontWeight: 700, fontSize: "11px", color: "#1f2937" }}>REPUBLIQUE DU CONGO</div>
            <div style={{ fontSize: "10px", color: "#374151" }}>Ministère de l'Enseignement Supérieur</div>
            <div style={{ fontWeight: 700, fontSize: "11px", color: "#1f2937", marginTop: "4px" }}>Institut National de la Poste, des TIC (INPTIC)</div>
            <div style={{ fontSize: "10px", color: "#374151" }}>Licence Professionnelle ASUR</div>
            <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "3px" }}>Année Universitaire : {d.anneeUniversitaire}</div>
          </div>
          <img src={logoBullAsur} alt="Bull ASUR" style={{ height: "80px", objectFit: "contain" }} />
        </div>
        <div style={S.titleBand("#111827")}>
          <div style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em" }}>BULLETIN ANNUEL — LP ASUR</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>INPTIC</div>
        </div>
      </div>

      <InfosEtudiant nom={d.etudiant.nom} prenom={d.etudiant.prenom} matricule={d.etudiant.matricule} dateNaissance={d.etudiant.dateNaissance} lieuNaissance={d.etudiant.lieuNaissance}
        extra={[...(d.etudiant.bacType?[{label:"Type BAC",value:d.etudiant.bacType}]:[]),...(d.etudiant.anneeBac?[{label:"Année BAC",value:String(d.etudiant.anneeBac)}]:[]),...(d.etudiant.provenance?[{label:"Provenance",value:d.etudiant.provenance}]:[])]} />

      <div style={{ padding: "10px 12px 0" }}>
        {/* Récap semestriel */}
        <div style={{ marginBottom: "10px" }}>
          <div style={{ backgroundColor: "#a5f3fc", padding: "4px 10px", fontWeight: 700, fontSize: "11px", color: "#164e63", border: "1px solid #67e8f9", borderBottom: "none" }}>RÉCAPITULATIF PAR SEMESTRE</div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{...S.thLeft, backgroundColor: "#cffafe"}}>Semestre</th>
                <th style={{...S.th, backgroundColor: "#cffafe"}}>Moyenne</th>
                <th style={{...S.th, backgroundColor: "#cffafe"}}>Crédits acquis</th>
                <th style={{...S.th, backgroundColor: "#cffafe"}}>Décision</th>
              </tr>
            </thead>
            <tbody>
              {[d.semestre5, d.semestre6].map((sem, i) => sem && (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f0fdfe" }}>
                  <td style={S.tdLeft}>{sem.libelle}</td>
                  <td style={{...S.td, ...noteStyle(sem.moyenne), fontWeight: 700}}>{fmt(sem.moyenne)}/20</td>
                  <td style={S.td}>{sem.creditsAcquis}/{sem.creditsTotal}</td>
                  <td style={{...S.td, fontWeight: 700, color: sem.valide ? "#15803d" : "#dc2626"}}>{sem.valide ? "VALIDÉ" : "NON VALIDÉ"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Décision jury */}
        <div style={{ backgroundColor: "#1f2937", color: "#fff", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div>
            <div style={{ fontSize: "9px", color: "#9ca3af" }}>DÉCISION DU JURY</div>
            <div style={{ fontWeight: 700, fontSize: "15px", marginTop: "2px" }}>{d.decisionJury ? (DECISIONS[d.decisionJury] ?? d.decisionJury) : "EN ATTENTE"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "9px", color: "#9ca3af" }}>Moyenne annuelle</div>
            <div style={{ fontWeight: 700, fontSize: "22px" }}>{fmt(d.moyenneAnnuelle)}/20</div>
            <div style={{ fontSize: "9px", color: "#9ca3af" }}>{d.creditsAcquis}/{d.creditsTotal} crédits</div>
          </div>
        </div>

        {/* Mention */}
        {d.mention && (
          <div style={{ backgroundColor: "#9ca3af", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontWeight: 700, fontSize: "12px", color: "#111827" }}>MENTION</span>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>{MENTIONS[d.mention] ?? d.mention}</span>
          </div>
        )}

        {d.statistiques && <Statistiques stats={d.statistiques} />}
        <Signatures />
      </div>
      <PiedDePage date={d.dateEdition} />
    </div>
  );
};
