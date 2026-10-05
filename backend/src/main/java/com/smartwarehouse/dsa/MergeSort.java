package com.smartwarehouse.dsa;

import com.smartwarehouse.model.Product;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * MergeSort
 * DSA Implementation: Manual divide-and-conquer Merge Sort for inventory ordering.
 * Time Complexity: O(n log n) in all cases (worst, average, best).
 * Space Complexity: O(n) auxiliary space for merge buffers.
 * Stable Sorting: Yes.
 */
@Component
public class MergeSort {

    /**
     * Sorts products list using manual merge sort
     * @param products input list
     * @param sortBy field: "productId", "name", "price", "quantity"
     * @param ascending true for ASC, false for DESC
     * @return new sorted list
     */
    public List<Product> sort(List<Product> products, String sortBy, boolean ascending) {
        if (products == null) return new ArrayList<>();
        List<Product> copy = new ArrayList<>(products);
        if (copy.size() <= 1) return copy;

        return mergeSortRecursive(copy, sortBy != null ? sortBy.toLowerCase() : "productid", ascending);
    }

    private List<Product> mergeSortRecursive(List<Product> list, String sortBy, boolean ascending) {
        // Base case: list of size 0 or 1 is already sorted
        if (list.size() <= 1) {
            return list;
        }

        // Step 1: Divide
        int mid = list.size() / 2;
        List<Product> left = new ArrayList<>(list.subList(0, mid));
        List<Product> right = new ArrayList<>(list.subList(mid, list.size()));

        // Step 2: Recursively sort both halves
        left = mergeSortRecursive(left, sortBy, ascending);
        right = mergeSortRecursive(right, sortBy, ascending);

        // Step 3: Conquer / Merge the two sorted halves
        return merge(left, right, sortBy, ascending);
    }

    private List<Product> merge(List<Product> left, List<Product> right, String sortBy, boolean ascending) {
        List<Product> merged = new ArrayList<>(left.size() + right.size());
        int i = 0, j = 0;

        while (i < left.size() && j < right.size()) {
            Product p1 = left.get(i);
            Product p2 = right.get(j);

            int cmp = compareProducts(p1, p2, sortBy);
            if (!ascending) {
                cmp = -cmp; // Reverse for descending
            }

            // If left <= right, take left (preserves stability)
            if (cmp <= 0) {
                merged.add(p1);
                i++;
            } else {
                merged.add(p2);
                j++;
            }
        }

        // Append any remaining elements
        while (i < left.size()) {
            merged.add(left.get(i));
            i++;
        }
        while (j < right.size()) {
            merged.add(right.get(j));
            j++;
        }

        return merged;
    }

    private int compareProducts(Product p1, Product p2, String sortBy) {
        if (p1 == null && p2 == null) return 0;
        if (p1 == null) return -1;
        if (p2 == null) return 1;

        switch (sortBy) {
            case "name":
                String n1 = p1.getName() != null ? p1.getName() : "";
                String n2 = p2.getName() != null ? p2.getName() : "";
                return n1.compareToIgnoreCase(n2);

            case "price":
                Double pr1 = p1.getPrice() != null ? p1.getPrice() : 0.0;
                Double pr2 = p2.getPrice() != null ? p2.getPrice() : 0.0;
                return Double.compare(pr1, pr2);

            case "quantity":
                Integer q1 = p1.getQuantity() != null ? p1.getQuantity() : 0;
                Integer q2 = p2.getQuantity() != null ? p2.getQuantity() : 0;
                return Integer.compare(q1, q2);

            case "productid":
            default:
                String id1 = p1.getProductId() != null ? p1.getProductId() : "";
                String id2 = p2.getProductId() != null ? p2.getProductId() : "";
                return id1.compareToIgnoreCase(id2);
        }
    }
}
