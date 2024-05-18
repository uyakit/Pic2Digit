	//==================================================================
	var rgb_r;        
	var rgb_g;
	var rgb_b;
	var rgb_a;
		
	var  TimeGoal_1, TimeGoal_2, TimeGoal_3,
		 TempGoal_1, TempGoal_2, TempGoal_3, 
		 Time_min, Time_max, Time_step, 
		 Temp_min, Temp_max, Temp_step;
		 
	function onOpenCvReady(form_id, plot_id, width, height)
	{
		document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
		
		var  forms = document.getElementById(form_id);
		Time_min  = parseFloat(forms.Time_min.value);
		Time_max  = parseFloat(forms.Time_max.value);
		Time_step = parseFloat(forms.Time_step.value);
		Temp_min  = parseFloat(forms.Temp_min.value);
		Temp_max  = parseFloat(forms.Temp_max.value);
		Temp_step = parseFloat(forms.Temp_step.value);
		//============================================================
		var elemImg = document.getElementById('idImg');
		var elemCanvas = document.getElementById('idCanvas');
		var ctx = elemCanvas.getContext('2d');
		//--------------------------------------
		var elemInput = document.getElementById('idInput');
		elemInput.addEventListener('change', (e) => {
			elemImg.src = URL.createObjectURL(e.target.files[0]);
		}, false);
		//--------------------------------------
		elemImg.onload = function () {
			elemCanvas.width = elemImg.width;
			elemCanvas.height = elemImg.height;
			ctx.drawImage(elemImg,0,0);
			//elemImg.style.display="none";
			elemInput.style.display="none";
		}
		//--------------------------------------
		elemCanvas.onclick = function(evt){
			
			//  マウス座標の取得
			var x = parseInt(evt.offsetX);
			var y = parseInt(evt.offsetY);
			
			//  指定座標のImageDataオブジェクトの取得 
			var imagedata = ctx.getImageData(x, y, 1, 1);
			
			//  RGBAの取得
			rgb_r = imagedata.data[0];        
			rgb_g = imagedata.data[1];
			rgb_b = imagedata.data[2];
			rgb_a = imagedata.data[3];
			
			document.getElementById("idMsgColor").innerHTML = 'rgba(' + rgb_r + ',' + rgb_g + ',' + rgb_b + ',' + rgb_a + ')';
			document.getElementById("idMsgColor").style.color = 'rgb(' + rgb_r + ',' + rgb_g + ',' + rgb_b + ')';
		}
		//============================================================
	};
	//==================================================================
	var arr = [];
	
	function HoughLineTransform(form_id, plot_id, width, height) 
	{
		//--------------------------------------
		//指定色抽出
		var elemImg = document.getElementById('idImg');
		var src = cv.imread(elemImg);
		var dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
		var lines = new cv.Mat();
		var color = new cv.Scalar(0, 255, 0);
		
		//Threshold the HSV image to get only blue colors
		var low = new cv.Mat(src.rows, src.cols, src.type(), [(rgb_r-10),(rgb_g-10),(rgb_b-10),0]);
		var high = new cv.Mat(src.rows, src.cols, src.type(), [(rgb_r+10),(rgb_g+10),(rgb_b+10),255]);
		cv.inRange(src, low, high, src);
		//--------------------------------------
		// 確率的ハフ変換を利用して，2値画像から線分を検出
		cv.HoughLinesP(src, lines, 1, Math.PI / 180, 0, 0, 0);
		
		// image – 8ビット，シングルチャンネルの2値入力画像．この画像は関数により書き換えられる可能性あり。
		// lines – 検出された線分が出力されるベクトル．各線分は，4要素のベクトル  (x_1, y_1, x_2, y_2) で表現。
		//          ここで  (x_1,y_1) および  (x_2, y_2) は，検出された各線分の端点。
		// rho – ピクセル単位で表される投票空間の距離分解能。
		// theta – ラジアン単位で表される投票空間の角度分解能。
		// threshold – 投票の閾値パラメータ．十分な票（  >\texttt{threshold} ）を得た直線のみが出力される。
		// minLineLength – 最小の線分長．これより短い線分は棄却される。
		// maxLineGap – 2点が同一線分上にあると見なす場合に許容される最大距離。
		//--------------------------------------
		//緑線描画
		var  forms = document.getElementById(form_id);
		Time_min  = parseFloat(forms.Time_min.value);
		Time_max  = parseFloat(forms.Time_max.value);
		Time_step = parseFloat(forms.Time_step.value);
		Temp_min  = parseFloat(forms.Temp_min.value);
		Temp_max  = parseFloat(forms.Temp_max.value);
		Temp_step = parseFloat(forms.Temp_step.value);
		
		for (var i = 0; i < lines.rows; ++i) {
			var startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
			var endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
			cv.line(dst, startPoint, endPoint, color);
			
			var x1 = lines.data32S[i * 4 + 0]/elemImg.width * Time_max + Time_min;
			var y1 = (elemImg.height - lines.data32S[i * 4 + 1])/elemImg.height * Temp_max + Temp_min ;
			var x2 = lines.data32S[i * 4 + 2]/elemImg.width * Time_max + Time_min;
			var y2 = (elemImg.height - lines.data32S[i * 4 + 3])/elemImg.height * Temp_max + Temp_min ;
			arr.push( {x:x1, y:y1} ) ;
			arr.push( {x:x2, y:y2} ) ;
		}
		cv.imshow('canvasOutput', dst);
		src.delete(); dst.delete(); lines.delete();
		//--------------------------------------
		arr.sort(function(a,b){
			if(a.x < b.x) return -1;
			if(a.x > b.x) return 1;
			return 0;
		});
		
		gopen(plot_id, 
			  Time_min, Time_max, Time_step,  Temp_min, Temp_max, Temp_step, 
			  width, height,  25, 25, 40, 50);
		gclose();
		
		for (var i = 0; i < arr.length; ++i) {
			gplot(arr[i].x,arr[i].y);
		}
		
		 (new CSV(arr)).save('HoughLineTransform.csv');
		//--------------------------------------
	};
	//==================================================================
	function UpdateGraph(form_id, plot_id, width, height) 
	{
		var  forms = document.getElementById(form_id);
		Time_min  = parseFloat(forms.Time_min.value);
		Time_max  = parseFloat(forms.Time_max.value);
		Time_step = parseFloat(forms.Time_step.value);
		Temp_min  = parseFloat(forms.Temp_min.value);
		Temp_max  = parseFloat(forms.Temp_max.value);
		Temp_step = parseFloat(forms.Temp_step.value);
		
		gopen(plot_id, 
			  Time_min, Time_max, Time_step,  Temp_min, Temp_max, Temp_step, 
			  width, height,  25, 25, 40, 50);
		gclose();
		
		for (var i = 0; i < arr.length; ++i) {
			gplot(arr[i].x,arr[i].y);
			//alert(arr[i].x);
		}
		
		 //(new CSV(arr)).save('HoughLineTransform.csv');
	};
	//==================================================================
	class CSV {
	  constructor(data, keys = false) {
		this.ARRAY  = Symbol('ARRAY')
		this.OBJECT = Symbol('OBJECT')

		this.data = data

		if (CSV.isArray(data)) {
		  if (0 == data.length) {
			this.dataType = this.ARRAY
		  } else if (CSV.isObject(data[0])) {
			this.dataType = this.OBJECT
		  } else if (CSV.isArray(data[0])) {
			this.dataType = this.ARRAY
		  } else {
			throw Error('Error: 未対応のデータ型です')
		  }
		} else {
		  throw Error('Error: 未対応のデータ型です')
		}

		this.keys = keys
	  }

	  toString() {
		if (this.dataType === this.ARRAY) {
		  return this.data.map((record) => (
			record.map((field) => (
			  CSV.prepare(field)
			)).join(',')
		  )).join('\n')
		} else if (this.dataType === this.OBJECT) {
		  const keys = this.keys || Array.from(this.extractKeys(this.data))

		  const arrayData = this.data.map((record) => (
			keys.map((key) => record[key])
		  ))

		  console.log([].concat([keys], arrayData))

		  return [].concat([keys], arrayData).map((record) => (
			record.map((field) => (
			  CSV.prepare(field)
			)).join(',')
		  )).join('\n')
		}
	  }

	  save(filename = 'data.csv') {
		if (!filename.match(/\.csv$/i)) { filename = filename + '.csv' }

		console.info('filename:', filename)
		console.table(this.data)

		const csvStr = this.toString()

		const bom     = new Uint8Array([0xEF, 0xBB, 0xBF]);
		const blob    = new Blob([bom, csvStr], {'type': 'text/csv'});
		const url     = window.URL || window.webkitURL;
		const blobURL = url.createObjectURL(blob);

		var a      = document.createElement('a');
		a.download = decodeURI(filename);
		a.href     = blobURL;
		a.type     = 'text/csv';

		a.click();
	  }

	  extractKeys(data) {
		return new Set([].concat(...this.data.map((record) => Object.keys(record))))
	  }

	  static prepare(field) {
		return '"' + (''+field).replace(/"/g, '""') + '"'
	  }

	  static isObject(obj) {
		return '[object Object]' === Object.prototype.toString.call(obj)
	  }

	  static isArray(obj) {
		return '[object Array]' === Object.prototype.toString.call(obj)
	  }
	}
