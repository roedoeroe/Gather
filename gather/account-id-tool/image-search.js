// Launch provider-owned tools. Gather never reads or uploads an image here.
// No guessed upload endpoints, automatic clipboard reads or extra permissions.
export const IMAGE_PROVIDERS=Object.freeze({
  google:{name:'Google Lens',url:'https://images.google.com/'},
  lenso:{name:'Lenso.ai',url:'https://lenso.ai/en'},
  bing:{name:'Bing Visual Search',url:'https://www.bing.com/visualsearch'},
  yandex:{name:'Yandex Images',url:'https://yandex.com/images/'},
  baidu:{name:'Baidu Images',url:'https://image.baidu.com/'},
  sogou:{name:'Sogou Images',url:'https://pic.sogou.com/'},
  tineye:{name:'TinEye',url:'https://tineye.com/'},
  shutterstock:{name:'Shutterstock',url:'https://www.shutterstock.com/'}
});
export function imageSearchUrl(provider){
  if(!Object.hasOwn(IMAGE_PROVIDERS,provider))throw new Error('Choose an image search provider.');
  return IMAGE_PROVIDERS[provider].url;
}
