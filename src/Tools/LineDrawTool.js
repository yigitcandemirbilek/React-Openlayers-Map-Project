import React, { useState } from 'react';
import { Draw, Modify, Snap } from 'ol/interaction';




let drawLineInteraction;
const lineButton = document.querySelector('.linebtn')

const LineDrawTool = ({ map }) => {
    
    const activateLineDrawTool = () => {
        drawLineInteraction = new Draw({
                source: map.getLayers().item(1).getSource(),
                type: "LineString",
            });
    
        drawLineInteraction.on("drawend", (event) => {
           
    
            map.removeInteraction(drawLineInteraction);
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
        )
};

export default LineDrawTool;