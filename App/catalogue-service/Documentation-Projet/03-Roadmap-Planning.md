# Roadmap - Planning du Projet

## 📅 Durée Totale: 6-8 Semaines (Octobre-Novembre 2025)

---

## 🗓️ Planning Détaillé

### Semaine 1-2: Infrastructure & Fondations

#### Objectifs
- Setup de l'environnement
- Création des services d'infrastructure
- Configuration Maven multi-modules

#### Tâches Réalisées
- ✅ Création du projet parent Maven
- ✅ Configuration des dépendances Spring Cloud
- ✅ **Config Server** (Port 8888)
  - Configuration centralisée
  - Repository Git/Filesystem
- ✅ **Eureka Server** (Port 8761)
  - Service Discovery
  - Dashboard web
- ✅ **API Gateway** (Port 8080)
  - Routing intelligent
  - Load balancing

**Livrable**: Infrastructure opérationnelle

---

### Semaine 3: Category Service

#### Objectifs
- Premier service métier fonctionnel
- CRUD complet
- Enregistrement Eureka

#### Tâches Réalisées
- ✅ Entité `Category` (JPA)
- ✅ Repository interface
- ✅ Service layer (logique métier)
- ✅ Controller REST (endpoints)
- ✅ DTO et Mapper (MapStruct)
- ✅ Validation (Bean Validation)
- ✅ Configuration H2
- ✅ Tests Postman

**Endpoints API**:
```
GET    /api/categories          → Liste toutes les catégories
GET    /api/categories/{id}     → Une catégorie par ID
POST   /api/categories          → Créer une catégorie
PUT    /api/categories/{id}     → Modifier une catégorie
DELETE /api/categories/{id}     → Supprimer une catégorie
```

**Livrable**: Category Service opérationnel

---

### Semaine 4: Product Service

#### Objectifs
- Service métier avec relations
- Communication inter-services (Feign)
- Gestion stocks

#### Tâches Réalisées
- ✅ Entité `Product` (JPA)
- ✅ Référence `categoryId` (pas de @ManyToOne car microservices)
- ✅ Repository interface
- ✅ Service layer avec logique métier
- ✅ **Feign Client** vers Category Service
- ✅ Validation catégorie existe avant création produit
- ✅ Gestion stock et disponibilité
- ✅ Controller REST
- ✅ Circuit Breaker (Resilience4j)

**Endpoints API**:
```
GET    /api/products                    → Liste tous les produits
GET    /api/products/{id}               → Un produit par ID
GET    /api/products/category/{id}      → Produits d'une catégorie
POST   /api/products                    → Créer un produit
PUT    /api/products/{id}               → Modifier un produit
DELETE /api/products/{id}               → Supprimer un produit
PUT    /api/products/{id}/stock         → Mettre à jour le stock
```

**Challenge Résolu**: Communication Product → Category  
**Solution**: Feign Client avec fallback

**Livrable**: Product Service opérationnel avec communication inter-services

---

### Semaine 5: Order Service

#### Objectifs
- Service commandes complexe
- Gestion multi-produits
- Calculs automatiques

#### Tâches Réalisées
- ✅ Entités `Order` et `OrderItem` (JPA)
- ✅ Relation @OneToMany (Order → OrderItems)
- ✅ Enum `OrderStatus`
- ✅ Repository interfaces
- ✅ Service layer complexe
- ✅ **Feign Client** vers Product Service
- ✅ Validation stock disponible
- ✅ Calcul automatique sous-totaux
- ✅ Calcul automatique montant total
- ✅ Mise à jour stock après commande
- ✅ Controller REST

**Endpoints API**:
```
GET    /api/orders                 → Liste toutes les commandes
GET    /api/orders/{id}            → Une commande par ID
GET    /api/orders/client/{email}  → Commandes d'un client
POST   /api/orders                 → Créer une commande
PUT    /api/orders/{id}/status     → Changer le statut
PUT    /api/orders/{id}/cancel     → Annuler une commande
```

**Challenge Résolu**: Vérification stocks + mise à jour atomique  
**Solution**: Transaction avec appels Feign

**Livrable**: Order Service opérationnel avec logique métier complexe

---

### Semaine 6: Intégration & Tests

#### Objectifs
- Tester tous les scénarios
- Résoudre les bugs
- Optimiser les performances

#### Tâches Réalisées
- ✅ Tests scénario complet (Catégorie → Produit → Commande)
- ✅ Tests fallback (service down)
- ✅ Tests validation données
- ✅ Collection Postman complète
- ✅ Vérification logs
- ✅ Tests H2 Console
- ✅ Tests Eureka Dashboard

