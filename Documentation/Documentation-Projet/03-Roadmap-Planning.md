# Roadmap - Planning du Projet

## 📅 Durée Totale: 8 Semaines (Octobre-Décembre 2025)

**Architecture**: 4 Services Métier + 3 Services Infrastructure  
**Complexité**: Moyenne-Haute (inclut PayPal et OpenFeign)  
**Objectif**: Plateforme e-commerce complète avec paiement

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

### Semaine 3: User Service (Gestion Utilisateurs)

#### Objectifs
- Premier service métier avec gestion des utilisateurs
- Système de rôles (CLIENT/ADMIN)
- CRUD complet + activation/désactivation

#### Tâches Réalisées
- ✅ Entité `User` (JPA) avec rôles
- ✅ Enum `UserRole` (CLIENT, ADMIN)
- ✅ Repository interface
- ✅ Service layer (logique métier)
- ✅ Controller REST (endpoints)
- ✅ DTO et Mapper (MapStruct)
- ✅ Validation (Bean Validation)
- ✅ Gestion activation/désactivation comptes
- ✅ Configuration H2
- ✅ Tests Postman

**Endpoints API**:
```
GET    /api/users                → Liste tous les utilisateurs
GET    /api/users/{id}           → Un utilisateur par ID
GET    /api/users/email/{email}  → Utilisateur par email
GET    /api/users/role/{role}    → Utilisateurs par rôle
POST   /api/users                → Créer un utilisateur
PUT    /api/users/{id}           → Modifier un utilisateur
PATCH  /api/users/{id}/activate  → Activer un compte
PATCH  /api/users/{id}/deactivate→ Désactiver un compte
DELETE /api/users/{id}           → Supprimer un utilisateur
```

**Livrable**: User Service opérationnel avec gestion des rôles

---

### Semaine 4: Product Service (Catégories Intégrées)

#### Objectifs
- Service produits avec catégories embarquées
- Recherche et filtrage
- Gestion stocks

#### Tâches Réalisées
- ✅ Entité `Product` avec catégorie intégrée (categoryName, categoryDescription)
- ✅ Plus de service Category séparé → Architecture simplifiée
- ✅ Repository interface avec requêtes personnalisées
- ✅ Service layer avec logique métier
- ✅ Gestion stock et disponibilité
- ✅ Recherche par catégorie et mot-clé
- ✅ Controller REST
- ✅ Circuit Breaker (Resilience4j) pour futures extensions

**Endpoints API**:
```
GET    /api/products                    → Liste tous les produits
GET    /api/products/{id}               → Un produit par ID
GET    /api/products/category/{name}    → Produits d'une catégorie
GET    /api/products/search?keyword=... → Recherche produits
GET    /api/products/available          → Produits disponibles
POST   /api/products                    → Créer un produit
PUT    /api/products/{id}               → Modifier un produit
DELETE /api/products/{id}               → Supprimer un produit
PATCH  /api/products/{id}/stock         → Mettre à jour le stock
```

**Décision Architecture**: Catégories intégrées dans Product  
**Raison**: Simplification (pas besoin de service séparé pour des données simples)

**Livrable**: Product Service opérationnel avec catégories embarquées

---

### Semaine 5: Order Service (Communication OpenFeign)

#### Objectifs
- Service commandes avec intégration multi-services
- Utilisation userId au lieu de données client dupliquées
- Communication OpenFeign (User + Product)

