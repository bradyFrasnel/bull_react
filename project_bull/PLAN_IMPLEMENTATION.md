# 🚀 Plan d'Implémentation Frontend - Bull ASUR

## 📊 État Actuel

### ✅ Complété (Phase 1)
- [x] Toutes les interfaces TypeScript créées (40+ types)
- [x] Tous les services API créés (5 services, 100+ méthodes)
- [x] Tous les hooks personnalisés créés (15+ hooks)
- [x] Infrastructure de base (Auth, Routing, API)
- [x] Pages Admin/Secrétariat (CRUD Étudiants, Enseignants, Académique)

### 🔄 En Cours (Phase 2)
- [ ] Pages Enseignant
- [ ] Pages Étudiant
- [ ] Saisie des notes
- [ ] Génération des bulletins

---

## 📋 Phase 2 : Pages Enseignant (Priorité 1)

### 1. Dashboard Enseignant
**Fichier** : `src/pages/enseignant/Dashboard.tsx`

**Fonctionnalités** :
- Afficher les matières assignées
- Statistiques des évaluations saisies
- Liste des étudiants par matière
- Accès rapide à la saisie de notes

**Hooks à utiliser** :
- `useAuth()` - Obtenir l'enseignant connecté
- `useEnseignant(enseignantId)` - Charger les données de l'enseignant
- `useMatieres()` - Charger les matières assignées

**Services à utiliser** :
- `enseignantService.getMatieres(enseignantId)`
- `evaluationService.getByMatiere(matiereId)`

### 2. Saisir Notes
**Fichier** : `src/pages/enseignant/SaisirNotes.tsx`

**Fonctionnalités** :
- Sélectionner une matière
- Sélectionner un étudiant
- Saisir CC, Examen, Rattrapage
- Validation automatique du rattrapage (< 6)
- Calcul automatique après saisie

**Hooks à utiliser** :
- `useMatieres()` - Charger les matières
- `useEtudiants()` - Charger les étudiants
- `useEvaluationsGroupees(etudiantId)` - Voir les notes existantes
- `useValidationRattrapage()` - Valider le rattrapage
- `useCalculs()` - Recalculer après saisie

**Services à utiliser** :
- `evaluationService.create(data)`
- `evaluationService.update(id, data)`
- `evaluationService.validateRattrapage(etudiantId, matiereId)`
- `calculService.calculerMatiere(etudiantId, matiereId)`

**Règles métier à implémenter** :
```typescript
// Validation rattrapage
if (moyenneInitiale >= 6) {
  alert('Rattrapage non autorisé : moyenne ≥ 6/20');
  return;
}

// Calcul automatique après saisie
await evaluationService.create(data);
await calculService.calculerMatiere(etudiantId, matiereId);
```

### 3. Consulter Étudiants
**Fichier** : `src/pages/enseignant/ConsulterEtudiants.tsx`

**Fonctionnalités** :
- Liste des étudiants
- Filtrer par matière
- Voir les notes d'un étudiant
- Voir les absences

**Hooks à utiliser** :
- `useEtudiants()` - Charger les étudiants
- `useEvaluationsEtudiant(etudiantId)` - Voir les notes
- `useAbsencesEtudiant(etudiantId)` - Voir les absences

### 4. Profil Enseignant
**Fichier** : `src/pages/enseignant/ProfileEnseignant.tsx`

**Fonctionnalités** :
- Afficher les informations personnelles
- Modifier le mot de passe
- Voir les matières assignées

---

## 📋 Phase 3 : Pages Étudiant (Priorité 1)

### 1. Dashboard Étudiant
**Fichier** : `src/pages/etudiant/Dashboard.tsx`

**Fonctionnalités** :
- Résumé des résultats (S5, S6)
- Moyenne générale
- Crédits acquis
- Décision du jury
- Rang dans la promotion

**Hooks à utiliser** :
- `useAuth()` - Obtenir l'étudiant connecté
- `useEtudiant(etudiantId)` - Charger les données
- `useResultatsSemestre(etudiantId)` - Résultats semestres
- `useResultatsAnnuels(etudiantId)` - Résultats annuels

