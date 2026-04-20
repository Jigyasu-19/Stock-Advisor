import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data.json');

// Initialize the file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify({ users: {}, recommendations: [], portfolio: [] }, null, 2)
  );
}

const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

export const saveUserProfile = async (userId, data) => {
  const db = readDB();
  const existing = db.users[userId] || {};
  const updated = { ...existing, ...data, _id: userId, updatedAt: new Date().toISOString() };
  db.users[userId] = updated;
  writeDB(db);
  return updated;
};

export const getUserProfile = async (userId) => {
  const db = readDB();
  return db.users[userId] || null;
};

export const saveRecommendation = async (data) => {
  const db = readDB();
  const rec = { _id: uuidv4(), ...data, createdAt: new Date().toISOString() };
  db.recommendations.push(rec);
  writeDB(db);
  return rec;
};

export const getRecommendations = async (userId) => {
  const db = readDB();
  let recs = db.recommendations.reverse();
  if (userId) recs = recs.filter((r) => r.userId === userId);
  return recs;
};

export const savePortfolioHolding = async ({ userId, stockSymbol, quantity, buyPrice }) => {
  const db = readDB();
  const symbol = String(stockSymbol || '').toUpperCase().trim();
  
  let existingIndex = db.portfolio.findIndex(
    (p) => p.userId === userId && p.stockSymbol === symbol
  );

  let updatedHolding;
  if (existingIndex > -1) {
    db.portfolio[existingIndex] = {
      ...db.portfolio[existingIndex],
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
      updatedAt: new Date().toISOString(),
    };
    updatedHolding = db.portfolio[existingIndex];
  } else {
    updatedHolding = {
      _id: uuidv4(),
      userId,
      stockSymbol: symbol,
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
      createdAt: new Date().toISOString(),
    };
    db.portfolio.push(updatedHolding);
  }

  // Add to user's portfolio array
  if (!db.users[userId]) db.users[userId] = { _id: userId, portfolio: [] };
  if (!db.users[userId].portfolio) db.users[userId].portfolio = [];
  if (!db.users[userId].portfolio.includes(updatedHolding._id)) {
    db.users[userId].portfolio.push(updatedHolding._id);
  }

  writeDB(db);
  return updatedHolding;
};

export const getPortfolio = async (userId) => {
  const db = readDB();
  return db.portfolio.filter((p) => p.userId === userId);
};
