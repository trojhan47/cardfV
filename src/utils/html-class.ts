type FilterOut = boolean | undefined | null;

type Args = string | Record<string, FilterOut> | FilterOut;

/**
 * Allows you to write html classes from a string, array and object.
 * Examples:
 * ```
 * c('text-white bg-gray-900 font-bold', hasError && 'text-danger')
 * c(['text-white bg-gray-900', hasError && 'text-danger'], ['font-bold'])
 * c('text-white', { 'text-danger': hasError }, ['bg-gray-900', { 'font-bold': true }])
 * ```
 * @param classes
 */
export const c = (...classes: (Args[] | Args)[]): string => {
  return classes
    .map(value => {
      if (Array.isArray(value)) {
        return c(...value);
      }
      if (typeof value === 'object') {
        return Object.entries(value as Record<string, FilterOut>)
          .filter(([_, value]) => !!value)
          .map(([key]) => key)
          .join(' ');
      }
      return value;
    })
    .filter(Boolean)
    .join(' ');
};
