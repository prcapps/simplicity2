// Short ID Generation in JavaScript
// http://fiznool.com/blog/2014/11/16/short-id-generation-in-javascript/

/**
 * The default alphabet is 25 numbers and lowercase letters.
 * Any numbers that look like letters and vice versa are removed:
 * 1 l, 0 o.
 * Also the following letters are not present, to prevent any
 * expletives: cfhistu
 */
const DEFAULT_ALPHABET = '23456789abdegjkmnpqrvwxyz';

// Governs the length of the ID.
// With an alphabet of 25 chars,
// a length of 8 gives us 25^8 or
// 152,587,890,625 possibilities.
// Should be enough...
const DEFAULT_ID_LENGTH = 5;

/**
 * Governs the number of times we should try to find
 * a unique value before giving up.
 * @type {Number}
 */
const UNIQUE_RETRIES = 9999;

/**
 * Returns a randomly-generated friendly ID.
 * Note that the friendly ID is not guaranteed to be
 * unique to any other ID generated by this same method,
 * so it is up to you to check for uniqueness.
 * @return {String} friendly ID.
 */
export const generate = (options) => {
  const { alphabet = DEFAULT_ALPHABET, idLength = DEFAULT_ID_LENGTH } = Object.assign({}, options);

  let rtn = '';
  for (let i = 0; i < idLength; i++) {
    rtn += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return rtn;
};

/**
 * Tries to generate a unique ID that is not defined in the
 * `previous` array.
 * @param  {Array} previous The list of previous ids to avoid.
 * @return {String} A unique ID, or `null` if one could not be generated.
 */
export const generateUnique = (previous) => {
  previous = previous || []; // eslint-disable-line
  let retries = 0;
  let id;

  // Try to generate a unique ID,
  // i.e. one that isn't in the previous.
  while (!id && retries < UNIQUE_RETRIES) {
    id = generate();
    if (previous.indexOf(id) !== -1) {
      id = null;
      retries += 1;
    }
  }

  return id;
};
