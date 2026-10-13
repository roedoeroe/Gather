// Shared provider landing routes. Image selection/copy happens locally; no private upload API.
// No guessed upload endpoints, automatic clipboard reads or extra permissions.
export const IMAGE_PROVIDERS=Object.freeze({
  google:{name:'Google Lens',url:'https://images.google.com/',guidance:'Google Lens: click Search by image, then paste if offered or choose Upload a file. For upload, use Save selected image in Gather’s Upload options first.'},
  lenso:{name:'Lenso.ai',url:'https://lenso.ai/en',guidance:'Lenso.ai: use its upload control. Save the selected image using Gather’s Upload options first. Region or site policy may block access.'},
  bing:{name:'Bing Visual Search',url:'https://www.bing.com/visualsearch',guidance:'Bing: open Visual Search and paste or upload the selected image. If it redirects or is blocked, keep this selection and choose another provider.'},
  yandex:{name:'Yandex Images',url:'https://yandex.com/images/',guidance:'Yandex: click the image-search icon, then paste the copied image with Ctrl+V (⌘V on Mac). Upload is also available.'},
  baidu:{name:'Baidu Images',url:'https://image.baidu.com/',guidance:'Baidu: open its image-search upload control if available. Use Save selected image in Gather’s Upload options, then upload that file. Access varies.'},
  sogou:{name:'Sogou Images',url:'https://pic.sogou.com/',guidance:'Sogou: open its image-search upload control if available. Use Save selected image in Gather’s Upload options, then upload that file. Access varies.'},
  tineye:{name:'TinEye',url:'https://tineye.com/',guidance:'TinEye: use its Upload control. Use Save selected image in Gather’s Upload options to obtain the exact selected file.'},
  shutterstock:{name:'Shutterstock',url:'https://www.shutterstock.com/',guidance:'Shutterstock: use its image-search upload control if offered. Save the selected image from Gather’s Upload options first. Access or a subscription may be required; submission is unverified.'}
});
export function imageSearchUrl(provider){
  if(!Object.hasOwn(IMAGE_PROVIDERS,provider))throw new Error('Choose an image search provider.');
  return IMAGE_PROVIDERS[provider].url;
}
