import React from 'react';
import { Draw, Modify, Snap } from 'ol/interaction';

//Polygon çizme aracının ve popupının oluşturulduğu fonksiyon.

const PolygonDrawTool = ({ map, drawPolygonInteraction }) => {
    
    const activatePolygonDrawTool = () => {
        drawPolygonInteraction = new Draw({
			source: map.getLayers().item(1).getSource(),
			type: "Polygon",
		});

		drawPolygonInteraction.on("drawend", (event) => {
			
	
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

		//Butonumuzun click eventi burada oluşturuldu.

        const handlePolygonDrawButtonClick = () => {
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
