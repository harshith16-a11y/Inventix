package com.smartwarehouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartWarehouseApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartWarehouseApplication.class, args);
        System.out.println("============================================================");
        System.out.println(" SMART WAREHOUSE INVENTORY OPTIMIZER BACKEND STARTED       ");
        System.out.println(" Port: 8080 | Database: H2 in-memory                       ");
        System.out.println(" H2 Console: http://localhost:8080/h2-console               ");
        System.out.println(" Demo User : user@example.com  / user123                   ");
        System.out.println(" Demo Admin: admin@example.com / admin123                  ");
        System.out.println("============================================================");
    }
}
