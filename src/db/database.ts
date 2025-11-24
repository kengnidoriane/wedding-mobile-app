import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('wedding.db');

// Crée la table "guests" si elle n’existe pas
export const initializeDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      tableName TEXT,
      companions INTEGER,
      isPresent INTEGER DEFAULT 0
    );
  `);
};

export default db;

// Ajouter un invité
export const addGuest = async (fullName: string, tableName: string, companions: number) => {
  await db.runAsync(
    'INSERT INTO guests (fullName, tableName, companions, isPresent) VALUES (?, ?, ?, ?)',
    [fullName, tableName, companions, 0]
  );
};

// Récupérer tous les invités
export const getAllGuests = async () => {
  const result = await db.getAllAsync('SELECT * FROM guests');
  return result;
};

// Supprimer un invité
export const deleteGuest = async (id: number) => {
  await db.runAsync('DELETE FROM guests WHERE id = ?', [id]);
};

// Marquer un invité comme présent
export const markGuestPresent = async (id: number) => {
  await db.runAsync('UPDATE guests SET isPresent = 1 WHERE id = ?', [id]);
};
