/**
 * `asg-shop-card-badges`
 * display cartQty for each card type/condition
 * 
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
import {
  SpritefulElement, 
  html
}                 from '@spriteful/spriteful-element/spriteful-element.js';
import {
	compose, 
	head, 
	join, 
	letters, 
	map, 
	split
} 								from '@spriteful/lambda/lambda.js';
import htmlString from './asg-shop-card-badges.html';


const words 	 		= split(' ');
const combine  		= join('');
const initials 		= compose(words, map(letters), map(head), combine);
const displayStr 	= (qty, key) => `${qty} ${initials(key)}`;
const getCartQtys = (type, foilStr) => {
	const keys = Object.keys(type);
	const qtys = keys.	
								 filter(key => type[key].cartQty).
								 map(key => 
								 	 ({text: displayStr(type[key].cartQty, key), foilStr}));
	return qtys;
};


class ASGShopCardBadges extends SpritefulElement {
  static get is() { return 'asg-shop-card-badges'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {      
      
    	card: Object,
    	
    	_badges: {
    		type: Array,
    		computed: '__computeBadges(card.*)'
    	}

    };
  }


  __computeBadges(cardObj) {
  	const {base: card} = cardObj;
  	if (!card) { return []; }  	
  	const foils = getCartQtys(card.foil, 'foil');
  	const nots  = getCartQtys(card.notFoil, '');
  	return [...foils, ...nots];
  }

}

window.customElements.define(ASGShopCardBadges.is, ASGShopCardBadges);
