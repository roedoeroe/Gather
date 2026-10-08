const disclosure=document.querySelector('.popup-capture');let loaded=false;
disclosure?.addEventListener('toggle',()=>{if(disclosure.open&&!loaded){loaded=true;import('./capture-ui.js').catch(error=>{loaded=false;document.getElementById('captureTools').textContent='Capture controls could not load: '+error.message;});}});
