import { test, expect } from '@playwright/test';
const modules=['coin','cards','slides','wheel','either','quiz','rps','spy','timer'];
const settings={modules:Object.fromEntries(modules.map(x=>[x,true])),timerTarget:5,eitherPairs:[{id:'test',enabled:true,options:[{en:'Tea',cn:'茶',bm:'Teh'},{en:'Coffee',cn:'咖啡',bm:'Kopi'}]}]};
test.beforeEach(async ({page}) => {
  // Fixtures exercise the browser contract without pretending cloud services exist.
  await page.route('**/api/settings',route=>route.fulfill({json:{settings}}));
  await page.route('**/api/quiz',route=>route.fulfill({json:{quiz:null,revision:0}}));
});
test('all nine activities load on desktop and mobile without JavaScript errors', async ({page}) => {
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1280,390]) {
    await page.setViewportSize({width,height:850});
    for(const path of ['/','/coin-flip','/pick-a-card','/slides','/wheel','/this-or-that','/quiz','/rock-paper-scissors','/spy-game','/hit-the-mark']) {
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.locator('#main')).not.toBeEmpty();
      await expect(page.locator('#main h1')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
test('rock-paper-scissors keeps the first move hidden until the second player chooses',async({page})=>{
  await page.goto('/rock-paper-scissors');
  await page.locator('[data-rps="rock"]').click();
  await expect(page.locator('.rps-result-card')).toHaveCount(0);
  await page.locator('#rps-ready').click();
  await page.locator('[data-rps="scissors"]').click();
  await expect(page.locator('#rps-title')).toContainText('Player 1 wins');
  await expect(page.locator('.rps-result-card')).toHaveCount(2);
});
test('timer starts, stops and retries',async({page})=>{
  await page.goto('/hit-the-mark');await page.locator('#timer-action').click();
  await expect(page.locator('#timer-action')).toContainText('Stop now');
  await page.locator('#timer-action').click();await expect(page.locator('.timer-verdict')).toBeVisible();
  await page.locator('#timer-action').click();
  await expect(page.locator('#timer-action')).toContainText('Stop now');
  await expect(page.locator('.timer-verdict')).toHaveCount(0);
  await page.locator('#timer-action').click();
  await expect(page.locator('.timer-verdict')).toBeVisible();
});
test('real admin APIs reject anonymous and forged Sites identities',async({request})=>{
  for(const path of ['/api/admin/quiz','/api/admin/settings','/api/admin/spy-vault']) {
    const response=await request.get(path,{headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'owner@example.com'}});
    expect(response.status()).toBe(403);
    expect((await request.put(path,{data:{}})).status()).toBe(403);
  }
  expect((await request.post('/api/admin/upload',{data:'fake'})).status()).toBe(403);
  expect(await (await request.get('/api/session')).json()).toEqual({admin:false});
});
test('missing cloud configuration returns explicit unavailable responses',async({request})=>{
  expect((await request.get('/api/settings')).status()).toBe(503);
  expect((await request.get('/api/quiz')).status()).toBe(503);
  expect((await request.get('/api/auth/providers')).status()).toBe(503);
  expect((await request.get('/api/images/invalid.txt')).status()).toBe(404);
});
test('language, theme and mute settings persist across page navigation',async({page})=>{
  await page.goto('/');
  await page.locator('#language').selectOption('cn');
  await expect(page.locator('html')).toHaveAttribute('lang','zh-Hans');
  await page.locator('#theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('#audio').click();
  await page.goto('/coin-flip');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.locator('html')).toHaveAttribute('lang','zh-Hans');
  expect(await page.evaluate(()=>localStorage.getItem('lp-audio'))).toBe('off');
  await page.goto('/');
  await page.locator('#language').selectOption('bm');
  await expect(page.locator('html')).toHaveAttribute('lang','ms-MY');
});
test('sign-in has an available path back to games without cloud credentials',async({page})=>{
  await page.goto('/sign-in');
  await expect(page.getByText('Sign-in is currently unavailable.',{exact:false})).toBeVisible();
  await page.locator('a[href="/"]').click();
  await expect(page.locator('#main h1')).toBeVisible();
});
