const video=document.querySelector('#cameraVideo');
const preview=document.querySelector('#photoPreview');
const canvas=document.querySelector('#photoCanvas');
const ctx=canvas.getContext('2d');
const placeholder=document.querySelector('#cameraPlaceholder');
const liveFrame=document.querySelector('#liveFrame');
const caption=document.querySelector('#previewCaption');
const errorBox=document.querySelector('#cameraError');
const statusText=document.querySelector('#cameraStatus');
const statusDot=document.querySelector('#statusDot');
const captureButton=document.querySelector('#captureButton');
const retakeButton=document.querySelector('#retakeButton');
const confirmButton=document.querySelector('#confirmButton');
const resultActions=document.querySelector('#resultActions');
const downloadButton=document.querySelector('#downloadButton');
const saveAlbumButton=document.querySelector('#saveAlbumButton');
const shareButton=document.querySelector('#shareButton');
const shareHint=document.querySelector('#shareHint');
const switchButton=document.querySelector('#switchCamera');
const frameName=document.querySelector('#frameName');
let stream=null;
let shotUrl='';
let facingMode='user';
let selectedFrame='cloud';
let savedPhoto=false;
let state='loading';

const frames={cloud:'Cloud',rose:'Rose',starry:'Starry',confetti:'Confetti',film:'Polaroid'};
const albumKey='birthday-memory-album-v1';

function showError(message){
  errorBox.textContent=message;errorBox.hidden=false;statusText.textContent='Camera unavailable';statusDot.classList.add('error');placeholder.hidden=true;captureButton.disabled=true;state='error';
}

async function startCamera(){
  errorBox.hidden=true;statusDot.classList.remove('error');statusText.textContent='Preparing your camera…';placeholder.hidden=false;captureButton.disabled=true;
  if(!navigator.mediaDevices?.getUserMedia){showError(location.protocol==='https:'||location.hostname==='localhost'?'This browser cannot access a camera. Try a recent version of Safari or Chrome.':'Camera access requires a secure connection. Open this page over HTTPS or localhost.');return;}
  stopCamera();
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facingMode},width:{ideal:1080},height:{ideal:1440}}});
    video.srcObject=stream;await video.play();placeholder.hidden=true;statusText.textContent=facingMode==='user'?'Camera ready · looking good':'Rear camera ready';captureButton.disabled=false;switchButton.hidden=false;state='live';
  }catch(error){
    if(error.name==='NotAllowedError'||error.name==='PermissionDeniedError')showError('Camera permission was not granted. Allow camera access in your browser settings, then tap Retake to try again.');
    else if(error.name==='NotFoundError'||error.name==='DevicesNotFoundError')showError('No camera was found. You can take a photo with your device camera and share it from your photo library.');
    else if(error.name==='NotReadableError'||error.name==='TrackStartError')showError('The camera may be in use by another app. Close other camera apps and try again.');
    else showError('The camera could not start. Check browser permissions or try a recent browser.');
  }
}

function stopCamera(){if(stream){stream.getTracks().forEach(track=>track.stop());stream=null;}video.srcObject=null;}

function drawDecorations(width,height){
  const scale=width/390;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  const gradient=ctx.createLinearGradient(0,height*.68,0,height);gradient.addColorStop(0,'rgba(34,51,77,0)');gradient.addColorStop(1,'rgba(34,51,77,.54)');ctx.fillStyle=gradient;ctx.fillRect(0,height*.68,width,height*.32);
  ctx.shadowColor='rgba(20,35,54,.35)';ctx.shadowBlur=8*scale;ctx.fillStyle='#fffaf4';ctx.font=`${Math.round(12*scale)}px "DM Mono", monospace`;ctx.letterSpacing=`${2*scale}px`;ctx.fillText('HAPPY BIRTHDAY  ·  WITH LOVE',width/2,height*.92);ctx.restore();
}

