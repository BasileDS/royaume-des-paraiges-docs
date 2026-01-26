# Bases legales des traitements

Le RGPD impose de definir une base legale pour chaque traitement de donnees personnelles (article 6).

## Les 6 bases legales du RGPD

| Base legale | Article | Applicable si... |
|-------------|---------|------------------|
| **Consentement** | 6.1.a | La personne a donne son accord explicite |
| **Contrat** | 6.1.b | Le traitement est necessaire a l'execution d'un contrat |
| **Obligation legale** | 6.1.c | Une loi impose le traitement |
| **Interet vital** | 6.1.d | Protection de la vie de la personne |
| **Mission d'interet public** | 6.1.e | Execution d'une mission de service public |
| **Interet legitime** | 6.1.f | Interet du responsable, sous reserve de balance des interets |

## Application a Royaume des Paraiges

### 1. Execution du contrat (article 6.1.b)

**Traitements concernes** :
- Creation de compte utilisateur
- Gestion du programme de fidelite (XP, cashback)
- Attribution et utilisation des coupons
- Enregistrement des achats

**Justification** : Ces traitements sont strictement necessaires pour fournir le service de fidelite promis a l'utilisateur lors de son inscription.

**Points d'attention** :
- Ne pas collecter plus de donnees que necessaire (minimisation)
- Informer clairement l'utilisateur des conditions du service

---

### 2. Consentement (article 6.1.a)

**Traitements concernes** :
- Preferences et likes sur les bieres/actualites
- Newsletter et communications marketing (si applicable)
- Cookies non essentiels (si applicable)

**Exigences du consentement valide** :
- [ ] **Libre** : pas de consequence negative en cas de refus
- [ ] **Specifique** : un consentement par finalite
- [ ] **Eclaire** : information claire et comprehensible
- [ ] **Univoque** : action positive claire (pas de case pre-cochee)
- [ ] **Retirable** : aussi simple de retirer que de donner

**Actions requises** :
1. Implementer un mecanisme de consentement explicite dans l'app
2. Conserver la preuve du consentement (date, version CGU, action)
3. Permettre le retrait facile du consentement

---

### 3. Interet legitime (article 6.1.f)

**Traitements concernes** :
- Classements (leaderboards)
- Statistiques d'usage
- Securite et prevention des fraudes

**Test de mise en balance** (obligatoire) :

| Critere | Evaluation |
|---------|------------|
| Finalite legitime ? | Oui - gamification et amelioration du service |
| Traitement necessaire ? | Oui - pas d'alternative moins intrusive |
| Balance des interets | A documenter - les utilisateurs s'attendent a ces fonctionnalites |

**Points d'attention** :
- Documenter l'analyse de balance des interets
- Informer les utilisateurs de ce traitement
- Permettre l'opposition (droit d'opposition - article 21)

---

### 4. Obligation legale (article 6.1.c)

**Traitements concernes** :
- Conservation des donnees de transaction (comptabilite)
- Reponse aux requisitions judiciaires

**Textes applicables** :
- Code de commerce (article L123-22) : 10 ans pour les pieces comptables
- Code general des impots : obligations declaratives

---

## Tableau recapitulatif

| Donnee | Base legale principale | Base legale secondaire |
|--------|----------------------|----------------------|
| Email | Contrat | - |
| Nom, prenom | Contrat | - |
| Telephone | Contrat | - |
| Date de naissance | Contrat | Obligation legale (verification age) |
| Historique achats | Contrat | Obligation legale (comptabilite) |
| Points XP | Contrat | - |
| Cashback | Contrat | - |
| Coupons | Contrat | - |
| Likes/preferences | Consentement | - |
| Classements | Interet legitime | - |
| Statistiques | Interet legitime | - |

---

## Actions a implementer

### Priorite haute
- [ ] Rediger les CGU/CGV incluant la description des traitements
- [ ] Implementer le recueil du consentement pour les traitements optionnels
- [ ] Documenter l'analyse d'interet legitime

### Priorite moyenne
- [ ] Mettre en place le mecanisme d'opposition pour l'interet legitime
- [ ] Conserver les preuves de consentement

---

**Derniere mise a jour** : 2026-01-23
