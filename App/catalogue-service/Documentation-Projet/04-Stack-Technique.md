# Stack Technique - Technologies Utilisées

## 🛠️ Vue d'Ensemble

Ce document liste toutes les technologies utilisées dans le projet avec explications et justifications.

---

## ☕ Backend - Java Stack

### 1. Java 17 (LTS)

**Rôle**: Langage de programmation principal  
**Version**: OpenJDK 17 ou supérieur

**Pourquoi Java?**
- ✅ Langage enseigné en cours
- ✅ Typage fort (moins d'erreurs)
- ✅ Performance solide
- ✅ Large écosystème
- ✅ Très demandé en entreprise

**Features Utilisées**:
```java
// Records (Java 14+)
public record CategoryDTO(Long id, String nom, String description) {}

// Text Blocks (Java 13+)
String sql = """
    SELECT * FROM products
    WHERE category_id = ?
    """;

// var keyword (Java 10+)
var products = productRepository.findAll();
```

---

### 2. Spring Boot 3.4.1

**Rôle**: Framework backend principal  
**Site**: https://spring.io/projects/spring-boot

**Configuration**:
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.4.1</version>
</parent>
```

**Starters Utilisés**:

#### spring-boot-starter-web
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```
- Serveur Tomcat embarqué
- Spring MVC pour REST APIs
- Jackson pour JSON

#### spring-boot-starter-data-jpa
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```
- Hibernate ORM
- Spring Data repositories
- Transaction management

#### spring-boot-starter-actuator
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```
- Health checks
- Metrics
- Endpoints monitoring

**Avantages**:
- ✅ Auto-configuration
- ✅ Embedded server
- ✅ Dev tools (hot reload)
- ✅ Production-ready features

---

### 3. Spring Cloud 2024.0.0

**Rôle**: Outils microservices  
**Site**: https://spring.io/projects/spring-cloud

**Configuration**:
```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2024.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

#### Composants Utilisés:

**Eureka Server (Service Discovery)**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

Configuration:
```java
@EnableEurekaServer
@SpringBootApplication
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

**Config Server**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>
```

**API Gateway**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

**OpenFeign (Client REST)**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

Utilisation:
```java
@FeignClient(name = "category-service")
public interface CategoryClient {
    @GetMapping("/api/categories/{id}")
    CategoryDTO getCategoryById(@PathVariable Long id);
}
```

---

## 💾 Persistence

### 1. H2 Database 2.3.x

**Rôle**: Base de données en mémoire (dev/test)  
**Site**: https://www.h2database.com

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Configuration**:
```properties
# application.properties
spring.datasource.url=jdbc:h2:mem:product_db
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# Console web
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

**Avantages**:
- ✅ Zero configuration
- ✅ Console web intégrée
- ✅ Rapide (in-memory)
- ✅ Parfait pour démos

**Console Web**:
- URL: http://localhost:8081/h2-console
- JDBC URL: `jdbc:h2:mem:category_db`
- Username: `sa`
- Password: _(vide)_

---

### 2. Hibernate / JPA 6.x

**Rôle**: ORM (Object-Relational Mapping)

**Annotations Utilisées**:
```java
@Entity                                    // Marque une classe comme entité
@Table(name = "products")                  // Nom de la table
@Id                                        // Clé primaire
@GeneratedValue(strategy = IDENTITY)       // Auto-increment
@Column(nullable = false, length = 200)    // Contraintes colonne
@CreationTimestamp                         // Timestamp création auto
@UpdateTimestamp                           // Timestamp MAJ auto
@OneToMany                                 // Relation 1-N
@ManyToOne                                 // Relation N-1
@Enumerated(EnumType.STRING)               // Enum en base
```

**Configuration**:
```properties
# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

---

### 3. Spring Data JPA

**Rôle**: Repositories automatiques

**Exemple**:
```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Méthodes générées automatiquement:
    // - findAll()
    // - findById(Long id)
    // - save(Product product)
    // - deleteById(Long id)
    // - count()
    // - existsById(Long id)
    
    // Requêtes personnalisées:
    List<Product> findByCategoryId(Long categoryId);
    
    List<Product> findByDisponibleTrue();
    
    List<Product> findByNomContainingIgnoreCase(String nom);
    
    @Query("SELECT p FROM Product p WHERE p.prix < :maxPrice")
    List<Product> findCheapProducts(@Param("maxPrice") BigDecimal maxPrice);
}
```

**Avantages**:
- ✅ Pas de SQL à écrire (méthodes dérivées)
- ✅ Type-safe
- ✅ Pagination automatique
- ✅ Tri automatique

---

## 🔧 Utilities

### 1. Lombok 1.18.x

**Rôle**: Réduction code boilerplate  
**Site**: https://projectlombok.org

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>provided</scope>
</dependency>
```