**Scénarios Testés**:
1. ✅ Créer catégorie "Électronique"
2. ✅ Créer produit "Laptop" dans "Électronique"
3. ✅ Créer commande avec 2 laptops
4. ✅ Vérifier stock réduit de 2
5. ✅ Tester avec catégorie inexistante → Erreur 400
6. ✅ Tester avec stock insuffisant → Erreur 400
7. ✅ Tester Circuit Breaker (service down)

**Livrable**: Projet stable et testé

---

### Semaine 7: Documentation

#### Objectifs
- Documentation technique complète
- Diagrammes UML
- Guides utilisateur

#### Tâches Réalisées
- ✅ **Cahier de charges** (ce document)
- ✅ **Benchmark technologies**
- ✅ **Roadmap** (planning)
- ✅ **Stack technique**
- ✅ Diagrammes UML:
  - Diagramme de classes (Mermaid)
  - Architecture microservices
  - Séquence communication
  - Diagramme ERD (base de données)
- ✅ README.md (guide quick start)
- ✅ Guide Postman
- ✅ Scripts de démarrage

**Livrable**: Documentation professionnelle

---

### Semaine 8: Présentation

#### Objectifs
- Préparer la présentation
- Démonstration live
- Q&A

#### Contenu Présentation
1. **Introduction** (2 min)
   - Contexte du projet
   - Objectifs pédagogiques

2. **Architecture** (5 min)
   - Schéma microservices
   - Explication des patterns
   - Justification des choix

3. **Démonstration Live** (8 min)
   - Eureka Dashboard
   - Postman: Créer catégorie
   - Postman: Créer produit
   - Postman: Créer commande
   - H2 Console: Voir les données
   - Montrer Circuit Breaker

4. **Code Highlights** (3 min)
   - Feign Client
   - Circuit Breaker
   - Validation

5. **Extensions Futures** (2 min)
   - Concept chatbot IA
   - Recommandations
   - Frontend web

6. **Q&A** (5 min)

**Livrable**: Présentation PowerPoint + Démo live

---

## 📊 Diagramme de Gantt (Simplifié)

```
Semaine 1-2: Infrastructure
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Semaine 3: Category Service
░░░░░░░░████░░░░░░░░░░░░░░░░░░░░░░░░

Semaine 4: Product Service
░░░░░░░░░░░░████░░░░░░░░░░░░░░░░░░░░

Semaine 5: Order Service
░░░░░░░░░░░░░░░░████░░░░░░░░░░░░░░░░

Semaine 6: Tests & Intégration
░░░░░░░░░░░░░░░░░░░░████░░░░░░░░░░░░

Semaine 7: Documentation
░░░░░░░░░░░░░░░░░░░░░░░░████░░░░░░░░

Semaine 8: Présentation
░░░░░░░░░░░░░░░░░░░░░░░░░░░░████░░░░
```

---

## 🎯 Jalons (Milestones)

### ✅ Milestone 1: Infrastructure Ready (Semaine 2)
- Config Server opérationnel
- Eureka Server avec dashboard
- API Gateway route vers services

### ✅ Milestone 2: First Service (Semaine 3)
- Category Service CRUD complet
- Enregistré dans Eureka
- Tests Postman passent

### ✅ Milestone 3: Inter-Service Communication (Semaine 4)
- Product Service communique avec Category Service
- Feign Client fonctionne
- Circuit Breaker implémenté

### ✅ Milestone 4: Complex Business Logic (Semaine 5)
- Order Service crée commandes multi-produits
- Calculs automatiques corrects
- Stock mis à jour

### ✅ Milestone 5: Projet Stable (Semaine 6)
- Tous les scénarios testés
- Pas de bugs critiques
- Performance acceptable

### ✅ Milestone 6: Documentation Complete (Semaine 7)
- Tous les documents rédigés
- Diagrammes UML créés
- Code commenté

### 🎯 Milestone 7: Présentation Réussie (Semaine 8)
- Démo live sans erreur
- Questions du prof répondues
- Note finale!

---

## 🔄 Méthodologie de Travail

### Approche Agile (Adaptée)

#### Sprints Courts (1-2 semaines)
Chaque semaine = Un sprint avec objectif clair

#### Daily Work
- Coder 2-3h par jour
- Commit Git réguliers
- Tests au fur et à mesure

#### Review de Sprint
- Fin de semaine: vérifier objectifs atteints
- Ajuster le plan si nécessaire
- Documenter les problèmes rencontrés

---

## 📈 Évolution des Compétences

### Courbe d'Apprentissage

