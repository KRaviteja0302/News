'use client';

import { useState } from 'react';

type Placement='LEFT_RAIL'|'LEFT_RAIL_BOTTOM'|'RIGHT_RAIL'|'RIGHT_RAIL_BOTTOM'|'HEADER'|'HOME_BANNER'|'HOME_CARDS'|'CATEGORY_CARDS'|'ALL_PAGES';
type CategoryOption={id:string;name:string;nameTe:string|null;parentId:string|null;parent?:{name:string}|null};

const placementInfo:Record<Placement,{label:string;size:string;location:string}>={
  LEFT_RAIL:{label:'Left outer rail — Top',size:'300 × 600 px',location:'Upper position outside the left side on wide screens'},
  LEFT_RAIL_BOTTOM:{label:'Left outer rail — Bottom',size:'300 × 600 px',location:'Lower position outside the left side on wide screens'},
  RIGHT_RAIL:{label:'Right outer rail — Top',size:'300 × 600 px',location:'Upper position outside the right side on wide screens'},
  RIGHT_RAIL_BOTTOM:{label:'Right outer rail — Bottom',size:'300 × 600 px',location:'Lower position outside the right side on wide screens'},
  HEADER:{label:'Header masthead banner',size:'728 × 90 px',location:'Top header slot beside the website logo'},
  HOME_BANNER:{label:'HOME PAGE — Wide banner above carousel',size:'1200 × 250 px',location:'Full-width banner immediately above the homepage story carousel'},
  HOME_CARDS:{label:'HOME PAGE — Two middle image cards',size:'800 × 500 px',location:'Left or right card between Top Stories and Latest News'},
  CATEGORY_CARDS:{label:'Selected category cards',size:'800 × 500 px',location:'Inside the selected category page'},
  ALL_PAGES:{label:'All pages',size:'800 × 500 px',location:'Banner and content-card advertisement areas'}
};

export function AdPlacementFields({initialPlacement,initialCategoryId,initialHomeSlot,categories,placementCounts={},placementLimits={}}:{initialPlacement:Placement;initialCategoryId:string;initialHomeSlot:'LEFT'|'RIGHT'|null;categories:CategoryOption[];placementCounts?:Partial<Record<Placement,number>>;placementLimits?:Partial<Record<Placement,number>>}){
  const [placement,setPlacement]=useState<Placement>(initialPlacement);
  const initialCategory=categories.find(category=>category.id===initialCategoryId);
  const [parentId,setParentId]=useState(initialCategory?.parentId||initialCategoryId);
  const [subcategoryId,setSubcategoryId]=useState(initialCategory?.parentId?initialCategoryId:'');
  const [homeSlot,setHomeSlot]=useState(initialHomeSlot||'LEFT');
  const info=placementInfo[placement];
  const selectedCount=placementCounts[placement]||0;
  const selectedLimit=placementLimits[placement]||5;
  const selectedFull=placement!==initialPlacement&&selectedCount>=selectedLimit;
  const parentCategories=categories.filter(category=>!category.parentId);
  const subcategories=categories.filter(category=>category.parentId===parentId);
  return <>
    <label>Display position<select name="placement" value={placement} onChange={event=>setPlacement(event.target.value as Placement)}>{Object.entries(placementInfo).map(([value,item])=>{const typedValue=value as Placement;const count=placementCounts[typedValue]||0;const limit=placementLimits[typedValue]||5;const full=value!==initialPlacement&&count>=limit;return <option value={value} key={value} disabled={full}>{item.label} — {item.size} — {count}/{limit}{full?' FULL':''}</option>})}</select></label>
    {selectedFull&&<div className="placementFullNotice">This position already has {selectedLimit} active advertisements. Choose another position or ask the administrator to increase its capacity.</div>}
    <div className="placementHint"><strong>{info.label}</strong><span>{info.location}</span><small>Recommended image: {info.size}</small></div>
    {placement==='HOME_CARDS'&&<label>Homepage card position<select name="homeSlot" value={homeSlot} onChange={event=>setHomeSlot(event.target.value as 'LEFT'|'RIGHT')}><option value="LEFT">Left advertisement box</option><option value="RIGHT">Right advertisement box</option></select></label>}
    {placement==='CATEGORY_CARDS'&&<div className="categorySelectionFields"><input type="hidden" name="categoryId" value={subcategoryId||parentId}/><label>Category<select value={parentId} onChange={event=>{setParentId(event.target.value);setSubcategoryId('')}} required><option value="">Choose category</option>{parentCategories.map(category=><option key={category.id} value={category.id}>{category.name} / {category.nameTe||category.name}</option>)}</select></label><label>Subcategory<select value={subcategoryId} onChange={event=>setSubcategoryId(event.target.value)} disabled={!parentId||!subcategories.length}><option value="">{!parentId?'Choose a category first':subcategories.length?'All '+(categories.find(category=>category.id===parentId)?.name||'category'):'No subcategories available'}</option>{subcategories.map(category=><option key={category.id} value={category.id}>{category.name} / {category.nameTe||category.name}</option>)}</select></label></div>}
  </>
}
