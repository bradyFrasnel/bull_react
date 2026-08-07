# Requirements Document

## Spécification des Besoins - Pages Enseignant et Étudiant

## Introduction

Ce document définit les exigences fonctionnelles pour les pages Enseignant et Étudiant de l'application Bull ASUR, Phase 2 du projet. Ces pages permettent aux enseignants de gérer les évaluations et aux étudiants de consulter leurs résultats académiques.

## Glossary

- **Application**: Application web Bull ASUR - Système de gestion des bulletins et notes pour l'INPTIC
- **Enseignant**: Utilisateur avec le rôle « enseignant » pouvant saisir et consulter les évaluations
- **Étudiant**: Utilisateur avec le rôle « étudiant » consultant ses résultats académiques
- **Evaluation**: Note d'un étudiant pour un type d'évaluation (CC, Examen, Rattrapage)
- **Matiere**: Unité d'enseignement dispensée par un enseignant
- **UE (Unité d'Enseignement)**: Regroupement de matières avec compensation possible
- **Semestre**: Période académique (S5 ou S6), équivalant à 30 crédits
- **AnnéeUniversitaire**: Année académique complète (S5 + S6), équivalant à 60 crédits
- **Moyenne**: Note calculée selon la pondération des évaluations d'une matière
- **CreditsAcquis**: Crédits obtenus après validation d'une matière ou UE
- **Rattrapage**: Évaluation supplémentaire autorisée quand la moyenne initiale est inférieure à 6/20
- **DashboardEnseignant**: Page d'accueil de l'interface Enseignant
- **DashboardEtudiant**: Page d'accueil de l'interface Étudiant
- **BulletinSemestre**: Document officiel récapitulant les résultats d'un semestre
- **BulletinAnnuel**: Document officiel récapitulant les résultats de l'année
- **EnseignantLayout**: Composant de mise en page pour l'interface Enseignant
- **EtudiantLayout**: Composant de mise en page pour l'interface Étudiant
- **CalculService**: Service Backend calculant les moyennes et crédits
- **EvaluationService**: Service Backend gérant les évaluations
- **BulletinService**: Service Backend générant les bulletins

## Règles Métier

### Calcul des Moyennes
1. WHEN une évaluation est créée ou modifiée, THE CalculService SHALL calculer la moyenne pondérée de la matière
2. THE MoyenneMatiere SHALL être calculée comme suit : (NoteCC × CoefficientCC + NoteExamen × CoefficientExamen) / (CoefficientCC + CoefficientExamen)
3. WHEN une note de rattrapage est saisie, THE CalculService SHALL recalculer la moyenne en utilisant la meilleure des deux notes (initiale ou rattrapage)

### Validation du Rattrapage
1. IF la moyenne initiale d'une matière est supérieure ou égale à 6/20, THEN THE EvaluationService SHALL refuser la saisie du rattrapage avec un message d'erreur
2. WHEN un enseignant tente de saisir une note de rattrapage, THE Application SHALL vérifier que la moyenne initiale est inférieure à 6/20
3. IF la validation du rattrapage échoue, THE Application SHALL afficher le message « Rattrapage non autorisé : moyenne ≥ 6/20 »

### Calcul des Crédits
1. WHEN la moyenne d'une matière est calculée, THE Application SHALL attribuer les crédits de la matière si la moyenne est supérieure ou égale à 10/20
2. THE CreditsParSemestre SHALL toujours être égal à 30 crédits
3. THE CreditsParAnnee SHALL toujours être égal à 60 crédits
4. WHEN une UE est validée (moyenne UE ≥ 10/20), THE Application SHALL attribuer la somme des crédits des matières acquises de l'UE

### Compensation entre UE
1. IF la moyenne d'une UE est inférieure à 10/20 mais supérieure ou égale à 8/20, THE Application SHALL vérifier si la compensation est possible selon les règles de l'établissement
2. WHEN la compensation entre UE est appliquée, THE Application SHALL ajouter les crédits de l'UE compensée aux crédits acquis

### Mentions et Décisions
1. THE DecisionJury SHALL être déterminée selon les règles suivantes :
   - IF moyenne ≥ 10 AND crédits = 60 THEN « Diplômé(e) »
   - IF moyenne < 10 AND moyenne ≥ 8 THEN « Ajourné(e) »
   - ELSE « Redouble la Licence 3 »
2. THE Mention SHALL être calculée comme suit :
   - IF moyenne ≥ 16 THEN « Très Bien »
   - IF moyenne ≥ 14 THEN « Bien »
   - IF moyenne ≥ 12 THEN « Assez Bien »
   - IF moyenne ≥ 10 THEN « Passable »
   - ELSE « Aucune mention »

---

## Requirements

### REQ-001 : Dashboard Enseignant

**Histoire Utilisateur :** En tant qu'enseignant, je veux voir un tableau de bord avec mes matières assignées et des statistiques, afin d'accéder rapidement aux fonctionnalités principales.

#### Critères d'Acceptation

1. WHEN l'enseignant accède à /enseignant/dashboard, THE DashboardEnseignant SHALL afficher les informations suivantes :
   - Liste des matières assignées à l'enseignant
   - Nombre d'étudiants par matière
   - Nombre d'évaluations saisies par matière
   - Statistiques globales des évaluations

2. WHEN une matière est sélectionnée, THE DashboardEnseignant SHALL permettre l'accès direct à :
   - La page de saisie des notes
   - La liste des étudiants de la matière
   - Les statistiques de la matière

3. WHEN l'enseignant clique sur une matière, THE Application SHALL naviguer vers la page SaisirNotes avec la matière présélectionnée

4. THE DashboardEnseignant SHALL afficher un résumé des évaluations en attente de saisie

5. WHEN les données sont en cours de chargement, THE DashboardEnseignant SHALL afficher un indicateur de chargement

6. WHEN une erreur se produit lors du chargement, THE DashboardEnseignant SHALL afficher un message d'erreur avec un bouton de réessai

---

### REQ-002 : Saisir Notes - Interface de Saisie

**Histoire Utilisateur :** En tant qu'enseignant, je veux saisir les notes de CC, Examen et Rattrapage des étudiants, afin de documenter les résultats académiques.

#### Critères d'Acceptation

1. WHEN l'enseignant accède à /enseignant/saisir-notes, THE SaisirNotesEnseignant SHALL afficher :
   - Un sélecteur de matière
   - Un sélecteur d'étudiant (ou liste des étudiants de la matière)
   - Un tableau de saisie des évaluations

2. WHEN l'enseignant sélectionne une matière, THE SaisirNotesEnseignant SHALL charger la liste des étudiants inscrits à cette matière

3. THE SaisirNotesEnseignant SHALL permettre la saisie des notes pour les types d'évaluation suivants :
   - Contrôle Continu (CC)
   - Examen Final
   - Rattrapage (si autorisé)

4. WHEN l'enseignant saisit une note, THE Application SHALL valider que la note est comprise entre 0 et 20

5. THE SaisirNotesEnseignant SHALL calculer automatiquement la moyenne de la matière après chaque saisie de note

6. WHEN l'enseignant tente de saisir une note de rattrapage, THE Application SHALL valider automatiquement que la moyenne initiale est inférieure à 6/20

7. IF la moyenne initiale est supérieure ou égale à 6/20, THEN THE Application SHALL afficher le message d'erreur « Rattrapage non autorisé : moyenne ≥ 6/20 » et SHALL NOT enregistrer la note de rattrapage

8. WHEN l'enseignant valide la saisie, THE EvaluationService SHALL créer ou mettre à jour l'évaluation correspondante

9. AFTER saving the evaluation, THE CalculService SHALL recalculer la moyenne de la matière et les crédits associés

---

### REQ-003 : Saisir Notes - Calcul Automatique

**Histoire Utilisateur :** En tant qu'enseignant, je veux que les moyennes soient calculées automatiquement après chaque saisie, afin d'avoir des résultats actualisés.

#### Critères d'Acceptation

1. WHEN une évaluation est créée ou modifiée, THE Application SHALL déclencher le calcul automatique de la moyenne de la matière

2. THE CalculMoyenneMatiere SHALL utiliser la formule : (NoteCC × CoefficientCC + NoteExamen × CoefficientExamen) / (CoefficientCC + CoefficientExamen)

3. WHEN une note de rattrapage est saisie, THE CalculService SHALL appliquer la règle des 2 meilleures notes :
   - IF NoteRattrapage > MoyenneInitiale THEN use NoteRattrapage pour le calcul
   - ELSE keep MoyenneInitiale

4. THE CalculService SHALL mettre à jour les creditsAcquis de l'étudiant pour la matière :
   - IF Moyenne ≥ 10 THEN creditsAcquis = creditsMatiere
   - ELSE creditsAcquis = 0

5. WHEN le calcul est terminé, THE Application SHALL afficher la moyenne calculée à l'enseignant

6. WHEN an error occurs during calculation, THE Application SHALL display an error message and SHALL NOT block the user interface

---

### REQ-004 : Consulter Étudiants - Liste et Filtres

**Histoire Utilisateur :** En tant qu'enseignant, je veux consulter la liste des étudiants avec leurs notes et absences, afin de suivre leur progression académique.

#### Critères d'Acceptation

1. WHEN l'enseignant accède à /enseignant/consulter-etudiants, THE ConsulterEtudiants SHALL afficher la liste de tous les étudiants

2. THE ConsulterEtudiants SHALL permettre de filtrer les étudiants par matière enseignée

3. WHEN a filter is applied, THE ConsulterEtudiants SHALL update the displayed list accordingly

4. THE ConsulterEtudiants SHALL display the following information for each student:
   - Nom et prénom
   - Matricule
   - Moyenne générale (si disponible)
   - Nombre d'absences
   - Statut de validation du semestre

5. WHEN the teacher selects a student, THE ConsulterEtudiants SHALL allow viewing:
   - Detailed grades by subject
   - Attendance history
   - Academic progress

---

### REQ-005 : Consulter Étudiants - Détails des Notes

**Histoire Utilisateur :** En tant qu'enseignant, je veux voir les détails des notes d'un étudiant, afin d'évaluer sa progression dans mes matières.

#### Critères d'Acceptation

1. WHEN the teacher selects a student from the list, THE ConsulterEtudiants SHALL display a detail view with:
   - All grades for subjects taught by the teacher
   - Absence count per subject
   - Current average per subject

2. THE DetailView SHALL display grades in a table format with columns:
   - Matière
   - Type d'évaluation (CC, Examen, Rattrapage)
   - Note /20
   - Moyenne de la matière
   - Crédits acquis

3. WHEN the teacher views a student's details, THE Application SHALL load grades using the useEvaluationsGroupees hook

4. THE Application SHALL display absence information for each subject using the useAbsencesEtudiant hook

5. WHEN no grades are available for a subject, THE DetailView SHALL display « Non évalué »

---

### REQ-006 : Profil Enseignant

**Histoire Utilisateur :** En tant qu'enseignant, je veux consulter et modifier mes informations personnelles, afin de maintenir mon profil à jour.

#### Critères d'Acceptation

1. WHEN the teacher accesses /enseignant/profil, THE ProfileEnseignant SHALL display:
   - Nom et prénom
   - Email professionnel
   - Matières assignées
   - Département ou service d'appartenance

2. THE ProfileEnseignant SHALL allow the teacher to update:
   - Mot de passe (avec confirmation)
   - Coordonnées de contact (si applicable)

3. WHEN the teacher updates their password, THE Application SHALL validate:
   - Le mot de passe actuel est fourni
   - Le nouveau mot de passe respecte les critères de sécurité
   - La confirmation correspond au nouveau mot de passe

4. THE ProfileEnseignant SHALL display the list of assigned subjects with:
   - Code et libellé de la matière
   - Coefficient
   - Crédits
   - Nombre d'étudiants inscrits

5. WHEN the profile is updated successfully, THE Application SHALL display a success message

6. WHEN an error occurs during update, THE Application SHALL display an error message without refreshing the page

---

### REQ-007 : Dashboard Étudiant

**Histoire Utilisateur :** En tant qu'étudiant, je veux voir un résumé de mes résultats académiques, afin de connaître ma situation académique actuelle.

#### Critères d'Acceptation

1. WHEN l'étudiant accède à /etudiant/dashboard, THE DashboardEtudiant SHALL display:
   - Moyenne du Semestre 5
   - Moyenne du Semestre 6
   - Moyenne annuelle (si les deux semestres sont disponibles)
   - Crédits acquis au total
   - Crédits acquis par semestre
   - Décision du jury
   - Rang dans la promotion (si disponible)

2. THE DashboardEtudiant SHALL display cards for each semester showing:
   - Code du semestre (S5 ou S6)
   - Moyenne obtained
   - Credits acquired out of 30
   - Decision (Validé, Ajourné, Redouble)

3. WHEN les deux semestres sont validés, THE DashboardEtudiant SHALL display:
   - Moyenne annuelle calculée
   - Decision jury pour l'année
   - Mention (si disponible)
   - Total des crédits acquis (sur 60)

4. THE DashboardEtudiant SHALL display statistics if available:
   - Moyenne de la classe
   - Rang de l'étudiant
   - Taux de réussite de la promotion

5. WHEN the dashboard loads, THE Application SHALL use the useResultatsSemestre hook to fetch results

6. THE Application SHALL use the useStatistiquesPromotion hook to display class statistics

---

### REQ-008 : Consulter Notes

**Histoire Utilisateur :** En tant qu'étudiant, je veux consulter mes notes par matière et par UE, afin de voir le détail de mes résultats.

#### Critères d'Acceptation

1. WHEN l'étudiant accède à /etudiant/notes, THE ConsulterNotesEtudiant SHALL display:
   - Toutes les notes par matière
   - Moyennes par UE
   - Moyennes par semestre
   - Crédits acquis

2. THE ConsulterNotesEtudiant SHALL organize grades by semester and UE:
   ```
   Semestre 5
   ├── UE5-1 : Enseignement Général
   │   ├── Anglais technique (CC: 15, Examen: 14, Moyenne: 14.4, Crédits: 4)
   │   └── Management d'équipe (CC: 16, Examen: 15, Moyenne: 15.4, Crédits: 4)
   ├── UE5-2 : Réseaux
   │   └── ...
   └── Moyenne Semestre: 13.8/20 - Crédits: 30/30 - VALIDÉ
   ```

3. FOR each matière, THE ConsulterNotesEtudiant SHALL display:
   - Libellé de la matière
   - Coefficient
   - Credits
   - Note de CC (si disponible)
   - Note d'examen (si disponible)
   - Note de rattrapage (si disponible)
   - Moyenne calculée

4. THE Application SHALL use the useEvaluationsGroupees hook to load grades grouped by subject

5. THE Application SHALL use the useMoyennesUE hook to display UE averages

6. WHEN a grade is below 10/20, THE ConsulterNotesEtudiant SHALL highlight it in red

7. THE ConsulterNotesEtudiant SHALL display the total credits acquired and remaining

---

### REQ-009 : Bulletin Semestre - Affichage

**Histoire Utilisateur :** En tant qu'étudiant, je veux consulter mon bulletin de semestre complet, afin d'avoir un document officiel de mes résultats.

#### Critères d'Acceptation

1. WHEN l'étudiant accède à /etudiant/bulletins avec sélection du semestre, THE BulletinSemestreView SHALL display:
   - Informations de l'étudiant (nom, prénom, matricule, date et lieu de naissance)
   - Informations du semestre (code, libellé, année universitaire)
   - Détail des UE avec leurs matières et notes
   - Moyenne du semestre
   - Crédits acquis
   - Décision du jury
   - Statistiques de la promotion (moyenne classe, min, max, écart type, rang)

2. THE BulletinSemestreView SHALL display each UE with:
   - Code et libellé UE
   - Moyenne UE
   - Crédits total et acquis
   - Statut (Acquise, Compensée, Non acquise)
   - Liste des matières avec coefficients et notes

3. FOR each matière, THE Bulletin SHALL display:
   - Libellé
   - Coefficient
   - Credits
   - Note CC
   - Note Examen
   - Note Rattrapage (si applicable)
   - Moyenne finale
   - Absences (si disponible)

4. THE Application SHALL use the useResultatSemestre hook to load semester results

5. THE BulletinSemestreView SHALL format all numerical values with 2 decimal places

---

### REQ-010 : Bulletin Semestre - Export PDF

**Histoire Utilisateur :** En tant qu'étudiant, je veux exporter mon bulletin de semestre en PDF, afin de conserver une copie physique ou numérique.

#### Critères d'Acceptation

1. WHEN l'étudiant clique sur « Télécharger PDF », THE BulletinService SHALL generate a PDF document of the semester report

2. THE PDF export SHALL include:
   - Logo de l'établissement (INPTIC)
   - En-tête « Bulletin de Notes »
   - Toutes les informations du bulletin
   - Date d'édition
   - Signatures (si configurées)

3. THE Application SHALL use the bulletinService.exporterPDF method to generate the PDF

4. WHEN the PDF is generated, THE Application SHALL trigger a download with the filename format: `Bulletin_S5_{matricule}.pdf`

5. IF an error occurs during PDF generation, THE Application SHALL display an error message

6. THE PDF format SHALL follow the official template defined in ModellesBulletins.tsx

7. WHEN the PDF is being generated, THE Application SHALL display a loading indicator

---

### REQ-011 : Bulletin Annuel - Affichage

**Histoire Utilisateur :** En tant qu'étudiant, je veux consulter mon bulletin annuel complet, afin d'avoir une vue d'ensemble de mon année académique.

#### Critères d'Acceptation

1. WHEN l'étudiant sélectionne l'option « Bulletin Annuel », THE BulletinAnnuelView SHALL display:
   - Informations complètes de l'étudiant (incluant Baccalauréat)
   - Année universitaire
   - Résultats du Semestre 5 (moyenne, crédits, décision)
   - Résultats du Semestre 6 (moyenne, crédits, décision)
   - Moyenne annuelle
   - Crédits totaux acquis
   - Décision du jury annuel
   - Mention (si applicable)
   - Statistiques de la promotion

2. THE BulletinAnnuelView SHALL display results for both semesters in parallel format for easy comparison

3. THE Application SHALL use the resultatAnnuelService to fetch annual results

4. WHEN the annual decision is displayed, THE Application SHALL show:
   - « Diplômé(e) » if moyenne ≥ 10 and crédits = 60
   - « Ajourné(e) » if moyenne ≥ 8 and moyenne < 10
   - « Redouble la Licence 3 » otherwise

5. THE Mention SHALL be calculated based on the annual average:
   - « Très Bien » for moyenne ≥ 16
   - « Bien » for moyenne ≥ 14
   - « Assez Bien » for moyenne ≥ 12
   - « Passable » for moyenne ≥ 10

---

### REQ-012 : Bulletin Annuel - Export PDF

**Histoire Utilisateur :** En tant qu'étudiant, je veux exporter mon bulletin annuel en PDF, afin de conserver une copie officielle de mes résultats annuels.

#### Critères d'Acceptation

1. WHEN l'étudiant clique sur « Télécharger PDF » depuis la vue annuelle, THE BulletinService SHALL generate a PDF document for the annual report

2. THE Annual PDF SHALL include:
   - Logo de l'établissement
   - En-tête « Bulletin Annuel de l'Année Universitaire »
   - Informations complètes de l'étudiant
   - Résultats détaillés des deux semestres
   - Moyenne annuelle et crédits totaux
   - Décision du jury et mention
   - Statistiques de la promotion
   - Date d'édition

3. THE Application SHALL use the bulletinService.exporterPDFAnnuel method

4. THE Download filename SHALL follow the format: `Bulletin_Annuel_{matricule}_{annee}.pdf`

5. THE PDF format SHALL match the example shown in assets/images/Ex_BullAnnuel.png

6. IF an error occurs, THE Application SHALL display a user-friendly error message

---

### REQ-013 : Profil Étudiant

**Histoire Utilisateur :** En tant qu'étudiant, je veux consulter mes informations personnelles et mon historique académique, afin de vérifier mes données.

#### Critères d'Acceptation

1. WHEN l'étudiant accède à /etudiant/profil, THE ProfileEtudiant SHALL display:
   - Nom et prénom
   - Matricule
   - Date et lieu de naissance
   - Email
   - Année universitaire actuelle

2. THE ProfileEtudiant SHALL allow the student to update:
   - Mot de passe actuel
   - Nouveau mot de passe
   - Confirmation du nouveau mot de passe

3. WHEN the password update form is submitted, THE Application SHALL validate:
   - Le mot de passe actuel est correct
   - Le nouveau mot de passe a au moins 8 caractères
   - Le nouveau mot de passe contient des chiffres et des lettres
   - La confirmation correspond au nouveau mot de passe

4. THE ProfileEtudiant SHALL display academic history if available:
   - Années précédentes
   - Semestres antérieurs
   - Moyennes historiques
   - Crédits acquis par année

5. WHEN the profile is updated successfully, THE Application SHALL display a confirmation message

---

### REQ-014 : Affichage des Statistiques de Promotion

**Histoire Utilisateur :** En tant qu'étudiant ou enseignant, je veux voir les statistiques de la promotion, afin de me situer par rapport à mes pairs.

#### Critères d'Acceptation

1. WHEN displaying semester or annual results, THE Application SHALL include statistics:
   - Moyenne de la classe
   - Note minimale
   - Note maximale
   - Écart type
   - Rang de l'étudiant (pour les étudiants)

2. THE Application SHALL use the statistiquesService to fetch promotion statistics

3. WHEN rank is displayed, THE Application SHALL show:
   - Position de l'étudiant sur le nombre total d'étudiants
   - Example: « Rang : 5 sur 42 »

4. THE Statistics SHALL be displayed in the student dashboard and in bulletins

5. IF statistics are not available, THE Application SHALL display « Non disponible » instead of crashing

---

### REQ-015 : Gestion des Erreurs et Feedback Utilisateur

**Histoire Utilisateur :** En tant qu'utilisateur de l'application, je veux recevoir des messages d'erreur clairs, afin de comprendre et résoudre les problèmes.

#### Critères d'Acceptation

1. WHEN an API call fails, THE Application SHALL display a user-friendly error message in French

2. THE Application SHALL handle the following error cases:
   - Erreur réseau : « Connexion au serveur impossible. Veuillez vérifier votre connexion Internet. »
   - Erreur d'authentification : « Votre session a expiré. Veuillez vous reconnecter. »
   - Erreur de validation : « Les données saisies sont invalides. Veuillez vérifier. »
   - Erreur serveur : « Une erreur serveur s'est produite. Veuillez réessayer plus tard. »

3. WHEN a loading state is active, THE Application SHALL display a spinner or skeleton loader

4. WHEN a form is submitted, THE Application SHALL disable the submit button to prevent double submission

5. WHEN an operation succeeds, THE Application SHALL display a success notification

6. THE Application SHALL not lose form data when an error occurs (except for critical validation errors)

---

### REQ-016 : Navigation et Layout Enseignant

**Histoire Utilisateur :** En tant qu'enseignant, je veux une interface de navigation intuitive, afin d'accéder facilement aux différentes fonctionnalités.

#### Critères d'Acceptation

1. WHEN the teacher is logged in, THE EnseignantLayout SHALL display:
   - Sidebar with navigation items
   - User information in the sidebar
   - Logout button
   - Application logo

2. THE EnseignantLayout navigation items SHALL include:
   - Tableau de bord → /enseignant/dashboard
   - Relevés de notes → /enseignant/saisir-notes
   - Mes Étudiants → /enseignant/consulter-etudiants
   - Mon Profil → /enseignant/profil

3. THE Sidebar SHALL be collapsible to maximize content area

4. THE Active menu item SHALL be highlighted

5. WHEN the user logs out, THE Application SHALL redirect to the login page

---

### REQ-017 : Navigation et Layout Étudiant

**Histoire Utilisateur :** En tant qu'étudiant, je veux une interface de navigation intuitive, afin d'accéder facilement à mes informations.

#### Critères d'Acceptation

1. WHEN the student is logged in, THE EtudiantLayout SHALL display:
   - Sidebar with navigation items (green theme)
   - User information in the sidebar
   - Logout button
   - Application logo

2. THE EtudiantLayout navigation items SHALL include:
   - Tableau de bord → /etudiant/dashboard
   - Mes Notes → /etudiant/notes
   - Mes Bulletins → /etudiant/bulletins
   - Mon Profil → /etudiant/profil

3. THE Sidebar SHALL be collapsible

4. THE Active menu item SHALL be highlighted in green

5. WHEN the user logs out, THE Application SHALL redirect to the login page

---

### REQ-018 : Hooks et Intégration des Données

**Histoire Utilisateur :** En tant que développeur, je veux utiliser des hooks React pour charger les données, afin de faciliter l'intégration et la maintenance du code.

#### Critères d'Acceptation

1. THE Application SHALL provide hooks for loading data:
   - useEvaluationsGroupees(etudiantId) → Évaluations groupées par matière
   - useEvaluationsEtudiant(etudiantId) → Toutes les évaluations d'un étudiant
   - useEvaluationsMatiere(matiereId) → Évaluations d'une matière
   - useValidationRattrapage(etudiantId, matiereId) → Validation rattrapage
   - useAbsencesEtudiant(etudiantId) → Absences d'un étudiant
   - useResultatsSemestre(etudiantId) → Résultats semestriels
   - useResultatSemestre(etudiantId, semestreId) → Résultat spécifique
   - useMoyennesMatieres(etudiantId) → Moyennes des matières
   - useMoyennesUE(etudiantId) → Moyennes des UE
   - useStatistiquesMatiere(matiereId) → Statistiques d'une matière
   - useStatistiquesPromotion(anneeUniversitaire) → Statistiques de promotion

2. EACH hook SHALL provide:
   - Données (data)
   - État de chargement (loading)
   - Message d'erreur (error)
   - Fonction de rafraîchissement (refetch)

3. THE Hooks SHALL automatically fetch data when dependencies change

4. THE Hooks SHALL handle error states and display appropriate messages

5. THE Hooks SHALL be used consistently across all pages

---

## Propriétés de Test de Conformité

### PT-001 : Round-trip des Bulletins
FOR ALL valid BulletinSemestre objects, printing then parsing THEN parsing SHALL produce an equivalent object
- Justification : Les bulletins doivent pouvoir être régénérés à partir de leur représentation sérialisée

### PT-002 : Round-trip des Notes
FOR ALL valid Evaluation objects, creating then reading THEN reading SHALL return the saved data
- Justification : Les notes doivent être correctement stockées et récupérées

### PT-003 : Invariant du Calcul des Crédits
WHEN ANY evaluation is modified, the total credits acquired for the student SHALL remain between 0 and 60
- Justification : Les crédits ne peuvent pas dépasser le maximum ou devenir négatifs

### PT-004 : Invariant de la Moyenne
THE calculated average SHALL always be between 0 and 20 for any subject
- Justification : Les moyennes doivent respecter l'échelle de notation

### PT-005 : Invariant du Rattrapage
IF a subject has a rattrapage grade, THEN the initial grade MUST be less than 6/20
- Justification : Le rattrapage ne peut être saisi que si la moyenne initiale est inférieure à 6

### PT-006 : Idempotence de la Validation
WHEN validateRattrapage is called twice with the same parameters, the result SHALL be the same
- Justification : La validation多次调用应返回相同结果

### PT-007 : Métamorphique - Crédits par Semestre
FOR ALL students, creditsAcquisSemestre SHALL always be less than or equal to 30
- Justification : Un semestre ne peut pas avoir plus de 30 crédits

### PT-008 : Métamorphique - Crédits par Année
FOR ALL students, creditsAcquisAnnee SHALL always be less than or equal to 60
- Justification : Une année ne peut pas avoir plus de 60 crédits

---

## Matrice de Traçabilité

| Exigence | Page | Service | Hook |
|----------|------|---------|------|
| REQ-001 | Dashboard Enseignant | enseignantService, evaluationService | useAuth, useEnseignant |
| REQ-002 | Saisir Notes | evaluationService | useMatieres, useEtudiants, useEvaluationsGroupees |
| REQ-003 | Saisir Notes | calculService | useCalculs |
| REQ-004 | Consulter Étudiants | etudiantService | useEtudiants |
| REQ-005 | Consulter Étudiants | evaluationService, absenceService | useEvaluationsGroupees, useAbsencesEtudiant |
| REQ-006 | Profil Enseignant | enseignantService | useAuth |
| REQ-007 | Dashboard Étudiant | resultatSemestreService, statistiquesService | useResultatsSemestre, useStatistiquesPromotion |
| REQ-008 | Consulter Notes | evaluationService, moyenneUEService | useEvaluationsGroupees, useMoyennesUE |
| REQ-009 | Bulletin Semestre | bulletinService | useResultatSemestre |
| REQ-010 | Bulletin Semestre (PDF) | bulletinService | - |
| REQ-011 | Bulletin Annuel | resultatAnnuelService | useResultatsAnnuels |
| REQ-012 | Bulletin Annuel (PDF) | bulletinService | - |
| REQ-013 | Profil Étudiant | etudiantService | useAuth |
| REQ-014 | Statistiques | statistiquesService | useStatistiquesPromotion |
| REQ-015 | Toutes les pages | - | - |
| REQ-016 | Layout Enseignant | authService | useAuth |
| REQ-017 | Layout Étudiant | authService | useAuth |
| REQ-018 | Toutes les pages | Tous les services | Tous les hooks |

---

## Décisions de Test

### Tests d'Intégration (1-3 exemples représentatifs)

- Authentification et navigation avec chaque rôle (Enseignant, Étudiant)
- Génération de bulletin pour un étudiant spécifique
- Chargement des statistiques de promotion
- Affichage du profil avec les matières assignées

### Tests par Propriétés (100 itérations)

- Calcul des moyennes avec différentes combinaisons de notes
- Validation des règles de rattrapage
- Attribution des crédits avec différentes moyennes
- Calcul des statistiques de promotion
- Formatage des bulletins et exports PDF