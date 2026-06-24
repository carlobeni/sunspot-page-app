export default {
  site: 'https://sunspot-page-app.vercel.app',
  scanner: {
    device: 'desktop',
  },
  hooks: {
    async authenticate(page: any) {
      // 1. Navegar a la página de login
      console.log('Iniciando sesión en Unlighthouse...');
      await page.goto('https://sunspot-page-app.vercel.app/login', { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // 2. Completar el formulario de login
      // Los IDs son: #email-address y #password según pages/login.tsx
      await page.type('#email-address', 'carlosbenitez4321@gmail.com');
      await page.type('#password', '123456');

      // 3. Hacer click en el botón de ingresar y esperar la navegación
      // El botón es de tipo submit
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);
      
      console.log('Sesión iniciada correctamente.');
    }
  },
  // Configuración adicional opcional
  puppeteerOptions: {
    // Si tienes problemas, cambia headless a false para ver qué está pasando
    headless: true,
  }
}
