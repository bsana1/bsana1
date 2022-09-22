// Starts listenings to external message events.
// Those would be sent by 3rd paty pages, when hosting shop-in-3d within iframe, 
// as a parent page is not able to access the iframe global variable widnow.microsoft.si3d.
const startExternalEventMessageHandler = (api: any) => {
  if (!api) {
    console.error('Unable to start externalEventMessageHandler: api is required');
    return;
  }

  window.onmessage = e => {
    return processEvent(e, api);
  }
}

export const processEvent = (e: MessageEvent<any>, api: any) => {
  if (!e) {
    return;
  }
  const type = e.data?.type;
  const data = e.data;
  let outputPort = e.ports && e.ports.length > 0 && e.ports[0] || { postMessage: console.log };
  if (!type) {
    return
  }
  switch (type) {
    case 'getPens':
      return outputPort.postMessage(api.getPens());

    case 'removePenByColorName':
      return outputPort.postMessage(api.removePenByColorName(data.colorName));

    case 'getTypeCovers':
      return outputPort.postMessage(api.getTypeCovers());

    case 'removeTypeCoverByColorName':
      return outputPort.postMessage(api.removeTypeCoverByColorName(data.colorName));

    case 'getDeviceSizes':
      return outputPort.postMessage(api.getDeviceSizes());

    case 'removeSizeByValue':
      return outputPort.postMessage(api.removeDeviceSizeByValue(data.deviceSize));

    case 'getDeviceColors':
      return outputPort.postMessage(api.getDeviceColors());

    case 'removeDeviceColorByName':
      return outputPort.postMessage(api.removeDeviceColorByName(data.colorName, data.deviceSize));

    case 'isReady':
      return outputPort.postMessage(true);
  }
}

export default startExternalEventMessageHandler;



