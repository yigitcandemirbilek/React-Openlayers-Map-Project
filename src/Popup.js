
import React from 'react';
import { Overlay } from 'ol';

const Popup = ({ map, coordinates }) => {
    const decimalDegreesToDMS = (decimal) => {
        const degrees = Math.floor(decimal);
        const minutes = Math.floor((decimal - degrees) * 60);
        const seconds = ((decimal - degrees - (minutes / 60)) * 3600).toFixed(2);
        return `${degrees}° ${minutes}' ${seconds}"`;
        };

    const createPopup = () => {
        const lat = decimalDegreesToDMS(coordinates[1]);
        const lon = decimalDegreesToDMS(coordinates[0]);
        const latDirection = coordinates[1] >= 0 ? 'N' : 'S';
        const lonDirection = coordinates[0] >= 0 ? 'E' : 'W';

        const popup = new Overlay({
            position: coordinates,
            element: document.createElement('div'),
            stopEvent: false,
        });

        const popupElement = popup.getElement();
        popupElement.className = 'popup';
        popupElement.innerHTML = `
            <table>
                <caption>Coordinates</>
                <th>Latitude:</th>
                <td> ${lat} ${latDirection} </td>
                <th> Longitude:</th>
                <td> ${lon} ${lonDirection} </td>
            </table>
            <button>Kaydet</button>
        `;

        map.addOverlay(popup);
    };

    React.useEffect(() => {
        if (map && coordinates) {
            createPopup();
        }
    }, [map, coordinates]);

    return null; 
};

export default Popup;
