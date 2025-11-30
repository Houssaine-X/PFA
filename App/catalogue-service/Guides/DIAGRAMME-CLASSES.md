# 📊 DIAGRAMME DE CLASSES - Catalogue Microservices

## Vue d'ensemble des packages

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PACKAGE: com.catalogue.gateway                    │
│                         (API Gateway - Port 8080)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  @SpringBootApplication                                              │
│  @EnableDiscoveryClient                                              │
│  ApiGatewayApplication                                               │
│  └── main(String[] args)                                             │
│                                                                       │
│  @Configuration                                                      │
│  GatewayConfig                                                       │
│  └── customRouteLocator(RouteLocatorBuilder): RouteLocator          │
│                                                                       │
│  @RestController                                                     │
│  FallbackController                                                  │
│  ├── categoryFallback(): ResponseEntity<Map>                        │
│  ├── productFallback(): ResponseEntity<Map>                         │
│  └── orderFallback(): ResponseEntity<Map>                           │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   PACKAGE: com.catalogue.category                    │
│                     (Category Service - Port 8081)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  @Entity                                                             │
│  Category                                                            │
│  ├── id: Long                                                        │
│  ├── nom: String                                                     │
│  ├── description: String                                             │
│  ├── createdAt: LocalDateTime                                        │
│  └── updatedAt: LocalDateTime                                        │
│         ↑                                                            │
│         │ (mapped by)                                                │
│         │                                                            │
│  CategoryDTO                                                         │
│  ├── id: Long                                                        │
│  ├── nom: String                                                     │
│  ├── description: String                                             │
│  ├── createdAt: LocalDateTime                                        │
│  └── updatedAt: LocalDateTime                                        │
│         ↑                                                            │
│         │ (MapStruct)                                                │
│         │                                                            │
│  @Mapper(componentModel = "spring")                                 │
│  CategoryMapper                                                      │
│  ├── toDTO(Category): CategoryDTO                                   │
│  ├── toEntity(CategoryDTO): Category                                │
│  ├── toDTOList(List<Category>): List<CategoryDTO>                  │
│  └── toEntityList(List<CategoryDTO>): List<Category>               │
│         ↑                                                            │
│         │ (uses)                                                     │
│         │                                                            │
│  @Repository                                                         │
│  CategoryRepository extends JpaRepository<Category, Long>           │
│  └── findByNom(String): Optional<Category>                          │
│         ↑                                                            │
│         │ (uses)                                                     │
│         │                                                            │
│  @Service                                                            │
│  CategoryService                                                     │
│  ├── createCategory(CategoryDTO): CategoryDTO                       │
│  ├── getCategoryById(Long): CategoryDTO                             │
│  ├── getAllCategories(): List<CategoryDTO>                          │
│  ├── updateCategory(Long, CategoryDTO): CategoryDTO                 │
│  ├── deleteCategory(Long): void                                     │
│  └── getCategoryByNom(String): CategoryDTO                          │
│         ↑                                                            │
│         │ (uses)                                                     │
│         │                                                            │
│  @RestController                                                     │
│  @RequestMapping("/api/categories")                                 │
│  CategoryController                                                  │
│  ├── createCategory(CategoryDTO): ResponseEntity<CategoryDTO>       │
│  ├── getCategoryById(Long): ResponseEntity<CategoryDTO>             │
│  ├── getAllCategories(): ResponseEntity<List<CategoryDTO>>          │
│  ├── updateCategory(Long, CategoryDTO): ResponseEntity<CategoryDTO> │
│  ├── deleteCategory(Long): ResponseEntity<Void>                     │
│  └── getCategoryByNom(String): ResponseEntity<CategoryDTO>          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    PACKAGE: com.catalogue.product                    │
│                      (Product Service - Port 8082)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  @Entity                                                             │
│  Product                                                             │
│  ├── id: Long                                                        │
│  ├── nom: String                                                     │
│  ├── description: String                                             │
│  ├── prix: BigDecimal                                                │
│  ├── stockQuantity: Integer                                          │
│  ├── disponible: Boolean                                             │
│  ├── categoryId: Long ───────────────────┐                          │
│  ├── imageUrl: String                     │                          │
│  ├── createdAt: LocalDateTime             │                          │
│  └── updatedAt: LocalDateTime             │                          │
│         ↑                                  │                          │
│         │ (mapped by)                     │                          │
│         │                                  │                          │
│  ProductDTO                                │                          │
│  ├── id: Long                              │                          │
│  ├── nom: String                           │                          │
│  ├── description: String                   │                          │
│  ├── prix: BigDecimal                      │                          │
│  ├── stockQuantity: Integer                │                          │
│  ├── disponible: Boolean                   │                          │
│  ├── categoryId: Long                      │                          │
│  ├── imageUrl: String                      │                          │
│  ├── createdAt: LocalDateTime              │                          │
│  └── updatedAt: LocalDateTime              │                          │
│         ↑                                  │                          │
│         │ (MapStruct)                      │                          │
│         │                                  │                          │
│  @Mapper(componentModel = "spring")        │                          │
│  ProductMapper                             │                          │
│  ├── toDTO(Product): ProductDTO            │                          │
│  ├── toEntity(ProductDTO): Product         │                          │
│  ├── toDTOList(List): List                 │                          │
│  └── toEntityList(List): List              │                          │
│         ↑                                  │                          │
│         │ (uses)                           │                          │
│         │                                  │                          │
│  @Repository                                │                          │
│  ProductRepository extends JpaRepository<Product, Long>              │
│  ├── findByCategoryId(Long): List<Product> │                          │
│  ├── findByDisponibleTrue(): List<Product> │                          │
│  └── findByNomContaining(String): List     │                          │
│         ↑                                  │                          │
│         │ (uses)                           │                          │
│         │                                  │                          │
│  @FeignClient(name = "category-service")   │  ← COMMUNICATION         │
│  CategoryClient ◄──────────────────────────┘    INTER-SERVICE        │
│  └── getCategoryById(Long): CategoryDTO       (OpenFeign)            │
│         ↑                                                            │
│         │ (uses)                                                     │
│         │                                                            │
│  @Service                                                            │
│  ProductService                                                      │
│  ├── createProduct(ProductDTO): ProductDTO                          │
│  ├── getProductById(Long): ProductDTO                               │
│  ├── getAllProducts(): List<ProductDTO>                             │
│  ├── updateProduct(Long, ProductDTO): ProductDTO                    │
│  ├── deleteProduct(Long): void                                      │
│  ├── getProductsByCategory(Long): List<ProductDTO>                  │
│  ├── updateStock(Long, Integer): ProductDTO                         │
│  └── getAvailableProducts(): List<ProductDTO>                       │
│         ↑                                                            │
│         │ (uses)                                                     │
│         │                                                            │
│  @RestController                                                     │
│  @RequestMapping("/api/products")                                   │
│  ProductController                                                   │
│  ├── createProduct(ProductDTO): ResponseEntity<ProductDTO>          │
│  ├── getProductById(Long): ResponseEntity<ProductDTO>               │
│  ├── getAllProducts(): ResponseEntity<List<ProductDTO>>             │
│  ├── updateProduct(Long, ProductDTO): ResponseEntity<ProductDTO>    │
│  ├── deleteProduct(Long): ResponseEntity<Void>                      │
│  ├── getProductsByCategory(Long): ResponseEntity<List<ProductDTO>>  │
│  ├── updateStock(Long, Integer): ResponseEntity<ProductDTO>         │
│  └── getAvailableProducts(): ResponseEntity<List<ProductDTO>>       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     PACKAGE: com.catalogue.order                     │
│                       (Order Service - Port 8083)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  @Entity                                                             │
│  Order                                                               │
│  ├── id: Long                                                        │
│  ├── userId: Long                                                    │
│  ├── orderDate: LocalDateTime                                        │
│  ├── status: OrderStatus                                             │
│  ├── totalAmount: BigDecimal                                         │
│  ├── items: List<OrderItem> ──────────┐                             │
│  ├── createdAt: LocalDateTime          │                             │
│  └── updatedAt: LocalDateTime          │                             │
│         ↑                               │                             │
│         │                               │                             │
│  @Entity                                │                             │
│  OrderItem ◄────────────────────────────┘                            │
│  ├── id: Long                           (OneToMany)                  │
│  ├── order: Order                                                    │
│  ├── productId: Long ──────────────────┐                            │
│  ├── quantity: Integer                  │                            │
│  ├── unitPrice: BigDecimal              │                            │
│  └── totalPrice: BigDecimal             │                            │
│         ↑                                │                            │
│         │ (mapped by)                   │                            │
│         │                                │                            │
│  OrderDTO                                │                            │
│  ├── id: Long                            │                            │
│  ├── userId: Long                        │                            │
│  ├── orderDate: LocalDateTime            │                            │
│  ├── status: OrderStatus                 │                            │
│  ├── totalAmount: BigDecimal             │                            │
│  ├── items: List<OrderItemDTO>           │                            │
│  ├── createdAt: LocalDateTime            │                            │
│  └── updatedAt: LocalDateTime            │                            │
│         ↑                                │                            │
│         │                                │                            │
│  OrderItemDTO                            │                            │
│  ├── id: Long                            │                            │
│  ├── productId: Long                     │                            │
│  ├── quantity: Integer                   │                            │
│  ├── unitPrice: BigDecimal               │                            │
│  └── totalPrice: BigDecimal              │                            │
│         ↑                                │                            │
│         │ (MapStruct)                    │                            │
│         │                                │                            │
│  @Mapper(componentModel = "spring")      │                            │
│  OrderMapper                             │                            │
│  ├── toDTO(Order): OrderDTO              │                            │
│  ├── toEntity(OrderDTO): Order           │                            │
│  ├── toDTOList(List): List               │                            │
│  └── toEntityList(List): List            │                            │
│         ↑                                │                            │
│         │ (uses)                         │                            │
│         │                                │                            │
│  @Repository                              │                            │
│  OrderRepository extends JpaRepository<Order, Long>                  │
│  ├── findByUserId(Long): List<Order>     │                            │
│  └── findByStatus(OrderStatus): List     │                            │
│         ↑                                │                            │
│         │ (uses)                         │                            │
│         │                                │                            │
│  @Repository                              │                            │
│  OrderItemRepository extends JpaRepository<OrderItem, Long>          │
│  └── findByOrderId(Long): List           │                            │
│         ↑                                │                            │
│         │ (uses)                         │                            │
│         │                                │                            │
│  @FeignClient(name = "product-service")  │  ← COMMUNICATION           │
│  ProductClient ◄─────────────────────────┘    INTER-SERVICE          │
│  ├── getProductById(Long): ProductDTO       (OpenFeign)              │
│  └── updateStock(Long, Integer): ProductDTO                          │
│         ↑                                                            │
│         │ (uses)                                                     │
│         │                                                            │
│  @Service                                                            │
│  OrderService                                                        │
│  ├── createOrder(OrderDTO): OrderDTO                                │
│  ├── getOrderById(Long): OrderDTO                                   │
│  ├── getAllOrders(): List<OrderDTO>                                 │
│  ├── updateOrder(Long, OrderDTO): OrderDTO                          │
│  ├── deleteOrder(Long): void                                        │
│  ├── getOrdersByUser(Long): List<OrderDTO>                          │
│  └── getOrdersByStatus(OrderStatus): List<OrderDTO>                 │
│         ↑                                                            │
│         │ (uses)                                                     │
│         │                                                            │
│  @RestController                                                     │
│  @RequestMapping("/api/orders")                                     │
│  OrderController                                                     │
│  ├── createOrder(OrderDTO): ResponseEntity<OrderDTO>                │
│  ├── getOrderById(Long): ResponseEntity<OrderDTO>                   │
│  ├── getAllOrders(): ResponseEntity<List<OrderDTO>>                 │
│  ├── updateOrder(Long, OrderDTO): ResponseEntity<OrderDTO>          │
│  ├── deleteOrder(Long): ResponseEntity<Void>                        │
│  ├── getOrdersByUser(Long): ResponseEntity<List<OrderDTO>>          │
│  └── getOrdersByStatus(String): ResponseEntity<List<OrderDTO>>      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE SERVICES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  PACKAGE: com.catalogue.config (Port 8888)                          │
│  ├── @SpringBootApplication                                         │
│  ├── @EnableConfigServer                                            │
│  └── ConfigServerApplication                                        │
│                                                                       │
│  PACKAGE: com.catalogue.eureka (Port 8761)                          │
│  ├── @SpringBootApplication                                         │
│  ├── @EnableEurekaServer                                            │
│  └── EurekaServerApplication                                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Légende

