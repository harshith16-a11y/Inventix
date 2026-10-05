package com.smartwarehouse.dto;

public class PerformanceRequest {
    private Integer datasetSize; // 100, 1000, 10000, 50000, 100000

    public PerformanceRequest() {}
    public PerformanceRequest(Integer datasetSize) {
        this.datasetSize = datasetSize;
    }

    public Integer getDatasetSize() { return datasetSize; }
    public void setDatasetSize(Integer datasetSize) { this.datasetSize = datasetSize; }
}
