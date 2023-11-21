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
    let drawInteraction;


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

  const activateDrawTool = () => {
    drawInteraction = new Draw({
      source: map.getLayers().item(1).getSource(),
      type: 'Polygon',
    });

    drawInteraction.on('drawend', (event) => {
      const coordinates = event.feature.getGeometry().getCoordinates();
      console.log('Polygon Koordinatları:', coordinates);
    });

    map.addInteraction(drawInteraction);

    const modifyInteraction = new Modify({ source: map.getLayers().item(1).getSource() });
    map.addInteraction(modifyInteraction);

    const snapInteraction = new Snap({ source: map.getLayers().item(1).getSource() });
    map.addInteraction(snapInteraction);
  };

  const deactivateDrawTool = () => {
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }
  };

  const handleDrawButtonClick = () => {
    activateDrawTool();
  };

  return (
    <div id="map" style={{ width: '100%', height: '1000px' }}>
      <div className='toolbar'>
      <button className='polygonbtn' onClick={handleDrawButtonClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.25" d="M0 24V3.7983L9.98533 10.7806L24 0V24H0Z" fill="white"/>
<path d="M10.1544 10.08L0 3.36V24H24V0L10.1544 10.08ZM22.8 22.8H1.2V5.5932L10.1868 11.5404L22.8 2.358V22.8Z" fill="white"/>
</svg></button>
      </div>
    </div>
  );
};

export default MapComponent;
