# Plateforme E-Commerce Microservices

Plateforme e-commerce centralisée avec architecture microservices, permettant l'agrégation de produits de sources multiples et l'intégration de paiements PayPal.

---

## Vue d'Ensemble

**Concept** : Plateforme permettant aux utilisateurs de rechercher et comparer des produits provenant du catalogue interne et de sources externes (Amazon) via une interface unifiée. Monétisation par liens d'affiliation.

**Architecture** : 7-8 microservices avec écosystème Spring Cloud  
**Durée** : 8 semaines (2 mois)  
**Statut** : Services core complétés, services d'agrégation en développement

---

## Architecture Microservices

### Services d'Infrastructure
| Service | Port | Statut | Description |
|---------|------|--------|-------------|
| **Config Server** | 8888 | ✅ | Configuration centralisée |
| **Eureka Server** | 8761 | ✅ | Découverte de services |
| **API Gateway** | 8080 | ✅ | Point d'entrée, routage, circuit breakers |

### Services Métier
| Service | Port | Statut | Description |
|---------|------|--------|-------------|
| **User Service** | 8083 | ✅ | Gestion utilisateurs (CLIENT, ADMIN) |
| **Product Service** | 8081 | ✅ | Catalogue produits avec catégories |
| **Order Service** | 8085 | ✅ | Gestion commandes et stock |
| **Payment Service** | 8084 | ✅ | Intégration PayPal |

### Services d'Agrégation (En Développement)
| Service | Port | Statut | Description |
|---------|------|--------|-------------|
| **External Aggregator** | 8087 | 🔨 | Agrégation Amazon & affiliation |
| **AI Recommendation** | 8086 | 🔨 | Recommandations simples |

---

## Démarrage Rapide

### 1. Lancer Tous les Services
```bash
start-all-services.bat
```
Démarre automatiquement tous les services dans le bon ordre.

### 2. Vérifier le Fonctionnement
**Dashboard Eureka** : http://localhost:8761  
Tous les services doivent apparaître avec le statut UP.

### 3. Accéder aux APIs
Toutes les requêtes passent par la gateway : `http://localhost:8080`

---

## Endpoints Principaux

### Utilisateurs
```
GET    /api/users              # Liste des utilisateurs
GET    /api/users/{id}         # Détails utilisateur
POST   /api/users              # Créer utilisateur
PUT    /api/users/{id}         # Modifier utilisateur
DELETE /api/users/{id}         # Supprimer utilisateur
```

### Produits
```
GET    /api/products                    # Liste des produits
GET    /api/products/{id}               # Détails produit
GET    /api/products/category/{name}    # Produits par catégorie
POST   /api/products                    # Créer produit
PUT    /api/products/{id}               # Modifier produit
PATCH  /api/products/{id}/stock         # Mettre à jour stock
```

### Commandes
```
GET    /api/orders                      # Liste des commandes
GET    /api/orders/{id}                 # Détails commande
GET    /api/orders/user/{userId}        # Commandes par utilisateur
POST   /api/orders                      # Créer commande
PATCH  /api/orders/{id}/cancel          # Annuler commande
```

### Paiements
```
POST   /api/payments/paypal/create      # Créer paiement PayPal
POST   /api/payments/paypal/execute     # Exécuter paiement
GET    /api/payments/{id}               # Détails paiement
```

---

## Bases de Données H2

Chaque service possède sa propre base H2 avec console web :

| Service | Console | JDBC URL | Login |
|---------|---------|----------|-------|
| User | http://localhost:8083/h2-console | jdbc:h2:mem:user_db | sa |
| Product | http://localhost:8081/h2-console | jdbc:h2:mem:product_db | sa |
| Order | http://localhost:8085/h2-console | jdbc:h2:mem:order_db | sa |
| Payment | http://localhost:8084/h2-console | jdbc:h2:mem:payment_db | sa |

**Mot de passe** : _(vide)_

---

## Tests avec Postman

1. **Importer** : `Catalogue-Microservices-Postman-Collection.json`
2. **Scénarios disponibles** :
   - Créer utilisateurs (CLIENT, ADMIN)
   - Créer produits avec catégories
   - Créer commandes (mise à jour stock automatique)
   - Traiter paiements PayPal (sandbox)
   - Tester circuit breakers

Guide détaillé : `Documentation-Projet/POSTMAN-TESTING-GUIDE.md`

---

## Démonstration Circuit Breaker

Les circuit breakers sont implémentés dans l'API Gateway pour la tolérance aux pannes.

**Pour démontrer** :
1. Arrêter Product Service
2. Appeler `GET http://localhost:8080/api/products`
3. Réponse fallback reçue :
```json
{
  "error": "Product Service is currently unavailable",
  "message": "Please try again later"
}
```

---

## Documentation Complète

Documentation technique dans `Documentation-Projet/` :

| Document | Description |
|----------|-------------|
| **01-Cahier-de-Charges.md** | Spécifications complètes du projet |
| **02-Benchmark-Technologies.md** | Justification des choix techniques |
| **03-Roadmap-Planning.md** | Planning réaliste 8 semaines |
| **04-Stack-Technique.md** | Vue d'ensemble stack technique |
| **README.md** | Index de la documentation |

