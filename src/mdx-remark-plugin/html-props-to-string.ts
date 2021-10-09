/* eslint-disable no-useless-escape */

import type { PropertyValue } from '../jsx-parser/types';

/**
 * htmlPropsToString
 *
 * Takes an 3d array of two values representing a prop key and value. Returns key
 * value pairs in html friendly string with any key's with not value's removed.
 */
export const htmlPropsToString = (
  htmlProps: Array<[key: string, value?: PropertyValue]>,
) => {
  let propsString = ' ';

  for (const [key, propertyValue] of htmlProps) {
    if (propertyValue && propertyValue.value !== '') {
      if (propertyValue.type === 'Literal') {
        propsString += `${key}=\"${propertyValue.value}\" `;
      }

      if (propertyValue.type !== 'Literal') {
        propsString += `${key}={${propertyValue.value}} `;
      }
    }
  }

  return propsString;
};
