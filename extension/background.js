let socket;
let retry;
function connect(){
  clearTimeout(retry);
  try{
    socket=new WebSocket('ws://127.0.0.1:3120');
    socket.onopen=()=>chrome.storage.local.set({bridgeConnected:true});
    socket.onmessage=e=>{try{const msg=JSON.parse(e.data);chrome.storage.local.set({lastTask:msg,receivedAt:Date.now()});}catch{}};
    socket.onclose=()=>{chrome.storage.local.set({bridgeConnected:false});retry=setTimeout(connect,3000)};
    socket.onerror=()=>socket.close();
  }catch{retry=setTimeout(connect,3000)}
}
connect();
chrome.runtime.onMessage.addListener((msg,_sender,send)=>{if(msg.type==='status')chrome.storage.local.get(['bridgeConnected','lastTask','receivedAt']).then(send);return true});
