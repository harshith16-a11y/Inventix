# SMART WAREHOUSE INVENTORY OPTIMIZER
> **College Data Structures & Algorithms (DSA) Project — Review 3 Presentation Standard**  
> *A Production-Ready, Real-Time Warehouse Management & Shipment Optimization Platform powered by Java DSA Algorithms and modern React UI.*

---

## 📌 Project Overview
**Smart Warehouse Inventory Optimizer** is a complete, user-facing logistics and inventory management application. Unlike standard academic CRUD applications or simple UI mockups, this platform links its core business logic directly to real Java Data Structures and Algorithms operating in a Spring Boot 3 backend:

- **HashMap**: Provides $O(1)$ constant-time lookup, stock adjustments, and inventory validation keyed by Product ID (`P101`, `P214`, `P309`, etc.).
- **Merge Sort**: A pure manual divide-and-conquer implementation sorting catalog items by Product ID, Name, Price, and Stock Quantity in guaranteed $O(n \log n)$ time.
- **Queue (FIFO)**: Implemented using `ArrayDeque<Shipment>` for standard first-in-first-out warehouse order dispatch.
- **Priority Queue**: Implemented using a binary min-heap `PriorityQueue<Shipment>` with a custom comparator ordering urgent dispatches by Urgency Level (HIGH $\to$ MEDIUM $\to$ LOW) and creation timestamp.
- **Low-Stock Monitoring Engine**: An automated threshold rule (`IF quantity < lowStockThreshold THEN trigger low stock alert`) executed atomically after every inventory change or order dispatch.
- **Performance Benchmarking Suite**: High-precision runtime measurements using `System.nanoTime()` benchmarked across datasets from 100 up to 100,000 synthetic records.

---

## 🏗️ Architectural Topology

```
+------------------------------------------------------------------------------------+
|                                  USER / ADMIN UI                                   |
|   React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts (Responsive, Dark/Light)|
+------------------------------------------------------------------------------------+
                                         | REST APIs (Axios + JWT Bearer)
                                         v
+------------------------------------------------------------------------------------+
|                               SPRING BOOT 3 BACKEND                                |
|  - SecurityConfig (BCrypt Password Hashing, JWT Stateless Authentication Filter)    |
|  - AuthController, ProductController, ShipmentController, AdminController...       |
+------------------------------------------------------------------------------------+
                                         |
                                         v
+------------------------------------------------------------------------------------+
|                               CORE DSA SERVICE LAYER                               |
|  - WarehouseHashMap: O(1) in-memory HashMap<String, Product> indexed by ProductID   |
|  - MergeSort: Manual recursive divide-and-conquer inventory sorting (O(n log n))   |
|  - NormalShipmentQueue: FIFO ArrayDeque<Shipment> (O(1) enqueue/dequeue)           |
|  - PriorityShipmentQueue: Binary Min-Heap PriorityQueue<Shipment> by urgency order |
|  - LowStockMonitor: Immediate threshold evaluation & notification dispatch         |
|  - PerformanceTimer: Benchmarking algorithms using System.nanoTime() on N elements |
+------------------------------------------------------------------------------------+
                                         |
                                         v
+------------------------------------------------------------------------------------+
|                            PERSISTENCE LAYER (JPA / H2)                            |
|  - User, Product, Shipment, ShipmentItem, Notification, ActivityLog, Benchmark     |
+------------------------------------------------------------------------------------+
```

---

## 🔑 Demo Accounts & Preloaded Data

### User Accounts
| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Normal User** | `user@example.com` | `user123` | Product catalog, multi-step shipment cart, shipment tracking, notifications, profile |
| **Admin** | `admin@example.com` | `admin123` | Executive dashboard, inventory CRUD, FIFO queue processing, Priority queue dispatch, low-stock center, performance testing, activity audit |

> *One-click helper pills are available on `/login` to auto-fill these credentials.*

### Presentation Sample Products
| Product ID | Product Name | Category | Unit Price | Initial Stock | Threshold | Initial Status |
|---|---|---|---|---|---|---|
| `P101` | Rice 5kg | Grains & Staples | $14.99 | 45 | 15 | **IN STOCK** |
| `P214` | Oil 1L | Cooking Essentials | $8.50 | 15 | 10 | **IN STOCK** (drops to 7 on dispatch $\to$ Low Stock) |
| `P309` | Soap Pack | Personal Care | $6.25 | 28 | 8 | **IN STOCK** |
| `P417` | Tea 500g | Beverages | $11.00 | 18 | 12 | **IN STOCK** |
| `P522` | Sugar 2kg | Grains & Staples | $5.75 | 9 | 10 | **LOW STOCK** (9 < 10) |
| `P603` | Wheat Flour 5kg | Grains & Staples | $12.50 | 40 | 15 | **IN STOCK** |
| `P781` | Coffee Beans 1kg | Beverages | $21.00 | 5 | 8 | **LOW STOCK** (5 < 8) |
| `P890` | Mineral Water 24pk | Beverages | $15.00 | 0 | 10 | **OUT OF STOCK** (0 units) |

---

