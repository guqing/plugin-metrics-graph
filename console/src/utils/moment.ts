export const toMillis = (value, baseUnit) => {
  switch (baseUnit) {
    case 'nanoseconds':
      return value / 1000000;
    case 'microseconds':
      return value / 1000;
    case 'milliseconds':
      return value;
    case 'seconds':
    default:
      return value * 1000;
  }
};
