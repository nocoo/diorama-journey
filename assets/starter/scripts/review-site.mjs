import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = new URL(process.argv[2] || 'http://127.0.0.1:7410/');
const timing = JSON.parse(await readFile(path.join(root,'src/generated/timing.json')));
const out = path.join(root,'verification',`${new Date().toISOString().replaceAll(':','')}-website`);
await mkdir(out,{recursive:true});
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || (existsSync(macChrome) ? macChrome : undefined),
  args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors = [];
page.on('pageerror',error => errors.push(String(error)));
page.on('response',response => {if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);});
const report = {url:url.href,status:'started',chapters:timing.scenes.length,downloads:[],errors};
try {
  await page.goto(url.href,{waitUntil:'networkidle'});
  const movie = page.locator('video').first();
  await movie.waitFor();
  await page.waitForFunction(() => document.querySelector('video')?.readyState >= 1);
  const media = await movie.evaluate(video => ({paused:video.paused,duration:video.duration,width:video.videoWidth,height:video.videoHeight}));
  assert.ok(media.paused,'The viewer should start paused');
  assert.ok(Math.abs(media.duration-timing.durationInFrames/timing.fps)<.2);
  assert.deepEqual([media.width,media.height],[1920,1080]);
  await movie.evaluate(async video => {video.muted=true;await video.play();});
  await page.waitForFunction(() => document.querySelector('video').currentTime > .3);
  await movie.evaluate(video => video.pause());
  const chapters=page.locator('.chapters button');
  assert.equal(await chapters.count(),timing.scenes.length);
  for (let i=0;i<timing.scenes.length;i++) {
    await chapters.nth(i).click();
    const expected=timing.scenes[i].start/timing.fps;
    await page.waitForFunction(value => Math.abs(document.querySelector('video').currentTime-value)<.12,expected);
    assert.equal(await chapters.nth(i).getAttribute('aria-pressed'),'true');
  }
  for (const link of await page.locator('a[download]').all()) {
    const href=await link.getAttribute('href');
    const target=new URL(href,url);
    assert.ok(target.pathname.startsWith(url.pathname),'Download escaped the site base path');
    const response=await page.request.head(target.href);
    assert.equal(response.status(),200,href);
    assert.ok(Number(response.headers()['content-length'])>0,href);
    report.downloads.push(target.pathname);
  }
  assert.ok(report.downloads.some(file => file.endsWith('.pptx')),'Build after exporting the presentations');
  const downloadReady=page.waitForEvent('download');
  await page.locator('a[download][href$=".pptx"]').click();
  const download=await downloadReady;
  assert.equal(await download.failure(),null);
  await chapters.first().click();
  await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'Switch to live animation'}).click();
  await page.locator('canvas').waitFor();
  await page.waitForFunction(() => document.fonts.status==='loaded');
  await chapters.nth(2).click();
  await page.waitForTimeout(800);
  await page.locator('.watch').screenshot({path:path.join(out,'live.png')});
  await page.getByRole('button',{name:'Switch to video',exact:true}).click();
  await page.waitForFunction(expected => {
    const movie=document.querySelector('video');
    return movie?.readyState>=2 && Math.abs(movie.currentTime-expected)<.12;
  },timing.scenes[2].start/timing.fps);
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(() => scrollTo(0,0));
  await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth),'Narrow layout overflows');
  assert.deepEqual(errors,[]);
  Object.assign(report,{status:'passed',media,playback:true,chapterSeeking:true,liveComposition:true,mobile:true});
} catch (error) {
  report.status='failed';report.failure=String(error);throw error;
} finally {
  await writeFile(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
  console.log(`${report.status}: ${out}`);
}
