#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_monte_carlo_tax_impact() {
        let mut params = InputParams {
            monthly_contribution: 1000.0,
            current_age: 30,
            retirement_age: 60,
            inflation_rate: 0.0, // Dla uproszczenia
            annual_step_up: 0.0,
            core_rate: 10.0,
            sat_rate: 10.0,
            bonds_rate: 10.0,
            is_core_ike: true,
            is_sat_ike: true,
            is_bonds_ike: true,
            monthly_withdrawal: 0.0,
            withdrawal_years: 0,
            core_volatility: 50.0, // Duża zmienność wymusza rebalancing
            sat_volatility: 50.0,
            bonds_volatility: 50.0,
            iterations: 100,
            rebalancing_strategy: 1, // Twardy rebalancing
        };

        // 1. Scenariusz IKE
        let result_ike = run_monte_carlo_engine(params.clone(), 33.3, 33.3);
        let final_p50_ike = result_ike.points.last().unwrap().p50;

        // 2. Scenariusz Belka
        params.is_core_ike = false;
        params.is_sat_ike = false;
        params.is_bonds_ike = false;
        let result_belka = run_monte_carlo_engine(params.clone(), 33.3, 33.3);
        let final_p50_belka = result_belka.points.last().unwrap().p50;

        println!("IKE P50: {}, Belka P50: {}", final_p50_ike, final_p50_belka);
        
        // Różnica musi być znacząca przy 30 latach i podatku Belki od dryfu
        assert!(final_p50_ike > final_p50_belka, "IKE ({}) powinno być większe niż Belka ({})", final_p50_ike, final_p50_belka);
    }
}