---

## Stack Technique

### Backend
- Java 17 (LTS)
- Spring Boot 3.4.1
- Spring Cloud 2024.0.0 (Eureka, Gateway, Config, OpenFeign)
- Maven (projet multi-modules)

### Persistance
- H2 Database (in-memory, une par service)
- Spring Data JPA / Hibernate

### Communication & Résilience
- OpenFeign (clients REST déclaratifs)
- Resilience4j (circuit breakers)
- Spring Cloud Gateway (routage, load balancing)

### Intégrations Externes
- PayPal REST API (paiements)
- Amazon Product API (agrégation produits)

### Outils
- Lombok (réduction boilerplate)
- MapStruct (mapping DTO)
- Bean Validation (validation données)
- Spring Boot Actuator (monitoring)

---

## Structure du Projet

```
catalogue-service/
├── config-server/              # Serveur de configuration (8888)
├── eureka-server/              # Registre de services (8761)
├── api-gateway/                # Gateway avec circuit breakers (8080)
├── user-service/               # Gestion utilisateurs (8083)
├── product-service/            # Catalogue produits (8081)
├── order-service/              # Traitement commandes (8085)
├── payment-service/            # Intégration PayPal (8084)
├── external-aggregator-service/ # Agrégation Amazon (8087) [En Dev]
├── Documentation-Projet/       # Documentation technique complète
├── pom.xml                     # Configuration Maven parent
└── start-all-services.bat      # Script de démarrage
```

---

## Statut du Développement

### ✅ Complété (Semaines 1-5)
- Infrastructure (Config, Eureka, Gateway)
- User Service avec gestion des rôles
- Product Service avec catégories intégrées
- Order Service avec communication OpenFeign
- Payment Service avec PayPal sandbox
- Circuit breakers et mécanismes fallback
- Base H2 par service
- Communication inter-services via OpenFeign

### 🔨 En Cours (Semaines 6-7)
- External Aggregator Service avec API Amazon
- Agrégation recherche produits (interne + externe)
- Génération liens d'affiliation
- Système de recommandations simple

### 🎯 À Venir (Semaine 8)
- Tests d'intégration
- Finalisation documentation
- Préparation présentation

---

## Fonctionnalités Clés

**Architecture Microservices**
- Services indépendants avec bases séparées
- Découverte de services via Eureka
- Gateway pour routage et load balancing
- Circuit breakers pour tolérance aux pannes

**Communication Inter-Services**
- OpenFeign pour clients REST déclaratifs
- Découverte automatique des services
- Load balancing entre instances

**Gestion des Commandes**
- Création avec validation stock automatique
- Réduction stock après création
- Annulation avec restauration stock
- Suivi statut (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)

**Intégration PayPal**
- Environnement sandbox pour tests
- Workflow : Create → Approve → Execute
- Suivi statut des transactions
- Historique paiements par commande

**Patterns de Résilience**
- Circuit breakers sur toutes les routes
- Dégradation gracieuse avec fallback
- Health checks via Actuator

**Agrégation Produits** (En Développement)
- Recherche catalogue interne
- Requêtes sources externes (Amazon)
- Affichage résultats unifiés
- Génération liens d'affiliation

---

## Problèmes Courants & Solutions

**Les services ne démarrent pas**
- Vérifier Java 17 installé : `java -version`
- Configurer JAVA_HOME correctement

**Config Server ignoré dans IntelliJ**
- Supprimer de `.idea/misc.xml` et recharger Maven

**Port déjà utilisé**
- Vérifier : `netstat -ano | findstr "8080"`

**Circuit Breaker ne fonctionne pas**
- S'assurer que les requêtes passent par Gateway (8080)

---

## Checklist Démonstration

Avant la présentation :
- [ ] Les 7 services démarrent sans erreur
- [ ] Dashboard Eureka affiche tous les services UP
- [ ] Consoles H2 accessibles
- [ ] Credentials PayPal sandbox configurés
- [ ] Collection Postman importée et testée
- [ ] Démo circuit breaker préparée
- [ ] Documentation accessible

**Déroulé Démo** (20 minutes) :
1. Montrer Dashboard Eureka (2 min)
2. Présenter architecture (3 min)
3. Démo live : Créer user → produit → commande → paiement PayPal (10 min)
4. Démontrer circuit breaker (3 min)
5. Questions & Réponses (2 min)

---

## Ressources

- **Documentation** : Dossier `Documentation-Projet/`
- **Collection Postman** : `Catalogue-Microservices-Postman-Collection.json`
- **Testeur API** : `api-tester.html`
- **Diagrammes UML** : `Documentation-Projet/UML/`

---

## Notes Importantes

- Bases H2 en mémoire - données réinitialisées au redémarrage
- Intégration PayPal en mode sandbox
- Circuit breakers configurés au niveau Gateway
- Chaque service possède sa base indépendante (principe microservices)
- Projet académique - 8 semaines (Octobre - Décembre 2025)

