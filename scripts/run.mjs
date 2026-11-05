import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { spawnSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { MessageChannel } from 'node:worker_threads';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM, VirtualConsole } from 'jsdom';

// Native TypeScript and child Node processes share the documented 1 GiB QA envelope.
process.env.GOMAXPROCS ??= '2';
process.env.GOMEMLIMIT ??= '512MiB';
process.env.NODE_OPTIONS ??= '--max-old-space-size=384';

function run(program,args,env={}){
  const result=spawnSync(program,args,{stdio:'inherit',timeout:180000,env:{...process.env,...env}});
  if(result.error)throw result.error;
  if(result.status!==0)throw Error(`${program} exited ${result.status}`);
}
async function nodeBuild(entry,file){
  await build({configFile:false,envDir:false,plugins:[react()],build:{ssr:entry,target:'node22',outDir:'build/tests',emptyOutDir:false,minify:false,rollupOptions:{output:{format:'es',entryFileNames:file}}}});
}
async function domTest(){
  const channels=[];
  class TrackedChannel extends MessageChannel{constructor(){super();channels.push(this);}}
  const errors=[],console=new VirtualConsole();
  console.on('jsdomError',e=>errors.push(e.message));
  console.on('error',(...args)=>errors.push(args.map(String).join(' ')));
  console.on('warn',(...args)=>errors.push(args.map(String).join(' ')));
  const dom=new JSDOM('<!doctype html><html><body></body></html>',{runScripts:'outside-only',url:'https://cabinet.invalid/',pretendToBeVisual:true,virtualConsole:console});
  Object.defineProperty(dom.window,'MessageChannel',{value:TrackedChannel});
  let timer;
  try{
    vm.runInContext(await readFile('build/tests/dom/dom.iife.js','utf8'),dom.getInternalVMContext(),{timeout:5000,filename:'cabinet-dom-tests.js'});
    const result=await Promise.race([dom.window.__cabinetDone,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('DOM test deadline')),20000);})]);
    assert.deepEqual(errors,[]);
    assert.equal(result.reactDOM,true);
    process.stdout.write(JSON.stringify(result)+'\n');
  }finally{
    clearTimeout(timer);
    for(const c of channels){c.port1.close();c.port2.close();}
    dom.window.close();
  }
}
async function productionAssertions(){
  const html=await readFile('dist/index.html','utf8');
  const first=html.match(/<body[^>]*>([\s\S]*?)<div/)[1];
  assert.ok(first.startsWith('<!-- THESIS seed325ed87b:'));
  for(const block of ['OWN-WORLD:','STORY:','FIRSTVIEWPORT:','FORM:','FINISH:'])assert.ok(first.includes(block));
  assert.ok(first.includes('unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.'));
  assert.ok(first.split(/\s+/).length<=150);
  assert.ok(html.includes('/cabinet-assembly-studio/assets/'));
  assert.ok(!/https?:\/\/[^"']+\.(js|css)/.test(html));
  const assets=await readdir('dist/assets');
  assert.ok(assets.some(v=>v.endsWith('.woff2')),'self-hosted fonts emitted');
  assert.ok(assets.some(v=>v.endsWith('.js')),'application bundle emitted');
  const css=await Promise.all(assets.filter(v=>v.endsWith('.css')).map(v=>readFile('dist/assets/'+v,'utf8')));
  assert.ok(css.join('').includes('Public Sans'));
  assert.ok(css.join('').includes('/cabinet-assembly-studio/assets/'));
  assert.ok((await readdir('dist/licenses')).length>=7);
  const notice=await readFile('dist/THIRD_PARTY_NOTICES.txt','utf8');
  const bundled=JSON.parse(await readFile('dist/licenses/bundled-packages.json','utf8'));
  const names=bundled.packages.map(row=>row.name);
  for(const name of ['react','react-dom','scheduler','@babel/runtime','@fontsource-variable/public-sans']){
    assert.ok(names.includes(name),`actual retained package notice: ${name}`);
    const original=await readFile(`node_modules/${name}/LICENSE`,'utf8');
    assert.ok(notice.includes(original),`original full copyright/license retained: ${name}`);
  }
  assert.ok(bundled.packages.find(row=>row.name==='@react-three/fiber').embeddedReact);
  assert.ok(notice.includes('Copyright (c) Meta Platforms, Inc. and affiliates.'));
  for(const row of bundled.packages)for(const chunk of row.chunks)await readFile('dist/'+chunk);
  assert.ok(!notice.includes('/work/'));

}
const mode=process.argv[2];
if(mode==='demo'){
  await nodeBuild('src/cli.ts','cli.mjs');
  run(process.execPath,['build/tests/cli.mjs',...process.argv.slice(3)]);
}else if(mode==='test'){
  run('npm',['run','typecheck']);
  await nodeBuild('tests/core.test.ts','core.test.mjs');
  await nodeBuild('tests/scene.tsx','scene.test.mjs');
  run(process.execPath,['--test','--test-concurrency=1','build/tests/core.test.mjs','build/tests/scene.test.mjs'],{NODE_ENV:'test'});
  await build({configFile:false,envDir:false,plugins:[react()],define:{'process.env.NODE_ENV':JSON.stringify('development'),'process.env.RTL_SKIP_AUTO_CLEANUP':JSON.stringify('true')},build:{target:'es2022',outDir:'build/tests/dom',emptyOutDir:true,minify:false,lib:{entry:'tests/dom.tsx',name:'CabinetDOMTests',formats:['iife'],fileName:()=> 'dom.iife.js'}}});
  await test('actual ReactDOM interactions and real OrbitControls lifecycle in isolated JSDOM VM',{timeout:25000},domTest);
  await build({configFile:'vite.config.ts',base:'/cabinet-assembly-studio/'});
  await test('production subpath assets and first-body seed comment',productionAssertions);
}else{
  throw Error('Expected test or demo');
}
