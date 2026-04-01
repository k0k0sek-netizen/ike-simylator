use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

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
    pub initial_core_pmt: f64,
    pub initial_sat_pmt: f64,
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
    pub yearly_data: Vec<YearlyData>,
    pub color_class_light: String,
    pub color_class_dark: String,
    pub bankrupt_age: Option<i32>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InputParams {
    pub monthly_contribution: f64,
    pub current_age: i32,
    pub retirement_age: i32,
    pub maximize_ike_limit: bool,
    pub inflation_rate: f64,
    pub annual_step_up: f64,
    pub core_rate: f64,
    pub sat_rate: f64,
    pub monthly_withdrawal: f64,
    pub withdrawal_years: i32,
}

const IKE_LIMIT_2026: f64 = 26000.0;

fn calculate_scenario_data_internal(
    initial_pmt: f64,
    nominal_rate: f64,
    real_rate: f64,
    years: i32,
    params: &InputParams,
    monthly_withdrawal_amount: f64,
    portion_weight: f64,
) -> CalculationResult {
    let mut nominal_balance: f64 = 0.0;
    let mut real_balance: f64 = 0.0;
    let mut current_pmt = initial_pmt;
    
    let mut total_invested_nominal: f64 = 0.0;
    let mut total_invested_real: f64 = 0.0;
    
    // rate_annual to natywny ułamek dziesiętny np. 0.15 z 15%
    let rate_annual_nominal = nominal_rate / 100.0;
    let rate_annual_real = real_rate / 100.0;

    // stopa miesięczna to rate_annual / 12.0
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
            let limit_for_portion = (IKE_LIMIT_2026 / 12.0) * portion_weight;
            if params.maximize_ike_limit {
                current_pmt = limit_for_portion;
            } else if current_pmt > limit_for_portion {
                current_pmt = limit_for_portion;
            }
            monthly_pmt_record = current_pmt;
        } else {
            monthly_pmt_record = -monthly_withdrawal_amount; // negative indicates withdrawal in data
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
        let tax_shield = if total_profit_so_far > 0.0 { total_profit_so_far * 0.19 } else { 0.0 };
        let net_profit = total_profit_so_far - tax_shield;
        
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
        });

        if !is_decumulation {
            current_pmt *= 1.0 + params.annual_step_up / 100.0;
        }
    }
    
    let base_invested = initial_pmt * 12.0 * (years as f64);
    
    let total_profit = nominal_balance - total_invested_nominal;
    let tax_shield = if total_profit > 0.0 { total_profit * 0.19 } else { 0.0 };
    let net_profit = total_profit - tax_shield;

    CalculationResult {
        nominal_balance,
        real_balance,
        total_invested_nominal,
        total_invested_real,
        base_invested,
        net_profit,
        tax_shield,
        yearly_data,
        bankrupt_age,
    }
}

