// Check màu của gói hàng
export function checkColor (itemColor) {
  let color = '#fff'

  if (itemColor === 'Blue') {
    color = 'blue'
  }

  return color
}

// Check loại là F1,F2,F3 của gói hàng
export function checkTypePackage (barcode) {
  let type = 1
  if (barcode) {
    var res = barcode.substring(1, 2);
    if (res == 2) {
      type = 2
    }
    if (res == 3) {
      type = 3
    }
  }
  return type
}

export const playSoundSuccess = async (audioPlayer) => {
  try {
    await audioPlayer.unloadAsync()
    await audioPlayer.loadAsync(require("../../assets/mp3/iphone.mp3"));
    await audioPlayer.playAsync();
  } catch (err) {
  }
}

export const playSoundFail = async (audioPlayer) => {
  try {
    await audioPlayer.unloadAsync()
    await audioPlayer.loadAsync(require("../../assets/mp3/fail.mp3"));
    await audioPlayer.playAsync();
  } catch (err) {
  }
}
