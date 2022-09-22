import { Store } from 'redux';

import { DeviceColorType } from './types/DeviceColorType';
import { DeviceSizeType } from './types/DeviceSizeType';
import { IProductMode } from './types/IProductMode';

import getExperience from './selectors/getExperience';
import getProduct from './selectors/getProduct';
import getSizesFromProduct from './selectors/getSizesFromProduct';
import getPensFromProduct from './selectors/getPenFromProduct';
import getColorsFromProduct from './selectors/getColorsFromProduct';
import getTypeCoversFromProduct from './selectors/getTypeCoversFromProduct';
import getDuoBumpersFromProduct from './selectors/getDuoBumpersFromProduct';
import getModesFromProduct from './selectors/getModesFromProduct';
import getDefaultModeFromProduct from './selectors/getDefaultModeFromProduct';
import { DEFAULT_PEN } from './actions/selectPen';
import { DEFAULT_TYPECOVER } from './actions/selectTypeCover';
import { DEFAULT_DUOBUMPER } from './actions/setDuoBumpers';

const initializeStore = (store: Store) => {
  if (!store) {
    throw Error("Store instance can not be null or undefined!");
  }

  const storeState = store.getState();

  // TODO: populate the initial store state here.
  storeState.ssrTest = {
    ssrEnable: true
  }
}

export default initializeStore;
