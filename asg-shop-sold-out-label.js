/**
 * `asg-shop-sold-out-label`
 * 
 * This label is visible when there are no cards available for sale in any condition/foil
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
import htmlString from './asg-shop-sold-out-label.html';


class ASGShopSoldOutLabel extends SpritefulElement {
  static get is() { return 'asg-shop-sold-out-label'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      buylist: {
        type: Boolean,
        value: false
      },

      card: Object, 

      _soldOut: {
      	type: Boolean,
      	value: false,
      	computed: '__computeSoldOut(card, buylist)',
      	observer: '__soldOutChanged'
      }  
      
    };
  }


  __computeSoldOut(card, buylist) {
    if (buylist) { return false; }
    if (!card) { return false; }
    const {foil, notFoil} = card;
    const foilQtys    = Object.values(foil).map(obj => obj.qty);
    const notFoilQtys = Object.values(notFoil).map(obj => obj.qty);
    const qtys        = [...foilQtys, ...notFoilQtys];
    const inStock     = qtys.some(qty => 
                          typeof qty === 'number' && qty > 0);
    return !inStock;
  }


  __soldOutChanged(bool) {
  	if (bool) {
  		this.style.display = 'flex';
  	}
  	else {
  		this.style.display = 'none';
  	}
  }

}

window.customElements.define(ASGShopSoldOutLabel.is, ASGShopSoldOutLabel);
