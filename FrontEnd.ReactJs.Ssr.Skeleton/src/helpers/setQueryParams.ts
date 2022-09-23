import queryString from 'query-string';

const setQueryParams = (
  query: queryString.ParsedQuery<string>,
  key: string,
  callback: (value: string) => void
): void => {
  if (!query || !key) {
    return;
  }
  
  let value = query[key];

  if (value && value.length > 0) {
    callback(Array.isArray(value) ? value[0] : value);
  }
};

export default setQueryParams;
