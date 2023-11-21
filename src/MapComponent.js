import React, { useEffect, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Draw, Modify, Pointer, Snap } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';

const MapComponent = () => {
    const turkeyCenter = fromLonLat([35.1683, 37.1616]);
    const [map, setMap] = useState(null);
    let drawPolygonInteraction;
    let drawLineInteraction;
    let drawPointInteraction;


  useEffect(() => {
    const initialMap  = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: turkeyCenter,
        zoom: 6.6
      }),
    });

    const vectorSource = new VectorSource({});

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    initialMap.addLayer(vectorLayer);

    setMap(initialMap);

    return () => {
      initialMap.setTarget(null);
    };
  }, []);

  const activatePolygonDrawTool = () => {
    deactivateDrawTools();
    drawPolygonInteraction = new Draw({
      source: map.getLayers().item(1).getSource(),
      type: 'Polygon',
    });

    drawPolygonInteraction.on('drawend', (event) => {
      const coordinates = event.feature.getGeometry().getCoordinates();
      console.log('Polygon Koordinatları:', coordinates);
    });

    map.addInteraction(drawPolygonInteraction);

    const modifyInteraction = new Modify({ source: map.getLayers().item(1).getSource() });
    map.addInteraction(modifyInteraction);

    const snapInteraction = new Snap({ source: map.getLayers().item(1).getSource() });
    map.addInteraction(snapInteraction);
  };

  const activateLineDrawTool = () => {
    deactivateDrawTools();
    drawLineInteraction = new Draw({
      source: map.getLayers().item(1).getSource(),
      type: 'LineString',
    });

    drawLineInteraction.on('drawend', (event) => {
      const coordinates = event.feature.getGeometry().getCoordinates();
      console.log('Line Koordinatları:', coordinates);
    });

    map.addInteraction(drawLineInteraction);

    const modifyInteraction = new Modify({ source: map.getLayers().item(1).getSource() });
    map.addInteraction(modifyInteraction);

    const snapInteraction = new Snap({ source: map.getLayers().item(1).getSource() });
    map.addInteraction(snapInteraction);
  };

  const activatePointDrawTool = () => {
    deactivateDrawTools();
    drawPointInteraction = new Draw({
      source: map.getLayers().item(1).getSource(),
      type: 'Point',
    });

    drawPointInteraction.on('drawend', (event) => {
      const coordinates = event.feature.getGeometry().getCoordinates();
      console.log('Nokta Koordinatları:', coordinates);
    });

    map.addInteraction(drawPointInteraction);
  };

  const deactivateDrawTools = () => {
    if (drawPolygonInteraction) {
      map.removeInteraction(drawPolygonInteraction);
    }
    if (drawLineInteraction) {
      map.removeInteraction(drawLineInteraction);
    }
    if (drawPointInteraction) {
      map.removeInteraction(drawPointInteraction);
    }
  };

  const handlePolygonDrawButtonClick = () => {
    activatePolygonDrawTool();
  };

  const handleLineDrawButtonClick = () => {
    activateLineDrawTool();
  };

  const handlePointDrawButtonClick = () => {
    activatePointDrawTool();
  };

  const handleClearButtonClick = () => {
    const vectorSource = map.getLayers().item(1).getSource();
    vectorSource.clear();
  };

  return (
    <div id="map" style={{ width: '100%', height: '1000px' }}>
      <div className='toolbar'>
      <button onClick={handlePointDrawButtonClick} className='pointbtn'><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.9999 1.10006C11.0891 1.09294 10.186 1.26762 9.34355 1.61386C8.50109 1.96011 7.73618 2.47096 7.09362 3.11651C6.45105 3.76205 5.94374 4.52932 5.6014 5.37337C5.25906 6.21742 5.08856 7.1213 5.0999 8.03206C5.0999 11.9141 8.8889 17.0421 11.9999 23.0001C15.1109 17.0431 18.8999 11.9141 18.8999 8.03206C18.9112 7.1213 18.7407 6.21742 18.3984 5.37337C18.056 4.52932 17.5487 3.76205 16.9062 3.11651C16.2636 2.47096 15.4987 1.96011 14.6562 1.61386C13.8138 1.26762 12.9107 1.09294 11.9999 1.10006ZM11.9999 11.0001C11.4066 11.0001 10.8265 10.8241 10.3332 10.4945C9.83984 10.1648 9.45532 9.69629 9.22826 9.14811C9.00119 8.59994 8.94178 7.99674 9.05754 7.41479C9.1733 6.83285 9.45902 6.2983 9.87857 5.87874C10.2981 5.45919 10.8327 5.17346 11.4146 5.05771C11.9966 4.94195 12.5998 5.00136 13.1479 5.22842C13.6961 5.45549 14.1647 5.84 14.4943 6.33335C14.8239 6.8267 14.9999 7.40672 14.9999 8.00006C14.9999 8.79571 14.6838 9.55877 14.1212 10.1214C13.5586 10.684 12.7955 11.0001 11.9999 11.0001Z" fill="white"/>
</svg></button>
      <button className='polygonbtn' onClick={handlePolygonDrawButtonClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.25" d="M0 24V3.7983L9.98533 10.7806L24 0V24H0Z" fill="white"/>
<path d="M10.1544 10.08L0 3.36V24H24V0L10.1544 10.08ZM22.8 22.8H1.2V5.5932L10.1868 11.5404L22.8 2.358V22.8Z" fill="white"/>
</svg></button>
<button onClick={handleLineDrawButtonClick} className='linebtn'><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M21 6H21.046L15.796 15H14.852L10 9.455V7H7V9.926L1.862 18H0V21H3V18.074L8.138 10H9.148L14 15.545V18H17V15H16.954L22.204 6H24V3H21V6ZM8 8H9V9H8V8ZM2 20H1V19H2V20ZM16 17H15V16H16V17ZM23 4V5H22V4H23Z" fill="white"/>
</svg></button>
<button onClick={handleClearButtonClick} className='clearbtn'><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.0099 22.4663H9.74623L12.4295 19.6827L5.19116 12.0911L1.12597 16.3317C0.872354 16.5952 0.729675 16.9541 0.729675 17.3286C0.729675 17.703 0.872354 18.0619 1.12597 18.3254L5.11805 22.4663H0.73115C0.327347 22.4663 0 22.8097 0 23.2332C0 23.6567 0.327347 24 0.73115 24H19.0099C19.4137 24 19.741 23.6567 19.741 23.2332C19.741 22.8097 19.4137 22.4663 19.0099 22.4663Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.3714 0.415636L6.34731 10.9289L13.5857 18.5205L23.6098 8.00727C24.1301 7.45472 24.1301 6.56606 23.6098 6.01351L18.2724 0.415636C18.0211 0.149642 17.6789 0 17.3219 0C16.9649 0 16.6226 0.149642 16.3714 0.415636ZM22.8832 6.70064L22.8817 6.69908L17.5454 1.10235C17.4777 1.03069 17.3961 1 17.3219 1C17.2476 1 17.166 1.03069 17.0983 1.10234L17.0951 1.10571L7.72901 10.9289L13.5857 17.0714L22.8817 7.32171L22.8832 7.32015C23.0389 7.153 23.0389 6.86779 22.8832 6.70064Z" fill="white"/>
</svg></button>

      </div>
    </div>
  );
};

export default MapComponent;
