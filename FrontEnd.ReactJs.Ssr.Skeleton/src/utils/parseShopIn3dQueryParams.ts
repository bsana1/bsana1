import queryString from "query-string";

const parseShopIn3dQueryParams = (location: Location): any => {
  try {
    if (!location || location.search.length === 0) {
      return {};
    }

    const { query } = queryString.parseUrl("" + location);
    let queryParams: any = {};

    // add parsed params to your query object here
        
    return queryParams;
  } catch (e) {
    console.error("Unable to parse url", e);
    return {};
  }
};

export default parseShopIn3dQueryParams;
