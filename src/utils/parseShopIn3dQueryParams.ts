import queryString from "query-string";
import { IShopIn3dQueryParams } from "../types/IShopIn3dQueryParams";
import { LayoutType } from "../types/LayoutType";
import setQueryParams from "../helpers/setQueryParams";

const parseShopIn3dQueryParams = (location: Location): IShopIn3dQueryParams => {
  try {
    if (!location || location.search.length === 0) {
      return {};
    }

    const { query } = queryString.parseUrl("" + location);
    let queryParams: IShopIn3dQueryParams = {};

    if (query.layout && query.layout.length > 0) {
      const layout = query.layout as LayoutType;
      queryParams.layout = layout;
    }

    setQueryParams(query, 'experienceId', (value) => queryParams['experienceId'] = value);
    setQueryParams(query, 'productId', (value) => queryParams['productId'] = value);
    setQueryParams(query, 'clientId', (value) => queryParams['clientId'] = value);
    setQueryParams(query, 'language', (value) => queryParams['language'] = value);
    setQueryParams(query, 'selectProduct', (value) => queryParams['selectProduct'] = value);
    setQueryParams(query, 'selectColor', (value) => queryParams['selectColor'] = value);
    setQueryParams(query, 'selectSize', (value) => queryParams['selectSize'] = value);
    setQueryParams(query, 'origin', (value) => queryParams['origin'] = value);
    setQueryParams(query, 'mode', (value) => queryParams['mode'] = value.toLocaleLowerCase());
        
    // If AR should be launched immediately when the layout loads
    if (query.launchAR && query.launchAR.length > 0){
      if(Array.isArray(query.launchAR)) {
        queryParams.launchAR = query.launchAR[0].toString().toLocaleLowerCase().trim() === 'true';
      } else {
        queryParams.launchAR = query.launchAR.toString().toLocaleLowerCase().trim() === 'true';
      }
    }
    
    // Inspector mode for the player
    if (query.enableInspector){
      queryParams.enableInspector = query.enableInspector.toString().toLocaleLowerCase().trim() === 'true';
    }

    return queryParams;
  } catch (e) {
    console.error("Unable to parse url", e);
    return {};
  }
};

export default parseShopIn3dQueryParams;