function drawFrame(width,height){
  const scale=width/900;const margin=Math.max(10,Math.round(15*scale));
  ctx.save();ctx.lineWidth=Math.max(4,Math.round(8*scale));ctx.setLineDash([]);
  if(selectedFrame==='cloud'){
    ctx.strokeStyle='#fffaf2';ctx.strokeRect(margin,margin,width-margin*2,height-margin*2);ctx.lineWidth=Math.max(2,Math.round(3*scale));ctx.strokeStyle='rgba(255,250,242,.78)';ctx.strokeRect(margin*2.1,margin*2.1,width-margin*4.2,height-margin*4.2);
  }else if(selectedFrame==='rose'){
    ctx.strokeStyle='#d991a1';ctx.strokeRect(margin,margin,width-margin*2,height-margin*2);ctx.lineWidth=Math.max(3,Math.round(5*scale));ctx.strokeStyle='#ffe9e8';ctx.strokeRect(margin*2,margin*2,width-margin*4,height-margin*4);
    ctx.fillStyle='#ffe8eb';for(let x=margin*2;x<width-margin*2;x+=Math.round(29*scale)){ctx.beginPath();ctx.arc(x,margin*2,Math.max(2,3*scale),0,Math.PI*2);ctx.arc(x,height-margin*2,Math.max(2,3*scale),0,Math.PI*2);ctx.fill();}
  }else if(selectedFrame==='starry'){
    ctx.strokeStyle='#6682a7';ctx.lineWidth=Math.max(8,Math.round(14*scale));ctx.strokeRect(margin,margin,width-margin*2,height-margin*2);ctx.lineWidth=Math.max(2,Math.round(3*scale));ctx.strokeStyle='#f2dcae';ctx.strokeRect(margin*2,margin*2,width-margin*4,height-margin*4);
    ctx.fillStyle='#fff0c5';ctx.font=`${Math.round(22*scale)}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';for(let x=margin*2;x<width-margin*2;x+=Math.round(54*scale)){ctx.fillText('✦',x,margin*2);ctx.fillText('✦',x,height-margin*2);}
  }else if(selectedFrame==='confetti'){
    ctx.lineWidth=Math.max(7,Math.round(12*scale));ctx.strokeStyle='#fff3d1';ctx.setLineDash([Math.round(2*scale),Math.round(17*scale)]);ctx.strokeRect(margin,margin,width-margin*2,height-margin*2);ctx.setLineDash([]);ctx.lineWidth=Math.max(2,Math.round(3*scale));ctx.strokeStyle='#e4a2a6';ctx.strokeRect(margin*2,margin*2,width-margin*4,height-margin*4);
  }else{
    const side=Math.round(width*.055),top=side,bottom=Math.round(width*.21);
    ctx.lineWidth=Math.max(1,Math.round(1.5*scale));ctx.strokeStyle='#e9e4db';ctx.strokeRect(side,top,width-side*2,height-top-bottom);
  }
  ctx.restore();
}

function capture(){
  if(state!=='live'||!video.videoWidth)return;
  const sourceWidth=video.videoWidth,sourceHeight=video.videoHeight,scale=Math.min(1,1600/Math.max(sourceWidth,sourceHeight));
  const photoWidth=Math.round(sourceWidth*scale),photoHeight=Math.round(sourceHeight*scale);
  const isPolaroid=selectedFrame==='film';
  const side=isPolaroid?Math.round(photoWidth*.055):0,top=isPolaroid?Math.round(photoWidth*.055):0,bottom=isPolaroid?Math.round(photoWidth*.21):0;
  const width=photoWidth+side*2,height=photoHeight+top+bottom;canvas.width=width;canvas.height=height;
  if(isPolaroid){ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,width,height);}
  if(facingMode==='user'){ctx.translate(side+photoWidth,0);ctx.scale(-1,1);}ctx.drawImage(video,side,top,photoWidth,photoHeight);ctx.setTransform(1,0,0,1,0,0);
  if(isPolaroid){ctx.save();ctx.translate(side,top);drawDecorations(photoWidth,photoHeight);ctx.restore();}
  else drawDecorations(width,height);
  drawFrame(width,height);shotUrl=canvas.toDataURL('image/jpeg',.9);
  preview.src=shotUrl;preview.hidden=false;video.hidden=true;liveFrame.hidden=true;caption.hidden=false;statusText.textContent=`Photo ready · ${frames[selectedFrame]} frame`;captureButton.hidden=true;retakeButton.hidden=false;confirmButton.hidden=false;state='captured';
}

function retake(){preview.hidden=true;preview.removeAttribute('src');video.hidden=false;liveFrame.hidden=false;caption.hidden=true;resultActions.hidden=true;captureButton.hidden=false;retakeButton.hidden=true;confirmButton.hidden=true;saveAlbumButton.disabled=false;saveAlbumButton.querySelector('span').textContent='Save to album';savedPhoto=false;if(state==='error'||!stream)startCamera();else{statusText.textContent='Camera ready · looking good';state='live';}}

function confirmPhoto(){if(!shotUrl)return;stopCamera();captureButton.hidden=true;retakeButton.hidden=false;confirmButton.hidden=true;resultActions.hidden=false;downloadButton.href=shotUrl;statusText.textContent='Photo ready to keep';state='done';}

function saveToAlbum(){
  if(!shotUrl||savedPhoto)return;
  try{
    const album=JSON.parse(localStorage.getItem(albumKey)||'[]');const photo={id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,src:shotUrl,frame:selectedFrame,createdAt:new Date().toISOString(),comments:[]};album.unshift(photo);localStorage.setItem(albumKey,JSON.stringify(album));savedPhoto=true;saveAlbumButton.disabled=true;saveAlbumButton.querySelector('span').textContent='Saved to album ✓';statusText.textContent='Saved in your photo album';
  }catch(error){shareHint.textContent='Your browser storage is full. Download the photo to keep it, then clear older album photos if needed.';}
}

shareButton.addEventListener('click',async()=>{if(!shotUrl)return;try{const file=new File([await(await fetch(shotUrl)).blob()],'happy-birthday-memory.jpg',{type:'image/jpeg'});if(navigator.canShare?.({files:[file]})&&navigator.share)await navigator.share({files:[file],title:'Happy Birthday ✦',text:'A little birthday memory'});else shareHint.textContent='This browser cannot share photos directly. Download the photo, then share it from your photo library.';}catch(error){if(error.name!=='AbortError')shareHint.textContent='Sharing could not open. Download the photo and share it from your photo library.';}});

document.querySelectorAll('#frameOptions .frame-option').forEach(button=>button.addEventListener('click',()=>{const frame=button.dataset.frame;if(!frames[frame])return;selectedFrame=frame;frameName.textContent=frames[frame];liveFrame.className=`live-frame live-frame--${frame}`;document.querySelectorAll('#frameOptions .frame-option').forEach(item=>{const active=item===button;item.classList.toggle('is-selected',active);item.setAttribute('aria-pressed',String(active));});}));
captureButton.addEventListener('click',capture);retakeButton.addEventListener('click',retake);confirmButton.addEventListener('click',confirmPhoto);saveAlbumButton.addEventListener('click',saveToAlbum);
switchButton.addEventListener('click',async()=>{facingMode=facingMode==='user'?'environment':'user';await startCamera();});window.addEventListener('pagehide',stopCamera);startCamera();
