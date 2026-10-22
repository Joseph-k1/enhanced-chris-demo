import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IDS, find, hintFor } from './steps';
import './guide.css';

const frame = document.getElementById('app') as HTMLIFrameElement;
const currentId = () => IDS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'venue';
type Box = {left:number; top:number; width:number; height:number};
type Side = 'left'|'right'|'top'|'bottom'|'none';
type Layout = {card:Box; beacon:{left:number;top:number}|null; visible:boolean; stepId:string};

function Beacon({position,visible,reduced}:{position:Layout['beacon'];visible:boolean;reduced:boolean}) {
  const pulse=visible&&!reduced;
  return <span className="ku-guide-beacon" aria-hidden="true" style={{left:position?.left??0,top:position?.top??0,visibility:visible?'visible':'hidden'}}>
    <motion.span className="ku-guide-beacon-halo" initial={false}
      variants={{
        rest:{scale:1,transition:{duration:0}},
        // Animate the existing grey halo; the dot and its white border remain fixed.
        pulse:{
          scale:[1,1.25,1.25,1],
          transition:{duration:2,repeat:Infinity,times:[0,0.45,0.55,1],ease:'easeInOut'}
        }
      }}
      animate={pulse?'pulse':'rest'} />
    <span className="ku-guide-beacon-dot" />
  </span>;
}

