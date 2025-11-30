# 🚀 GUIDE POSTMAN - Comment Utiliser la Collection

## 📥 ÉTAPE 1: INSTALLER POSTMAN

### Si vous n'avez pas Postman:
1. Aller sur https://www.postman.com/downloads/
2. Télécharger Postman pour Windows
3. Installer et ouvrir l'application
4. Créer un compte gratuit (optionnel mais recommandé)

---

## 📂 ÉTAPE 2: IMPORTER LA COLLECTION

### Méthode visuelle (avec captures d'écran textuelles):

1. **Ouvrir Postman**
   - Lancez l'application Postman

2. **Cliquer sur "Import"**
   - Bouton en haut à gauche de l'interface
   - OU: File → Import
   - OU: Raccourci Ctrl+O

3. **Sélectionner le fichier**
   - Cliquer sur "Upload Files" ou glisser-déposer
   - Naviguer vers: `C:\Users\houss\catalogue-service\`
   - Sélectionner: `Catalogue-Microservices-Postman-Collection.json`
   - Cliquer sur "Open"

4. **Confirmer l'import**
   - Postman affiche un aperçu de la collection
   - Cliquer sur "Import"

5. **Vérifier l'import**
   - La collection "Catalogue Microservices - Complete API Tests" apparaît dans la barre latérale gauche
   - Vous devriez voir 6 dossiers:
     ```
     📁 Catalogue Microservices - Complete API Tests
        ├── 📁 1. Infrastructure Services
        ├── 📁 2. Category Service (via Gateway)
        ├── 📁 3. Product Service (via Gateway)
        ├── 📁 4. Order Service (via Gateway)
        ├── 📁 5. DEMO OpenFeign - Product → Category
        └── 📁 6. DEMO OpenFeign - Order → Product
     ```

---

## ▶️ ÉTAPE 3: DÉMARRER LES SERVICES

**IMPORTANT:** Avant de tester les APIs, les services doivent être démarrés!

1. **Ouvrir un terminal/cmd**
   ```bash
   cd C:\Users\houss\catalogue-service
   ```

2. **Démarrer tous les services**
   ```bash
   start-all-services.bat
   ```

3. **Attendre 2-3 minutes** ⏱️
   - Les services démarrent dans l'ordre
   - Des fenêtres de terminal s'ouvrent pour chaque service

4. **Vérifier que les services sont UP**
   - Ouvrir un navigateur
   - Aller sur: http://localhost:8761
   - Vous devriez voir 4 services enregistrés:
     - API-GATEWAY (port 8080)
     - CATEGORY-SERVICE (port 8081)
     - PRODUCT-SERVICE (port 8082)
     - ORDER-SERVICE (port 8083)

---

## 🧪 ÉTAPE 4: EXÉCUTER VOS PREMIÈRES REQUÊTES

### Test 1: Vérifier l'API Gateway

1. **Dans Postman, dérouler le dossier:**
   ```
   1. Infrastructure Services
   ```

2. **Cliquer sur:**
   ```
   API Gateway - Health Check
   ```

3. **Cliquer sur le bouton bleu "Send"** (en haut à droite)

4. **Résultat attendu:**
   ```json
   {
     "status": "UP"
   }
   ```
   - Status: 200 OK (en vert)
   - Temps de réponse: ~50-200ms

✅ **Si vous voyez ce résultat, l'API Gateway fonctionne!**

---

### Test 2: Récupérer toutes les catégories

1. **Dérouler le dossier:**
   ```
   2. Category Service (via Gateway)
   ```

2. **Cliquer sur:**
   ```
   GET All Categories
   ```

3. **Cliquer sur "Send"**

4. **Résultat attendu:**
   ```json
   [
     {
       "id": 1,
       "nom": "Electronics",
       "description": "Electronic devices and gadgets",
       "createdAt": "2024-11-24T...",
       "updatedAt": "2024-11-24T..."
     },
     {
       "id": 2,
       "nom": "Computers",
       ...
     },
     ...
   ]
   ```
   - Status: 200 OK
   - 8 catégories retournées

✅ **Vous venez de faire votre premier appel API!**

---

### Test 3: Créer une nouvelle catégorie

1. **Dans le même dossier, cliquer sur:**
   ```
   POST Create Category
   ```

2. **Observer la requête:**
   - **Method:** POST (en orange)
   - **URL:** http://localhost:8080/api/categories
   - **Headers:** Content-Type: application/json (onglet Headers)
   - **Body:** Onglet Body → raw → JSON
     ```json
     {
       "nom": "Nouvelle Catégorie",
       "description": "Description de test pour la démo"
     }
     ```

3. **Modifier le JSON si vous voulez:**
   - Changez "Nouvelle Catégorie" par le nom de votre choix
   - Changez la description

4. **Cliquer sur "Send"**

5. **Résultat attendu:**
   ```json
   {
     "id": 9,
     "nom": "Nouvelle Catégorie",
     "description": "Description de test pour la démo",
     "createdAt": "2024-11-24T22:45:00",
     "updatedAt": "2024-11-24T22:45:00"
   }
   ```
   - Status: 201 Created
   - La catégorie a été créée avec un nouvel ID

6. **Vérifier la création:**
   - Re-exécuter "GET All Categories"
   - Vous devriez voir votre nouvelle catégorie dans la liste!

✅ **Vous venez de créer une ressource via l'API!**

---

## ⭐ ÉTAPE 5: LES DÉMONSTRATIONS OPENFEIGN

### DEMO 1: Product Service → Category Service (2 minutes)

**Objectif:** Montrer que Product Service valide la catégorie via OpenFeign

1. **Ouvrir le dossier:**
   ```
   5. DEMO OpenFeign - Product → Category
   ```

2. **STEP 1: Verify Category Exists**
   - Cliquer sur cette requête
   - Cliquer "Send"
   - ✅ Résultat: Catégorie ID=1 "Electronics" existe

3. **STEP 2: Create Product (Success - OpenFeign)**
   - Cliquer sur cette requête
   - Observer le body:
     ```json
     {
       "nom": "Demo OpenFeign - Succès",
       "categoryId": 1,  ← Catégorie valide
       ...
     }
     ```
   - Cliquer "Send"
   - ✅ Résultat: Status 201 Created
   - **Explication:** Product Service a appelé Category Service via OpenFeign pour valider que categoryId=1 existe

4. **STEP 3: Create Product (Fail - OpenFeign)**
   - Cliquer sur cette requête
   - Observer le body:
     ```json
     {
       "nom": "Demo OpenFeign - Échec",
       "categoryId": 999,  ← Catégorie INVALIDE
       ...
     }
     ```
   - Cliquer "Send"
   - ❌ Résultat: Status 404 ou 500 (erreur)
   - **Explication:** OpenFeign a détecté que la catégorie n'existe pas et a retourné une erreur

**🎯 Conclusion:** Product Service communique avec Category Service via OpenFeign pour valider les données!

---

### DEMO 2: Order Service → Product Service (3 minutes)

**Objectif:** Montrer que Order Service met à jour le stock via OpenFeign

1. **Ouvrir le dossier:**
   ```
   6. DEMO OpenFeign - Order → Product
   ```

2. **STEP 1: Check Initial Stock**
   - Cliquer sur cette requête
   - Cliquer "Send"
   - 📊 **Noter le stock actuel** (exemple: "stockQuantity": 50)
   - Écrire ce nombre sur un papier!

3. **STEP 2: Create Order (OpenFeign Updates Stock)**
   - Cliquer sur cette requête
   - Observer le body:
     ```json
     {
       "userId": 1,
       "status": "PENDING",
       "items": [
         {
           "productId": 1,
           "quantity": 5  ← On commande 5 unités
         }
       ]
     }
     ```
   - Cliquer "Send"
   - ✅ Résultat: Status 201 Created, commande créée
   - **Explication:** Order Service vient d'appeler Product Service via OpenFeign pour:
     - Vérifier que le produit existe
     - Vérifier la disponibilité
     - **Mettre à jour le stock (-5 unités)**
     - Récupérer le prix pour calculer le total

4. **STEP 3: Verify Stock Decreased**
   - Cliquer sur cette requête (même que STEP 1)
   - Cliquer "Send"
   - 📊 **Comparer le nouveau stock**
   - Si le stock initial était 50, il devrait maintenant être **45** (50 - 5)
   - **Preuve:** Le stock a été mis à jour automatiquement via OpenFeign!

**🎯 Conclusion:** Order Service communique avec Product Service via OpenFeign pour mettre à jour les données en temps réel!

---

## 📝 ÉTAPE 6: ORGANISER VOTRE WORKSPACE

### Créer un Environment (optionnel mais pratique)

1. **Cliquer sur le bouton "Environments"** (icône d'engrenage en haut à droite)

2. **Cliquer sur "+" pour créer un nouvel environment**

3. **Nommer l'environment:** "Catalogue Microservices Local"

4. **Ajouter des variables:**
   | Variable | Initial Value | Current Value |
   |----------|---------------|---------------|
   | gateway_url | http://localhost:8080 | http://localhost:8080 |
   | eureka_url | http://localhost:8761 | http://localhost:8761 |
   | config_url | http://localhost:8888 | http://localhost:8888 |

5. **Sauvegarder**

6. **Activer l'environment:**
   - En haut à droite, sélectionner "Catalogue Microservices Local" dans le dropdown

**Avantage:** Vous pouvez changer facilement les URLs si les ports changent

---

## 🎨 COMPRENDRE L'INTERFACE POSTMAN

### Zone de gauche (Sidebar):
```
📚 Collections
   └── 📁 Catalogue Microservices - Complete API Tests
       └── [Vos 6 dossiers]