- **@Entity** : Entité JPA (base de données)
- **DTO** : Data Transfer Object (transfert de données)
- **@Repository** : Couche d'accès aux données
- **@Service** : Logique métier
- **@RestController** : Contrôleur REST (API)
- **@FeignClient** : Client de communication inter-services
- **→** : Relation / Dépendance
- **↑** : Utilise / Hérite

## Communications Inter-Services (OpenFeign)

```
Product Service ──(CategoryClient)──> Category Service
     │                                      │
     │ Validation de categoryId             │
     │ lors de la création de produit       │
     └──────────────────────────────────────┘

Order Service ──(ProductClient)──> Product Service
     │                                   │
     │ 1. Vérification disponibilité     │
     │ 2. Mise à jour du stock           │
     └───────────────────────────────────┘
```

## Patterns Utilisés

1. **Layered Architecture** : Controller → Service → Repository
2. **DTO Pattern** : Séparation Entity / DTO
3. **Mapper Pattern** : MapStruct pour conversion automatique
4. **Repository Pattern** : Spring Data JPA
5. **Service Discovery** : Eureka
6. **API Gateway Pattern** : Spring Cloud Gateway
7. **Circuit Breaker Pattern** : Resilience dans Gateway
8. **Centralized Configuration** : Spring Cloud Config