**Services à utiliser** :
- `resultatSemestreService.getByEtudiant(etudiantId)`
- `resultatAnnuelService.getByEtudiant(etudiantId)`
- `statistiquesService.getRangEtudiant(etudiantId, annee)`

### 2. Consulter Notes
**Fichier** : `src/pages/etudiant/ConsulterNotes.tsx`

**Fonctionnalités** :
- Afficher toutes les notes par matière
- Afficher les moyennes par UE
- Afficher les moyennes par semestre
- Afficher les crédits acquis

**Hooks à utiliser** :
- `useEvaluationsGroupees(etudiantId)` - Notes groupées
- `useMoyennesMatieres(etudiantId)` - Moyennes matières
- `useMoyennesUE(etudiantId)` - Moyennes UE
- `useResultatsSemestre(etudiantId)` - Résultats semestres

**Affichage** :
```
Semestre 5
├── UE5-1 : Enseignement Général (Moyenne: 14.5/20)
│   ├── Anglais technique (CC: 15, Examen: 14, Moyenne: 14.4)
│   ├── Management d'équipe (CC: 16, Examen: 15, Moyenne: 15.4)
│   └── ...
├── UE5-2 : Réseaux (Moyenne: 13.2/20)
│   └── ...
└── Moyenne Semestre: 13.8/20 - Crédits: 30/30 - VALIDÉ
```

### 3. Bulletin Semestre
**Fichier** : `src/pages/etudiant/BulletinSemestre.tsx`

**Fonctionnalités** :
- Sélectionner un semestre (S5 ou S6)
- Afficher le bulletin complet
- Télécharger en PDF
- Afficher les statistiques de promotion

**Hooks à utiliser** :
- `useResultatSemestre(etudiantId, semestreId)` - Résultat semestre

**Services à utiliser** :
- `bulletinService.genererBulletinSemestre(etudiantId, semestreId)`
- `bulletinService.exporterPDF(etudiantId, semestreId)`
- `bulletinService.downloadPDF(blob, filename)`

**Bouton de téléchargement** :
```typescript
const handleDownloadPDF = async () => {
  try {
    const blob = await bulletinService.exporterPDF(etudiantId, semestreId);
    bulletinService.downloadPDF(blob, `Bulletin_S5_${matricule}.pdf`);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
  }
};
```

### 4. Bulletin Annuel
**Fichier** : `src/pages/etudiant/BulletinAnnuel.tsx`

**Fonctionnalités** :
- Afficher le bulletin annuel complet
- Résultats S5 + S6
- Moyenne annuelle
- Décision du jury
- Mention
- Télécharger en PDF

**Services à utiliser** :
- `bulletinService.genererBulletinAnnuel(etudiantId, anneeUniversitaire)`
- `bulletinService.exporterPDFAnnuel(etudiantId, anneeUniversitaire)`

### 5. Profil Étudiant
**Fichier** : `src/pages/etudiant/ProfileEtudiant.tsx`

**Fonctionnalités** :
- Afficher les informations personnelles
- Modifier le mot de passe
- Voir l'historique académique

---

## 📋 Phase 4 : Améliorer Pages Admin/Secrétariat (Priorité 2)

### 1. Saisir Notes (Admin/Secrétariat)
**Fichier** : `src/pages/admin/SaisirNotes.tsx`

**Fonctionnalités** :
- Identique à la page Enseignant
- Mais accès à toutes les matières
- Import Excel des notes
- Export Excel des notes

**Fonctionnalités supplémentaires** :
```typescript
// Import Excel
const handleImportExcel = async (file: File) => {
  try {
    await importExportService.importerNotesExcel(file, semestreId);
    alert('Import réussi');
  } catch (error) {
    alert('Erreur import');
  }
};

// Export Excel
const handleExportExcel = async () => {
  try {
    const blob = await importExportService.exporterToutesNotesExcel(semestreId);
    recapitulatifService.downloadFile(blob, `Notes_S5.xlsx`);
  } catch (error) {
    alert('Erreur export');
  }
};
```

