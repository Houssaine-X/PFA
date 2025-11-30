# Cahier de Charges - Projet E-Commerce Microservices

## 📋 Informations du Projet

**Titre**: Plateforme E-Commerce avec Architecture Microservices  
**Type**: Projet de fin de semestre  
**Durée**: 1-2 mois (Octobre-Novembre 2025)  
**Cours**: Architecture Logicielle / Systèmes Distribués

---

## 🎯 Objectif

Développer une plateforme e-commerce en utilisant une **architecture microservices**, démontrant la maîtrise des concepts d'architecture distribuée appris en cours.

---

## 📚 Contexte Académique

Ce projet met en pratique:
- Architecture microservices
- Communication REST entre services
- Service Discovery (Eureka)
- API Gateway
- Configuration centralisée
- Design patterns (Repository, Service Layer, DTO)

---

## ✨ Fonctionnalités Implémentées

### 1. Gestion des Catégories (Category Service)
- Créer une catégorie
- Lister toutes les catégories
- Consulter une catégorie par ID
- Modifier une catégorie
- Supprimer une catégorie

### 2. Gestion des Produits (Product Service)
- Créer un produit (associé à une catégorie)
- Lister tous les produits
- Filtrer produits par catégorie
- Consulter un produit par ID
- Modifier un produit (prix, stock, etc.)
- Supprimer un produit
- Gérer le stock et la disponibilité

### 3. Gestion des Commandes (Order Service)
- Créer une commande avec plusieurs produits
- Lister toutes les commandes
- Consulter une commande par ID
- Modifier le statut d'une commande
- Annuler une commande
- Calcul automatique du montant total

### 4. Infrastructure
- **Eureka Server**: Enregistrement et découverte des services
- **Config Server**: Configuration centralisée
- **API Gateway**: Point d'entrée unique avec routing

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Client / Postman                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
         ┌─────────────────┐
         │  API Gateway    │ Port 8080
         │  (Routing)      │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ↓                 ↓
    ┌────────┐        ┌────────┐
    │ Eureka │        │ Config │
    │ Server │        │ Server │
    └────────┘        └────────┘
     Port 8761        Port 8888
         │
    ┌────┴────┬────────────┬────────────┐
    │         │            │            │
    ↓         ↓            ↓            ↓
┌─────────┬─────────┬──────────┐
│Category │ Product │  Order   │
│Service  │ Service │ Service  │
│Port 8081│Port 8082│Port 8083 │
└────┬────┴────┬────┴────┬─────┘
     │         │         │
     ↓         ↓         ↓
┌─────────┬─────────┬──────────┐
│  H2 DB  │  H2 DB  │   H2 DB  │
│category │ product │  order   │
└─────────┴─────────┴──────────┘
```

---

## 🔗 Communication Inter-Services

### Product Service → Category Service
Le Product Service vérifie que la catégorie existe avant de créer un produit.

**Exemple**:
```
POST /api/products
{
  "nom": "Laptop ASUS",
  "categoryId": 1,
  "prix": 1299.99
}

Product Service appelle:
GET http://category-service/api/categories/1

Si catégorie existe → Produit créé ✅
Sinon → Erreur 400 ❌
```

### Order Service → Product Service
L'Order Service vérifie la disponibilité et met à jour le stock.

**Exemple**:
```
POST /api/orders
{
  "orderItems": [
    {"productId": 5, "quantity": 2}
  ]
}