## ⚡ Core DSA Implementation Details

### 1. Hash Table (`WarehouseHashMap.java`)
- **Key**: Unique `productId` (e.g., `P101`, `P214`).
- **Value**: In-memory `Product` object reference.
- **Complexity**: $O(1)$ average time for search, insertion, and stock updates.
- **Thread Safety**: Backed by `ConcurrentHashMap` with synchronized stock operations.
- Avoids costly linear scans across products when an ID is queried.

### 2. Manual Merge Sort (`MergeSort.java`)
- Pure divide-and-conquer implementation:
  1. **Divide**: Sub-divides array list at midpoint `mid = size / 2`.
  2. **Conquer**: Recursively sorts left and right sub-arrays.
  3. **Combine**: Merges sorted partitions into a unified buffer.
- Does **not** call `Collections.sort()` or `Arrays.sort()`.
- Sorts by `productId`, `name`, `price`, and `quantity` in ascending or descending direction.
- **Complexity**: $O(n \log n)$ time in worst, average, and best cases; $O(n)$ auxiliary space.

### 3. FIFO Queue (`NormalShipmentQueue.java`)
- Standard shipments are appended to the rear of an `ArrayDeque<Shipment>` and removed from the head.
- **Enqueue**: $O(1)$ amortized.
- **Dequeue**: $O(1)$.
- Real-time queue position lookup: `getPosition(shipmentId)` returns user's 1-based order in line.

### 4. Binary Heap Priority Queue (`PriorityShipmentQueue.java`)
- Urgency-based shipments are stored in a `PriorityQueue<Shipment>` ordered by:
  ```java
  Comparator.comparingInt(Shipment::getPriorityOrder) // 1=HIGH, 2=MEDIUM, 3=LOW
            .thenComparing(Shipment::getCreatedAt);  // Tie-breaker: earlier timestamp
  ```
- **Enqueue**: $O(\log n)$.
- **Dequeue (Poll)**: $O(\log n)$.
- **Peek**: $O(1)$.

### 5. Low-Stock Decision Engine
- Evaluated immediately after product creation, update, shipment fulfillment, or replenishment:
  ```
  IF quantity == 0:
      status = OUT_OF_STOCK
      trigger critical alert
  ELSE IF quantity < lowStockThreshold:
      status = LOW_STOCK
      trigger warning notification
  ELSE:
      status = IN_STOCK
  ```

### 6. High-Precision Performance Benchmarking
- Accessible via `/admin/performance`.
- Uses `System.nanoTime()` to measure nanosecond and millisecond execution timings across dataset sizes $N \in \{100, 1000, 10000, 50000, 100000\}$:
  - **Search**: Linear Scan $O(n)$ vs. HashMap $O(1)$.
  - **Sorting**: Merge Sort $O(n \log n)$.
  - **Queueing**: FIFO ArrayDeque vs. Binary Heap PriorityQueue.
- Results are stored in the database table `benchmark_results` and visualized with interactive Recharts graphs.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Java 17 or higher** (e.g. OpenJDK 17, 21, or 25)
- **Apache Maven 3.9+**
- **Node.js 18+ and npm 10+**

