// Shared provider landing routes. Image selection/copy happens locally; no private upload API.
// No guessed upload endpoints, automatic clipboard reads or extra permissions.
export const IMAGE_PROVIDERS=Object.freeze({
  google:{name:'Google Lens',url:'https://images.google.com/',guidance:'Google Lens: open its image search control, then paste the copied image where available. You can also choose Upload. No image is sent by Gather.'},
  lenso:{name:'Lenso.ai',url:'https://lenso.ai/en',guidance:'Lenso.ai requires its own image upload. Access may be blocked by region or site policy. Gather cannot verify submission.'},
  bing:{name:'Bing Visual Search',url:'https://www.bing.com/visualsearch',guidance:'Bing: use Visual Search to paste or upload. Some regions redirect to Microsoft Explore; availability varies.'},
  yandex:{name:'Yandex Images',url:'https://yandex.com/images/'},
  baidu:{name:'Baidu Images',url:'https://image.baidu.com/'},
  sogou:{name:'Sogou Images',url:'https://pic.sogou.com/'},
  tineye:{name:'TinEye',url:'https://tineye.com/'},
  shutterstock:{name:'Shutterstock',url:'https://www.shutterstock.com/',guidance:'Shutterstock: find its image-search upload control if available. Account, region or bot restrictions can block access.'}
});
export function imageSearchUrl(provider){
  if(!Object.hasOwn(IMAGE_PROVIDERS,provider))throw new Error('Choose an image search provider.');
  return IMAGE_PROVIDERS[provider].url;
}
