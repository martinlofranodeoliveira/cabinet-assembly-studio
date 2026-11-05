import React from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PerspectiveCamera } from 'three';
import { App, NavigationButton } from '../src/App';
import { connectNavigation } from '../src/Scene';
import { type StoragePort } from '../src/store';
import { exportJSON, concept, defaults } from '../src/core';
import { type Locale } from '../src/i18n';

declare global { interface Window { __cabinetDone: Promise<Record<string, unknown>> } }
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
function check(value: unknown, message: string): void { if(!value) throw Error(message); }
class Memory implements StoragePort {
  value:string|null=null; fail=false;
  getItem(){if(this.fail) throw Error('blocked');return this.value;}
  setItem(_k:string,v:string){if(this.fail)throw Error('full');this.value=v;}
}
function NavigationFocusHarness({locale}:{locale:Locale}){
  const [navigation,setNavigation]=React.useState(false);
  return <><NavigationButton navigation={navigation} setNavigation={setNavigation} available locale={locale}/><input aria-label="Focus destination"/></>;
}
window.__cabinetDone=(async()=>{
  const mem=new Memory(), exports:string[]=[];
  const view=render(<App storage={mem} webgl={false} onExport={(_f,c)=>{exports.push(c);}}/>);
  const user=userEvent.setup({document:window.document});
  await waitFor(()=>check(view.getByText(/3D indisponível/),'fallback status'));
  check(document.documentElement.lang==='pt-BR','PT default');
  await user.click(view.getByRole('button',{name:'Carregar salvo'}));
  check(view.getByRole('alert').textContent?.includes('Selecione um conceito salvo'),'missing selection is recoverable');
  const sideViews=view.getAllByRole('img',{name:'Lateral · Z/Y (mm)'});
  check(sideViews.length>=1,'precise fallback');
  check(sideViews[0]!.querySelectorAll('rect')[4]?.classList.contains('selected-panel'),'selected side-left rendered on top in side projection');
  await user.click(view.getByRole('button',{name:/^Fundo 564/}));
  check(view.getByTestId('selected-size').textContent==='564 × 764 × 6 mm','DOM back selection');
  check(sideViews[0]!.querySelectorAll('rect')[4]?.textContent?.startsWith('Fundo:'),'selected back rendered on top in projection');
  fireEvent.change(view.getByLabelText('Largura W'),{target:{value:'36'}});
  await user.click(view.getByRole('button',{name:'Aplicar dimensões'}));
  check(view.getByRole('alert').textContent?.includes('W − 2t'),'cross-field PT error');
  check(view.getByTestId('clear').textContent==='564 / 764 / 382 mm','invalid model preserved');
  await user.click(view.getByRole('button',{name:'Exportar JSON'}));
  check(exports[0]===exportJSON(concept('Gabinete 01',defaults)),'export last accepted state');
  fireEvent.change(view.getByLabelText('Idioma'),{target:{value:'en'}});
  check(document.documentElement.lang==='en','EN root language');
  check(view.getByRole('button',{name:'Undo'}).hasAttribute('disabled'),'locale did not create history');
  await user.click(view.getByRole('button',{name:'Apply dimensions'}));
  check(view.getByRole('alert').textContent?.includes('must be at least 1 mm'),'EN error translation');
  await user.click(view.getByRole('button',{name:'Export JSON'}));
  check(exports[0]===exports[1],'locale-independent canonical JSON');
  fireEvent.change(view.getByLabelText('Width W'),{target:{value:'720'}});
  await user.click(view.getByRole('button',{name:'Apply dimensions'}));
  check(view.getByTestId('clear').textContent==='684 / 764 / 382 mm','atomic valid update');
  await user.click(view.getByRole('button',{name:'Undo'}));
  check(view.getByTestId('clear').textContent==='564 / 764 / 382 mm','undo');
  await user.click(view.getByRole('button',{name:'Redo'}));
  check(view.getByTestId('clear').textContent==='684 / 764 / 382 mm','redo');
  fireEvent.change(view.getByLabelText('Name for saving or renaming'),{target:{value:'Synthetic saved'}});
  await user.click(view.getByRole('button',{name:'Save copy'}));
  check(view.getByRole('option',{name:'Synthetic saved'}),'saved option');
  const stored=mem.value;
  fireEvent.change(view.getByLabelText('Language'),{target:{value:'pt-BR'}});
  check(mem.value===stored,'locale did not write storage');
  fireEvent.change(view.getByLabelText('Nome para salvar ou renomear'),{target:{value:'Sintético renomeado'}});
  await user.click(view.getByRole('button',{name:'Renomear salvo'}));
  check(view.getByRole('option',{name:'Sintético renomeado'}),'rename PT');
  fireEvent.change(view.getByLabelText('Largura W'),{target:{value:'800'}});
  await user.click(view.getByRole('button',{name:'Aplicar dimensões'}));
  await user.click(view.getByRole('button',{name:'Carregar salvo'}));
  check(view.getByTestId('clear').textContent==='684 / 764 / 382 mm','load saved geometry');
  mem.fail=true;
  await user.click(view.getByRole('button',{name:'Salvar cópia'}));
  check(view.getByRole('alert').textContent?.includes('Armazenamento indisponível'),'PT storage failure');
  await user.click(view.getByRole('button',{name:'Exportar SVG'}));
  check(exports.at(-1)?.startsWith('<svg'),'export still works after storage failure');
  let read=false;
  fireEvent.change(view.getByLabelText('Arquivo JSON (até 64 KiB)'),{target:{files:[{size:65537,text:async()=>{read=true;return '{}';}}]}});
  await waitFor(()=>check(view.getByRole('alert').textContent?.includes('64 KiB'),'file size error'));
  check(!read,'file bounded before text');
  fireEvent.change(view.getByLabelText('Idioma'),{target:{value:'en'}});
  check(view.getByRole('alert').textContent?.includes('File exceeds 64 KiB'),'error changes locale');
  fireEvent.change(view.getByLabelText('JSON file (up to 64 KiB)'),{target:{files:[{size:1,text:async()=>'{'}]}});
  await waitFor(()=>check(view.getByRole('alert').textContent?.includes('Invalid JSON'),'EN invalid file'));
  check(view.getByTestId('clear').textContent==='684 / 764 / 382 mm','invalid file atomicity');
  mem.fail=false;
  await user.click(view.getByRole('button',{name:'Read storage again'}));
  check(!view.queryByRole('alert'),'recoverable storage action');
  check(view.getByRole('button',{name:'Navigate in 3D'}).hasAttribute('disabled'),'3D-only navigation disabled in fallback');
  check(view.getByRole('button',{name:'Fit'}).hasAttribute('disabled'),'camera fit disabled without a scene');
  cleanup();

  // Local-library management remains distinct from adding a new copy, in both locales.
  for (const locale of ['pt-BR','en'] as const) {
    const memory = new Memory();
    const libraryView=render(<App storage={memory} webgl={false}/>);
    const en=locale==='en';
    if(en)fireEvent.change(libraryView.getByLabelText('Idioma'),{target:{value:'en'}});
    const button=(pt:string,english:string)=>libraryView.getByRole('button',{name:en?english:pt});
    const count=()=>libraryView.getByLabelText(en?'Saved concepts':'Conceitos salvos').textContent;
    const width=libraryView.getByLabelText(en?'Width W':'Largura W');
    const name=libraryView.getByLabelText(en?'Name for saving or renaming':'Nome para salvar ou renomear');
    check(count()==='0/10','saved capacity visible');
    for(let i=0;i<10;i++){
      fireEvent.change(name,{target:{value:`Copy ${i}`}});
      await user.click(button('Salvar cópia','Save copy'));
    }
    check(count()==='10/10'&&button('Salvar cópia','Save copy').hasAttribute('disabled'),'full library cannot add an eleventh copy');
    fireEvent.change(width,{target:{value:'720'}});
    await user.click(button('Aplicar dimensões','Apply dimensions'));
    await user.click(button('Atualizar selecionado','Update selected'));
    const saved=JSON.parse(memory.value!).entries as {id:number;document:{name:string;parameters:{W:number}}}[];
    check(saved.length===10&&saved[9]!.document.name==='Copy 9'&&saved[9]!.document.parameters.W===720,'update replaces selected dimensions and preserves saved name');
    check(saved[0]!.document.parameters.W===600,'update does not overwrite another copy');
    await user.click(button('Remover salvo','Remove saved'));
    check(count()==='10/10','remove requires confirmation');
    await user.click(button('Cancelar remoção','Cancel removal'));
    check(count()==='10/10'&&!libraryView.queryByRole('button',{name:en?'Confirm removal':'Confirmar remoção'}),'cancel keeps all copies');
    check(document.activeElement===button('Remover salvo','Remove saved'),'cancel returns focus');
    await user.click(button('Remover salvo','Remove saved'));
    await user.click(button('Confirmar remoção','Confirm removal'));
    check(count()==='9/10'&&!button('Salvar cópia','Save copy').hasAttribute('disabled'),'removal frees one slot');
    check(libraryView.getByTestId('clear').textContent==='684 / 764 / 382 mm','removal preserves the working concept');
    check(button('Atualizar selecionado','Update selected').hasAttribute('disabled'),'removed selection cannot be updated');
    await user.click(button('Salvar cópia','Save copy'));
    check(count()==='10/10','Save copy still creates an additional entry');
    cleanup();
  }

  // A positive file-read barrier exposes stale completion ordering without sleeps.
  for (const locale of ['pt-BR','en'] as const) {
    const delayedView=render(<App storage={new Memory()} webgl={false}/>);
    if(locale==='en')fireEvent.change(delayedView.getByLabelText('Idioma'),{target:{value:'en'}});
    let finish!:(value:string)=>void;
    const pending=new Promise<string>(resolve=>{finish=resolve;});
    const fileLabel=locale==='pt-BR'?'Arquivo JSON (até 64 KiB)':'JSON file (up to 64 KiB)';
    fireEvent.change(delayedView.getByLabelText(fileLabel),{target:{files:[{size:1,text:()=>pending}]}});
    fireEvent.change(delayedView.getByLabelText(locale==='pt-BR'?'Largura W':'Width W'),{target:{value:'720'}});
    await user.click(delayedView.getByRole('button',{name:locale==='pt-BR'?'Aplicar dimensões':'Apply dimensions'}));
    check(delayedView.getByTestId('clear').textContent==='684 / 764 / 382 mm','newer dimension edit applied before read completion');
    await act(async()=>{finish(exportJSON(concept('Delayed original',defaults)));});
    check(delayedView.getByTestId('clear').textContent==='684 / 764 / 382 mm','stale import cannot overwrite a newer accepted edit');
    async function heldRead() {
      let release!:(value:string)=>void;
      const promise=new Promise<string>(resolve=>{release=resolve;});
      fireEvent.change(delayedView.getByLabelText(fileLabel),{target:{files:[{size:1,text:()=>promise}]}});
      return release;
    }
    const width=()=>delayedView.getByLabelText(locale==='pt-BR'?'Largura W':'Width W') as HTMLInputElement;
    const applyLabel=locale==='pt-BR'?'Aplicar dimensões':'Apply dimensions';
    const oldDraft=await heldRead();
    fireEvent.change(width(),{target:{value:'900'}});
    await act(async()=>{oldDraft(exportJSON(concept('Old draft',{...defaults,W:800})));});
    check(width().value==='900','stale read cannot discard a newer unapplied draft');
    check(delayedView.getByTestId('clear').textContent==='684 / 764 / 382 mm','draft leaves accepted model unchanged');
    const beforeUndo=await heldRead();
    await user.click(delayedView.getByRole('button',{name:locale==='pt-BR'?'Desfazer':'Undo'}));
    await act(async()=>{beforeUndo(exportJSON(concept('Old undo',{...defaults,W:800})));});
    check(delayedView.getByTestId('clear').textContent==='564 / 764 / 382 mm','undo supersedes older read');
    const beforeRedo=await heldRead();
    await user.click(delayedView.getByRole('button',{name:locale==='pt-BR'?'Refazer':'Redo'}));
    await act(async()=>{beforeRedo(exportJSON(concept('Old redo',{...defaults,W:800})));});
    check(delayedView.getByTestId('clear').textContent==='684 / 764 / 382 mm','redo supersedes older read');
    await user.click(delayedView.getByRole('button',{name:locale==='pt-BR'?'Salvar cópia':'Save copy'}));
    fireEvent.change(width(),{target:{value:'800'}});
    await user.click(delayedView.getByRole('button',{name:applyLabel}));
    const beforeLoad=await heldRead();
    await user.click(delayedView.getByRole('button',{name:locale==='pt-BR'?'Carregar salvo':'Load saved'}));
    await act(async()=>{beforeLoad(exportJSON(concept('Old load',defaults)));});
    check(delayedView.getByTestId('clear').textContent==='684 / 764 / 382 mm','load supersedes older read');
    cleanup();
    const focusView=render(<NavigationFocusHarness locale={locale}/>);
    const toggle=focusView.getByRole('button',{name:locale==='pt-BR'?'Navegar em 3D':'Navigate in 3D'});
    await user.click(toggle);
    const destination=focusView.getByLabelText('Focus destination');
    await user.click(destination);check(document.activeElement===destination,'focus moved away from toggle');
    fireEvent.keyDown(document,{key:'Escape'});
    check(document.activeElement===toggle&&toggle.getAttribute('aria-pressed')==='false','Escape exits and returns focus to the real toggle');
    await user.click(destination);fireEvent.keyDown(document,{key:'Escape'});
    check(document.activeElement===destination,'inactive navigation removes Escape listener');
    cleanup();
  }

  // Real Three OrbitControls, on an isolated DOM canvas, not a CSS proxy.
  const canvas=document.createElement('canvas');document.body.append(canvas);canvas.style.touchAction='pan-y';
  const active=new Map<string,Set<EventListenerOrEventListenerObject>>();
  const add=canvas.addEventListener.bind(canvas), remove=canvas.removeEventListener.bind(canvas);
  const globalActive=new Map<string,Set<EventListenerOrEventListenerObject>>();
  const docAdd=document.addEventListener.bind(document),docRemove=document.removeEventListener.bind(document);
  document.addEventListener=((type:string,listener:EventListenerOrEventListenerObject,options?:boolean|AddEventListenerOptions)=>{
    if(!globalActive.has(type))globalActive.set(type,new Set());globalActive.get(type)!.add(listener);docAdd(type,listener,options);
  }) as typeof document.addEventListener;
  document.removeEventListener=((type:string,listener:EventListenerOrEventListenerObject,options?:boolean|EventListenerOptions)=>{
    globalActive.get(type)?.delete(listener);docRemove(type,listener,options);
  }) as typeof document.removeEventListener;
  canvas.addEventListener=((type:string,listener:EventListenerOrEventListenerObject,options?:boolean|AddEventListenerOptions)=>{
    if(!active.has(type))active.set(type,new Set());active.get(type)!.add(listener);add(type,listener,options);
  }) as typeof canvas.addEventListener;
  canvas.removeEventListener=((type:string,listener:EventListenerOrEventListenerObject,options?:boolean|EventListenerOptions)=>{
    active.get(type)?.delete(listener);remove(type,listener,options);
  }) as typeof canvas.removeEventListener;
  for(let i=0;i<3;i++){
    const camera=new PerspectiveCamera(35,1,.001,100);camera.position.z=-3;
    const dispose=connectNavigation(camera,canvas,()=>{});
    check(canvas.style.touchAction==='none','actual controls connect touches inline style');
    check((active.get('wheel')?.size??0)>0,'wheel listener mounted only during navigation');
    canvas.dispatchEvent(new KeyboardEvent('keydown',{key:'Control',code:'ControlLeft',bubbles:true}));
    dispose();
    check([...globalActive.values()].every(v=>v.size===0),'held Control leaves no global document listener after dispose');
    check(canvas.style.touchAction==='pan-y','cleanup restores actual canvas touch action');
    check([...active.values()].every(v=>v.size===0),'controls listeners removed');
    const event=new WheelEvent('wheel',{cancelable:true});canvas.dispatchEvent(event);
    check(!event.defaultPrevented,'wheel not trapped after exit');
  }
  canvas.remove();
  return {reactDOM:true,locales:['pt-BR','en'],fallback:true,atomicity:true,storageRecovery:true,actualOrbitControlsLifecycle:true,webgl:false,browser:false,visualQA:false};
})();
