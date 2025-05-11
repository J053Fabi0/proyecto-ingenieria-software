/**
 * Given an integer in string format, fix its decimals.
 */
export function toFixedS(string: string | number | bigint, decimals: number) {
  string = string.toString();
  const indexOfDot = string.indexOf(".");
  if (indexOfDot === -1) return string.toString();
  const intPart = string.substring(0, indexOfDot);
  if (decimals === 0) return intPart;
  const decimalPart = string.substring(indexOfDot + 1, indexOfDot + 1 + decimals);
  return intPart + "." + decimalPart;
}

/**
 * Move the "." decimal point of a number in string format. The position could be negative or positive.
 */
export function moveDecimalDot(string: string | number | bigint, positions: number) {
  string = string.toString();
  if (positions === 0) return string.toString();
  const indexOfDot = string.indexOf(".");
  const intPart = indexOfDot === -1 ? string : string.substring(0, indexOfDot);
  const decimalPart = indexOfDot === -1 ? "" : string.substring(indexOfDot + 1, string.length);

  if (positions > 0) {
    return (
      intPart +
      decimalPart.substring(0, positions) +
      (positions >= decimalPart.length ? "" : ".") +
      decimalPart.substring(positions, decimalPart.length) +
      (positions >= decimalPart.length ? "0".repeat(positions - decimalPart.length) : "")
    );
  } else {
    return (
      intPart.substring(0, intPart.length + positions) +
      (intPart.length <= Math.abs(positions) ? `0.${"0".repeat(Math.abs(positions) - intPart.length)}` : ".") +
      intPart.substring(intPart.length + positions, intPart.length) +
      decimalPart
    );
  }
}

/**
 * Given a string with usless 0 after the decimal point, it removes them.
 */
export function leading0s(n: string) {
  if (/\./.test(n)) {
    n = n.replace(/(0+)$/g, "");
    if (n.charAt(n.length - 1) === ".") n = n.substr(0, n.length - 1);
  }
  return n;
}

/**
 * It adds commas to any number. 1000 -> 1,000.
 */
export function numberWithCommas(x: number | string) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
