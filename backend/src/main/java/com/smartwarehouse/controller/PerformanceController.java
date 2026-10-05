package com.smartwarehouse.controller;

import com.smartwarehouse.dto.PerformanceRequest;
import com.smartwarehouse.model.BenchmarkResult;
import com.smartwarehouse.service.PerformanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> benchmarkSearch(@RequestBody(required = false) PerformanceRequest request) {
        int size = (request != null && request.getDatasetSize() != null) ? request.getDatasetSize() : 10000;
        return ResponseEntity.ok(performanceService.benchmarkSearch(size));
    }

    @PostMapping("/sort")
    public ResponseEntity<Map<String, Object>> benchmarkSort(@RequestBody(required = false) PerformanceRequest request) {
        int size = (request != null && request.getDatasetSize() != null) ? request.getDatasetSize() : 10000;
        return ResponseEntity.ok(performanceService.benchmarkSort(size));
    }

    @PostMapping("/queue")
    public ResponseEntity<Map<String, Object>> benchmarkQueue(@RequestBody(required = false) PerformanceRequest request) {
        int size = (request != null && request.getDatasetSize() != null) ? request.getDatasetSize() : 10000;
        return ResponseEntity.ok(performanceService.benchmarkQueue(size));
    }

    @PostMapping("/run-all")
    public ResponseEntity<Map<String, Object>> runAllBenchmarks(@RequestBody(required = false) PerformanceRequest request) {
        int size = (request != null && request.getDatasetSize() != null) ? request.getDatasetSize() : 10000;
        Map<String, Object> all = new HashMap<>();
        all.put("searchBenchmark", performanceService.benchmarkSearch(size));
        all.put("sortBenchmark", performanceService.benchmarkSort(size));
        all.put("queueBenchmark", performanceService.benchmarkQueue(size));
        return ResponseEntity.ok(all);
    }

    @GetMapping("/history")
    public ResponseEntity<List<BenchmarkResult>> getBenchmarkHistory() {
        return ResponseEntity.ok(performanceService.getBenchmarkHistory());
    }
}
