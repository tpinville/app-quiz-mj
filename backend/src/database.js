import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = process.env.DB_PATH || './data/app.db';
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

export async function initDb() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Initialize schema
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      option_text TEXT NOT NULL,
      is_correct INTEGER DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Seed data
  await seedData();

  saveDb();
  return db;
}

async function seedData() {
  // Check if admin user exists
  const adminExists = db.exec('SELECT id FROM users WHERE username = "admin"');
  if (adminExists.length === 0 || adminExists[0].values.length === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    db.run('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)', ['admin', passwordHash]);
    console.log('Admin user created (username: admin, password: admin123)');
  }

  // Check if questions exist
  const questionsExist = db.exec('SELECT COUNT(*) FROM questions');
  const questionCount = questionsExist[0]?.values[0]?.[0] || 0;

  if (questionCount === 0) {
    const sampleQuestions = [
      {
        question: 'What is the capital of France?',
        options: [
          { text: 'London', correct: false },
          { text: 'Berlin', correct: false },
          { text: 'Paris', correct: true },
          { text: 'Madrid', correct: false }
        ]
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: [
          { text: 'Venus', correct: false },
          { text: 'Mars', correct: true },
          { text: 'Jupiter', correct: false },
          { text: 'Saturn', correct: false }
        ]
      },
      {
        question: 'What is the largest mammal in the world?',
        options: [
          { text: 'African Elephant', correct: false },
          { text: 'Blue Whale', correct: true },
          { text: 'Giraffe', correct: false },
          { text: 'Polar Bear', correct: false }
        ]
      },
      {
        question: 'In which year did World War II end?',
        options: [
          { text: '1943', correct: false },
          { text: '1944', correct: false },
          { text: '1945', correct: true },
          { text: '1946', correct: false }
        ]
      },
      {
        question: 'What is the chemical symbol for gold?',
        options: [
          { text: 'Go', correct: false },
          { text: 'Gd', correct: false },
          { text: 'Au', correct: true },
          { text: 'Ag', correct: false }
        ]
      },
      {
        question: 'Which programming language was created by Brendan Eich?',
        options: [
          { text: 'Python', correct: false },
          { text: 'JavaScript', correct: true },
          { text: 'Java', correct: false },
          { text: 'C++', correct: false }
        ]
      },
      {
        question: 'What is the smallest prime number?',
        options: [
          { text: '0', correct: false },
          { text: '1', correct: false },
          { text: '2', correct: true },
          { text: '3', correct: false }
        ]
      },
      {
        question: 'Which ocean is the largest?',
        options: [
          { text: 'Atlantic Ocean', correct: false },
          { text: 'Indian Ocean', correct: false },
          { text: 'Arctic Ocean', correct: false },
          { text: 'Pacific Ocean', correct: true }
        ]
      },
      {
        question: 'Who painted the Mona Lisa?',
        options: [
          { text: 'Vincent van Gogh', correct: false },
          { text: 'Pablo Picasso', correct: false },
          { text: 'Leonardo da Vinci', correct: true },
          { text: 'Michelangelo', correct: false }
        ]
      },
      {
        question: 'What is the speed of light in vacuum (approximately)?',
        options: [
          { text: '300,000 km/s', correct: true },
          { text: '150,000 km/s', correct: false },
          { text: '500,000 km/s', correct: false },
          { text: '1,000,000 km/s', correct: false }
        ]
      },
      {
        question: 'Which element has the atomic number 1?',
        options: [
          { text: 'Helium', correct: false },
          { text: 'Hydrogen', correct: true },
          { text: 'Lithium', correct: false },
          { text: 'Carbon', correct: false }
        ]
      },
      {
        question: 'What is the largest organ in the human body?',
        options: [
          { text: 'Heart', correct: false },
          { text: 'Liver', correct: false },
          { text: 'Brain', correct: false },
          { text: 'Skin', correct: true }
        ]
      }
    ];

    for (const q of sampleQuestions) {
      db.run('INSERT INTO questions (question_text) VALUES (?)', [q.question]);
      const result = db.exec('SELECT last_insert_rowid()');
      const questionId = result[0].values[0][0];

      for (const opt of q.options) {
        db.run(
          'INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
          [questionId, opt.text, opt.correct ? 1 : 0]
        );
      }
    }
    console.log(`Seeded ${sampleQuestions.length} sample questions`);
  }
}

export function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export function getDb() {
  return db;
}

// Helper function to run a query and return results as objects
export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper function to run a single row query
export function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper function to run an insert/update/delete
export function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

// Get the last inserted row id
export function lastInsertRowId() {
  const result = db.exec('SELECT last_insert_rowid()');
  return result[0].values[0][0];
}
