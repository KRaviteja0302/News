type LinkableAdvertisement={id:string;linkUrl:string|null;description:string|null;descriptionTe:string|null;longDescription:string|null;longDescriptionTe:string|null};

export function advertisementHref(ad:LinkableAdvertisement){
  return `/ad/click/${ad.id}`;
}
