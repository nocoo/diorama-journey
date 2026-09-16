import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {mkdir, readFile, copyFile, writeFile, cp} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storyBytes = await readFile(path.join(root, 'src/story.json'));
const timingBytes = await readFile(path.join(root, 'src/generated/timing.json'));
const story = JSON.parse(storyBytes);
const timing = JSON.parse(timingBytes);
const mode = process.argv[2] ?? 'stills';
if (!['stills','poster','sample','video','slides'].includes(mode)) throw new Error('Expected stills, poster, sample, video or slides');
const validate = spawnSync('python3', [path.join(root,'scripts/verify.py'),'--assets-only'], {stdio:'inherit'});
if (validate.status !== 0) throw new Error('Resolve the asset check before rendering');
const requested = process.argv[3]?.split(',').map(Number);
if (requested && (requested.some(f => !Number.isInteger(f) || f < 0 || f >= timing.durationInFrames)
  || !['stills','sample'].includes(mode))) throw new Error('Invalid frame selection');
const boundary = timing.scenes[1].start;
const sample = requested ?? [boundary - 75, boundary + 25];
if (mode === 'sample' && (sample.length !== 2 || sample[0] > sample[1])) throw new Error('sample expects start,end inclusive');
const concurrency = Number(process.env.RENDER_CONCURRENCY ?? 3);
if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('RENDER_CONCURRENCY must be a positive integer');
const stamp = new Date().toISOString().replaceAll('-','').replaceAll(':','').replace('.','');
const out = path.join(root,'process/renders',`${stamp}-${mode}`);
const review = path.join(root,'public/review');
await mkdir(out,{recursive:true});
await mkdir(review,{recursive:true});
for (const item of ['src','scripts','package.json','package-lock.json','tsconfig.json','remotion.config.ts']) {
  await cp(path.join(root,item),path.join(out,'source',item),{recursive:true,filter:src => !src.includes('__pycache__')});
}
const inputProps = {captions: !['poster','slides'].includes(mode), music: ['video','sample'].includes(mode)};
const record = {mode, composition:story.compositionId, fps:timing.fps, durationInFrames:timing.durationInFrames,
  inputProps, storySha256:createHash('sha256').update(storyBytes).digest('hex'),
  timingSha256:createHash('sha256').update(timingBytes).digest('hex'), renderedAt:new Date().toISOString(), status:'started'};
const save = () => writeFile(path.join(out,'render.json'),JSON.stringify(record,null,2)+'\n');
await save();
const standardChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browserExecutable = process.env.CHROME_PATH || (existsSync(standardChrome) ? standardChrome : undefined);
const chromiumOptions = {gl:process.env.RENDER_GL || (process.platform === 'linux' ? 'swangle' : 'angle')};
let browser;
try {
  const serveUrl = await bundle({entryPoint:path.join(root,'src/index.ts'),publicDir:path.join(root,'public'),outDir:path.join(out,'render-web')});
  browser = await openBrowser('chrome',{browserExecutable,chromiumOptions,logLevel:'warn'});
  const common = {serveUrl,puppeteerInstance:browser,browserExecutable,chromiumOptions,timeoutInMilliseconds:120000};
  // Resolved composition props must match the render, including clean-slide captions.
  const composition = await selectComposition({...common,id:story.compositionId,inputProps});
  Object.assign(record,{width:composition.width,height:composition.height});
  if (['stills','poster','slides'].includes(mode)) {
    const slides = mode === 'slides';
    const shots = mode === 'poster' ? [{frame:timing.scenes[0].keyframe,name:'cover'}]
      : requested ? requested.map(frame => ({frame,name:`frame-${frame}`}))
      : timing.scenes.map((scene,i) => ({frame:scene.keyframe,name:`${String(i+1).padStart(2,'0')}-${scene.id}`}));
    record.shots = shots;
    if (slides) await mkdir(path.join(out,'slides/frames'),{recursive:true});
    for (const shot of shots) {
      const output = path.join(out,slides ? 'slides/frames' : '',`${shot.name}.png`);
      await renderStill({...common,composition,inputProps,frame:shot.frame,output,imageFormat:'png',logLevel:'warn'});
      if (!slides && !requested) await copyFile(output,path.join(review,path.basename(output)));
      console.log(`Rendered ${shot.name}`);
    }
    if (slides) {
      record.status = 'frames-ready'; await save();
      const result = spawnSync('uv',['run','--python','3.12',path.join(root,'scripts/slides.py'),'build','--render-dir',out],{stdio:'inherit'});
      if (result.status !== 0) throw new Error('Slide export failed; the rendered frames remain in this attempt');
    }
  } else {
    const isSample = mode === 'sample';
    const raw = path.join(out,'raw.mp4');
    let last = 0;
    await renderMedia({...common,composition,inputProps,codec:'h264',outputLocation:raw,concurrency,
      imageFormat:'jpeg',jpegQuality:92,crf:18,x264Preset:'fast',pixelFormat:'yuv420p',audioCodec:'aac',audioBitrate:'192k',
      ...(isSample ? {frameRange:sample} : {}),
      onProgress:({progress}) => {if (Date.now()-last > 10000) {last=Date.now();console.log(`Rendering ${(progress*100).toFixed(1)}%`);}},
    });
    const output = path.join(out,isSample ? 'transition.mp4' : `${story.artifact}.mp4`);
    const result = spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,
      '-af','loudnorm=I=-16:TP=-1.5:LRA=11','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',output],{stdio:'inherit'});
    if (result.status !== 0) throw new Error('Audio mastering failed');
    if (!isSample) {
      const current = path.join(review,path.basename(output));
      if (existsSync(current)) await copyFile(current,path.join(out,'previous.mp4'));
      await copyFile(output,current);
      await copyFile(path.join(root,'public/audio/narration.srt'),path.join(review,`${story.artifact}.srt`));
      await writeFile(path.join(review,'video.json'),JSON.stringify({...record,status:'complete',file:path.basename(output),
        sha256:createHash('sha256').update(await readFile(output)).digest('hex')},null,2)+'\n');
    }
  }
  record.status = 'complete'; await save();
  console.log(`Saved ${path.relative(root,out)}`);
} catch (error) {
  record.status = 'failed'; record.error = String(error); await save(); throw error;
} finally {await browser?.close({silent:true});}
