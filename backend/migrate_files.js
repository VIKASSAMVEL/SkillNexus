const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'urban_skill_exchange'
  });

  try {
    // Create session_files table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS session_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        uploaded_by INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_session (session_id),
        INDEX idx_uploader (uploaded_by),
        INDEX idx_uploaded (uploaded_at)
      )
    `);

    console.log('session_files table created successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await connection.end();
  }
}

runMigration();