fn generate_scenario_internal(
    title: String,
    description: String,
    core_pct: f64,
    sat_pct: f64,
    color_class_light: String,
    color_class_dark: String,
    params: &InputParams,
) -> ScenarioResult {
    let initial_core_pmt = params.monthly_contribution * (core_pct / 100.0);
    let initial_sat_pmt = params.monthly_contribution * (sat_pct / 100.0);

    let nominal_core_rate = params.core_rate + params.inflation_rate;
    let nominal_sat_rate = params.sat_rate + params.inflation_rate;
    
    let years = params.retirement_age - params.current_age;
    let years = if years < 1 { 1 } else { years };

    // === FAZA AKUMULACJI: osobne portfele (Core / Sat) ===
    // withdrawal_years = 0 aby obliczenia dotyczyły tylko akumulacji
    let mut accum_params = params.clone();
    accum_params.withdrawal_years = 0;

    let core_data = calculate_scenario_data_internal(
        initial_core_pmt, nominal_core_rate, params.core_rate, years, &accum_params, 0.0, core_pct / 100.0
    );
    
    let sat_data = calculate_scenario_data_internal(
        initial_sat_pmt, nominal_sat_rate, params.sat_rate, years, &accum_params, 0.0, sat_pct / 100.0
    );
    
    let total_invested_nominal = core_data.total_invested_nominal + sat_data.total_invested_nominal;
    let total_invested_real = core_data.total_invested_real + sat_data.total_invested_real;
    let total_base_invested = core_data.base_invested + sat_data.base_invested;
    let total_step_up_invested = total_invested_nominal - total_base_invested;

    // Buduj yearlyData fazy akumulacji (sumowanie Core+Sat)
    let total_years = years + params.withdrawal_years;
    let mut yearly_data = Vec::with_capacity(total_years as usize);

    for idx in 0..years as usize {
        let cd = &core_data.yearly_data[idx];
        let sd = &sat_data.yearly_data[idx];
        yearly_data.push(YearlyData {
            year: cd.year,
            monthly_pmt: cd.monthly_pmt + sd.monthly_pmt,
            yearly_invested_nominal: cd.yearly_invested_nominal + sd.yearly_invested_nominal,
            nominal_interest: cd.nominal_interest + sd.nominal_interest,
            nominal_balance: cd.nominal_balance + sd.nominal_balance,
            real_balance: cd.real_balance + sd.real_balance,
            total_invested_nominal: cd.total_invested_nominal + sd.total_invested_nominal,
            total_invested_real: cd.total_invested_real + sd.total_invested_real,
            net_profit: cd.net_profit + sd.net_profit,
            tax_shield: cd.tax_shield + sd.tax_shield,
        });
    }

    // === FAZA DEKUMULACJI: zunifikowana pętla z dynamicznym rebalancingiem ===
    let mut core_nom = core_data.nominal_balance;
    let mut sat_nom = sat_data.nominal_balance;
    let mut core_real = core_data.real_balance;
    let mut sat_real = sat_data.real_balance;

    let core_nom_monthly_rate = nominal_core_rate / 100.0 / 12.0;
    let sat_nom_monthly_rate = nominal_sat_rate / 100.0 / 12.0;
    let core_real_monthly_rate = params.core_rate / 100.0 / 12.0;
    let sat_real_monthly_rate = params.sat_rate / 100.0 / 12.0;

    let monthly_withdrawal = params.monthly_withdrawal.abs();
    let mut bankrupt_age: Option<i32> = None;

    for y in 1..=params.withdrawal_years {
        let actual_year = years + y;
        let mut yearly_nominal_interest = 0.0;

        for m in 1..=12 {
            // Jeśli już zbankrutowaliśmy, nie rób nic
            if bankrupt_age.is_some() {
                break;
            }

            let total_months = (actual_year - 1) * 12 + m;
            let inflation_factor = f64::powf(
                1.0 + params.inflation_rate / 100.0,
                (total_months as f64) / 12.0,
            );

            // 1. Nalicz odsetki osobno dla Core i Sat
            let core_interest_nom = core_nom * core_nom_monthly_rate;
            let sat_interest_nom = sat_nom * sat_nom_monthly_rate;
            let core_interest_real = core_real * core_real_monthly_rate;
            let sat_interest_real = sat_real * sat_real_monthly_rate;

            core_nom += core_interest_nom;
            sat_nom += sat_interest_nom;
            core_real += core_interest_real;
            sat_real += sat_interest_real;

            yearly_nominal_interest += core_interest_nom + sat_interest_nom;

            // 2. Oblicz wypłatę zwaloryzowaną o inflację
            let withdrawal_nominal = monthly_withdrawal * inflation_factor;
            let withdrawal_real = monthly_withdrawal;

            // 3. Sprawdź łączny dostępny kapitał
            let total_current_nominal = core_nom + sat_nom;
            let total_current_real = core_real + sat_real;

            if total_current_nominal <= withdrawal_nominal {
                // BANKRUCTWO — łączny kapitał nie pokrywa wypłaty
                core_nom = 0.0;
                sat_nom = 0.0;
                core_real = 0.0;
                sat_real = 0.0;
                bankrupt_age = Some(params.current_age + actual_year);
            } else {
                // 4. Dynamiczny rebalancing — wypłata proporcjonalna do bieżących wag
                let core_weight = core_nom / total_current_nominal;
                let sat_weight = sat_nom / total_current_nominal;

                core_nom -= withdrawal_nominal * core_weight;
                sat_nom -= withdrawal_nominal * sat_weight;

                // Rebalancing realny (te same wagi nominalne by utrzymać spójność)
                if total_current_real > 0.0 {
                    let real_core_w = core_real / total_current_real;
                    let real_sat_w = sat_real / total_current_real;
                    core_real -= withdrawal_real * real_core_w;
                    sat_real -= withdrawal_real * real_sat_w;
                }
            }
        }

        let combined_nominal = core_nom + sat_nom;
        let combined_real = core_real + sat_real;
        let total_profit = combined_nominal - total_invested_nominal;
        let tax_shield = if total_profit > 0.0 { total_profit * 0.19 } else { 0.0 };
        let net_profit_yr = total_profit - tax_shield;

        yearly_data.push(YearlyData {
            year: actual_year,
            monthly_pmt: -monthly_withdrawal,
            yearly_invested_nominal: 0.0,
            nominal_interest: yearly_nominal_interest,
            nominal_balance: combined_nominal.max(0.0),
            real_balance: combined_real.max(0.0),
            total_invested_nominal,
            total_invested_real,
            net_profit: net_profit_yr,
            tax_shield,
        });
    }

    // Końcowe wartości scenariusza
    let final_nominal = (core_nom + sat_nom).max(0.0);
    let final_real = (core_real + sat_real).max(0.0);
    
    let nominal_profit = final_nominal - total_invested_nominal;
    let real_profit = final_real - total_invested_real;
    
    let tax_shield = if nominal_profit > 0.0 { nominal_profit * 0.19 } else { 0.0 };
    let net_profit = nominal_profit - tax_shield;

    ScenarioResult {
        title,
        description,
        core_pct,
        sat_pct,
        initial_core_pmt,
        initial_sat_pmt,
        total_invested_nominal,
        total_invested_real,
        total_base_invested,
        total_step_up_invested,
        final_nominal,
        final_real,
        nominal_profit,
        real_profit,
        net_profit,
        tax_shield,
        yearly_data,
        color_class_light,
        color_class_dark,
        bankrupt_age,
    }
}

