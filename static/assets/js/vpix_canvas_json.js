   
        $(document).ready(function(){
        $('saveBtn').click(function(){	
        uploadCanvasToServer = function() {
        uploadCanvasToServer = function() {
          const canvas = document.getElementById('myCanvas');

        $.ajax({
         type: 'post',
         url: '/upload/',
         cache: false,
         data: formData,
         processData: false,
         contentType: false,
         success: function (data) {
             alert('Uploaded !!')
        }
      })
     };  
	
    	/* [html 최초 로드 및 이벤트 상시 대기 실시] */
    	window.onload = function() {
    		console.log("");
    		console.log("[window onload] : [start]");
    		console.log(""); 

    		// [이벤트 함수 호출]
    		main();
    	}; 		



    	/* [이벤트 수행 함수] */
    	function main(){
    		console.log("");
    		console.log("[main] : [start]"); 
    		console.log("");


    		//로컬 assets 파일에 저장된 json 파일 읽기 
    		var jsonData = JSON.parse(JSON.stringify(annotation));  //()안에 json 파일에 선언된 변수이름
    		console.log("");
    		console.log("[main] : [jsonData] : " + JSON.stringify(jsonData)); 
    		console.log("");


    		//json 데이터 파싱 실시
    		console.log("");
    		console.log("[main] : [idx] : " + jsonData.idx); 
    		console.log("[main] : [name] : " + jsonData.name); 
    		console.log("[main] : [program] : " + JSON.stringify(jsonData.program)); 
    		console.log("");

    	};

WZ_JSON = {  //요구하는 annot_json_샘플
    "images":[
        {
            "file_name":"COCO_val2014_000000490081.jpg",
            "height":427,
            "width":640,
            "category_id":1,
            "date_captured":"2013-11-17 20:11:43",
            "id":490081
        }
    ],
    "annotations":[
        {
            "segmentation": [ 220.29, 234.69, 200.3, 202.41, 202.22, 193.18, 208.37, 195.87, 205.68, 189.72, 212.6, 178.96, 216.44, 178.96, 221.82, 167.82, 237 ],
            "area":42217.813749999994,
            "image_id":218249,
            "bbox":[ 200.3, 71.05, 322.32, 181.9 ],
            "category_id":1,
            "id":309664
        },
        {
            "segmentation": [ 0, 1, 2, 3, 4 ],
            "area":42217.813749999994,
            "image_id":218249,
            "bbox":[ 200.3, 71.05, 322.32, 182.9 ],
            "category_id":1,
            "id":309665
        }
    ]
}I
    


// python
with open("WZ_JSON", "w") as json_file:
    json.dump(WZ_JSON, json_file)

WZ_json = json.dumps(WZ_JSONI, indent=4) // sort_keys=True

with open("WZ_JSON.json", "r")as WZ_json:
    WZ_python = json.load(WZ_json)


        $(document).ready(function(){

    jsonTest();

    })  

    function jsonTest(){
        console.log(annotation_json.para);
        }
    });
  });
