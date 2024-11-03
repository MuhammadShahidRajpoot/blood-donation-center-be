import _ from 'lodash';
import crypto from 'crypto';

export const generateRandomString = (length) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomCharacters = _.times(length, () => {
    const randomIndex = crypto.randomInt(characters.length);
    return characters[randomIndex];
  });
  return randomCharacters.join('');
};