**Annotations Utilisées**:

```java
@Data  // Génère: getters, setters, toString, equals, hashCode
@Builder  // Pattern Builder
@NoArgsConstructor  // Constructeur vide
@AllArgsConstructor  // Constructeur avec tous les champs
@Slf4j  // Logger automatique

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    private Long id;
    private String nom;
    private BigDecimal prix;
    
    // Pas besoin d'écrire getters/setters!
}
```

**Code Économisé**:
- Sans Lombok: ~100 lignes par entité
- Avec Lombok: ~20 lignes par entité

---

### 2. MapStruct 1.6.x

**Rôle**: Mapping Entity ↔ DTO  
**Site**: https://mapstruct.org

```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.6.3</version>
</dependency>
```

**Utilisation**:
```java
@Mapper(componentModel = "spring")
public interface ProductMapper {
    // Entity → DTO
    ProductDTO toDTO(Product product);
    
    // DTO → Entity
    Product toEntity(ProductDTO dto);
    
    // List mapping
    List<ProductDTO> toDTOList(List<Product> products);
}
```

**Avantages**:
- ✅ Génération à la compilation (rapide)
- ✅ Type-safe
- ✅ Pas de reflection
- ✅ Code lisible généré

---

### 3. Bean Validation 3.0

**Rôle**: Validation des données

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

**Annotations**:
```java
public class ProductDTO {
    @NotNull(message = "Le nom est obligatoire")
    @Size(min = 3, max = 200, message = "Le nom doit faire entre 3 et 200 caractères")
    private String nom;
    
    @NotNull
    @DecimalMin(value = "0.01", message = "Le prix doit être supérieur à 0")
    private BigDecimal prix;
    
    @Min(value = 0, message = "Le stock ne peut pas être négatif")
    private Integer stockQuantity;
    
    @Email(message = "Email invalide")
    private String email;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Téléphone invalide")
    private String telephone;
}
```

**Dans le Controller**:
```java
@PostMapping
public ResponseEntity<ProductDTO> create(@Valid @RequestBody ProductDTO dto) {
    // @Valid déclenche la validation automatique
    return ResponseEntity.ok(productService.create(dto));
}
```

---

## 🛡️ Resilience

### Resilience4j

**Rôle**: Circuit breaker, fallback  
**Site**: https://resilience4j.readme.io

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
</dependency>
```

**Configuration**:
```yaml
resilience4j:
  circuitbreaker:
    instances:
      categoryService:
        registerHealthIndicator: true
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        failureRateThreshold: 50
        waitDurationInOpenState: 10000
```

**Utilisation**:
```java
@Service
public class ProductService {
    
    @CircuitBreaker(name = "categoryService", fallbackMethod = "getCategoryFallback")
    public CategoryDTO getCategory(Long id) {
        return categoryClient.getCategoryById(id);
    }
    
    // Méthode de secours si Category Service est down
    public CategoryDTO getCategoryFallback(Long id, Exception e) {
        log.warn("Category Service unavailable, using fallback");
        return CategoryDTO.builder()
            .id(id)
            .nom("Category Unavailable")
            .build();
    }
}
```

**États du Circuit Breaker**:
- **CLOSED**: Tout va bien, requêtes passent
- **OPEN**: Trop d'erreurs, requêtes bloquées → fallback
- **HALF_OPEN**: Test si le service est revenu

---

## 🏗️ Build Tool

### Maven 3.9+

**Rôle**: Gestion dépendances et build

**Structure Multi-Modules**:
```
catalogue-microservices (parent)
├── pom.xml (parent POM)
├── config-server
│   └── pom.xml
├── eureka-server
│   └── pom.xml
├── api-gateway
│   └── pom.xml
├── category-service
│   └── pom.xml
├── product-service
│   └── pom.xml
└── order-service
    └── pom.xml
```

**Commandes Utiles**:
```bash
# Compiler tous les modules
mvn clean install

# Compiler sans tests
mvn clean install -DskipTests

# Lancer un service spécifique
mvn spring-boot:run -pl product-service

# Compiler seulement product-service et ses dépendances
mvn clean install -pl product-service -am

# Packager tous les services
mvn clean package
```

**Plugins Utilisés**:
```xml
<!-- Compilation Java 17 -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <source>17</source>
        <target>17</target>
        <annotationProcessorPaths>
            <!-- Lombok -->
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </path>
            <!-- MapStruct -->
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>

