export function generateMultipleScenarios(params: any, customCorePct: number) {
    const IKE_LIMIT_2026 = 26000.0;

    function calculateScenarioDataInternal(initialPmt: number, stepUpRate: number, nominalRate: number, realRate: number, years: number, inflationRate: number, maximizeIkeLimit: boolean, monthlyWithdrawalAmount: number, p: any, portionWeight: number) {
        let nominalBalance = 0.0;
        let realBalance = 0.0;
        let currentPmt = initialPmt;
        
        let totalInvestedNominal = 0.0;
        let totalInvestedReal = 0.0;
        
        // Zgodnie z poleceniem: konwersja do ułamka, a potem podzielenie stopy rocznej na 12 miesięcy
        const rateAnnualNominal = nominalRate / 100.0;
        const rateAnnualReal = realRate / 100.0;
        
        const nominalMonthlyRate = rateAnnualNominal / 12.0;
        const realMonthlyRate = rateAnnualReal / 12.0;

        const totalYears = years + p.withdrawalYears;
        let bankruptAge: number | null = null;
        let yearlyData = [];

        for (let y = 1; y <= totalYears; y++) {
            let isDecumulation = y > years;
            let yearlyInvestedNominal = 0.0;
            let yearlyNominalInterest = 0.0;
            let monthlyPmtRecord = 0.0;
            
            if (!isDecumulation) {
                let limitForPortion = (IKE_LIMIT_2026 / 12.0) * portionWeight;
                if (maximizeIkeLimit) {
                    currentPmt = limitForPortion;
                } else if (currentPmt > limitForPortion) {
                    currentPmt = limitForPortion;
                }
                monthlyPmtRecord = currentPmt;
            } else {
                monthlyPmtRecord = -monthlyWithdrawalAmount;
            }
            
            for (let m = 1; m <= 12; m++) {
                const totalMonths = (y - 1) * 12 + m;
                const currentInflationFactor = Math.pow(1.0 + inflationRate / 100.0, totalMonths / 12.0);
                
                const monthlyNominalInterest = nominalBalance * nominalMonthlyRate;
                const monthlyRealInterest = realBalance * realMonthlyRate;
                yearlyNominalInterest += monthlyNominalInterest;

                if (isDecumulation) {
                    const withdrawalNominal = Math.abs(monthlyWithdrawalAmount) * currentInflationFactor;
                    const withdrawalReal = Math.abs(monthlyWithdrawalAmount);
                    nominalBalance += monthlyNominalInterest - withdrawalNominal;
                    realBalance += monthlyRealInterest - withdrawalReal;

                    if (nominalBalance < 0.0) {
                        nominalBalance = 0.0;
                        realBalance = 0.0;
                        if (bankruptAge === null) {
                            bankruptAge = p.currentAge + y;
                        }
                    }
                } else {
                    const realPmt = currentPmt / currentInflationFactor;
                    nominalBalance += monthlyNominalInterest + currentPmt;
                    realBalance += monthlyRealInterest + realPmt;
                    
                    totalInvestedNominal += currentPmt;
                    totalInvestedReal += realPmt;
                    
                    yearlyInvestedNominal += currentPmt;
                }
            }
            
            const totalProfitSoFar = nominalBalance - totalInvestedNominal;
            const taxShield = totalProfitSoFar > 0.0 ? totalProfitSoFar * 0.19 : 0.0;
            const netProfit = totalProfitSoFar - taxShield;
            
            yearlyData.push({
                year: y,
                monthlyPmt: monthlyPmtRecord,
                yearlyInvestedNominal,
                nominalInterest: yearlyNominalInterest,
                nominalBalance,
                realBalance,
                totalInvestedNominal,
                totalInvestedReal,
                netProfit,
                taxShield,
            });

            if (!isDecumulation) {
                currentPmt *= 1.0 + stepUpRate / 100.0;
            }
        }
        
        const baseInvested = initialPmt * 12.0 * years;
        
        const totalProfit = nominalBalance - totalInvestedNominal;
        const taxShield = totalProfit > 0.0 ? totalProfit * 0.19 : 0.0;
        const netProfit = totalProfit - taxShield;
        
        return {
            nominalBalance,
            realBalance,
            totalInvestedNominal,
            totalInvestedReal,
            baseInvested,
            netProfit,
            taxShield,
            yearlyData,
            bankruptAge,
        };
    }

    function generateScenarioInternal(title: string, description: string, corePct: number, satPct: number, colorClassLight: string, colorClassDark: string, p: any) {
        const initialCorePmt = p.monthlyContribution * (corePct / 100.0);
        const initialSatPmt = p.monthlyContribution * (satPct / 100.0);

        const nominalCoreRate = p.coreRate + p.inflationRate;
        const nominalSatRate = p.satRate + p.inflationRate;
        
        let years = p.retirementAge - p.currentAge;
        if (years < 1) years = 1;

        // === FAZA AKUMULACJI: osobne portfele ===
        const accumParams = { ...p, withdrawalYears: 0 };

        const coreData = calculateScenarioDataInternal(
            initialCorePmt, p.annualStepUp, nominalCoreRate, p.coreRate, years, p.inflationRate, p.maximizeIkeLimit, 0.0, accumParams, corePct / 100.0
        );
        
        const satData = calculateScenarioDataInternal(
            initialSatPmt, p.annualStepUp, nominalSatRate, p.satRate, years, p.inflationRate, p.maximizeIkeLimit, 0.0, accumParams, satPct / 100.0
        );
        
        const totalInvestedNominal = coreData.totalInvestedNominal + satData.totalInvestedNominal;
        const totalInvestedReal = coreData.totalInvestedReal + satData.totalInvestedReal;
        const totalBaseInvested = coreData.baseInvested + satData.baseInvested;
        const totalStepUpInvested = totalInvestedNominal - totalBaseInvested;

        // Buduj yearlyData fazy akumulacji (sumowanie Core+Sat)
        let yearlyData: any[] = [];
        for (let idx = 0; idx < years; idx++) {
            const cd = coreData.yearlyData[idx];
            const sd = satData.yearlyData[idx];
            yearlyData.push({
                year: cd.year,
                monthlyPmt: cd.monthlyPmt + sd.monthlyPmt,
                yearlyInvestedNominal: cd.yearlyInvestedNominal + sd.yearlyInvestedNominal,
                nominalInterest: cd.nominalInterest + sd.nominalInterest,
                nominalBalance: cd.nominalBalance + sd.nominalBalance,
                realBalance: cd.realBalance + sd.realBalance,
                totalInvestedNominal: cd.totalInvestedNominal + sd.totalInvestedNominal,
                totalInvestedReal: (cd.totalInvestedReal || 0) + (sd.totalInvestedReal || 0),
                netProfit: cd.netProfit + sd.netProfit,
                taxShield: cd.taxShield + sd.taxShield,
            });
        }

        // === FAZA DEKUMULACJI: zunifikowana pętla z dynamicznym rebalancingiem ===
        let coreNom = coreData.nominalBalance;
        let satNom = satData.nominalBalance;
        let coreReal = coreData.realBalance;
        let satReal = satData.realBalance;

        const coreNomMonthlyRate = nominalCoreRate / 100.0 / 12.0;
        const satNomMonthlyRate = nominalSatRate / 100.0 / 12.0;
        const coreRealMonthlyRate = p.coreRate / 100.0 / 12.0;
        const satRealMonthlyRate = p.satRate / 100.0 / 12.0;

        const monthlyWithdrawal = Math.abs(p.monthlyWithdrawal);
        let bankruptAge: number | null = null;

        for (let y = 1; y <= p.withdrawalYears; y++) {
            const actualYear = years + y;
            let yearlyNominalInterest = 0.0;

            for (let m = 1; m <= 12; m++) {
                if (bankruptAge !== null) break;

                const totalMonths = (actualYear - 1) * 12 + m;
                const inflationFactor = Math.pow(1.0 + p.inflationRate / 100.0, totalMonths / 12.0);

                // 1. Nalicz odsetki osobno
                const coreInterestNom = coreNom * coreNomMonthlyRate;
                const satInterestNom = satNom * satNomMonthlyRate;
                const coreInterestReal = coreReal * coreRealMonthlyRate;
                const satInterestReal = satReal * satRealMonthlyRate;

                coreNom += coreInterestNom;
                satNom += satInterestNom;
                coreReal += coreInterestReal;
                satReal += satInterestReal;

                yearlyNominalInterest += coreInterestNom + satInterestNom;

                // 2. Wypłata zwaloryzowana o inflację
                const withdrawalNominal = monthlyWithdrawal * inflationFactor;
                const withdrawalReal = monthlyWithdrawal;

                // 3. Sprawdź łączny dostępny kapitał
                const totalCurrentNominal = coreNom + satNom;
                const totalCurrentReal = coreReal + satReal;

                if (totalCurrentNominal <= withdrawalNominal) {
                    // BANKRUCTWO
                    coreNom = 0.0;
                    satNom = 0.0;
                    coreReal = 0.0;
                    satReal = 0.0;
                    bankruptAge = p.currentAge + actualYear;
                } else {
                    // 4. Dynamiczny rebalancing
                    const coreWeight = coreNom / totalCurrentNominal;
                    const satWeight = satNom / totalCurrentNominal;

                    coreNom -= withdrawalNominal * coreWeight;
                    satNom -= withdrawalNominal * satWeight;

                    if (totalCurrentReal > 0.0) {
                        const realCoreW = coreReal / totalCurrentReal;
                        const realSatW = satReal / totalCurrentReal;
                        coreReal -= withdrawalReal * realCoreW;
                        satReal -= withdrawalReal * realSatW;
                    }
                }
            }

            const combinedNominal = Math.max(0.0, coreNom + satNom);
            const combinedReal = Math.max(0.0, coreReal + satReal);
            const totalProfit = combinedNominal - totalInvestedNominal;
            const taxShieldYr = totalProfit > 0.0 ? totalProfit * 0.19 : 0.0;
            const netProfitYr = totalProfit - taxShieldYr;

            yearlyData.push({
                year: actualYear,
                monthlyPmt: -monthlyWithdrawal,
                yearlyInvestedNominal: 0.0,
                nominalInterest: yearlyNominalInterest,
                nominalBalance: combinedNominal,
                realBalance: combinedReal,
                totalInvestedNominal,
                totalInvestedReal,
                netProfit: netProfitYr,
                taxShield: taxShieldYr,
            });
        }

        // Końcowe wartości scenariusza
        const finalNominal = Math.max(0.0, coreNom + satNom);
        const finalReal = Math.max(0.0, coreReal + satReal);
        
        const nominalProfit = finalNominal - totalInvestedNominal;
        const realProfit = finalReal - totalInvestedReal;
        
        const taxShield = nominalProfit > 0.0 ? nominalProfit * 0.19 : 0.0;
        const netProfit = nominalProfit - taxShield;

        return {
            title,
            description,
            corePct,
            satPct,
            initialCorePmt,
            initialSatPmt,
            totalInvestedNominal,
            totalInvestedReal,
            totalBaseInvested,
            totalStepUpInvested,
            finalNominal,
            finalReal,
            nominalProfit,
            realProfit,
            netProfit,
            taxShield,
            yearlyData,
            colorClassLight,
            colorClassDark,
            bankruptAge,
        };
    }

    const scenarios = [
        generateScenarioInternal(
            "100% Nuda",
            "Tylko globalny rdzeń (VWCE).",
            100.0,
            0.0,
            "bg-slate-100 border-slate-300 text-slate-800",
            "bg-slate-800 border-slate-700 text-slate-100",
            params
        ),
        generateScenarioInternal(
            "Złoty Środek",
            "Balans strachu i chciwości.",
            80.0,
            20.0,
            "bg-blue-50 border-blue-300 text-blue-900",
            "bg-blue-900/30 border-blue-700 text-blue-100",
            params
        ),
        generateScenarioInternal(
            "Mocne Uderzenie",
            "Agresywne krypto.",
            70.0,
            30.0,
            "bg-amber-50 border-amber-300 text-amber-900",
            "bg-amber-900/30 border-amber-700 text-amber-100",
            params
        ),
        generateScenarioInternal(
            "Twój Własny",
            "Dostosuj suwakiem.",
            customCorePct,
            100.0 - customCorePct,
            "bg-emerald-50 border-emerald-300 text-emerald-900",
            "bg-emerald-900/30 border-emerald-700 text-emerald-100",
            params
        ),
    ];
    
    return scenarios;
}

export default async function init() {
    return Promise.resolve();
}
