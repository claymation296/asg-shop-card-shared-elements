
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';
import htmlString from './asg-set-icons.html';

const setIcons 		 = document.createElement('div');
setIcons.innerHTML = htmlString;
setIcons.setAttribute('style', 'display: none;');
document.head.appendChild(setIcons);
