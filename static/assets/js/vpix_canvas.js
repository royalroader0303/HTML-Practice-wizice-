//    var canvas = this.__canvas = new fabric.Canvas('c', {
//       isDrawingMode: true
//    });
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var canvasValue = canvas.toDataURL();

    var drawingFlag = false; // 다각형이 그려지고 있는 상태를 가지고 있을 변수입니다
//    var drawingPolygon; // 그려지고 있는 다각형을 표시할 다각형 객체입니다
//    var polygon; // 그리기가 종료됐을 때 지도에 표시할 다각형 객체입니다
//    var areaOverlay; // 다각형의 면적정보를 표시할 커스텀오버레이 입니다

//  fabric.Object.prototype.transparentCorners = false;
    

    //화면 zoom 
    let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
    let cameraZoom = 1
    let MAX_ZOOM = 5
    let MIN_ZOOM = 0.1    
    let SCROLL_SENSITIVITY = 0.0005

    function getEventLocation(e)
    {
        if (e.touches && e.touches.length == 1)
        {
            return { x:e.touches[0].clientX, y: e.touches[0].clientY }
        }
        else if (e.clientX && e.clientY)
        {
            return { x: e.clientX, y: e.clientY }        
        }   
    }   


   
    let isDragging = false
    function onPointerDown(e)
    {
        isDragging = true
        dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
        dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
    }

    function onPointerUp(e)
    {
        isDragging = false
        initialPinchDistance = null
        lastZoom = cameraZoom
    }

    let lastZoom = cameraZoom
    function adjustZoom(zoomAmount, zoomFactor)
    {
        if (!isDragging)
        {
            if (zoomAmount)
            {
                cameraZoom += zoomAmount
            }
            else if (zoomFactor)
            {
                console.log(zoomFactor)
                cameraZoom = zoomFactor*lastZoom
            }
        
            cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
            cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        
            console.log(zoomAmount)
        }
    }


    canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

//    addEventListener('wheel', (event) => {});

//    onwheel = (event) => { };


//    function zoom(event) {
//        event.preventDefault();
//
//       scale += event.deltaY * -0.01;

    // Restrict scale
//        scale = Math.min(Math.max(.125, scale), 4);

    // Apply scale transform
//        el.style.transform = `scale(${scale})`;
//    }

//    let scale = 1;
//    const el = document.querySelector('div');
//    el.onwheel = zoom;

 
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
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
    canvas.addEventListener('mousedown', function (event) {  //mousedown 그리기 시작
        isDown = true;
    });

    canvas.addEventListener('mouseup', function (event) {   //mouseup 그리기 종료
        isDown = false;
        if(data && data.length > 0){
            savedArr[savedArr.length] = data
            data = [ ]
        }
        if( savedArr.length > 0 ){
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    });

    // 휴대폰 터치 이벤트
    canvas.addEventListener("touchmove", touchMove, false);
    canvas.addEventListener("touchstart", touchStart, false);
    canvas.addEventListener("touchend", touchEnd, false);

    //그려진 좌표 구하는 함수
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

    ctx.beginPath();
    ctx.arc(startX, startY, ctx.lineWidth/2, 0, 2*Math.PI);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    drawing = false;
    }   //여기까지 휴대폰 터치 이벤트
   // 현재 점만 찍히고 연결되어 그려지지 않음  

    



    canvas.addEventListener('mousemove', function (event) {
        var x1 = event.clientX - canvas.offsetLeft;
        var y1 = event.clientY - canvas.offsetTop;
        if(isDown){
            data.push({x : x1, y : y1, rateX : x1/width, rateY : y1/height})
            drawing()
        }
    });


    function drawing(scale, translatePos){
        ctx.clearRect(0, 0, width, height)
        ctx.lineWidth = 3; 
        ctx.lineCap = 'round';   
        ctx.lineJoin = 'round';  //효과        
        if(savedArr.length > 0){
            savedArr.forEach( (_item)=>{
                ctx.save()
                ctx.beginPath()
                _item.forEach( function(savedData, idx){
                    if(idx == 0){
                        ctx.moveTo(savedData.x, savedData.y);
                    }
                    if(idx+1 != _item.length){
                        ctx.lineTo(_item[idx+1].x, _item[idx+1].y);
                    }
                });
                ctx.closePath()
                ctx.stroke()
                ctx.restore()
    
            })
        };
        ctx.save()
        ctx.beginPath()
        ctx.lineWidth = 3; 
        data.forEach( (_item, idx)=>{
            if(idx == 0){
                ctx.moveTo(_item.x, _item.y);
            }
            if(idx+1 != data.length){
                ctx.lineTo(data[idx+1].x, data[idx+1].y);
            }
        })
        ctx.stroke();
        ctx.restore();
        ctx.closePath();

        console.log('coor_log');



     };
    
   
     console.log(canvasValue);
