import React, { useEffect, useRef } from 'react';
import Overlay from 'ol/Overlay';
import { Draw, Modify, Snap } from 'ol/interaction';
import { deactivateDrawTools } from './DeactiveDrawTools';
import { LineString } from 'ol/geom';
import { getLength } from 'ol/sphere';
import { Feature } from 'ol';

// LineDrawTool bileşeni, haritada çizgi çizim aracını sağlar
const LineDrawTool = ({ map }) => {
    const popupOverlayRef = useRef(null); // Overlay için referans
    const isNewLineAdded = useRef(false); // Yeni çizgi eklendi mi?
    const measureTooltipRef = useRef(null); // Ölçüm işaretçisi için referans

    let drawLineInteraction; // Çizgi çizim etkileşimi

    // Çizgi çizim aracını etkinleştirme fonksiyonu
    const activateLineDrawTool = () => {
        deactivateDrawTools(); // Diğer çizim araçlarını devre dışı bırak

        drawLineInteraction = new Draw({
            source: map.getLayers().item(1).getSource(), // Harita katmanından veri kaynağını al
            type: 'LineString', // Tür: Çizgi
        });

        // Çizim başladığında
        drawLineInteraction.on('drawstart', (event) => {
            isNewLineAdded.current = false; // Yeni çizgi eklenmedi
            map.removeOverlay(measureTooltipRef.current); // Önceki ölçüm işaretçisini kaldır

            // Ölçüm işaretçisi oluştur
            const tooltipElement = document.createElement('div');
            tooltipElement.className = 'ol-tooltip ol-tooltip-measure';
            measureTooltipRef.current = new Overlay({
                element: tooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center',
            });
            map.addOverlay(measureTooltipRef.current);

            // Çizim değiştiğinde
            event.feature.on('change', (evt) => {
                const geom = evt.target.getGeometry(); // Geometriyi al
                const length = getLength(geom, {
                    projection: map.getView().getProjection(), // Projeksiyonu al
                    radius: 6371, // Yarıçap
                });
                const output = `${length.toFixed(2)} km`; // Mesafeyi hesapla
                const tooltipCoord = geom.getLastCoordinate(); // İşaretçi koordinatını al
                tooltipElement.innerHTML = `<span>${output}</span>`; // HTML içeriğini ayarla
                measureTooltipRef.current.setPosition(tooltipCoord); // İşaretçi pozisyonunu ayarla
            });
        });

        // Çizim tamamlandığında
        drawLineInteraction.on('drawend', (event) => {
            isNewLineAdded.current = true; // Yeni çizgi eklendi
            map.removeOverlay(measureTooltipRef.current); // Ölçüm işaretçisini kaldır
            map.removeInteraction(drawLineInteraction); // Çizim etkileşimini kaldır

            const geometry = event.feature.getGeometry(); // Geometriyi al
            const length = getLength(geometry, {
                projection: map.getView().getProjection(), // Projeksiyonu al
                radius: 6371, // Yarıçap
            });

            const output = `${length.toFixed(2)} km`; // Mesafeyi hesapla

            const feature = new Feature({
                geometry: new LineString(geometry.getCoordinates()), // Geometriyi ayarla
            });
            map.getLayers().item(1).getSource().addFeature(feature); // Feature'ı harita katmanına ekle

            // Yeni kod
            const content = document.createElement('div'); // İçerik oluştur
            content.innerHTML = `<p class="distance-info">Mesafe: ${output}</p><a href="#" class="distance-info-close-button">x</a>`; // HTML içeriğini ayarla
            content.querySelector('.distance-info-close-button').addEventListener('click', () => {
                map.removeOverlay(popup); // Popup'ı kaldır
            });

            const popup = new Overlay({
                element: content,
                positioning: 'bottom-center',
                offset: [0, -15],
            });

            popup.setPosition(geometry.getLastCoordinate()); // Popup pozisyonunu ayarla
            map.addOverlay(popup); // Popup'ı haritaya ekle
        });

        map.addInteraction(drawLineInteraction); // Çizim etkileşimini haritaya ekle

        const modifyInteraction = new Modify({
            source: map.getLayers().item(1).getSource(), // Değiştirme etkileşimine kaynağı belirt
        });
        map.addInteraction(modifyInteraction); // Değiştirme etkileşimini haritaya ekle

        const snapInteraction = new Snap({
            source: map.getLayers().item(1).getSource(), // Yakalama etkileşimine kaynağı belirt
        });
        map.addInteraction(snapInteraction); // Yakalama etkileşimini haritaya ekle
    };

    // Harita bileşeninin yüklendiğinde
    useEffect(() => {
        if (!map) return; // Harita yoksa çıkış yap

        // Popup oluştur
        const popupElement = document.createElement('div');
        popupElement.className = 'ol-popup';

        popupOverlayRef.current = new Overlay({
            element: popupElement,
            autoPan: true,
            autoPanAnimation: {
                duration: 250,
            },
        });
        map.addOverlay(popupOverlayRef.current); // Popup'ı haritaya ekle

        // Haritaya tıklama olayını dinle
        const handleMapClick = (event) => {
            const pixel = map.getEventPixel(event.originalEvent); // Pikseli al
            const coordinate = map.getEventCoordinate(event.originalEvent); // Koordinatı al
            const feature = map.forEachFeatureAtPixel(pixel, (feat) => feat); // Pikseldeki özelliği al

            // Eğer çizgi varsa
            if (feature && feature.getGeometry().getType() === 'LineString') {
                if (!isNewLineAdded.current) { // Eğer yeni çizgi eklenmediyse
                    const content = document.createElement('p'); // İçerik oluştur
                    content.innerHTML = `Mesafe: ${getLength(
                        feature.getGeometry(),
                        { projection: map.getView().getProjection(), radius: 6371 }
                    ).toFixed(2)} km`; // Mesafeyi hesapla

                    const popup = new Overlay({
                        element: content,
                        positioning: 'bottom-center',
                        offset: [0, -15],
                    });

                    popup.setPosition(coordinate); // Popup pozisyonunu ayarla
                    map.addOverlay(popup); // Popup'ı haritaya ekle
                } else {
                    isNewLineAdded.current = false; // Yeni çizgi eklendiği için false olarak ayarla
                }
            } else {
                popupOverlayRef.current.setPosition(undefined); // Popup pozisyonunu ayarla
            }
        };

        map.on('click', handleMapClick); // Haritaya tıklama olayını ekle

        return () => {
            map.un('click', handleMapClick); // Temizlik yap
        };
    }, [map]);

    // Çizgi çizim butonu tıklandığında
    const handleLineDrawButtonClick = () => {
        activateLineDrawTool(); // Çizgi çizim aracını etkinleştir
    };

    //Butonun ve tıklama olayının eklendiği yer
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