#[wasm_bindgen(js_name = generateMultipleScenarios)]
pub fn generate_multiple_scenarios(params_val: JsValue, custom_core_pct: f64) -> Result<JsValue, JsValue> {
    let params: InputParams = serde_wasm_bindgen::from_value(params_val)?;
    
    let scenarios = vec![
        generate_scenario_internal(
            "100% Nuda".into(),
            "Tylko globalny rdzeń (VWCE).".into(),
            100.0,
            0.0,
            "bg-slate-100 border-slate-300 text-slate-800".into(),
            "bg-slate-800 border-slate-700 text-slate-100".into(),
            &params
        ),
        generate_scenario_internal(
            "Złoty Środek".into(),
            "Balans strachu i chciwości.".into(),
            80.0,
            20.0,
            "bg-blue-50 border-blue-300 text-blue-900".into(),
            "bg-blue-900/30 border-blue-700 text-blue-100".into(),
            &params
        ),
        generate_scenario_internal(
            "Mocne Uderzenie".into(),
            "Agresywne krypto.".into(),
            70.0,
            30.0,
            "bg-amber-50 border-amber-300 text-amber-900".into(),
            "bg-amber-900/30 border-amber-700 text-amber-100".into(),
            &params
        ),
        generate_scenario_internal(
            "Twój Własny".into(),
            "Dostosuj suwakiem.".into(),
            custom_core_pct,
            100.0 - custom_core_pct,
            "bg-emerald-50 border-emerald-300 text-emerald-900".into(),
            "bg-emerald-900/30 border-emerald-700 text-emerald-100".into(),
            &params
        ),
    ];
    
    Ok(serde_wasm_bindgen::to_value(&scenarios)?)
}
