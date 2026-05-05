package com.example.bakery_site.service;

import com.example.bakery_site.dto.AdminProductCreateRequestDto;
import com.example.bakery_site.dto.AdminSummaryDto;
import com.example.bakery_site.model.*;
import com.example.bakery_site.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class AdminService implements IAdminService {

    private final ProductRepository productRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final ReservationRepository reservationRepository;
    private final ExpenseEntryRepository expenseEntryRepository;
    private final DailyStockEntryRepository dailyStockEntryRepository;
    private final MonthlyFinancialSummaryRepository monthlyFinancialSummaryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ObjectMapper objectMapper;

    public AdminService(
            ProductRepository productRepository,
            CustomerOrderRepository customerOrderRepository,
            ReservationRepository reservationRepository,
            ExpenseEntryRepository expenseEntryRepository,
            DailyStockEntryRepository dailyStockEntryRepository,
            MonthlyFinancialSummaryRepository monthlyFinancialSummaryRepository,
            StockMovementRepository stockMovementRepository,
            ObjectMapper objectMapper
    ) {
        this.productRepository = productRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.reservationRepository = reservationRepository;
        this.expenseEntryRepository = expenseEntryRepository;
        this.dailyStockEntryRepository = dailyStockEntryRepository;
        this.monthlyFinancialSummaryRepository = monthlyFinancialSummaryRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public AdminSummaryDto getSummary() {
        AdminSummaryDto summary = new AdminSummaryDto();
        summary.setTotalProducts(productRepository.countByActiveTrue());
        summary.setLowStockProducts(productRepository.countByActiveTrueAndStockLessThanEqual(5));
        summary.setPendingOrders(customerOrderRepository.countByOrderStatusIgnoreCase("Pending"));
        summary.setSuccessfulOrders(customerOrderRepository.countByOrderStatusIgnoreCase("Successful"));
        summary.setReservationCount(reservationRepository.count());
        return summary;
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByIdDesc();
    }

    @Override
    public Product createProduct(AdminProductCreateRequestDto request) {
        String name = clean(request.getName());
        String category = clean(request.getCategory());
        String flavour = clean(request.getFlavour());
        String description = clean(request.getDescription());
        String imageUrl = clean(request.getImageUrl());
        double price = request.getPrice() == null ? 0 : request.getPrice();
        double rating = request.getRating() == null ? 4.5 : request.getRating();
        int stock = request.getStock() == null ? 0 : request.getStock();

        validateProductFields(name, category, flavour, description, imageUrl, price, rating, stock);

        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setFlavour(flavour);
        product.setDescription(description);
        product.setImageUrl(imageUrl);
        product.setPrice(price);
        product.setRating(rating);
        product.setStock(stock);
        product.setActive(true);
        product.setCreatedAt(LocalDateTime.now().toString());
        product.setUpdatedAt(LocalDateTime.now().toString());
        return productRepository.save(product);
    }

    @Override
    public int importWebsiteCatalogProducts() {
        List<WebsiteProduct> catalog = List.of(
                new WebsiteProduct("Orange Butter Cake", "Butter Cake", "Orange / Vanilla", "Soft butter sponge with fresh orange notes.", "./assets/images/product-1.png", 2000, 4.8),
                new WebsiteProduct("Classic Vanilla Butter Cake", "Butter Cake", "Vanilla", "Traditional butter cake with rich vanilla taste.", "./assets/images/Marble Gateau.png", 3200, 4.6),
                new WebsiteProduct("Chocolate Butter Loaf", "Butter Cake", "Chocolate / Mocha", "Dense butter loaf finished with chocolate layers.", "./assets/images/Coffee-Chocolate-Gateau.png", 4500, 4.7),
                new WebsiteProduct("Black Forest Signature", "Signature Cake", "Chocolate / Cherry", "Signature black forest cake with cherry cream.", "./assets/images/Black-forest-Gateau.png", 5000, 4.8),
                new WebsiteProduct("Blueberry Signature Cheesecake", "Signature Cake", "Blueberry / Vanilla", "Baked cheesecake with premium blueberry topping.", "./assets/images/Blueberry Baked Cheesecake.png", 5500, 4.9),
                new WebsiteProduct("Red Velvet Signature", "Signature Cake", "Vanilla / Cocoa", "Moist red velvet cake with smooth cream finish.", "./assets/images/Red Velvet Cake 2.png", 4000, 4.7),
                new WebsiteProduct("Chocolate Cake Piece", "Cake Piece", "Chocolate", "Single-serve chocolate slice.", "./assets/images/Black-forest-Gateau-1.png", 650, 4.6),
                new WebsiteProduct("Coffee Chocolate Slice", "Cake Piece", "Mocha / Chocolate", "Rich coffee chocolate slice for quick treats.", "./assets/images/Coffee-Chocolate-Gateau.png", 700, 4.7),
                new WebsiteProduct("Orange Slice", "Cake Piece", "Orange / Vanilla", "Fresh orange sponge slice with light cream.", "./assets/images/orange 2.png", 600, 4.5),
                new WebsiteProduct("Butter Cake", "Butter Cake", "Vanilla", "Rich, buttery and moist vanilla cake.", "./assets/images/Butter-cake-1-1-1.png", 1100, 4.9),
                new WebsiteProduct("Coffee Cake", "Butter Cake", "Coffee", "Rich coffee flavored sponge cake.", "./assets/images/Coffee Cake.png", 2000, 4.8),
                new WebsiteProduct("Disc Cake", "Butter Cake", "Chocolate / Vanilla", "Round disc shaped cake for celebrations.", "./assets/images/Disc Cake.png", 2000, 4.3),
                new WebsiteProduct("Disk Ribbon Cake Extra Large", "Butter Cake", "Ribbon", "Extra large ribbon disc cake for big celebrations.", "./assets/images/Disk-Ribbon-Cake-Extra-Large-1.png", 4600, 4.7),
                new WebsiteProduct("Ribbon Cake", "Butter Cake", "Ribbon", "Colorful layered ribbon cake.", "./assets/images/Ribbon Cake.png", 1500, 4.4),
                new WebsiteProduct("Marble Cake", "Butter Cake", "Chocolate & Vanilla", "Swirled chocolate and vanilla marble cake.", "./assets/images/Marble-Cake.png", 250, 4.3),
                new WebsiteProduct("Chocolate Pineapple Gateau Slice", "Cake Piece", "Chocolate & Pineapple", "Rich chocolate and sweet pineapple slice.", "./assets/images/Chocolate Pineapple Gateau Slice.png", 250, 4.9),
                new WebsiteProduct("Coffee Chocolate Gateau Slice", "Cake Piece", "Chocolate & Coffee", "Perfect blend of coffee and chocolate.", "./assets/images/Coffee Chocolate Gateau Slice.png", 250, 4.8),
                new WebsiteProduct("Mango Gateau Slice", "Cake Piece", "Mango", "Tropical mango flavored gateau slice.", "./assets/images/Mango Gateau Slice.png", 250, 4.8),
                new WebsiteProduct("Rose Gateau Slice", "Cake Piece", "Rose and Vanilla", "Floral rose and vanilla flavored slice.", "./assets/images/Rose Gateau Slice.png", 250, 4.8),
                new WebsiteProduct("Swiss Roll", "Cake Piece", "Chocolate / Vanilla", "Rolled sponge cake with cream filling.", "./assets/images/Swiss-Roll.png", 4500, 4.7),
                new WebsiteProduct("Triple Treat Slice", "Cake Piece", "Strawberry, Vanilla & Chocolate", "Three flavors in one delicious slice.", "./assets/images/Triple Treat Slice.png", 250, 4.8)
        );

        int inserted = 0;
        for (WebsiteProduct item : catalog) {
            if (productRepository.findByNameIgnoreCase(item.name()).isPresent()) {
                continue;
            }

            Product product = new Product();
            product.setName(item.name());
            product.setCategory(item.category());
            product.setFlavour(item.flavour());
            product.setDescription(item.description());
            product.setImageUrl(item.imageUrl());
            product.setPrice(item.price());
            product.setRating(item.rating());
            product.setStock(0);
            product.setActive(true);
            product.setCreatedAt(LocalDateTime.now().toString());
            product.setUpdatedAt(LocalDateTime.now().toString());
            productRepository.save(product);
            inserted++;
        }
        return inserted;
    }

    @Override
    public Product updateProduct(Integer productId, AdminProductCreateRequestDto request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        String name = clean(request.getName());
        String category = clean(request.getCategory());
        String flavour = clean(request.getFlavour());
        String description = clean(request.getDescription());
        String imageUrl = clean(request.getImageUrl());
        double price = request.getPrice() == null ? 0 : request.getPrice();
        double rating = request.getRating() == null ? 4.5 : request.getRating();
        int stock = request.getStock() == null ? 0 : request.getStock();

        validateProductFields(name, category, flavour, description, imageUrl, price, rating, stock);

        product.setName(name);
        product.setCategory(category);
        product.setFlavour(flavour);
        product.setDescription(description);
        product.setImageUrl(imageUrl);
        product.setPrice(price);
        product.setRating(rating);
        product.setStock(stock);
        product.setUpdatedAt(LocalDateTime.now().toString());
        return productRepository.save(product);
    }

    @Override
    public Product updateProductStock(Integer productId, Integer stock) {
        if (stock == null || stock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        product.setStock(stock);
        product.setUpdatedAt(LocalDateTime.now().toString());
        return productRepository.save(product);
    }

    @Override
    public Product updateProductActive(Integer productId, boolean active) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        product.setActive(active);
        product.setUpdatedAt(LocalDateTime.now().toString());
        return productRepository.save(product);
    }

    @Override
    public List<CustomerOrder> getOrders(String status) {
        String cleanStatus = clean(status);
        if (cleanStatus.isEmpty() || cleanStatus.equalsIgnoreCase("all")) {
            return customerOrderRepository.findAllByOrderByIdDesc();
        }

        return customerOrderRepository.findByOrderStatusIgnoreCaseOrderByIdDesc(cleanStatus);
    }

    @Override
    @Transactional
    public CustomerOrder updateOrderStatus(Integer orderId, String status) {
        String cleanStatus = normalizeStatus(status);
        if (
                !cleanStatus.equals("Pending") &&
                !cleanStatus.equals("Successful") &&
                !cleanStatus.equals("Cancelled")
        ) {
            throw new IllegalArgumentException("Invalid order status.");
        }

        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));

        boolean wasSuccessful = "Successful".equalsIgnoreCase(order.getOrderStatus());
        boolean nowSuccessful = "Successful".equalsIgnoreCase(cleanStatus);

        if (!wasSuccessful && nowSuccessful) {
            deductStockForOrder(order);
            syncMonthlySummary(monthKeyFromDate(clean(order.getPickupDate()), order.getCreatedAt()));
        }

        if (wasSuccessful && !nowSuccessful) {
            syncMonthlySummary(monthKeyFromDate(clean(order.getPickupDate()), order.getCreatedAt()));
        }

        order.setOrderStatus(cleanStatus);
        return customerOrderRepository.save(order);
    }

    @Override
    public List<Reservation> getReservations() {
        return reservationRepository.findAllByOrderByIdDesc();
    }

    @Override
    public void deleteReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));
        reservationRepository.delete(reservation);
    }

    @Override
    public ExpenseEntry createExpense(String monthKey, String category, Double amount, String note) {
        String cleanMonthKey = clean(monthKey);
        String cleanCategory = clean(category);
        String cleanNote = clean(note);
        double cleanAmount = amount == null ? 0 : amount;

        if (!cleanMonthKey.matches("^\\d{4}-\\d{2}$")) {
            throw new IllegalArgumentException("Month must be in YYYY-MM format.");
        }
        if (cleanCategory.isEmpty()) {
            throw new IllegalArgumentException("Expense category is required.");
        }
        if (cleanAmount <= 0) {
            throw new IllegalArgumentException("Expense amount must be greater than zero.");
        }

        ExpenseEntry expenseEntry = new ExpenseEntry();
        expenseEntry.setMonthKey(cleanMonthKey);
        expenseEntry.setCategory(cleanCategory);
        expenseEntry.setAmount(cleanAmount);
        expenseEntry.setNote(cleanNote.isEmpty() ? "-" : cleanNote);
        expenseEntry.setCreatedAt(LocalDateTime.now().toString());
        ExpenseEntry saved = expenseEntryRepository.save(expenseEntry);
        syncMonthlySummary(cleanMonthKey);
        return saved;
    }

    @Override
    public List<ExpenseEntry> getExpenses() {
        return expenseEntryRepository.findAllByOrderByIdDesc();
    }

    @Override
    @Transactional
    public List<DailyStockEntry> getDailyStockEntries(String stockDate) {
        String cleanDate = clean(stockDate);
        if (!cleanDate.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
            throw new IllegalArgumentException("Stock date must be in YYYY-MM-DD format.");
        }

        List<Product> products = productRepository.findAllByOrderByIdDesc();
        for (Product product : products) {
            dailyStockEntryRepository.findByStockDateAndProductId(cleanDate, product.getId())
                    .orElseGet(() -> {
                        DailyStockEntry entry = new DailyStockEntry();
                        entry.setStockDate(cleanDate);
                        entry.setProductId(product.getId());
                        entry.setProductName(product.getName());
                        entry.setDailyStock(null);
                        entry.setUpdatedAt(LocalDateTime.now().toString());
                        return dailyStockEntryRepository.save(entry);
                    });
        }

        return dailyStockEntryRepository.findByStockDateOrderByProductNameAsc(cleanDate);
    }

    @Override
    public DailyStockEntry updateDailyStockEntry(Integer entryId, Integer dailyStock) {
        if (dailyStock == null || dailyStock < 0) {
            throw new IllegalArgumentException("Daily stock cannot be negative.");
        }
        DailyStockEntry entry = dailyStockEntryRepository.findById(entryId)
                .orElseThrow(() -> new IllegalArgumentException("Daily stock entry not found."));
        entry.setDailyStock(dailyStock);
        entry.setUpdatedAt(LocalDateTime.now().toString());
        return dailyStockEntryRepository.save(entry);
    }

    @Override
    public void deleteDailyStockEntry(Integer entryId) {
        DailyStockEntry entry = dailyStockEntryRepository.findById(entryId)
                .orElseThrow(() -> new IllegalArgumentException("Daily stock entry not found."));
        dailyStockEntryRepository.delete(entry);
    }

    @Override
    public List<MonthlyFinancialSummary> getMonthlyFinancialSummaries() {
        return monthlyFinancialSummaryRepository.findAll();
    }

    @Override
    public List<StockMovement> getStockMovements() {
        return stockMovementRepository.findAll();
    }

    @Override
    public Map<String, Object> getAnalytics() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);

        Map<String, Integer> reservationsPerDay = new LinkedHashMap<>();
        Map<String, Integer> ordersPerDay = new LinkedHashMap<>();
        Map<String, Integer> successfulOrdersPerDay = new LinkedHashMap<>();
        Map<String, Double> revenuePerDay = new LinkedHashMap<>();

        int days = currentMonth.lengthOfMonth();
        for (int day = 1; day <= days; day++) {
            String key = String.format("%s-%02d", currentMonth, day);
            reservationsPerDay.put(key, 0);
            ordersPerDay.put(key, 0);
            successfulOrdersPerDay.put(key, 0);
            revenuePerDay.put(key, 0.0);
        }

        for (Reservation reservation : reservationRepository.findAll()) {
            String dateKey = clean(reservation.getReservationDate());
            if (reservationsPerDay.containsKey(dateKey)) {
                reservationsPerDay.put(dateKey, reservationsPerDay.get(dateKey) + 1);
            }
        }

        for (CustomerOrder order : customerOrderRepository.findAll()) {
            String dateKey = clean(order.getPickupDate());
            if (!ordersPerDay.containsKey(dateKey)) {
                continue;
            }

            ordersPerDay.put(dateKey, ordersPerDay.get(dateKey) + 1);
            if ("Successful".equalsIgnoreCase(order.getOrderStatus())) {
                successfulOrdersPerDay.put(dateKey, successfulOrdersPerDay.get(dateKey) + 1);
                revenuePerDay.put(dateKey, revenuePerDay.get(dateKey) + order.getTotal());
            }
        }

        List<String> recentMonths = new ArrayList<>();
        Map<String, Double> monthlyRevenue = new LinkedHashMap<>();
        Map<String, Double> monthlyCosts = new LinkedHashMap<>();
        Map<String, Double> monthlyProfit = new LinkedHashMap<>();

        for (int i = 5; i >= 0; i--) {
            String month = currentMonth.minusMonths(i).toString();
            recentMonths.add(month);
            monthlyRevenue.put(month, 0.0);
            monthlyCosts.put(month, 0.0);
            monthlyProfit.put(month, 0.0);
        }

        for (MonthlyFinancialSummary summary : monthlyFinancialSummaryRepository.findAll()) {
            String month = clean(summary.getMonthKey());
            if (monthlyRevenue.containsKey(month)) {
                monthlyRevenue.put(month, summary.getRevenue());
                monthlyCosts.put(month, summary.getCost());
            }
        }

        double currentMonthRevenue = monthlyRevenue.getOrDefault(currentMonth.toString(), 0.0);
        double currentMonthCost = monthlyCosts.getOrDefault(currentMonth.toString(), 0.0);

        for (String month : recentMonths) {
            monthlyProfit.put(month, monthlyRevenue.get(month) - monthlyCosts.get(month));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("dailyReservations", reservationsPerDay);
        response.put("dailyOrders", ordersPerDay);
        response.put("dailySuccessfulOrders", successfulOrdersPerDay);
        response.put("dailyRevenue", revenuePerDay);
        response.put("monthlyRevenue", monthlyRevenue);
        response.put("monthlyCosts", monthlyCosts);
        response.put("monthlyProfit", monthlyProfit);
        response.put("currentMonthRevenue", currentMonthRevenue);
        response.put("currentMonthCost", currentMonthCost);
        response.put("currentMonthProfit", currentMonthRevenue - currentMonthCost);
        return response;
    }

    @Override
    public List<Product> getPublicProducts() {
        return productRepository.findByActiveTrueAndStockGreaterThanOrderByIdDesc(0);
    }

    private void deductStockForOrder(CustomerOrder order) {
        try {
            JsonNode root = objectMapper.readTree(clean(order.getOrderItems()));
            if (!root.isArray()) {
                return;
            }

            for (JsonNode item : root) {
                String idValue = item.path("id").asText("");
                if (!idValue.startsWith("db-")) {
                    continue;
                }

                int productId = Integer.parseInt(idValue.substring(3));
                int qty = item.path("qty").asInt(0);
                if (qty <= 0) {
                    continue;
                }

                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new IllegalArgumentException("Ordered product not found: " + idValue));

                if (product.getStock() < qty) {
                    throw new IllegalArgumentException("Not enough stock for product: " + product.getName());
                }

                product.setStock(product.getStock() - qty);
                product.setUpdatedAt(LocalDateTime.now().toString());
                productRepository.save(product);

                StockMovement movement = new StockMovement();
                movement.setProductId(product.getId());
                movement.setProductName(product.getName());
                movement.setQuantityChange(-qty);
                movement.setReason("ORDER_SUCCESS");
                movement.setRefOrderId(order.getId());
                movement.setCreatedAt(LocalDateTime.now().toString());
                stockMovementRepository.save(movement);
            }
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Unable to parse order items for stock update.");
        }
    }

    private String monthKeyFromDate(String dateValue, String fallbackDateTime) {
        try {
            if (!dateValue.isEmpty()) {
                return YearMonth.from(LocalDate.parse(dateValue)).toString();
            }
        } catch (DateTimeParseException ignored) {
        }

        try {
            return YearMonth.from(LocalDateTime.parse(clean(fallbackDateTime))).toString();
        } catch (Exception ignored) {
            return YearMonth.now().toString();
        }
    }

    private void syncMonthlySummary(String monthKey) {
        double revenue = customerOrderRepository.findAll().stream()
                .filter(order -> "Successful".equalsIgnoreCase(order.getOrderStatus()))
                .filter(order -> monthKey.equals(monthKeyFromDate(clean(order.getPickupDate()), order.getCreatedAt())))
                .mapToDouble(CustomerOrder::getTotal)
                .sum();

        double cost = expenseEntryRepository.findAll().stream()
                .filter(expense -> monthKey.equals(clean(expense.getMonthKey())))
                .mapToDouble(ExpenseEntry::getAmount)
                .sum();

        MonthlyFinancialSummary summary = monthlyFinancialSummaryRepository.findByMonthKey(monthKey)
                .orElseGet(MonthlyFinancialSummary::new);

        summary.setMonthKey(monthKey);
        summary.setRevenue(revenue);
        summary.setCost(cost);
        summary.setProfit(revenue - cost);
        summary.setUpdatedAt(LocalDateTime.now().toString());
        monthlyFinancialSummaryRepository.save(summary);
    }

    private void validateProductFields(
            String name,
            String category,
            String flavour,
            String description,
            String imageUrl,
            double price,
            double rating,
            int stock
    ) {
        if (
                name.isEmpty() ||
                category.isEmpty() ||
                flavour.isEmpty() ||
                description.isEmpty() ||
                imageUrl.isEmpty()
        ) {
            throw new IllegalArgumentException("All product fields are required.");
        }

        if (price <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero.");
        }

        if (rating < 0 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5.");
        }

        if (stock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative.");
        }
    }

    private String normalizeStatus(String value) {
        String cleaned = clean(value).toLowerCase(Locale.ROOT);
        if (cleaned.isEmpty()) {
            return "";
        }

        return cleaned.substring(0, 1).toUpperCase(Locale.ROOT) + cleaned.substring(1);
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private record WebsiteProduct(
            String name,
            String category,
            String flavour,
            String description,
            String imageUrl,
            double price,
            double rating
    ) {}
}
