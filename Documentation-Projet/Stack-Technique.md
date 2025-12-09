# Stack Technique

## 1. Vue d'Ensemble

**Architecture**: 7-8 microservices (3 Infrastructure + 4 Core + 1-2 Agrégation)
**Communication**: REST API synchrone
**Paradigme**: Architecture microservices distribuée

## 2. Backend - Java Stack

### 2.1 Java 17 (LTS)

**Justification**:
- Typage fort réduisant les erreurs
- Performance éprouvée
- Écosystème mature
- Standard industrie

**Features Modernes**: Records, Text Blocks, var keyword

### 2.2 Spring Boot 3.4.1

**Starters Principaux**:
- `spring-boot-starter-web`: Tomcat, Spring MVC, Jackson
- `spring-boot-starter-data-jpa`: Hibernate, Spring Data
- `spring-boot-starter-actuator`: Health checks, métriques

**Avantages**:
- Auto-configuration
- Serveur embarqué
- Production-ready features

### 2.3 Spring Cloud 2024.0.0

#### Eureka Server (Service Discovery)
- Registre de services avec interface de monitoring
- Dashboard web accessible sur port 8761
- Découverte automatique des microservices

#### Config Server
- Configuration centralisée
- Support Git, filesystem
- Rafraîchissement dynamique
- Profiles d'environnement

#### API Gateway
- Routing intelligent
- Load balancing
- Rate limiting
- Circuit breaker intégré

#### OpenFeign (Communication Inter-Services)
- Style déclaratif (interfaces)
- Intégration Eureka automatique
- Load balancing client-side
- Communication REST simplifiée

## 3. Agrégation Externe

### 3.1 Amazon Product API
- Recherche de produits Amazon
- Normalisation des données
- Génération automatique de liens d'affiliation
- Gestion rate limiting

### 3.2 Jsoup (Parsing HTML)
- Alternative pour web scraping si API limitée
- Parsing HTML simple
- Extraction de données produits

## 4. Paiement

### 4.1 PayPal REST API SDK 1.14.0

**Fonctionnalités**:
- Création de paiements
- Exécution après approbation utilisateur
- Gestion des transactions
- Support mode sandbox et production

**Workflow**:
1. Create → approvalUrl
2. Redirection PayPal
3. Approbation utilisateur
4. Execute avec payerId
5. Statut COMPLETED

## 5. Persistence

### 5.1 H2 Database

**Utilisation**:
- Base de données en mémoire
- Une base par microservice
- Console web intégrée pour inspection
- Configuration zéro

**Bases de données**:
- user_db, product_db, order_db, payment_db, aggregator_db

### 5.2 Spring Data JPA

**Fonctionnalités**:
- Repositories automatiques
- Requêtes dérivées du nom de méthode
- Support JPQL et native SQL
- Gestion automatique des transactions

## 6. Cache (Optionnel)

### 6.1 Redis ou Spring Cache

**Usage**:
- Cache des résultats API externes
- TTL configurable
- Amélioration performance
- Réduction appels API coûteux

## 7. Résilience

### 7.1 Resilience4j

**Fonctionnalités**:
- Circuit Breaker pour services externes
- Fallback methods automatiques
- Retry policies
- Rate limiting

**Configuration**: Seuil d'échec, fenêtre glissante, durée d'attente

## 8. Outils

### 8.1 Lombok
- Réduction code boilerplate
- Annotations: @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor
- Génération automatique getters/setters

### 8.2 MapStruct
- Mapping Entity ↔ DTO automatique
- Type-safe
- Performance optimale (génération code compile-time)

### 8.3 Bean Validation
- Validation déclarative avec annotations
- @NotBlank, @Email, @NotNull, @Min, @Max
- Messages d'erreur personnalisables

## 9. Monitoring

### 9.1 Spring Boot Actuator

**Endpoints**:
- `/actuator/health`: Santé de l'application
- `/actuator/metrics`: Métriques (CPU, mémoire, requêtes)
- `/actuator/info`: Informations application

## 10. Architecture des Ports

| Service | Port |
|---------|------|
| Config Server | 8888 |
| Eureka Server | 8761 |
| API Gateway | 8080 |
| Product Service | 8081 |
| User Service | 8083 |
| Payment Service | 8084 |
| Order Service | 8085 |
| External Aggregator Service | 8087 |
| AI Recommendation Service | 8086 (optionnel) |

## 11. Flux de Données

### Recherche avec Agrégation
```
User → API Gateway (8080) 
     → External Aggregator (8087)
     → Product Service (8081) [produits internes]
     → Amazon API [produits externes]
     → Response agrégée (internes + externes)
```

### Achat Interne
```
User → API Gateway (8080)
     → Order Service (8085)
     → User Service (8083) [validation utilisateur]
     → Product Service (8081) [vérification stock]
     → Payment Service (8084)
     → PayPal API
     → Response
```

## 12. Sécurité

### Configuration CORS (API Gateway)
- Autorisation origins, methods, headers
- Configuration centralisée dans Gateway
- Facilite intégration frontend

## 13. Build et Déploiement

### Maven Multi-Modules
Structure parent-enfant pour gérer tous les microservices dans un seul projet.

**Modules**:
- config-server
- eureka-server
- api-gateway
- user-service
- product-service
- order-service
- payment-service
- external-aggregator-service

### Build
Commande: `mvn clean install`

### Exécution
Démarrage via fichiers JAR générés ou script batch automatique.

**Ordre de démarrage**:
1. Config Server (8888)
2. Eureka Server (8761)
3. API Gateway (8080)
4. Services métier (8081, 8083, 8084, 8085, 8087)

## 14. Technologies Résumé

| Catégorie | Technologies |
|-----------|--------------|
| Langage | Java 17 |
| Framework | Spring Boot 3.4.1, Spring Cloud 2024.0.0 |
| Persistence | Spring Data JPA, Hibernate, H2 |
| Communication | OpenFeign, REST |
| Résilience | Resilience4j |
| Discovery | Eureka |
| Gateway | Spring Cloud Gateway |
| Config | Spring Cloud Config |
| Paiement | PayPal REST API |
| Agrégation | Amazon Product API, Jsoup |
| Cache | Redis (optionnel) |
| Monitoring | Spring Actuator |
| Outils | Lombok, MapStruct, Bean Validation |
| Build | Maven |

