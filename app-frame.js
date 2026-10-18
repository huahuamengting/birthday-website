if(window.parent!==window){
  document.addEventListener('click',event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href="index.html"]');
    if(!link)return;
    event.preventDefault();
    window.parent.postMessage({type:'birthday-close-frame'},location.origin);
  });
}
