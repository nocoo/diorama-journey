import {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, cancelRender, continueRender, delayRender, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {World} from './art/World';
import {clamp, sceneAt, side, smooth} from './motion.mjs';
import story from './story.json';
import timing from './generated/timing.json';
import fonts from './fonts.json';
import './film.css';

export type FilmProps = {captions?: boolean; music?: boolean; assetBase?: string};

function FontsReady({assetBase}: {assetBase: string}) {
  const [handle] = useState(() => delayRender('Load local film fonts'));
  useEffect(() => {
    Promise.all(fonts.map(async item => {
      const font = new FontFace(item.family, `url(${staticFile(`${assetBase}fonts/${item.file}`)})`, {weight:item.weight});
      document.fonts.add(await font.load());
    })).then(() => continueRender(handle)).catch(cancelRender);
  }, [handle, assetBase]);
  return null;
}

export function Film({captions = true, music = true, assetBase = ''}: FilmProps) {
  const frame = useCurrentFrame();
  const state = sceneAt(frame, timing);
  const scene = story.scenes[state.index];
  const seconds = frame / timing.fps;
  const sentence = timing.captions.findLast(c => seconds >= c.start && seconds < c.end);
  const captionOpacity = sentence ? Math.min(clamp((seconds - sentence.start) * 8), clamp((sentence.end - seconds) * 10)) : 0;
  return <AbsoluteFill className="film">
    <FontsReady assetBase={assetBase}/>
    <AbsoluteFill className="paper"/>
    <div className="ambient-orbit"/>
    <header className="film-header"><span className="film-mark">✧</span><span>{story.title}</span><span className="film-series">A DIORAMA JOURNEY</span></header>
    <World frame={frame}/>
    <section className="film-copy" style={{left: side(state.index) > 0 ? 110 : 1090, opacity: state.textOpacity,
      transform: `translateY(${(1 - smooth(state.local / 35)) * 20}px)`}}>
      <p className="eyebrow"><i/>{scene.chapter}</p>
      <h1>{scene.title.split('\n').map((line, index) => <span key={index} className={index === 1 ? 'accent' : ''}>{line}</span>)}</h1>
      <p className="film-body">{scene.body}</p>
      <div className="copy-rule"><span/><i>Follow the little light</i></div>
    </section>
    {captions && sentence && <div className="subtitle" style={{opacity: captionOpacity}}><span>{sentence.text}</span></div>}
    <footer className="film-footer"><span>{String(state.index + 1).padStart(2, '0')} <i>/ {String(story.scenes.length).padStart(2, '0')}</i></span>
      <div className="chapter-track">{timing.scenes.map((chapter, index) => <div key={chapter.id}>
        <span style={{width: `${clamp((frame - chapter.start) / chapter.duration) * 100}%`, background: index === state.index ? '#bf7b54' : '#8b9b86'}}/>
      </div>)}</div><span className="footer-caption">SMALL WORLDS · CONNECTED STORIES</span></footer>
    {timing.scenes.map(chapter => <Sequence key={chapter.id} from={chapter.start + chapter.voiceStart}
      durationInFrames={Math.ceil(chapter.audioDuration * timing.fps) + 1} layout="none">
      <Audio src={staticFile(`${assetBase}${chapter.audio}`)} volume={1}/>
    </Sequence>)}
    {music && <Audio src={staticFile(`${assetBase}audio/music.mp3`)} volume={0.32}/>}
  </AbsoluteFill>;
}
