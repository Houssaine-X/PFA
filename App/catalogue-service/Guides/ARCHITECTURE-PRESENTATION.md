# Architecture Technique - Catalogue Microservices

## 📋 Vue d'ensemble du projet

Cette application est une architecture microservices complète pour la gestion d'un catalogue de produits, développée avec Spring Boot et Spring Cloud.

---

## 🏗️ Architecture Technique

### Composants de l'Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Port 8080)                  │
│              Point d'entrée unique pour tous les clients     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │               │              │
┌───────▼──────┐ ┌────▼─────┐  ┌─────▼──────┐ ┌────▼─────────┐
│  Category    │ │  Product │  │   Order    │ │    Eureka    │
│  Service     │ │  Service │  │  Service   │ │    Server    │
│  (8081)      │ │  (8082)  │  │  (8083)    │ │    (8761)    │
└──────────────┘ └────┬─────┘  └─────┬──────┘ └──────────────┘
                      │               │
                      └───OpenFeign───┘
                      
┌─────────────────────────────────────────────────────────────┐
│              Config Server (Port 8888)                       │
│         Configuration centralisée pour tous les services     │
└─────────────────────────────────────────────────────────────┘
```

### Services Implémentés

1. **Config Server (Port 8888)**
   - Gestion centralisée de la configuration
   - Configuration externalisée pour tous les microservices
   - Support du rechargement dynamique

2. **Eureka Server (Port 8761)**
   - Service de découverte et d'enregistrement
   - Health monitoring des microservices
   - Load balancing automatique

3. **API Gateway (Port 8080)** ✅ NOUVEAU
   - Point d'entrée unique pour tous les clients
   - Routage intelligent vers les microservices
   - Circuit breaker et fallback
   - CORS configuré
   - Load balancing côté client

4. **Category Service (Port 8081)**
   - Gestion des catégories de produits
   - CRUD complet via REST API
   - Base de données H2 en mémoire

5. **Product Service (Port 8082)**
   - Gestion des produits
   - CRUD complet via REST API
   - Communication avec Category Service via OpenFeign
   - Base de données H2 en mémoire

6. **Order Service (Port 8083)**
   - Gestion des commandes
   - CRUD complet via REST API
   - Communication avec Product Service via OpenFeign
   - Base de données H2 en mémoire

---

## 📦 Diagramme de Classes Global

### Package: com.catalogue.category (Category Service)

```
CategoryController
    ↓
CategoryService
    ↓
CategoryRepository → Category (Entity)
    ↓
CategoryDTO
```

**Entities principales:**
- `Category`: id, nom, description, createdAt, updatedAt

### Package: com.catalogue.product (Product Service)

```
ProductController
    ↓
ProductService ──→ CategoryClient (OpenFeign)
    ↓                     ↓
ProductRepository    category-service
    ↓
Product (Entity)
    ↓
ProductDTO
```

**Entities principales:**
- `Product`: id, nom, description, prix, stockQuantity, disponible, categoryId, imageUrl, createdAt, updatedAt

**Communication inter-services:**
- `CategoryClient`: Interface Feign pour communiquer avec Category Service

### Package: com.catalogue.order (Order Service)

```
OrderController
    ↓
OrderService ──→ ProductClient (OpenFeign)
    ↓                   ↓
OrderRepository    product-service
    ↓
Order (Entity) ← OrderItem (Entity)
    ↓
OrderDTO ← OrderItemDTO
```

**Entities principales:**
- `Order`: id, userId, orderDate, status, totalAmount, createdAt, updatedAt
- `OrderItem`: id, orderId, productId, quantity, unitPrice, totalPrice

**Communication inter-services:**
- `ProductClient`: Interface Feign pour communiquer avec Product Service

### Package: com.catalogue.gateway (API Gateway)

```
ApiGatewayApplication
    ↓
GatewayConfig (Routes)
    ↓
FallbackController (Circuit Breaker)
```

---

## 🔄 Fonctionnalités de Communication Inter-Services (OpenFeign)

### 1. Product Service → Category Service

**Cas d'usage:** Enrichissement des informations produit avec les détails de catégorie

```java

