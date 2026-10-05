package com.smartwarehouse.dsa;

import com.smartwarehouse.model.Shipment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

/**
 * PriorityShipmentQueue
 * DSA Implementation: Binary Heap / Priority Queue for urgent shipments.
 * Ordering:
 *   1. Priority Level (HIGH = 1, MEDIUM = 2, LOW = 3)
 *   2. Tie-breaker: Earlier createdAt timestamp processed first.
 * Time Complexity: O(log n) for enqueue and dequeue; O(1) for peek.
 * Space Complexity: O(k) where k is the number of queued priority shipments.
 */
@Component
public class PriorityShipmentQueue {

    private final Comparator<Shipment> comparator = (s1, s2) -> {
        if (s1 == null && s2 == null) return 0;
        if (s1 == null) return 1;
        if (s2 == null) return -1;

        int p1 = s1.getPriorityOrder() != null ? s1.getPriorityOrder() : 3;
        int p2 = s2.getPriorityOrder() != null ? s2.getPriorityOrder() : 3;

        if (p1 != p2) {
            return Integer.compare(p1, p2);
        }

        // Tie-breaker: earlier creation time
        if (s1.getCreatedAt() != null && s2.getCreatedAt() != null) {
            return s1.getCreatedAt().compareTo(s2.getCreatedAt());
        }
        return 0;
    };

    private final PriorityQueue<Shipment> pQueue = new PriorityQueue<>(comparator);

    /**
     * Enqueue: Adds a priority shipment into the binary heap.
     * Time Complexity: O(log n)
     */
    public synchronized void enqueue(Shipment shipment) {
        if (shipment != null) {
            pQueue.offer(shipment);
        }
    }

    /**
     * Dequeue: Extracts and removes the highest priority shipment.
     * Time Complexity: O(log n)
     */
    public synchronized Shipment dequeue() {
        return pQueue.poll();
    }

    /**
     * Peek: Inspects the highest priority shipment without removing it.
     * Time Complexity: O(1)
     */
    public synchronized Shipment peek() {
        return pQueue.peek();
    }

    /**
     * Returns a snapshot of shipments sorted by their effective processing order
     */
    public synchronized List<Shipment> getSnapshotList() {
        List<Shipment> list = new ArrayList<>(pQueue);
        list.sort(comparator);
        return list;
    }

    /**
     * Remove specific shipment (e.g. if cancelled)
     */
    public synchronized boolean remove(String shipmentId) {
        if (shipmentId == null) return false;
        return pQueue.removeIf(s -> shipmentId.equalsIgnoreCase(s.getShipmentId()));
    }

    public synchronized int size() {
        return pQueue.size();
    }

    public synchronized boolean isEmpty() {
        return pQueue.isEmpty();
    }

    public synchronized void clear() {
        pQueue.clear();
    }

    public synchronized void loadAll(List<Shipment> shipments) {
        pQueue.clear();
        if (shipments != null) {
            for (Shipment s : shipments) {
                if ("PRIORITY".equalsIgnoreCase(s.getType()) && "WAITING".equalsIgnoreCase(s.getStatus())) {
                    pQueue.offer(s);
                }
            }
        }
    }
}
