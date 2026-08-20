/**
 * Utilitaires d'import/export Excel pour les étudiants.
 * Modèle de référence : assets/images/DAR_A.xlsx
 *
 * Colonnes obligatoires (inscription en masse) :
 *   - Nom (s)
 *   - Prénom (s)
 *   - Date et Lieu de naissance
 *   - Sexe
 *
 * Les autres champs du modèle Etudiant (email, matricule, bac, provenance…)
 * sont facultatifs à la création et peuvent être complétés via la mise à jour (CRUD).
 */
import * as XLSX from 'xlsx';

/** Colonnes du fichier Excel DAR_A (ligne d'en-tête institutionnelle incluse). */
export const EXCEL_ETUDIANT_COLUMNS = [
  'N°',
  'Nom (s)',
  'Prénom (s)',
  'Date et Lieu de naissance',
  'Sexe',
] as const;

export const EXCEL_REQUIRED_FIELDS = [
  'nom',
  'prenom',
  'dateLieuRaw',
  'sexeRaw',
] as const;

export type ExcelEtudiantRow = {
  rowNumber: number;
  nom: string;
  prenom: string;
  dateLieuRaw: string;
  sexeRaw: string;
};

export type ExcelImportValidationError = {
  rowNumber: number;
  message: string;
};

export type ExcelImportResult = {
  validRows: ExcelEtudiantRow[];
  errors: ExcelImportValidationError[];
};

export type CreateEtudiantFromExcelPayload = {
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  sexe?: string;
  matricule?: string;
  email?: string;
  password?: string;
  bac_type?: string;
  annee_bac?: number;
  provenance?: string;
  statut?: string;
  classeId?: string | null;
};

export type InstitutionalExportOptions = {
  classeNom?: string;
  classeCode?: string;
  anneeUniversitaire?: string;
  includeClasseColumn?: boolean;
};

const HEADER_SCAN_LIMIT = 25;

/** Extraction flexible d'une valeur depuis une ligne Excel (mode objet). */
export const getRowValue = (row: Record<string, unknown>, patterns: string[]): string | undefined => {
  const keys = Object.keys(row);
  for (const pat of patterns) {
    const matchedKey = keys.find(
      (k) =>
        k.trim().toLowerCase() === pat.toLowerCase() ||
        k.trim().toLowerCase().replace(/[^a-z0-9]/g, '').includes(pat.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      const val = String(row[matchedKey]).trim();
      if (val !== '') return val;
    }
  }
  return undefined;
};

/** Parse le champ combiné « Date et Lieu de naissance » (ex. « 18/04/2007 à Libreville »). */
export const parseDateAndLieu = (raw: string | undefined): { dateISO: string; lieu: string; hasDate: boolean } => {
  if (!raw || raw.trim() === '') {
    return { dateISO: '', lieu: '-', hasDate: false };
  }

  let str = raw.trim();
  let lieu = '-';
  let dateStr = str;

  const splitMatch = str.split(/\s+[àaÀ]\s+/);
  if (splitMatch.length >= 2) {
    dateStr = splitMatch[0].trim();
    lieu = splitMatch.slice(1).join(' ').trim() || '-';
  }

  let dateISO = '';
  let hasDate = false;

  const numVal = Number(dateStr);
  if (!isNaN(numVal) && numVal > 10000 && numVal < 100000) {
    const d = new Date(Math.round((numVal - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) {
      dateISO = d.toISOString();
      hasDate = true;
    }
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        dateISO = d.toISOString();
        hasDate = true;
      }
    }
  } else if (dateStr.includes('-')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      dateISO = d.toISOString();
      hasDate = true;
    }
  }

  return { dateISO, lieu: lieu || '-', hasDate };
};

/** Valide qu'une ligne Excel contient tous les champs obligatoires du modèle DAR_A. */
export const validateExcelRow = (row: ExcelEtudiantRow): string | null => {
  if (!row.nom.trim()) return 'Nom (s) manquant';
  if (!row.prenom.trim()) return 'Prénom (s) manquant';
  if (!row.dateLieuRaw.trim()) return 'Date et Lieu de naissance manquant';
  const { hasDate } = parseDateAndLieu(row.dateLieuRaw);
  if (!hasDate) return 'Date de naissance invalide ou manquante';
  if (!row.sexeRaw.trim()) return 'Sexe manquant';
  return null;
};

