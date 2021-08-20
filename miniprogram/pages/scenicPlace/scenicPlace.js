// miniprogram/pages/scenicPlace/scenicPlace.js
//播放音频参考链接:https://www.jb51.net/article/96336.htm
var scenicPlace;
var serverPathCQ;
var serverPathSD;
var serverPath;
var updateNavLineInterval;
var detailAudio;
var scenicPlaceImageCount;
var canvasScenicPlaceCount;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navFlag:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getLocation({
      type: 'wgs84',
      success:function(res){        
        //console.log(res.longitude+","+res.latitude)
        scenicPlace.setData({longitude:res.longitude,latitude:res.latitude});
      }
    })

    /*
    options.id=3;
    options.name="岳家庄";
    options.x=300;
    options.y=300;
    options.picUrl="/ElectronicGuide/upload/ScenicPlacePic/1628583735118.png";
    options.picWidth=30;
    options.picHeight=30;
    */

    scenicPlace=this;
    serverPathCQ=getApp().getServerPathCQ();
    serverPath=getApp().getServerPath();
    scenicPlace.setData({id:options.id,name:options.name,x:options.x,y:options.y,picUrl:options.picUrl,picWidth:options.picWidth,picHeight:options.picHeight});
    scenicPlace.getWindowSize();
  },
  getWindowSize:function(){
    scenicPlace.setData({
      windowWidth:wx.getSystemInfoSync().windowWidth,
      windowHeight:wx.getSystemInfoSync().windowHeight
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    scenicPlace.selectSceDisById();
    scenicPlace.detailAudio=wx.createAudioContext('detail_audio');
  },
  funPlay: function(e){
    let audioId=e.currentTarget.id;
    if(audioId=="detail_audio")
      console.log("audio play");
  },
  funPause: function(e){
    let audioId=e.currentTarget.id;
    if(audioId=="detail_audio")
      console.log("audio pause");
  },
  funTimeupdate: function(e){
    let audioId=e.currentTarget.id;
    if(audioId=="detail_audio"){
      console.log(e.detail.currentTime);
      console.log(e.detail.duration);
    }
  },
  funEnded: function(e){
    let audioId=e.currentTarget.id;
    if(audioId=="detail_audio"){
      console.log("audio end");
    }
  },
  funError: function(e){
    let audioId=e.currentTarget.id;
    if(audioId=="detail_audio"){
      console.log(e.detail.errMsg);
    }
  },
  selectScenicPlaceList:function(){
    wx.request({
      url:serverPathSD+"wechatApplet/selectScenicPlaceList",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function (res) {
        let data=res.data;
        let scenicPlaceList=data.scenicPlaceList;
        scenicPlace.setData({scenicPlaceLength:scenicPlaceList.length});
        scenicPlaceImageCount=0;
        canvasScenicPlaceCount=0;
        for(var i=0;i<scenicPlaceList.length;i++){
          scenicPlace.getScenicPlaceImageInfo(scenicPlaceList[i]);
          //console.log("detailIntroScope==="+scenicPlaceList[i].detailIntroScope);
        }
        scenicPlace.setData({scenicPlaceList:scenicPlaceList});
      }
    })
  },
  selectRoadStageList:function(){
    wx.request({
      url:serverPathSD+"wechatApplet/selectRoadStageList",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function (res) {
        let data=res.data;
        if(data.status=="ok"){
          scenicPlace.setData({roadStageList:data.roadStageList});
          scenicPlace.initMinDistanceStage();
        }
      },
      fail:function(res){

      }
    });
  },
  selectSceDisById:function(){
    let sceDisId=wx.getStorageSync('sceDisId');
    wx.request({
      url: serverPathCQ+"selectSceDisById",
      method: 'POST',
      data: { id: sceDisId},
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function (res) {
        let data=res.data;
        console.log(data);
        var status = res.data.status;
        if (status == "ok") {
          let sceDis=data.sceDis;
          let sceDisCanvasMinWidth=sceDis.mapWidth;
          let sceDisCanvasMinHeight=sceDis.mapHeight;
          let sceDisCanvasMaxWidth=sceDis.picWidth;
          let sceDisCanvasMaxHeight=sceDis.picHeight;
          scenicPlace.setData({
            sceDis:sceDis,
            sceDisCanvasMinWidth:sceDisCanvasMinWidth,
            sceDisCanvasMinHeight:sceDisCanvasMinHeight,
            sceDisCanvasStyleWidth:sceDisCanvasMinWidth,
            sceDisCanvasStyleHeight:sceDisCanvasMinHeight,
            sceDisCanvasMaxWidth:sceDisCanvasMaxWidth,
            sceDisCanvasMaxHeight:sceDisCanvasMaxHeight
          });
          serverPathSD="https://"+scenicPlace.data.sceDis.serverName+"/ElectronicGuideSD/";
          scenicPlace.jiSuanLocationScale(data.sceDis);
          scenicPlace.getSceDisImageInfo(serverPath+data.sceDis.mapUrl);
          scenicPlace.selectRoadStageList();

          scenicPlace.setData({meX:1250,meY:580});
          //scenicPlace.setData({meX:1154,meY:580});
        }
      },
      fail:function(res){
        getApp().showToast(serverPathCQ);
        scenicPlace.setData({toastMsg:JSON.stringify(res)});
      }
    })
  },
  jiSuanLocationScale:function(sceDis){
    let locationWidthScale=(sceDis.longitudeEnd-sceDis.longitudeStart)/sceDis.mapWidth;
    let locationHeightScale=(sceDis.latitudeEnd-sceDis.latitudeStart)/sceDis.mapHeight;
    console.log(locationWidthScale+","+locationHeightScale);
    scenicPlace.setData({locationWidthScale:locationWidthScale,locationHeightScale:locationHeightScale});
  },
  getSceDisImageInfo:function(src){
    wx.getImageInfo({
      src: src,
      success: function (res){
        scenicPlace.setData({sceDisCanvasImagePath:res.path})
        scenicPlace.selectScenicPlaceList();
      },
      fail: function(res){
        scenicPlace.setData({toastMsg:JSON.stringify(res)});
      }
    })
  },
  checkSceDisImage:function(){
    if(scenicPlace.data.sceDisCanvasImagePath===undefined){
      return false;
    }
    else{
      return true;
    }
  },
  getScenicPlaceImageInfo:function(scenicPlaceItem){
    wx.getImageInfo({
      src: "https://www.qrcodesy.com"+scenicPlaceItem.picUrl,
      success: function (res){
        //console.log("res.path="+res.path);
        scenicPlaceItem.imageSrc=res.path;
        scenicPlaceImageCount++;
        let scenicPlaceLength=scenicPlace.data.scenicPlaceLength;
        if(scenicPlaceImageCount==scenicPlaceLength)
          scenicPlace.initSceDisCanvas(scenicPlace.data.sceDisCanvasImagePath,false);
      },
      fail: function(res){

      }
    })
  },
  initSceDisCanvas:function(path,reSizeFlag){
    let scenicPlaceData=scenicPlace.data;
    let sceDisCanvasImageX=scenicPlaceData.sceDisCanvasImageX;
    let sceDisCanvasImageY=scenicPlaceData.sceDisCanvasImageY;

    //scenicDistrict.setData({sceDisCanvasStyleWidth:1000,sceDisCanvasStyleHeight:1000})
    let sceDisCanvasStyleWidth=scenicPlaceData.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicPlaceData.sceDisCanvasStyleHeight;
    //console.log("sceDisCanvasImageX="+sceDisCanvasImageX+",sceDisCanvasImageY="+sceDisCanvasImageY+",sceDisCanvasStyleWidth="+sceDisCanvasStyleWidth+",sceDisCanvasStyleHeight="+sceDisCanvasStyleHeight)
    let sceDisCanvas=null;
    if(reSizeFlag){
      //scenicPlace.clearSceDisCanvas();
      sceDisCanvas=scenicPlace.data.sceDisCanvas;
    }
    else{
      sceDisCanvas = wx.createCanvasContext('sceDisCanvas')
      scenicPlace.setData({sceDisCanvas:sceDisCanvas});
    }
    sceDisCanvas.drawImage(path, sceDisCanvasImageX, sceDisCanvasImageY, sceDisCanvasStyleWidth, sceDisCanvasStyleHeight);

    canvasScenicPlaceCount=0;
    let scenicPlaceList=scenicPlace.data.scenicPlaceList;
    for(var i=0;i<scenicPlaceList.length;i++){
      let scenicPlaceItem=scenicPlaceList[i];
      scenicPlace.drawScenicPlace(scenicPlaceItem.name,scenicPlaceItem.imageSrc,scenicPlaceItem.x,scenicPlaceItem.y,scenicPlaceItem.picWidth,scenicPlaceItem.picHeight);
      //console.log("detailIntroScope==="+scenicPlaceList[i].detailIntroScope);
    }
  },
  drawScenicPlace:function(name,picUrl,x,y,picWidth,picHeight){
    canvasScenicPlaceCount++;
    let sceDisCanvas=scenicPlace.data.sceDisCanvas;
    let sceDisCanvasStyleWidth=scenicPlace.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicPlace.data.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=scenicPlace.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicPlace.data.sceDisCanvasMinHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    //h5页面随着地图放大，坐标自动跟着改变。小程序端不一样，必须根据比例重新计算出坐标位置
    //h5页面绘制图片是以图片中心点为原点，小程序是以图片左下角为原点。若要做到和h5页面一样，需要用坐标减去图片宽度或高度的一半
    sceDisCanvas.drawImage(picUrl, x*widthScale-picWidth/2, sceDisCanvasStyleHeight-y*heightScale-picHeight/2, parseInt(picWidth), parseInt(picHeight));

    sceDisCanvas.font = 'normal bold 10px sans-serif';
    sceDisCanvas.setTextAlign('center'); // 文字居中
    sceDisCanvas.setFillStyle("#222");
    //小程序绘制文字默认以文字中心为原点，而h5页面是以文字左下角为原点。这里不用重新计算
    sceDisCanvas.fillText(name, x*widthScale,sceDisCanvasStyleHeight-y*heightScale+picHeight)

    //当地图上所有景点图片都加载完后再绘制，以防出现未加载完的图片不显示现象
    let scenicPlaceLength=scenicPlace.data.scenicPlaceLength;
    if(canvasScenicPlaceCount==scenicPlaceLength){
      scenicPlace.drawMeLocation();
    }
  },
  drawMeLocation:function(){
    let picWidth=34;
    let picHeight=42;
    let sceDisCanvasStyleWidth=scenicPlace.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicPlace.data.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=scenicPlace.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicPlace.data.sceDisCanvasMinHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    //let x=(scenicPlace.data.longitude-scenicPlace.data.sceDis.longitudeStart)/scenicPlace.data.locationWidthScale;
    //let y=(scenicPlace.data.latitude-scenicPlace.data.sceDis.latitudeStart)/scenicPlace.data.locationHeightScale;
    let x=scenicPlace.data.meX;
    let y=scenicPlace.data.meY;
    console.log(x+","+y);
    //scenicPlace.setData({meX:x,meY:y});
    let sceDisCanvas=scenicPlace.data.sceDisCanvas;
    sceDisCanvas.drawImage("/images/meLocation.jpg", x*widthScale-picWidth/2, sceDisCanvasStyleHeight-y*heightScale-picHeight/2, picWidth, picHeight);
    
    if(scenicPlace.data.navFlag){
      scenicPlace.drawNavRoadLine(false);
    }
    else
      scenicPlace.drawSceDisCanvas();
  },
  drawSceDisCanvas:function(){
    let sceDisCanvas=scenicPlace.data.sceDisCanvas;
    sceDisCanvas.draw();
  },
  changeCanvasSize:function(e){
    let bigflag=e.currentTarget.dataset.bigflag;
    let resetflag=e.currentTarget.dataset.resetflag;
    let scenicPlaceData=scenicPlace.data;
    let sceDisCanvasStyleWidth=scenicPlaceData.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicPlaceData.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=scenicPlaceData.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicPlaceData.sceDisCanvasMinHeight;
    let sceDisCanvasMaxWidth=scenicPlaceData.sceDisCanvasMaxWidth;
    let sceDisCanvasMaxHeight=scenicPlaceData.sceDisCanvasMaxHeight;
    //var mcw=sceDisCanvasStyleWidth;
	  //var mch=sceDisCanvasStyleHeight;
    if(resetflag){
      sceDisCanvasStyleWidth=sceDisCanvasMinWidth;
    }
    else{
      if(bigflag==1)
        sceDisCanvasStyleWidth+=sceDisCanvasMinWidth*0.2;
      else
        sceDisCanvasStyleWidth-=sceDisCanvasMinWidth*0.2;
    }
	
    if(sceDisCanvasStyleWidth<sceDisCanvasMinWidth){
      sceDisCanvasStyleWidth=sceDisCanvasMinWidth;
    }
    else if(sceDisCanvasStyleWidth>sceDisCanvasMaxWidth){
      sceDisCanvasStyleWidth=sceDisCanvasMaxWidth;
    }
  
    if(sceDisCanvasStyleHeight<sceDisCanvasMinHeight){
      sceDisCanvasStyleHeight=sceDisCanvasMinHeight;
    }
    else if(sceDisCanvasStyleHeight>sceDisCanvasMaxHeight){
      sceDisCanvasStyleHeight=sceDisCanvasMaxHeight;
    }
    sceDisCanvasStyleHeight=sceDisCanvasStyleWidth*sceDisCanvasMinHeight/sceDisCanvasMinWidth;

    scenicPlace.setData({
      sceDisCanvasStyleWidth:sceDisCanvasStyleWidth,
      sceDisCanvasStyleHeight:sceDisCanvasStyleHeight
    })
    scenicPlace.initSceDisCanvas(scenicPlace.data.sceDisCanvasImagePath,true);
  },
  clearSceDisCanvas:function(){
    let sceDis=scenicPlace.data.sceDis;
    let sceDisCanvas=scenicPlace.data.sceDisCanvas;
    sceDisCanvas.clearRect(0, 0, sceDis.mapWidth, sceDis.mapHeight);
    sceDisCanvas.draw(true);
  },
  scrollCanvas:function(e){
    scenicPlace.setData({sceDisCanvasScrollLeft:e.detail.scrollLeft,sceDisCanvasScrollTop:e.detail.scrollTop});
  },
  navToDestination:function(){
    scenicPlace.detailAudio.play();

    let meX=scenicPlace.data.meX;
    let meY=scenicPlace.data.meY;
    /*
    let meX=1250;
    let meY=580;
    console.log(meX+","+meY);
    scenicPlace.setData({meX:meX,meY:meY});
    */
    wx.request({
      url:serverPathSD+"wechatApplet/navToDestination",
      data:{meX:meX,meY:meY,scenicPlaceX:scenicPlace.data.x,scenicPlaceY:scenicPlace.data.y},
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function (res) {
        let data=res.data;
        console.log("roadStageList==="+data.roadStageList);
        if(data.roadStageList!=null){
          console.log("重新加载导航线...")
          scenicPlace.initRoadStageNavList(data.roadStageList);
        }
        scenicPlace.setData({navFlag:true});
        scenicPlace.initSceDisCanvas(scenicPlace.data.sceDisCanvasImagePath,true);
      }
    })
  },
  initMinDistanceStage:function(){
    let meX=scenicPlace.data.meX;
    let meY=scenicPlace.data.meY;
    //let meX=1250;
    //let meY=580;
    let minDistance=99999999;
    let nearX;
    let nearY;
    console.log("initMinDistanceStage:meX+"+meX+",meY="+meY);
    let roadStageList=scenicPlace.data.roadStageList;
    for(var i=0;i<roadStageList.length;i++){
      var roadStage=roadStageList[i];
      if(roadStage.frontThrough){
        let chaX=Math.abs(meX-roadStage.backX);
        let chaY=Math.abs(meY-roadStage.backY);
        let distance=Math.sqrt(chaX*chaX+chaY*chaY);
        if(distance<minDistance){
          minDistance=distance;
          nearX=roadStage.backX;
          nearY=roadStage.backY;
        }
      }
    }
    for(var i=0;i<roadStageList.length;i++){
      var roadStage=roadStageList[i];
      if(roadStage.backThrough){
        let chaX=Math.abs(meX-roadStage.frontX);
        let chaY=Math.abs(meY-roadStage.frontY);
        let distance=Math.sqrt(chaX*chaX+chaY*chaY);
        if(distance<minDistance){
          minDistance=distance;
          nearX=roadStage.frontX;
          nearY=roadStage.frontY;
        }
      }
    }
    //console.log("minDistance==="+minDistance+",nearX="+nearX+",nearY="+nearY);
    scenicPlace.setData({nearX:nearX,nearY:nearY});
  },
  initRoadStageNavList:function(roadStageList){
    scenicPlace.setData({nearRoadStage:roadStageList[0]});
    let roadStageNavList=[];
    for(var i=0;i<roadStageList.length;i++){
      roadStageNavList.push(roadStageList[i]);
    }
    scenicPlace.setData({roadStageNavList:roadStageNavList});
  },
  initMeToSPRoadStageNavList:function(){
    let roadStageNavList=[];
    let meX=scenicPlace.data.meX;
    let meY=scenicPlace.data.meY;
    let nearX=scenicPlace.data.nearX;
    let nearY=scenicPlace.data.nearY;
    roadStageNavList.push({backX:meX,backY:meY,frontX:nearX,frontY:nearY});
    let preRoadStageNavList=scenicPlace.data.roadStageNavList;
    console.log("----"+preRoadStageNavList.length);
    for(var i=1;i<preRoadStageNavList.length;i++){
      roadStageNavList.push(preRoadStageNavList[i]);
    }
    scenicPlace.setData({roadStageNavList:roadStageNavList});
  },
  drawNavRoadLine:function(updateFlag){
    let sceDisCanvas=scenicPlace.data.sceDisCanvas;
    sceDisCanvas.beginPath(); //创建一条路径   
    sceDisCanvas.setStrokeStyle('red');   //设置边框为红色
    /*
    let x1=scenicPlace.data.meX;
    let y1=scenicPlace.data.meY;
    let x2=568;
    let y2=65;
    */
    let roadStageNavList=scenicPlace.data.roadStageNavList;
    //scenicPlace.setRoadStageLocation(sceDisCanvas,962,385,568,65);
    //scenicPlace.setRoadStageLocation(sceDisCanvas,x1,y1,roadStageList[0].backX,roadStageList[0].backY);
    console.log("导航线条数="+roadStageNavList.length);
    for(let i=0;i<roadStageNavList.length;i++){
      //if(i==4)
        //break;
      //console.log("==="+JSON.stringify(roadStageList[i]))
      //console.log("x1="+roadStageList[i].backX+",y1="+roadStageList[i].backY+",x2="+roadStageList[i].frontX+",y2="+roadStageList[i].frontY)
      scenicPlace.setRoadStageLocation(sceDisCanvas,roadStageNavList[i].backX,roadStageNavList[i].backY,roadStageNavList[i].frontX,roadStageNavList[i].frontY);
    }
    //scenicPlace.setRoadStageLocation(sceDisCanvas,1097.00,572.00,1181.00,533);
    sceDisCanvas.stroke() //画出当前路径的边框
    sceDisCanvas.draw();

    if(!updateFlag){
      clearInterval(updateNavLineInterval);
      updateNavLineInterval=setInterval(() => {
        //scenicPlace.drawNavRoadLine(true);
        if(scenicPlace.checkSceDisImage()){
          scenicPlace.changeMeLocation();
          scenicPlace.initMinDistanceStage();
          let nearX=scenicPlace.data.nearX;
          let nearY=scenicPlace.data.nearY;
          let nearRoadStage=scenicPlace.data.nearRoadStage;
          //console.log("nearRoadStage="+nearRoadStage.frontX);
          if(nearX==nearRoadStage.frontX&nearY==nearRoadStage.frontY){
            console.log("111111111");
            scenicPlace.initMeToSPRoadStageNavList();
            scenicPlace.initSceDisCanvas(scenicPlace.data.sceDisCanvasImagePath,true);
          }
          else{
            console.log("2222222222");
            scenicPlace.navToDestination();
          }
        }
      }, "5000");
    }
  },
  changeMeLocation:function(){
    let meX=scenicPlace.data.meX;
    let meY=scenicPlace.data.meY;
    meX-=3;
    meY-=3;
    /*
    if(meX<=1166)
      meX+=3;
    if(meY<=496)
      meY+=3;
      */
    console.log("changeMeLocation:meX="+meX+",meY="+meY);
    scenicPlace.setData({meX:meX,meY:meY});
  },
  setRoadStageLocation:function(sceDisCanvas,x1,y1,x2,y2){
    let sceDisCanvasStyleWidth=scenicPlace.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicPlace.data.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=scenicPlace.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicPlace.data.sceDisCanvasMinHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    sceDisCanvas.moveTo(x1*widthScale,sceDisCanvasStyleHeight-y1*heightScale) //描述路径的起点为手指触摸的x轴和y轴
    sceDisCanvas.lineTo(x2*widthScale,sceDisCanvasStyleHeight-y2*heightScale) //绘制一条直线，终点坐标为手指触摸结束后的x轴和y轴
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})