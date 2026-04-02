import html2canvas from 'html2canvas';

const formatPLN = (val: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const exportToNativePDF = (scenario: any, store: any) => {
  if (!scenario || !store) return;

  const years = Math.max(1, store.retirementAge - store.currentAge);
  const taxShield = scenario.taxShield || 0;
  
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <title>Raport Kinetic Oracle</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none; }
        }

        body { 
          font-family: 'Inter', sans-serif; 
          background: #ffffff; 
          color: #0f172a; 
          margin: 0; 
          padding: 20mm; 
          line-height: 1.5;
        }

        .header { 
          border-bottom: 3px solid #2563eb; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end; 
        }

        .header h1 { 
          margin: 0; 
          font-size: 24px; 
          font-weight: 900; 
          text-transform: uppercase; 
          letter-spacing: -1px; 
        }

        .header p { 
          margin: 5px 0 0; 
          font-size: 10px; 
          color: #64748b; 
          font-weight: bold; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
        }

        .final-nominal { 
          text-align: right; 
          color: #2563eb; 
          font-size: 20px; 
          font-weight: 900; 
        }

        .quote { 
          background: #f8fafc; 
          padding: 20px; 
          border-radius: 12px; 
          font-style: italic; 
          color: #475569; 
          margin-bottom: 30px; 
          border: 1px solid #e2e8f0;
          font-size: 13px;
        }

        .grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-bottom: 30px; 
        }

        .card { 
          border: 1px solid #f1f5f9; 
          padding: 20px; 
          border-radius: 16px; 
          background: #fff; 
        }

        .card h3 { 
          margin: 0 0 15px; 
          font-size: 12px; 
          text-transform: uppercase; 
          letter-spacing: 0.5px; 
        }

        /* Uproszczone wizualizacje CSS zamiast Chart.js dla 100% stabilności */
        .allocation-bar { 
          height: 12px; 
          background: #f1f5f9; 
          border-radius: 6px; 
          overflow: hidden; 
          display: flex; 
          margin-bottom: 15px; 
        }
        
        .tax-shield-box { 
          background: #ecfdf5; 
          border: 1px solid #d1fae5; 
          padding: 15px; 
          border-radius: 12px; 
          text-align: center; 
        }

        .tax-shield-box .amount { 
          font-size: 28px; 
          font-weight: 900; 
          color: #059669; 
          margin: 5px 0; 
        }

        .footer { 
          margin-top: 50px; 
          padding-top: 20px; 
          border-top: 1px solid #e2e8f0; 
          display: flex; 
          justify-content: space-between; 
          font-size: 10px; 
          color: #94a3b8; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Mój Plan Finansowy</h1>
          <p>Raport Kinetic Oracle: ${scenario.title || 'Własny'}</p>
        </div>
        <div class="final-nominal">
          ${formatPLN(scenario.finalNominal)}
          <p style="margin:0; font-size:9px; color:#94a3b8; text-transform:uppercase;">Kapitał po ${years} latach</p>
        </div>
      </div>

      <div class="quote">
        "Prawdziwe bogactwo buduje się nie dzięki spekulacji, ale dzięki systematyczności i optymalizacji. Ten raport to mapa Twojej drogi do wolności od podatku Belki."
      </div>

      <div class="grid">
        <div class="card">
          <h3>1. Alokacja Portfela</h3>
          <div class="allocation-bar">
            <div style="width: ${store.customCoreWeight}%; background: #2563eb;"></div>
            <div style="width: ${store.customSatWeight}%; background: #f59e0b;"></div>
            <div style="width: ${store.customBondsWeight}%; background: #10b981;"></div>
          </div>
          <div style="font-size:9px; font-weight:bold; color:#64748b; line-height:1.6;">
            <div>RDZEŃ (Świat): ${store.customCoreWeight}%</div>
            <div>SATELITA (Krypto): ${store.customSatWeight}%</div>
            <div>OBLIGACJE (EDO): ${store.customBondsWeight}%</div>
          </div>
        </div>

        <div class="card">
          <h3>2. Potencjał Tarczy IKE</h3>
          <div class="tax-shield-box">
             <p style="margin:0; font-size:9px; font-weight:bold; color:#065f46; text-transform:uppercase;">Zaoszczędzony Podatek Belki</p>
             <div class="amount">${formatPLN(taxShield)}</div>
             <p style="margin:0; font-size:8px; color:#047857;">Kwota uratowana przed fiskusem dzięki optymalizacji.</p>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:30px;">
        <h3>3. Kluczowe Parametry</h3>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; font-size:11px;">
           <div><strong>Miesięczna wpłata:</strong><br/>${formatPLN(store.monthlyContribution)}</div>
           <div><strong>Lata inwestycji:</strong><br/>${years} lat</div>
           <div><strong>Oczekiwany zysk (avg):</strong><br/>${store.coreRate}% rocznie</div>
        </div>
      </div>

      <div class="footer">
        <div>
          <strong>Kinetic Oracle</strong> — Zaawansowany silnik symulacji IKE/IKZE zasilany Rust Wasm.<br/>
          https://kinetic-oracle.app
        </div>
        <div style="text-align:right">
          Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}<br/>
          Raport ma charakter edukacyjny.
        </div>
      </div>

      <script>
        // Automatyczne wywołanie druku po załadowaniu czcionek
        window.onload = () => {
          setTimeout(() => {
            window.print();
            // window.close(); // Można odblokować dla UX
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlTemplate);
    printWindow.document.close();
  }
};

