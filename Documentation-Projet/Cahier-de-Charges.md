# Cahier des Charges - Plateforme E-Commerce Centralisée

## 1. Informations Générales

**Projet**: Plateforme E-Commerce Centralisée avec Recommandations IA et Affiliation
**Période**: Octobre - Décembre 2025
**Type**: Projet académique

## 2. Concept du Projet

Plateforme e-commerce permettant aux utilisateurs de rechercher et comparer des produits de multiples sources (catalogue interne et sites externes) via un système de recommandation basé sur l'IA. L'utilisateur accède à une interface unique pour comparer prix et caractéristiques sans naviguer sur plusieurs sites. La monétisation s'effectue via affiliation sur les produits externes.

## 3. Objectifs

### Fonctionnels
- Catalogue produits interne consultable
- Système de recommandation IA pour recherche de produits externes
- Agrégation multi-sources en temps réel
- Comparaison unifiée des produits
- Génération de revenus via affiliation

### Techniques
- Architecture microservices distribuée
- Intégration IA pour recommandations
- Web scraping et API externes
- Paiements PayPal pour produits internes
- Résilience et gestion d'erreurs

## 4. Spécifications Fonctionnelles

### 4.1 User Service
- Gestion des comptes (CLIENT, ADMIN)
- Authentification et profils utilisateur
- Historique de commandes

### 4.2 Product Service
- CRUD produits avec catégories intégrées
- Gestion stock et disponibilité
- Recherche par catégorie et mot-clé

