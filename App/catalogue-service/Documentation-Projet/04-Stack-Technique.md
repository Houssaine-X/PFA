# Stack Technique - Technologies Utilisées

## 🛠️ Vue d'Ensemble

Ce document détaille toutes les technologies du projet e-commerce avec microservices, intégration PayPal, et architecture extensible.

**Architecture**: 7 Microservices (3 Infrastructure + 4 Métier)  
**Complexité**: Moyenne-Haute  
**Intégrations Externes**: PayPal REST API  
**Vision Future**: Prêt pour IA (documenté, non implémenté)

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

Utilisation - Communication Inter-Services:
```java
// User Service → Order Service
@FeignClient(name = "order-service")
public interface OrderClient {
    @GetMapping("/api/orders/user/{userId}")
    List<OrderDTO> getOrdersByUserId(@PathVariable Long userId);
}

// Order Service → Product Service
@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable Long id);
    
    @PatchMapping("/api/products/{id}/stock")
    void updateStock(@PathVariable Long id, @RequestParam Integer quantity);
}

// Order Service → User Service
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable Long id);
}
```

**Avantages OpenFeign**:
- ✅ Déclaratif (interface seulement)
- ✅ Intégration Eureka automatique
- ✅ Load balancing client-side
- ✅ Circuit breaker compatible

---

## 💳 Intégration Paiement

### PayPal REST API SDK 1.14.0

**Rôle**: Gestion des paiements PayPal  
**Site**: https://developer.paypal.com

```xml
<dependency>
    <groupId>com.paypal.sdk</groupId>
    <artifactId>rest-api-sdk</artifactId>
    <version>1.14.0</version>
</dependency>
```

**Configuration**:
```java
@Configuration
@ConfigurationProperties(prefix = "paypal")
@Data
public class PayPalConfig {
    private String clientId;
    private String clientSecret;
    private String mode; // sandbox ou live
    
    @Bean
    public Map<String, String> paypalSdkConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("mode", mode);
        return config;
    }
    
    @Bean
    public OAuthTokenCredential oAuthTokenCredential() {
        return new OAuthTokenCredential(clientId, clientSecret, paypalSdkConfig());
    }
    
    @Bean
    public APIContext apiContext() {
        return new APIContext(clientId, clientSecret, mode);
    }
}
```

**Properties (Config Server)**:
```properties
# payment-service.properties
paypal.client-id=YOUR_SANDBOX_CLIENT_ID
paypal.client-secret=YOUR_SANDBOX_CLIENT_SECRET
paypal.mode=sandbox
```

**Service PayPal**:
```java
@Service
@RequiredArgsConstructor
public class PayPalService {
    private final APIContext apiContext;
    
    public Payment createPayment(
        BigDecimal total,
        String currency,
        String description,
        String cancelUrl,
        String successUrl
    ) throws PayPalRESTException {
        // Créer montant
        Amount amount = new Amount();
        amount.setCurrency(currency);
        amount.setTotal(String.format("%.2f", total));
        
        // Créer transaction
        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amount);
        
        // Créer paiement
        Payment payment = new Payment();
        payment.setIntent("sale");
        payment.setPayer(new Payer().setPaymentMethod("paypal"));
        payment.setTransactions(List.of(transaction));
        
        // URLs de redirection
        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);
        
        return payment.create(apiContext);
    }
    
    public Payment executePayment(String paymentId, String payerId) 
        throws PayPalRESTException {
        Payment payment = new Payment();
        payment.setId(paymentId);
        
        PaymentExecution execution = new PaymentExecution();
        execution.setPayerId(payerId);
        
        return payment.execute(apiContext, execution);
    }
}
```

**Workflow**:
1. Client POST /api/payments/paypal/create → Reçoit approvalUrl
2. Client redirigé vers PayPal pour approuver
3. PayPal redirige vers successUrl avec paymentId + payerId
4. Client POST /api/payments/paypal/execute → Finalise paiement

**Avantages**:
- ✅ SDK officiel bien maintenu
- ✅ Sandbox gratuit pour tests
- ✅ Pas de PCI compliance nécessaire
- ✅ Reconnu et sécurisé

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
├── config-server         → Port 8888
│   └── pom.xml
├── eureka-server         → Port 8761
│   └── pom.xml
├── api-gateway           → Port 8080
│   └── pom.xml
├── user-service          → Port 8083 🆕
│   └── pom.xml
├── product-service       → Port 8081
│   └── pom.xml
├── order-service         → Port 8085
│   └── pom.xml
└── payment-service       → Port 8084 🆕
    └── pom.xml
