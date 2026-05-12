/**
 * BulletinDocument — Composant de rendu du bulletin conforme aux modèles INPTIC
 * Utilisé pour l'affichage écran ET l'impression (classes print:)
 *
 * Structure fidèle aux modèles Ex_BulletinS5.png / Ex_BulletinS6.png / Ex_BullAnnuel.png
 */
import React from 'react';
import logoInptic from '../../assets/images/logo_inptic.png';
import logoBullAsur from '../../assets/logos/logo_bull_asur.png';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatiereData {
  libelle: string;
  coefficient: number;
  credits: number;
  cc?: number;
  examen?: number;
  rattrapage?: number;
  moyenne?: number;
  absences?: number;
}

export interface UEData {
  code: string;
  libelle: string;
  matieres: MatiereData[];
  moyenne?: number;
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
  type: 'semestre';
  etudiant: {
    nom: string;
    prenom: string;
    matricule: string;
    dateNaissance?: string;
    lieuNaissance?: string;
  };
  semestre: {
    code: string;
    libelle: string;
    anneeUniversitaire: string;
  };
  ues: UEData[];
  moyenneSemestre?: number;
  creditsTotal: number;
  creditsAcquis: number;
  valide?: boolean;
  statistiques?: StatistiquesData;
  dateEdition?: string;
}

export interface BulletinAnnuelData {
  type: 'annuel';
  etudiant: {
    nom: string;
    prenom: string;
    matricule: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    bacType?: string;
    anneeBac?: number;
    provenance?: string;
  };
  anneeUniversitaire: string;
  semestre5?: {
    libelle: string;
    moyenne?: number;
    creditsAcquis: number;
    creditsTotal: number;
    valide: boolean;
  };
  semestre6?: {
    libelle: string;
    moyenne?: number;
    creditsAcquis: number;
    creditsTotal: number;
    valide: boolean;
  };
  moyenneAnnuelle?: number;
  creditsTotal: number;
  creditsAcquis: number;
  decisionJury?: string;
  mention?: string;
  statistiques?: StatistiquesData;
  dateEdition?: string;
}

export type BulletinData = BulletinSemestreData | BulletinAnnuelData;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtNote = (n?: number) => (n !== undefined ? n.toFixed(2) : '—');

const noteClass = (n?: number) => {
  if (n === undefined) return 'text-gray-400';
  return n >= 10 ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold';
};

const DECISIONS: Record<string, string> = {
  DIPLOME: 'DIPLÔMÉ(E)',
  REPRISE_SOUTENANCE: 'REPRISE DE SOUTENANCE',
  REDOUBLE: 'REDOUBLE LA LICENCE 3',
};

const MENTIONS: Record<string, string> = {
  TRES_BIEN: 'Très Bien',
  BIEN: 'Bien',
  ASSEZ_BIEN: 'Assez Bien',
  PASSABLE: 'Passable',
};

// ─── En-tête institutionnel (commun aux deux types) ───────────────────────────

const EnTete: React.FC<{ titre: string; sousTitre?: string; annee: string }> = ({
  titre, sousTitre, annee,
}) => (
  <div className="border-b-2 border-gray-800">
    {/* 3 colonnes : Logo INPTIC | Texte institutionnel | Logo ASUR */}
    <div className="grid grid-cols-[100px_1fr_100px] items-center px-4 py-3 gap-2">
      {/* Logo INPTIC */}
      <img src={logoInptic} alt="INPTIC" className="h-20 w-auto object-contain" />

      {/* Texte central */}
      <div className="text-center">
        <p className="font-bold text-gray-800" style={{ fontSize: '11px' }}>
          REPUBLIQUE DU CONGO
        </p>
        <p className="text-gray-700" style={{ fontSize: '10px' }}>
          Ministère de l'Enseignement Supérieur
        </p>
        <p className="font-semibold text-gray-800 mt-1" style={{ fontSize: '11px' }}>
          Institut National de la Poste, des TIC (INPTIC)
        </p>
        <p className="text-gray-700" style={{ fontSize: '10px' }}>
          Licence Professionnelle ASUR
        </p>
        <p className="text-gray-600 mt-1" style={{ fontSize: '10px' }}>
          Année Universitaire : {annee}
        </p>
      </div>

      {/* Logo Bull ASUR */}
      <img src={logoBullAsur} alt="Bull ASUR" className="h-20 w-auto object-contain" />
    </div>

    {/* Bande titre */}
    <div className="bg-indigo-500 text-white text-center py-2 border-t-2 border-b-2 border-gray-700">
      <p className="font-bold tracking-wide" style={{ fontSize: '14px' }}>{titre}</p>
      {sousTitre && (
        <p className="text-indigo-200 mt-0.5" style={{ fontSize: '11px' }}>{sousTitre}</p>
      )}
    </div>
  </div>
);