### 4.3 Order Service
- Création commandes (produits internes)
- Gestion statuts (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Vérification disponibilité via OpenFeign
- Mise à jour stock automatique
- Annulation avec restauration stock

### 4.4 Payment Service
- Intégration PayPal (produits internes)
- Workflow: Create → Approve → Execute
- Gestion transactions: PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED

### 4.5 External Aggregator Service
- Intégration UNE API externe (Amazon prioritaire)
- Normalisation des données produits
- Génération liens d'affiliation automatique
- Gestion erreurs et fallback
- Cache simple (optionnel)

### 4.6 AI Recommendation Service (Version Simplifiée)
- Analyse basique des requêtes utilisateur (regex/keywords)
- Recherche dans Product Service (internes)
- Appel External Aggregator (externes)
- Agrégation et ranking simple des résultats
- Tracking clics basique

Note: Pas d'OpenAI GPT-4, Machine Learning complexe, ou analyse vocale/image

### 4.7 Infrastructure
- **Eureka Server**: Découverte de services (8761)
- **Config Server**: Configuration centralisée (8888)
- **API Gateway**: Point d'entrée unique (8080)
- **OpenFeign**: Communication inter-services
- **Resilience4j**: Circuit breaker et fallback

## 5. Architecture

### 5.1 Microservices

**Infrastructure (3 services)**
- API Gateway (8080): Routage et load balancing
- Eureka Server (8761): Registre de services
- Config Server (8888): Configuration centralisée

**Core Business (4 services)**
- User Service (8083): Gestion utilisateurs
- Product Service (8081): Catalogue interne
- Order Service (8085): Gestion commandes
- Payment Service (8084): Paiements PayPal

**Agrégation (1-2 services)**
- External Aggregator Service (8087): Agrégation produits externes + affiliation
- AI Recommendation Service (8086): Recommandations simplifiées (optionnel selon temps)

**Total: 7-8 microservices**

### 5.2 Flux Principal (Recherche Simplifiée)

1. Utilisateur recherche "laptop gaming"
2. API Gateway → External Aggregator Service
3. External Aggregator Service:
   - Recherche Product Service (internes)
   - Appelle API Amazon (externes)
   - Normalisation données
   - Génération liens affiliation
4. External Aggregator:
   - Agrégation résultats internes + externes
   - Ranking simple
   - Retourne liste unifiée

### 5.3 Communication Inter-Services (OpenFeign)

- Order Service ↔ User Service: Validation utilisateur
- Order Service ↔ Product Service: Stock et prix
- External Aggregator ↔ Product Service: Produits internes
- External Aggregator ↔ Amazon API: Produits externes
- Payment Service ↔ PayPal API: Transactions

### 5.4 Persistance

**Bases de données H2 (une par service)**
- user_db, product_db, order_db, payment_db, aggregator_db

**Cache (Optionnel)**
- Résultats API externe (si temps disponible)

### 5.5 APIs Externes

- Amazon Product API: Produits Amazon
- PayPal REST API: Paiements
- Amazon Associates: Affiliation

## 6. Modèle de Données (Résumé)

### User
id, nom, prenom, email, role (CLIENT/ADMIN), actif, timestamps

### Product
id, nom, description, prix, stockQuantity, disponible, categoryName, categoryDescription, imageUrl, timestamps

### Order
id, orderNumber, userId, status (PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED), montantTotal, timestamps

### OrderItem
id, orderId, productId, quantity, prixUnitaire, sousTotal

### Payment
id, orderId, userId, amount, currency, method (PAYPAL), status (PENDING/COMPLETED/FAILED/CANCELLED/REFUNDED), paypalPaymentId, paypalPayerId, timestamps

### ExternalProduct
id, externalId, nom, description, prix, devise, source (AMAZON), externalUrl, affiliateLink, imageUrl, categoryName, disponible, rating, cachedAt, timestamps

### SearchQuery (Optionnel)
id, userId, queryText, resultsCount, clickedProductId, clickedSource, timestamps

## 7. Scénarios d'Utilisation

### 7.1 Recherche avec Agrégation (Principal)
1. Utilisateur: "laptop gaming"
2. External Aggregator Service reçoit requête
3. Recherche Product Service (internes) + API Amazon (externes)
4. Normalisation et génération liens affiliation
5. Agrégation et ranking simple
6. Affichage liste unifiée (ex: 3 internes + 10 Amazon)
7. Clic produit externe → Redirection avec lien affiliation

### 7.2 Achat Produit Interne
1. Sélection produit catalogue interne
2. Vérification stock et utilisateur
3. Création commande (PENDING)
4. Réduction stock automatique
5. Calcul montant
6. Processus paiement PayPal

### 7.3 Paiement PayPal
1. Création transaction PayPal
2. Redirection utilisateur
3. Approbation paiement
4. Exécution paiement
5. Statut COMPLETED

### 7.4 Résilience
1. Recherche "iPhone 15"
2. Si Amazon API indisponible → Circuit breaker
3. Fallback: retourne seulement produits internes
4. Agrégation sources disponibles

## 8. Technologies

### Backend Core
- Spring Boot 3.4.1, Spring Cloud, Java 17, Maven

### Agrégation
- Amazon Product API, Jsoup (parsing HTML)

### Cache (Optionnel)
- Redis ou Spring Cache simple

### Persistence
- Spring Data JPA, Hibernate, H2 Database

### Communication
- OpenFeign, RestTemplate

### Résilience
- Resilience4j Circuit Breaker

### Paiement et Affiliation
- PayPal REST API
- Amazon Associates

### Monitoring
- Spring Boot Actuator, Logback

### Outils
- Lombok, MapStruct, Bean Validation

## 9. Planning (8 Semaines - 2 Mois)

### Phase 1: Infrastructure et Services Core (Semaines 1-5)
- Config/Eureka/Gateway Server
- User Service: CRUD avec rôles
- Product Service: CRUD avec catégories
- Order Service: Gestion commandes + OpenFeign
- Payment Service: Intégration PayPal
- Tests inter-services

### Phase 2: Agrégation Simplifiée (Semaines 6-7)
- AI Recommendation Service (version simplifiée, sans OpenAI)
- External Aggregator + UNE API externe (Amazon prioritaire)
- Tracking affiliation basique
- Cache simple (optionnel)

### Phase 3: Tests et Validation (Semaine 7.5)
- Tests de bout en bout
- Validation tous scénarios
- Circuit breakers

### Phase 4: Documentation et Présentation (Semaine 8)
- Documentation technique finale
- Diagrammes architecture/classes
- Guides utilisation
- Démonstration live

## 10. Livrables

### Code
- 7 microservices (3 Infrastructure + 4 Core + Aggregator simplifié)
- Scripts démarrage
- Collection Postman

### Documentation
- Cahier de charges, documentation technique
- Diagrammes UML
- Guides déploiement et APIs

### Tests
- Tests unitaires et d'intégration
- Validation scénarios utilisateur

## 11. Critères de Validation

### Fonctionnels
- Tous services démarrent et s'enregistrent dans Eureka
- APIs REST fonctionnelles
- OpenFeign opérationnel
- Persistance H2
- PayPal sandbox fonctionnel
- Circuit breakers actifs
- Agrégation d'au moins UNE source externe
- Recherche produits internes + externes
- Tracking clics basique

### Démonstration
1. Eureka Dashboard (7 services)
2. Recherche produit → Résultats internes + externes
3. Création commande → Stock mis à jour
4. Paiement PayPal complet
5. Console H2 avec données
6. Circuit breaker en action

## 12. Scope Révisé (Réaliste pour 2 Mois)

### Inclus
- Architecture microservices (7 services)
- Catalogue interne complet
- Agrégation UNE source externe (Amazon)
- Recommandations simples (sans IA complexe)
- Paiements PayPal
- Tracking affiliation basique
- Communication OpenFeign
- Circuit breakers

### Exclu (Hors Scope)
- OpenAI GPT-4 (trop complexe/coûteux)
- Multiples sources externes (seulement Amazon)
- Service Affiliation dédié (fonctionnalité intégrée)
- Redis cache (optionnel)
- Machine Learning personnalisé
- Analyse vocale/image

