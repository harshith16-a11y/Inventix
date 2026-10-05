package com.smartwarehouse.repository;

import com.smartwarehouse.model.BenchmarkResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BenchmarkResultRepository extends JpaRepository<BenchmarkResult, Long> {
    List<BenchmarkResult> findTop30ByOrderByCreatedAtDesc();
    List<BenchmarkResult> findByTestTypeOrderByCreatedAtDesc(String testType);
}
