package com.smartwarehouse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "benchmark_results")
public class BenchmarkResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String testType; // SEARCH, SORT, QUEUE

    @Column(nullable = false)
    private String algorithm; // LINEAR_SEARCH, HASHMAP_SEARCH, MERGE_SORT, FIFO_QUEUE, PRIORITY_QUEUE

    @Column(nullable = false)
    private Integer datasetSize; // 100, 1000, 10000, 50000, 100000

    @Column(nullable = false)
    private Long executionTimeNanos;

    @Column(nullable = false)
    private Double executionTimeMs;

    private LocalDateTime createdAt;

    public BenchmarkResult() {
        this.createdAt = LocalDateTime.now();
    }

    public BenchmarkResult(String testType, String algorithm, Integer datasetSize, Long executionTimeNanos, Double executionTimeMs) {
        this.testType = testType;
        this.algorithm = algorithm;
        this.datasetSize = datasetSize;
        this.executionTimeNanos = executionTimeNanos;
        this.executionTimeMs = executionTimeMs;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public Integer getDatasetSize() { return datasetSize; }
    public void setDatasetSize(Integer datasetSize) { this.datasetSize = datasetSize; }

    public Long getExecutionTimeNanos() { return executionTimeNanos; }
    public void setExecutionTimeNanos(Long executionTimeNanos) { this.executionTimeNanos = executionTimeNanos; }

    public Double getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Double executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
