# 🔧 Fix IntelliJ IDEA - Package Structure Issue

## ❌ Problem

IntelliJ shows error:
```
Package name 'com.catalogue.gateway.config' does not correspond to the file path 'api-gateway.src.main.java.com.catalogue.gateway.config'
```

This happens because IntelliJ hasn't properly imported the Maven multi-module project structure.

---

## ✅ Solution: Reimport Maven Project

### Option 1: Reimport from Maven Tool Window (RECOMMENDED)

1. **Open Maven Tool Window:**
   - View → Tool Windows → Maven
   - Or click on the Maven icon in the right sidebar

2. **Reimport All Maven Projects:**
   - Click the **Reload All Maven Projects** button (circular arrows icon)
   - Or right-click on the root project → Maven → Reload Project

3. **Wait for indexing to complete:**
   - IntelliJ will reimport all modules
   - Watch the progress bar at the bottom

4. **Verify the fix:**
   - The error should disappear
   - `src/main/java` folders should be marked in blue (source roots)
   - `src/test/java` folders should be marked in green (test source roots)

---

### Option 2: Close and Reopen Project

1. **Close the project:**
   - File → Close Project

2. **Reopen the project:**
   - Open → Select `C:\Users\houss\catalogue-service`
   - Wait for Maven import to complete

---

### Option 3: Manual Module Import

1. **Delete IntelliJ files (if corrupted):**
   ```bash
   # Close IntelliJ first!
   cd C:\Users\houss\catalogue-service
   Remove-Item -Path ".idea" -Recurse -Force
   Remove-Item -Path "*.iml" -Force
   Remove-Item -Path "*/*.iml" -Force
   ```

2. **Reopen IntelliJ:**
   - File → Open → Select `catalogue-service` folder
   - IntelliJ will detect it's a Maven project
   - Click "Import Maven Projects automatically" when prompted

---

### Option 4: Mark Directories Manually (Last Resort)

If the above doesn't work, manually mark source folders:

1. **For api-gateway module:**
   - Right-click on `api-gateway/src/main/java` → Mark Directory as → Sources Root
   - Right-click on `api-gateway/src/main/resources` → Mark Directory as → Resources Root
   - Right-click on `api-gateway/src/test/java` → Mark Directory as → Test Sources Root

2. **Repeat for each module:**
   - config-server
   - eureka-server
   - category-service
   - product-service
   - order-service

---

## 🔍 Verification

After reimporting, verify that:

1. **No package errors:**
   - Open `GatewayConfig.java`
   - The package declaration should not be underlined in red

2. **Source roots are marked correctly:**
   - In Project view, `src/main/java` folders should be **blue**
   - In Project view, `src/test/java` folders should be **green**

3. **Maven modules are recognized:**
   - Open Maven tool window
   - You should see all 6 modules listed:
     - config-server
     - eureka-server
     - api-gateway
     - category-service
     - product-service
     - order-service

4. **Compilation works:**
   - Build → Build Project
   - Should complete without errors

---

## 🎯 Why This Happens

IntelliJ IDEA needs to:
1. Recognize the parent POM structure
2. Import each module as a separate Maven module
3. Mark the correct source roots for each module

When a new module is added (like `api-gateway`), IntelliJ needs to be told about it via Maven reimport.

---

## 📝 Alternative: Use Maven to Generate IntelliJ Files

If you prefer, you can use Maven to generate IntelliJ IDEA files:

```bash
cd C:\Users\houss\catalogue-service
mvn idea:idea
```

Then reopen the project in IntelliJ.

---

## ✅ Confirmation

After following these steps:
- ✅ The error should be gone
- ✅ Auto-completion should work properly
- ✅ Imports should resolve correctly
- ✅ The project should compile without errors

**The Maven build already succeeded, so this is purely an IntelliJ IDE issue, not a code issue!**

