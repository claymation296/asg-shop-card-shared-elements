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
import {schedule} from '@spriteful/utils/utils.js';
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
        computed: '__computeSetIcon(card)'
      },

      _knownNoIcon: {
        type: Object,
        value: {
          'asg-set-icons:4bb':  true, //4th black border
          'asg-set-icons:fbb':  true, //foreign black border
          'asg-set-icons:ptc':  true, //pro tour
          'asg-set-icons:wc97': true, 
          'asg-set-icons:wc98': true, 
          'asg-set-icons:wc99': true,
          'asg-set-icons:wc00': true,
          'asg-set-icons:wc01': true,
          'asg-set-icons:wc02': true,
          'asg-set-icons:wc03': true,
          'asg-set-icons:wc04': true,
          'asg-set-icons:pcel':  true, //Celebration Cards 
          'asg-set-icons:rqs':  true, //rival quick start
          'asg-set-icons:gk1':  true, //RNA Guild Kit
          'asg-set-icons:gk2':  true, //RNA Guild Kit
          'asg-set-icons:l12':  true, //League Tokens 2012
          'asg-set-icons:l13':  true, //League Tokens 2013
          'asg-set-icons:l14':  true, //League Tokens 2014
          'asg-set-icons:l15':  true, //League Tokens 2015
          'asg-set-icons:l16':  true, //League Tokens 2016
          'asg-set-icons:l17':  true, //League Tokens 2017
          'asg-set-icons:ovnt': true, //Vintage Championship
          'asg-set-icons:hho':  true //Happy Holidays
        }
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


  __computeSetIcon(card) {
    if (!card) { return ''; }
    const {set, layout, promo} = card;
    if (!set) { return ''; }
    const isToken = layout.includes('token');
    if (promo || isToken) {
      const [firstLetter, ...rest] = set.split('');
      if (firstLetter === 'p' || firstLetter === 't') {
        const newSet = rest.join('');
        return `asg-set-icons:${newSet}`;
      }
    }
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
  // by a program that left-justifies each one
  async centerIcon() {    
    await schedule();
    const svg = this.select('svg', this.$.setIcon);
    if (!svg) {
      this._hideIronIcon = true;
      const dontWarn = this._knownNoIcon[this._setIcon];
      if (dontWarn || this.card.promo) { return; }
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
    this._hideIronIcon  = false;
    // sometimes measurements fail even after the schedule
    if (width === 0) { return; } 
    const svgCenter     = 12; // svg is 24px wide
    const gCenter       = width / 2; // g can be less than full width
    const centered      = svgCenter - gCenter;
    svg.style.transform = `translateX(${centered}px)`;    
  }

}

window.customElements.define(ASGShopCardSet.is, ASGShopCardSet);
