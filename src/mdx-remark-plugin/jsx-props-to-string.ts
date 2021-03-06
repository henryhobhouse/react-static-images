/* eslint-disable no-useless-escape */

import type { PropertyValue } from '../jsx-parser/types';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * jsxPropsToString
 *
 * Takes an 3d array of two values representing a prop key and value. Returns key
 * value pairs in html friendly string with any key's with not value's removed.
 */
export const jsxPropsToString = (
  htmlProps: Array<[key: string, value?: PartialBy<PropertyValue, 'value'>]>,
) => {
  let propsString = ' ';

  for (const [key, propertyValue] of htmlProps) {
    if (propertyValue?.value && propertyValue.value !== '') {
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
