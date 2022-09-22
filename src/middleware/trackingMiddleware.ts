import { analytics } from '../utils/analytics';

import { SELECT_COLOR } from '../actions/selectColor';
import { SELECT_SIZE } from '../actions/selectDeviceSize';
import { SELECT_TYPE_COVER } from '../actions/selectTypeCover';
import { SELECT_PEN } from '../actions/selectPen';
import { CONFIGURE_PRODUCT } from '../actions/configureProduct';
import { LAUNCH_SELECTED_PRODUCT_AR } from '../actions/launchSelectedProductAR';
import { LAUNCH_SELECTED_PRODUCT_AR_FROM_QR } from '../actions/launchSelectedProductARFromQR';

import { IAccessory } from '../types/IAccessory';
import { IProduct } from '../types/IProduct';

import parseShopIn3dQueryParams from '../utils/parseShopIn3dQueryParams';
import { SELECT_MODE } from '../actions/selectProductMode';
import { SHOW_CARD } from '../actions/showCard';
import { CLOSE_CARD } from '../actions/closeCard';
import { HIDE_HOTSPOT } from '../actions/hideHotspot';
import { SHOW_HOTSPOT } from '../actions/showHotspot';
import getClientAnalyticsProperties from '../utils/getClientAnalyticsProperties';

export const getProductProperties = (product?: IProduct, productName?: string) => {
  if (!product) {
    return Object.assign(Object.create(null), {
      product_name: productName ? productName : 'unknown',
      product_id: 'unknown'
    });
  }

  return Object.assign(Object.create(null), {
    product_name: product.name,
    product_id: product.productId || product.id,
  });
}

const trackingMiddleware = (_store: any) => (next: (_: any) => any) => (action: any) => {
  let productAnalytics;
  let queryParams = (typeof window === 'undefined')
    ? undefined
    : parseShopIn3dQueryParams(window.location);

  const experienceId = (queryParams === 'undefined')
    ? ""
    : queryParams?.experienceId;
  
  const origin = (queryParams === 'undefined')
    ? ""
    : queryParams?.origin;

  const clientAnalyticsProperties = getClientAnalyticsProperties();

  switch (action.type) {
    case SELECT_COLOR:
      productAnalytics = getProductProperties(action?.product);
      analytics.instance.trackEvent('select_color_button_click', {

        selected_color: action.color?.colorName,
        selected_size: action.size?.sizeValue,

        experience_id: experienceId,
        ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;

    case SELECT_SIZE:
      productAnalytics = getProductProperties(action?.product);

      analytics.instance.trackEvent('select_size_button_click', {
  selected_size: action.size?.sizeValue,
        selected_color: action.color?.colorName,

        experience_id: experienceId,
 ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;

    case SELECT_TYPE_COVER:
      var typeCover: IAccessory = action.typeCover;
      productAnalytics = getProductProperties(action?.product);

      analytics.instance.trackEvent('select_typecover_button_click', {
selected_typecover_name: typeCover.name?.name,
        selected_typecover_size: typeCover.size?.sizeValue,
        selected_typecover_color: typeCover.color?.colorName,
        selected_size: action.size?.sizeValue,
        selected_color: action.color?.colorName,

        experience_id: experienceId,
 ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;

    case SELECT_PEN:
      var pen: IAccessory = action.pen;
      productAnalytics = getProductProperties(action?.product);

      analytics.instance.trackEvent('select_pen_button_click', {
   selected_pen_name: pen.name?.name,
        selected_pen_size: pen.size?.sizeValue,
        selected_pen_color: pen.color?.colorName,
        selected_size: action.size?.sizeValue,
        selected_color: action.color?.colorName,


        experience_id: experienceId,
        ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;

    case CONFIGURE_PRODUCT:
      productAnalytics = getProductProperties(action?.product);
      var typeCover: IAccessory = action.selectedTypeCover;
      var pen: IAccessory = action.selectedPen;

      analytics.instance.trackEvent('configure_product_button_click', {
        selected_typecover_color: typeCover.color?.colorName === "empty" ? "none" : typeCover.color?.colorName,
        selected_pen_color: pen.color?.colorName === "empty" ? "none" : pen.color?.colorName,
        selected_size: action.selectedSize?.sizeValue,
        selected_color: action.selectedColor?.colorName,
        experience_id: experienceId,
        ...productAnalytics,
        ...clientAnalyticsProperties
      });

      // SSR check - no local storage on server
      if (typeof window !== 'undefined') {
        if (action?.targetUrl) {
          // Redirect the top most window (in case this is run within an iframe) to the target url
          if (window && window.top && window.top.location && window.top.location.href) {
            window.top.location.href = action?.targetUrl;
          }
        }
      }

      break; 
    case LAUNCH_SELECTED_PRODUCT_AR:
      productAnalytics = getProductProperties(action?.product);
      analytics.instance.trackEvent('select_launch_ar_button_click', {
        selected_color: action.color?.colorName,
        selected_size: action.size?.sizeValue,
        origin: origin,
        experience_id: experienceId,        
        ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;

      case LAUNCH_SELECTED_PRODUCT_AR_FROM_QR:
        // we do not have product defined, but we have product name as a string, so we pass that to fill in the productAnalytics object.
        productAnalytics = getProductProperties(undefined, action?.productName);
        analytics.instance.trackEvent('select_launch_ar_from_qr', {
          selected_color: action.color,
          selected_size: action.size,
          origin: origin,
          experience_id: experienceId,        
          ...productAnalytics,
          ...clientAnalyticsProperties
        });
        break;

    case SELECT_MODE:
      productAnalytics = getProductProperties(action?.product);
      analytics.instance.trackEvent('select_product_animation_mode', {
        selected_product_mode: action.mode,
        experience_id: experienceId,
        event_origin: action?.eventOrigin,
        ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;
    case CLOSE_CARD:
      productAnalytics = getProductProperties(action?.product);
      analytics.instance.trackEvent('close_hotspot_card', {
        hotspot_id : action.id,
        hotspot_name: action.name,
        ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;
    case SHOW_CARD:
      productAnalytics = getProductProperties(action?.product);
      analytics.instance.trackEvent('show_hotspot_card', {
        hotspot_id : action.id,
        hotspot_name: action.name,
        ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;
    case HIDE_HOTSPOT:
      productAnalytics = getProductProperties(action?.product);
      analytics.instance.trackEvent('hide_hotspot', {
        ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;
    case SHOW_HOTSPOT:
      productAnalytics = getProductProperties(action?.product);
      analytics.instance.trackEvent('show_hotspot', {
        ...productAnalytics,
        ...clientAnalyticsProperties
      });
      break;
  }

  return next(action);
};

export default trackingMiddleware;