🌍 Environments
   └── Catalogue Microservices Local

📜 History
   └── [Historique de vos requêtes]
```

### Zone centrale (Request Builder):
```
┌─────────────────────────────────────────────────────┐
│ [GET ▼] [http://localhost:8080/api/categories] [Send]│
├─────────────────────────────────────────────────────┤
│ Params | Authorization | Headers | Body | ...      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  (Contenu selon l'onglet sélectionné)              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Zone inférieure (Response):
```
┌─────────────────────────────────────────────────────┐
│ Body | Cookies | Headers | Test Results | ...      │
├─────────────────────────────────────────────────────┤
│ [Pretty ▼] [JSON ▼]                    Status: 200 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  {                                                  │
│    "id": 1,                                         │
│    "nom": "Electronics",                            │
│    ...                                              │
│  }                                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 ASTUCES POSTMAN

### 1. Voir les détails d'une requête
- Cliquer sur une requête dans la collection
- Observer les onglets:
  - **Params:** Paramètres d'URL (?key=value)
  - **Authorization:** Si authentification nécessaire (pas dans ce projet)
  - **Headers:** En-têtes HTTP (Content-Type, etc.)
  - **Body:** Corps de la requête (pour POST, PUT, PATCH)

### 2. Modifier une requête pour tester
- Cliquer sur "Save As" pour créer une copie
- Modifier l'URL, le body, etc.
- Tester sans modifier l'original

### 3. Voir l'historique
- Onglet "History" dans la sidebar gauche
- Toutes vos requêtes exécutées sont sauvegardées
- Cliquer sur une pour la réexécuter

### 4. Exporter les résultats
- Après avoir exécuté une requête
- Cliquer sur "Save Response" en bas à droite
- Choisir "Save as example" pour documenter

### 5. Exécuter plusieurs requêtes automatiquement
- Cliquer droit sur un dossier → "Run folder"
- Postman exécute toutes les requêtes du dossier en séquence
- Utile pour tester rapidement tout le CRUD

---

## 🎯 SCÉNARIOS DE TEST PRATIQUES

### Scénario 1: Tester tout le CRUD Category
1. GET All Categories → Voir les catégories existantes
2. POST Create Category → Créer "Test Category"
3. GET All Categories → Vérifier que "Test Category" existe
4. GET by ID → Récupérer "Test Category" par son ID
5. PUT Update → Modifier "Test Category" en "Updated Category"
6. GET by ID → Vérifier la modification
7. DELETE → Supprimer "Updated Category"
8. GET All Categories → Vérifier la suppression

### Scénario 2: Tester OpenFeign Product → Category
1. GET Categories → Choisir un ID valide (ex: 1)
2. POST Create Product avec categoryId=1 → ✅ Succès
3. POST Create Product avec categoryId=999 → ❌ Erreur
4. Analyser les messages d'erreur

### Scénario 3: Tester OpenFeign Order → Product avec mise à jour stock
1. GET Product ID=1 → Noter stock initial
2. POST Create Order (3 unités du produit 1)
3. GET Product ID=1 → Vérifier stock diminué
4. POST Create Order (2 unités du produit 1)
5. GET Product ID=1 → Vérifier stock encore diminué

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### Problème: "Could not get any response"
**Cause:** Les services ne sont pas démarrés
**Solution:**
1. Vérifier que `start-all-services.bat` a été exécuté
2. Attendre 2-3 minutes
3. Vérifier Eureka: http://localhost:8761

### Problème: Status 404 Not Found
**Cause:** L'URL ou la route est incorrecte
**Solution:**
1. Vérifier l'URL commence par http://localhost:8080 (via Gateway)
2. Vérifier le chemin: /api/categories, /api/products, /api/orders

### Problème: Status 500 Internal Server Error
**Cause:** Erreur dans le service (validation, données invalides)
**Solution:**
1. Lire le message d'erreur dans la Response
2. Vérifier le body de la requête (JSON valide?)
3. Vérifier les IDs existent (categoryId, productId)

### Problème: Status 400 Bad Request
**Cause:** Données invalides envoyées
**Solution:**
1. Vérifier le JSON est bien formaté
2. Vérifier les champs obligatoires sont présents
3. Vérifier les types (String, Number, Boolean)

---

## 📊 POUR VOTRE PRÉSENTATION

### Ordre recommandé des démos:

1. **Montrer l'infrastructure** (30 secondes)
   - Dossier "1. Infrastructure Services"
   - Exécuter les 3 health checks rapidement

2. **CRUD rapide** (1 minute)
   - GET All Categories → Montrer les 8 catégories
   - POST Create Category → Créer une nouvelle
   - GET All Categories → Montrer qu'elle existe

3. **⭐ DEMO OpenFeign #1** (2 minutes)
   - Dossier "5. DEMO OpenFeign - Product → Category"
   - Exécuter les 3 STEPS
   - Expliquer la validation via OpenFeign

4. **⭐ DEMO OpenFeign #2** (3 minutes)
   - Dossier "6. DEMO OpenFeign - Order → Product"
   - Exécuter les 3 STEPS
   - **Montrer le stock qui diminue!**

5. **Montrer la diversité** (1 minute)
   - GET Products by Category
   - GET Orders by User
   - PATCH Update Stock

---

## ✅ CHECKLIST FINALE

Avant votre présentation, vérifiez:

- [ ] Postman est installé
- [ ] Collection importée et visible
- [ ] Services démarrés (start-all-services.bat)
- [ ] Eureka Dashboard montre 4 services UP
- [ ] Test rapide: GET All Categories fonctionne
- [ ] Dossiers "5. DEMO OpenFeign" et "6. DEMO OpenFeign" repérés
- [ ] Vous avez testé au moins une fois chaque démo OpenFeign

**Si tous les checkboxes sont cochés → VOUS ÊTES PRÊT! 🎉**

---

## 📚 RESSOURCES SUPPLÉMENTAIRES

### Documentation Postman officielle:
- https://learning.postman.com/docs/getting-started/introduction/

### Raccourcis clavier utiles:
- `Ctrl + Enter` : Envoyer la requête
- `Ctrl + O` : Import
- `Ctrl + N` : Nouvelle requête
- `Ctrl + E` : Nouveau environment
- `Ctrl + K` : Rechercher

### Pour aller plus loin:
- Tests automatisés dans Postman (onglet Tests)
- Variables d'environment pour différents serveurs (dev, prod)
- Newman CLI pour exécuter les tests en ligne de commande

---

## 🎓 RÉSUMÉ EN 3 ÉTAPES

1. **Import** → Importer `Catalogue-Microservices-Postman-Collection.json`
2. **Start** → Exécuter `start-all-services.bat` et attendre 2-3 min
3. **Test** → Cliquer sur une requête et "Send"

**C'est tout! Vous pouvez maintenant tester toutes vos APIs! 🚀**

---

## 💡 CONSEIL FINAL

**Pour votre présentation:**
- Testez vos démos au moins 2-3 fois avant
- Gardez Postman ouvert pendant la présentation
- Ayez les dossiers "DEMO OpenFeign" déjà dépliés
- Si possible, utilisez un deuxième écran pour les logs

**Bonne chance! 🍀**

