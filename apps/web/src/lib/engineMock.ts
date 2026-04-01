export function generateMultipleScenarios(params: any, customCoreWeight: number, customSatWeight: number) {
    const IKE_LIMIT_2026 = 26000.0;
    const customBondsWeight = 100.0 - customCoreWeight - customSatWeight;

    function calculateScenarioDataInternal(
        initialPmt: number, 
        nominalRate: number, 
        realRate: number, 
        years: number, 
        p: any, 
        isIke: boolean, 
        monthlyWithdrawalAmount: number = 0
    ) {
        let nominalBalance = 0.0;
        let realBalance = 0.0;
        let currentPmt = initialPmt;
        let totalInvestedNominal = 0.0;
        let totalInvestedReal = 0.0;
        
        const rateAnnualNominal = nominalRate / 100.0;
        const rateAnnualReal = realRate / 100.0;
        const nominalMonthlyRate = rateAnnualNominal / 12.0;
        const realMonthlyRate = rateAnnualReal / 12.0;

        const totalYears = years + (p.withdrawalYears || 0);
        let bankruptAge: number | null = null;
        let yearlyData = [];

        for (let y = 1; y <= totalYears; y++) {
            let isDecumulation = y > years;
            let yearlyInvestedNominal = 0.0;
            let yearlyNominalInterest = 0.0;
            let monthlyPmtRecord = isDecumulation ? -monthlyWithdrawalAmount : currentPmt;
            
            for (let m = 1; m <= 12; m++) {
                const totalMonths = (y - 1) * 12 + m;
                const currentInflationFactor = Math.pow(1.0 + p.inflationRate / 100.0, totalMonths / 12.0);
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
                        if (bankruptAge === null) bankruptAge = p.currentAge + y;
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
            const baseTax = totalProfitSoFar > 0 ? totalProfitSoFar * 0.19 : 0;
            const taxShield = isIke ? baseTax : 0;
            const netProfit = isIke ? totalProfitSoFar : totalProfitSoFar - baseTax;
            
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
                taxPaidCore: isIke ? 0 : baseTax,
                taxPaidSat: 0,
                taxPaidBonds: 0,
            });

            if (!isDecumulation) {
                currentPmt *= 1.0 + p.annualStepUp / 100.0;
            }
        }
        
        const totalProfit = nominalBalance - totalInvestedNominal;
        const baseTax = totalProfit > 0 ? totalProfit * 0.19 : 0;
        const taxShield = isIke ? baseTax : 0;
        const netProfit = isIke ? totalProfit : totalProfit - baseTax;
        
        return {
            nominalBalance, realBalance, totalInvestedNominal, totalInvestedReal,
            baseInvested: initialPmt * 12 * years,
            netProfit, taxShield, taxPaidCore: isIke ? 0 : baseTax, taxPaidSat: 0, taxPaidBonds: 0, yearlyData, bankruptAge
        };
    }

    function generateScenarioInternal(title: string, description: string, cPct: number, sPct: number, bPct: number, light: string, dark: string, p: any) {
        let initCPmt = p.monthlyContribution * (cPct / 100);
        let initSPmt = p.monthlyContribution * (sPct / 100);
        let initBPmt = p.monthlyContribution * (bPct / 100);

        // Limit IKE Capping
        let ikeSum = 0;
        if (p.isCoreIke) ikeSum += initCPmt;
        if (p.isSatIke) ikeSum += initSPmt;
        if (p.isBondsIke) ikeSum += initBPmt;

        const monthlyLimit = IKE_LIMIT_2026 / 12;
        if (ikeSum > monthlyLimit) {
            const f = monthlyLimit / ikeSum;
            if (p.isCoreIke) initCPmt *= f;
            if (p.isSatIke) initSPmt *= f;
            if (p.isBondsIke) initBPmt *= f;
        }

        const years = Math.max(1, p.retirementAge - p.currentAge);
        const accumParams = { ...p, withdrawalYears: 0 };

        const cData = calculateScenarioDataInternal(initCPmt, p.coreRate + p.inflationRate, p.coreRate, years, accumParams, p.isCoreIke);
        const sData = calculateScenarioDataInternal(initSPmt, p.satRate + p.inflationRate, p.satRate, years, accumParams, p.isSatIke);
        const bData = calculateScenarioDataInternal(initBPmt, p.bondsRate + p.inflationRate, p.bondsRate, years, accumParams, p.isBondsIke);

        const totalInvNom = cData.totalInvestedNominal + sData.totalInvestedNominal + bData.totalInvestedNominal;
        const totalInvRl = cData.totalInvestedReal + sData.totalInvestedReal + bData.totalInvestedReal;
        
        let yearlyData = [];
        for (let i = 0; i < years; i++) {
            const cd = cData.yearlyData[i], sd = sData.yearlyData[i], bd = bData.yearlyData[i];
            yearlyData.push({
                year: cd.year,
                monthlyPmt: cd.monthlyPmt + sd.monthlyPmt + bd.monthlyPmt,
                yearlyInvestedNominal: cd.yearlyInvestedNominal + sd.yearlyInvestedNominal + bd.yearlyInvestedNominal,
                nominalInterest: cd.nominalInterest + sd.nominalInterest + bd.nominalInterest,
                nominalBalance: cd.nominalBalance + sd.nominalBalance + bd.nominalBalance,
                realBalance: cd.realBalance + sd.realBalance + bd.realBalance,
                totalInvestedNominal: cd.totalInvestedNominal + sd.totalInvestedNominal + bd.totalInvestedNominal,
                totalInvestedReal: cd.totalInvestedReal + sd.totalInvestedReal + bd.totalInvestedReal,
                netProfit: cd.netProfit + sd.netProfit + bd.netProfit,
                taxShield: cd.taxShield + sd.taxShield + bd.taxShield,
                taxPaid: cd.taxPaidCore + sd.taxPaidCore + bd.taxPaidCore, // Keep aggregate yearly for table
            });
        }

        // Decumulation
        let cN = cData.nominalBalance, sN = sData.nominalBalance, bN = bData.nominalBalance;
        let cR = cData.realBalance, sR = sData.realBalance, bR = bData.realBalance;
        let bankruptAge: number | null = null;
        let totalTaxCore = cData.taxPaidCore, totalTaxSat = sData.taxPaidCore, totalTaxBonds = bData.taxPaidCore;

        for (let y = 1; y <= p.withdrawalYears; y++) {
            const actY = years + y;
            let yNomInt = 0, yTaxShield = 0, yTaxPaid = 0;
            for (let m = 1; m <= 12; m++) {
                if (bankruptAge) break;
                const infF = Math.pow(1 + p.inflationRate / 100, (actY * 12 + m) / 12);
                const ci = cN * ((p.coreRate + p.inflationRate) / 100 / 12);
                const si = sN * ((p.satRate + p.inflationRate) / 100 / 12);
                const bi = bN * ((p.bondsRate + p.inflationRate) / 100 / 12);
                const ct = p.isCoreIke ? 0 : ci * 0.19, st = p.isSatIke ? 0 : si * 0.19, bt = p.isBondsIke ? 0 : bi * 0.19;
                yTaxShield += (p.isCoreIke ? ci * 0.19 : 0) + (p.isSatIke ? si * 0.19 : 0) + (p.isBondsIke ? bi * 0.19 : 0);
                totalTaxCore += ct; totalTaxSat += st; totalTaxBonds += bt;
                cN += ci - ct; sN += si - st; bN += bi - bt; yNomInt += ci + si + bi;
                cR += cR * (p.coreRate / 100 / 12); sR += sR * (p.satRate / 100 / 12); bR += bR * (p.bondsRate / 100 / 12);
                const wNom = Math.abs(p.monthlyWithdrawal) * infF;
                const totN = cN + sN + bN;
                if (totN <= wNom) {
                    cN = 0; sN = 0; bN = 0; bankruptAge = p.currentAge + actY;
                } else {
                    const cw = cN / totN, sw = sN / totN, bw = bN / totN;
                    cN -= wNom * cw; sN -= wNom * sw; bN -= wNom * bw;
                }
            }
            const totN = cN + sN + bN;
            yearlyData.push({
                year: actY, monthlyPmt: -p.monthlyWithdrawal, yearlyInvestedNominal: 0, nominalInterest: yNomInt,
                nominalBalance: totN, realBalance: cR + sR + bR, totalInvestedNominal: totalInvNom, totalInvestedReal: totalInvRl,
                netProfit: totN - totalInvNom, 
                taxShield: yTaxShield,
                taxPaid: yTaxPaid
            });
        }

        const finalN = cN + sN + bN;
        return {
            title, description, corePct: cPct, satPct: sPct, bondsPct: bPct,
            initialCorePmt: initCPmt, initialSatPmt: initSPmt, initialBondsPmt: initBPmt,
            totalInvestedNominal: totalInvNom, totalInvestedReal: totalInvRl, finalNominal: finalN,
            finalReal: cR + sR + bR, nominalProfit: finalN - totalInvNom, netProfit: finalN - totalInvNom,
            taxShield: (finalN - totalInvNom) > 0 ? (finalN - totalInvNom) * 0.19 : 0, 
            taxPaidCore: totalTaxCore,
            taxPaidSat: totalTaxSat,
            taxPaidBonds: totalTaxBonds,
            yearlyData, colorClassLight: light, colorClassDark: dark, bankruptAge: bankruptAge || undefined
        };
    }

    return [
        generateScenarioInternal("100% Świat", "Tylko VWCE.", 100, 0, 0, "bg-slate-100", "bg-slate-800", params),
        generateScenarioInternal("Złoty Środek", "60/20/20.", 60, 20, 20, "bg-blue-50", "bg-blue-900/30", params),
        generateScenarioInternal("Mocne Uderzenie", "60/40/0.", 60, 40, 0, "bg-amber-50", "bg-amber-900/30", params),
        generateScenarioInternal("Twój Własny", "Dostosowany.", customCoreWeight, customSatWeight, customBondsWeight, "bg-emerald-50", "bg-emerald-900/30", params),
    ];
}

export default async function init() { return Promise.resolve(); }
