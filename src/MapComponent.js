import React, { useEffect, useState, useRef } from 'react';
import 'ol/ol.css';
import './App.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat, transform } from 'ol/proj';
import html2canvas from 'html2canvas';
import { CameraOutlined } from '@ant-design/icons';
import PointDrawTool from './Tools/PointDrawTool';
import PolygonDrawTool from './Tools/PolygonDrawTool';
import LineDrawTool from './Tools/LineDrawTool';
import { Toast } from 'primereact/toast';
import { saveCoordinatesToPostgres, getCoordinatesFromPostgres } from './Api'; 
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css';

const MapComponent = () => {
    const turkeyCenter = fromLonLat([35.1683, 37.1616]);
    const [map, setMap] = useState(null);
    const toast = useRef(null);
    const [coordinatesFromPostgres, setCoordinatesFromPostgres] = useState([]);
    const [pointCoordinates, setPointCoordinates] = useState([]);
    const [lineCoordinates, setLineCoordinates] = useState([]);
    const [polygonCoordinates, setPolygonCoordinates] = useState([]);
    const popup = useRef(null);
    const popupOverlay = useRef(null);
    const [visibleRight, setVisibleRight] = useState(false);



    useEffect(() => {
        const initialMap = new Map({
            target: "map",
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: turkeyCenter,
                zoom: 6.6,
            }),
        });

        const vectorSource = new VectorSource({});
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: {
                'fill-color': 'rgba(255, 255, 255, 0.2)',
                'stroke-color': '#ffcc33',
                'stroke-width': 2,
                'circle-radius': 7,
                'circle-fill-color': '#ffcc33',
            },
        });

        initialMap.addLayer(vectorLayer);

        setMap(initialMap);

        return () => {
            initialMap.setTarget(null);
        };
    }, []);

    useEffect(() => {
        if (map) {
            map.on('singleclick', function (evt) {
                const clickedCoordinate = evt.coordinate;
                const features = map.getFeaturesAtPixel(evt.pixel);
                if (features && features.length === 1) {
                    const feature = features[0];
                    const geometry = feature.getGeometry();
                    const coordinates = getFeatureCoordinates(geometry);
                    const geometryType = geometry.getType();
                    showPopup(clickedCoordinate, coordinates, geometryType);
                }
            });
        }
    }, [map]);

    useEffect(() => {
        if (coordinatesFromPostgres.length > 0) {
            setPointCoordinates(coordinatesFromPostgres.filter(coord => coord.geometryType === 'Point').map(coord => coord.coordinates));
            setLineCoordinates(coordinatesFromPostgres.filter(coord => coord.geometryType === 'LineString').map(coord => coord.coordinates));
            setPolygonCoordinates(coordinatesFromPostgres.filter(coord => coord.geometryType === 'Polygon').map(coord => coord.coordinates));
        }
    }, [coordinatesFromPostgres]);

    const decimalToDMS = (coordinate, isLongitude) => {
        const direction = isLongitude ? (coordinate >= 0 ? 'E' : 'W') : (coordinate >= 0 ? 'N' : 'S');
        coordinate = Math.abs(coordinate);
        const degrees = Math.floor(coordinate);
        const minutes = Math.floor((coordinate - degrees) * 60);
        const seconds = ((coordinate - degrees - (minutes / 60)) * 3600).toFixed(1);
        return `${degrees}° ${minutes}' ${Math.abs(seconds)}" ${direction}`;
    };

    const getFeatureCoordinates = (geometry) => {
        let coordinates = [];
        geometry.getCoordinates().forEach(coord => {
            if (Array.isArray(coord[0])) {
                coord.forEach(subCoord => {
                    coordinates.push(subCoord);
                });
            } else {
                coordinates.push(coord);
            }
        });
        return coordinates;
    };

    const showPopup = (clickedCoordinate, coordinates, geometryType) => {
        if (!popup.current) {
            popup.current = new Overlay({
                element: document.createElement('div'),
                autoPan: {
                    animation: {
                        duration: 250,
                    },
                },
            });
            map.addOverlay(popup.current);
        }

        const popupElement = popup.current.getElement();
        popupElement.className = 'ol-popup';
        const popupContent = document.createElement('div');
    
        let popupText = '';
        switch (geometryType) {
            case 'Point':
                const wgs84Coordinate = transform(clickedCoordinate, 'EPSG:3857', 'EPSG:4326');
                popupText = `<p>Point Coordinates:</p><ul><li>${decimalToDMS(wgs84Coordinate[1], false)}, ${decimalToDMS(wgs84Coordinate[0], true)}</li></ul>`;
                break;
            case 'Polygon':
                popupText = `<p>Polygon Coordinates:</p><ul>`;
                coordinates.forEach(coord => {
                    const wgs84Coordinate = transform(coord, 'EPSG:3857', 'EPSG:4326');
                    popupText += `<li>${decimalToDMS(wgs84Coordinate[1], false)}, ${decimalToDMS(wgs84Coordinate[0], true)}</li>`;
                });
                popupText += `</ul>`;
                break;
            case 'LineString':
                popupText = `<p>Line Coordinates:</p><ul>`;
                coordinates.forEach(coord => {
                    const wgs84Coordinate = transform(coord, 'EPSG:3857', 'EPSG:4326');
                    popupText += `<li>${decimalToDMS(wgs84Coordinate[1], false)}, ${decimalToDMS(wgs84Coordinate[0], true)}</li>`;
                });
                popupText += `</ul>`;
                break;
            default:
                popupText = `<p>Coordinates:</p><ul><li>${coordinates}</li></ul>`;
        }
    
        const closer = document.createElement('a');
        closer.href = '#';
        closer.className = 'ol-popup-closer';
        closer.onclick = function () {
            popupOverlay.setPosition(undefined);
            closer.blur();
            return false;
        };
        popupElement.appendChild(closer);
    
        popupContent.innerHTML = popupText;
        popupElement.appendChild(popupContent);
    
        const googleMapsLink = document.createElement('a');
        googleMapsLink.href = '#';
        googleMapsLink.classList = "googlemaps-link";
        googleMapsLink.textContent = 'Google Haritalar\'da Görüntüle';
        googleMapsLink.onclick = function () {
            const [longitude, latitude] = transform(clickedCoordinate, 'EPSG:3857', 'EPSG:4326');
            openGoogleMaps(latitude, longitude);
            return false;
        };
        popupElement.appendChild(googleMapsLink);
    
        const br = document.createElement('br');
        popupElement.appendChild(br);
    
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.onclick = async function () {
            try {
                let pointCoordinates = [];
                let lineCoordinates = [];
                let polygonCoordinates = [];
        
                map.getLayers().forEach(layer => {
                    if (layer instanceof VectorLayer) {
                        const source = layer.getSource();
                        const features = source.getFeatures();
                        features.forEach(feature => {
                            const geometry = feature.getGeometry();
                            const coordinates = getFeatureCoordinates(geometry);
                            switch (geometry.getType()) {
                                case 'Point':
                                    pointCoordinates.push(coordinates);
                                    break;
                                case 'LineString':
                                    lineCoordinates.push(coordinates);
                                    break;
                                case 'Polygon':
                                    polygonCoordinates.push(coordinates);
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                });
        
                await saveCoordinatesToPostgres(pointCoordinates, lineCoordinates, polygonCoordinates);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'The coordinates were recorded in the table.' });
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Saving coordinates to table failed.' });
            }
        };

        popupElement.appendChild(saveButton);

        const getButton = document.createElement('button');
        getButton.textContent = 'Bring';
        getButton.onclick = async function () {
            try {
                const coordinates = await getCoordinatesFromPostgres();
                const coordinateArray = coordinates.map(coordinate => ({
                    latitude: coordinate[0],
                    longitude: coordinate[1]
                }));
                setCoordinatesFromPostgres(coordinateArray);
            } catch (error) {
                toast.current.show('An error occurred while retrieving coordinates from the PostgreSQL table.', error);
            }
        };

        popupElement.appendChild(getButton);

        popup.current.setPosition(clickedCoordinate);
    };

    const openGoogleMaps = (latitude, longitude) => {
        const coordinates = `${latitude},${longitude}`;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
        window.open(googleMapsUrl, "_blank");
    };

    const handleClearButtonClick = () => {
        const vectorSource = map.getLayers().item(1).getSource();
        vectorSource.clear();
    };

    const handleResetViewButtonClick = () => {
        const defaultView = map.getView();
        defaultView.setCenter(turkeyCenter);
        defaultView.setZoom(6.6);
    };

    const takeScreenshot = () => {
        const mapElement = document.getElementById("map");
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Screenshot Saved to Clipboard.' });

        html2canvas(mapElement).then((canvas) => {
            canvas.toBlob((blob) => {
                const screenshotBlob = new Blob([blob], { type: "image/png" });

                navigator.clipboard
                    .write([new ClipboardItem({ "image/png": screenshotBlob })])
                    .then(() => {})
                    .catch((error) => {
                        toast.current.show("Copy to clipboard failed.", error);
                    });
            });
        });
    };

    const handleBringButtonClick = async () => {
        try {
            const coordinates = await getCoordinatesFromPostgres();
            const coordinateArray = coordinates.map(coordinate => ({
                latitude: coordinate[0],
                longitude: coordinate[1]
            }));
            setCoordinatesFromPostgres(coordinateArray);
        } catch (error) {
            toast.current.show('An error occurred while retrieving coordinates from the PostgreSQL table.', error);
        }
    };
    const handleClearTableClick = () => {
        setCoordinatesFromPostgres([]);
    }

    return (
        <div id="map" style={{ width: "100%", height: "1000px" }}>
            <Sidebar visible={visibleRight} position='right' onHide={() => setVisibleRight(false)} className="sidebar-left">
                <h2>DataBase Table</h2>
                <div className="table-container">
                    <DataTable value={coordinatesFromPostgres}>
                        <Column field="latitude" header="latitude" />
                        <Column field="longitude" header="longitude" />
                    </DataTable>
                    <div className="table-buttons">
                    <Button label="Bring" onClick={handleBringButtonClick} className="p-button-text" />
                    <Button label="Clear" onClick={handleClearTableClick} className="p-button-text" />
                    </div>
                </div>
            </Sidebar>
            <div className="toolbar">
                <div className="toolbar-content">
                    <PointDrawTool
                        map={map}
                        className="pointbtn"
                        onDrawEnd={coordinates => {
                            setPointCoordinates([...pointCoordinates, coordinates]);
                            showPopup(coordinates, coordinates, 'Point');
                        }}
                    />
                    <PolygonDrawTool
                        map={map}
                        className="polygonbtn"
                        onDrawEnd={coordinates => {
                            setPolygonCoordinates([...polygonCoordinates, coordinates]);
                            showPopup(coordinates[0], coordinates, 'Polygon');
                        }}
                    />
                    <LineDrawTool
                        map={map}
                        className="linebtn"
                        onDrawEnd={coordinates => {
                            setLineCoordinates([...lineCoordinates, coordinates]);
                            showPopup(coordinates[0], coordinates, 'LineString');
                        }}
                    />
                    <button
                        onClick={handleClearButtonClick}
                        className="clearbtn"
                        title="Clear Button">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19.0099 22.4663H9.74623L12.4295 19.6827L5.19116 12.0911L1.12597 16.3317C0.872354 16.5952 0.729675 16.9541 0.729675 17.3286C0.729675 17.703 0.872354 18.0619 1.12597 18.3254L5.11805 22.4663H0.73115C0.327347 22.4663 0 22.8097 0 23.2332C0 23.6567 0.327347 24 0.73115 24H19.0099C19.4137 24 19.741 23.6567 19.741 23.2332C19.741 22.8097 19.4137 22.4663 19.0099 22.4663Z"
                                fill="white"
                            />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M16.3714 0.415636L6.34731 10.9289L13.5857 18.5205L23.6098 8.00727C24.1301 7.45472 24.1301 6.56606 23.6098 6.01351L18.2724 0.415636C18.0211 0.149642 17.6789 0 17.3219 0C16.9649 0 16.6226 0.149642 16.3714 0.415636ZM22.8832 6.70064L22.8817 6.69908L17.5454 1.10235C17.4777 1.03069 17.3961 1 17.3219 1C17.2476 1 17.166 1.03069 17.0983 1.10234L17.0951 1.10571L7.72901 10.9289L13.5857 17.0714L22.8817 7.32171L22.8832 7.32015C23.0389 7.153 23.0389 6.86779 22.8832 6.70064Z"
                                fill="white"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={handleResetViewButtonClick}
                        className="mapresetbtn"
                        title="Reset Button">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10.8055 20.3265C12.361 20.3265 13.6221 19.0579 13.6221 17.493C13.6221 15.9281 12.361 14.6595 10.8055 14.6595C9.24988 14.6595 7.98883 15.9281 7.98883 17.493C7.98883 19.0579 9.24988 20.3265 10.8055 20.3265ZM10.8055 21.312C12.9021 21.312 14.6017 19.6021 14.6017 17.493C14.6017 15.3838 12.9021 13.674 10.8055 13.674C8.70886 13.674 7.00924 15.3838 7.00924 17.493C7.00924 19.6021 8.70886 21.312 10.8055 21.312Z"
                                fill="white"
                            />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M0 17.493C0 17.493 4.4241 24 10.8054 24C17.1868 24 21.6109 17.493 21.6109 17.493C21.6109 17.493 17.1868 10.986 10.8054 10.986C4.4241 10.986 0 17.493 0 17.493ZM1.22728 17.493C1.31717 17.6061 1.4209 17.7334 1.53795 17.8722C2.02679 18.4518 2.74189 19.2246 3.6439 19.9954C5.46557 21.5521 7.94709 23.0145 10.8054 23.0145C13.6638 23.0145 16.1453 21.5521 17.967 19.9954C18.869 19.2246 19.5841 18.4518 20.0729 17.8722C20.19 17.7334 20.2937 17.6061 20.3836 17.493C20.2937 17.3799 20.19 17.2526 20.0729 17.1138C19.5841 16.5341 18.869 15.7613 17.967 14.9905C16.1453 13.4339 13.6638 11.9714 10.8054 11.9714C7.94709 11.9714 5.46557 13.4339 3.6439 14.9905C2.74189 15.7613 2.02679 16.5341 1.53795 17.1138C1.4209 17.2526 1.31717 17.3799 1.22728 17.493Z"
                                fill="white"
                            />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.62683 4.96288L10.9197 8.35463L10.2189 9.04318L5.77485 4.46569L10.2233 0L10.9152 0.697565L7.64806 3.97741L14.0905 3.9774C18.129 3.9774 20.658 5.64315 22.1472 7.76532C23.6152 9.85732 24.0457 12.3512 23.9963 14.0225V18.7534H23.0167V14.0075L23.0169 13.9999C23.063 12.4896 22.6675 10.2155 21.3469 8.33365C20.0453 6.47876 17.8178 4.96287 14.0905 4.96287L7.62683 4.96288Z"
                                fill="white"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={takeScreenshot}
                        className="screenshotBtn"
                        title="Take a Screenshot">
                        <CameraOutlined />
                    </button>
                </div>
                <div className='sidebar-btn'>
                    <Button icon="pi pi-arrow-left" onClick={() => setVisibleRight(true)} />
                    </div>
                <Toast className='screenshot-toast' ref={toast}></Toast>
            </div>
        </div>
    );
};

export default MapComponent;