export const exportToIsolatedPNG = async (scenario: any, store: any) => {
  if (!scenario || !store) return;

  const years = Math.max(1, store.retirementAge - store.currentAge);
  const taxShield = scenario.taxShield || 0;

  // 1. Tworzymy tymczasowy, sztywno stylizowany kontener
  const tempDiv = document.createElement('div');
  tempDiv.id = 'kinetic-export-temp';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '1200px';
  tempDiv.style.height = '630px';
  tempDiv.style.backgroundColor = '#0c0a1a';
  tempDiv.style.color = '#ffffff';
  tempDiv.style.fontFamily = "'Inter', sans-serif";
  tempDiv.style.display = 'flex';
  tempDiv.style.flexDirection = 'column';
  tempDiv.style.justifyContent = 'space-between';
  tempDiv.style.padding = '60px';
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.overflow = 'hidden';

  // 2. Wstrzykujemy czysty HTML (Uproszczony pod html2canvas)
  tempDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
       <div>
         <h1 style="margin:0; font-size:48px; font-weight:900; letter-spacing:-2px; text-transform:uppercase;">KINETIC ORACLE</h1>
         <p style="margin:5px 0 0; font-size:20px; font-weight:bold; color: #3b82f6; letter-spacing:4px; text-transform:uppercase;">Mój Plan Finansowy 80/20</p>
       </div>
       <div style="background:rgba(255,255,255,0.05); padding:10px 20px; border-radius:50px; font-size:14px; font-weight:bold; color:#94a3b8; border:1px solid rgba(255,255,255,0.1);">
         ZASILANE RUST WASM
       </div>
    </div>

    <div style="flex-grow:1; display:flex; align-items:center; gap:80px;">
       <div style="flex:1;">
          <p style="font-size:18px; color:#94a3b8; font-weight:bold; text-transform:uppercase; margin-bottom:10px;">Mój kapitał po ${years} latach:</p>
          <h2 style="font-size:110px; margin:0; font-weight:900; letter-spacing:-5px; line-height:1;">${formatPLN(scenario.finalNominal)}</h2>
          
          <div style="margin-top:40px; background:linear-gradient(to right, rgba(16, 185, 129, 0.2), transparent); border-left:8px solid #10b981; padding:25px; border-radius:0 20px 20px 0;">
             <p style="margin:0 0 5px; font-size:16px; font-weight:900; color:#10b981; text-transform:uppercase;">🛡️ Zaoszczędzony Podatek Belki:</p>
             <p style="margin:0; font-size:54px; font-weight:900;">${formatPLN(taxShield)}</p>
          </div>
       </div>
       
       <div style="width:280px; height:280px; position:relative; background:rgba(255,255,255,0.03); border-radius:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.05);">
          <span style="font-size:72px; font-weight:900;">${years}</span>
          <span style="font-size:14px; font-weight:bold; color:#94a3b8; text-transform:uppercase;">Lat Inwestycji</span>
       </div>
    </div>

    <div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:40px; align-items:flex-end;">
       <div style="display:flex; gap:60px;">
          <div>
            <p style="font-size:12px; font-weight:bold; color:#64748b; text-transform:uppercase; margin-bottom:5px;">Miesięczna Wpłata</p>
            <p style="font-size:24px; font-weight:900; margin:0;">${formatPLN(store.monthlyContribution)}</p>
          </div>
          <div>
            <p style="font-size:12px; font-weight:bold; color:#64748b; text-transform:uppercase; margin-bottom:5px;">Strategia</p>
            <p style="font-size:24px; font-weight:900; margin:0;">${scenario.title || 'Portfel 80/20'}</p>
          </div>
       </div>
       <div style="text-align:right;">
          <p style="font-size:12px; font-weight:bold; color:#64748b; text-transform:uppercase; margin-bottom:5px;">Zbuduj swój plan:</p>
          <p style="font-size:24px; font-weight:900; color:#3b82f6; margin:0;">KINETIC-ORACLE.APP</p>
       </div>
    </div>

    <!-- Dekoracyjne Gradienty -->
    <div style="position:absolute; top:-100px; right:-100px; width:400px; height:400px; background:rgba(59, 130, 246, 0.1); filter:blur(100px); border-radius:100%;"></div>
    <div style="position:absolute; bottom:-100px; left:-100px; width:400px; height:400px; background:rgba(16, 185, 129, 0.1); filter:blur(100px); border-radius:100%;"></div>
  `;

  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0c0a1a',
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `KineticOracle-${scenario.title.replace(/\s+/g, '-')}-Wrapped.png`;
    link.href = imgData;
    link.click();
  } catch (err) {
    console.error('Błąd eksportu PNG:', err);
  } finally {
    document.body.removeChild(tempDiv);
  }
};