### 2. Génération Bulletins
**Fichier** : `src/pages/admin/GenererBulletins.tsx`

**Fonctionnalités** :
- Générer bulletins pour tous les étudiants
- Générer récapitulatif de promotion
- Export PDF/Excel
- Statistiques de promotion

**Services à utiliser** :
- `recapitulatifService.genererRecapitulatif(anneeUniversitaire)`
- `recapitulatifService.exporterRecapitulatifExcel(anneeUniversitaire)`
- `recapitulatifService.exporterRecapitulatifPDF(anneeUniversitaire)`

### 3. Gestion Absences
**Fichier** : `src/pages/admin/GestionAbsences.tsx`

**Fonctionnalités** :
- Saisir les absences
- Voir les absences par étudiant
- Voir les absences par matière
- Calculer les pénalités

**Hooks à utiliser** :
- `useAbsencesEtudiant(etudiantId)`
- `useAbsencesMatiere(matiereId)`

**Services à utiliser** :
- `absenceService.create(data)`
- `absenceService.getTotalHeures(etudiantId)`
- `absenceService.getTotalHeuresParMatiere(etudiantId, matiereId)`

### 4. Calculs et Validation
**Fichier** : `src/pages/admin/CalculsValidation.tsx`

**Fonctionnalités** :
- Recalculer les moyennes
- Valider les semestres
- Valider l'année
- Décisions du jury

**Hooks à utiliser** :
- `useCalculs()`

**Services à utiliser** :
- `calculService.recalculerTout(etudiantId)`
- `calculService.calculerSemestre(etudiantId, semestreId)`

---

## 📋 Phase 5 : Composants Réutilisables (Priorité 3)

### 1. Composant Tableau de Notes
**Fichier** : `src/components/TableauNotes.tsx`

**Props** :
```typescript
interface TableauNotesProps {
  evaluations: EvaluationsParMatiere[];
  editable?: boolean;
  onEdit?: (evaluation: Evaluation) => void;
}
```

### 2. Composant Carte Statistiques
**Fichier** : `src/components/CarteStatistiques.tsx`

**Props** :
```typescript
interface CarteStatistiquesProps {
  titre: string;
  valeur: number | string;
  icon: React.ReactNode;
  couleur: string;
}
```

### 3. Composant Formulaire Évaluation
**Fichier** : `src/components/FormulaireEvaluation.tsx`

**Props** :
```typescript
interface FormulaireEvaluationProps {
  etudiantId: string;
  matiereId: string;
  type: TypeEvaluation;
  onSuccess: () => void;
}
```

### 4. Composant Bulletin Preview
**Fichier** : `src/components/BulletinPreview.tsx`

**Props** :
```typescript
interface BulletinPreviewProps {
  bulletin: BulletinSemestre | BulletinAnnuel;
  type: 'semestre' | 'annuel';
}
```

---

## 📋 Phase 6 : Utilitaires (Priorité 3)

### 1. Fonctions de Calcul
**Fichier** : `src/utils/calculs.ts`

```typescript
// Calculer la moyenne avec pondération
export const calculerMoyennePonderee = (
  notes: number[],
  coefficients: number[]
): number => {
  const sommeNotes = notes.reduce((acc, note, i) => acc + note * coefficients[i], 0);
  const sommeCoefficients = coefficients.reduce((acc, coef) => acc + coef, 0);
  return sommeNotes / sommeCoefficients;
};

// Obtenir les 2 meilleures notes
export const get2MeilleuresNotes = (notes: number[]): number[] => {
  return notes.sort((a, b) => b - a).slice(0, 2);
};

// Calculer la mention
export const calculerMention = (moyenne: number): string => {
  if (moyenne >= 16) return 'TRES_BIEN';
  if (moyenne >= 14) return 'BIEN';
  if (moyenne >= 12) return 'ASSEZ_BIEN';
  if (moyenne >= 10) return 'PASSABLE';
  return 'AUCUNE';
};
```

