import React, { ReactElement, RefObject, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

// selectors
import fetchClients from '../actions/fetchClients';
import fetchExperience from '../actions/experienceAction';
import LayoutContainer from '../components/LayoutContainer';
import parseShopIn3dQueryParams from '../utils/parseShopIn3dQueryParams';
import getExperience from '../selectors/getExperience';
import getSelectedColor from '../selectors/getSelectedColor';
import getSelectedSize from '../selectors/getSelectedSize';
import getSelectedTypeCover from '../selectors/getSelectedTypeCover';
import getSelectedDuoBumper from '../selectors/getSelectedDuoBumper';
import getSelectedMouse from '../selectors/getSelectedMouse';
import getSelectedPen from '../selectors/getSelectedPen';
import getSelectedMode from '../selectors/getSelectedMode';
import getSelectedProduct from '../selectors/getSelectedProduct';
import getColorsFromProduct from '../selectors/getColorsFromProduct';
import getMarketingCardsFromSelectedProductSize from '../selectors/getMarketingCardsFromSelectedProductSize';
import getProduct from '../selectors/getProduct';

// actions
import fetchLocalization from '../actions/fetchLocalization';
import { launchSelectedProductARFromQR, LAUNCH_SELECTED_PRODUCT_AR_FROM_QR } from '../actions/launchSelectedProductARFromQR';
import { addCards } from '../actions/addCards';
import { removeCards } from '../actions/removeCards';
import { NO_DUOBUMPER } from '../actions/setDuoBumpers';
import { setPlayer3dLoadingScreenVisible } from '../actions/setPlayer3dLoadingScreenVisible';
import { setPlayer3dLoadingScreenHidden } from '../actions/setPlayer3dLoadingScreenHidden';
import { closeCard } from '../actions/closeCard';
import { NO_PEN } from '../actions/selectPen';
import { setColors } from '../actions/setColors';
import { NO_TYPECOVER } from '../actions/selectTypeCover';

// types
import { ICard } from '../types/ICard';
import { LayoutType } from '../types/LayoutType';
import { IExperience } from '../types/IExperience';
import { DeviceColorType } from '../types/DeviceColorType';
import { DeviceSizeType } from '../types/DeviceSizeType';
import { DeviceNameType } from '../types/DeviceNameType';
import { IPlayer3dLoadingScreenEvent } from '../types/IPLayer3dLoadingScreenEvent';
import { AccessoryType } from '../types/IAccessory';

// utils, hooks and helpers
import getConfigurationButton from '../utils/getConfigurationButton';
import getBackButton from '../utils/getBackButton';
import startExternalEventMessageHandler from '../utils/startExternalEventMessageHandler';
import useOnScreen from '../hooks/useOnScreen';
import { analytics } from '../utils/analytics'
import { capturePageActionEvent, capturePageView, capturePageViewPerformance, deriveOneDSContentName } from '../1ds_telemetry/1ds_helper';

// exported apis
import getDeviceColorsApi from '../api/getDeviceColors';
import getTypeCovers from '../api/getTypeCovers';
import getDuoBumpers from '../selectors/getDuoBumpers';
import getPens from '../api/getPens';
import getDeviceSizes from '../api/getDeviceSizes';
import removePenByColorName from '../api/removePenByColorName';
import removeTypeCoverByColorName from '../api/removeTypeCoverByColorName';
import removeDuoBumperByColorName from '../api/removeDuoBumperByColorName';
import removeDeviceColorByName from '../api/removeDeviceColorByName';
import removeDeviceSizeByValue from '../api/removeDeviceSizeByValue';
import closeCardApi from '../api/closeCard';
import showCardApi from '../api/showCard';


// Extend the window global object
declare global {
  interface Window {
    microsoft: {
      si3d: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player?: any;
        coordinator?: {
          version: string | undefined,
          lastUpdatedAt: string | undefined,
          api: {
            showCard: (id: string, name: string) => void,
            closeCard: (id: string, name: string) => void,
          }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        telemetry?: ApplicationInsights;
        api?: any;
      };
    };
  }
}

const loadData = fetchExperience;
const loadClients = fetchClients;
const loadLocalization = fetchLocalization;

const Layout = (): ReactElement => {
  const dispatch = useDispatch();
  const [layout, setLayout] = useState<LayoutType | undefined>();
  const [showConfigurationButton, setShowConfigurationButton] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [experienceLoaded, setExperienceLoaded] = useState<boolean>(false);
  const experience = useSelector(getExperience);
  const selectedColor = useSelector(getSelectedColor);
  const selectedSize = useSelector(getSelectedSize);
  const selectedTypeCover = useSelector(getSelectedTypeCover);
  const selectedDuoBumper = useSelector(getSelectedDuoBumper)
  const selectedMouse = useSelector(getSelectedMouse);
  const [productId, setProductId] = useState<string>();
  const selectedPen = useSelector(getSelectedPen);
  const selectedProduct = useSelector(getSelectedProduct);
  const selectedMode = useSelector(getSelectedMode);

  // Reference to the experience loaded state
  const experienceLoadedRef = useRef(experienceLoaded);
  experienceLoadedRef.current = experienceLoaded;

  const selectedProductRef = useRef(selectedProduct);
  selectedProductRef.current = selectedProduct;

  // Update the layout type based on the query param
  useEffect(() => {
    const api = {
      getPens,
      getDeviceColors: () => getDeviceColorsApi(selectedProductRef.current),
      getDeviceSizes,
      getTypeCovers,
      getDuoBumpers,
      removePenByColorName,
      removeDeviceColorByName,
      removeDeviceSizeByValue,
      removeTypeCoverByColorName,
      removeDuoBumperByColorName
    }

    const showCard = (id: string, name: string) => {
      showCardApi(id, name, selectedProduct)
    }

    const closeCard = (id: string, name: string) => {
      closeCardApi(id, name, selectedProduct)
    }
    // For debug purposes, push the current release version into the si3d object
    const coordinator = {
      version: process.env.SI3D_COORDINATOR_VERSION,
      lastUpdatedAt: process.env.LASTCOMMITDATETIME,

      // internal coordinator APIs
      api: {
        showCard,
        closeCard,
      },
    };

    // Listen to events from the parent page
    startExternalEventMessageHandler(api);

    // The si3d object SHOULD be initialized already since it's done when we create
    // the sharedAppInsights object, but safer to check and make sure
    if (window.microsoft?.si3d) {
      window.microsoft.si3d.coordinator = coordinator;
      window.microsoft.si3d.api = api;
    } else {
      window.microsoft = {
        si3d: {
          coordinator: coordinator,
          api: api
        }
      };
    }

    const shopIn3dQueryParams = parseShopIn3dQueryParams(window?.location);
    if (shopIn3dQueryParams?.layout) {
      setLayout(shopIn3dQueryParams.layout);
    }

    if (shopIn3dQueryParams.productId) {
      setProductId(shopIn3dQueryParams.productId);
    }

    if (shopIn3dQueryParams.launchAR &&
      shopIn3dQueryParams.selectProduct &&
      shopIn3dQueryParams.selectColor &&
      shopIn3dQueryParams.selectSize) {
      launchAR(
        shopIn3dQueryParams.selectProduct,
        shopIn3dQueryParams.selectColor,
        shopIn3dQueryParams.selectSize);
    }

    if (shopIn3dQueryParams.enableInspector) {
      if (process.env.ALLOW_ENABLE_INSPECTOR !== "true") {
        console.log("[si3d player] Inspector disabled.")
      } else {
        enableInspector(shopIn3dQueryParams.enableInspector);
      }
    }

    if (shopIn3dQueryParams.clientId) {
      if (getConfigurationButton(shopIn3dQueryParams.clientId)) {
        setShowConfigurationButton(true);
      }
    }

    if (shopIn3dQueryParams.clientId) {
      if (getBackButton(shopIn3dQueryParams.clientId)) {
        setShowBackButton(true);
      }
    }

    //Set default layout mode "light/dark"
    setLayoutDefaultMode(shopIn3dQueryParams.mode);
  }, []);

  const setLayoutDefaultMode = (mode: string|undefined) => {
    const endUserPrefrenceMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    if (mode == "dark" || (mode == undefined && endUserPrefrenceMode == "dark")) {
      document.documentElement.setAttribute("data-theme", "dark");
      setThemeMode("dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      setThemeMode("light");
    }
  }

  // Make sure we only track the pageview once, when the page become visible only
  const ref = useRef() as RefObject<HTMLDivElement>;
  const [hasTrackPageView, setHasTrackPageView] = useState<boolean>();
  const isVisible = useOnScreen(ref)
  useEffect(() => {
    if (isVisible && !hasTrackPageView) {
      const shopIn3dQueryParams = parseShopIn3dQueryParams(window?.location);
      analytics.instance.trackPageView(shopIn3dQueryParams);

      // Fire 1ds page view event as well 
      // TODO: Task #8186299 renable manual 1DS page view tracking (see related bug#: 8185741)
      // We needed this logic to capture page view manually when we were a PDP modal. 
      // This stopped working on 11/8/2021 in PPE and 11/11/2021 in PROD.
      // capturePageView();
      // capturePageViewPerformance();

      setHasTrackPageView(true);
    }

  }, [isVisible])

  const loadExperience = (experience: IExperience) => {
    if (!experience || experience?.error) {
      return;
    }

    if (!window?.microsoft?.si3d?.player) {
      console.log("[si3d player] still initializing. Will retry loading experience...")

      // Wait for the player to load. Retry in a 250ms.
      setTimeout(() => loadExperience(experience), 250);
    } else {
      try {
        if (!experienceLoadedRef.current) {
          window.microsoft.si3d.player.loadExperience(experience)
          console.log("[si3d player] Experience loaded", experience);
          setExperienceLoaded(true);
        }
      }
      catch (e) {
        console.error("[si3d player] Error while loading experience.", e)
      }
    }
  }

  const setThemeMode = (themeMode: string) => {
    if (!window?.microsoft?.si3d?.player) {
      console.log("[si3d player] still initializing. Will retry setting the themeMode value...")

      // Wait for the player to load. Retry in a 250ms.
      setTimeout(() => setThemeMode(themeMode), 250);
    } else {
      try {
          window.microsoft.si3d.player.setThemeMode(themeMode);
      }
      catch (e) {
        console.error("[si3d player] Error while setting the themeMode value", e)
      }
    }
  }

  // Subscribes to the player LoadingUI events
  const subscribeToUiLoadingEvents = () => {
    if (typeof window !== 'undefined') {
      if (!window?.microsoft?.si3d?.player?.subscribeUiLoadingEvents) {
        setTimeout(subscribeToUiLoadingEvents, 500);
      } else {
        // Attempt to subscribe and make sure we are subscribed! 
        // While the API might be available the 3D player might still be initializing,
        // hence, unable to register the callback provided. To make sure we succeeded,
        // we need to check the returned value for the subscribeUiLoadingEvents, which 
        // should be the callback itself, when ready.
        let isSubscribed = window.microsoft.si3d.player.subscribeUiLoadingEvents(
          (e: IPlayer3dLoadingScreenEvent) => e?.isLoading
            ? dispatch(setPlayer3dLoadingScreenVisible())
            : dispatch(setPlayer3dLoadingScreenHidden())
          )

        if(!isSubscribed) {
          setTimeout(subscribeToUiLoadingEvents, 500);
        }
      }
    }
  }

  // selects a product or an accessory
  const selectProduct = (selectedName: DeviceNameType, selectedColor: DeviceColorType, selectedSize: DeviceSizeType, isAccessory?: boolean) => {
    if (!window?.microsoft?.si3d?.player || !experienceLoadedRef.current) {
      console.log("[si3d player] Still loading. SelectProduct will be retried...")
      setTimeout(() => selectProduct(selectedName, selectedColor, selectedSize, isAccessory), 500);
    } else {
      try {
        window.microsoft.si3d.player.selectProduct(selectedName.name, selectedColor.colorName, selectedSize.sizeValue, isAccessory)
        console.log("[si3d player] Product selected.", selectedName.name, selectedColor.colorName, selectedSize.sizeValue, isAccessory);
      }
      catch (e) {
        console.error(`[si3d player] Error while selecting product.
          [name: ${selectedName.name}, selectedColor: ${selectedColor.colorName}, selectedSize: ${selectedSize.sizeValue}, isAccessory: ${isAccessory}]`, e)
      }
    }
  }

  // removes an accessory
  const clearAccessoryByType = (type: string) => {
    if (!window?.microsoft?.si3d?.player || !experienceLoadedRef.current) {
      console.log("[si3d player] Still loading. clearAccessoryByType will be retried...")
      setTimeout(() => clearAccessoryByType(type), 500);
    } else {
      try {
        window.microsoft.si3d.player.clearAccessoryByType(type);
        console.log("[si3d player] Product selected.", type);
      }
      catch (e) {
        console.error(`[si3d player] Error while clearing accessory.
          [type: ${type}]`, e)
      }
    }
  }

  const enableInspector = (isEnabled: boolean) => {
    if (!window?.microsoft?.si3d?.player || !experienceLoadedRef.current) {
      console.log("[si3d player] Still loading. enableInspector will be retried...")
      setTimeout(() => enableInspector(isEnabled), 500);
    } else {
      try {
        if (window.microsoft.si3d.player?.enableInspector) {
          window.microsoft.si3d.player.enableInspector(isEnabled);
          console.log("[si3d player] enableInspector.", isEnabled);
        }
      }
      catch (e) {
        console.error(`[si3d player] Error while enabling inspetor.`, e)
      }
    }
  }

  // Launches AR either from QR or from mobile button
  const launchAR = (productName?: string, color?: string, size?: string) => {
    if (!window?.microsoft?.si3d?.player || !window?.microsoft?.si3d?.player.getLoadingUIStatus()) {
      console.log("[si3d player] Still loading. Augmented reality launcher will be retried...")
      setTimeout(() => launchAR(productName, color, size), 500);
    } else {
      try {
        console.log("[si3d player] launching AR.");
        // Dispatch middleware action
        dispatch(launchSelectedProductARFromQR(productName, color, size));
        // Fire 1DS Event
        capturePageActionEvent(deriveOneDSContentName(LAUNCH_SELECTED_PRODUCT_AR_FROM_QR, productName, size, color));

        if (productName && color && size) {
          window.microsoft.si3d.player.launchAR(productName, color, size);
        }
        else {
          window.microsoft.si3d.player.selectedProductLaunchAR();
        }
      }
      catch (e) {
        console.error(`[si3d player] Error while launching AR.`, e)
      }
    }
  }

  const applyProductMode = (glbModeId: string) => {
    if (!window?.microsoft?.si3d?.player || !experienceLoadedRef.current) {
      console.log("[si3d player] Still loading. switchAnimationMode will be retried...")
      setTimeout(() => applyProductMode(glbModeId), 500);
    } else {
      try {
        if (window.microsoft.si3d.player?.switchAnimationMode) {
          window.microsoft.si3d.player.switchAnimationMode(glbModeId);
          console.log("[si3d player] switchAnimationMode.", glbModeId);
        }
      }
      catch (e) {
        console.error(`[si3d player] Error while calling switchAnimationMode.`, e)
      }
    }
  }

  // Set the default color and size when experience changes
  useEffect(() => {
    if (experience && !experience.loading && experience.loaded) {
      loadExperience(experience);
    }

    // Listend to UI events
    subscribeToUiLoadingEvents();
  }, [experience?.loaded]);

  // Update colors and marketing cards content (hotspots) when a new size is selected
  useEffect(() => {
    const colors: Array<DeviceColorType> | undefined = getColorsFromProduct(selectedProduct, selectedSize);
    dispatch(setColors(colors, selectedSize))

    if (window?.microsoft?.si3d?.player?.getCurrentHotSpot) {
      const hotspot = window.microsoft.si3d.player.getCurrentHotSpot();
      dispatch(closeCard(hotspot?.id, hotspot?.name, selectedProduct))
    }

    const cards: Array<ICard> | undefined = getMarketingCardsFromSelectedProductSize(selectedProduct, selectedSize);
    cards && dispatch(addCards(cards))

  }, [selectedSize, selectedProduct])

  // Update the player for the selected device color and size
  useEffect(() => {
    if (!selectedProduct || !selectedProduct?.name) {
      return;
    }

    // If the user hasn't choosen a different color or size, ignore
    if (!selectedColor?.colorName && !selectedSize?.sizeValue) {
      return;
    }

    selectProduct(
      { name: selectedProduct.name },
      selectedColor || { colorName: experience?.defaultProduct?.color, localizedColorName: experience?.defaultProduct?.localizedColor },
      selectedSize || { sizeValue: experience?.defaultProduct?.size, localizedSizeValue: experience?.defaultProduct?.localizedSize }
    )
  }, [JSON.stringify(selectedColor), JSON.stringify(selectedSize)]);

  // Update the player for the selected typecover
  useEffect(() => {
    if (!selectedTypeCover || !selectedTypeCover?.name?.name) {
      return;
    }

    // If the user hasn't choosen a different color or size, ignore
    if (!selectedTypeCover?.color?.colorName || !selectedTypeCover?.size?.sizeValue || !selectedTypeCover?.name?.name) {
      return;
    }

    if (selectedTypeCover.color.colorName !== 'empty') {
      selectProduct(
        selectedTypeCover.name,
        selectedTypeCover.color,
        selectedTypeCover.size,
        true
      );

      const product = getProduct(experience, undefined, selectedTypeCover.name.name);
      const accessoryCards: Array<ICard> | undefined = getMarketingCardsFromSelectedProductSize(product, selectedTypeCover.size, AccessoryType.typecover);
      accessoryCards && dispatch(addCards(accessoryCards));
    } else {
      // Do not clear accessories, unless the user selected the no typecover option
      if (selectedTypeCover.name?.name === NO_TYPECOVER.name?.name) {
        clearAccessoryByType(selectedTypeCover.type);

        // Remove hotspots for the cleared accessory
        dispatch(removeCards(AccessoryType.typecover));
      }
    }
  }, [JSON.stringify(selectedTypeCover)]);

  // Update the player for the selected duoBumper
  useEffect(() => {
    // If the user hasn't choosen a different color or size, ignore
    if (!selectedDuoBumper?.color?.colorName || !selectedDuoBumper?.size?.sizeValue || !selectedDuoBumper?.name?.name) {
      return;
    }

    if (selectedDuoBumper.color.colorName !== 'empty') {
      selectProduct(
        selectedDuoBumper.name,
        selectedDuoBumper.color,
        selectedDuoBumper.size,
        true
      );

      // Add hotspots for the selected accessory
      const product = getProduct(experience, undefined, selectedDuoBumper.name.name);
      const accessoryCards: Array<ICard> | undefined = getMarketingCardsFromSelectedProductSize(product, selectedDuoBumper.size, AccessoryType.duobumper); 
      accessoryCards && dispatch(addCards(accessoryCards));
    } else {
      // Do not clear accessories, unless the user selected the no Duo Bumper option
      if (selectedDuoBumper.name?.name === NO_DUOBUMPER.name?.name) {
        clearAccessoryByType(selectedDuoBumper.type);

        // Remove hotspots for the cleared accessory
        dispatch(removeCards(AccessoryType.duobumper));
      }
    }
  }, [JSON.stringify(selectedDuoBumper)]);


  // Update the player for the selected pen
  useEffect(() => {
    if (!selectedPen || !selectedPen?.name) {
      return;
    }

    // If the user hasn't choosen a different color or size, ignore
    if (!selectedPen?.color?.colorName || !selectedPen?.size?.sizeValue || !selectedPen?.name?.name) {
      return;
    }

    if (selectedPen.color.colorName !== 'empty') {
      selectProduct(
        selectedPen.name,
        selectedPen.color,
        selectedPen.size,
        true
      );

      // Add hotspots for the selected accessory
      const product = getProduct(experience, undefined, selectedPen.name.name);
      const accessoryCards: Array<ICard> | undefined = getMarketingCardsFromSelectedProductSize(product, selectedPen.size, AccessoryType.pen);
      accessoryCards && dispatch(addCards(accessoryCards));
    } else {
      // Do not clear accessories, unless the user selected the no typecover option
      if (selectedPen.name?.name === NO_PEN.name?.name) {
        clearAccessoryByType(selectedPen.type);

        // Remove hotspots for the cleared accessory
        dispatch(removeCards(AccessoryType.pen));
      }
    }
  }, [JSON.stringify(selectedPen)]);

  useEffect(()  => {
    if (!selectedMode) {
      return;
    }

    applyProductMode(selectedMode);    
  }, [JSON.stringify(selectedMode)])

  if (experience?.error) {
    return (
      <div>
        {`Error while fetching experience: ${experience.error}`}
      </div>
    )
  }

  return (
    <div ref={ref}>
      <LayoutContainer
        type={layout}
        product={selectedProduct}
        selectedColor={selectedColor || { colorName: experience?.defaultProduct?.color, localizedColorName: experience?.defaultProduct?.localizedColor }}
        selectedSize={selectedSize || { sizeValue: experience?.defaultProduct?.size, localizedSizeValue: experience?.defaultProduct?.localizedSize }}
        selectedTypeCover={selectedTypeCover}
        selectedDuoBumper={selectedDuoBumper}
        selectedMouse={selectedMouse}
        selectedPen={selectedPen}
        showConfigureNowButton={showConfigurationButton}
        showBackButton={showBackButton}
        selectedMode={selectedMode}
      />
    </div>
  );
};

export default {
  component: Layout,
  loadData,
  loadClients,
  loadLocalization
};
