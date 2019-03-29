
import services from '@spriteful/services/services.js';


// card palette changed helper
const makeRgbString = array => array.reduce((accum, num) => {
  if (accum) {
    accum = `${accum}, ${num}`;
  }
  else {
    accum = `${num}`;
  }
  return accum;
});


export const AsgShopCardMixin = superClass => {
  return class AsgShopCardMixin extends superClass {

    static get properties() {
      return {
        
      	card: Object,

	      _face: {
	        type: Number,
	        value: 0
	      }

      };
    }


    static get observers() {
	    return [
	      '__cardPaletteChanged(card.palette, card.card_faces, _face)'
	    ];
	  }

	  
    __cardPaletteChanged(palette, faces, face) {
	    if (!palette && !faces) { return; }
	    const colors = faces && !palette ? faces[face].palette : palette;
	    if (!colors) { 
	      console.warn('No palette for this card!');
	      // track missing palettes
	      services.set({
	        coll: 'cms/ui/missing-palettes', 
	        doc:   this.card.name, 
	        data:  {missingPalette: this.card.name},
	        merge: false
	      });
	      return;
	    }
	    
	    const {
	      DarkMuted,
	      DarkVibrant,
	      LightMuted,
	      LightVibrant,
	      Muted,
	      Vibrant
	    } = colors;	    

	    const dictionary = {    
	      '--dark-muted-color':          DarkMuted    ? DarkMuted.hex      : '',      
	      '--dark-muted-rgb':            DarkMuted    ? makeRgbString(DarkMuted.rgb) : '',
	      '--dark-muted-title-color':    DarkMuted    ? DarkMuted.title    : '',
	      '--dark-vibrant-color':        DarkVibrant  ? DarkVibrant.hex    : '',
	      '--dark-vibrant-rgb':          DarkVibrant  ? makeRgbString(DarkVibrant.rgb) : '',
	      '--dark-vibrant-title-color':  DarkVibrant  ? DarkVibrant.title  : '',
	      '--light-muted-color':         LightMuted   ? LightMuted.hex     : '',
	      '--light-muted-body-color':    LightMuted   ? LightMuted.body    : '',
	      '--light-muted-title-color':   LightMuted   ? LightMuted.title   : '',
	      '--light-vibrant-color':       LightVibrant ? LightVibrant.hex   : '',    
	      '--light-vibrant-body-color':  LightVibrant ? LightVibrant.body  : '',
	      '--light-vibrant-title-color': LightVibrant ? LightVibrant.title : '',
	      '--muted-color':               Muted        ? Muted.hex          : '',
	      '--muted-title-color':         Muted        ? Muted.title        : '',
	      '--vibrant-color':             Vibrant      ? Vibrant.hex        : '',
	      '--vibrant-title-color':       Vibrant      ? Vibrant.title      : ''
	    };

	    const getSafariClearRgb = () => {
	      if (LightVibrant) {
	        return LightVibrant.rgb;
	      } 
	      if (LightMuted) {
	        return LightMuted.rgb;
	      }
	      return [];
	    };

	    const [r, g, b] = getSafariClearRgb();
	    // rgb values MUST be ints for safari
	    dictionary['--safari-clear'] = r ? 
	    	`rgba(${r.toFixed()}, ${g.toFixed()}, ${b.toFixed()}, 0)` : '';
	    this.updateStyles(dictionary);
	  }

  };
};