function Guide() {
  const [id,setId] = useState(currentId);
  const [visit,setVisit] = useState(0);
  const [enabled,setEnabled] = useState(true);
  const [dismissed,setDismissed] = useState(false);
  const [action,setAction] = useState(false);
  const [hint,setHint] = useState<ReturnType<typeof hintFor>|null>(null);
  const [layout,setLayout] = useState<Layout|null>(null);
  const [modal,setModal] = useState(false);
  const [offRoute,setOffRoute] = useState(false);
  const [toggleBox,setToggleBox] = useState<Box|null>(null);
  const card = useRef<HTMLElement>(null);
  const target = useRef<HTMLElement|null>(null);
  const reduced = useReducedMotion();
  const scrollNext = useRef(false);
  const [refresh,setRefresh] = useState(0);
  useEffect(()=>{
    const nav=()=>{setVisit(x=>x+1);setDismissed(false);setId(currentId());setAction(false);setOffRoute(false);scrollNext.current=false;setRefresh(x=>x+1);};
    const reset=()=>{setEnabled(true);nav();};
    const load=()=>setRefresh(x=>x+1);
    addEventListener('hashchange',nav);frame.addEventListener('load',load);
    document.getElementById('reset')!.addEventListener('click',reset);
    return()=>{removeEventListener('hashchange',nav);frame.removeEventListener('load',load);document.getElementById('reset')!.removeEventListener('click',reset);};
  },[]);

  useEffect(()=>{
    const doc=frame.contentDocument,win=frame.contentWindow;
    if(!doc?.body || !win)return;
    let raf=0;
    const measure=()=>{
      raf=0;
      const f=frame.getBoundingClientRect(), reset=document.getElementById('reset')!.getBoundingClientRect();
      // The toggle occupies the existing header spacer, without reflowing any original UI.
      const headerText=document.querySelector('header .step')!.getBoundingClientRect();
      const toggleInStage=reset.left-166<headerText.right+8;
      setToggleBox({left:toggleInStage?f.right-168:reset.left-166,top:toggleInStage?f.top+8:reset.top,width:156,height:reset.height});
      const payment=!!find(doc,'h2',/^Pay (booking deposit|remaining balance)$/);
      setModal(payment);
      const next=hintFor(id,doc,action);
      const el=next.target(doc);
      target.current=el;
      setHint(old=>old?.title===next.title&&old.text===next.text?old:next);
      setOffRoute(!el && !!doc.querySelector('#root')?.children.length && !payment);
      if(scrollNext.current && el){scrollNext.current=false;el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});}
      const r=el?.getBoundingClientRect();
      const anchor = r && r.width && r.height ? {left:f.left+r.left,top:f.top+r.top,width:r.width,height:r.height}:null;
      const visible=!!anchor && anchor.top>=f.top && anchor.top+Math.min(anchor.height,44)<=f.bottom && anchor.left>=f.left && anchor.left+anchor.width<=f.right;
      const pad=12,gap=24,w=Math.min(320,f.width-24),h=card.current?.offsetHeight||180;
      const safeTop=f.top+(toggleInStage?52:pad);
      let left=f.right-w-pad,top=f.bottom-h-pad,side:Side='none';
      if(visible && anchor){
        // Prefer the approved above-target coachmark. Leave a clear gap for the target beacon.
        if(anchor.top-h-gap>safeTop){left=anchor.left+(anchor.width-w)/2;top=anchor.top-h-gap;side='bottom';}
        else if(anchor.left+anchor.width+gap+w<f.right-pad){left=anchor.left+anchor.width+gap;top=anchor.top+(Math.min(anchor.height,f.bottom-anchor.top)-h)/2;side='left';}
        else if(anchor.left-w-gap>f.left+pad){left=anchor.left-w-gap;top=anchor.top+(Math.min(anchor.height,f.bottom-anchor.top)-h)/2;side='right';}
        else if(anchor.top+anchor.height+gap+h<f.bottom-pad){left=anchor.left+(anchor.width-w)/2;top=anchor.top+anchor.height+gap;side='top';}
        // A corner fallback has no beacon: it must not mark an unrelated action.
      }
      left=Math.max(f.left+pad,Math.min(left,f.right-w-pad));
      top=Math.max(safeTop,Math.min(top,f.bottom-h-pad));
      let beacon:Layout['beacon']=null;
      if(visible && anchor && side!=='none'){
        const centreX=anchor.left+anchor.width/2;
        const centreY=anchor.top+Math.min(anchor.height,f.bottom-anchor.top)/2;
        const point=side==='bottom'?{left:centreX,top:anchor.top-gap/2}
          :side==='top'?{left:centreX,top:anchor.top+anchor.height+gap/2}
          :side==='left'?{left:anchor.left+anchor.width+gap/2,top:centreY}
          :{left:anchor.left-gap/2,top:centreY};
        const radius=10;
        const inStage=point.left-radius>=f.left && point.left+radius<=f.right && point.top-radius>=safeTop && point.top+radius<=f.bottom;
        const clearOfCard=point.left+radius<=left || point.left-radius>=left+w || point.top+radius<=top || point.top-radius>=top+h;
        if(inStage && clearOfCard) beacon=point;
      }
      const result={card:{left,top,width:w,height:h},beacon,visible,stepId:id};
      setLayout(old=>JSON.stringify(old)===JSON.stringify(result)?old:result);
    };
    const schedule=()=>{if(!raf)raf=requestAnimationFrame(measure);};
    const observer=new MutationObserver(schedule);observer.observe(doc.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled','class']});
    const resize=new ResizeObserver(schedule);resize.observe(frame);if(card.current)resize.observe(card.current);
    doc.addEventListener('scroll',schedule,true);doc.addEventListener('input',schedule,true);doc.addEventListener('load',schedule,true);
    window.addEventListener('resize',schedule);schedule();
    return()=>{cancelAnimationFrame(raf);observer.disconnect();resize.disconnect();doc.removeEventListener('scroll',schedule,true);doc.removeEventListener('input',schedule,true);doc.removeEventListener('load',schedule,true);window.removeEventListener('resize',schedule);};
  },[id,action,refresh,enabled,dismissed,hint?.title]);

  const showTarget=()=>{target.current?.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});};
  const nextAction=()=>{scrollNext.current=true;setAction(true);setRefresh(x=>x+1);};
  const restore=()=>{
    // Reuse Joseph's existing step control, including his original navigation/state behavior.
    document.querySelector<HTMLButtonElement>(`#steps button[data-n="${IDS.indexOf(id)}"]`)?.click();
    setRefresh(x=>x+1);
  };
  // Never render the next step's tip using the previous step's measured position.
  const show=!!hint&&!!layout&&layout.stepId===id&&enabled&&!dismissed&&!modal;
  const extra = !action && ['book','checkout','review'].includes(id) && !offRoute && !hint?.title.includes('sent') && !hint?.title.includes('progressed');
  return <>
    {toggleBox && <label className="ku-guide-toggle" style={{left:toggleBox.left,top:toggleBox.top,height:toggleBox.height,width:toggleBox.width}}>
      <span>Show guidance</span>
      <input type="checkbox" role="switch" checked={enabled} onChange={event=>{setEnabled(event.target.checked);setDismissed(false);}} />
      <motion.span className="ku-guide-switch-track" aria-hidden="true" initial={false}
        animate={{backgroundColor:enabled?'#c6dfcb':'#536056',borderColor:enabled?'#c6dfcb':'#a8b3aa'}}
        transition={{duration:reduced?0:0.2,ease:'easeOut'}}>
        <motion.span initial={false}
          animate={{x:enabled?12:0,backgroundColor:enabled?'#24382a':'#ffffff'}}
          transition={reduced?{duration:0}:{x:{type:'spring',stiffness:420,damping:32},backgroundColor:{duration:0.2,ease:'easeOut'}}} />
      </motion.span>
    </label>}
    <Beacon key={`${id}-${visit}`} position={layout?.beacon??null} visible={!!show&&!offRoute&&layout?.stepId===id&&!!layout.beacon} reduced={!!reduced} />
    {/* Only the close button requests an animated exit; navigation replaces the boundary. */}
    <AnimatePresence key={`${id}-${hint?.title}-${offRoute}`} custom={dismissed&&!reduced}>
      {show && <motion.aside ref={card} key="guide-card" className="ku-guide-card" style={{left:layout.card.left,top:layout.card.top,width:layout.card.width}} aria-label="Step guidance" initial={{opacity:0,y:reduced?0:4}} animate={{opacity:1,y:0}}
        variants={{dismiss:(animateClose:boolean)=>({opacity:0,y:animateClose?4:0,pointerEvents:'none',transition:{duration:animateClose?0.16:0,ease:'easeIn'}})}}
        exit="dismiss" transition={{duration:reduced?0:0.14,ease:"easeOut"}}>

        <div className="ku-guide-content">
        <button className="ku-guide-close" aria-label="Dismiss this tip" onClick={()=>setDismissed(true)}>×</button>
        <div className="ku-guide-meta"><span className="ku-guide-role">{hint.role}</span><span className="ku-guide-progress">Step {IDS.indexOf(id)+1} of 12</span></div>
        <h2>{offRoute?'Exploring the demo':hint.title}</h2>
        <p>{offRoute?'You’ve opened another area. Return to this step whenever you’re ready to continue.':hint.emphasis && hint.text.includes(hint.emphasis)?<>{hint.text.split(hint.emphasis)[0]}<strong>{hint.emphasis}</strong>{hint.text.split(hint.emphasis)[1]}</>:hint.text}</p>
        <div className="ku-guide-links">
          {offRoute?<button onClick={restore}>Return to guided screen →</button>:!layout.visible?<button onClick={showTarget}>Show me where →</button>:null}
          {extra && <button onClick={nextAction}>{id==='book'?'Show Continue reservation':id==='checkout'?'Show Reserve Now':'Show approval button'} →</button>}
        </div>
        </div>
      </motion.aside>}
    </AnimatePresence>
  </>;
}
createRoot(document.getElementById('ku-guidance')!).render(<Guide/>);
