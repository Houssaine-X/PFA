# 🎤 CHECKLIST PRÉSENTATION - Semaine du 17 Novembre

## ✅ AVANT LA PRÉSENTATION

### 1. Préparer l'environnement
- [ ] Vérifier que Java 17 est installé
- [ ] Vérifier que Maven est installé  
- [ ] Fermer tous les services précédemment lancés
- [ ] Libérer les ports : 8080, 8081, 8082, 8083, 8761, 8888

### 2. Compiler le projet
```bash
cd C:\Users\houss\catalogue-service
verify-compilation.bat
```
- [ ] Tous les services compilent sans erreur

### 3. Démarrer les services (10 minutes avant)
```bash
start-all-services.bat
```
- [ ] Config Server démarré (8888)
- [ ] Eureka Server démarré (8761)
- [ ] API Gateway démarré (8080)
- [ ] Category Service démarré (8081)
- [ ] Product Service démarré (8082)
- [ ] Order Service démarré (8083)

### 4. Vérifier l'état des services
- [ ] Ouvrir http://localhost:8761 (Eureka Dashboard)
- [ ] Vérifier que 4 services sont enregistrés :
  - API-GATEWAY
  - CATEGORY-SERVICE  
  - PRODUCT-SERVICE
  - ORDER-SERVICE

### 5. Préparer les fenêtres/onglets
- [ ] Onglet 1 : Eureka Dashboard (http://localhost:8761)
- [ ] Onglet 2 : Postman ou curl (pour les démos)
- [ ] Onglet 3 : Code (IntelliJ/VSCode)
- [ ] Onglet 4 : Diagramme d'architecture (ARCHITECTURE-PRESENTATION.md)

---

## 📋 PLAN DE PRÉSENTATION (20-30 minutes)

### PARTIE 1 : Architecture Technique (5-7 minutes)

#### 1.1 Vue d'ensemble
**Montrer le diagramme** (ARCHITECTURE-PRESENTATION.md, ligne 31-50)

Points clés à mentionner :
- [ ] Architecture microservices avec **6 composants**
- [ ] Séparation des responsabilités
- [ ] Communication asynchrone via OpenFeign
- [ ] Service Discovery avec Eureka
- [ ] Point d'entrée unique via API Gateway

#### 1.2 Composants de l'infrastructure
**Expliquer chaque composant** :

- [ ] **Config Server (8888)** 
  - Configuration centralisée
  - Un fichier par service
  - Rechargement dynamique

- [ ] **Eureka Server (8761)**
  - Service Discovery
  - Enregistrement automatique
  - Load balancing

- [ ] **API Gateway (8080)**
  - Point d'entrée unique
  - Routage intelligent
  - Circuit breaker
  - MONTRER : http://localhost:8761 dans le navigateur

- [ ] **3 Microservices métier**
  - Category Service (8081)
  - Product Service (8082)
  - Order Service (8083)

#### 1.3 Technologies utilisées
- [ ] Spring Boot 3.2.0
- [ ] Spring Cloud 2023.0.0
- [ ] Spring Cloud Gateway
- [ ] Spring Cloud Config
- [ ] Spring Cloud Netflix Eureka
- [ ] Spring Cloud OpenFeign
- [ ] Spring Data JPA
- [ ] H2 Database

---

### PARTIE 2 : Diagramme de Classes Global (5-7 minutes)

**Montrer l'organisation en packages**

#### 2.1 Package com.catalogue.category
```
CategoryController → CategoryService → CategoryRepository → Category (Entity)
```
- [ ] Expliquer le pattern MVC/Layered Architecture
- [ ] Montrer l'Entity Category (id, nom, description, dates)
- [ ] Mentionner CategoryDTO et CategoryMapper (MapStruct)

#### 2.2 Package com.catalogue.product
```
ProductController → ProductService → ProductRepository → Product (Entity)
                         ↓
                   CategoryClient (OpenFeign)
                         ↓
                   category-service
```
- [ ] Expliquer la même architecture
- [ ] **IMPORTANT** : Montrer CategoryClient (communication inter-service)
- [ ] Entity Product avec référence categoryId

#### 2.3 Package com.catalogue.order
```
OrderController → OrderService → OrderRepository → Order + OrderItem (Entities)
                       ↓
                 ProductClient (OpenFeign)
                       ↓
                 product-service
```
- [ ] Relation Order (1) ↔ (N) OrderItem
- [ ] **IMPORTANT** : Montrer ProductClient (communication inter-service)

#### 2.4 Package com.catalogue.gateway
```
ApiGatewayApplication → GatewayConfig → Routes
                             ↓
                     FallbackController (Circuit Breaker)
```

---

### PARTIE 3 : Contenu du Livrable v4 (10-12 minutes)

#### 3.1 ✅ Deux microservices avec CRUD opérationnel

**DÉMO LIVE** :

**A) Category Service**
```bash
# Lister les catégories
curl http://localhost:8080/api/categories

# Créer une catégorie
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{"nom":"Demo Category","description":"Catégorie de démonstration"}'

# Vérifier la création
curl http://localhost:8080/api/categories
```
- [ ] Montrer le JSON retourné
- [ ] Expliquer que 8 catégories sont pré-chargées
- [ ] Mentionner les autres opérations (GET by ID, PUT, DELETE)