@FeignClient(name = "")
public interface CategoryClient {
    @GetMapping("/api/categories/{id}")
    CategoryDTO getCategoryById(@PathVariable("id") Long id);
}
```

**Utilisation:**
- Lors de la récupération d'un produit, le service enrichit les données avec les informations de la catégorie
- Validation de l'existence de la catégorie lors de la création/modification d'un produit

### 2. Order Service → Product Service

**Cas d'usage:** Validation des produits et mise à jour du stock lors de la création de commandes

```java
@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") Long id);
    
    @PatchMapping("/api/products/{id}/stock")
    ProductDTO updateStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity);
}
```

**Utilisation:**
- Vérification de la disponibilité des produits lors de la création d'une commande
- Mise à jour automatique du stock après validation de la commande
- Calcul du montant total de la commande

---

## 🔧 Technologies Utilisées

### Backend
- **Spring Boot 3.2.0**
- **Spring Cloud 2023.0.0**
- **Spring Cloud Gateway** - API Gateway
- **Spring Cloud Netflix Eureka** - Service Discovery
- **Spring Cloud Config** - Configuration centralisée
- **Spring Cloud OpenFeign** - Communication inter-services
- **Spring Data JPA** - Persistence
- **H2 Database** - Base de données en mémoire
- **Lombok** - Réduction du code boilerplate
- **MapStruct** - Mapping DTO/Entity
- **Jakarta Validation** - Validation des données

### Architecture
- **Microservices Pattern**
- **API Gateway Pattern**
- **Service Discovery Pattern**
- **Circuit Breaker Pattern**
- **Centralized Configuration**

---

## 🚀 Démarrage du Projet

### Prérequis
- Java 17+
- Maven 3.6+
- Port disponibles: 8080, 8081, 8082, 8083, 8761, 8888

### Démarrage automatique

```bash
# Démarrer tous les services dans l'ordre correct
start-all-services.bat
```

### Démarrage manuel (ordre important)

```bash
# 1. Config Server (30 secondes d'attente)
cd config-server
mvn spring-boot:run

# 2. Eureka Server (30 secondes d'attente)
cd eureka-server
mvn spring-boot:run

# 3. API Gateway (25 secondes d'attente)
cd api-gateway
mvn spring-boot:run

# 4. Category Service (20 secondes d'attente)
cd category-service
mvn spring-boot:run

# 5. Product Service (20 secondes d'attente)
cd product-service
mvn spring-boot:run

# 6. Order Service
cd order-service
mvn spring-boot:run
```

---

## 📡 Points d'Accès (Endpoints)

### Via API Gateway (Recommandé - Port 8080)

**Categories:**
- GET    `http://localhost:8080/api/categories` - Liste toutes les catégories
- GET    `http://localhost:8080/api/categories/{id}` - Détails d'une catégorie
- POST   `http://localhost:8080/api/categories` - Créer une catégorie
- PUT    `http://localhost:8080/api/categories/{id}` - Modifier une catégorie
- DELETE `http://localhost:8080/api/categories/{id}` - Supprimer une catégorie

**Products:**
- GET    `http://localhost:8080/api/products` - Liste tous les produits
- GET    `http://localhost:8080/api/products/{id}` - Détails d'un produit
- POST   `http://localhost:8080/api/products` - Créer un produit
- PUT    `http://localhost:8080/api/products/{id}` - Modifier un produit
- DELETE `http://localhost:8080/api/products/{id}` - Supprimer un produit
- GET    `http://localhost:8080/api/products/category/{categoryId}` - Produits par catégorie

**Orders:**
- GET    `http://localhost:8080/api/orders` - Liste toutes les commandes
- GET    `http://localhost:8080/api/orders/{id}` - Détails d'une commande
- POST   `http://localhost:8080/api/orders` - Créer une commande
- PUT    `http://localhost:8080/api/orders/{id}` - Modifier une commande
- DELETE `http://localhost:8080/api/orders/{id}` - Supprimer une commande

### Services Individuels (Accès direct)

- **Config Server**: `http://localhost:8888/actuator/health`
- **Eureka Dashboard**: `http://localhost:8761`
- **API Gateway**: `http://localhost:8080/actuator/health`
- **Category Service**: `http://localhost:8081/actuator/health`
- **Product Service**: `http://localhost:8082/actuator/health`
- **Order Service**: `http://localhost:8083/actuator/health`

---

## ✅ Validation des Exigences v4

### 1. Deux microservices opérationnels avec CRUD ✅

**Category Service:**
- ✅ Create, Read, Update, Delete
- ✅ Contrôleur REST complet
- ✅ Service layer avec logique métier
- ✅ Repository JPA
- ✅ DTOs et validation

**Product Service:**
- ✅ Create, Read, Update, Delete
- ✅ Contrôleur REST complet
- ✅ Service layer avec logique métier
- ✅ Repository JPA
- ✅ DTOs et validation

**Order Service (Bonus):**
- ✅ Create, Read, Update, Delete
- ✅ Contrôleur REST complet
- ✅ Gestion des items de commande
- ✅ Repository JPA
- ✅ DTOs et validation

