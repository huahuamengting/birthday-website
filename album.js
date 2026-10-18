const albumKey='birthday-memory-album-v1';
const grid=document.querySelector('#albumGrid');
const emptyState=document.querySelector('#emptyAlbum');
const countLabel=document.querySelector('#albumCount');
const dialog=document.querySelector('#photoDialog');
const dialogPhoto=document.querySelector('#dialogPhoto');
const photoDate=document.querySelector('#photoDate');
const lane=document.querySelector('#danmakuLane');
const messageForm=document.querySelector('#messageForm');
const messageInput=document.querySelector('#messageInput');
const messageCount=document.querySelector('#messageCount');
let album=[];
let activePhotoId=null;
let selectedEmoji='🎂';

function loadAlbum(){try{const data=JSON.parse(localStorage.getItem(albumKey)||'[]');return Array.isArray(data)?data.filter(item=>item&&item.id&&item.src):[];}catch{return[];}}
function saveAlbum(){localStorage.setItem(albumKey,JSON.stringify(album));}
function renderAlbum(){
  album=loadAlbum();grid.replaceChildren();countLabel.textContent=`${album.length} ${album.length===1?'MEMORY':'MEMORIES'}`;emptyState.hidden=album.length>0;grid.hidden=album.length===0;
  album.forEach(photo=>{const card=document.createElement('button');card.type='button';card.className=`album-card${photo.frame==='film'?' album-card--polaroid':''}`;card.setAttribute('aria-label','Open birthday photo and messages');const image=document.createElement('img');image.src=photo.src;image.alt='Birthday memory';const label=document.createElement('span');label.textContent=new Date(photo.createdAt).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'});card.append(image,label);card.addEventListener('click',()=>openPhoto(photo.id));grid.append(card);});
}

function openPhoto(id){
  const photo=album.find(item=>item.id===id);if(!photo)return;activePhotoId=id;dialogPhoto.src=photo.src;photoDate.textContent=new Date(photo.createdAt).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'});renderMessages(photo);dialog.showModal();
}

function renderMessages(photo){
  lane.replaceChildren();const comments=Array.isArray(photo.comments)?photo.comments:[];messageCount.textContent=comments.length?`${comments.length} ${comments.length===1?'little note':'little notes'} floating by`:'Be the first to leave a little note.';
  if(!comments.length){const empty=document.createElement('span');empty.className='danmaku-empty';empty.textContent='✨ Leave a wish for this moment ✨';lane.append(empty);return;}
  const repeated=[...comments,...comments];repeated.forEach((comment,index)=>{const bubble=document.createElement('span');bubble.className='danmaku-bubble';bubble.textContent=`${comment.emoji||'🎂'} ${comment.text}`;bubble.style.top=`${8+(index%4)*21}%`;bubble.style.animationDelay=`${-(index*3.1)%14}s`;bubble.style.animationDuration=`${15+(index%3)*2}s`;lane.append(bubble);});
}

document.querySelectorAll('#emojiChoices button').forEach(button=>button.addEventListener('click',()=>{selectedEmoji=button.dataset.emoji;document.querySelectorAll('#emojiChoices button').forEach(item=>item.classList.toggle('chosen',item===button));}));
messageForm.addEventListener('submit',event=>{event.preventDefault();const text=messageInput.value.trim();if(!text||!activePhotoId)return;album=loadAlbum();const photo=album.find(item=>item.id===activePhotoId);if(!photo)return;photo.comments=Array.isArray(photo.comments)?photo.comments:[];photo.comments.push({emoji:selectedEmoji,text,createdAt:new Date().toISOString()});photo.comments=photo.comments.slice(-40);try{saveAlbum();messageInput.value='';renderMessages(photo);renderAlbum();}catch{messageCount.textContent='Storage is full. Remove an older photo to make room for this note.';}});

document.querySelector('#closeDialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
document.querySelector('#deletePhoto').addEventListener('click',()=>{if(!activePhotoId)return;album=loadAlbum().filter(item=>item.id!==activePhotoId);saveAlbum();dialog.close();activePhotoId=null;renderAlbum();});
window.addEventListener('storage',renderAlbum);
renderAlbum();
