//    var canvas = this.__canvas = new fabric.Canvas('c', {
//       isDrawingMode: true
//    });
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');


    var drawingFlag = false; // 다각형이 그려지고 있는 상태를 가지고 있을 변수입니다
    var drawingPolygon; // 그려지고 있는 다각형을 표시할 다각형 객체입니다
    var polygon; // 그리기가 종료됐을 때 지도에 표시할 다각형 객체입니다
    var areaOverlay; // 다각형의 면적정보를 표시할 커스텀오버레이 입니다

//  fabric.Object.prototype.transparentCorners = false;


    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
//    var clearEl = $('deleteBtn');
    let data = [

    ]

    let savedArr = [

    ]
    // canvas 지우기 버튼
    function Canvasclear(){
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        savedArr = [];
    };

    $('#deleteBtn').on("click", function() { Canvasclear() });


    let isDown = false;
    canvas.addEventListener('mousedown', function (event) {
        isDown = true;
    });

    canvas.addEventListener('mouseup', function (event) {
        isDown = false;
        if(data && data.length > 0){
            savedArr[savedArr.length] = data
            data = [ ]
        }
    });

    // 휴태돈 터치 이벤트
    canvas.addEventListener("touchmove", touchMove, false);
    canvas.addEventListener("touchstart", touchStart, false);
    canvas.addEventListener("touchend", touchEnd, false);

    //터치한 좌표 구하는 함수
    function getTouchPos(e) {
    return {
        x: e.touches[0].clientX - e.target.offsetLeft,
        y: e.touches[0].clientY - e.target.offsetTop + document.documentElement.scrollTop
        }
    }

    function touchMove(e) {
    if(!drawing) return;
    const { x, y } = getTouchPos(e);
    draw(x, y);
    startX = x;
    startY = y;

    //        <option value="9">9px</option>
    }


    function touchStart(e) {
    e.preventDefault();
    drawing = true;
    const { x, y } = getTouchPos(e);
    startX = x;
    startY = y;
    }


    function touchEnd(e) {
    if(!drawing) return;
    // 점을 찍을 경우 위해 마지막에 점을 찍는다.
    // touchEnd 이벤트의 경우 위치정보가 없어서 startX, startY를 가져와서 점을 찍는다.

//            <option value="9">9px</option>
    ctx.beginPath();
    ctx.arc(startX, startY, ctx.lineWidth/2, 0, 2*Math.PI);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    drawing = false;
    }   //여기까지 휴대폰 터치 이벤트
   // 현재 점만 찍히고 연결되어 그려지지 않음  




// 지도에 마우스 클릭 이벤트를 등록합니다
// 지도를 클릭하면 다각형 그리기가 시작됩니다 그려진 다각형이 있으면 지우고 다시 그립니다
    canvas.addEventListener('click', function(mouseEvent) {

    // 마우스로 클릭한 위치입니다 
    var clickPosition = mouseEvent.latLng;

    // 지도 클릭이벤트가 발생했는데 다각형이 그려지고 있는 상태가 아니면
    if (!drawingFlag) {

        // 상태를 true로, 다각형을 그리고 있는 상태로 변경합니다
        drawingFlag = true;

        // 지도 위에 다각형이 표시되고 있다면 지도에서 제거합니다
        if (polygon) {
            polygon.setcanvas(null);
            polygon = null;
        }

        // 지도 위에 면적정보 커스텀오버레이가 표시되고 있다면 지도에서 제거합니다
        if (areaOverlay) {
            areaOverlay.setcanvas(null);
            areaOverlay = null;
        }

        // 그려지고 있는 다각형을 표시할 다각형을 생성하고 지도에 표시합니다
        drawingPolygon = new canvas.Polygon({
            canvas: canvas, // 다각형을 표시할 지도입니다
            path: [clickPosition], // 다각형을 구성하는 좌표 배열입니다 클릭한 위치를 넣어줍니다
            strokeWeight: 3, // 선의 두께입니다 
            strokeColor: '#00a0e9', // 선의 색깔입니다
            strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
            strokeStyle: 'solid', // 선의 스타일입니다
            fillColor: '#00a0e9', // 채우기 색깔입니다
            fillOpacity: 0.2 // 채우기 불투명도입니다
        });

        // 그리기가 종료됐을때 지도에 표시할 다각형을 생성합니다 
        polygon = new canvas.Polygon({
            path: [clickPosition], // 다각형을 구성하는 좌표 배열입니다 클릭한 위치를 넣어줍니다 
            strokeWeight: 3, // 선의 두께입니다 
            strokeColor: '#00a0e9', // 선의 색깔입니다   
            strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
            strokeStyle: 'solid', // 선의 스타일입니다
            fillColor: '#00a0e9', // 채우기 색깔입니다
            fillOpacity: 0.2 // 채우기 불투명도입니다
        });


    } else { // 다각형이 그려지고 있는 상태이면 

        // 그려지고 있는 다각형의 좌표에 클릭위치를 추가합니다
        // 다각형의 좌표 배열을 얻어옵니다
        var drawingPath = drawingPolygon.beginPath();

        // 좌표 배열에 클릭한 위치를 추가하고
        drawingPath.push(clickPosition);

        // 다시 다각형 좌표 배열을 설정합니다
        drawingPolygon.setPath(drawingPath);


        // 그리기가 종료됐을때 지도에 표시할 다각형의 좌표에 클릭 위치를 추가합니다
        // 다각형의 좌표 배열을 얻어옵니다
        var path = polygon.beginPath();

        // 좌표 배열에 클릭한 위치를 추가하고
        path.push(clickPosition);

        // 다시 다각형 좌표 배열을 설정합니다
        polygon.setPath(path);
    }

});

