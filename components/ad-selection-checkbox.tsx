'use client';

export function AdSelectionCheckbox({id}:{id:string}){
  return <input className="adSelectCheckbox" type="checkbox" name="adIds" value={id} form="bulk-ad-delete" aria-label="Select advertisement" onClick={event=>event.stopPropagation()}/>;
}
