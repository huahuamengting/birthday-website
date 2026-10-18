const music=document.querySelector('#birthdayMusic');
const toggle=document.querySelector('#musicToggle');
const slider=document.querySelector('#musicVolume');
const volumeValue=document.querySelector('#volumeValue');
const message=document.querySelector('#musicMessage');
const musicFileLink=document.querySelector('#musicFileLink');
const pageOverlay=document.querySelector('#pageOverlay');
const pageFrame=document.querySelector('#birthdayPageFrame');
const closePageButton=document.querySelector('#pageOverlayClose');

music.volume=Number(slider.value);
music.muted=false;

function syncMusicState(){
  const isPlaying=!music.paused&&!music.ended;
  document.body.classList.toggle('music-playing',isPlaying);
  toggle.setAttribute('aria-pressed',String(isPlaying));
  toggle.setAttribute('aria-label',isPlaying?'Pause birthday music':'Play birthday music');
  message.textContent=isPlaying?'Now playing':'Music is paused';
}

function revealNativePlayer(){
  music.hidden=false;
  music.controls=true;
  musicFileLink.hidden=false;
}

async function startMusic(){
  message.textContent='Loading birthday music…';
  try{
    await music.play();
    syncMusicState();
  }
  catch(error){
    syncMusicState();
    revealNativePlayer();
    if(error.name==='NotAllowedError')message.textContent='Playback was blocked. Try the player below or check your device audio.';
    else if(error.name==='NotSupportedError'||music.error?.code===4)message.textContent='This browser cannot play the MP3. Use the native player below or download the file.';
    else if(error.name==='AbortError')message.textContent='Playback was interrupted. Try the player below.';
    else message.textContent='Could not start music. Try the player below or download the file.';
    console.warn('Birthday music playback failed',error,music.error);
  }
}

toggle.addEventListener('click',async()=>{
  if(!music.paused){music.pause();return;}
  await startMusic();
});

function openBirthdayPage(path){
  pageOverlay.hidden=false;
  document.body.classList.add('page-open');
  if(music.paused)startMusic();
  pageFrame.src=path;
}

function closeBirthdayPage(){
  pageOverlay.hidden=true;
  document.body.classList.remove('page-open');
  pageFrame.src='about:blank';
}

document.addEventListener('click',event=>{
  const link=event.target.closest('a[href="camera.html"],a[href="album.html"]');
  if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  openBirthdayPage(link.getAttribute('href'));
});

closePageButton.addEventListener('click',closeBirthdayPage);
window.addEventListener('message',event=>{
  if(event.origin===location.origin&&event.source===pageFrame.contentWindow&&event.data?.type==='birthday-close-frame')closeBirthdayPage();
});

slider.addEventListener('input',()=>{
  music.volume=Number(slider.value);
  volumeValue.value=`${Math.round(music.volume*100)}%`;
  volumeValue.textContent=`${Math.round(music.volume*100)}%`;
});

music.addEventListener('play',()=>{syncMusicState();message.textContent='Starting music…';});
music.addEventListener('playing',()=>{syncMusicState();message.textContent='Now playing';});
music.addEventListener('pause',syncMusicState);
music.addEventListener('ended',syncMusicState);
music.addEventListener('waiting',()=>{if(!music.paused)message.textContent='Loading birthday music…';});
music.addEventListener('stalled',()=>{if(!music.paused)message.textContent='Music is taking a while to load…';});
music.addEventListener('error',()=>{
  const reasons={1:'Music loading was cancelled.',2:'Music could not be loaded. Check the website connection.',3:'This browser could not decode the music.',4:'This browser cannot play this audio file.'};
  revealNativePlayer();
  message.textContent=reasons[music.error?.code]||'Music could not be loaded. The rest of the site is still available.';
});
