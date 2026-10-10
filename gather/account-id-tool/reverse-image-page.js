import {mountReverseImage} from './reverse-image.js';
mountReverseImage(document.getElementById('reverseImage'),{captureId:new URL(location.href).searchParams.get('id')});
