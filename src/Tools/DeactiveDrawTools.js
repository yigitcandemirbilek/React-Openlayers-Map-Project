const polygonButton = document.querySelector('.polygonbtn');
const lineButton = document.querySelector('.linebtn')
const pointButton = document.querySelector('.pointbtn');


//Burada çizim araçlarını aktifliğini kaldırmak için bir fonksiyon oluşturduk.

export const deactivateDrawTools = (map, drawPolygonInteraction, drawLineInteraction, drawPointInteraction) => {
    if (drawPolygonInteraction) {
        map.removeInteraction(drawPolygonInteraction);
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
    }
};

export default deactivateDrawTools;
