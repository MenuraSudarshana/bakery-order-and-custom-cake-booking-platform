USE bakery_db;

CREATE TABLE IF NOT EXISTS product_catalog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    flavour VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(800) NOT NULL,
    price DOUBLE NOT NULL,
    rating DOUBLE NOT NULL DEFAULT 4.5,
    stock INT NOT NULL DEFAULT 0,
    active BIT(1) NOT NULL DEFAULT b'1',
    created_at VARCHAR(80) NOT NULL,
    updated_at VARCHAR(80) NOT NULL
);

ALTER TABLE customer_order
    MODIFY COLUMN order_items LONGTEXT NOT NULL;

ALTER TABLE customer_order
    MODIFY COLUMN payment_method VARCHAR(50) NOT NULL;

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS expense_entry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month_key VARCHAR(7) NOT NULL,
    category VARCHAR(80) NOT NULL,
    amount DOUBLE NOT NULL,
    note VARCHAR(300) NOT NULL,
    created_at VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS monthly_financial_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month_key VARCHAR(7) NOT NULL UNIQUE,
    revenue DOUBLE NOT NULL DEFAULT 0,
    cost DOUBLE NOT NULL DEFAULT 0,
    profit DOUBLE NOT NULL DEFAULT 0,
    updated_at VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_movement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity_change INT NOT NULL,
    reason VARCHAR(60) NOT NULL,
    ref_order_id INT NOT NULL,
    created_at VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_stock_entry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stock_date VARCHAR(10) NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    daily_stock INT NULL,
    updated_at VARCHAR(80) NOT NULL,
    UNIQUE KEY uq_daily_stock_date_product (stock_date, product_id)
);

CREATE TABLE IF NOT EXISTS contact_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    message VARCHAR(1500) NOT NULL,
    submitted_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS customize_cake_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(200) NOT NULL,
    occasion VARCHAR(120) NOT NULL,
    weight VARCHAR(80) NOT NULL,
    design_photo_url VARCHAR(1000) NULL,
    contact_number VARCHAR(20) NOT NULL,
    required_date VARCHAR(20) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    layers INT NOT NULL,
    flavor VARCHAR(150) NULL,
    specifications VARCHAR(2000) NULL,
    note VARCHAR(2000) NULL,
    order_status VARCHAR(40) NOT NULL,
    created_at VARCHAR(40) NOT NULL
);

INSERT INTO user (username, password)
SELECT 'admin', 'admin123'
WHERE NOT EXISTS (
    SELECT 1 FROM user WHERE username = 'admin'
);
