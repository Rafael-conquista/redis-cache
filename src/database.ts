import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database;

export const connectDB = async () => {
  try{
        db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database,
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
            )
        `);

        console.log('📦 Banco de dados conectado e tabelas criadas');
  }catch(e:any){
        console.log(e)
  }
        
};

export const getDB = () => {
  if (!db) {
    throw new Error('Banco de dados não conectado!');
  }
  return db;
};
