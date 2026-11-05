import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { PerspectiveCamera, Vector3, type Mesh, type BoxGeometry, type MeshStandardMaterial } from 'three';
import { PanelScene, cameraPose, adapt } from '../src/Scene';
import { defaults, type PanelID } from '../src/core';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);

test('actual R3F scene objects: all dimensions, centered mm adapter, picking and selected identity', async()=>{
  let picked:PanelID='side-left';
  const select=(id:PanelID)=>{picked=id;};
  const renderer=await ReactThreeTestRenderer.create(<PanelScene p={defaults} explosion={0} selected="side-left" select={select}/>);
  const expected:[PanelID,number[],number[]][]=[
    ['side-left',[.018,.8,.4],[.291,0,0]],
    ['side-right',[.018,.8,.4],[-.291,0,0]],
    ['bottom',[.564,.018,.4],[0,-.391,0]],
    ['top',[.564,.018,.4],[0,.391,0]],
    ['back',[.564,.764,.006],[0,0,.185]]
  ];
  try{
    for(const [id,size,pos] of expected){
      const mesh=renderer.scene.findByProps({name:id}).instance as Mesh<BoxGeometry,MeshStandardMaterial>;
      assert.equal(mesh.isMesh,true);
      const actual=[mesh.geometry.parameters.width,mesh.geometry.parameters.height,mesh.geometry.parameters.depth];
      actual.forEach((n,i)=>near(n,size[i]!));
      mesh.position.toArray().forEach((n,i)=>near(n,pos[i]!));
      mesh.geometry.computeBoundingBox();
      assert.equal(mesh.geometry.boundingBox!.max.x,Math.fround(size[0]!/2));
      assert.equal(mesh.userData.panelId,id);
    }
    await renderer.fireEvent(renderer.scene.findByProps({name:'back'}),'click',{stopPropagation(){}});
    assert.equal(picked,'back');
    await renderer.update(<PanelScene p={defaults} explosion={1} selected={picked} select={select}/>);
    const meshes=expected.map(([id])=>renderer.scene.findByProps({name:id}).instance as Mesh<BoxGeometry,MeshStandardMaterial>);
    assert.deepEqual(meshes.filter(m=>m.userData.selected).map(m=>m.name),['back']);
    near(meshes[0]!.position.x,.451);near(meshes[1]!.position.x,-.451);
    near(meshes[2]!.position.y,-.551);near(meshes[3]!.position.y,.551);near(meshes[4]!.position.z,.345);
    near(meshes[4]!.geometry.parameters.depth,.006);
    assert.equal(meshes[4]!.material.color.getHexString(),'b9cdf3');
    await renderer.update(<PanelScene p={{...defaults,W:720}} explosion={0} selected="back" select={select}/>);
    const widened=renderer.scene.findByProps({name:'back'}).instance as Mesh<BoxGeometry>;
    near(widened.geometry.parameters.width,.684);near(widened.geometry.parameters.height,.764);
    near((renderer.scene.findByProps({name:'side-right'}).instance as Mesh).position.x,-.351);
  }finally{await renderer.unmount();}
});

test('front camera uses negative Z; fit sphere has independent corner margin at narrow aspect',()=>{
  for(const aspect of [.25,1,2]){
    const pose=cameraPose(defaults,1,aspect,'front');
    assert.ok(pose.position[2]<0);
    // Display bounds converted to metres about the nominal center.
    const corners=[[-.46,-.56,-.2],[.46,.56,.348]];
    const tangent=Math.tan(35*Math.PI/360);
    for(const point of corners){
      const depth=point[2]!-pose.position[2];
      assert.ok(Math.abs(point[0]!-pose.target[0])<depth*tangent*aspect);
      assert.ok(Math.abs(point[1]!-pose.target[1])<depth*tangent);
    }
  }
});

// Canonical X/Y/Z is a left-handed front-to-rear convention. Reflect display X
// before the negative-Z right-handed Three camera, preserving nominal data.
test('front projection preserves canonical left/right and up, without a GPU',()=>{
  const pose=cameraPose(defaults,0,1,'front');
  const camera=new PerspectiveCamera(35,1,.001,200);
  camera.position.set(...pose.position);camera.lookAt(...pose.target);camera.updateMatrixWorld();
  const left=new Vector3(...adapt([9,400,200],defaults)).project(camera);
  const right=new Vector3(...adapt([591,400,200],defaults)).project(camera);
  const up=new Vector3(...adapt([300,791,200],defaults)).project(camera);
  assert.ok(left.x<0&&right.x>0&&left.x<right.x);assert.ok(up.y>0);
  assert.ok(camera.position.z<0);
});