/** Génère un matricule provisoire à partir du nom. */
export const generateMatricule = (nom: string, index: number, year = new Date().getFullYear()): string => {
  const cleanNom = nom.replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 4) || 'ETU';
  return `${year}${cleanNom}${String(100 + index).padStart(3, '0')}`;
};

/** Génère un email provisoire à partir du nom et prénom. */
export const generateEmail = (nom: string, prenom: string, index: number): string => {
  const cleanNom = nom.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPrenom = prenom.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanNom}.${cleanPrenom}.${index + 1}@inptic.ga`;
};

/** Construit le payload API à partir d'une ligne Excel validée. */
export const buildCreatePayloadFromExcelRow = (
  row: ExcelEtudiantRow,
  index: number,
  options?: { classeId?: string | null }
): CreateEtudiantFromExcelPayload => {
  const { dateISO, lieu } = parseDateAndLieu(row.dateLieuRaw);
  return {
    nom: row.nom.trim(),
    prenom: row.prenom.trim(),
    date_naissance: dateISO,
    lieu_naissance: lieu,
    sexe: row.sexeRaw.trim(),
    matricule: generateMatricule(row.nom, index),
    email: generateEmail(row.nom, row.prenom, index),
    password: 'pass1234',
    statut: 'INSCRIT',
    classeId: options?.classeId ?? null,
  };
};

type HeaderIndices = {
  headerRowIndex: number;
  nomIdx: number;
  prenomIdx: number;
  dateLieuIdx: number;
  sexeIdx: number;
};

const findHeaderIndices = (rows2D: unknown[][]): HeaderIndices => {
  let headerRowIndex = -1;
  let nomIdx = -1;
  let prenomIdx = -1;
  let dateLieuIdx = -1;
  let sexeIdx = -1;

  for (let r = 0; r < Math.min(rows2D.length, HEADER_SCAN_LIMIT); r++) {
    const row = rows2D[r];
    if (!Array.isArray(row)) continue;

    for (let c = 0; c < row.length; c++) {
      const cellVal = String(row[c] || '').trim().toLowerCase();
      if (cellVal.includes('nom') && nomIdx === -1) nomIdx = c;
      else if ((cellVal.includes('prénom') || cellVal.includes('prenom')) && prenomIdx === -1) prenomIdx = c;
      else if ((cellVal.includes('date') || cellVal.includes('naissance')) && dateLieuIdx === -1) dateLieuIdx = c;
      else if ((cellVal.includes('sexe') || cellVal.includes('sex')) && sexeIdx === -1) sexeIdx = c;
    }

    if (nomIdx !== -1 || prenomIdx !== -1) {
      headerRowIndex = r;
      break;
    }
  }

  return { headerRowIndex, nomIdx, prenomIdx, dateLieuIdx, sexeIdx };
};

/** Extrait et valide les lignes étudiants depuis une feuille Excel. */
export const extractStudentsFromWorksheet = (ws: XLSX.WorkSheet): ExcelImportResult => {
  const rows2D: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (!rows2D || rows2D.length === 0) {
    throw new Error('Le fichier Excel est vide.');
  }

  const { headerRowIndex, nomIdx, prenomIdx, dateLieuIdx, sexeIdx } = findHeaderIndices(rows2D);
  const rawRows: ExcelEtudiantRow[] = [];

  if (headerRowIndex !== -1) {
    for (let r = headerRowIndex + 1; r < rows2D.length; r++) {
      const row = rows2D[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      const nom = nomIdx !== -1 ? String(row[nomIdx] || '').trim() : '';
      const prenom = prenomIdx !== -1 ? String(row[prenomIdx] || '').trim() : '';
      const dateLieuRaw = dateLieuIdx !== -1 ? String(row[dateLieuIdx] || '').trim() : '';
      const sexeRaw = sexeIdx !== -1 ? String(row[sexeIdx] || '').trim() : '';

      if (nom || prenom) {
        rawRows.push({ rowNumber: r + 1, nom, prenom, dateLieuRaw, sexeRaw });
      }
    }
  } else {
    const dataObjects = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
    dataObjects.forEach((row, i) => {
      const nom = getRowValue(row, ['Nom (s)', 'Nom(s)', 'Noms(s)', 'Noms', 'Nom']) || '';
      const prenom = getRowValue(row, ['Prénom (s)', 'Prénom(s)', 'Prénoms', 'Prénom', 'Prenom']) || '';
      const dateLieuRaw =
        getRowValue(row, ['Date et Lieu de naissance', 'Date et lieu de naissance', 'Date de naissance']) || '';
      const sexeRaw = getRowValue(row, ['Sexe', 'Sex', 'Genre']) || '';

      if (nom || prenom) {
        rawRows.push({ rowNumber: i + 2, nom, prenom, dateLieuRaw, sexeRaw });
      }
    });
  }

  const validRows: ExcelEtudiantRow[] = [];
  const errors: ExcelImportValidationError[] = [];

  for (const row of rawRows) {
    const err = validateExcelRow(row);
    if (err) {
      errors.push({ rowNumber: row.rowNumber, message: err });
    } else {
      validRows.push(row);
    }
  }

  return { validRows, errors };
};

/** Exporte la liste au format institutionnel DAR_A. */
export const exportEtudiantsToInstitutionalExcel = (
  etudiants: Array<{
    prenom?: string;
    date_naissance?: string;
    lieu_naissance?: string;
    sexe?: string;
    utilisateur?: { nom?: string };
    classe?: { nom?: string; code?: string };
  }>,
  options: InstitutionalExportOptions = {}
): void => {
  const aoa: unknown[][] = [];

  for (let i = 0; i < 7; i++) aoa.push(['']);
  aoa.push(['DIRECTION GENERALE']);
  aoa.push(['DIRECTION DE LA SCOLARITE ET DES EXAMENS']);
  aoa.push(['SERVICE SCOLARITE']);
  aoa.push(['']);
  aoa.push([options.classeNom || 'Classe INPTIC']);
  aoa.push(['Formation Initiale 1']);
  aoa.push([`Année académique ${options.anneeUniversitaire || '2025-2026'}`]);
  aoa.push(['']);

  const headers = [...EXCEL_ETUDIANT_COLUMNS];
  if (options.includeClasseColumn) headers.push('Classe');
  aoa.push(headers);

  if (etudiants.length > 0) {
    etudiants.forEach((e, index) => {
      const dateFr = e.date_naissance ? new Date(e.date_naissance).toLocaleDateString('fr-FR') : '';
      const lieuStr = e.lieu_naissance && e.lieu_naissance !== '-' ? ` à ${e.lieu_naissance}` : '';
      const dateEtLieu = dateFr ? `${dateFr}${lieuStr}` : '';
      const sexe = e.sexe === 'F' || e.sexe === 'Féminin' ? 'Féminin' : 'Masculin';
      const row: unknown[] = [index + 1, e.utilisateur?.nom || '', e.prenom || '', dateEtLieu, sexe];
      if (options.includeClasseColumn) {
        row.push(e.classe?.nom || e.classe?.code || '');
      }
      aoa.push(row);
    });
  } else {
    const sampleRows: unknown[][] = [
      [1, "AB'AA", 'Emmanuel Schekina', '18/04/2007 à Libreville', 'Masculin'],
      [2, 'AMOUSSA MOMBO', 'Farhane-Dine', '29/10/2001 à Libreville', 'Masculin'],
      [3, 'APINDA', 'Christ-Emmanuel-Keren', '25/09/2003 à Okondja', 'Masculin'],
      [4, 'BAKONOU MOUTSINGA', 'Melissa-Chancelia', '29/07/2004 à Gamba', 'Féminin'],
      [5, 'BAYANI LIYOKO', 'Jen-stone Ezechiel', '29/07/2005 à Libreville', 'Masculin'],
    ];
    sampleRows.forEach((r) => {
      if (options.includeClasseColumn) r.push(options.classeCode || 'RT1');
      aoa.push(r);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const colWidths = [
    { wch: 6 },
    { wch: 28 },
    { wch: 28 },
    { wch: 32 },
    { wch: 12 },
  ];
  if (options.includeClasseColumn) colWidths.push({ wch: 20 });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Etudiants');
  const filename = options.includeClasseColumn
    ? `Inscription_Etudiants_Tous.xlsx`
    : `Inscription_${options.classeCode || 'Etudiants'}.xlsx`;
  XLSX.writeFile(wb, filename);
};
