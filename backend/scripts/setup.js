const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const setupDatabase = async () => {
  let connection;

  try {
    // Initial connection (no database selected)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server');

    // Create the database if it doesn't exist
    const dbName = process.env.DB_NAME || 'school_inventory';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log('Database created or already exists');

    // Close initial connection
    await connection.end();

    // Connect again with database selected
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName
    });

    console.log(`Connected to database "${dbName}"`);
    console.log('Creating tables...');

    // --- Tables creation here ---
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        status ENUM('active', 'inactive') DEFAULT 'active',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id VARCHAR(20) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        department VARCHAR(100),
        position VARCHAR(100),
        status ENUM('active', 'inactive') DEFAULT 'active',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        class VARCHAR(50),
        year_group VARCHAR(10),
        status ENUM('active', 'inactive') DEFAULT 'active',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INT,
        quantity INT NOT NULL DEFAULT 0,
        minimum_quantity INT NOT NULL DEFAULT 0,
        unit_price DECIMAL(10,2),
        location VARCHAR(100),
        supplier VARCHAR(100),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity INT NOT NULL,
        approved_quantity INT NULL,
        purpose TEXT NOT NULL,
        urgency ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        status ENUM('pending', 'approved', 'rejected', 'distributed', 'cancelled') DEFAULT 'pending',
        remarks TEXT,
        processed_by INT NULL,
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES staff(id) ON DELETE SET NULL
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS distributions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        student_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity INT NOT NULL,
        distributed_by INT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
        FOREIGN KEY (distributed_by) REFERENCES staff(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        movement_type ENUM('add', 'subtract') NOT NULL,
        quantity INT NOT NULL,
        previous_quantity INT NOT NULL,
        new_quantity INT NOT NULL,
        reason TEXT NOT NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
      )
    `);

    console.log('All tables created successfully');

    // Insert default categories
    console.log('Inserting default categories...');
    const defaultCategories = [
      ['Stationery', 'Office and school supplies'],
      ['Electronics', 'Electronic devices and accessories'],
      ['Books', 'Textbooks and reference materials'],
      ['Sports Equipment', 'Sports and recreational equipment'],
      ['Laboratory Equipment', 'Science laboratory tools and equipment'],
      ['Furniture', 'School furniture and fixtures'],
      ['Cleaning Supplies', 'Cleaning and maintenance supplies'],
      ['Medical Supplies', 'First aid and medical supplies']
    ];

    for (const [name, description] of defaultCategories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
        [name, description]
      );
    }

    // Create default admin
    console.log('Creating default admin account...');
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123!';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@amoyashs.edu.gh';

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await connection.execute(`
      INSERT IGNORE INTO admins (username, password, full_name, email)
      VALUES (?, ?, 'System Administrator', ?)
    `, [adminUsername, hashedPassword, adminEmail]);

    console.log('Setup completed successfully!');
    console.log('=================================');
    console.log('Default Admin Credentials:');
    console.log(`Username: ${adminUsername}`);
    console.log(`Password: ${adminPassword}`);
    console.log('=================================');
    console.log('Please change the default password after first login!');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

setupDatabase();