// ─── Infos étudiant ───────────────────────────────────────────────────────────

const InfosEtudiant: React.FC<{
  nom: string; prenom: string; matricule: string;
  dateNaissance?: string; lieuNaissance?: string;
  extra?: { label: string; value: string }[];
}> = ({ nom, prenom, matricule, dateNaissance, lieuNaissance, extra }) => (
  <div className="bg-purple-100 border-b border-gray-300 px-4 py-2">
    <div className="grid grid-cols-2 gap-x-8 gap-y-1" style={{ fontSize: '11px' }}>
      <div className="flex gap-2">
        <span className="text-gray-600 w-24 flex-shrink-0">Nom :</span>
        <span className="font-semibold text-gray-900">{nom}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-gray-600 w-24 flex-shrink-0">Prénom :</span>
        <span className="font-semibold text-gray-900">{prenom}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-gray-600 w-24 flex-shrink-0">Matricule :</span>
        <span className="font-semibold text-gray-900">{matricule}</span>
      </div>
      {dateNaissance && (
        <div className="flex gap-2">
          <span className="text-gray-600 w-24 flex-shrink-0">Date naiss. :</span>
          <span className="font-semibold text-gray-900">
            {new Date(dateNaissance).toLocaleDateString('fr-FR')}
          </span>
        </div>
      )}
      {lieuNaissance && (
        <div className="flex gap-2">
          <span className="text-gray-600 w-24 flex-shrink-0">Lieu naiss. :</span>
          <span className="font-semibold text-gray-900">{lieuNaissance}</span>
        </div>
      )}
      {extra?.map(({ label, value }) => (
        <div key={label} className="flex gap-2">
          <span className="text-gray-600 w-24 flex-shrink-0">{label} :</span>
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Tableau des notes d'une UE ───────────────────────────────────────────────

const TableauUE: React.FC<{ ue: UEData }> = ({ ue }) => (
  <div className="mb-3">
    {/* En-tête UE */}
    <div className="bg-purple-200 border border-gray-400 flex items-center justify-between px-3 py-1.5">
      <span className="font-bold text-gray-900" style={{ fontSize: '11px' }}>
        {ue.code} : {ue.libelle}
      </span>
      <div className="flex items-center gap-4" style={{ fontSize: '11px' }}>
        <span className="text-gray-700">
          Crédits : <strong>{ue.creditsAcquis}/{ue.creditsTotal}</strong>
        </span>
        <span className={`font-bold ${ue.acquise ? 'text-green-700' : 'text-red-600'}`}>
          Moy. : {fmtNote(ue.moyenne)}/20
        </span>
        {ue.compense && (
          <span className="text-amber-700 text-xs">(Compensée)</span>
        )}
      </div>
    </div>

    {/* Tableau matières */}
    <table className="w-full border-collapse border border-gray-400" style={{ fontSize: '10px' }}>
      <thead>
        <tr className="bg-purple-100">
          <th className="border border-gray-400 px-2 py-1 text-left font-semibold text-gray-800">
            Matière
          </th>
          <th className="border border-gray-400 px-2 py-1 text-center font-semibold text-gray-800 w-12">
            Coef.
          </th>
          <th className="border border-gray-400 px-2 py-1 text-center font-semibold text-gray-800 w-14">
            Crédits
          </th>
          <th className="border border-gray-400 px-2 py-1 text-center font-semibold text-gray-800 w-14">
            CC
          </th>
          <th className="border border-gray-400 px-2 py-1 text-center font-semibold text-gray-800 w-16">
            Examen
          </th>
          <th className="border border-gray-400 px-2 py-1 text-center font-semibold text-gray-800 w-18">
            Rattrapage
          </th>
          <th className="border border-gray-400 px-2 py-1 text-center font-semibold text-gray-800 w-16">
            Moyenne
          </th>
          <th className="border border-gray-400 px-2 py-1 text-center font-semibold text-gray-800 w-16">
            Absences
          </th>
        </tr>
      </thead>
      <tbody>
        {ue.matieres.map((m, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="border border-gray-300 px-2 py-1 text-gray-900">{m.libelle}</td>
            <td className="border border-gray-300 px-2 py-1 text-center text-gray-700">{m.coefficient}</td>
            <td className="border border-gray-300 px-2 py-1 text-center text-gray-700">{m.credits}</td>
            <td className={`border border-gray-300 px-2 py-1 text-center ${noteClass(m.cc)}`}>
              {fmtNote(m.cc)}
            </td>
            <td className={`border border-gray-300 px-2 py-1 text-center ${noteClass(m.examen)}`}>
              {fmtNote(m.examen)}
            </td>
            <td className={`border border-gray-300 px-2 py-1 text-center ${noteClass(m.rattrapage)}`}>
              {fmtNote(m.rattrapage)}
            </td>
            <td className={`border border-gray-300 px-2 py-1 text-center font-bold ${noteClass(m.moyenne)}`}>
              {fmtNote(m.moyenne)}
            </td>
            <td className="border border-gray-300 px-2 py-1 text-center text-gray-600">
              {m.absences !== undefined ? `${m.absences}h` : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Statistiques ─────────────────────────────────────────────────────────────

const Statistiques: React.FC<{ stats: StatistiquesData }> = ({ stats }) => (
  <div className="bg-blue-50 border border-gray-300 mt-3 mb-3">
    <div className="bg-blue-200 px-3 py-1 border-b border-gray-300">
      <span className="font-semibold text-gray-800" style={{ fontSize: '10px' }}>
        STATISTIQUES DE PROMOTION
      </span>
    </div>
    <div className="grid grid-cols-5 divide-x divide-gray-300" style={{ fontSize: '10px' }}>
      {[
        { label: 'Moy. Classe', value: fmtNote(stats.moyenneClasse) },
        { label: 'Note Min', value: fmtNote(stats.min) },
        { label: 'Note Max', value: fmtNote(stats.max) },
        { label: 'Écart-type', value: fmtNote(stats.ecartType) },
        { label: 'Rang', value: stats.rang ? `${stats.rang}${stats.nbEtudiants ? `/${stats.nbEtudiants}` : ''}` : '—' },
      ].map(({ label, value }) => (
        <div key={label} className="text-center py-2 px-2">
          <p className="text-gray-500">{label}</p>
          <p className="font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Résultat semestre ────────────────────────────────────────────────────────

const ResultatSemestre: React.FC<{
  valide?: boolean;
  moyenne?: number;
  creditsAcquis: number;
  creditsTotal: number;
}> = ({ valide, moyenne, creditsAcquis, creditsTotal }) => (
  <div className={`border-2 px-4 py-3 mt-3 flex items-center justify-between ${
    valide ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
  }`} style={{ fontSize: '12px' }}>
    <div>
      <p className={`font-bold text-lg ${valide ? 'text-green-800' : 'text-red-800'}`}>
        {valide ? '✓ SEMESTRE VALIDÉ' : '✗ SEMESTRE NON VALIDÉ'}
      </p>
      <p className="text-gray-600 mt-0.5">
        Crédits acquis : <strong>{creditsAcquis}/{creditsTotal}</strong>
      </p>
    </div>
    <div className="text-right">
      <p className={`font-bold ${valide ? 'text-green-700' : 'text-red-700'}`}
        style={{ fontSize: '22px' }}>
        {fmtNote(moyenne)}/20
      </p>
      <p className="text-gray-500" style={{ fontSize: '10px' }}>Moyenne générale</p>
    </div>
  </div>
);

// ─── Signatures ───────────────────────────────────────────────────────────────

const Signatures: React.FC = () => (
  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-300 pt-4"
    style={{ fontSize: '10px' }}>
    {['Le Directeur des Études', 'Le Chef de Département', 'Le Directeur'].map((titre) => (
      <div key={titre} className="text-center">
        <p className="font-semibold text-gray-700">{titre}</p>
        <div className="mt-8 border-b border-gray-400 mx-4" />
        <p className="text-gray-500 mt-1">Signature & Cachet</p>
      </div>
    ))}
  </div>
);

// ─── Pied de page ─────────────────────────────────────────────────────────────

const PiedDePage: React.FC<{ date?: string }> = ({ date }) => (
  <div className="bg-gray-300 border-t-2 border-gray-600 px-4 py-1.5 flex justify-between mt-4"
    style={{ fontSize: '9px' }}>
    <span className="text-gray-700">INPTIC — LP ASUR</span>
    <span className="text-gray-700">
      Édité le : {date ? new Date(date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
    </span>
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────

export const BulletinDocument: React.FC<{ data: BulletinData }> = ({ data }) => {

  // ── Bulletin Semestre ──
  if (data.type === 'semestre') {
    const d = data as BulletinSemestreData;
    return (
      <div className="bg-white border-2 border-gray-800 w-full max-w-4xl mx-auto print:border-2 print:shadow-none">
        <EnTete
          titre={`BULLETIN DE NOTES — ${d.semestre.libelle.toUpperCase()}`}
          sousTitre="LP ASUR — INPTIC"
          annee={d.semestre.anneeUniversitaire}
        />

        <InfosEtudiant
          nom={d.etudiant.nom}
          prenom={d.etudiant.prenom}
          matricule={d.etudiant.matricule}
          dateNaissance={d.etudiant.dateNaissance}
          lieuNaissance={d.etudiant.lieuNaissance}
        />

        <div className="px-4 pt-3">
          {d.ues.map((ue) => (
            <TableauUE key={ue.code} ue={ue} />
          ))}

          <ResultatSemestre
            valide={d.valide}
            moyenne={d.moyenneSemestre}
            creditsAcquis={d.creditsAcquis}
            creditsTotal={d.creditsTotal}
          />

          {d.statistiques && <Statistiques stats={d.statistiques} />}

          <Signatures />
        </div>

        <PiedDePage date={d.dateEdition} />
      </div>
    );
  }

  // ── Bulletin Annuel ──
  const d = data as BulletinAnnuelData;
  return (
    <div className="bg-white border-2 border-gray-800 w-full max-w-4xl mx-auto print:border-2 print:shadow-none">
      {/* En-tête avec titre noir */}
      <div className="border-b-2 border-gray-800">
        <div className="grid grid-cols-[100px_1fr_100px] items-center px-4 py-3 gap-2">
          <img src={logoInptic} alt="INPTIC" className="h-20 w-auto object-contain" />
          <div className="text-center">
            <p className="font-bold text-gray-800" style={{ fontSize: '11px' }}>
              REPUBLIQUE DU CONGO
            </p>
            <p className="text-gray-700" style={{ fontSize: '10px' }}>
              Ministère de l'Enseignement Supérieur
            </p>
            <p className="font-semibold text-gray-800 mt-1" style={{ fontSize: '11px' }}>
              Institut National de la Poste, des TIC (INPTIC)
            </p>
            <p className="text-gray-700" style={{ fontSize: '10px' }}>
              Licence Professionnelle ASUR
            </p>
            <p className="text-gray-600 mt-1" style={{ fontSize: '10px' }}>
              Année Universitaire : {d.anneeUniversitaire}
            </p>
          </div>
          <img src={logoBullAsur} alt="Bull ASUR" className="h-20 w-auto object-contain" />
        </div>
        {/* Titre noir pour bulletin annuel */}
        <div className="bg-gray-900 text-white text-center py-2 border-t-2 border-b-2 border-gray-700">
          <p className="font-bold tracking-wide" style={{ fontSize: '14px' }}>
            BULLETIN ANNUEL — LP ASUR
          </p>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: '11px' }}>INPTIC</p>
        </div>
      </div>

      <InfosEtudiant
        nom={d.etudiant.nom}
        prenom={d.etudiant.prenom}
        matricule={d.etudiant.matricule}
        dateNaissance={d.etudiant.dateNaissance}
        lieuNaissance={d.etudiant.lieuNaissance}
        extra={[
          ...(d.etudiant.bacType ? [{ label: 'Type BAC', value: d.etudiant.bacType }] : []),
          ...(d.etudiant.anneeBac ? [{ label: 'Année BAC', value: String(d.etudiant.anneeBac) }] : []),
          ...(d.etudiant.provenance ? [{ label: 'Provenance', value: d.etudiant.provenance }] : []),
        ]}
      />

      <div className="px-4 pt-3">
        {/* Tableau récapitulatif semestriel */}
        <div className="mb-4">
          <div className="bg-cyan-200 border border-gray-400 px-3 py-1.5 border-b-0">
            <span className="font-bold text-gray-800" style={{ fontSize: '11px' }}>
              RÉCAPITULATIF PAR SEMESTRE
            </span>
          </div>
          <table className="w-full border-collapse border border-gray-400" style={{ fontSize: '11px' }}>
            <thead>
              <tr className="bg-cyan-100">
                <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-800">
                  Semestre
                </th>
                <th className="border border-gray-400 px-3 py-2 text-center font-semibold text-gray-800">
                  Moyenne
                </th>
                <th className="border border-gray-400 px-3 py-2 text-center font-semibold text-gray-800">
                  Crédits acquis
                </th>
                <th className="border border-gray-400 px-3 py-2 text-center font-semibold text-gray-800">
                  Décision
                </th>
              </tr>
            </thead>
            <tbody>
              {[d.semestre5, d.semestre6].map((sem, i) => sem && (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 font-medium text-gray-900">
                    {sem.libelle}
                  </td>
                  <td className={`border border-gray-300 px-3 py-2 text-center font-bold ${
                    sem.valide ? 'text-green-700' : 'text-red-600'
                  }`}>
                    {fmtNote(sem.moyenne)}/20
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-700">
                    {sem.creditsAcquis}/{sem.creditsTotal}
                  </td>
                  <td className={`border border-gray-300 px-3 py-2 text-center font-semibold ${
                    sem.valide ? 'text-green-700' : 'text-red-600'
                  }`}>
                    {sem.valide ? 'VALIDÉ' : 'NON VALIDÉ'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Décision du jury */}
        <div className="bg-gray-800 text-white px-4 py-3 mb-3 flex items-center justify-between">
          <div>
            <p className="text-gray-400" style={{ fontSize: '10px' }}>DÉCISION DU JURY</p>
            <p className="font-bold mt-0.5" style={{ fontSize: '16px' }}>
              {d.decisionJury ? (DECISIONS[d.decisionJury] ?? d.decisionJury) : 'EN ATTENTE'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400" style={{ fontSize: '10px' }}>Moyenne annuelle</p>
            <p className="font-bold text-white" style={{ fontSize: '22px' }}>
              {fmtNote(d.moyenneAnnuelle)}/20
            </p>
            <p className="text-gray-400" style={{ fontSize: '10px' }}>
              {d.creditsAcquis}/{d.creditsTotal} crédits
            </p>
          </div>
        </div>

        {/* Mention */}
        {d.mention && (
          <div className="bg-gray-400 px-4 py-2 mb-3 flex items-center justify-between">
            <span className="font-semibold text-gray-900" style={{ fontSize: '12px' }}>
              MENTION
            </span>
            <span className="font-bold text-gray-900" style={{ fontSize: '14px' }}>
              {MENTIONS[d.mention] ?? d.mention}
            </span>
          </div>
        )}

        {d.statistiques && <Statistiques stats={d.statistiques} />}

        <Signatures />
      </div>

      <PiedDePage date={d.dateEdition} />
    </div>
  );
};
