import { PGlite } from '@electric-sql/pglite';

let dbInstance: PGlite | null = null;

export const getDb = async () => {
  if (dbInstance) return dbInstance;
  
  dbInstance = new PGlite('idb://ike_simulator_02');
  
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS saved_portfolios (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      monthly_contribution REAL NOT NULL,
      current_age INTEGER NOT NULL,
      retirement_age INTEGER NOT NULL,
      maximize_ike_limit BOOLEAN NOT NULL DEFAULT FALSE,
      inflation_rate REAL NOT NULL,
      annual_step_up REAL NOT NULL,
      core_rate REAL NOT NULL,
      sat_rate REAL NOT NULL,
      custom_core_pct REAL NOT NULL,
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
  maximize_ike_limit: boolean;
  inflation_rate: number;
  annual_step_up: number;
  core_rate: number;
  sat_rate: number;
  custom_core_pct: number;
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
      name, monthly_contribution, current_age, retirement_age, maximize_ike_limit, inflation_rate, annual_step_up, core_rate, sat_rate, custom_core_pct
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      name, 
      params.monthly_contribution, params.current_age, params.retirement_age, params.maximize_ike_limit, params.inflation_rate, 
      params.annual_step_up, params.core_rate, params.sat_rate, params.custom_core_pct
    ]
  );
};
