import React, { useRef, useEffect, useCallback } from 'react';
import Overlay from 'ol/Overlay';
import { Draw } from 'ol/interaction';
import { deactivateDrawTools } from './DeactiveDrawTools';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { transform } from 'ol/proj';

const PointDrawTool = ({ map }) => {
  // Referansları tut
  const drawPointInteraction = useRef(null);
  const popupOverlayRef = useRef(null);
  const closerRef = useRef(null);

  // Nokta çizim aracını aktive etmek için kullanılan fonksiyon
  const activatePointDrawTool = () => {
    // Diğer çizim araçlarını devre dışı bırak
    deactivateDrawTools();

    // Nokta çizim aracını oluştur
    const draw = new Draw({
      source: map.getLayers().item(1).getSource(), // Harita kaynağına erişim
      type: 'Point', // Nokta çizim türü
    });

    // Çizim tamamlandığında çalışacak olan olay dinleyicisi
    draw.on('drawend', (event) => {
      // Eğer daha önce bir çizim aracı aktive edilmişse onu kaldır
      if (drawPointInteraction.current) {
        map.removeInteraction(drawPointInteraction.current);
        drawPointInteraction.current = null;
      }

      // Çizilen noktanın koordinatlarını al
      const pointCoordinates = event.feature.getGeometry().getCoordinates();
      const pointGeometry = new Point(pointCoordinates);

      // Nokta geometrisini içeren bir feature oluştur
      const feature = new Feature({
        geometry: pointGeometry,
      });

      // Harita kaynağına nokta özelliğini ekle
      map.getLayers().item(1).getSource().addFeature(feature);

      // Geçici olarak 'drawend' olayını devre dışı bırak
      map.un('click', handleMapClick);
      setTimeout(() => {
        map.on('click', handleMapClick);
      }, 0);
    });

    // Çizim aracını haritaya ekle
    map.addInteraction(draw);
    drawPointInteraction.current = draw;
  };

  // Harita üzerinde tıklama olayını ele alan fonksiyon
  const handleMapClick = useCallback((event) => {
    const pixel = map.getEventPixel(event.originalEvent);
    const coordinate = map.getEventCoordinate(event.originalEvent);
    const feature = map.forEachFeatureAtPixel(pixel, (feat) => feat);

    if (feature && feature.getGeometry().getType() === 'Point') {
      // Eğer tıklanan özellik bir noktaysa, popup göster
      const wgs84Coordinate = transform(coordinate, 'EPSG:3857', 'EPSG:4326');
      const coordinatesText = `${wgs84Coordinate[1]}, ${wgs84Coordinate[0]}`;

      popupOverlayRef.current.setPosition(coordinate);

      const content = document.createElement('p');
      content.innerHTML = `Koordinatlar: ${coordinatesText}`;
      popupOverlayRef.current.getElement().innerHTML = '';
      popupOverlayRef.current.getElement().appendChild(closerRef.current);
      popupOverlayRef.current.getElement().appendChild(content);
    } else {
      // Eğer tıklanan özellik bir nokta değilse, popup'ı kapat
      popupOverlayRef.current.setPosition(undefined);
    }
  }, [map, popupOverlayRef, closerRef, transform]); 

  // Komponent yüklendiğinde ve harita değiştiğinde çalışan etkileşimler
  useEffect(() => {
    if (!map) return;

    // Popup için HTML tagi oluştur
    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';

    // Overlay oluştur ve haritaya ekle
    popupOverlayRef.current = new Overlay({
      element: popupElement,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    map.addOverlay(popupOverlayRef.current);

    // Popupı kapatmak için closer tag
    closerRef.current = document.createElement('a');
    closerRef.current.href = '#';
    closerRef.current.className = 'ol-popup-closer';
    closerRef.current.onclick = () => {
      popupOverlayRef.current.setPosition(undefined);
      return false;
    };
    popupElement.appendChild(closerRef.current);

    // Harita üzerinde tıklama olayını dinle
    map.on('click', handleMapClick);

    // Komponent kaldırıldığında temizlik yap
    return () => {
      map.un('click', handleMapClick);
    };
  }, [map, handleMapClick, popupOverlayRef, closerRef]);

  // Nokta çizim aracı butonuna tıklandığında çalışan fonksiyon
  const handlePointDrawButtonClick = () => {
    activatePointDrawTool();
  };

  // JSX formatında butonun oluşturulduğu ve bu butona ikonun eklendiği svg
  return (
    <div>
      <button
        onClick={handlePointDrawButtonClick}
        className="pointbtn"
        title="Point Tool">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11.9999 1.10006C11.0891 1.09294 10.186 1.26762 9.34355 1.61386C8.50109 1.96011 7.73618 2.47096 7.09362 3.11651C6.45105 3.76205 5.94374 4.52932 5.6014 5.37337C5.25906 6.21742 5.08856 7.1213 5.0999 8.03206C5.0999 11.9141 8.8889 17.0421 11.9999 23.0001C15.1109 17.0431 18.8999 11.9141 18.8999 8.03206C18.9112 7.1213 18.7407 6.21742 18.3984 5.37337C18.056 4.52932 17.5487 3.76205 16.9062 3.11651C16.2636 2.47096 15.4987 1.96011 14.6562 1.61386C13.8138 1.26762 12.9107 1.09294 11.9999 1.10006ZM11.9999 11.0001C11.4066 11.0001 10.8265 10.8241 10.3332 10.4945C9.83984 10.1648 9.45532 9.69629 9.22826 9.14811C9.00119 8.59994 8.94178 7.99674 9.05754 7.41479C9.1733 6.83285 9.45902 6.2983 9.87857 5.87874C10.2981 5.45919 10.8327 5.17346 11.4146 5.05771C11.9966 4.94195 12.5998 5.00136 13.1479 5.22842C13.6961 5.45549 14.1647 5.84 14.4943 6.33335C14.8239 6.8267 14.9999 7.40672 14.9999 8.00006C14.9999 8.79571 14.6838 9.55877 14.1212 10.1214C13.5586 10.684 12.7955 11.0001 11.9999 11.0001Z"
            fill="white"
          />
        </svg>
      </button>
    </div>
  );
};

export default PointDrawTool;
