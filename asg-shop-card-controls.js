/**
 * `asg-shop-card-details`
 * 
 * events:
 *        use this event to fix a blip in the exit ripple on safari
 *        the underlying element should update its background-color
 *        with the color passed in event detail
 *        'asg-shop-card-details-ios-flicker-fix-on-close', {color}
 *
 *        use this event to update selected props of the card-item that opened details
 *        'asg-shop-card-details-closing', {card}
 *
 *
 * methods:
 *
 *        open(detail) accepts the event detail from 'asg-shop-card-item-open-details' event
 *        returns a promise that resolves when all opening animations are complete
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
  listen, 
  schedule, 
  wait
}                 from '@spriteful/utils/utils.js';
import {clamp}    from '@spriteful/lambda/lambda.js';
import htmlString from './asg-shop-card-controls.html';
import '@spriteful/asg-shop-card-shared-elements/asg-shop-condition-selector.js';
import '@spriteful/asg-icons/asg-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-input/paper-input.js';


const format = (num, qty) => 
  (Number(num) * Math.max(1, qty)).toFixed(2);

const displayedPrice = ({price, sale}, qty) => {
  const displayed = sale && sale !== '0' ? sale : price; 
  // 'No Price' string must be as short as possilbe to
  // avoid breaking condition selector styles on very small screens
  return displayed ? `$ ${format(displayed, qty)}` : 'No Price'; 
};


class ASGShopCardControls extends SpritefulElement {
  static get is() { return 'asg-shop-card-controls'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {     

      card: Object,
      //for computing search for classes
      search: Boolean,

      selectorFrom: String,
        
      _availableQuantity: {
        type: Number,
        value: 0,
        computed: '__computeAvailQty(_condition, card.notFoil, card.foil, _foilChecked)'
      },

      _condition: {
        type: String,
        value: 'Near Mint',
        computed: '__computeCondition(card, _foilChecked)'
      },

      _conditionPrice: {
        type: String,
        value: '',
        computed: '__computeCondPrice(_condition, card.notFoil, card.foil, _foilChecked, _quantity)'
      },
      
      _foilChecked: {
        type: Boolean,
        value: false
      },

      _quantity: {
        type: Number,
        value: 0
      },
       
      _inputDisabled: {
        type: Boolean,
        computed: '__computeInputDisabled(_availableQuantity, _conditionPrice)'
      } 
      
    };
  }


  static get observers() {
    return [
      '__priceChanged(_conditionPrice)',
      '__inputDisabledChanged(_inputDisabled)',
      '__cardChanged(card)'
    ];
  }


  connectedCallback() {
    super.connectedCallback();

    listen(
      this, 
      'asg-shop-condition-selector-selected', 
      this.__conditionSelectedChanged.bind(this)
    );
    // one time setup since the __computePriceHideClass
    // sets this class before first entry animation should take place
    this.$.price.classList.remove('entry');
  }

  // adds search classes for asg-shop-card-item 
  __computeSearch(search) {
    return search ? 'search' : '';
  }
  
  // condition defaults to highest available condition
  __computeCondition(card, foilChecked) {
    if (!card) { return 'Near Mint'; }
    const isFoil = foilChecked ? 'foil' : 'notFoil';
    const {
      'Near Mint': nm, 
      'Lightly Played': lp, 
      'Moderately Played': mp, 
      'Heavily Played': hp
    } = card[isFoil];
    if (Number(nm.qty) && nm.available != 0) {
      return 'Near Mint';
    }
    if (Number(lp.qty) && lp.available != 0) {
      return 'Lightly Played';
    }
    if (Number(mp.qty) && mp.available != 0) {
      return 'Moderately Played';
    }
    if (Number(hp.qty) && hp.available != 0) {
      return 'Heavily Played';
    }
    return 'Near Mint';
  }

  // favor sale price over market price
  __computeCondPrice(condition, nonFoilConditions, foilConditions, foil, qty) {
    if (!condition) { return; }
    if (foil) {
      if (!foilConditions) { return ''; }
      return displayedPrice(foilConditions[condition], qty);
    }
    if (!nonFoilConditions) { return ''; }
    return displayedPrice(nonFoilConditions[condition], qty);
  }


  __computeQtyVal(card, quantity = 0) {
    if (!card || !card.selected) { 
      return quantity ? quantity : 1; 
    }
    return quantity ? quantity : card.selected.qty;
  }


  __computeAvailQty(condition, nonFoilConditions, foilConditions, foil) {
    if (!condition) { return 0; }
    const getQty = ({available, qty}) => {
      if (typeof available === 'number') {
        return available;
      }
      return qty ? Number(qty) : 0;
    };
    if (foil) {
      if (!foilConditions) { return 0; }
      return getQty(foilConditions[condition]);
    }
    if (!nonFoilConditions) { return 0; }
    return getQty(nonFoilConditions[condition]);
  }


  __computePriceDisabledClass(available) {
    return available ? '' : 'disabled';
  }


  __computeInputHideClass(qty, price) {
    return qty && price && price !== '0' ? '' : 'hide';
  }


  __computePriceHideClass(price) {
    return price && price !== '0' && price !== 'No Price' ? 'entry' : 'hide';
  }


  __computeInputDisabled(qty, price) {
    return !qty || !price || price === '0';
  }
  

  __conditionSelectedChanged(event) {
    this._condition = event.detail.value;
  }


  __computeNotAvailableWording(card, condition, foilChecked) {
    if (!card) { return; }
    const isFoil           = foilChecked ? 'foil' : 'notFoil';
    const {qty, available} = card[isFoil][condition];
    return available === 0 && qty > 0 ? 'All Available In Cart' : 'Not Available'; 
  }
  // fixes a bug where the description will not be displayed
  // if a card is removed from cart, listener in asg-shop-card-item
  __cardChanged(card) {
    if (!card) { return; }
    this._quantity = 1; // reset input each time card changes
    this.fire('asg-shop-card-controls-card-changed');
  }


  async __inputDisabledChanged(disabled) {
    await schedule();
    this.fire('asg-card-controls-hide-add-to-cart', {disabled});
  }


  __priceChanged(price) {
    if(!price) { return; }
    this.fire('open-asg-shop-card-details-fab');
  }


  __foilToggleChanged(event) {
    this._foilChecked = event.detail.value;
  }


  __qtyInputChanged() {
    const value    = Number(this.$.qty.value);
    // force update to input value via __computeQtyVal
    this._quantity = undefined; 
    this._quantity = clamp(1, this._availableQuantity, value);
  }


  async __conditionButtonClicked() {
    try {
      await this.clicked();
      this.$.condition.open();
      this.$.condition.style.pointerEvents = 'all';
    }
    catch (error) {
      if (error === 'click debounced') { return; }
      console.error(error);
    }
  }


  __setFocusOnQtyInput() {
    this.$.qty.focus();
  }

  //called from asg-shop-card-details
  closeConditionSelector(event) {
    this.$.condition.close();
  }

  // builds card object to add it to cart. called from details, item, and big-card
  addSelectedToCard() {
    const card = Object.assign(
      {}, 
      this.card, 
      {
        selected: {
          condition: this._condition, 
          foil:      this._foilChecked,
          qty:       Math.max(Number(this._quantity), 1)
        }
      }
    );
    this._quantity = 1; // reset input
    return card;
  }


  enterActions() {
    this.$.conditionBtn.classList.add('entry');
    this.$.conditionText.classList.add('entry');
    this.$.qtyBtn.classList.add('entry');
    this.$.qty.classList.add('entry');
    this.$.qtyNotAvail.classList.add('entry');
    this.$.qtyText.classList.add('entry');
    this.$.foilBtn.classList.add('entry');
    this.$.foilText.classList.add('entry');
    this.$.price.classList.add('entry');
  }


  hideActions() {
    this.$.conditionBtn.classList.remove('entry');
    this.$.conditionText.classList.remove('entry');
    this.$.qtyBtn.classList.remove('entry');
    this.$.qty.classList.remove('entry');
    this.$.qtyNotAvail.classList.remove('entry');
    this.$.qtyText.classList.remove('entry');
    this.$.foilBtn.classList.remove('entry');
    this.$.foilText.classList.remove('entry');
    this.$.price.classList.remove('entry');
  }

}

window.customElements.define(ASGShopCardControls.is, ASGShopCardControls);
