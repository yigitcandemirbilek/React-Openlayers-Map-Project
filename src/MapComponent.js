//İmportlar burada tutuluyor
import React, { useEffect, useState } from 'react';
import 'ol/ol.css';
import './App.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import DragPan from 'ol/interaction/DragPan';
import { Draw, Modify, Pointer, Snap } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import html2canvas from 'html2canvas';
import {CameraOutlined} from '@ant-design/icons';
import Popup from './Popup';




//Bu MapComponent fonksiyonunda haritamızı getiriyoruz.

const MapComponent = () => {
	const turkeyCenter = fromLonLat([35.1683, 37.1616]);
	const [map, setMap] = useState(null);
	let drawPolygonInteraction;
	let drawLineInteraction;
	let drawPointInteraction;
	const [dragPanInteraction, setDragPanInteraction] = useState(null);
	const [isDragActive, setIsDragActive] = useState(false);
	const pointButton = document.querySelector('.pointbtn');
	const polygonButton = document.querySelector('.polygonbtn');
	const lineButton = document.querySelector('.linebtn')
	let popups = [];
	const [popupCoordinates, setPopupCoordinates] = useState(null);
	const createPopups = (coordinates) => {
        setPopupCoordinates(coordinates);
    };


	
	

	useEffect(() => {
		const initialMap = new Map({
			target: "map",
			layers: [
				new TileLayer({
					source: new OSM(),
				}),
			],

      // Bu kısımda haritamız açıldığında nereye fokuslanmasını gerektiğini yazdık.

			view: new View({
				center: turkeyCenter,
				zoom: 6.6,
			}),
		});

    //Burada layerları oluşturduk.

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

		const modify = new Modify({ source: vectorSource });
		initialMap.addInteraction(modify);

		setMap(initialMap);

    //dragpan toolunu burada oluşturduk.

		const dragPan = new DragPan({ kinetic: false });
		initialMap.addInteraction(dragPan);
		setDragPanInteraction(dragPan);
		setMap(initialMap);

		return () => {
			initialMap.setTarget(null);
		};
	}, []);

	



  	

  const enablePopupOnClick = () => {
    map.on('click', (event) => {
        map.forEachFeatureAtPixel(event.pixel, (feature) => {
            const coordinates = feature.getGeometry().getCoordinates();
            createPopups(coordinates); // Tıklanan yerde popup oluştur
        });
    });
  };
  
 
  
  //Polygon tool oluşturuldu.

	const activatePolygonDrawTool = () => {
		deactivateDrawTools();
		drawPolygonInteraction = new Draw({
			source: map.getLayers().item(1).getSource(),
			type: "Polygon",
		});

		drawPolygonInteraction.on("drawend", (event) => {
			const coordinates = event.feature.getGeometry().getCoordinates()[0];
			console.log("Polygon Koordinatları:", coordinates);
			coordinates.forEach((coordinate) => {
				createPopups(coordinate);
			});
	
			map.removeInteraction(drawPolygonInteraction);
			polygonButton.disabled = false;
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

  //line tool burada oluşturuldu.

	const activateLineDrawTool = () => {
    deactivateDrawTools();
    drawLineInteraction = new Draw({
			source: map.getLayers().item(1).getSource(),
			type: "LineString",
		});

    drawLineInteraction.on("drawend", (event) => {
        const coordinates = event.feature.getGeometry().getCoordinates();
        coordinates.forEach(coordinate => {
            createPopups(coordinate);
        });

		map.removeInteraction(drawLineInteraction);
		lineButton.disabled = false;
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

  //Point tool oluşturuldu.

	const activatePointDrawTool = () => {
		deactivateDrawTools();
		drawPointInteraction = new Draw({
			source: map.getLayers().item(1).getSource(),
			type: "Point",
		});

		drawPointInteraction.on("drawend", (event) => {
			const coordinates = event.feature.getGeometry().getCoordinates();
			console.log("Nokta Koordinatları:", coordinates);
			createPopups(coordinates);

			map.removeInteraction(drawPointInteraction);
        pointButton.disabled = false;

		enablePopupOnClick();
			
		});

		map.addInteraction(drawPointInteraction);

	};



  //Açılan popupları kapatmak için oluşturulan fonksiyon



  //toollarımızın kapanması için oluşturulan fonksiyon

	const deactivateDrawTools = () => {
		enablePopupOnClick();

		if (drawPolygonInteraction) {
			map.removeInteraction(drawPolygonInteraction);
      polygonButton.disabled = false;
		}
		if (drawLineInteraction) {
			map.removeInteraction(drawLineInteraction);
      lineButton.disabled = false;
		}
		if (drawPointInteraction) {
			map.removeInteraction(drawPointInteraction);
      pointButton.disabled = false;
		}
	};



 //Buton click eventleri

	const handlePolygonDrawButtonClick = () => {
		activatePolygonDrawTool();
	};

	const handleLineDrawButtonClick = () => {
		activateLineDrawTool();
	};

	const handlePointDrawButtonClick = () => {
		activatePointDrawTool();
    
	};

	const handleClearButtonClick = () => {
		const vectorSource = map.getLayers().item(1).getSource();
		vectorSource.clear();
		enablePopupOnClick();
		deactivateDrawTools();
	};

	const handleResetViewButtonClick = () => {
		const defaultView = map.getView();
		defaultView.setCenter(turkeyCenter);
		defaultView.setZoom(6.6);
	};

	const handleDragPanButtonClick = () => {
		if (dragPanInteraction) {
			setIsDragActive(!isDragActive);
			dragPanInteraction.setActive(!isDragActive);
		}
	};

	const takeScreenshot = () => {
		const mapElement = document.getElementById("map");

		html2canvas(mapElement).then((canvas) => {
			canvas.toBlob((blob) => {
				const screenshotBlob = new Blob([blob], { type: "image/png" });

				navigator.clipboard
					.write([new ClipboardItem({ "image/png": screenshotBlob })])
					.then(() => {
						console.log("Ekran görüntüsü panoya kopyalandı.");
					})
					.catch((error) => {
						console.error("Panoya kopyalama işlemi başarısız oldu:", error);
					});
			});
		});
	};


  //Haritamızın return edildiği yer butonlarımızın oluşturulup yönetldiği yer

	return (
		<div id="map" style={{ width: "100%", height: "1000px" }}>
			<div className="toolbar">
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
				<button
					className="polygonbtn"
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
					onClick={handleDragPanButtonClick}
					className="dragbtn"
					title="DragPan Tool">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M3.1219 15.2722L9.74883 21.8746C11.1152 23.2358 12.9651 24.0001 14.8937 24C18.5074 24 21.4369 21.0705 21.4369 17.4567V8.96529C21.4369 7.91885 20.5886 7.07049 19.5421 7.07049C19.4484 7.07049 19.3564 7.07729 19.2663 7.09042C18.9191 7.14104 18.6024 7.28582 18.3431 7.49804C18.2577 7.16075 18.0818 6.85951 17.8427 6.62165C17.5001 6.2807 17.0278 6.06997 16.5062 6.06997C16.4218 6.06997 16.3387 6.0755 16.2573 6.08619C15.9331 6.12874 15.6347 6.25325 15.3836 6.43823H15.317C15.2354 6.11521 15.069 5.82591 14.843 5.5953C14.506 5.25144 14.0364 5.03809 13.5169 5.03809C13.4792 5.03809 13.4418 5.03922 13.4046 5.04144C13.0307 5.06376 12.6866 5.19674 12.4046 5.40804V1.8934C12.4046 0.847702 11.5568 0 10.5112 0C9.46554 0 8.61779 0.847702 8.61779 1.8934V13.8606L5.30376 12.2236C4.5139 11.8335 3.5595 12.0376 2.9984 12.7166C2.37364 13.4726 2.42715 14.58 3.1219 15.2722Z"
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
				<Popup map={map} coordinates={popupCoordinates} />
			</div>
		</div>
	);
};

export default MapComponent;