### 1. Running the Backend
From the root directory:
```powershell
cd backend
mvn spring-boot:run
```
- Server starts on: `http://localhost:8080`
- H2 Web Console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:warehousedb`
  - User: `sa` | Password: `password`

### 2. Running the Frontend
In a separate terminal window:
```powershell
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`
- Pre-configured Vite reverse proxy seamlessly routes all `/api/*` calls to `http://localhost:8080/api`.

---

## 🧪 Acceptance Test Walkthrough (Review 3 Live Demo)

### Test Scenario A: Normal FIFO Shipment
1. Log in with **Normal User** (`user@example.com` / `user123`).
2. Search for `P214` in the top search bar. Instant $O(1)$ HashMap search resolves **Oil 1L** (Stock: 15, Threshold: 10).
3. Open details, select **8 units**, click **Add to Shipment**.
4. In **Create Shipment**, select **Normal Shipment (FIFO Queue)**, review, and click **Confirm Shipment**.
5. System creates shipment `SH1001` and places it in the FIFO queue. Note your queue position.
6. Log in as **Admin** (`admin@example.com` / `admin123`) and open **Normal Queue** (`/admin/queue/normal`).
7. Click **Process Next Shipment**.
8. Observe:
   - `SH1001` transitions from `WAITING` $\to$ `PROCESSING` $\to$ `COMPLETED`.
   - Inventory of `P214` decreases from 15 to 7.
   - Low-stock condition triggered: because $7 < 10$, product becomes **LOW STOCK**.
   - User and Admin receive instant notification: *"Low Stock Alert: Oil 1L (P214) has only 7 units remaining."*

### Test Scenario B: Priority Heap Shipment
1. As a User, select **Rice 5kg** (`P101`), choose **Priority Shipment**, set priority to **HIGH** 🔴, and confirm.
2. System places order into the `PriorityShipmentQueue` binary heap.
3. As Admin, open **Priority Queue** (`/admin/queue/priority`).
4. Notice the HIGH priority shipment is highlighted at the root of the heap.
5. Click **Process Highest Priority Shipment**.
6. The shipment is fulfilled before any medium or low orders.

### Test Scenario C: Automated One-Click Demo Sequence
1. As Admin, open `/admin`.
2. Click **Run Review 3 Demo Sequence**.
3. The system executes a live sequence through the backend: performs HashMap lookup on `P214`, creates a normal shipment, creates a priority shipment, dispatches the priority order first, dispatches the normal order, deducts stock, and verifies low stock alerts.

---

## 📂 Project Structure

```
Smart-Warehouse-Inventory-Optimizer/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/smartwarehouse/
│       │   │   ├── SmartWarehouseApplication.java
│       │   │   ├── config/
│       │   │   │   └── DataInitializer.java
│       │   │   ├── controller/
│       │   │   │   ├── AdminController.java
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── InventoryController.java
│       │   │   │   ├── NotificationController.java
│       │   │   │   ├── PerformanceController.java
│       │   │   │   ├── ProductController.java
│       │   │   │   └── ShipmentController.java
│       │   │   ├── dsa/
│       │   │   │   ├── MergeSort.java
│       │   │   │   ├── NormalShipmentQueue.java
│       │   │   │   ├── PriorityShipmentQueue.java
│       │   │   │   └── WarehouseHashMap.java
│       │   │   ├── dto/
│       │   │   │   ├── AuthRequest.java
│       │   │   │   ├── AuthResponse.java
│       │   │   │   ├── PasswordChangeRequest.java
│       │   │   │   ├── PerformanceRequest.java
│       │   │   │   ├── RegisterRequest.java
│       │   │   │   ├── RestockRequest.java
│       │   │   │   └── ShipmentCreateRequest.java
│       │   │   ├── model/
│       │   │   │   ├── ActivityLog.java
│       │   │   │   ├── BenchmarkResult.java
│       │   │   │   ├── Notification.java
│       │   │   │   ├── Product.java
│       │   │   │   ├── Shipment.java
│       │   │   │   ├── ShipmentItem.java
│       │   │   │   └── User.java
│       │   │   ├── repository/
│       │   │   │   ├── ActivityLogRepository.java
│       │   │   │   ├── BenchmarkResultRepository.java
│       │   │   │   ├── NotificationRepository.java
│       │   │   │   ├── ProductRepository.java
│       │   │   │   ├── ShipmentItemRepository.java
│       │   │   │   ├── ShipmentRepository.java
│       │   │   │   └── UserRepository.java
│       │   │   ├── security/
│       │   │   │   ├── JwtAuthFilter.java
│       │   │   │   ├── JwtService.java
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   └── UserDetailsServiceImpl.java
│       │   │   ├── service/
│       │   │   │   ├── AuthService.java
│       │   │   │   ├── InventoryService.java
│       │   │   │   ├── NotificationService.java
│       │   │   │   ├── PerformanceService.java
│       │   │   │   ├── ProductService.java
│       │   │   │   └── ShipmentService.java
│       │   │   └── util/
│       │   │       └── PerformanceTimer.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/
└── frontend/
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── components/
        │   ├── EmptyState.jsx
        │   ├── LoadingSpinner.jsx
        │   ├── Navbar.jsx
        │   ├── ProductCard.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── ShipmentTimeline.jsx
        │   ├── StatCard.jsx
        │   └── StockBadge.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CartContext.jsx
        ├── pages/
        │   ├── CreateShipment.jsx
        │   ├── Home.jsx
        │   ├── HowItWorks.jsx
        │   ├── Login.jsx
        │   ├── LowStock.jsx
        │   ├── MyShipments.jsx
        │   ├── Notifications.jsx
        │   ├── ProductDetails.jsx
        │   ├── Products.jsx
        │   ├── Profile.jsx
        │   ├── Register.jsx
        │   ├── ShipmentDetails.jsx
        │   └── admin/
        │       ├── AdminActivity.jsx
        │       ├── AdminDashboard.jsx
        │       ├── AdminDSAVisualizer.jsx
        │       ├── AdminInventory.jsx
        │       ├── AdminNormalQueue.jsx
        │       ├── AdminPerformance.jsx
        │       ├── AdminPriorityQueue.jsx
        │       ├── AdminShipments.jsx
        │       └── AdminUsers.jsx
        └── services/
            ├── adminService.js
            ├── api.js
            ├── authService.js
            ├── inventoryService.js
            ├── notificationService.js
            ├── productService.js
            └── shipmentService.js
```

---

## 🔒 Security Architecture
- **Stateless JWT Tokens**: Expire in 24 hours, validated by `JwtAuthFilter`.
- **BCrypt Password Hashing**: Passwords are never stored in plaintext.
- **Role-Based Access Control (RBAC)**: All administrative endpoints (`/api/admin/**`, `/api/performance/**`, `/api/shipments/process/**`, restock & catalog mutations) are guarded by Spring Security `hasAuthority("ROLE_ADMIN")` and protected on the frontend via `<ProtectedRoute requireAdmin>`.
