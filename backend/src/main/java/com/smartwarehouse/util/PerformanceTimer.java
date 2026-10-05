package com.smartwarehouse.util;

import java.util.function.Supplier;

/**
 * PerformanceTimer
 * Utility for high-precision runtime measurements using System.nanoTime().
 */
public class PerformanceTimer {

    public static class Measurement<T> {
        private final T result;
        private final long durationNanos;
        private final double durationMs;

        public Measurement(T result, long durationNanos) {
            this.result = result;
            this.durationNanos = durationNanos;
            this.durationMs = durationNanos / 1_000_000.0;
        }

        public T getResult() { return result; }
        public long getDurationNanos() { return durationNanos; }
        public double getDurationMs() { return durationMs; }
    }

    public static <T> Measurement<T> measure(Supplier<T> supplier) {
        long start = System.nanoTime();
        T res = supplier.get();
        long end = System.nanoTime();
        return new Measurement<>(res, end - start);
    }

    public static Measurement<Void> measureRunnable(Runnable runnable) {
        long start = System.nanoTime();
        runnable.run();
        long end = System.nanoTime();
        return new Measurement<>(null, end - start);
    }
}