#### Tâches Réalisées
- ✅ Entités `Order` et `OrderItem` (JPA)
- ✅ Relation @OneToMany (Order → OrderItems)
- ✅ Référence `userId` (pas de duplication données client)
- ✅ Enum `OrderStatus` (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- ✅ Repository interfaces
- ✅ Service layer complexe
- ✅ **OpenFeign Client** vers User Service (vérification utilisateur)
- ✅ **OpenFeign Client** vers Product Service (vérification stock)
- ✅ Validation stock disponible
- ✅ Calcul automatique sous-totaux et total
- ✅ Mise à jour stock après commande via Feign
- ✅ Annulation commande (restaure stock)
- ✅ Controller REST

**Endpoints API**:
```
GET    /api/orders                 → Liste toutes les commandes
GET    /api/orders/{id}            → Une commande par ID
GET    /api/orders/user/{userId}   → Commandes d'un utilisateur
GET    /api/orders/status/{status} → Commandes par statut
POST   /api/orders                 → Créer une commande
PATCH  /api/orders/{id}/status     → Changer le statut
PATCH  /api/orders/{id}/cancel     → Annuler (restaure stock)
DELETE /api/orders/{id}            → Supprimer une commande
```

**Communication OpenFeign**:
1. Order → User Service: Vérifie que l'utilisateur existe
2. Order → Product Service: Vérifie stock et récupère prix
3. Order → Product Service: Met à jour le stock

**Challenge Résolu**: Coordination multi-services sans duplication données  
**Solution**: OpenFeign + références par ID + circuit breaker

**Livrable**: Order Service avec communication inter-services complète

---

### Semaine 5.5: Payment Service (Intégration PayPal) 🆕

#### Objectifs
- Service paiement avec SDK PayPal
- Workflow complet (Create → Approve → Execute)
- Gestion états paiement

#### Tâches Réalisées
- ✅ Entité `Payment` (JPA)
- ✅ Enum `PaymentMethod` (PAYPAL)
- ✅ Enum `PaymentStatus` (PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED)
- ✅ Configuration PayPal SDK + Config Server
- ✅ Service `PayPalService` (intégration API PayPal)
- ✅ Service `PaymentService` (logique métier)
- ✅ Controller REST
- ✅ **Tests unitaires** (7/7 passed ✅)
- ✅ Sandbox PayPal configuré

**Endpoints API**:
```
POST   /api/payments/paypal/create      → Créer paiement PayPal
POST   /api/payments/paypal/execute     → Exécuter après approbation
POST   /api/payments/paypal/cancel/{id} → Annuler paiement
GET    /api/payments/{id}               → Détails paiement
GET    /api/payments/order/{orderId}    → Paiements d'une commande
```

**Workflow PayPal**:
1. Client: POST /create → Reçoit `approvalUrl`
2. Client approuve sur PayPal
3. Client: POST /execute avec `payerId`
4. Statut: COMPLETED ✅

**Challenge Résolu**: Intégration API externe sécurisée  
**Solution**: PayPal SDK + credentials dans Config Server

**Livrable**: Payment Service opérationnel avec PayPal sandbox

---

### Semaine 6: Intégration & Tests

#### Objectifs
- Tester tous les scénarios avec PayPal
- Résoudre les bugs
- Optimiser les performances

#### Tâches Réalisées
- ✅ Tests scénario complet (User → Produit → Commande → Paiement)
- ✅ Tests OpenFeign (User→Order, Order→Product)
- ✅ Tests PayPal sandbox (create/execute/cancel)
- ✅ Tests fallback (service down)
- ✅ Tests validation données
- ✅ Collection Postman complète avec PayPal
- ✅ Vérification logs
- ✅ Tests H2 Console (4 bases de données)
- ✅ Tests Eureka Dashboard (7 services)

**Scénarios Testés**:
1. ✅ Créer utilisateur CLIENT
2. ✅ Créer produit "Laptop" (catégorie: Electronics)
3. ✅ Créer commande (userId + productId)
4. ✅ Vérifier stock réduit automatiquement
5. ✅ Créer paiement PayPal pour la commande
6. ✅ Simuler approbation PayPal
7. ✅ Exécuter paiement (statut COMPLETED)
8. ✅ Consulter historique commandes via User Service (OpenFeign)
9. ✅ Tester avec utilisateur inexistant → Erreur 404
10. ✅ Tester avec stock insuffisant → Erreur 400
11. ✅ Tester Circuit Breaker (service down)

**Livrable**: Projet stable et entièrement testé

---

### Semaine 7: Documentation

#### Objectifs
- Documentation technique complète
- Diagrammes Mermaid
- Guides utilisateur

#### Tâches Réalisées
- ✅ **Cahier de charges** (services + PayPal + vision IA)
- ✅ **Benchmark technologies** (PayPal vs Stripe, 4 options IA)
- ✅ **Roadmap** (planning 8 semaines)
- ✅ **Stack technique** (détails technologies)
- ✅ Diagrammes Mermaid:
  - Architecture microservices complète
  - Diagrammes de classes détaillés (tous services)
  - Séquence communication OpenFeign
  - Flow PayPal complet
- ✅ README.md (guide quick start)
- ✅ Guide Postman complet
- ✅ Guide intégration PayPal
- ✅ Scripts de démarrage

**Documents Créés**:
- `01-Cahier-de-Charges.md` (avec section IA conceptuelle)
- `02-Benchmark-Technologies.md` (comparaison PayPal + 4 solutions IA)
- `03-Roadmap-Planning.md`
- `04-Stack-Technique.md`
- `ARCHITECTURE-DIAGRAM.md` (Mermaid)
- `CLASS-DIAGRAMS.md` (Mermaid détaillé)
- `USER-ORDER-PAYPAL-INTEGRATION.md`

**Livrable**: Documentation professionnelle et complète

---

### Semaine 8: Présentation

#### Objectifs
- Préparer la présentation finale
- Démonstration live complète
- Q&A professionnelle

#### Contenu Présentation (20-25 min)

1. **Introduction** (2 min)
   - Contexte: Plateforme e-commerce microservices
   - Objectifs: Architecture moderne + PayPal + Vision IA
   - Technologies clés

2. **Architecture** (5 min)
   - Schéma 7 microservices (3 Infra + 4 Métier)
   - Patterns: Service Discovery, Gateway, OpenFeign, Circuit Breaker
   - Justification vs monolithe

3. **Démonstration Live** (10 min)
   - Eureka Dashboard → Tous services enregistrés
   - **Flow complet Postman**:
     1. POST User (CLIENT)
     2. POST Product (avec catégorie)
     3. POST Order → Stock diminue (OpenFeign demo)
     4. POST Payment PayPal → Afficher approvalUrl
     5. GET User Orders → Via OpenFeign
   - H2 Console → 4 bases de données
   - Circuit Breaker → Stop service, voir fallback

4. **Code Highlights** (4 min)
   - OpenFeign: User→Order communication
   - PayPal SDK: Create/Execute flow
   - Resilience4j: Circuit breaker
   - Validation: Bean Validation

5. **Extensions Futures - Vision IA** (2 min)
   - Système recommandation (NON implémenté)
   - 4 solutions comparées documentées
   - Architecture extensible démontrée

6. **Q&A** (5 min)
   - Questions jury
   - Challenges résolus
   - Apprentissages clés

**Livrable**: Présentation + Démo live impeccable

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

### ✅ Milestone 2: First Service - User Management (Semaine 3)
- User Service CRUD complet avec rôles
- Enregistré dans Eureka
- Tests Postman passent

### ✅ Milestone 3: Product with Embedded Categories (Semaine 4)
- Product Service avec catégories intégrées
- Recherche et filtrage fonctionnels
- Architecture simplifiée (pas de service séparé)

### ✅ Milestone 4: Inter-Service Communication (Semaine 5)
- Order Service communique avec User + Product
- OpenFeign fonctionne (vérification user + stock)
- Stock mis à jour automatiquement
- Circuit Breaker implémenté

### ✅ Milestone 5: Payment Integration (Semaine 5.5)
- Payment Service avec PayPal SDK
- Flow Create → Approve → Execute
- Tests unitaires 7/7 passed
- Sandbox PayPal opérationnel

### ✅ Milestone 6: Projet Stable (Semaine 6)
- Tous les scénarios testés (User→Order→Payment)
- OpenFeign inter-services validé
- PayPal workflow complet testé
- Pas de bugs critiques

### ✅ Milestone 7: Documentation Complete (Semaine 7)
- 4 documents techniques rédigés
- Diagrammes Mermaid créés
- Guide PayPal + Vision IA documentée
- Code commenté

### 🎯 Milestone 8: Présentation Réussie (Semaine 8)
- Démo live sans erreur
- Questions jury répondues
- Note finale excellente!

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
- ✅ **7 microservices** fonctionnels (3 Infra + 4 Métier)
  - Infrastructure: Eureka, Config, Gateway
  - Métier: User, Product, Order, Payment
- ✅ Git repository avec historique propre
- ✅ Code clean et bien structuré
- ✅ Architecture microservices moderne

### Documentation
- ✅ **Cahier de charges** (avec vision IA conceptuelle)
- ✅ **Benchmark technologies** (PayPal + 4 solutions IA comparées)
- ✅ **Roadmap/planning** (8 semaines)
- ✅ **Stack technique** détaillée
- ✅ **Diagrammes Mermaid** (Architecture + Classes détaillés)
- ✅ **Guide intégration PayPal**
- ✅ **README** quick start

### Outils & Tests
- ✅ Script `start-all-services.bat`
- ✅ **Collection Postman complète** (inclut tests PayPal)
- ✅ **Tests unitaires** Payment Service (7/7 passed)
- ✅ Fichier `api-tester.html`

### Présentation
- ✅ PowerPoint (~25 slides)
- ✅ Démo live préparée (User→Product→Order→Payment)
- ✅ Vidéo backup (sécurité)

---

## 🔮 Extensions Futures (Hors Scope Actuel - Non Implémenté)

### Court Terme (1-2 mois supplémentaires)
- ❌ Frontend web (React/Vue avec dashboard)
- ❌ Authentification JWT complète
- ❌ Gestion sessions utilisateur
- ❌ Base MySQL en production
- ❌ Dockerisation services

### Moyen Terme (3-6 mois)
- ❌ Notifications email (commande confirmée, paiement reçu)
- ❌ Système de promotions/coupons
- ❌ Recherche avancée avec filtres
- ❌ Analytics dashboard admin
- ❌ Avis clients/ratings produits

### Long Terme - Vision IA (6-12 mois)
- ❌ **Système de recommandation** (4 options documentées)
  - Option 1: OpenAI GPT-4 (chatbot conversationnel)
  - Option 2: ML Custom (collaborative filtering)
  - Option 3: Rasa Open Source (chatbot gratuit)
  - Option 4: Embeddings (recherche sémantique)
- ❌ Recherche intelligente en langage naturel
- ❌ Prédiction tendances
- ❌ Personnalisation temps réel

**Note**: La vision IA est **documentée mais NON implémentée**. Elle démontre:
- Scalabilité de l'architecture
- Capacité d'évolution sans refactoring
- Compréhension des tendances marché
- Ajout de service sans modifier les existants

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