// 지도에 마우스무브 이벤트를 등록합니다
// 다각형을 그리고있는 상태에서 마우스무브 이벤트가 발생하면 그려질 다각형의 위치를 동적으로 보여주도록
//    canvas.addEventListener('mousemove', function (mouseEvent) {
//
//    // 지도 마우스무브 이벤트가 발생했는데 다각형을 그리고있는 상태이면
//        if (drawingFlag){
//
//        // 마우스 커서의 현재 위치를 얻어옵니다 
//            var mousePosition = mouseEvent.latLng;
//
//        // 그려지고있는 다각형의 좌표배열을 얻어옵니다
//            var path = drawingPolygon.beginPath();
//
//        // 마우스무브로 추가된 마지막 좌표를 제거합니다
//            if (path.length > 1) {
//             path.pop();
//        }
//
//        // 마우스의 커서 위치를 좌표 배열에 추가합니다
//            path.push(mousePosition);
//
//        // 그려지고 있는 다각형의 좌표를 다시 설정합니다
//            drawingPolygon.setPath(path);
//        }
//    });

// 지도에 마우스 오른쪽 클릭 이벤트를 등록합니다
// 다각형을 그리고있는 상태에서 마우스 오른쪽 클릭 이벤트가 발생하면 그리기를 종료합니다
    canvas.addEventListener('rightclick', function (mouseEvent) {

    // 지도 오른쪽 클릭 이벤트가 발생했는데 다각형을 그리고있는 상태이면
        if (drawingFlag) {

        // 그려지고있는 다각형을  지도에서 제거합니다
            drawingPolygon.setMap(null);
            drawingPolygon = null;

        // 클릭된 죄표로 그릴 다각형의 좌표배열을 얻어옵니다
            var path = polygon.beginPath();

        // 다각형을 구성하는 좌표의 개수가 3개 이상이면 
            if (path.length > 2) {

            // 지도에 다각형을 표시합니다
                polygon.setMap(map);

                var area = Math.round(polygon.getArea()), // 다각형의 총면적을 계산합니다
                    content = '<div class="info">총면적 <span class="number"> ' + area + '</span> m<sup>2</sup></div>';

            // 면적정보를 지도에 표시합니다
                areaOverlay = new canvas.CustomOverlay({
                    canvas: canvas, // 커스텀오버레이를 표시할 지도입니다 
                    content: content,  // 커스텀오버레이에 표시할 내용입니다
                    xAnchor: 0,
                    yAnchor: 0,
                    position: path[path.length-1]  // 커스텀오버레이를 표시할 위치입니다. 위치는 다각형의 >
                });


            } else {

            // 다각형을 구성하는 좌표가 2개 이하이면 다각형을 지도에 표시하지 않습니다 
                polygon = null;
        }   

        // 상태를 false로, 그리지 않고 있는 상태로 변경합니다
        drawingFlag = false;
    }
});



