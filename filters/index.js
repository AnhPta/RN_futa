import { Dimensions, Platform } from 'react-native';

export function number (number, decimal) {
  decimal = typeof decimal === 'undefined' ? 0 : decimal
  return formatNumber(number, decimal)
}

export function vnd (money, decimal) {
  decimal = typeof decimal === 'undefined' ? 0 : decimal
  return formatNumber(money, decimal) + ' VND'
}

export function gam (gam, decimal) {
  decimal = typeof decimal === 'undefined' ? 0 : decimal
  return formatNumber(gam, decimal) + ' g'
}

export function cm (cm, decimal) {
  decimal = typeof decimal === 'undefined' ? 0 : decimal
  return formatNumber(cm, decimal) + ' cm'
}

export function percent (percent, decimal) {
  decimal = typeof decimal === 'undefined' ? 0 : decimal
  return formatNumber(percent, decimal) + ' %'
}

function formatNumber (number, places, thousand, decimal) {
  number = number || 0
  places = !isNaN(places = Math.abs(places)) ? places : 2
  thousand = thousand || ','
  decimal = decimal || '.'
  let negative = number < 0 ? '-' : ''
  let i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + ''
  let j = i.length
  j = j > 3 ? (j % 3) : 0

  return negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : '')
}

// Viết hoa chữ thường
export function ucFirstAllWords(str)
{
  var pieces = str.split(" ");
  for ( var i = 0; i < pieces.length; i++ )
  {
    var j = pieces[i].charAt(0).toUpperCase();
    pieces[i] = j + pieces[i].substr(1);
  }
  return pieces.join(" ");
}

export function isIphoneX() {
  let { height, width } = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    (height === 812 || width === 812)
  );
}

export function isIphoneXorAbove() {
  const dimen = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    ((dimen.height === 812 || dimen.width === 812) || (dimen.height === 896 || dimen.width === 896))
  );
}


