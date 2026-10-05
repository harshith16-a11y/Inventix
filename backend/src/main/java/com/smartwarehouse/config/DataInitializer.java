package com.smartwarehouse.config;

import com.smartwarehouse.dsa.NormalShipmentQueue;
import com.smartwarehouse.dsa.PriorityShipmentQueue;
import com.smartwarehouse.dsa.WarehouseHashMap;
import com.smartwarehouse.model.*;
import com.smartwarehouse.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ShipmentRepository shipmentRepository;
    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final WarehouseHashMap warehouseHashMap;
    private final NormalShipmentQueue normalShipmentQueue;
    private final PriorityShipmentQueue priorityShipmentQueue;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ProductRepository productRepository,
                           ShipmentRepository shipmentRepository,
                           NotificationRepository notificationRepository,
                           ActivityLogRepository activityLogRepository,
                           WarehouseHashMap warehouseHashMap,
                           NormalShipmentQueue normalShipmentQueue,
                           PriorityShipmentQueue priorityShipmentQueue,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.shipmentRepository = shipmentRepository;
        this.notificationRepository = notificationRepository;
        this.activityLogRepository = activityLogRepository;
        this.warehouseHashMap = warehouseHashMap;
        this.normalShipmentQueue = normalShipmentQueue;
        this.priorityShipmentQueue = priorityShipmentQueue;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        System.out.println(">>> Initializing Smart Warehouse Demo Dataset...");

        // 1. Create Demo Users
        User adminUser = new User(
                "Sarah Admin",
                "admin@example.com",
                passwordEncoder.encode("admin123"),
                "ROLE_ADMIN",
                "+1 555-0199",
                "Warehouse Operations",
                "Central Distribution Hub Alpha"
        );
        userRepository.save(adminUser);

        User normalUser = new User(
                "Alex User",
                "user@example.com",
                passwordEncoder.encode("user123"),
                "ROLE_USER",
                "+1 555-0123",
                "Retail Logistics & Supply",
                "Central Distribution Hub Alpha"
        );
        userRepository.save(normalUser);

        // 2. Create Presentation Demo Products
        List<Product> demoProducts = List.of(
                new Product("P101", "Rice 5kg", "Grains & Staples", "Premium polished long-grain aromatic rice 5kg sack", 14.99, 45, 15),
                new Product("P214", "Oil 1L", "Cooking Essentials", "Double refined sunflower cooking oil 1L bottle", 8.50, 15, 10),
                new Product("P309", "Soap Pack", "Personal Care", "Moisturizing hygienic antibacterial bath soap 4-pack", 6.25, 28, 8),
                new Product("P417", "Tea 500g", "Beverages", "Handcrafted premium loose black tea blend 500g carton", 11.00, 18, 12),
                new Product("P522", "Sugar 2kg", "Grains & Staples", "Fine crystalline cane sugar 2kg air-sealed bag", 5.75, 9, 10), // LOW_STOCK
                new Product("P603", "Wheat Flour 5kg", "Grains & Staples", "Stone ground unbleached whole wheat flour 5kg", 12.50, 40, 15),
                new Product("P781", "Coffee Beans 1kg", "Beverages", "Single-origin medium roast Arabica coffee beans 1kg", 21.00, 5, 8), // LOW_STOCK
                new Product("P890", "Mineral Water 24pk", "Beverages", "Electrolyte enriched natural mineral water 24x500ml", 15.00, 0, 10) // OUT_OF_STOCK
        );

        for (Product p : demoProducts) {
            Product saved = productRepository.save(p);
            // Load into O(1) WarehouseHashMap
            warehouseHashMap.put(saved);
        }

        // 3. Create Sample Shipments
        // Normal Shipments
        Shipment sh001 = new Shipment("SH001", normalUser.getId(), normalUser.getName(), "NORMAL", "NONE", 29.98);
        sh001.addItem(new ShipmentItem("P101", "Rice 5kg", 2, 14.99));
        sh001.setStatus("WAITING");
        shipmentRepository.save(sh001);
        normalShipmentQueue.enqueue(sh001);

        Shipment sh002 = new Shipment("SH002", normalUser.getId(), normalUser.getName(), "NORMAL", "NONE", 6.25);
        sh002.addItem(new ShipmentItem("P309", "Soap Pack", 1, 6.25));
        sh002.setStatus("WAITING");
        shipmentRepository.save(sh002);
        normalShipmentQueue.enqueue(sh002);

        Shipment sh003 = new Shipment("SH003", normalUser.getId(), normalUser.getName(), "NORMAL", "NONE", 11.00);
        sh003.addItem(new ShipmentItem("P417", "Tea 500g", 1, 11.00));
        sh003.setStatus("COMPLETED");
        shipmentRepository.save(sh003);

        // Priority Shipments
        Shipment sh004 = new Shipment("SH004", normalUser.getId(), normalUser.getName(), "PRIORITY", "HIGH", 8.50);
        sh004.addItem(new ShipmentItem("P214", "Oil 1L", 1, 8.50));
        sh004.setStatus("WAITING");
        shipmentRepository.save(sh004);
        priorityShipmentQueue.enqueue(sh004);

        Shipment sh005 = new Shipment("SH005", normalUser.getId(), normalUser.getName(), "PRIORITY", "MEDIUM", 14.99);
        sh005.addItem(new ShipmentItem("P101", "Rice 5kg", 1, 14.99));
        sh005.setStatus("WAITING");
        shipmentRepository.save(sh005);
        priorityShipmentQueue.enqueue(sh005);

        Shipment sh006 = new Shipment("SH006", normalUser.getId(), normalUser.getName(), "PRIORITY", "LOW", 5.75);
        sh006.addItem(new ShipmentItem("P522", "Sugar 2kg", 1, 5.75));
        sh006.setStatus("WAITING");
        shipmentRepository.save(sh006);
        priorityShipmentQueue.enqueue(sh006);

        // 4. Initial System Notifications
        notificationRepository.save(new Notification(null, "SYSTEM", "Smart Warehouse Inventory Optimizer initialized with 8 catalog products."));
        notificationRepository.save(new Notification(null, "LOW_STOCK", "Low Stock Alert: Sugar 2kg (P522) has only 9 units remaining (Threshold: 10)."));
        notificationRepository.save(new Notification(null, "LOW_STOCK", "Low Stock Alert: Coffee Beans 1kg (P781) has only 5 units remaining (Threshold: 8)."));
        notificationRepository.save(new Notification(null, "LOW_STOCK", "Out of Stock Alert: Mineral Water 24pk (P890) has 0 units in inventory."));
        notificationRepository.save(new Notification(normalUser.getId(), "SHIPMENT_QUEUED", "Shipment SH001 is queued at position #1 in Normal FIFO Queue."));

        // 5. Initial Audit Activity Logs
        activityLogRepository.save(new ActivityLog(adminUser.getId(), adminUser.getName(), "SYSTEM_INIT", "Database initialized with college presentation demo items."));
        activityLogRepository.save(new ActivityLog(normalUser.getId(), normalUser.getName(), "SHIPMENT_CREATED", "Shipment SH001 placed into Normal Queue."));
        activityLogRepository.save(new ActivityLog(normalUser.getId(), normalUser.getName(), "PRIORITY_SHIPMENT_CREATED", "Priority Shipment SH004 placed into Priority Queue with HIGH priority."));

        System.out.println(">>> Demo data initialization complete. HashMap size: " + warehouseHashMap.size()
                + ", Normal Queue size: " + normalShipmentQueue.size()
                + ", Priority Queue size: " + priorityShipmentQueue.size());
    }
}
