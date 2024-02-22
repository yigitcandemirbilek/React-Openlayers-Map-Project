import React, { useState } from 'react';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Polygon } from 'ol/geom';
import { getArea } from 'ol/sphere';
import Overlay from 'ol/Overlay';

// PolygonDrawTool bileşeni, bir haritada çokgen çizme işlevselliğini sağlar
const PolygonDrawTool = ({ map, drawPolygonInteraction, drawPointInteraction }) => {
    const [area, setArea] = useState(null); // Alan bilgisini saklamak için state kullan
    const [popup, setPopup] = useState(null); // Popup bileşenini saklamak için state kullan

    // Çokgen çizme aracını etkinleştir
    const activatePolygonDrawTool = () => {
        // Nokta çizme aracının etkileşimini kaldır
        if (drawPointInteraction) {
            map.removeInteraction(drawPointInteraction);
        }

        // Çizim etkileşimini oluştur ve haritaya ekle
        drawPolygonInteraction = new Draw({
            source: map.getLayers().item(1).getSource(), // Çizimlerin kaydedileceği kaynağı belirt
            type: "Polygon", // Çokgen çizimi belirt
        });

        // Çizim tamamlandığında yapılacak işlemler
        drawPolygonInteraction.on("drawend", (event) => {
            const geometry = event.feature.getGeometry(); // Çizimin geometrisini al
            const coordinates = geometry.getCoordinates()[0]; // Koordinatları al
            const polygon = new Polygon([coordinates]); // Bir çokgen oluştur
            const areaInSquareMeters = getArea(polygon); // Alanı hesapla
            setArea(areaInSquareMeters); // Alanı state'e kaydet

            // Popup oluştur
            const popupContent = document.createElement('div'); // Popup içeriğini oluştur
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
                map.removeOverlay(popup); // Popup'ı haritadan kaldır
                setPopup(null); // Popup state'ini sıfırla
            });

            map.addOverlay(popup); // Popup'ı haritaya ekle
            popup.setPosition(coordinates[0]); // Popup'ı çizginin başlangıç noktası yakınında aç

            setPopup(popup); // Popup bileşenini state'e kaydet

            map.removeInteraction(drawPolygonInteraction); // Çokgen çizme etkileşimini kaldır
        });

        map.addInteraction(drawPolygonInteraction); // Çokgen çizme etkileşimini haritaya ekle

        // Çizimi düzenleme etkileşimini oluştur ve haritaya ekle
        const modifyInteraction = new Modify({
            source: map.getLayers().item(1).getSource(), // Düzenlenecek kaynağı belirt
        });
        map.addInteraction(modifyInteraction);

        // Yakalama etkileşimini oluştur ve haritaya ekle
        const snapInteraction = new Snap({
            source: map.getLayers().item(1).getSource(), // Yakalanacak kaynağı belirt
        });
        map.addInteraction(snapInteraction);
    };

    // Çokgen çizme düğmesine tıklandığında tetiklenecek fonksiyon
    const handlePolygonDrawButtonClick = () => {
        setArea(null); // Yeni bir çokgen çizildiğinde alanı sıfırla

        // Eğer önceki bir popup varsa kaldır
        if (popup) {
            map.removeOverlay(popup);
            setPopup(null);
        }

        activatePolygonDrawTool(); // Çokgen çizme aracını etkinleştir
    };

    // Butonun ve tıklama işleminin eklendiği yer
    return (
        <div>
            {/* Çokgen çizme düğmesi */}
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
