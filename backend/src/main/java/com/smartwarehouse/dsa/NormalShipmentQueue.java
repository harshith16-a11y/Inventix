package com.smartwarehouse.dsa;

import com.smartwarehouse.model.Shipment;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/**
 * NormalShipmentQueue
 * DSA Implementation: First-In, First-Out (FIFO) Queue using ArrayDeque.
 * Time Complexity: O(1) for enqueue and dequeue operations.
 * Space Complexity: O(k) where k is the number of queued normal shipments.
 */
@Component
public class NormalShipmentQueue {

    private final Deque<Shipment> queue = new ArrayDeque<>();

    /**
     * Enqueue: Adds a normal shipment to the REAR of the queue.
     * Time Complexity: O(1) amortized
     */
    public synchronized void enqueue(Shipment shipment) {
        if (shipment != null) {
            queue.addLast(shipment);
        }
    }

    /**
     * Dequeue: Removes and returns the shipment from the FRONT of the queue.
     * Time Complexity: O(1)
     */
    public synchronized Shipment dequeue() {
        return queue.pollFirst();
    }

    /**
     * Peek: Inspects the shipment at the FRONT without removing it.
     */
    public synchronized Shipment peek() {
        return queue.peekFirst();
    }

    /**
     * Finds 1-based queue position of a shipment by shipmentId.
     * Returns -1 if not currently in queue.
     */
    public synchronized int getPosition(String shipmentId) {
        if (shipmentId == null) return -1;
        int position = 1;
        for (Shipment s : queue) {
            if (shipmentId.equalsIgnoreCase(s.getShipmentId())) {
                return position;
            }
            position++;
        }
        return -1;
    }

    /**
     * Returns a snapshot of the current queue from FRONT to REAR
     */
    public synchronized List<Shipment> getQueueSnapshot() {
        return new ArrayList<>(queue);
    }

    /**
     * Remove specific shipment (e.g. if cancelled)
     */
    public synchronized boolean remove(String shipmentId) {
        if (shipmentId == null) return false;
        return queue.removeIf(s -> shipmentId.equalsIgnoreCase(s.getShipmentId()));
    }

    public synchronized int size() {
        return queue.size();
    }

    public synchronized boolean isEmpty() {
        return queue.isEmpty();
    }

    public synchronized void clear() {
        queue.clear();
    }

    public synchronized void loadAll(List<Shipment> shipments) {
        queue.clear();
        if (shipments != null) {
            for (Shipment s : shipments) {
                if ("NORMAL".equalsIgnoreCase(s.getType()) && "WAITING".equalsIgnoreCase(s.getStatus())) {
                    queue.addLast(s);
                }
            }
        }
    }
}
