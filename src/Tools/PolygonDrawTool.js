import React, { useState } from 'react';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Polygon } from 'ol/geom';
import { getArea } from 'ol/sphere';
import Overlay from 'ol/Overlay';

const PolygonDrawTool = ({ map, drawPolygonInteraction, drawPointInteraction }) => {
    const [area, setArea] = useState(null);
    const [popup, setPopup] = useState(null);

    const activatePolygonDrawTool = () => {
        // Nokta çizme aracının etkileşimini kaldır
        if (drawPointInteraction) {
            map.removeInteraction(drawPointInteraction);
        }

        drawPolygonInteraction = new Draw({
            source: map.getLayers().item(1).getSource(),
            type: "Polygon",
        });

        drawPolygonInteraction.on("drawend", (event) => {
            const geometry = event.feature.getGeometry();
            const coordinates = geometry.getCoordinates()[0];
            const polygon = new Polygon([coordinates]);
            const areaInSquareMeters = getArea(polygon);
            setArea(areaInSquareMeters);

            // Popup oluştur
            const popupContent = document.createElement('div');
            popupContent.innerHTML = `
                <div class="ol-popup">
                    <div>Area: ${areaInSquareMeters.toFixed(2)} square meters</div>
                    <a href="#" class="area-close-tag">X</a>
                </div>`;
            const popup = new Overlay({
                element: popupContent,
                positioning: 'bottom-center',
                stopEvent: false,
                offset: [0, -50], // Popup'ın çizginin altında açılması için ayarlanabilir
            });

            // Kapatma düğmesi işlevselliği
            popupContent.querySelector('.area-close-tag').addEventListener('click', () => {
                map.removeOverlay(popup);
                setPopup(null);
            });

            map.addOverlay(popup);
            popup.setPosition(coordinates[0]); // Çizginin başlangıç noktası yakınında popup aç

            setPopup(popup);

            map.removeInteraction(drawPolygonInteraction);
        });

        map.addInteraction(drawPolygonInteraction);

        const modifyInteraction = new Modify({
            source: map.getLayers().item(1).getSource(),
        });
        map.addInteraction(modifyInteraction);

        const snapInteraction = new Snap({
            source: map.getLayers().item(1).getSource(),
        });
        map.addInteraction(snapInteraction);
    };

    const handlePolygonDrawButtonClick = () => {
        setArea(null); // Reset area when starting to draw a new polygon

        // Eğer önceki bir popup varsa kaldır
        if (popup) {
            map.removeOverlay(popup);
            setPopup(null);
        }

        activatePolygonDrawTool();
    };

    return (
        <div>
            <button className="polygonbtn"
                title="Polygon Tool"
                onClick={handlePolygonDrawButtonClick}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        opacity="0.25"
                        d="M0 24V3.7983L9.98533 10.7806L24 0V24H0Z"
                        fill="white"
                    />
                    <path
                        d="M10.1544 10.08L0 3.36V24H24V0L10.1544 10.08ZM22.8 22.8H1.2V5.5932L10.1868 11.5404L22.8 2.358V22.8Z"
                        fill="white"
                    />
                </svg>
            </button>
        </div>
    );
};

export default PolygonDrawTool;