### 2. Config Server ✅

- ✅ Configuration centralisée
- ✅ Configurations par service (category-service.properties, product-service.properties, etc.)
- ✅ Support du rechargement dynamique
- ✅ Intégration avec tous les microservices

### 3. Serveur Eureka ✅

- ✅ Service Discovery opérationnel
- ✅ Dashboard accessible (http://localhost:8761)
- ✅ Enregistrement automatique des services
- ✅ Health monitoring
- ✅ Load balancing

### 4. API Gateway ✅

- ✅ Point d'entrée unique (Port 8080)
- ✅ Routage vers tous les microservices
- ✅ Load balancing avec Eureka
- ✅ Circuit Breaker configuré
- ✅ Fallback controllers
- ✅ CORS configuré
- ✅ Routes configurées pour:
  - Category Service
  - Product Service
  - Order Service
  - Eureka Server

### 5. Communication inter-services via OpenFeign ✅

**Communication 1: Product Service → Category Service**
- ✅ Interface `CategoryClient` avec @FeignClient
- ✅ Récupération des informations de catégorie
- ✅ Enrichissement des données produit
- ✅ Validation de la catégorie lors de la création/modification

**Communication 2: Order Service → Product Service**
- ✅ Interface `ProductClient` avec @FeignClient
- ✅ Vérification de la disponibilité des produits
- ✅ Mise à jour du stock lors de la création de commande
- ✅ Calcul du montant total de la commande

---

## 📊 Données de Test

### Catégories pré-chargées (8 catégories)
1. Electronics
2. Computers
3. Mobile Phones
4. Home Appliances
5. Gaming
6. Audio
7. Cameras
8. Wearables

### Produits pré-chargés (27 produits)
- Variété de produits dans chaque catégorie
- Données réalistes avec prix, stock, descriptions
- Relations avec les catégories

---

## 🎯 Points Clés pour la Présentation

### Architecture Technique
1. **Séparation des responsabilités** - Chaque service a une responsabilité unique
2. **Scalabilité** - Services indépendants peuvent être scalés séparément
3. **Résilience** - Circuit breaker et fallback en cas de défaillance
4. **Découverte automatique** - Services s'enregistrent automatiquement

### Diagramme de Classes
1. **Organisation en packages** - Un package par microservice
2. **Patterns utilisés** - DTO, Repository, Service, Controller
3. **Relations entre services** - Via OpenFeign clients

### Communication Inter-Services
1. **Product → Category** - Enrichissement des données
2. **Order → Product** - Validation et mise à jour du stock
3. **Avantages d'OpenFeign** - Interface déclarative, load balancing automatique

### API Gateway
1. **Point d'entrée unique** - Simplifie l'accès aux services
2. **Routing intelligent** - Redirection vers le bon service
3. **Sécurité** - CORS, headers personnalisés
4. **Résilience** - Circuit breaker et fallback

---

## 📝 Exemples de Requêtes

### Créer une catégorie
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{"nom":"New Category","description":"Test category"}'
```

### Créer un produit (utilise OpenFeign pour valider la catégorie)
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Test Product",
    "description":"Test description",
    "prix":99.99,
    "stockQuantity":10,
    "disponible":true,
    "categoryId":1
  }'
```

### Créer une commande (utilise OpenFeign pour valider les produits et mettre à jour le stock)
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId":1,
    "status":"PENDING",
    "items":[
      {"productId":1,"quantity":2},
      {"productId":2,"quantity":1}
    ]
  }'
```

---

## 🔍 Vérification du Fonctionnement

1. **Config Server**: `http://localhost:8888/category-service/default`
2. **Eureka Dashboard**: `http://localhost:8761` - Vérifier que tous les services sont enregistrés
3. **API Gateway Health**: `http://localhost:8080/actuator/health`
4. **Test des routes**: Utiliser les endpoints via le Gateway (port 8080)

---

## 📌 Conclusion

Ce projet démontre une architecture microservices complète et fonctionnelle avec:
- ✅ **6 composants** (Config Server, Eureka, API Gateway, 3 microservices)
- ✅ **CRUD complet** sur tous les microservices
- ✅ **Communication inter-services** avec OpenFeign
- ✅ **Configuration centralisée** avec Config Server
- ✅ **Service Discovery** avec Eureka
- ✅ **API Gateway** comme point d'entrée unique
- ✅ **Circuit Breaker** pour la résilience
- ✅ **Load Balancing** automatique

L'architecture est prête pour la production et peut facilement être étendue avec de nouveaux microservices.

