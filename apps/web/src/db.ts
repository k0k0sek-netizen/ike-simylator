import { PGlite } from '@electric-sql/pglite';

let dbInstance: PGlite | null = null;

export const getDb = async () => {
  if (dbInstance) return dbInstance;
  
  dbInstance = new PGlite('idb://ike_simulator_03');
  
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS saved_portfolios (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      monthly_contribution REAL NOT NULL,
      current_age INTEGER NOT NULL,
      retirement_age INTEGER NOT NULL,
      inflation_rate REAL NOT NULL,
      annual_step_up REAL NOT NULL,
      core_rate REAL NOT NULL,
      sat_rate REAL NOT NULL,
      bonds_rate REAL NOT NULL DEFAULT 1.5,
      is_core_ike BOOLEAN NOT NULL DEFAULT TRUE,
      is_sat_ike BOOLEAN NOT NULL DEFAULT TRUE,
      is_bonds_ike BOOLEAN NOT NULL DEFAULT FALSE,
      custom_core_weight REAL NOT NULL,
      custom_sat_weight REAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return dbInstance;
};

export interface SavedPortfolio {
  id: number;
  name: string;
  monthly_contribution: number;
  current_age: number;
  retirement_age: number;
  inflation_rate: number;
  annual_step_up: number;
  core_rate: number;
  sat_rate: number;
  bonds_rate: number;
  is_core_ike: boolean;
  is_sat_ike: boolean;
  is_bonds_ike: boolean;
  custom_core_weight: number;
  custom_sat_weight: number;
  created_at: string;
}

export const loadPortfolios = async (): Promise<SavedPortfolio[]> => {
  const db = await getDb();
  const res = await db.query('SELECT * FROM saved_portfolios ORDER BY id DESC');
  return res.rows as SavedPortfolio[];
};

export const savePortfolio = async (name: string, params: Omit<SavedPortfolio, 'id' | 'created_at' | 'name'>) => {
  const db = await getDb();
  await db.query(
    `INSERT INTO saved_portfolios (
      name, monthly_contribution, current_age, retirement_age, inflation_rate, annual_step_up, 
      core_rate, sat_rate, bonds_rate, is_core_ike, is_sat_ike, is_bonds_ike, custom_core_weight, custom_sat_weight
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      name, 
      params.monthly_contribution, params.current_age, params.retirement_age, 
      params.inflation_rate, params.annual_step_up, params.core_rate, params.sat_rate, 
      params.bonds_rate, params.is_core_ike, params.is_sat_ike, params.is_bonds_ike,
      params.custom_core_weight, params.custom_sat_weight
    ]
  );
};
