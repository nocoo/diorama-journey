import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {Film} from './Film';
import {WIDTH, HEIGHT} from './motion.mjs';
import story from './story.json';
import timing from './generated/timing.json';
import './fonts.css';
import './web.css';

const publicFiles = Object.keys(import.meta.glob('/public/**/*', {query:'?url', import:'default'}));
const hasMovie = publicFiles.includes(`/public/review/${story.artifact}.mp4`);
const hasSlides = publicFiles.includes(`/public/slides/${story.artifact}.pptx`);
const hasClips = publicFiles.some(file => file.startsWith('/public/clips/') && file.endsWith('.mp4'));
const clock = (seconds: number) => `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;
const skillUrl = import.meta.env.VITE_SKILL_URL as string | undefined;
const releaseUrl = import.meta.env.VITE_RELEASE_URL as string | undefined;
const languageName = new Intl.DisplayNames(['en'],{type:'language'}).of(story.language);

function App() {
  const video = useRef<HTMLVideoElement>(null);
  const player = useRef<PlayerRef>(null);
  const resumeFrame = useRef(0);
  const [live, setLive] = useState(!hasMovie);
  const [chapter, setChapter] = useState(0);
  function showChapter(frame: number) {
    setChapter(Math.max(0,timing.scenes.findLastIndex(scene => frame >= scene.start)));
  }
  useEffect(() => {
    const current = player.current;
    if (!live || !current) return;
    const update = ({detail}: {detail: {frame: number}}) => showChapter(detail.frame);
    current.addEventListener('frameupdate',update);
    return () => current.removeEventListener('frameupdate',update);
  },[live]);
  function seek(index: number) {
    const frame = timing.scenes[index].start;
    if (live) player.current?.seekTo(frame);
    else if (video.current) video.current.currentTime = frame/timing.fps;
    setChapter(index);
  }
  function switchMode() {
    resumeFrame.current = live ? (player.current?.getCurrentFrame() || 0) : Math.round((video.current?.currentTime || 0)*timing.fps);
    if (live) player.current?.pause(); else video.current?.pause();
    setLive(!live);
  }
  return <main>
    <header className="site-header"><a className="brand" href={skillUrl || '#'}><img src={asset('brand/logo-48.png')} width="24" height="24" alt="" /> <span>Diorama Journey</span></a><a href="#downloads">Downloads <span aria-hidden="true">↗</span></a></header>
    <section className="intro"><p className="kicker">ONE LITTLE LIGHT. A WORLD OF POSSIBILITIES.</p><h1>{story.title}</h1><p>{story.subtitle}</p>
      <div className="facts"><span>{clock(timing.durationInFrames/timing.fps)}</span><span>{story.scenes.length} chapters</span><span>1920 × 1080</span><span>Narrated in {languageName}</span></div>
    </section>
    <section className="watch" aria-label="Watch the story">
      <div className="player-box">{live ? <Player ref={player} component={Film} inputProps={{captions:true,music:true,assetBase:import.meta.env.BASE_URL}}
        compositionWidth={WIDTH} compositionHeight={HEIGHT} fps={timing.fps} durationInFrames={timing.durationInFrames}
        initialFrame={Math.min(resumeFrame.current,timing.durationInFrames-1)} controls style={{width:'100%',aspectRatio:'16/9'}}/> : <video ref={video} controls playsInline preload="metadata"
          onLoadedMetadata={event => {event.currentTarget.currentTime=resumeFrame.current/timing.fps;}}
          onTimeUpdate={event => showChapter(Math.round(event.currentTarget.currentTime*timing.fps))}
          poster={asset('review/cover.png')} src={asset(`review/${story.artifact}.mp4`)} aria-label={story.title}/>}
      </div>
      <div className="watch-meta"><span>{live ? 'Live 3D composition' : 'Rendered film'}</span>{hasMovie && <button onClick={switchMode}>Switch to {live ? 'video' : 'live animation'}</button>}</div>
    </section>
    <section className="chapters" aria-label="Story chapters">{story.scenes.map((scene,index) => <button key={scene.id} aria-pressed={chapter===index} onClick={() => seek(index)}>
      <span className="chapter-number">{String(index+1).padStart(2,'0')}</span><span><strong>{scene.chapter}</strong><small>{clock(timing.scenes[index].start/timing.fps)}</small></span><span aria-hidden="true">↗</span>
    </button>)}</section>
    <section id="downloads" className="downloads"><div><p className="kicker">TAKE THE STORY WITH YOU</p><h2>Watch. Present. Revisit.</h2><p>The film, clean slides and narration share the same chapter timeline.</p></div>
      <div className="download-grid">
        {hasMovie && <a download href={asset(`review/${story.artifact}.mp4`)}>Film <span>MP4 ↗</span></a>}
        {hasSlides && ['pptx','pdf','odp'].map(format => <a key={format} download href={asset(`slides/${story.artifact}.${format}`)}>Presentation <span>{format.toUpperCase()} ↗</span></a>)}
        <a download href={asset('audio/narration.srt')}>Subtitles <span>SRT ↗</span></a>
        {hasSlides && <a download href={asset('slides/speaker-notes.md')}>Speaker notes <span>Markdown ↗</span></a>}
        {publicFiles.includes('/public/audio/full-narration.mp3') && <a download href={asset('audio/full-narration.mp3')}>Isolated narration <span>MP3 ↗</span></a>}
        {releaseUrl && <a href={releaseUrl}>Full production <span>Archive & source ↗</span></a>}
      </div>
      {hasClips && <div className="clip-list"><h3>Chapter clips</h3>{story.scenes.map((scene,i) => <a key={scene.id} download href={asset(`clips/${String(i+1).padStart(2,'0')}-${scene.id}.mp4`)}>{scene.chapter} <span>MP4 ↗</span></a>)}</div>}
    </section>
    <footer className="site-footer"><span>Made with miniature worlds and a continuous thread.</span>{skillUrl ? <a href={skillUrl}>Get the skill ↗</a> : <span>Diorama Journey</span>}</footer>
  </main>;
}

document.documentElement.lang = story.language;
document.title = story.title;
createRoot(document.getElementById('root')!).render(<App/>);
