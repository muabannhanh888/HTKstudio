import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, addEdge, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './styles.css';

const kinds = {
  text: { icon: 'T', title: 'Văn bản', color: '#7dd3fc' },
  image: { icon: '▧', title: 'Hình ảnh', color: '#60a5fa' },
  model: { icon: '✦', title: 'AI Model', color: '#c084fc' },
  output: { icon: '✓', title: 'Kết quả', color: '#34d399' }
};

function NodeCard({ id, data }) {
  const meta = kinds[data.kind] || kinds.text;
  return <div className="node-card" style={{'--accent': meta.color}}>
    <Handle type="target" position={Position.Left}/>
    <div className="node-title"><span className="node-icon">{meta.icon}</span><b>{data.label}</b><span className="ok">●</span></div>
    {data.kind === 'text' && <textarea value={data.value || ''} onChange={e => data.onChange(id, e.target.value)} placeholder="Nhập prompt hoặc nội dung..."/>}
    {data.kind === 'image' && <div className="drop">Kéo ảnh vào đây<br/><small>hoặc chọn tài sản</small></div>}
    {data.kind === 'model' && <><select value={data.provider || 'gemini'} onChange={e => data.onProvider(id,e.target.value)}><option value="gemini">Gemini</option><option value="openai">OpenAI</option><option value="flow">Google Flow (Extension)</option></select><button className="run" onClick={() => data.onRun(id)}>▶ Chạy node</button></>}
    {data.kind === 'output' && <div className="preview">Kết quả sẽ xuất hiện tại đây</div>}
    <Handle type="source" position={Position.Right}/>
  </div>;
}

const initialNodes = [
  { id:'1', type:'card', position:{x:80,y:100}, data:{kind:'text',label:'Prompt chính',value:'Mô tả hình ảnh hoặc video cần tạo'} },
  { id:'2', type:'card', position:{x:430,y:100}, data:{kind:'model',label:'AI Image / Video',provider:'gemini'} },
  { id:'3', type:'card', position:{x:800,y:100}, data:{kind:'output',label:'Kết quả'} }
];
const initialEdges = [{id:'e1-2',source:'1',target:'2'},{id:'e2-3',source:'2',target:'3'}];

function App(){
  const [nodes,setNodes,onNodesChange]=useNodesState(initialNodes);
  const [edges,setEdges,onEdgesChange]=useEdgesState(initialEdges);
  const [active,setActive]=useState('workflows');
  const [bridge,setBridge]=useState({connected:false,clients:0});
  const [notice,setNotice]=useState('Sẵn sàng');
  const nodeTypes=useMemo(()=>({card:NodeCard}),[]);
  const changeValue=useCallback((id,value)=>setNodes(ns=>ns.map(n=>n.id===id?{...n,data:{...n.data,value}}:n)),[setNodes]);
  const changeProvider=useCallback((id,provider)=>setNodes(ns=>ns.map(n=>n.id===id?{...n,data:{...n.data,provider}}:n)),[setNodes]);
  const runNode=useCallback(async id=>{const count=await window.htk?.broadcast({type:'run',nodeId:id}); setNotice(count?`Đã gửi tác vụ tới ${count} extension`:'Chưa có extension kết nối');},[]);
  useEffect(()=>{setNodes(ns=>ns.map(n=>({...n,data:{...n.data,onChange:changeValue,onProvider:changeProvider,onRun:runNode}})));},[changeValue,changeProvider,runNode,setNodes]);
  useEffect(()=>window.htk?.onBridgeStatus(setBridge),[]);
  const addNode=kind=>{const id=String(Date.now());setNodes(ns=>[...ns,{id,type:'card',position:{x:200+ns.length*35,y:180+ns.length*25},data:{kind,label:kinds[kind].title,onChange:changeValue,onProvider:changeProvider,onRun:runNode}}]);};
  const save=async()=>{const path=await window.htk?.saveWorkflow({name:'Untitled_Workflow',nodes,edges,savedAt:new Date().toISOString()});setNotice(path?`Đã lưu: ${path}`:'Chạy trong ứng dụng để lưu');};
  return <div className="shell">
    <aside><div className="brand"><span>H</span><b>HTKstudio</b></div>{[['projects','▣','Dự án'],['tools','⚙','Công cụ'],['apps','▦','Ứng dụng'],['store','◇','Store'],['chat','◌','Trò chuyện'],['workflows','⌘','Workflows'],['automation','⬡','Tự động hóa'],['builder','◈','Builder']].map(([k,i,t])=><button key={k} className={active===k?'active':''} onClick={()=>setActive(k)}><i>{i}</i>{t}</button>)}<div className="aside-bottom"><button onClick={()=>setActive('settings')}><i>⚙</i>Cài đặt</button></div></aside>
    <main><header><div><b>Untitled Workflow</b><small>{notice}</small></div><div className="header-actions"><span className={bridge.connected?'online':'offline'}>● {bridge.connected?`${bridge.clients} extension`:'Extension offline'}</span><button onClick={save}>💾 Lưu</button><button className="primary" onClick={()=>runNode('2')}>▶ Chạy</button></div></header>
    {active==='workflows'?<div className="workspace"><div className="addbar"><button onClick={()=>addNode('text')}>+ Text</button><button onClick={()=>addNode('image')}>+ Image</button><button onClick={()=>addNode('model')}>+ AI Model</button><button onClick={()=>addNode('output')}>+ Output</button></div><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={p=>setEdges(es=>addEdge(p,es))} fitView><Background color="#25304a" gap={22}/><Controls/><MiniMap pannable zoomable nodeColor={n=>kinds[n.data.kind]?.color}/></ReactFlow></div>:<section className="empty"><div className="big-icon">{active==='settings'?'⚙':'H'}</div><h1>{active==='settings'?'Cài đặt HTKstudio':'Mô-đun đang được hoàn thiện'}</h1><p>{active==='settings'?'Bridge chạy tại 127.0.0.1:3120. Cài extension bằng Load unpacked từ gói HTK-Bridge.':'Phiên bản 0.1.0 ưu tiên Workflow Builder, lưu dự án và kết nối extension.'}</p></section>}
    </main></div>;
}
createRoot(document.getElementById('root')).render(<App/>);
