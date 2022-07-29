    uploadCanvasToServer = function() {
      const canvas = document.getElementById('myCanvas');
      const imgBase64 = canvas.toDataURL('image/jpeg', 'image/octet-stream');
      const decodImg = atob(imgBase64.split(',')[1]);

      let array = [];
      for (let i = 0; i < decodImg .length; i++) {
       array.push(decodImg .charCodeAt(i));
      }

      const file = new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
      const fileName = 'canvas_img_' + new Date().getMilliseconds() + '.jpg';
      let formData = new FormData();
      formData.append('file', file, fileName);

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
///////////////////////////////////////////////////////////////////////////////////////
//	private void makePngFile(String imgbase64, File saveFilePath, String savename) throws Exception {
		/**
		 * imgbase64 (imgbase64data:image/png;base64,iVBORw0KGgoAA 로 시작)
		 * saveFilePath (저장경로)
		 * savename (파일이름)
		 */ 
//		try {
			// create a buffered image
//			BufferedImage image = null;

//			String[] base64Arr = imgbase64.split(","); // image/png;base64, 이 부분 버리기 위한 작업
//			byte[] imageByte = Base64.decodeBase64(base64Arr[1]); // base64 to byte array로 변경
//			logger.info("imgbase64"+imgbase64);
//			
//			ByteArrayInputStream bis = new ByteArrayInputStream(imageByte);
//			image = ImageIO.read(bis);
//			bis.close();
//
//			// write the image to a file
//			savename = savename;
//			File outputfile = new File(saveFilePath + savename + ".png");
//			logger.info("save -> " + saveFilePath + savename + ".png");
//			ImageIO.write(image, "png", outputfile); // 파일생성
//			
//		} catch (IOException e) {
//			throw e;
//		}
//	}