```
Compétence
    ↑
    │
100%│                            ╱──────
    │                        ╱───
    │                    ╱───
 75%│              ╱─────
    │          ╱───
 50%│     ╱────
    │  ╱──
    │╱
    └────────────────────────────────→ Temps
     S1  S2  S3  S4  S5  S6  S7  S8
```

#### Semaine 1-2: Apprentissage
- Découverte Spring Cloud
- Setup environment
- Premiers pas Eureka/Gateway

#### Semaine 3-4: Montée en Compétence
- Maîtrise CRUD
- Communication inter-services
- Feign Client

#### Semaine 5-6: Expertise
- Logique métier complexe
- Gestion d'erreurs avancée
- Optimisation

#### Semaine 7-8: Synthèse
- Vue d'ensemble
- Capacité d'explication
- Présentation professionnelle

---

## 🎓 Livrables Finaux

### Code Source
- ✅ 6 microservices fonctionnels
- ✅ Git repository avec historique
- ✅ Code propre et commenté
- ✅ Architecture claire

### Documentation
- ✅ Cahier de charges (ce document)
- ✅ Benchmark technologies
- ✅ Roadmap/planning
- ✅ Stack technique détaillée
- ✅ Diagrammes UML
- ✅ README quick start

### Outils
- ✅ Script `start-all-services.bat`
- ✅ Collection Postman complète
- ✅ Fichier `api-tester.html`

### Présentation
- ✅ PowerPoint (~20 slides)
- ✅ Démo live préparée
- ✅ Vidéo backup (au cas où)

---

## 🔮 Extensions Futures (Hors Scope Actuel)

Si le projet devait continuer au-delà du semestre:

### Court Terme (1-2 mois supplémentaires)
- Frontend web (React/Vue)
- Dashboard admin
- Authentification JWT
- Base MySQL en production

### Moyen Terme (3-6 mois)
- Notifications email
- Système de paiement (Stripe)
- Recherche avancée
- Analytics

### Long Terme (6-12 mois)
- **Chatbot IA conversationnel**
  - "Je cherche un laptop gaming"
  - Recommendations intelligentes
  - Commandes vocales
- Application mobile (iOS/Android)
- Marketplace multi-vendeurs

**Note**: L'IA est une vision future, mais l'architecture actuelle la rend possible!

---

## ✅ Statut Actuel

### Ce Qui Est Fait ✅
- [x] Infrastructure complète (Config, Eureka, Gateway)
- [x] Category Service (CRUD)
- [x] Product Service (CRUD + Feign)
- [x] Order Service (CRUD + logique complexe)
- [x] Communication inter-services
- [x] Circuit breakers
- [x] Tests complets
- [x] Documentation

### Ce Qui Reste (Cette Semaine) 📝
- [ ] Finaliser présentation PowerPoint
- [ ] Préparer démo live (répéter)
- [ ] Imprimer documentation (si requis)
- [ ] Créer vidéo backup (optionnel)

---

## 🎯 Critères de Réussite

Le projet sera considéré réussi si:

### Technique (60%)
- ✅ Architecture microservices fonctionnelle
- ✅ 6 services opérationnels
- ✅ Communication inter-services
- ✅ Gestion d'erreurs (circuit breaker)
- ✅ Code propre et structuré

### Documentation (20%)
- ✅ Documentation complète et claire
- ✅ Diagrammes UML pertinents
- ✅ Explications des choix techniques

### Présentation (20%)
- ⏳ Démo live réussie
- ⏳ Explication claire de l'architecture
- ⏳ Réponses aux questions du professeur

---

## 📊 Estimation Effort

### Temps Total: ~120-160 heures

| Phase | Heures | % Total |
|-------|--------|---------|
| Infrastructure | 15h | 10% |
| Category Service | 12h | 8% |
| Product Service | 20h | 13% |
| Order Service | 30h | 19% |
| Tests & Debug | 25h | 16% |
| Documentation | 20h | 13% |
| Apprentissage | 25h | 16% |
| Présentation | 10h | 6% |

**Répartition**: ~2-3h/jour sur 6-8 semaines

---

## 🏆 Résultat Final

**Projet**: ✅ **100% COMPLET ET FONCTIONNEL**

- Architecture microservices moderne
- Communication inter-services validée
- Résilience implémentée (circuit breakers)
- Documentation professionnelle
- Prêt pour démonstration

**Prochaine Étape**: Présentation et soutenance! 🎓

---

**Planning établi**: Octobre 2025  
**Réalisé**: Novembre 2025  
**Respect du planning**: ✅ 100%

