package com.example.bakery_site.controller;

import com.example.bakery_site.dto.AdminExpenseRequestDto;
import com.example.bakery_site.dto.AdminProductCreateRequestDto;
import com.example.bakery_site.dto.AdminSummaryDto;
import com.example.bakery_site.model.*;
import com.example.bakery_site.service.IAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/admin")
public class AdminController {

    private final IAdminService adminService;

    public AdminController(IAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/summary")
    public AdminSummaryDto summary() {
        return adminService.getSummary();
    }

    @GetMapping("/products")
    public List<Product> products() {
        return adminService.getAllProducts();
    }

    @PostMapping("/products")
    public Product createProduct(@RequestBody AdminProductCreateRequestDto request) {
        return adminService.createProduct(request);
    }

    @PostMapping("/products/import-catalog")
    public Map<String, Object> importCatalogProducts() {
        int inserted = adminService.importWebsiteCatalogProducts();
        return Map.of("success", true, "inserted", inserted);
    }

    @PutMapping("/products/{productId}")
    public Product updateProduct(@PathVariable Integer productId, @RequestBody AdminProductCreateRequestDto request) {
        return adminService.updateProduct(productId, request);
    }

    @PatchMapping("/products/{productId}/stock")
    public Product updateStock(@PathVariable Integer productId, @RequestParam Integer stock) {
        return adminService.updateProductStock(productId, stock);
    }

    @PatchMapping("/products/{productId}/active")
    public Product updateActive(@PathVariable Integer productId, @RequestParam boolean active) {
        return adminService.updateProductActive(productId, active);
    }

    @GetMapping("/orders")
    public List<CustomerOrder> orders(@RequestParam(defaultValue = "all") String status) {
        return adminService.getOrders(status);
    }

    @PatchMapping("/orders/{orderId}/status")
    public CustomerOrder updateOrderStatus(@PathVariable Integer orderId, @RequestParam String status) {
        return adminService.updateOrderStatus(orderId, status);
    }

    @GetMapping("/reservations")
    public List<Reservation> reservations() {
        return adminService.getReservations();
    }

    @DeleteMapping("/reservations/{reservationId}")
    public Map<String, Object> deleteReservation(@PathVariable Long reservationId) {
        adminService.deleteReservation(reservationId);
        return Map.of("success", true);
    }

    @PostMapping("/expenses")
    public ExpenseEntry createExpense(@RequestBody AdminExpenseRequestDto request) {
        return adminService.createExpense(
                request.getMonthKey(),
                request.getCategory(),
                request.getAmount(),
                request.getNote()
        );
    }

    @GetMapping("/expenses")
    public List<ExpenseEntry> expenses() {
        return adminService.getExpenses();
    }

    @GetMapping("/daily-stock")
    public List<DailyStockEntry> dailyStock(@RequestParam String date) {
        return adminService.getDailyStockEntries(date);
    }

    @PatchMapping("/daily-stock/{entryId}")
    public DailyStockEntry updateDailyStock(@PathVariable Integer entryId, @RequestParam Integer stock) {
        return adminService.updateDailyStockEntry(entryId, stock);
    }

    @DeleteMapping("/daily-stock/{entryId}")
    public Map<String, Object> deleteDailyStock(@PathVariable Integer entryId) {
        adminService.deleteDailyStockEntry(entryId);
        return Map.of("success", true);
    }

    @GetMapping("/monthly-summary")
    public List<MonthlyFinancialSummary> monthlySummary() {
        return adminService.getMonthlyFinancialSummaries();
    }

    @GetMapping("/stock-movements")
    public List<StockMovement> stockMovements() {
        return adminService.getStockMovements();
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        return adminService.getAnalytics();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleValidationError(IllegalArgumentException exception) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("success", false);
        payload.put("message", exception.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(payload);
    }
}
