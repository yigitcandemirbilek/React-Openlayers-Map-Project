import React, { useEffect, useRef } from 'react';
import Overlay from 'ol/Overlay';
import { Draw, Modify, Snap } from 'ol/interaction';
import { deactivateDrawTools } from './DeactiveDrawTools';
import { LineString } from 'ol/geom';
import { getLength } from 'ol/sphere';
import { Feature } from 'ol';
import { toStringHDMS } from 'ol/coordinate';

const LineDrawTool = ({ map }) => {
    const popupOverlayRef = useRef(null);
    const isNewLineAdded = useRef(false);
    const measureTooltipRef = useRef(null);

    let drawLineInteraction;

    const activateLineDrawTool = () => {
        deactivateDrawTools();
        drawLineInteraction = new Draw({
            source: map.getLayers().item(1).getSource(),
            type: 'LineString',
        });

        drawLineInteraction.on('drawstart', (event) => {
            isNewLineAdded.current = false;
            map.removeOverlay(measureTooltipRef.current);

            const tooltipElement = document.createElement('div');
            tooltipElement.className = 'ol-tooltip ol-tooltip-measure';
            measureTooltipRef.current = new Overlay({
                element: tooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center',
            });
            map.addOverlay(measureTooltipRef.current);

            event.feature.on('change', (evt) => {
                const geom = evt.target.getGeometry();
                const length = getLength(geom, {
                    projection: map.getView().getProjection(),
                    radius: 6371,
                });
                const output = `${length.toFixed(2)} km`;
                const tooltipCoord = geom.getLastCoordinate();
                tooltipElement.innerHTML = `<span>${output}</span>`;
                measureTooltipRef.current.setPosition(tooltipCoord);
            });
        });

        drawLineInteraction.on('drawend', (event) => {
            isNewLineAdded.current = true;
            map.removeOverlay(measureTooltipRef.current);
            map.removeInteraction(drawLineInteraction);

            const geometry = event.feature.getGeometry();
            const length = getLength(geometry, {
                projection: map.getView().getProjection(),
                radius: 6371,
            });

            const output = `${length.toFixed(2)} km`;

          // Popup elementini oluştur
const popupElement = document.createElement('div');
popupElement.classList.add('popup-container');

// Mesafe bilgisini içeren paragraf elementini oluştur
const distanceInfoParagraph = document.createElement('p');
distanceInfoParagraph.textContent = `Mesafe: ${output}`;
distanceInfoParagraph.classList.add('distance-info');

// Kapatma düğmesini oluştur
const closeButton = document.createElement('span');
closeButton.textContent = 'X'; // Kapatma düğmesinin içeriğini "X" olarak ayarla
closeButton.style.cursor = 'pointer'; // Fare işaretçisinin kapatma düğmesi üzerine gelince el şeklinde görünmesini sağla
closeButton.classList.add('distance-info-close-button'); // Kapatma düğmesine sınıf ekle

closeButton.addEventListener('click', function() {
    // Popup elementini kaldır
    popupElement.remove();
});

// Mesafe bilgisini içeren paragraf elementine kapatma düğmesini ekle
distanceInfoParagraph.appendChild(closeButton);


// Paragrafı popup elementine ekle
popupElement.appendChild(distanceInfoParagraph);

// Sayfa içinde popup elementini görüntüle
document.body.appendChild(popupElement);


            // Popup'ı belirli bir elementin altına ekleyin
            document.body.appendChild(popupElement);

            const popupOverlay = new Overlay({
                element: popupElement,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250,
                },
            });

            const lastCoordinate = geometry.getLastCoordinate();
            popupOverlay.setPosition(lastCoordinate);

            map.addOverlay(popupOverlay);

            const feature = new Feature({
                geometry: new LineString(geometry.getCoordinates()),
            });
            map.getLayers().item(1).getSource().addFeature(feature);
        });

        map.addInteraction(drawLineInteraction);

        const modifyInteraction = new Modify({
            source: map.getLayers().item(1).getSource(),
        });
        map.addInteraction(modifyInteraction);

        const snapInteraction = new Snap({
            source: map.getLayers().item(1).getSource(),
        });
        map.addInteraction(snapInteraction);
    };

    useEffect(() => {
        if (!map) return;

        const popupElement = document.createElement('div');
        popupElement.className = 'ol-popup';

        popupOverlayRef.current = new Overlay({
            element: popupElement,
            autoPan: true,
            autoPanAnimation: {
                duration: 250,
            },
        });
        map.addOverlay(popupOverlayRef.current);

        const handleMapClick = (event) => {
            const pixel = map.getEventPixel(event.originalEvent);
            const coordinate = map.getEventCoordinate(event.originalEvent);
            const feature = map.forEachFeatureAtPixel(pixel, (feat) => feat);

            if (feature && feature.getGeometry().getType() === 'LineString') {
                if (!isNewLineAdded.current) {
                    popupOverlayRef.current.setPosition(coordinate);

                    const content = document.createElement('p');
                    content.innerHTML = `Mesafe: ${getLength(
                        feature.getGeometry(),
                        { projection: map.getView().getProjection(), radius: 6371 }
                    ).toFixed(2)} km`;
                    popupElement.innerHTML = '';
                    popupElement.appendChild(content);
                } else {
                    isNewLineAdded.current = false;
                }
            } else {
                popupOverlayRef.current.setPosition(undefined);
            }
        };

        map.on('click', handleMapClick);

        return () => {
            map.un('click', handleMapClick);
        };
    }, [map]);

    const handleLineDrawButtonClick = () => {
        activateLineDrawTool();
    };

    return (
        <div>
            <button
                onClick={handleLineDrawButtonClick}
                className="linebtn"
                title="Line Tool">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M21 6H21.046L15.796 15H14.852L10 9.455V7H7V9.926L1.862 18H0V21H3V18.074L8.138 10H9.148L14 15.545V18H17V15H16.954L22.204 6H24V3H21V6ZM8 8H9V9H8V8ZM2 20H1V19H2V20ZM16 17H15V16H16V17ZM23 4V5H22V4H23Z"
                        fill="white"
                    />
                </svg>
            </button>
        </div>
    );
};

export default LineDrawTool;
