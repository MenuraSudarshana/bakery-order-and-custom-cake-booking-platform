package com.example.bakery_site.service;

import com.example.bakery_site.dto.AdminProductCreateRequestDto;
import com.example.bakery_site.dto.AdminSummaryDto;
import com.example.bakery_site.model.*;

import java.util.List;
import java.util.Map;

public interface IAdminService {

    AdminSummaryDto getSummary();

    List<Product> getAllProducts();

    Product createProduct(AdminProductCreateRequestDto request);

    int importWebsiteCatalogProducts();

    Product updateProduct(Integer productId, AdminProductCreateRequestDto request);

    Product updateProductStock(Integer productId, Integer stock);

    Product updateProductActive(Integer productId, boolean active);

    List<CustomerOrder> getOrders(String status);

    CustomerOrder updateOrderStatus(Integer orderId, String status);

    List<Reservation> getReservations();

    void deleteReservation(Long reservationId);

    ExpenseEntry createExpense(String monthKey, String category, Double amount, String note);

    List<ExpenseEntry> getExpenses();

    List<DailyStockEntry> getDailyStockEntries(String stockDate);

    DailyStockEntry updateDailyStockEntry(Integer entryId, Integer dailyStock);

    void deleteDailyStockEntry(Integer entryId);

    List<MonthlyFinancialSummary> getMonthlyFinancialSummaries();

    List<StockMovement> getStockMovements();

    Map<String, Object> getAnalytics();

    List<Product> getPublicProducts();
}
