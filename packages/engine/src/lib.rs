use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use rand::prelude::*;
use rand::rngs::SmallRng;
use rand_distr::{Normal, Distribution};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct YearlyData {
    pub year: i32,
    pub monthly_pmt: f64,
    pub yearly_invested_nominal: f64,
    pub nominal_interest: f64,
    pub nominal_balance: f64,
    pub real_balance: f64,
    pub total_invested_nominal: f64,
    pub total_invested_real: f64,
    pub net_profit: f64,
    pub tax_shield: f64,
    pub tax_paid: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CalculationResult {
    pub nominal_balance: f64,
    pub real_balance: f64,
    pub total_invested_nominal: f64,
    pub total_invested_real: f64,
    pub base_invested: f64,
    pub net_profit: f64,
    pub tax_shield: f64,
    pub tax_paid_core: f64,
    pub tax_paid_sat: f64,
    pub tax_paid_bonds: f64,
    pub yearly_data: Vec<YearlyData>,
    pub bankrupt_age: Option<i32>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ScenarioResult {
    pub title: String,
    pub description: String,
    pub core_pct: f64,
    pub sat_pct: f64,
    pub bonds_pct: f64,
    pub initial_core_pmt: f64,
    pub initial_sat_pmt: f64,
    pub initial_bonds_pmt: f64,
    pub total_invested_nominal: f64,
    pub total_invested_real: f64,
    pub total_base_invested: f64,
    pub total_step_up_invested: f64,
    pub final_nominal: f64,
    pub final_real: f64,
    pub nominal_profit: f64,
    pub real_profit: f64,
    pub net_profit: f64,
    pub tax_shield: f64,
    pub tax_paid_core: f64,
    pub tax_paid_sat: f64,
    pub tax_paid_bonds: f64,
    pub yearly_data: Vec<YearlyData>,
    pub color_class_light: String,
    pub color_class_dark: String,
    pub bankrupt_age: Option<i32>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MonteCarloPoint {
    pub year: i32,
    pub p10: f64,
    pub p50: f64,
    pub p90: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MonteCarloSummary {
    pub points: Vec<MonteCarloPoint>,
    pub success_rate: f64, 
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputParams {
    pub monthly_contribution: f64,
    pub current_age: i32,
    pub retirement_age: i32,
    pub inflation_rate: f64,
    pub annual_step_up: f64,
    pub core_rate: f64,
    pub sat_rate: f64,
    pub bonds_rate: f64,
    pub is_core_ike: bool,
    pub is_sat_ike: bool,
    pub is_bonds_ike: bool,
    pub monthly_withdrawal: f64,
    pub withdrawal_years: i32,
    // --- Monte Carlo ---
    pub core_volatility: f64,
    pub sat_volatility: f64,
    pub bonds_volatility: f64,
    pub iterations: i32,
    pub rebalancing_strategy: i32, // 0: None, 1: Annual
}

const IKE_LIMIT_2026: f64 = 26000.0;

fn calculate_scenario_data_internal(
    initial_pmt: f64,
    nominal_rate: f64,
    real_rate: f64,
    years: i32,
    params: &InputParams,
    monthly_withdrawal_amount: f64,
    is_ike: bool,
) -> CalculationResult {
    let mut nominal_balance: f64 = 0.0;
    let mut real_balance: f64 = 0.0;
    let mut current_pmt = initial_pmt;
    
    let mut total_invested_nominal: f64 = 0.0;
    let mut total_invested_real: f64 = 0.0;
    
    let rate_annual_nominal = nominal_rate / 100.0;
    let rate_annual_real = real_rate / 100.0;

    let nominal_monthly_rate = rate_annual_nominal / 12.0;
    let real_monthly_rate = rate_annual_real / 12.0;

    let total_years = years + params.withdrawal_years;
    let mut yearly_data = Vec::with_capacity(total_years as usize);
    let mut bankrupt_age: Option<i32> = None;

    for y in 1..=total_years {
        let is_decumulation = y > years;
        let mut yearly_invested_nominal = 0.0;
        let mut yearly_nominal_interest = 0.0;
        
        let mut monthly_pmt_record = 0.0;

        if !is_decumulation {
            monthly_pmt_record = current_pmt;
        } else {
            monthly_pmt_record = -monthly_withdrawal_amount;
        }
        
        for m in 1..=12 {
            let total_months = (y - 1) * 12 + m;
            let current_inflation_factor = f64::powf(1.0 + params.inflation_rate / 100.0, (total_months as f64) / 12.0);
            
            let monthly_nominal_interest = nominal_balance * nominal_monthly_rate;
            let monthly_real_interest = real_balance * real_monthly_rate;
            
            yearly_nominal_interest += monthly_nominal_interest;

            if is_decumulation {
                let withdrawal_nominal = monthly_withdrawal_amount.abs() * current_inflation_factor;
                let withdrawal_real = monthly_withdrawal_amount.abs();

                nominal_balance += monthly_nominal_interest - withdrawal_nominal;
                real_balance += monthly_real_interest - withdrawal_real;
                
                if nominal_balance < 0.0 {
                    nominal_balance = 0.0;
                    real_balance = 0.0;
                    if bankrupt_age.is_none() {
                        bankrupt_age = Some(params.current_age + y);
                    }
                }
            } else {
                let real_pmt = current_pmt / current_inflation_factor;
                nominal_balance += monthly_nominal_interest + current_pmt;
                real_balance += monthly_real_interest + real_pmt;
                
                total_invested_nominal += current_pmt;
                total_invested_real += real_pmt;
                yearly_invested_nominal += current_pmt;
            }
        }
        
        let total_profit_so_far = nominal_balance - total_invested_nominal;
        let base_tax = if total_profit_so_far > 0.0 { total_profit_so_far * 0.19 } else { 0.0 };
        let tax_shield = if is_ike { base_tax } else { 0.0 };
        let net_profit = if is_ike { total_profit_so_far } else { total_profit_so_far - base_tax };
        
        yearly_data.push(YearlyData {
            year: y,
            monthly_pmt: monthly_pmt_record,
            yearly_invested_nominal,
            nominal_interest: yearly_nominal_interest,
            nominal_balance,
            real_balance,
            total_invested_nominal,
            total_invested_real,
            net_profit,
            tax_shield,
            tax_paid: if is_ike { 0.0 } else { base_tax },
        });

        if !is_decumulation {
            current_pmt *= 1.0 + params.annual_step_up / 100.0;
        }
    }
    
    let base_invested = initial_pmt * 12.0 * (years as f64);
    let total_profit = nominal_balance - total_invested_nominal;
    let base_tax = if total_profit > 0.0 { total_profit * 0.19 } else { 0.0 };
    let tax_shield = if is_ike { base_tax } else { 0.0 };
    let net_profit = if is_ike { total_profit } else { total_profit - base_tax };

    CalculationResult {
        nominal_balance,
        real_balance,
        total_invested_nominal,
        total_invested_real,
        base_invested,
        net_profit,
        tax_shield,
        tax_paid_core: if is_ike { 0.0 } else { base_tax },
        tax_paid_sat: 0.0,
        tax_paid_bonds: 0.0,
        yearly_data,
        bankrupt_age,
    }
}

fn generate_scenario_internal(
    title: String,
    description: String,
    core_pct: f64,
    sat_pct: f64,
    bonds_pct: f64,
    color_class_light: String,
    color_class_dark: String,
    params: &InputParams,
) -> ScenarioResult {
    let mut initial_core_pmt = params.monthly_contribution * (core_pct / 100.0);
    let mut initial_sat_pmt = params.monthly_contribution * (sat_pct / 100.0);
    let mut initial_bonds_pmt = params.monthly_contribution * (bonds_pct / 100.0);

    // --- Proportional Capping for IKE Limit ---
    let mut ike_sum_pmt = 0.0;
    if params.is_core_ike { ike_sum_pmt += initial_core_pmt; }
    if params.is_sat_ike { ike_sum_pmt += initial_sat_pmt; }
    if params.is_bonds_ike { ike_sum_pmt += initial_bonds_pmt; }

    let monthly_ike_limit = IKE_LIMIT_2026 / 12.0;

    if ike_sum_pmt > monthly_ike_limit {
        let reduction_factor = monthly_ike_limit / ike_sum_pmt;
        if params.is_core_ike { initial_core_pmt *= reduction_factor; }
        if params.is_sat_ike { initial_sat_pmt *= reduction_factor; }
        if params.is_bonds_ike { initial_bonds_pmt *= reduction_factor; }
    }

    let nominal_core_rate = params.core_rate + params.inflation_rate;
    let nominal_sat_rate = params.sat_rate + params.inflation_rate;
    let nominal_bonds_rate = params.bonds_rate + params.inflation_rate;
    
    let years = params.retirement_age - params.current_age;
    let years = if years < 1 { 1 } else { years };

    let mut accum_params = params.clone();
    accum_params.withdrawal_years = 0;

    let core_data = calculate_scenario_data_internal(
        initial_core_pmt, nominal_core_rate, params.core_rate, years, &accum_params, 0.0, params.is_core_ike
    );
    let sat_data = calculate_scenario_data_internal(
        initial_sat_pmt, nominal_sat_rate, params.sat_rate, years, &accum_params, 0.0, params.is_sat_ike
    );
    let bonds_data = calculate_scenario_data_internal(
        initial_bonds_pmt, nominal_bonds_rate, params.bonds_rate, years, &accum_params, 0.0, params.is_bonds_ike
    );
    
    let total_invested_nominal = core_data.total_invested_nominal + sat_data.total_invested_nominal + bonds_data.total_invested_nominal;
    let total_invested_real = core_data.total_invested_real + sat_data.total_invested_real + bonds_data.total_invested_real;
    let total_base_invested = core_data.base_invested + sat_data.base_invested + bonds_data.base_invested;
    let total_step_up_invested = total_invested_nominal - total_base_invested;

    let total_years = years + params.withdrawal_years;
    let mut yearly_data = Vec::with_capacity(total_years as usize);

    for idx in 0..years as usize {
        let cd = &core_data.yearly_data[idx];
        let sd = &sat_data.yearly_data[idx];
        let bd = &bonds_data.yearly_data[idx];
        yearly_data.push(YearlyData {
            year: cd.year,
            monthly_pmt: cd.monthly_pmt + sd.monthly_pmt + bd.monthly_pmt,
            yearly_invested_nominal: cd.yearly_invested_nominal + sd.yearly_invested_nominal + bd.yearly_invested_nominal,
            nominal_interest: cd.nominal_interest + sd.nominal_interest + bd.nominal_interest,
            nominal_balance: cd.nominal_balance + sd.nominal_balance + bd.nominal_balance,
            real_balance: cd.real_balance + sd.real_balance + bd.real_balance,
            total_invested_nominal: cd.total_invested_nominal + sd.total_invested_nominal + bd.total_invested_nominal,
            total_invested_real: cd.total_invested_real + sd.total_invested_real + bd.total_invested_real,
            net_profit: cd.net_profit + sd.net_profit + bd.net_profit,
            tax_shield: cd.tax_shield + sd.tax_shield + bd.tax_shield,
            tax_paid: cd.tax_paid + sd.tax_paid + bd.tax_paid,
        });
    }

    // === FAZA DEKUMULACJI: 3-składnikowy rebalancing ===
    let mut core_nom = core_data.nominal_balance;
    let mut sat_nom = sat_data.nominal_balance;
    let mut bonds_nom = bonds_data.nominal_balance;
    let mut core_real = core_data.real_balance;
    let mut sat_real = sat_data.real_balance;
    let mut bonds_real = bonds_data.real_balance;

    let core_nom_monthly_rate = nominal_core_rate / 100.0 / 12.0;
    let sat_nom_monthly_rate = nominal_sat_rate / 100.0 / 12.0;
    let bonds_nom_monthly_rate = nominal_bonds_rate / 100.0 / 12.0;
    let core_real_monthly_rate = params.core_rate / 100.0 / 12.0;
    let sat_real_monthly_rate = params.sat_rate / 100.0 / 12.0;
    let bonds_real_monthly_rate = params.bonds_rate / 100.0 / 12.0;

    let monthly_withdrawal = params.monthly_withdrawal.abs();
    let mut bankrupt_age: Option<i32> = None;
    let mut total_tax_paid_core = core_data.tax_paid_core;
    let mut total_tax_paid_sat = sat_data.tax_paid_core; // Sub-calc returns in _core field
    let mut total_tax_paid_bonds = bonds_data.tax_paid_core;

    for y in 1..=params.withdrawal_years {
        let actual_year = years + y;
        let mut yearly_nominal_interest = 0.0;
        let mut yearly_tax_shield = 0.0;
        let mut yearly_net_profit = 0.0;
        let mut yearly_tax_paid_core = 0.0;
        let mut yearly_tax_paid_sat = 0.0;
        let mut yearly_tax_paid_bonds = 0.0;

        for m in 1..=12 {
            if bankrupt_age.is_some() { break; }

            let total_months = (actual_year - 1) * 12 + m;
            let inflation_factor = f64::powf(1.0 + params.inflation_rate / 100.0, (total_months as f64) / 12.0);

            // 1. Odsetki nominalne
            let c_int_nom = core_nom * core_nom_monthly_rate;
            let s_int_nom = sat_nom * sat_nom_monthly_rate;
            let b_int_nom = bonds_nom * bonds_nom_monthly_rate;
            
            // 2. Podatek Belki (tylko jeśli nie IKE)
            let c_tax = if params.is_core_ike { 0.0 } else { c_int_nom * 0.19 };
            let s_tax = if params.is_sat_ike { 0.0 } else { s_int_nom * 0.19 };
            let b_tax = if params.is_bonds_ike { 0.0 } else { b_int_nom * 0.19 };
            
            yearly_tax_shield += (if params.is_core_ike { c_int_nom * 0.19 } else { 0.0 })
                               + (if params.is_sat_ike { s_int_nom * 0.19 } else { 0.0 })
                               + (if params.is_bonds_ike { b_int_nom * 0.19 } else { 0.0 });
            
            let c_t_paid = if !params.is_core_ike { c_int_nom * 0.19 } else { 0.0 };
            let s_t_paid = if !params.is_sat_ike { s_int_nom * 0.19 } else { 0.0 };
            let b_t_paid = if !params.is_bonds_ike { b_int_nom * 0.19 } else { 0.0 };

            total_tax_paid_core += c_t_paid;
            total_tax_paid_sat += s_t_paid;
            total_tax_paid_bonds += b_t_paid;
            
            yearly_tax_paid_core += c_t_paid;
            yearly_tax_paid_sat += s_t_paid;
            yearly_tax_paid_bonds += b_t_paid;

            core_nom += c_int_nom - c_tax;
            sat_nom += s_int_nom - s_tax;
            bonds_nom += b_int_nom - b_tax;
            
            yearly_nominal_interest += c_int_nom + s_int_nom + b_int_nom;

            // Real
            let c_int_real = core_real * core_real_monthly_rate;
            let s_int_real = sat_real * sat_real_monthly_rate;
            let b_int_real = bonds_real * bonds_real_monthly_rate;
            core_real += c_int_real;
            sat_real += s_int_real;
            bonds_real += b_int_real;

            // 3. Wypłata
            let withdrawal_nominal = monthly_withdrawal * inflation_factor;
            let withdrawal_real = monthly_withdrawal;
            let total_nom = core_nom + sat_nom + bonds_nom;
            let total_rl = core_real + sat_real + bonds_real;

            if total_nom <= withdrawal_nominal {
                core_nom = 0.0; sat_nom = 0.0; bonds_nom = 0.0;
                core_real = 0.0; sat_real = 0.0; bonds_real = 0.0;
                bankrupt_age = Some(params.current_age + actual_year);
            } else {
                let cw = core_nom / total_nom;
                let sw = sat_nom / total_nom;
                let bw = bonds_nom / total_nom;
                core_nom -= withdrawal_nominal * cw;
                sat_nom -= withdrawal_nominal * sw;
                bonds_nom -= withdrawal_nominal * bw;

                if total_rl > 0.0 {
                    let rcw = core_real / total_rl;
                    let rsw = sat_real / total_rl;
                    let rbw = bonds_real / total_rl;
                    core_real -= withdrawal_real * rcw;
                    sat_real -= withdrawal_real * rsw;
                    bonds_real -= withdrawal_real * rbw;
                }
            }
        }

        let combined_nom = core_nom + sat_nom + bonds_nom;
        let combined_real = core_real + sat_real + bonds_real;
        yearly_net_profit = combined_nom - total_invested_nominal;

        yearly_data.push(YearlyData {
            year: actual_year,
            monthly_pmt: -monthly_withdrawal,
            yearly_invested_nominal: 0.0,
            nominal_interest: yearly_nominal_interest,
            nominal_balance: combined_nom.max(0.0),
            real_balance: combined_real.max(0.0),
            total_invested_nominal,
            total_invested_real,
            net_profit: yearly_net_profit,
            tax_shield: yearly_tax_shield,
            tax_paid: yearly_tax_paid_core + yearly_tax_paid_sat + yearly_tax_paid_bonds, // Main yearly value remains as sum
        });
    }

    let final_nominal = (core_nom + sat_nom + bonds_nom).max(0.0);
    let final_real = (core_real + sat_real + bonds_real).max(0.0);
    let nominal_profit = final_nominal - total_invested_nominal;
    let real_profit = final_real - total_invested_real;
    
    // Summary total profit tax shield
    let tax_shield = if nominal_profit > 0.0 { nominal_profit * 0.19 } else { 0.0 };

    ScenarioResult {
        title, description, core_pct, sat_pct, bonds_pct,
        initial_core_pmt, initial_sat_pmt, initial_bonds_pmt,
        total_invested_nominal, total_invested_real, total_base_invested, total_step_up_invested,
        final_nominal, final_real, nominal_profit, real_profit,
        net_profit: nominal_profit,
        tax_shield,
        tax_paid_core: total_tax_paid_core,
        tax_paid_sat: total_tax_paid_sat,
        tax_paid_bonds: total_tax_paid_bonds,
        yearly_data, color_class_light, color_class_dark, bankrupt_age,
    }
}

// --- LOGIKA STOCHASTYCZNA (MONTE CARLO) ---

fn get_monthly_random_return(annual_mean_pct: f64, annual_vol_pct: f64, rng: &mut impl Rng) -> f64 {
    let mu = annual_mean_pct / 100.0 / 12.0;
    let sigma = annual_vol_pct / 100.0 / f64::sqrt(12.0);
    let normal = Normal::new(0.0, 1.0).unwrap();
    let z = normal.sample(rng);
    
    // Uproszczony Random Walk: r = mu + sigma * Z
    mu + sigma * z
}

#[wasm_bindgen(js_name = generateMonteCarloData)]
pub fn generate_monte_carlo_data(params_val: JsValue, core_pct: f64, sat_pct: f64) -> Result<JsValue, JsValue> {
    let params: InputParams = serde_wasm_bindgen::from_value(params_val)?;
    let summary = run_monte_carlo_engine(params, core_pct, sat_pct);
    Ok(serde_wasm_bindgen::to_value(&summary)?)
}

pub fn run_monte_carlo_engine(params: InputParams, core_pct: f64, sat_pct: f64) -> MonteCarloSummary {
    let bonds_pct = 100.0 - core_pct - sat_pct;
    let years = (params.retirement_age - params.current_age).max(1);
    let total_years = years + params.withdrawal_years;
    
    let mut rng = SmallRng::from_entropy();
    
    // Store final balances for each iteration at each year milestone
    // Vec<year>[num_iterations]
    let mut year_milestones: Vec<Vec<f64>> = vec![Vec::with_capacity(params.iterations as usize); total_years as usize];
    let mut bankrupt_counts = 0;

    for _ in 0..params.iterations {
        let mut core_nom = 0.0;
        let mut sat_nom = 0.0;
        let mut bonds_nom = 0.0;
        let mut core_base = 0.0; // Pula kosztowa (wpłaty + rebalans)
        let mut sat_base = 0.0;
        let mut bonds_base = 0.0;
        
        let mut current_monthly_pmt = params.monthly_contribution;
        let mut is_bankrupt = false;

        for y in 1..=total_years {
            let is_decumulation = y > years;
            
            // Roczny Rebalancing (na początku roku symulacji, jeśli nie rok 1)
            if params.rebalancing_strategy == 1 && y > 1 && !is_bankrupt {
                let total_nom = core_nom + sat_nom + bonds_nom;
                if total_nom > 0.0 {
                    // Core
                    let target_core = total_nom * (core_pct / 100.0);
                    let diff_core = core_nom - target_core;
                    if diff_core > 0.0 && !params.is_core_ike {
                        let profit_ratio = if core_nom > 0.0 { (core_nom - core_base).max(0.0) / core_nom } else { 0.0 };
                        let tax = diff_core * profit_ratio * 0.19;
                        core_nom -= tax;
                    }
                    
                    // Sat
                    let target_sat = total_nom * (sat_pct / 100.0);
                    let diff_sat = sat_nom - target_sat;
                    if diff_sat > 0.0 && !params.is_sat_ike {
                        let profit_ratio = if sat_nom > 0.0 { (sat_nom - sat_base).max(0.0) / sat_nom } else { 0.0 };
                        let tax = diff_sat * profit_ratio * 0.19;
                        sat_nom -= tax;
                    }

                    // Bonds
                    let target_bonds = total_nom * (bonds_pct / 100.0);
                    let diff_bonds = bonds_nom - target_bonds;
                    if diff_bonds > 0.0 && !params.is_bonds_ike {
                        let profit_ratio = if bonds_nom > 0.0 { (bonds_nom - bonds_base).max(0.0) / bonds_nom } else { 0.0 };
                        let tax = diff_bonds * profit_ratio * 0.19;
                        bonds_nom -= tax;
                    }

                    // Wykonaj twardy przydział wg wag po potrąceniu podatków (pula się lekko kurczy)
                    let new_total = core_nom + sat_nom + bonds_nom;
                    core_nom = new_total * (core_pct / 100.0);
                    sat_nom = new_total * (sat_pct / 100.0);
                    bonds_nom = new_total * (bonds_pct / 100.0);
                    
                    // Reset bazy kosztowej po rebalansingu
                    core_base = core_nom;
                    sat_base = sat_nom;
                    bonds_base = bonds_nom;
                }
            }

            for _m in 1..=12 {
                if is_bankrupt { break; }
                
                // 1. Losowe stopy
                let r_core = get_monthly_random_return(params.core_rate + params.inflation_rate, params.core_volatility, &mut rng);
                let r_sat = get_monthly_random_return(params.sat_rate + params.inflation_rate, params.sat_volatility, &mut rng);
                let r_bonds = get_monthly_random_return(params.bonds_rate + params.inflation_rate, params.bonds_volatility, &mut rng);

                // 2. Naliczenie odsetek nominalnych
                core_nom *= 1.0 + r_core;
                sat_nom *= 1.0 + r_sat;
                bonds_nom *= 1.0 + r_bonds;

                // 3. Przepływy
                if !is_decumulation {
                    let p_core = current_monthly_pmt * (core_pct / 100.0);
                    let p_sat = current_monthly_pmt * (sat_pct / 100.0);
                    let p_bonds = current_monthly_pmt * (bonds_pct / 100.0);
                    
                    core_nom += p_core;
                    sat_nom += p_sat;
                    bonds_nom += p_bonds;
                    
                    core_base += p_core;
                    sat_base += p_sat;
                    bonds_base += p_bonds;
                } else {
                    let total_n = core_nom + sat_nom + bonds_nom;
                    let withdrawal = params.monthly_withdrawal.abs();
                    
                    if total_n <= withdrawal {
                        core_nom = 0.0; sat_nom = 0.0; bonds_nom = 0.0;
                        is_bankrupt = true;
                        bankrupt_counts += 1;
                    } else {
                        let cw = core_nom / total_n;
                        let sw = sat_nom / total_n;
                        let bw = bonds_nom / total_n;
                        core_nom -= withdrawal * cw;
                        sat_nom -= withdrawal * sw;
                        bonds_nom -= withdrawal * bw;
                    }
                }
            }

            year_milestones[(y - 1) as usize].push((core_nom + sat_nom + bonds_nom).max(0.0));
            if !is_decumulation {
                current_monthly_pmt *= 1.0 + params.annual_step_up / 100.0;
            }
        }
    }

    // Agregacja percentyli
    let points: Vec<MonteCarloPoint> = year_milestones.iter().enumerate().map(|(i, values)| {
        let mut sorted = values.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        
        let len = sorted.len();
        MonteCarloPoint {
            year: (i + 1) as i32,
            p10: sorted[(len as f64 * 0.1) as usize],
            p50: sorted[(len as f64 * 0.5) as usize],
            p90: sorted[(len as f64 * 0.9) as usize],
        }
    }).collect();

    MonteCarloSummary {
        points,
        success_rate: 1.0 - (bankrupt_counts as f64 / params.iterations as f64),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rebalancing_tax_impact() {
        let mut params = InputParams {
            monthly_contribution: 1000.0,
            current_age: 30,
            retirement_age: 40,
            inflation_rate: 0.0,
            annual_step_up: 0.0,
            core_rate: 10.0, // Wysoki zysk dla testu dryfu
            sat_rate: 50.0,
            bonds_rate: 2.0,
            is_core_ike: false,
            is_sat_ike: false,
            is_bonds_ike: false,
            monthly_withdrawal: 0.0,
            withdrawal_years: 0,
            core_volatility: 0.0, // Wyłączamy zmienność dla deterministycznego testu rebalansu
            sat_volatility: 0.0,
            bonds_volatility: 0.0,
            iterations: 1,
            rebalancing_strategy: 1, // Twardy rebalans
        };

        // Test 1: Zwykłe konto (Powinien zapłacić podatek od dryfu krypto)
        let summary_taxable = run_monte_carlo_engine(params.clone(), 50.0, 50.0);
        
        // Test 2: IKE (Brak podatku od dryfu)
        params.is_core_ike = true;
        params.is_sat_ike = true;
        let summary_ike = run_monte_carlo_engine(params, 50.0, 50.0);

        // IKE powinno mieć więcej pieniędzy
        assert!(summary_ike.points.last().unwrap().p50 > summary_taxable.points.last().unwrap().p50);
    }
}

#[wasm_bindgen(js_name = generateMultipleScenarios)]
pub fn generate_multiple_scenarios(params_val: JsValue, custom_core_pct: f64, custom_sat_pct: f64) -> Result<JsValue, JsValue> {
    let params: InputParams = serde_wasm_bindgen::from_value(params_val)?;
    let custom_bonds_pct = 100.0 - custom_core_pct - custom_sat_pct;
    
    let scenarios = vec![
        generate_scenario_internal(
            "100% Świat".into(), "Tylko globalny rdzeń (VWCE).".into(),
            100.0, 0.0, 0.0,
            "bg-slate-100 border-slate-300 text-slate-800".into(),
            "bg-slate-800 border-slate-700 text-slate-100".into(), &params
        ),
        generate_scenario_internal(
            "Złoty Środek".into(), "Balans: 60% Akcje, 20% Krypto, 20% EDO.".into(),
            60.0, 20.0, 20.0,
            "bg-blue-50 border-blue-300 text-blue-900".into(),
            "bg-blue-900/30 border-blue-700 text-blue-100".into(), &params
        ),
        generate_scenario_internal(
            "Mocne Uderzenie".into(), "Agresywne krypto (40%) i świat (60%).".into(),
            60.0, 40.0, 0.0,
            "bg-amber-50 border-amber-300 text-amber-900".into(),
            "bg-amber-900/30 border-amber-700 text-amber-100".into(), &params
        ),
        generate_scenario_internal(
            "Twój Własny".into(), "Portfel dopasowany suwakami.".into(),
            custom_core_pct, custom_sat_pct, custom_bonds_pct,
            "bg-emerald-50 border-emerald-300 text-emerald-900".into(),
            "bg-emerald-900/30 border-emerald-700 text-emerald-100".into(), &params
        ),
    ];
    
    Ok(serde_wasm_bindgen::to_value(&scenarios)?)
}
