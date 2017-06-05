function randInt(min, max, positive) {
  let num;
  if (positive === false) {
    num = Math.floor(Math.random() * max) - min;
    num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
  } else {
    num = Math.floor(Math.random() * max) + min;
  }

  return num;
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
