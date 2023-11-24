export default (strings, ...values) => {
  let result = strings[0];
  for (let i = 0; i < values.length; ++i) {
    result += encodeURIComponent(values[i]) + strings[i + 1];
  }
  return result;
};
