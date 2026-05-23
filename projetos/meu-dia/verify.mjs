import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(8000);

const shots = [];
async function shot(name) {
  const p = `verify-${name}.png`;
  await page.screenshot({ path: p, fullPage: false });
  shots.push(p);
  console.log(`📸 ${p}`);
}

try {
  // Step 1: NavBar
  await page.goto('http://localhost:3000/projetos');
  await page.waitForLoadState('networkidle');
  const navText = await page.textContent('header');
  console.log('NavBar text:', navText?.slice(0, 80));
  await shot('1-projetos-empty');

  // Step 2: Filter tabs present
  const tabs = await page.$$eval('button', bs => bs.map(b => b.textContent?.trim()).filter(Boolean));
  console.log('Buttons found:', tabs);

  // Step 3: Open "Novo projeto" dialog
  await page.getByRole('button', { name: /Novo projeto/ }).first().click();
  await page.waitForSelector('dialog, [role=dialog]', { timeout: 4000 });
  await shot('2-new-project-dialog');
  const dialogText = await page.textContent('[role=dialog]');
  console.log('Dialog content:', dialogText?.slice(0, 120));

  // Step 4: Fill and save project
  await page.getByLabel(/Nome do projeto/).fill('Curso de Mandalas');
  // Pick second color
  const colorBtns = await page.$$('[role=dialog] button[style*="background-color"]');
  if (colorBtns[2]) await colorBtns[2].click();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForSelector('[role=dialog]', { state: 'detached', timeout: 4000 }).catch(() => {});
  await shot('3-project-card');
  const card = await page.textContent('a[href*="/projetos/"]');
  console.log('Project card text:', card?.slice(0, 100));

  // Step 5: Click project card → detail page
  await Promise.all([
    page.waitForURL('**/projetos/**', { timeout: 12000 }),
    page.click('a[href*="/projetos/"]'),
  ]);
  await page.waitForLoadState('networkidle');
  await shot('4-project-detail');
  const heading = await page.textContent('h1');
  console.log('Detail heading:', heading);

  // Step 6: Add a task
  await page.getByRole('button', { name: /Adicionar/ }).click();
  await page.waitForSelector('[data-slot="sheet-content"], [role=dialog]', { timeout: 4000 });
  await page.getByLabel(/Título da tarefa/).fill('Gravar aula 1');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.waitForTimeout(500);
  await shot('5-task-added');
  const taskText = await page.textContent('body');
  console.log('Task visible:', taskText?.includes('Gravar aula 1'));

  // Step 7: Cycle priority badge
  const priBadge = await page.$('button:has-text("Média"), button:has-text("Media")');
  if (priBadge) {
    await priBadge.click();
    await page.waitForTimeout(200);
    await shot('6-priority-cycled');
    const newPri = await priBadge.textContent();
    console.log('Priority after click:', newPri);
  }

  console.log('\n✅ ALL STEPS COMPLETED');
  console.log('Screenshots:', shots.join(', '));
} catch (e) {
  console.error('❌ ERROR:', e.message);
  await shot('error-state');
} finally {
  await browser.close();
}
