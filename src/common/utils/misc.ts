export const convertStringToObject = (inputObj: any) => {
  const result = {};
  Object.entries(inputObj).forEach(([key, value]) => {
    const keys = key.split('.');
    keys.reduce((acc, curr, index) => {
      if (index === keys.length - 1) {
        acc[curr] = value;
      } else {
        acc[curr] = acc[curr] || {};
      }
      return acc[curr];
    }, result);
  });
  return result;
};

export function removeTimeFromDate(date: any) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
