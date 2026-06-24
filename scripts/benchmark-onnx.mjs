import puppeteer from 'puppeteer';
import { writeFileSync, existsSync } from 'fs';

// Perfiles de ALTA FIDELIDAD
const DEVICES = [
  {
    name: 'Laptop ASUS TUF Gaming F15',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    throttling: 1,
    cores: 16,
    network: null 
  },
  {
    name: 'iPhone 15 Pro',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 393, height: 852 },
    throttling: 1.5,
    cores: 6,
    network: { download: 25000000, upload: 6250000, latency: 20, name: '5G' } 
  },
  {
    name: 'iPhone 13',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    throttling: 3,
    cores: 4,
    network: { download: 6250000, upload: 1250000, latency: 50, name: '4G High' }
  },
  {
    name: 'Pixel 7',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    viewport: { width: 412, height: 915 },
    throttling: 2,
    cores: 8,
    network: { download: 12500000, upload: 3125000, latency: 30, name: '4G/5G' }
  },
  {
    name: 'Samsung Galaxy S23',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    viewport: { width: 360, height: 780 },
    throttling: 2,
    cores: 8,
    network: { download: 12500000, upload: 3125000, latency: 30, name: '4G/5G' }
  }
];

const SITE_URL = 'https://sunspot-page-app.vercel.app';
const LOGIN_EMAIL = 'carlosbenitez4321@gmail.com';
const LOGIN_PASS = '123456';
const CSV_FILE = 'benchmark_results.csv';

let globalFirstImageSrc = null;

function saveProgressiveCSV(results) {
  if (results.length === 0) return;
  const headers = Object.keys(results[0]).join(',');
  const rows = results.map(r => Object.values(r).join(',')).join('\n');
  writeFileSync(CSV_FILE, `${headers}\n${rows}`);
}

async function runDeviceBenchmark(device) {
  console.log(`\n🚀 Prueba: ${device.name}...`);
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: device.viewport
  });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  
  try {
    await page.setUserAgent(device.userAgent);
    
    // Inyectar Hardware Concurrency
    await page.evaluateOnNewDocument((cores) => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => cores });
    }, device.cores);

    // Throttling de CPU
    if (device.throttling > 1) {
      await client.send('Emulation.setCPUThrottlingRate', { rate: device.throttling });
    }

    // Red
    if (device.network) {
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: device.network.download,
        uploadThroughput: device.network.upload,
        latency: device.network.latency
      });
    }

    const result = {
      Device: device.name,
      SimulatedCores: device.cores,
      CPU_Throttling: device.throttling > 1 ? `1/${device.throttling}` : 'Nativo',
      NetworkMode: device.network ? device.network.name : 'Fibra/Nativo',
      NetworkLatency_ms: device.network ? device.network.latency : 0,
      ModelDownloadTime_ms: 0,
      SupabaseGalleryTime_ms: 0,
      YoloInference_ms: 0,
      ClassificationInference_ms: 0
    };

    // --- FLUJO DE PRUEBA ---
    await page.goto(`${SITE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#email-address');
    await page.type('#email-address', LOGIN_EMAIL);
    await page.type('#password', LOGIN_PASS);
    
    const startDownload = Date.now();
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForFunction(() => window.location.pathname === '/' || window.location.pathname === '/index', { timeout: 180000 })
    ]);
    result.ModelDownloadTime_ms = Date.now() - startDownload;

    await page.goto(`${SITE_URL}/observatory`, { waitUntil: 'networkidle2' });
    
    // Buscar y hacer click en el botón de Galería Solar con NATIVE CLICK
    console.log('  - Accediendo a la Galería Solar...');
    await page.waitForFunction(() => {
       const buttons = Array.from(document.querySelectorAll('button'));
       return buttons.some(b => b.textContent.includes('Galería Solar') && !b.disabled);
    }, { timeout: 30000 });

    // Obtener la posición del botón para un clic real
    const buttonHandle = await page.evaluateHandle(() => {
       const buttons = Array.from(document.querySelectorAll('button'));
       const btn = buttons.find(b => b.textContent.includes('Galería Solar'));
       btn.scrollIntoView({ block: 'center' });
       return btn;
    });

    const startGallery = Date.now();
    await buttonHandle.click(); // Clic nativo de Puppeteer
    
    console.log('  - Esperando respuesta de Supabase...');
    await page.waitForSelector('button > img', { timeout: 90000 });
    result.SupabaseGalleryTime_ms = Date.now() - startGallery;

    if (!globalFirstImageSrc) {
       globalFirstImageSrc = await page.evaluate(() => document.querySelector('button > img')?.src);
    }

    // Seleccionar imagen con clic nativo
    const imgHandle = await page.evaluateHandle((src) => {
        const images = Array.from(document.querySelectorAll('button > img'));
        const target = images.find(img => img.src === src) || images[0];
        target.scrollIntoView({ block: 'center' });
        return target.parentElement;
    }, globalFirstImageSrc);
    await imgHandle.click();
    
    await new Promise(r => setTimeout(r, 6000)); // Esperar procesamiento inicial

    const inferenceTimes = await page.evaluate(async () => {
      const waitSpinner = async () => {
        await new Promise(resolve => {
           let stable = 0;
           const interval = setInterval(() => {
             const loading = document.body.innerText.includes('Verificando') || 
                             document.body.innerText.includes('Procesando') ||
                             document.querySelector('.animate-spin');
             if (!loading) stable++; else stable = 0;
             if (stable > 10) { clearInterval(interval); resolve(); }
           }, 100);
        });
      };

      const clickBtn = (text) => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes(text));
        if (btn) { btn.scrollIntoView(); btn.click(); return true; }
        return false;
      };

      clickBtn('Siguiente');
      await waitSpinner();

      const startYolo = performance.now();
      clickBtn('Ejecutar Modelo YOLO');
      await waitSpinner();
      const yoloTime = performance.now() - startYolo;

      const startClass = performance.now();
      clickBtn('Siguiente (Clasificación)');
      await waitSpinner();
      const classTime = performance.now() - startClass;
      
      return { yolo: yoloTime, classification: classTime };
    });

    result.YoloInference_ms = Math.round(inferenceTimes.yolo);
    result.ClassificationInference_ms = Math.round(inferenceTimes.classification);

    console.log(`  ✅ Completado. YOLO: ${result.YoloInference_ms}ms`);
    return result;

  } finally {
    await browser.close();
  }
}

async function start() {
  const allResults = [];
  
  // No borramos el CSV si ya tiene datos de la ASUS, solo lo cargamos si quieres (opcional)
  // Pero aquí simplemente guardaremos progresivamente.
  
  for (const device of DEVICES) {
    try {
      const res = await runDeviceBenchmark(device);
      allResults.push(res);
      saveProgressiveCSV(allResults);
      await new Promise(r => setTimeout(r, 5000));
    } catch (err) {
      console.error(`❌ Error en ${device.name}:`, err.message);
      // Guardar lo que tengamos hasta ahora aunque falle uno
      saveProgressiveCSV(allResults);
    }
  }

  if (allResults.length > 0) {
    console.log('\n📊 TABLA DE RESULTADOS ACTUALIZADA:');
    console.table(allResults);
  }
}

start();