### 2. Fonctions de Formatage
**Fichier** : `src/utils/formatters.ts`

```typescript
// Formater une note
export const formatNote = (note: number): string => {
  return note.toFixed(2);
};

// Formater une date
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR');
};

// Formater un rôle
export const formatRole = (role: string): string => {
  const roles = {
    admin: 'Administrateur',
    secretariat: 'Secrétariat',
    enseignant: 'Enseignant',
    etudiant: 'Étudiant',
  };
  return roles[role as keyof typeof roles] || role;
};
```

### 3. Constantes
**Fichier** : `src/utils/constants.ts`

```typescript
export const TYPES_EVALUATION = {
  CC: 'Contrôle Continu',
  EXAMEN: 'Examen Final',
  RATTRAPAGE: 'Rattrapage',
};

export const DECISIONS_JURY = {
  DIPLOME: 'Diplômé(e)',
  REPRISE_SOUTENANCE: 'Reprise de Soutenance',
  REDOUBLE: 'Redouble la Licence 3',
};

export const MENTIONS = {
  TRES_BIEN: 'Très Bien',
  BIEN: 'Bien',
  ASSEZ_BIEN: 'Assez Bien',
  PASSABLE: 'Passable',
};

export const SEUIL_RATTRAPAGE = 6;
export const CREDITS_SEMESTRE = 30;
export const CREDITS_ANNEE = 60;
```

---

## 🎯 Ordre d'Implémentation Recommandé

### Semaine 1 : Pages Enseignant
1. ✅ Dashboard Enseignant (1 jour)
2. ✅ Saisir Notes avec validation rattrapage (2 jours)
3. ✅ Consulter Étudiants (1 jour)
4. ✅ Profil Enseignant (0.5 jour)

### Semaine 2 : Pages Étudiant
1. ✅ Dashboard Étudiant (1 jour)
2. ✅ Consulter Notes (1 jour)
3. ✅ Bulletin Semestre avec PDF (1.5 jours)
4. ✅ Bulletin Annuel avec PDF (1 jour)
5. ✅ Profil Étudiant (0.5 jour)

### Semaine 3 : Améliorer Admin/Secrétariat
1. ✅ Saisir Notes avec Import/Export Excel (2 jours)
2. ✅ Génération Bulletins (1 jour)
3. ✅ Gestion Absences (1 jour)
4. ✅ Calculs et Validation (1 jour)

### Semaine 4 : Composants et Optimisations
1. ✅ Composants réutilisables (2 jours)
2. ✅ Utilitaires et constantes (1 jour)
3. ✅ Tests et corrections de bugs (2 jours)

---

## ✅ Checklist Finale

### Fonctionnalités Essentielles
- [ ] Authentification multi-rôles
- [ ] CRUD Étudiants, Enseignants, Académique
- [ ] Saisie des notes (CC, Examen, Rattrapage)
- [ ] Validation automatique du rattrapage (< 6)
- [ ] Calcul automatique des moyennes
- [ ] Règle des 2 meilleures notes
- [ ] Calcul des crédits acquis
- [ ] Compensation entre UE
- [ ] Validation semestre/année
- [ ] Génération bulletins (S5, S6, Annuel)
- [ ] Export PDF des bulletins
- [ ] Statistiques de promotion
- [ ] Import/Export Excel

### Tests à Effectuer
- [ ] Connexion avec chaque rôle
- [ ] CRUD de toutes les entités
- [ ] Saisie de notes avec validation
- [ ] Calculs automatiques corrects
- [ ] Génération de bulletins
- [ ] Export PDF fonctionnel
- [ ] Import Excel fonctionnel
- [ ] Responsive design
- [ ] Gestion des erreurs

---

**Date de création** : 28 Avril 2026
**Durée estimée** : 4 semaines
**Statut** : Prêt à démarrer Phase 2