<!-- Spring Boot Maven Plugin -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
```

---

## 🧪 Tests (Optionnel)

### JUnit 5 + MockMVC

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

**Exemple de test**:
```java
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldCreateProduct() throws Exception {
        String productJson = """
            {
                "nom": "Test Product",
                "prix": 99.99,
                "categoryId": 1
            }
            """;
        
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(productJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Test Product"));
    }
}
```

---

## 📊 Monitoring

### Spring Boot Actuator

**Endpoints Disponibles**:
```
GET /actuator/health      → Statut du service
GET /actuator/metrics     → Métriques (CPU, mémoire, etc.)
GET /actuator/info        → Info sur l'application
GET /actuator/env         → Variables d'environnement
GET /actuator/beans       → Liste des beans Spring
GET /actuator/mappings    → Liste des endpoints REST
```

**Configuration**:
```properties
# Exposer tous les endpoints
management.endpoints.web.exposure.include=*

# Health avec détails
management.endpoint.health.show-details=always

# Info custom
info.app.name=Product Service
info.app.version=0.0.1-SNAPSHOT
```

---

## 🔮 Technologies Futures (Concept)

Si le projet devait être étendu avec l'IA:

### Python + PyTorch (AI Service)

```python
# ai-service/app.py
from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# NLP pour comprendre les requêtes
nlp = pipeline("text-classification", model="bert-base-multilingual")

@app.route('/api/ai/chat', methods=['POST'])
def chat():
    message = request.json['message']
    
    # Analyse de l'intent
    intent = nlp(message)[0]
    
    if intent['label'] == 'search_product':
        # Appeler Product Service
        products = search_products(message)
        return jsonify(products)
    
    return jsonify({"response": "Je n'ai pas compris"})
```

### React (Frontend)

```jsx
// frontend/src/components/ProductList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProductList() {
    const [products, setProducts] = useState([]);
    
    useEffect(() => {
        axios.get('http://localhost:8080/api/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error(err));
    }, []);
    
    return (
        <div>
            {products.map(product => (
                <div key={product.id}>
                    <h3>{product.nom}</h3>
                    <p>{product.prix}€</p>
                </div>
            ))}
        </div>
    );
}
```

**Note**: Ceci est conceptuel, non implémenté.

---

## 📋 Récapitulatif Technologies

### Stack Actuelle

| Catégorie | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| **Langage** | Java | 17 | Développement |
| **Framework** | Spring Boot | 3.4.1 | Backend |
| **Cloud** | Spring Cloud | 2024.0.0 | Microservices |
| **Build** | Maven | 3.9+ | Build & dépendances |
| **ORM** | Hibernate/JPA | 6.x | Persistence |
| **Database** | H2 | 2.3.x | Stockage (dev) |
| **Utilities** | Lombok | 1.18.x | Code generation |
| **Mapping** | MapStruct | 1.6.x | DTO mapping |
| **Validation** | Bean Validation | 3.0 | Data validation |
| **Resilience** | Resilience4j | Latest | Circuit breaker |
| **Monitoring** | Actuator | Inclus | Health & metrics |

### Outils de Développement

| Outil | Usage |
|-------|-------|
| **IntelliJ IDEA** | IDE principal |
| **Postman** | Tests API REST |
| **Git** | Contrôle de version |
| **H2 Console** | Visualisation DB |
| **Eureka Dashboard** | Monitoring services |

---

## 🎓 Pourquoi Cette Stack?

### Avantages Pédagogiques
✅ Technologies enseignées en cours  
✅ Stack demandée en entreprise  
✅ Bonne courbe d'apprentissage  
✅ Documentation abondante  
✅ Communauté active

### Avantages Techniques
✅ Architecture moderne (microservices)  
✅ Scalable et maintenable  
✅ Production-ready  
✅ Outils de monitoring intégrés  
✅ Gestion d'erreurs robuste

### Rapport Complexité/Valeur
```
Complexité:        ⭐⭐⭐ (Moyenne)
Valeur ajoutée:    ⭐⭐⭐⭐⭐ (Excellente)
Employabilité:     ⭐⭐⭐⭐⭐ (Top!)
```

---

## 📚 Ressources Utiles

### Documentation Officielle
- **Spring Boot**: https://spring.io/projects/spring-boot
- **Spring Cloud**: https://spring.io/projects/spring-cloud
- **Hibernate**: https://hibernate.org/orm/documentation
- **Lombok**: https://projectlombok.org/features/all
- **MapStruct**: https://mapstruct.org/documentation

### Tutoriels Recommandés
- Spring Boot Official Guides: https://spring.io/guides
- Baeldung (tutorials Java/Spring): https://www.baeldung.com
- Netflix Eureka: https://github.com/Netflix/eureka/wiki

---

**Document rédigé**: Novembre 2025  
**But**: Documentation technique du projet  
**Statut**: ✅ Complete

