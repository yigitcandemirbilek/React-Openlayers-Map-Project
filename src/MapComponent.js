import React, { useEffect, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';

const MapComponent = () => {
    const turkeyCenter = fromLonLat([35.1683, 37.1616]);
    const [map, setMap] = useState(null);

  useEffect(() => {
    const map = new Map({
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

    map.addLayer(vectorLayer);

    const drawInteraction = new Draw({
      source: vectorSource,
      type: 'Polygon',
    });

    drawInteraction.on('drawend', (event) => {
      const coordinates = event.feature.getGeometry().getCoordinates();
      console.log('Polygon Koordinatları:', coordinates);
    });

    map.addInteraction(drawInteraction);

    const modifyInteraction = new Modify({ source: vectorSource });
    map.addInteraction(modifyInteraction);

    const snapInteraction = new Snap({ source: vectorSource });
    map.addInteraction(snapInteraction);

    setMap(map);

    return () => {
      map.setTarget(null);
    };
  }, []);

  return (
    <div id="map" style={{ width: '100%', height: '1000px' }}>
    </div>
  );
};

export default MapComponent;
