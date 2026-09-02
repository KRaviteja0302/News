import type { AdPlacement } from '@prisma/client';

export const advertisingPlacements:{placement:AdPlacement;name:string;size:string;description:string}[]=[
  {placement:'HOME_BANNER',name:'Homepage wide banner',size:'1200 × 250 px',description:'A prominent banner immediately above the homepage news carousel.'},
  {placement:'HEADER',name:'Header masthead banner',size:'728 × 90 px',description:'Displayed beside the publication logo at the top of the website.'},
  {placement:'HOME_CARDS',name:'Homepage middle cards',size:'800 × 500 px',description:'Two image-card positions between Top Stories and More Stories.'},
  {placement:'CATEGORY_CARDS',name:'Category page cards',size:'800 × 500 px',description:'Shown inside the news category selected in your advertisement CMS.'},
  {placement:'LEFT_RAIL',name:'Left rail — Top',size:'300 × 600 px',description:'The upper advertisement position outside the left side of the page.'},
  {placement:'LEFT_RAIL_BOTTOM',name:'Left rail — Bottom',size:'300 × 600 px',description:'The lower advertisement position outside the left side of the page.'},
  {placement:'RIGHT_RAIL',name:'Right rail — Top',size:'300 × 600 px',description:'The upper advertisement position outside the right side of the page.'},
  {placement:'RIGHT_RAIL_BOTTOM',name:'Right rail — Bottom',size:'300 × 600 px',description:'The lower advertisement position outside the right side of the page.'},
  {placement:'ALL_PAGES',name:'All-pages campaign',size:'800 × 500 px',description:'Broad visibility across available banner and content-card areas.'}
];

const labels:Record<AdPlacement,string>={
  HEADER:'Header masthead banner — 728 × 90 px',
  HOME_BANNER:'Home page — Wide banner above carousel — 1200 × 250 px',
  HOME_CARDS:'Home page — Two middle image cards — 800 × 500 px',
  CATEGORY_CARDS:'Selected category content cards — 800 × 500 px',
  ALL_PAGES:'All pages — Banner and content cards — 800 × 500 px',
  LEFT_RAIL:'Left outer page rail — Top — 300 × 600 px',
  LEFT_RAIL_BOTTOM:'Left outer page rail — Bottom — 300 × 600 px',
  RIGHT_RAIL:'Right outer page rail — Top — 300 × 600 px',
  RIGHT_RAIL_BOTTOM:'Right outer page rail — Bottom — 300 × 600 px'
};

export function adPlacementLabel(placement:AdPlacement){return labels[placement]}
