/**
 * `asg-shop-card-set`
 * display card set icon/name and rarity icon/name
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
  capitalize,
  compose,
  curry,
  join,
  map
}                 from '@spriteful/lambda/lambda.js';
import htmlString from './asg-shop-card-set.html';
import services   from '@spriteful/services/services.js';
import './asg-set-icons.js';
import '@polymer/iron-icon/iron-icon.js';


class ASGShopCardSet extends SpritefulElement {
  static get is() { return 'asg-shop-card-set'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      card: Object,

      _hideIronIcon: {
        type: Boolean,
        value: false
      },

      _setIcon: {
        type: String,
        computed: '__computeSetIcon(card.set)'
      },

      isWhite: {
        type: Boolean,
        value: false
      }
    };
  }


  static get observers() {
    return [
      '__setIconChanged(_setIcon)'
    ];
  }


  __computeSetIcon(set) {
    if (!set) { return ''; }
    return `asg-set-icons:${set}`;
  }


  __computeRarityColor(rarity, isWhite) {
    if (!rarity || !isWhite) { return ''; }
    return rarity;
  }


  __computeRarityText(rarity) {
    if (!rarity) { return ''; }
    const split              = curry((separator, array) => array.split(separator));
    const splitBySpaces      = split(' ');
    const joinBySpaces       = join(' ');
    const capitalizeAllWords = compose(splitBySpaces, map(capitalize), joinBySpaces);
    const capitalized        = capitalizeAllWords(rarity);
    return capitalized;
  }

  
  async __setIconChanged(str) {
    if (!str) { return; }
    this.centerIcon();
  }
  // called by asg-shop-card-detail open method
  // must manually center each icon because they were all generated
  // by a program that left justifies each one
  centerIcon() {
    const svg = this.select('svg', this.$.setIcon);
    if (!svg) {
      this._hideIronIcon = true;
      console.warn('asg-shop-card-set no set found for: ', this._setIcon);
      // track missing icons
      // maybe can fill them in if its only a handful
      services.set({
        coll: 'cms/ui/orphaned-icons', 
        doc:   this._setIcon, 
        data:  {orphaned: this._setIcon},
        merge: false
      });
      return; 
    }
    const g             = svg.firstElementChild;
    const {width}       = g.getBoundingClientRect();
    const svgCenter     = 12; // svg is 24px wide
    const gCenter       = width / 2; // g can be less than full width
    const centered      = svgCenter - gCenter;
    svg.style.transform = `translateX(${centered}px)`;
    this._hideIronIcon  = false;
  }

}

window.customElements.define(ASGShopCardSet.is, ASGShopCardSet);