**B) Product Service**
```bash
# Lister les produits
curl http://localhost:8080/api/products

# Créer un produit (utilise OpenFeign)
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Demo Product",
    "description":"Produit de démonstration",
    "prix":99.99,
    "stockQuantity":50,
    "disponible":true,
    "categoryId":1
  }'
```
- [ ] **IMPORTANT** : Expliquer qu'ici le Product Service appelle Category Service via OpenFeign pour valider categoryId
- [ ] Montrer le produit créé
- [ ] Mentionner 27 produits pré-chargés

#### 3.2 ✅ Un Config Server
- [ ] Montrer les fichiers de configuration dans `config-server/src/main/resources/config/`
- [ ] Expliquer que chaque service a son propre fichier
- [ ] Tester : `curl http://localhost:8888/category-service/default`

#### 3.3 ✅ Un serveur Eureka
- [ ] **MONTRER** : http://localhost:8761 dans le navigateur
- [ ] Expliquer les 4 services enregistrés
- [ ] Montrer les instances et leur statut (UP)
- [ ] Expliquer le load balancing automatique

#### 3.4 ✅ Une API Gateway
- [ ] Expliquer le rôle de point d'entrée unique
- [ ] Montrer les routes configurées :
  - `/api/categories/**` → category-service
  - `/api/products/**` → product-service
  - `/api/orders/**` → order-service
- [ ] Mentionner le circuit breaker
- [ ] Expliquer CORS et headers personnalisés

#### 3.5 ✅ Communication inter-services via OpenFeign

**DÉMO 1 : Product → Category**

**Montrer le code** :

```java
// ProductService.java
@FeignClient(name = "")
public interface CategoryClient {
    @GetMapping("/api/categories/{id}")
    CategoryDTO getCategoryById(@PathVariable("id") Long id);
}
```

**Test en live** :
```bash
# Créer un produit avec une catégorie VALIDE (id=1)
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Test OpenFeign",
    "prix":10.00,
    "stockQuantity":5,
    "disponible":true,
    "categoryId":1
  }'
# ✅ Devrait fonctionner

# Créer un produit avec une catégorie INVALIDE (id=999)
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "nom":"Test OpenFeign Fail",
    "prix":10.00,
    "stockQuantity":5,
    "disponible":true,
    "categoryId":999
  }'
# ❌ Devrait retourner une erreur (catégorie introuvable)
```

- [ ] Expliquer le flux :
  1. Requête → API Gateway (8080)
  2. Gateway → Product Service (8082)
  3. Product Service → OpenFeign → Eureka
  4. Eureka retourne l'adresse de Category Service
  5. OpenFeign appelle Category Service (8081)
  6. Validation de la catégorie

**DÉMO 2 : Order → Product**

**Montrer le code** :
```java
// OrderService.java
@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") Long id);
    
    @PatchMapping("/api/products/{id}/stock")
    ProductDTO updateStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity);
}
```

**Test en live** :
```bash
# 1. Vérifier le stock initial d'un produit
curl http://localhost:8080/api/products/1
# Noter le stockQuantity (ex: 50)

# 2. Créer une commande
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId":1,
    "status":"PENDING",
    "items":[
      {"productId":1,"quantity":2}
    ]
  }'

# 3. Vérifier que le stock a diminué
curl http://localhost:8080/api/products/1
# Le stockQuantity devrait être 48 (50 - 2)
```

- [ ] Expliquer le flux :
  1. Requête création commande → API Gateway
  2. Gateway → Order Service (8083)
  3. Order Service → OpenFeign → Product Service
  4. Vérification disponibilité du produit
  5. Order Service → OpenFeign → Product Service
  6. Mise à jour du stock (-2)
  7. Création de la commande avec montant calculé

---

### PARTIE 4 : Points Forts du Projet (3-5 minutes)

