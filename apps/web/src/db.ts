import { PGlite } from '@electric-sql/pglite';

let dbInstance: PGlite | null = null;

export const getDb = async () => {
  if (dbInstance) return dbInstance;
  
  // Nowa wersja bazy dla Iteracji 27 (3-filarowa)
  dbInstance = new PGlite('idb://ike_simulator_v27');
  
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
      bonds_rate REAL NOT NULL,
      is_core_ike BOOLEAN NOT NULL,
      is_sat_ike BOOLEAN NOT NULL,
      is_bonds_ike BOOLEAN NOT NULL,
      custom_core_weight REAL NOT NULL,
      custom_sat_weight REAL NOT NULL,
      custom_bonds_weight REAL NOT NULL,
      final_nominal REAL NOT NULL,
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
  custom_bonds_weight: number;
  final_nominal: number;
  created_at: string;
}

export const loadPortfolios = async (): Promise<SavedPortfolio[]> => {
  try {
    const db = await getDb();
    const res = await db.query('SELECT * FROM saved_portfolios ORDER BY created_at DESC');
    return res.rows as SavedPortfolio[];
  } catch (e) {
    console.error('Błąd ładowania portfeli:', e);
    return [];
  }
};

export const savePortfolio = async (name: string, params: Omit<SavedPortfolio, 'id' | 'created_at' | 'name'>) => {
  const db = await getDb();
  await db.query(
    `INSERT INTO saved_portfolios (
      name, monthly_contribution, current_age, retirement_age, inflation_rate, annual_step_up, 
      core_rate, sat_rate, bonds_rate, is_core_ike, is_sat_ike, is_bonds_ike, 
      custom_core_weight, custom_sat_weight, custom_bonds_weight, final_nominal
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      name, 
      params.monthly_contribution, params.current_age, params.retirement_age, 
      params.inflation_rate, params.annual_step_up, params.core_rate, params.sat_rate, 
      params.bonds_rate, params.is_core_ike, params.is_sat_ike, params.is_bonds_ike,
      params.custom_core_weight, params.custom_sat_weight, params.custom_bonds_weight, params.final_nominal
    ]
  );
};

export const deletePortfolio = async (id: number) => {
  const db = await getDb();
  await db.query('DELETE FROM saved_portfolios WHERE id = $1', [id]);
};
