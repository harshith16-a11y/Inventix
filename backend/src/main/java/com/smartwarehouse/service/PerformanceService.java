package com.smartwarehouse.service;

import com.smartwarehouse.dsa.MergeSort;
import com.smartwarehouse.model.BenchmarkResult;
import com.smartwarehouse.model.Product;
import com.smartwarehouse.model.Shipment;
import com.smartwarehouse.repository.BenchmarkResultRepository;
import com.smartwarehouse.util.PerformanceTimer;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PerformanceService {

    private final BenchmarkResultRepository benchmarkResultRepository;
    private final MergeSort mergeSort;

    public PerformanceService(BenchmarkResultRepository benchmarkResultRepository, MergeSort mergeSort) {
        this.benchmarkResultRepository = benchmarkResultRepository;
        this.mergeSort = mergeSort;
    }

    /**
     * Benchmark Linear Search vs. HashMap Search
     */
    public Map<String, Object> benchmarkSearch(int datasetSize) {
        int size = sanitizeSize(datasetSize);

        // Generate N synthetic product objects
        List<Product> productList = new ArrayList<>(size);
        Map<String, Product> productMap = new HashMap<>(size);

        for (int i = 0; i < size; i++) {
            String pid = "BENCH-" + i;
            Product p = new Product(pid, "Item " + i, "BenchCat", "Description", 10.0 + (i % 100), 50, 10);
            productList.add(p);
            productMap.put(pid, p);
        }

        // Target key to search for (located near the end to demonstrate linear scan cost)
        String targetKey = "BENCH-" + (size - 1);

        // 1. Measure Linear Search (O(n))
        PerformanceTimer.Measurement<Product> linearMeasure = PerformanceTimer.measure(() -> {
            for (Product p : productList) {
                if (targetKey.equals(p.getProductId())) {
                    return p;
                }
            }
            return null;
        });

        // 2. Measure HashMap Search (O(1))
        PerformanceTimer.Measurement<Product> hashMapMeasure = PerformanceTimer.measure(() -> {
            return productMap.get(targetKey);
        });

        // Save records
        BenchmarkResult linearResult = benchmarkResultRepository.save(new BenchmarkResult(
                "SEARCH", "LINEAR_SEARCH", size, linearMeasure.getDurationNanos(), linearMeasure.getDurationMs()));

        BenchmarkResult hashMapResult = benchmarkResultRepository.save(new BenchmarkResult(
                "SEARCH", "HASHMAP_SEARCH", size, hashMapMeasure.getDurationNanos(), hashMapMeasure.getDurationMs()));

        Map<String, Object> response = new HashMap<>();
        response.put("datasetSize", size);
        response.put("targetKey", targetKey);
        response.put("linearSearch", Map.of(
                "algorithm", "Linear Search (List Scan)",
                "timeNanos", linearMeasure.getDurationNanos(),
                "timeMs", linearMeasure.getDurationMs(),
                "complexity", "O(n)"
        ));
        response.put("hashMapSearch", Map.of(
                "algorithm", "HashMap Lookup (Direct Hash)",
                "timeNanos", hashMapMeasure.getDurationNanos(),
                "timeMs", hashMapMeasure.getDurationMs(),
                "complexity", "Average O(1)"
        ));
        response.put("speedupFactor", linearMeasure.getDurationNanos() > 0 && hashMapMeasure.getDurationNanos() > 0
                ? String.format("%.2fx faster", (double) linearMeasure.getDurationNanos() / Math.max(1, hashMapMeasure.getDurationNanos()))
                : "N/A");
        response.put("timestamp", LocalDateTime.now());

        return response;
    }

    /**
     * Benchmark Merge Sort
     */
    public Map<String, Object> benchmarkSort(int datasetSize) {
        int size = sanitizeSize(datasetSize);

        // Generate N unsorted products with random prices
        Random random = new Random(42);
        List<Product> products = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            products.add(new Product("P" + i, "Product " + i, "Cat", "Desc",
                    random.nextDouble() * 1000.0, random.nextInt(500), 20));
        }

        PerformanceTimer.Measurement<List<Product>> sortMeasure = PerformanceTimer.measure(() -> {
            return mergeSort.sort(products, "price", true);
        });

        benchmarkResultRepository.save(new BenchmarkResult(
                "SORT", "MERGE_SORT", size, sortMeasure.getDurationNanos(), sortMeasure.getDurationMs()));

        Map<String, Object> response = new HashMap<>();
        response.put("datasetSize", size);
        response.put("algorithm", "Merge Sort (Manual Recursive Divide & Conquer)");
        response.put("timeNanos", sortMeasure.getDurationNanos());
        response.put("timeMs", sortMeasure.getDurationMs());
        response.put("complexity", "O(n log n)");
        response.put("timestamp", LocalDateTime.now());

        return response;
    }

    /**
     * Benchmark Queue vs Priority Queue operations
     */
    public Map<String, Object> benchmarkQueue(int datasetSize) {
        int size = sanitizeSize(datasetSize);
        Random random = new Random(42);
        String[] priorities = {"HIGH", "MEDIUM", "LOW"};

        // Generate sample shipments
        List<Shipment> testShipments = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            String prio = priorities[random.nextInt(priorities.length)];
            Shipment s = new Shipment("SH-BENCH-" + i, 1L, "User", "PRIORITY", prio, 100.0);
            testShipments.add(s);
        }

        // Benchmark FIFO ArrayDeque
        PerformanceTimer.Measurement<Void> fifoMeasure = PerformanceTimer.measureRunnable(() -> {
            Deque<Shipment> deque = new ArrayDeque<>(size);
            for (Shipment s : testShipments) {
                deque.addLast(s);
            }
            while (!deque.isEmpty()) {
                deque.pollFirst();
            }
        });

        // Benchmark PriorityQueue
        Comparator<Shipment> comparator = Comparator.comparingInt(Shipment::getPriorityOrder)
                .thenComparing(Shipment::getCreatedAt);

        PerformanceTimer.Measurement<Void> pqMeasure = PerformanceTimer.measureRunnable(() -> {
            PriorityQueue<Shipment> pq = new PriorityQueue<>(size, comparator);
            for (Shipment s : testShipments) {
                pq.offer(s);
            }
            while (!pq.isEmpty()) {
                pq.poll();
            }
        });

        benchmarkResultRepository.save(new BenchmarkResult(
                "QUEUE", "FIFO_QUEUE", size, fifoMeasure.getDurationNanos(), fifoMeasure.getDurationMs()));

        benchmarkResultRepository.save(new BenchmarkResult(
                "QUEUE", "PRIORITY_QUEUE", size, pqMeasure.getDurationNanos(), pqMeasure.getDurationMs()));

        Map<String, Object> response = new HashMap<>();
        response.put("datasetSize", size);
        response.put("fifoQueue", Map.of(
                "dataStructure", "ArrayDeque (FIFO)",
                "timeNanos", fifoMeasure.getDurationNanos(),
                "timeMs", fifoMeasure.getDurationMs(),
                "complexity", "O(1) Enqueue & Dequeue"
        ));
        response.put("priorityQueue", Map.of(
                "dataStructure", "Binary Heap PriorityQueue",
                "timeNanos", pqMeasure.getDurationNanos(),
                "timeMs", pqMeasure.getDurationMs(),
                "complexity", "O(log n) Enqueue & Dequeue"
        ));
        response.put("timestamp", LocalDateTime.now());

        return response;
    }

    public List<BenchmarkResult> getBenchmarkHistory() {
        return benchmarkResultRepository.findTop30ByOrderByCreatedAtDesc();
    }

    private int sanitizeSize(int size) {
        if (size <= 0) return 1000;
        if (size > 100000) return 100000;
        return size;
    }
}