Order Service appelle:
GET http://product-service/api/products/5
→ Vérifie stock disponible
PUT http://product-service/api/products/5/stock
→ Réduit le stock de 2
```

---

## 📊 Modèle de Données

### Category
```
- id: Long (clé primaire)
- nom: String (unique, requis)
- description: String
- createdAt: Timestamp
- updatedAt: Timestamp
```

### Product
```
- id: Long (clé primaire)
- nom: String (requis)
- description: String
- prix: BigDecimal (requis)
- stockQuantity: Integer (requis)
- disponible: Boolean (requis)
- categoryId: Long (référence Category)
- imageUrl: String
- createdAt: Timestamp
- updatedAt: Timestamp
```

### Order
```
- id: Long (clé primaire)
- orderNumber: String (unique)
- clientEmail: String (requis)
- clientNom: String (requis)
- clientPrenom: String (requis)
- adresseLivraison: String (requis)
- status: Enum (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- montantTotal: BigDecimal (calculé)
- createdAt: Timestamp
- updatedAt: Timestamp
```

### OrderItem
```
- id: Long (clé primaire)
- orderId: Long (référence Order)
- productId: Long (référence Product)
- quantity: Integer (requis)
- prixUnitaire: BigDecimal (requis)
- sousTotal: BigDecimal (calculé)
```

---

## 🔄 Cas d'Usage

### Scénario 1: Créer un Produit
1. Admin crée une catégorie "Électronique"
2. Admin crée un produit "Laptop" dans la catégorie "Électronique"
3. Product Service vérifie que la catégorie existe
4. Le produit est créé avec succès

### Scénario 2: Passer une Commande
1. Client sélectionne 2 produits
2. Client crée une commande avec ses informations
3. Order Service vérifie la disponibilité des 2 produits
4. Order Service calcule le total (quantité × prix)
5. La commande est créée avec statut "PENDING"
6. Le stock des produits est automatiquement réduit

### Scénario 3: Service Indisponible (Circuit Breaker)
1. Product Service essaie d'appeler Category Service
2. Category Service est down
3. Circuit breaker active le fallback
4. Product Service retourne "Category Unavailable" au lieu d'une erreur

---

## 🛠️ Technologies Utilisées

### Backend
- **Spring Boot** 3.4.1: Framework principal
- **Spring Cloud**: Microservices (Eureka, Gateway, Config)
- **Java** 17: Langage de programmation
- **Maven**: Gestionnaire de dépendances

### Persistence
- **Spring Data JPA**: ORM
- **Hibernate**: Implémentation JPA
- **H2 Database**: Base de données en mémoire (dev)
- **MySQL** (optionnel): Pour production

### Outils
- **Lombok**: Réduction code boilerplate
- **MapStruct**: Mapping Entity ↔ DTO
- **Bean Validation**: Validation des données
- **Feign Client**: Communication REST inter-services

---

## 📅 Planning Réalisé

### Phase 1: Infrastructure (1 semaine)
- ✅ Setup projet Maven multi-modules
- ✅ Config Server
- ✅ Eureka Server
- ✅ API Gateway

### Phase 2: Services Métier (2-3 semaines)
- ✅ Category Service (CRUD)
- ✅ Product Service (CRUD + Feign Client)
- ✅ Order Service (CRUD + Feign Client)

### Phase 3: Intégration (1 semaine)
- ✅ Communication inter-services
- ✅ Circuit breakers (Resilience4j)
- ✅ Tests des APIs (Postman)

### Phase 4: Documentation (Dernière semaine)
- ✅ Documentation technique
- ✅ Diagrammes UML
- ✅ Préparation présentation

---

## 🚀 Livrables

- [x] Code source complet (6 microservices)
- [x] Script de démarrage (`start-all-services.bat`)
- [x] Collection Postman pour tester les APIs
- [x] Documentation technique (ce document)
- [x] Diagrammes UML
- [x] Présentation PowerPoint
- [x] Rapport de projet

---

## 🎓 Compétences Démontrées

### Architecture
- ✅ Conception d'une architecture microservices
- ✅ Découplage des services
- ✅ Service Discovery
- ✅ API Gateway pattern

### Développement
- ✅ Spring Boot & Spring Cloud
- ✅ API REST (GET, POST, PUT, DELETE)
- ✅ Communication synchrone (Feign)
- ✅ Gestion d'erreurs (Circuit breaker)

### Base de Données
- ✅ JPA/Hibernate
- ✅ Modélisation relationnelle
- ✅ Migrations de schéma

### Bonnes Pratiques
- ✅ Clean Code
- ✅ Design Patterns (Repository, Service, DTO)
- ✅ Documentation API
- ✅ Gestion de configuration

---

## 🔮 Extensions Futures (Hors Périmètre Actuel)

Si le projet devait être étendu, voici des pistes:

### Frontend
- Interface web (React/Vue)
- Dashboard administrateur
- Interface client

### Fonctionnalités Avancées
- Authentification (JWT)
- Système de paiement
- Notifications email
- Recherche avancée

### Intelligence Artificielle (Vision Longue Terme)
- **Chatbot conversationnel**: "Je cherche un laptop gaming"
- **Recommandations**: Suggérer des produits similaires
- **Assistant vocal**: Passer commande par dialogue

**Note**: L'IA n'est pas implémentée dans ce projet de semestre, mais l'architecture microservices facilite son ajout futur.

---

## ✅ Critères de Validation

Le projet est considéré réussi si:

### Fonctionnel
- [ ] Les 6 microservices démarrent sans erreur
- [ ] Tous les services apparaissent dans Eureka
- [ ] Toutes les APIs REST fonctionnent
- [ ] Les communications inter-services marchent
- [ ] Les données persistent en base

### Technique
- [ ] Code propre et structuré
- [ ] Gestion des erreurs implémentée
- [ ] Circuit breakers fonctionnels
- [ ] Documentation à jour

### Démonstration
Pouvoir montrer:
1. Eureka Dashboard avec tous les services
2. Création d'une catégorie via Postman
3. Création d'un produit lié à cette catégorie
4. Création d'une commande avec plusieurs produits
5. H2 Console montrant les données

---

## 🎯 Résultat Final

**Statut**: ✅ **PROJET COMPLET ET FONCTIONNEL**

- 6 microservices opérationnels
- Communication inter-services validée
- Circuit breakers implémentés
- Documentation complète
- Prêt pour démonstration

---

**Projet réalisé par**: [Votre nom]  
**Professeur**: [Nom du professeur]  
**Date**: Novembre 2025  
**Institution**: [Votre école/université]

