package com.example.bakery_site.dto;

public class AdminSummaryDto {

    private long totalProducts;
    private long lowStockProducts;
    private long pendingOrders;
    private long successfulOrders;
    private long reservationCount;

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getSuccessfulOrders() {
        return successfulOrders;
    }

    public void setSuccessfulOrders(long successfulOrders) {
        this.successfulOrders = successfulOrders;
    }

    public long getReservationCount() {
        return reservationCount;
    }

    public void setReservationCount(long reservationCount) {
        this.reservationCount = reservationCount;
    }
}