#### 4.1 Dépassement des exigences
- [ ] **3 microservices** au lieu de 2 demandés
- [ ] **2 communications OpenFeign** au lieu de 1 demandée
- [ ] **API Gateway** avec circuit breaker et fallback
- [ ] **27 produits** de test répartis dans 8 catégories

#### 4.2 Bonnes pratiques implémentées
- [ ] Architecture en couches (Controller → Service → Repository)
- [ ] DTOs et validation (Jakarta Validation)
- [ ] MapStruct pour le mapping automatique
- [ ] Gestion des erreurs centralisée
- [ ] Scripts de démarrage automatique
- [ ] Documentation complète

#### 4.3 Scalabilité et Résilience
- [ ] Services indépendants et déployables séparément
- [ ] Load balancing automatique via Eureka
- [ ] Circuit breaker pour la résilience
- [ ] Configuration externalisée et centralisée

---

## 🎯 QUESTIONS PROBABLES

### Q1 : Pourquoi utiliser OpenFeign plutôt que RestTemplate ?
**Réponse** :
- Interface déclarative (plus simple)
- Intégration automatique avec Eureka
- Load balancing automatique
- Support des annotations Spring MVC
- Moins de code boilerplate

### Q2 : Comment gérer la montée en charge ?
**Réponse** :
- Lancer plusieurs instances d'un service
- Eureka les enregistre automatiquement
- API Gateway fait du load balancing
- Chaque service est scalable indépendamment

### Q3 : Que se passe-t-il si un service tombe ?
**Réponse** :
- Circuit breaker dans l'API Gateway
- Fallback controllers retournent des réponses par défaut
- Les autres services continuent de fonctionner
- Eureka détecte l'indisponibilité (heartbeat)

### Q4 : Pourquoi H2 et pas MySQL/PostgreSQL ?
**Réponse** :
- Simplification pour la démo
- Pas besoin d'installer de base de données externe
- Données rechargées à chaque démarrage
- Facile à remplacer par une vraie base en production

### Q5 : Comment sécuriser l'API ?
**Réponse** :
- Ajouter Spring Security
- JWT tokens pour l'authentification
- OAuth2 pour l'autorisation
- API Gateway peut gérer l'authentification centralisée

---

## ⚠️ POINTS D'ATTENTION

### Pendant la démo
- [ ] Parler clairement et pas trop vite
- [ ] Expliquer AVANT de montrer le code
- [ ] Laisser le temps aux requêtes de s'exécuter
- [ ] Si une erreur survient, rester calme et expliquer

### Ce qui peut mal se passer
1. **Un service ne démarre pas**
   - Vérifier les logs
   - Vérifier que le port est libre
   - Redémarrer si nécessaire

2. **Services non enregistrés dans Eureka**
   - Attendre 30 secondes de plus
   - Rafraîchir le dashboard Eureka

3. **Erreur lors des requêtes curl**
   - Vérifier la syntaxe JSON
   - Vérifier les guillemets (Windows vs Linux)
   - Utiliser Postman si curl pose problème

---

## 📝 AIDE-MÉMOIRE RAPIDE

### Ports
- 8888 : Config Server
- 8761 : Eureka Server
- 8080 : API Gateway ← **TOUJOURS utiliser ce port pour les démos**
- 8081 : Category Service
- 8082 : Product Service
- 8083 : Order Service

### URLs importantes
- Eureka Dashboard : http://localhost:8761
- API Gateway Health : http://localhost:8080/actuator/health
- Categories : http://localhost:8080/api/categories
- Products : http://localhost:8080/api/products
- Orders : http://localhost:8080/api/orders

### Commandes clés
```bash
# Démarrer tous les services
start-all-services.bat

# Vérifier la compilation
verify-compilation.bat

# Tester les endpoints
curl http://localhost:8080/api/categories
curl http://localhost:8080/api/products
curl http://localhost:8080/api/orders
```

---

## ✅ CHECKLIST POST-PRÉSENTATION

- [ ] Éteindre tous les services
- [ ] Sauvegarder les logs si nécessaire
- [ ] Noter les questions posées pour améliorer
- [ ] Célébrer ! 🎉

---

## 🎓 CONCLUSION

**Votre projet démontre** :
- ✅ Maîtrise de Spring Boot et Spring Cloud
- ✅ Compréhension de l'architecture microservices
- ✅ Capacité à mettre en œuvre des communications inter-services
- ✅ Connaissance des patterns (Service Discovery, API Gateway, Config Server)
- ✅ Bonnes pratiques de développement

**Vous avez toutes les cartes en main pour réussir votre présentation ! 🚀**

Bonne chance ! 🍀

