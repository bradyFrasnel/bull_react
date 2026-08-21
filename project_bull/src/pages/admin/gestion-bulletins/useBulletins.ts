import { useState, useEffect, useRef } from 'react';
import { etudiantService, semestreService, calculService } from '../../../services';
import { api } from '../../../services/api';
import { bulletinService } from '../../../services/bulletin.service';
import { statistiquesService } from '../../../services/results.service';
import { importExportService } from '../../../services/bulletin.service';
import { BulletinData, BulletinSemestreData, BulletinAnnuelData, UEData } from '../../../components/BulletinDocument';
import { Etudiant, Semestre } from '../../../types';
import { Mode, BulletinType, PromotionRow, RecapRow, StatsData } from './types';
import toast from 'react-hot-toast';

export const useBulletins = () => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<any[]>([]);
  const [mode, setMode] = useState<Mode>('accueil');
  const [bulletinType, setBulletinType] = useState<BulletinType>('semestre');
  const [selectedSemestreId, setSelectedSemestreId] = useState('');
  const [selectedFiliereId, setSelectedFiliereId] = useState('');
  const [selectedClasseId, setSelectedClasseId] = useState('');
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [bulletinData, setBulletinData] = useState<BulletinData | null>(null);
  const [promotionRows, setPromotionRows] = useState<PromotionRow[]>([]);
  const [recapRows, setRecapRows] = useState<RecapRow[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBulletin, setLoadingBulletin] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [loadingRecap, setLoadingRecap] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelGenerationRef = useRef<boolean>(false);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [e, s, c, f] = await Promise.all([
        etudiantService.getAll().then(data => data.sort((a: any, b: any) => (a.utilisateur?.nom || '').localeCompare(b.utilisateur?.nom || ''))),
        semestreService.getAll(),
        api.get('/classes').then(r => r.data.sort((a: any, b: any) => (a.nom || '').localeCompare(b.nom || ''))).catch(() => []),
        api.get('/filieres').then(r => r.data.sort((a: any, b: any) => (a.nom || '').localeCompare(b.nom || ''))).catch(() => [])
      ]);
      setEtudiants(e); setSemestres(s); setClasses(c); setFilieres(f);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };


  const buildSemestreData = async (etudiant: Etudiant, semestreId: string): Promise<BulletinSemestreData> => {
    const semestre = semestres.find(s => s.id === semestreId);
    try {
      const raw = await bulletinService.getBulletinSemestre(etudiant.id, semestreId);
      if (raw?.ues) return {
        type: 'semestre',
        etudiant: {
          nom: raw.etudiant?.nom ?? etudiant.utilisateur?.nom ?? '',
          prenom: raw.etudiant?.prenom ?? etudiant.prenom,
          matricule: raw.etudiant?.matricule ?? etudiant.matricule,
          dateNaissance: raw.etudiant?.dateNaissance ?? etudiant.date_naissance,
          lieuNaissance: raw.etudiant?.lieuNaissance ?? etudiant.lieu_naissance,
        },
        semestre: {
          code: raw.semestre?.code ?? semestre?.code ?? '',
          libelle: raw.semestre?.libelle ?? semestre?.libelle ?? '',
          anneeUniversitaire: raw.semestre?.anneeUniversitaire ?? semestre?.anneeUniversitaire ?? '',
        },
        ues: raw.ues.map((ue: any): UEData => ({
          code: ue.code, libelle: ue.libelle,
          matieres: (ue.matieres || []).map((m: any) => ({
            libelle: m.libelle, coefficient: m.coefficient, credits: m.credits,
            cc: m.noteCC, examen: m.noteExamen, rattrapage: m.noteRattrapage,
            moyenne: m.moyenne, absences: m.absences,
          })),
          moyenne: ue.moyenne, creditsTotal: ue.creditsTotal,
          creditsAcquis: ue.creditsAcquis ?? 0, acquise: ue.acquise ?? false,
          compense: ue.compensee ?? false,
        })),
        moyenneSemestre: raw.resultat?.moyenneSemestre,
        rangSemestre: raw.resultat?.rang,
        creditsTotal: raw.resultat?.creditsTotal ?? 30,
        creditsAcquis: raw.resultat?.creditsAcquis ?? 0,
        valide: raw.resultat?.valide,
        statistiques: raw.statistiques ? {
          moyenneClasse: raw.statistiques.moyenneClasse,
          min: raw.statistiques.noteMin, max: raw.statistiques.noteMax,
          ecartType: raw.statistiques.ecartType, nbEtudiants: raw.statistiques.nbEtudiants,
        } : undefined,
      };
    } catch { /* fallback */ }
    return {
      type: 'semestre',
      etudiant: { nom: etudiant.utilisateur?.nom ?? '', prenom: etudiant.prenom, matricule: etudiant.matricule },
      semestre: { code: semestre?.code ?? '', libelle: semestre?.libelle ?? '', anneeUniversitaire: semestre?.anneeUniversitaire ?? '' },
      ues: [], creditsTotal: 30, creditsAcquis: 0,
    };
  };

  const buildAnnuelData = async (etudiant: Etudiant): Promise<BulletinAnnuelData> => {
    try {
      const raw = await bulletinService.getBulletinAnnuel(etudiant.id);
      if (raw) return {
        type: 'annuel',
        etudiant: {
          nom: raw.etudiant?.nom ?? etudiant.utilisateur?.nom ?? '',
          prenom: raw.etudiant?.prenom ?? etudiant.prenom,
          matricule: raw.etudiant?.matricule ?? etudiant.matricule,
          dateNaissance: raw.etudiant?.dateNaissance ?? etudiant.date_naissance,
          lieuNaissance: raw.etudiant?.lieuNaissance ?? etudiant.lieu_naissance,
          bacType: etudiant.bac_type, anneeBac: etudiant.annee_bac, provenance: etudiant.provenance,
        },
        anneeUniversitaire: raw.anneeUniversitaire ?? '',
        semestre5: raw.semestre5, semestre6: raw.semestre6,
        moyenneAnnuelle: raw.moyenneAnnuelle,
        creditsTotal: raw.creditsTotal ?? 60, creditsAcquis: raw.creditsAcquis ?? 0,
        decisionJury: raw.decisionJury, mention: raw.mention,
        rangAnnuel: raw.rangAnnuel,
        statistiques: raw.statistiques,
      };
    } catch { /* pas de données */ }
    throw new Error('Bulletin annuel non disponible');
  };

  const handleGenererTous = async () => {
    if (!selectedSemestreId && bulletinType === 'semestre') { toast.error('Sélectionnez un semestre'); return; }

    let etudiantsToGenerate = [...etudiants];
    if (selectedClasseId) {
      etudiantsToGenerate = etudiantsToGenerate.filter(e => e.classeId === selectedClasseId);
    } else if (selectedFiliereId) {
      const classesOfFiliere = classes.filter(c => c.filiereId === selectedFiliereId).map(c => c.id);
      etudiantsToGenerate = etudiantsToGenerate.filter(e => e.classeId && classesOfFiliere.includes(e.classeId));
    }

    if (etudiantsToGenerate.length === 0) { toast.error('Aucun étudiant trouvé pour ces critères'); return; }

    setGeneratingAll(true);
    cancelGenerationRef.current = false;

    const rows: PromotionRow[] = etudiantsToGenerate.map(e => ({ etudiant: e, status: 'loading' }));
    setPromotionRows(rows); setMode('promotion');

    for (let i = 0; i < etudiantsToGenerate.length; i++) {
      if (cancelGenerationRef.current) {
        setPromotionRows(prev => prev.map((r, idx) => idx >= i ? { ...r, status: 'error', error: 'Annulé' } : r));
        break;
      }
      try {
        const data = bulletinType === 'semestre'
          ? await buildSemestreData(etudiantsToGenerate[i], selectedSemestreId)
          : await buildAnnuelData(etudiantsToGenerate[i]);
        setPromotionRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'done', data } : r));
      } catch {
        setPromotionRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', error: 'Données manquantes' } : r));
      }
    }
    setGeneratingAll(false);
  };

  const handleStopGeneration = () => { cancelGenerationRef.current = true; };

  const handleArchiver = async () => {
    const doneCount = promotionRows.filter(r => r.status === 'done').length;
    if (!window.confirm(`Archiver les ${doneCount} bulletins générés ?`)) return;
    try {
      setLoading(true);
      const generatedRows = promotionRows.filter(r => r.status === 'done' && r.data);
      let archivedCount = 0;
      for (const row of generatedRows) {
        await api.post('/bulletins/archives', {
          utilisateurId: row.etudiant.id,
          semestreId: bulletinType === 'semestre' ? selectedSemestreId : undefined,
          type: bulletinType, donneesJson: row.data,
        });
        archivedCount++;
      }
      toast.success(`${archivedCount} bulletins archivés avec succès.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'archivage.");
    } finally { setLoading(false); }
  };

  const handleGenererIndividuel = async () => {
    if (!selectedEtudiant) return;
    if (bulletinType === 'semestre' && !selectedSemestreId) { toast.error('Sélectionnez un semestre'); return; }
    try {
      setLoadingBulletin(true); setBulletinData(null);
      const data = bulletinType === 'semestre'
        ? await buildSemestreData(selectedEtudiant, selectedSemestreId)
        : await buildAnnuelData(selectedEtudiant);
      setBulletinData(data);
    } catch (err: any) { toast.error(err.message || 'Erreur'); }
    finally { setLoadingBulletin(false); }
  };

  const handleGenererRecap = async () => {
    if (!selectedSemestreId) { toast.error('Sélectionnez un semestre'); return; }
    try {
      setLoadingRecap(true); setRecapRows([]);
      try {
        const raw = await bulletinService.getRecapPromotion(selectedSemestreId);
        if (raw?.etudiants) { setRecapRows(raw.etudiants.sort((a: any, b: any) => (a.nom || '').localeCompare(b.nom || ''))); setMode('recap'); return; }
      } catch { /* fallback */ }
      const rows: RecapRow[] = [];
      for (const etudiant of etudiants) {
        try {
          const raw = await bulletinService.getBulletinAnnuel(etudiant.id);
          rows.push({
            matricule: etudiant.matricule, nom: etudiant.utilisateur?.nom ?? '',
            prenom: etudiant.prenom, moyenneS5: raw?.semestre5?.moyenne,
            moyenneS6: raw?.semestre6?.moyenne, moyenneAnnuelle: raw?.moyenneAnnuelle,
            creditsAcquis: raw?.creditsAcquis ?? 0, decision: raw?.decisionJury, mention: raw?.mention,
          });
        } catch {
          rows.push({ matricule: etudiant.matricule, nom: etudiant.utilisateur?.nom ?? '', prenom: etudiant.prenom, creditsAcquis: 0 });
        }
      }
      setRecapRows(rows.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''))); setMode('recap');
    } catch { toast.error('Erreur lors du chargement du récapitulatif'); }
    finally { setLoadingRecap(false); }
  };

  const handleGenererStats = async () => {
    if (!selectedSemestreId) { toast.error('Sélectionnez un semestre'); return; }
    try {
      setLoadingStats(true); setStatsData(null);
      try {
        const raw = await statistiquesService.getStatistiquesSemestre(selectedSemestreId);
        if (raw) {
          setStatsData({
            nombreEtudiants: raw.nombreEtudiants ?? etudiants.length,
            moyenneGenerale: raw.moyenne, min: raw.min, max: raw.max,
            ecartType: raw.ecartType, tauxReussite: raw.tauxReussite,
          });
          setMode('stats'); return;
        }
      } catch { /* fallback calcul local */ }
      const moyennes: number[] = [];
      let diplomes = 0;
      for (const etudiant of etudiants) {
        try {
          const raw = await bulletinService.getBulletinAnnuel(etudiant.id);
          if (raw?.moyenneAnnuelle) { moyennes.push(raw.moyenneAnnuelle); if (raw.decisionJury === 'DIPLOME') diplomes++; }
        } catch { /* skip */ }
      }
      if (moyennes.length > 0) {
        const moy = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
        const variance = moyennes.reduce((acc, n) => acc + Math.pow(n - moy, 2), 0) / moyennes.length;
        setStatsData({
          nombreEtudiants: etudiants.length, moyenneGenerale: moy,
          min: Math.min(...moyennes), max: Math.max(...moyennes),
          ecartType: Math.sqrt(variance),
          tauxReussite: (moyennes.filter(m => m >= 10).length / moyennes.length) * 100,
          repartitionMentions: {
            passable: moyennes.filter(m => m >= 10 && m < 12).length,
            assezBien: moyennes.filter(m => m >= 12 && m < 14).length,
            bien: moyennes.filter(m => m >= 14 && m < 16).length,
            tresBien: moyennes.filter(m => m >= 16).length,
          },
        });
      } else { setStatsData({ nombreEtudiants: etudiants.length }); }
      setMode('stats');
    } catch { toast.error('Erreur lors du calcul des statistiques'); }
    finally { setLoadingStats(false); }
  };

  const handleRecalculerPromotion = async () => {
    let classesToRecalculate = classes;
    if (selectedClasseId) {
      classesToRecalculate = classes.filter(c => c.id === selectedClasseId);
    } else if (selectedFiliereId) {
      classesToRecalculate = classes.filter(c => c.filiereId === selectedFiliereId);
    }

    if (classesToRecalculate.length === 0) {
      setError('Aucune classe trouvée pour ces critères.');
      return;
    }

    if (!window.confirm(`Voulez-vous lancer le recalcul global pour ${classesToRecalculate.length} classe(s) ? Cela peut prendre du temps.`)) {
      return;
    }

    try {
      setRecalculating(true);
      
      let total = 0;
      for (const cls of classesToRecalculate) {
        const res = await api.post(`/calculs/classe/${cls.id}/recalculer-tout`);
        if (res.data?.count) total += res.data.count;
      }
      
      toast.success(`Recalcul terminé avec succès pour ${total} étudiants.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors du recalcul global.');
    } finally {
      setRecalculating(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setImporting(true);
      await importExportService.importerNotesExcel(file);
      toast.success(`Import réussi : ${file.name}`);
    } catch (err: any) { toast.error(err.response?.data?.message || "Erreur lors de l'import Excel"); }
    finally { setImporting(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleExportExcel = async () => {
    if (!selectedSemestreId) { toast.error('Sélectionnez un semestre'); return; }
    try {
      const blob = await importExportService.exporterNotesExcel(selectedSemestreId);
      importExportService.downloadFile(blob, `Notes_${semestres.find(s => s.id === selectedSemestreId)?.code ?? 'export'}.xlsx`);
    } catch { toast.error("Erreur lors de l'export Excel"); }
  };

  const filteredEtudiants = etudiants.filter(e =>
    `${e.utilisateur?.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const nomA = a.utilisateur?.nom || '';
    const nomB = b.utilisateur?.nom || '';
    return nomA.localeCompare(nomB);
  });
  const doneCount = promotionRows.filter(r => r.status === 'done').length;
  const errorCount = promotionRows.filter(r => r.status === 'error').length;

  const resetToAccueil = () => {
    setMode('accueil'); setBulletinData(null); setSelectedEtudiant(null);
    setPromotionRows([]); setRecapRows([]); setStatsData(null);
  };

  return {
    // State
    etudiants, semestres, classes, filieres, mode, bulletinType,
    selectedSemestreId, selectedFiliereId, selectedClasseId,
    selectedEtudiant, bulletinData, promotionRows, recapRows, statsData,
    loading, loadingBulletin, generatingAll, loadingRecap, loadingStats,
    recalculating, importing, searchTerm,
    fileInputRef, filteredEtudiants, doneCount, errorCount,
    // Setters
    setMode, setBulletinType, setSelectedSemestreId, setSelectedFiliereId,
    setSelectedClasseId, setSelectedEtudiant, setBulletinData,
    setSearchTerm,
    // Actions
    handleRecalculerPromotion, handleGenererTous, handleStopGeneration,
    handleArchiver, handleGenererIndividuel, handleGenererRecap,
    handleGenererStats, handleImportExcel, handleExportExcel, resetToAccueil,
  };
};
