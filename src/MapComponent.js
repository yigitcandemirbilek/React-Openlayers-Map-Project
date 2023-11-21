import React, { useEffect } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

const MapComponent = () => {
    const turkeyCenter = fromLonLat([35.1683, 37.1616]);
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
      })
    });

    return () => {
      map.setTarget(null);
    };
  }, []);

  return (
    <div id="map" style={{ width: '100%', height: '1000px' }}>
      {/* Harita burada oluşturulacak */}
    </div>
  );
};

export default MapComponent;
