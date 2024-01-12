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

        const sketch = new Feature();
        let tooltipCoord;

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
                    radius: 6371, // Dünya'nın yarıçapı (örneğin, kilometre cinsinden)
                });
                const output = `${length.toFixed(2)} km`;
                tooltipCoord = geom.getLastCoordinate();
                tooltipElement.innerHTML = `<span>${output}</span>`;
                measureTooltipRef.current.setPosition(tooltipCoord);
            });
        });

        drawLineInteraction.on('drawend', (event) => {
            isNewLineAdded.current = true;
            map.removeOverlay(measureTooltipRef.current);
            map.removeInteraction(drawLineInteraction);

            const feature = new Feature({
                geometry: new LineString(event.feature.getGeometry().getCoordinates()),
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
                    content.innerHTML = `Çizgi Uzunluğu: ${getLength(
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
                title="Çizgi Aracı">
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