```

**7 Services**:
- 3 Infrastructure (Config, Eureka, Gateway)
- 4 Métier (User, Product, Order, Payment)

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

## 🧪 Tests

### JUnit 5 + Mockito

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

**Tests Unitaires - Payment Service** (7/7 Passed ✅):
```java
@ExtendWith(MockitoExtension.class)
class PaymentServicePayPalTest {
    
    @Mock
    private PaymentRepository paymentRepository;
    
    @Mock
    private PayPalService payPalService;
    
    @InjectMocks
    private PaymentService paymentService;
    
    @Test
    void createPayPalPayment_Success() {
        // Given
        PayPalPaymentRequest request = PayPalPaymentRequest.builder()
            .orderId(1L)
            .userId(1L)
            .amount(new BigDecimal("299.99"))
            .currency("USD")
            .build();
            
        com.paypal.api.payments.Payment mockPayment = new com.paypal.api.payments.Payment();
        mockPayment.setId("PAYID-123");
        mockPayment.setState("created");
        
        when(payPalService.createPayment(any(), any(), any(), any(), any()))
            .thenReturn(mockPayment);
        when(payPalService.getApprovalUrl(any()))
            .thenReturn("https://paypal.com/approve");
        
        // When
        PayPalPaymentResponse response = paymentService.createPayPalPayment(request);
        
        // Then
        assertThat(response.getPaymentId()).isEqualTo("PAYID-123");
        assertThat(response.getStatus()).isEqualTo("created");
        verify(paymentRepository).save(any(Payment.class));
    }
}
```

**Tests Controller**:
```java
@WebMvcTest(PaymentController.class)
class PaymentControllerPayPalTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockitoBean
    private PaymentService paymentService;
    
    @Test
    void createPayPalPayment_Success() throws Exception {
        PayPalPaymentResponse mockResponse = PayPalPaymentResponse.builder()
            .paymentId("PAYID-123")
            .approvalUrl("https://paypal.com/approve")
            .status("created")
            .build();
            
        when(paymentService.createPayPalPayment(any()))
            .thenReturn(mockResponse);
        
        mockMvc.perform(post("/api/payments/paypal/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "orderId": 1,
                        "userId": 1,
                        "amount": 299.99,
                        "currency": "USD"
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value("PAYID-123"));
    }
}
```

**Résultat**: 7/7 tests passed ✅
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

## 📊 Récapitulatif Stack Complet

### Infrastructure (3 Services)

| Service | Port | Technologie | Rôle |
|---------|------|-------------|------|
| **Config Server** | 8888 | Spring Cloud Config | Configuration centralisée |
| **Eureka Server** | 8761 | Netflix Eureka | Service Discovery |
| **API Gateway** | 8080 | Spring Cloud Gateway | Routing + Circuit Breaker |

### Services Métier (4 Services)

| Service | Port | Base de Données | Rôle |
|---------|------|-----------------|------|
| **User Service** | 8083 | H2 (user_db) | Gestion utilisateurs + rôles |
| **Product Service** | 8081 | H2 (product_db) | Produits + catégories intégrées |
| **Order Service** | 8085 | H2 (order_db) | Commandes + OpenFeign |
| **Payment Service** | 8084 | H2 (payment_db) | Paiements PayPal |

### Communication Inter-Services (OpenFeign)

```
User Service ──→ Order Service (historique commandes)
Order Service ──→ User Service (vérification utilisateur)
Order Service ──→ Product Service (stock + prix)
Payment Service ──→ PayPal API (paiements externes)
```

### Technologies Clés

| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| **Framework** | Spring Boot | 3.4.1 | Backend principal |
| **Cloud** | Spring Cloud | 2024.0.0 | Microservices |
| **Langage** | Java | 17 LTS | Développement |
| **Build** | Maven | 3.9+ | Gestion projet |
| **DB Dev** | H2 | 2.3.x | Base en mémoire |
| **ORM** | Hibernate/JPA | 6.x | Persistence |
| **Mapper** | MapStruct | 1.6.3 | Entity ↔ DTO |
| **Validation** | Bean Validation | 3.0 | Validation données |
| **Circuit Breaker** | Resilience4j | Latest | Fault tolerance |
| **Paiement** | PayPal SDK | 1.14.0 | Intégration paiements |
| **Tests** | JUnit 5 + Mockito | Latest | Tests unitaires |
| **Logger** | SLF4J + Logback | Latest | Logs |

---

## 🎯 Points Forts de la Stack

### 1. Architecture Moderne
✅ Microservices découplés  
✅ Service Discovery automatique  
✅ Configuration centralisée  
✅ Circuit breaker pour résilience

### 2. Bonnes Pratiques
✅ Clean code (Lombok réduit boilerplate)  
✅ Type-safe (Java 17 + MapStruct)  
✅ Validation automatique (Bean Validation)  
✅ Tests unitaires (7/7 passed Payment Service)

### 3. Production-Ready
✅ Actuator pour monitoring  
✅ H2 dev, MySQL production possible  
✅ Circuit breaker pour fault tolerance  
✅ OpenFeign pour communication inter-services

### 4. Intégration Externe
✅ PayPal SDK officiel  
✅ Sandbox gratuit pour tests  
✅ Workflow complet (create/approve/execute)  
✅ Configuration sécurisée (Config Server)

### 5. Extensibilité Future
✅ Architecture prête pour ajout de services (IA)  
✅ Pas de refactoring nécessaire  
✅ Communication déclarative (OpenFeign)  
✅ Découplage fort entre services

---

## 🔧 Commandes Essentielles

### Démarrage Services
```bash
# Infrastructure d'abord
cd eureka-server && mvn spring-boot:run          # Port 8761
cd config-server && mvn spring-boot:run          # Port 8888
cd api-gateway && mvn spring-boot:run            # Port 8080

