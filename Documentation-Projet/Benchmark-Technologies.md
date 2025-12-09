# Benchmark Technologies

## 1. Architecture

### Choix Retenu: Microservices

**Avantages**:
- Scalabilité indépendante par service
- Déploiement continu facilité
- Résilience accrue (isolation des défaillances)
- Flexibilité technologique

**Alternatives Rejetées**:
- **Monolithique**: Scalabilité limitée, couplage fort
- **Serverless**: Complexité élevée, hors scope académique

## 2. Backend Framework

### Choix Retenu: Spring Boot 3.4.1

**Justification**:
- Écosystème complet avec Spring Cloud (Eureka, Gateway, Config)
- Documentation exhaustive
- Enseigné dans le cursus académique
- Large adoption en entreprise

**Alternatives**:
- Node.js/Express: Écosystème microservices limité
- Django/Flask: Support microservices restreint
- .NET Core: Viable mais moins courant dans le cursus

## 3. Service Discovery

### Choix Retenu: Eureka

**Justification**:
- Intégration native Spring Cloud
- Configuration simplifiée via annotations
- Dashboard UI inclus
- Adapté pour projet académique

**Alternatives**:
- Consul: Setup plus complexe
- Kubernetes DNS: Requiert orchestration conteneurs

## 4. Base de Données

### Choix Retenu: H2 (Développement)

**Justification**:
- Configuration zéro
- Console web intégrée
- Adapté pour démonstrations
- Migration facile vers production (MySQL/PostgreSQL)

## 5. Communication Inter-Services

### Choix Retenu: REST + OpenFeign

**Justification REST**:
- Standard universel
- Facilité de test (Postman)
- Compatible tous clients

**Justification OpenFeign**:
- Code minimal (interface uniquement)
- Intégration Eureka automatique
- Load balancing inclus

**Alternatives**:
- RestTemplate: Verbeux, deprecated
- GraphQL: Complexité non justifiée
- gRPC: Courbe d'apprentissage élevée

## 6. Paiement

### Choix Retenu: PayPal

**Justification**:
- SDK Java officiel bien documenté
- Sandbox gratuit pour tests
- Très répandu en France
- Workflow clair (Create → Approve → Execute)
- Confiance utilisateur élevée

**Alternatives**:
- Stripe: Excellent mais moins reconnu en France
- Braintree: Documentation moins complète

## 7. Résilience

### Choix Retenu: Resilience4j

**Justification**:
- Projet actif et maintenu
- Architecture légère
- Intégration Spring Boot native
- Documentation à jour

**Alternative**:
- Hystrix: Deprecated, non recommandé

## 8. Intelligence Artificielle

### Choix Retenu: OpenAI GPT-4 API

**Justification**:
- API simple et puissante
- Excellente compréhension du langage naturel
- Pas besoin de training custom
- Documentation exhaustive

**Alternatives**:
- TensorFlow/PyTorch custom: Temps de développement important
- Hugging Face: Setup plus complexe

## 9. Agrégation Externe

### Choix Retenu: Amazon Product API + eBay API

**Justification**:
- APIs officielles bien documentées
- Programmes d'affiliation intégrés
- Données produits complètes et fiables
- Rate limits raisonnables

**Alternatives**:
- Web Scraping pur: Fragile, légalité incertaine
- AliExpress: API moins accessible

## 10. Cache

### Choix Retenu: Redis

**Justification**:
- Performance excellente (in-memory)
- TTL automatique pour invalidation
- Support Spring Cache natif
- Simple à configurer

## 11. Technologies Non Retenues

### Message Queue (RabbitMQ/Kafka)
Communication synchrone suffisante pour le scope du projet.

### Docker/Kubernetes
Focus sur architecture microservices, pas infrastructure.

### NoSQL (MongoDB)
Relations entre entités nécessitent SQL.

### Authentification OAuth2/JWT
Hors scope pour MVP académique.

## 12. Synthèse

| Composant | Technologie | Raison |
|-----------|-------------|--------|
| Framework | Spring Boot 3.4.1 | Écosystème complet |
| Cloud | Spring Cloud 2024.0.0 | Microservices natif |
| Langage | Java 17 | Standard industrie |
| Build | Maven | Standard Java |
| Database | H2 | Zero config |
| API | REST | Universel |
| Communication | OpenFeign | Déclaratif |
| Circuit Breaker | Resilience4j | Moderne |
| Discovery | Eureka | Spring natif |
| Gateway | Spring Cloud Gateway | Routing natif |
| Paiement | PayPal | SDK officiel |
| IA | OpenAI GPT-4 | API puissante |
| Cache | Redis | Performance |

