import React, { useState } from 'react';
import { calculService, bulletinService } from '../../../services';
import { statistiquesService } from '../../../services/results.service';
import { AlertCircle, Loader2, CheckCircle, RefreshCw, BarChart3, Users, FileText, Download } from 'lucide-react';
import { BulletinDocument, BulletinData } from '../../../components/BulletinDocument';

interface TabBulletinsProps {
  classeId: string;
  classe: any;
}

export const TabBulletins: React.FC<TabBulletinsProps> = ({ classeId, classe }) => {
  const [selectedSemestreId, setSelectedSemestreId] = useState('');
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States pour afficher des données
  const [statsData, setStatsData] = useState<any>(null);
  const [recapRows, setRecapRows] = useState<any[]>([]);
  const [bulletinToPrint, setBulletinToPrint] = useState<any>(null);

  const semestres = classe?.semestres?.map((s: any) => s.semestre) || [];
  const etudiants = classe?.etudiants || [];

  const handleRecalculerPromotion = async () => {
    if (!window.confirm(`Recalculer les moyennes pour les ${etudiants.length} étudiants de la classe ?`)) return;
    try {
      setRecalculating(true);
      setError("");
      setSuccess("");
      await Promise.allSettled(etudiants.map((e: any) => calculService.recalculerTout(e.utilisateurId)));
      setSuccess("Recalcul terminé pour toute la classe.");
    } catch {
      setError("Erreur lors du recalcul global");
    } finally {
      setRecalculating(false);
    }
  };

  const handleGenererRecap = async () => {
    if (!selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try {
      setLoading(true);
      setError("");
      setStatsData(null);

      const raw = await bulletinService.getRecapPromotion(selectedSemestreId);
      if (raw?.etudiants) {
        setRecapRows(raw.etudiants);
      }
    } catch {
      setError("Erreur lors du chargement du récapitulatif. Assurez-vous d'avoir recalculé les notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenererStats = async () => {
    if (!selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try {
      setLoading(true);
      setError("");
      setRecapRows([]);

      const raw = await statistiquesService.getStatistiquesSemestre(selectedSemestreId);
      if (raw) {
        setStatsData({
          nombreEtudiants: raw.nombreEtudiants ?? etudiants.length,
          moyenneGenerale: raw.moyenne,
          min: raw.min,
          max: raw.max,
          ecartType: raw.ecartType,
          tauxReussite: raw.tauxReussite
        });
      }
    } catch {
      setError("Erreur lors du calcul des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const printBulletinSemestre = async (etudiantId: string) => {
    if (!selectedSemestreId) { setError("Sélectionnez un semestre"); return; }
    try {
      const etu = etudiants.find((e: any) => e.utilisateurId === etudiantId);
      const raw = await bulletinService.getBulletinSemestre(etudiantId, selectedSemestreId);
      // Adaptation minimaliste (dans un cas réel, utiliser buildSemestreData complet)
      setBulletinToPrint(raw); // Vous devriez utiliser votre composant <BulletinDocument />
      alert("La fonctionnalité d'impression s'ouvrira avec les données récupérées. (A intégrer avec PDF)");
    } catch (e) {
      setError("Impossible de générer le bulletin pour cet étudiant.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions globales */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Résultats & Bulletins</h2>
          <p className="text-sm text-gray-500">Générez les bulletins et analysez les statistiques de la classe.</p>
        </div>

        <button
          onClick={handleRecalculerPromotion}
          disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {recalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          Recalculer toutes les moyennes
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Sélection du Semestre et Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Semestre cible</label>
          <select
            value={selectedSemestreId}
            onChange={(e) => setSelectedSemestreId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Choisir un semestre</option>
            {semestres.map((s: any) => (
              <option key={s.id} value={s.id}>{s.libelle} ({s.anneeUniversitaire})</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleGenererRecap}
            disabled={!selectedSemestreId || loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            Récapitulatif
          </button>
          <button
            onClick={handleGenererStats}
            disabled={!selectedSemestreId || loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
          >
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Affichage des Statistiques */}
      {!loading && statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-sm font-medium text-gray-500 uppercase">Moyenne Générale</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{statsData.moyenneGenerale ? statsData.moyenneGenerale.toFixed(2) : '-'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-sm font-medium text-gray-500 uppercase">Note Max</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{statsData.max ? statsData.max.toFixed(2) : '-'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-sm font-medium text-gray-500 uppercase">Note Min</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{statsData.min ? statsData.min.toFixed(2) : '-'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-sm font-medium text-gray-500 uppercase">Taux réussite</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{statsData.tauxReussite ? `${statsData.tauxReussite.toFixed(1)}%` : '-'}</p>
          </div>
        </div>
      )}

      {/* Affichage du Récapitulatif avec Actions Bulletins */}
      {!loading && recapRows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Récapitulatif de la classe</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Matricule</th>
                  <th className="px-4 py-3 font-semibold">Nom & Prénom</th>
                  <th className="px-4 py-3 font-semibold text-center">Moy. Semestre</th>
                  <th className="px-4 py-3 font-semibold text-center">Crédits Acquis</th>
                  <th className="px-4 py-3 font-semibold text-right">Bulletin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recapRows.map((row: any) => (
                  <tr key={row.matricule} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-500">{row.matricule}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.nom} {row.prenom}</td>
                    <td className="px-4 py-3 text-center font-bold">
                      {row.moyenneS5 || row.moyenneS6 || row.moyenneSemestre || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">{row.creditsAcquis ?? '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => printBulletinSemestre(row.etudiantId || row.id)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded"
                      >
                        <FileText className="w-4 h-4 inline mr-1" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