# Puis services métier
cd user-service && mvn spring-boot:run           # Port 8083
cd product-service && mvn spring-boot:run        # Port 8081
cd order-service && mvn spring-boot:run          # Port 8085
cd payment-service && mvn spring-boot:run        # Port 8084
```

Ou utiliser le script:
```bash
start-all-services.bat
```

### Build Complet
```bash
# Depuis la racine
mvn clean install -DskipTests

# Avec tests
mvn clean install
```

### Tests
```bash
# Tests d'un service
cd payment-service
mvn test

# Tests de tous les services
mvn test
```

---

## 🌐 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Eureka Dashboard** | http://localhost:8761 | Voir tous les services |
| **API Gateway** | http://localhost:8080 | Point d'entrée unique |
| **Config Server** | http://localhost:8888 | Configuration centralisée |
| **H2 Console User** | http://localhost:8083/h2-console | DB User Service |
| **H2 Console Product** | http://localhost:8081/h2-console | DB Product Service |
| **H2 Console Order** | http://localhost:8085/h2-console | DB Order Service |
| **H2 Console Payment** | http://localhost:8084/h2-console | DB Payment Service |

**H2 Console Config**:
- JDBC URL: `jdbc:h2:mem:{service}_db` (ex: user_db)
- Username: `sa`
- Password: _(vide)_

---

## 📚 Ressources Utiles

### Documentation Officielle
- **Spring Boot**: https://spring.io/projects/spring-boot
- **Spring Cloud**: https://spring.io/projects/spring-cloud
- **PayPal Developer**: https://developer.paypal.com
- **Hibernate**: https://hibernate.org/orm/documentation
- **Lombok**: https://projectlombok.org/features/all
- **MapStruct**: https://mapstruct.org/documentation
- **Resilience4j**: https://resilience4j.readme.io

### Tutoriels Recommandés
- Spring Boot Official Guides: https://spring.io/guides
- Baeldung (tutorials Java/Spring): https://www.baeldung.com
- Netflix Eureka: https://github.com/Netflix/eureka/wiki

---

## 💡 Vision Future (Non Implémenté)

Si extension vers l'IA (documenté dans Benchmark):

**Options Comparées**:
1. **OpenAI GPT-4** - Chatbot conversationnel (100-500€/mois)
2. **ML Custom** - Collaborative filtering (gratuit, nécessite données)
3. **Rasa Open Source** - Chatbot gratuit (qualité moindre)
4. **Embeddings** - Recherche sémantique (50-100€/mois)

**Architecture Extensible**:
```
AI Service (Port 8086) ─→ User/Product/Order Services
                          via OpenFeign
```

**Avantage**: Ajout sans modifier les services existants ✅

---

**Document rédigé**: Décembre 2025  
**But**: Documentation technique complète du projet  
**Statut**: ✅ Complete  
**Version**: 2.0 (inclut User Service + Payment Service PayPal)

