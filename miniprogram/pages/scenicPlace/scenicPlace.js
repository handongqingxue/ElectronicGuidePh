// miniprogram/pages/scenicPlace/scenicPlace.js
//播放音频参考链接:https://www.jb51.net/article/96336.htm
var scenicPlace;
var serverPathCQ;
var serverPathSD;
var serverPath;
var sceDisCanvasImagePath;
var scenicPlaceImageCount;
var canvasScenicPlaceCount;
var scenicPlaceList;
var scenicPlaceLength;
var canvasBusStopCount;
var busStopList;
var busStopLength;
var busStopPicUrl;
var busStopPicWidth;
var busStopPicHeight;
var updateNavLineInterval;
var detailAudio;
var scenicPlaceImageCount;
var canvasScenicPlaceCount;
var detailAudioStateFlag="end";
var currentTime=0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navFlag:false,
    dzdyButState:true,
    showArrivedBgCVFlag:false
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

    options.id=3;
    options.name="岳家庄";
    options.x=950;
    options.y=578;
    options.picUrl="/ElectronicGuide/upload/ScenicPlacePic/1628583735118.png";
    options.picWidth=30;
    options.picHeight=30;
    options.arroundScope=30;
    options.navType="walk";

    scenicPlace=this;
    serverPathCQ=getApp().getServerPathCQ();
    serverPath=getApp().getServerPath();
    busStopPicUrl=getApp().getBusStopPicUrl();
    busStopPicWidth=getApp().getBusStopPicWidth();
    busStopPicHeight=getApp().getBusStopPicHeight();
    scenicPlace.setData({id:options.id,name:options.name,x:options.x,y:options.y,picUrl:options.picUrl,picWidth:options.picWidth,picHeight:options.picHeight,arroundScope:options.arroundScope,navType:options.navType});
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
    if(audioId=="detail_audio"){
      console.log("audio play");
      //detailAudioStateFlag="play";
    }
  },
  funPause: function(e){
    let audioId=e.currentTarget.id;
    if(audioId=="detail_audio"){
      console.log("audio pause");
      //detailAudioStateFlag="pause";
    }
  },
  funTimeupdate: function(e){
    let audioId=e.currentTarget.id;
    if(audioId=="detail_audio"){
      console.log(e.detail.currentTime);
      //console.log(e.detail.duration);
      currentTime=e.detail.currentTime;
    }
  },
  funEnded: function(e){
    let audioId=e.currentTarget.id;
    if(audioId=="detail_audio"){
      //scenicPlace.optionDetailAudioSrc("end");
      console.log("audio end");
    }
  },
  funError: function(e){
    let audioId=e.currentTarget.id;
    if(audioId=="detail_audio"){
      console.log(e.detail.errMsg);
    }
  },
  checkScenicPlaceList:function(){
    let scenicPlaceList=getApp().scenicPlaceList;
    if(scenicPlaceList==undefined)
      return false;
    else
      return true;
  },
  selectScenicPlaceList:function(){
    if(scenicPlace.checkScenicPlaceList()){
      console.log("景点列表已下载");
      scenicPlaceList=getApp().scenicPlaceList;
      scenicPlace.initScenicPlaceList(scenicPlaceList);
    }
    else{
      console.log("重新下载景点列表");
      wx.request({
        url:serverPathSD+"wechatApplet/selectScenicPlaceList",
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        success: function (res) {
          let data=res.data;
          scenicPlaceList=data.scenicPlaceList;
          getApp().scenicPlaceList=scenicPlaceList;
          getApp().scenicPlaceLength=scenicPlaceList.length;
          scenicPlace.initScenicPlaceList(scenicPlaceList);
        }
      })
    }
  },
  initScenicPlaceList:function(scenicPlaceList){
    scenicPlaceImageCount=0;
    canvasScenicPlaceCount=0;
    for(var i=0;i<scenicPlaceList.length;i++){
      scenicPlace.initScenicPlaceImageSrc(scenicPlaceList[i]);
      //console.log("detailIntroScope==="+scenicPlaceList[i].detailIntroScope);
    }
  },
  checkBusStopList:function(){
    let busStopList=getApp().busStopList;
    if(busStopList==undefined)
      return false;
    else
      return true;
  },
  selectBusStopList:function(){
    if(scenicPlace.checkBusStopList()){
      console.log("站点列表已下载");
      busStopList=getApp().busStopList;
      //scenicPlace.initSceDisCanvas(sceDisCanvasImagePath,false);
      scenicPlace.navToDestination();//一开始页面数据加载完就显示最近路线
    }
    else{
      console.log("重新下载站点列表");
      wx.request({
        url:serverPathSD+"wechatApplet/selectBusStopList",
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        success: function (res) {
          let data=res.data;
          busStopList=data.busStopList;
          getApp().busStopList=busStopList;
          getApp().busStopLength=busStopList.length;
          //scenicPlace.initSceDisCanvas(sceDisCanvasImagePath,false);
          scenicPlace.navToDestination();//一开始页面数据加载完就显示最近路线
        },
        fail:function(){
          
        }
      })
    }
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
  checkSceDisInfo:function(){
    let sceDis=getApp().sceDis;
    if(sceDis==undefined)
      return false;
    else
      return true;
  },
  selectSceDisById:function(){
    if(scenicPlace.checkSceDisInfo()){
      console.log("景区信息已下载");
      let sceDis=getApp().sceDis;
      scenicPlace.initSceDisInfo(sceDis);
    }
    else{
      console.log("重新下载景区信息");
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
            getApp().sceDis=sceDis;
            scenicPlace.initSceDisInfo(sceDis);
          }
        },
        fail:function(res){
          getApp().showToast(serverPathCQ);
          scenicPlace.setData({toastMsg:JSON.stringify(res)});
        }
      })
    }
  },
  initSceDisInfo:function(sceDis){
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
    //serverPathSD="https://"+sceDis.serverName+"/ElectronicGuideSD/";
    serverPathSD="http://"+sceDis.serverName+":8080/ElectronicGuideSD/";
    scenicPlace.jiSuanLocationScale(sceDis);
    scenicPlace.initSceDisCanvasImagePath(serverPath+sceDis.mapUrl);
    scenicPlace.selectRoadStageList();

    scenicPlace.setData({meX:1250,meY:580});
    //scenicPlace.setData({meX:1154,meY:580});
  },
  jiSuanLocationScale:function(sceDis){
    let locationWidthScale=(sceDis.longitudeEnd-sceDis.longitudeStart)/sceDis.mapWidth;
    let locationHeightScale=(sceDis.latitudeEnd-sceDis.latitudeStart)/sceDis.mapHeight;
    console.log(locationWidthScale+","+locationHeightScale);
    scenicPlace.setData({locationWidthScale:locationWidthScale,locationHeightScale:locationHeightScale});
  },
  checkSceDisCanvasImagePath:function(){
    let sceDisCanvasImagePath=getApp().sceDisCanvasImagePath;
    if(sceDisCanvasImagePath==undefined)
      return false;
    else
      return true;
  },
  initSceDisCanvasImagePath:function(src){
    if(scenicPlace.checkSceDisCanvasImagePath()){
      console.log("景区地图已下载");
      sceDisCanvasImagePath=getApp().sceDisCanvasImagePath;
      scenicPlace.selectScenicPlaceList();
    }
    else{
      console.log("重新下载景区地图");
      wx.getImageInfo({
        src: src,
        success: function (res){
          sceDisCanvasImagePath=res.path;
          getApp().sceDisCanvasImagePath=sceDisCanvasImagePath;
          scenicPlace.selectScenicPlaceList();
        },
        fail: function(res){
          scenicPlace.setData({toastMsg:JSON.stringify(res)});
        }
      })
    }
  },
  checkSceDisImage:function(){
    if(scenicPlace.data.sceDisCanvasImagePath===undefined){
      return false;
    }
    else{
      return true;
    }
  },
  checkScenicPlaceImageSrc:function(imageSrc){
    if(imageSrc==undefined)
      return false;
    else
      return true;
  },
  initScenicPlaceImageSrc:function(scenicPlaceItem){
    let scenicPlaceLength=getApp().scenicPlaceLength;
    if(scenicPlace.checkScenicPlaceImageSrc(scenicPlaceItem.imageSrc)){
      scenicPlaceImageCount++;
      if(scenicPlaceImageCount==scenicPlaceLength){
        //scenicPlace.initSceDisCanvas(sceDisCanvasImagePath,false);
        scenicPlace.selectBusStopList();
      }
    }
    else{
      wx.getImageInfo({
        src: serverPath+scenicPlaceItem.picUrl,
        success: function (res){
          //console.log("res.path="+res.path);
          scenicPlaceItem.imageSrc=res.path;
          scenicPlaceImageCount++;
          if(scenicPlaceImageCount==scenicPlaceLength){
            //scenicPlace.initSceDisCanvas(sceDisCanvasImagePath,false);
            scenicPlace.selectBusStopList();
          }
        },
        fail: function(res){

        }
      })
    }
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
      console.log("sceDisCanvas="+sceDisCanvas)
      scenicPlace.setData({sceDisCanvas:sceDisCanvas});
    }
    sceDisCanvas.drawImage(path, sceDisCanvasImageX, sceDisCanvasImageY, sceDisCanvasStyleWidth, sceDisCanvasStyleHeight);

    canvasScenicPlaceCount=0;
    for(var i=0;i<scenicPlaceList.length;i++){
      let scenicPlaceItem=scenicPlaceList[i];
      scenicPlace.drawScenicPlace(scenicPlaceItem.name,scenicPlaceItem.imageSrc,scenicPlaceItem.x,scenicPlaceItem.y,scenicPlaceItem.picWidth,scenicPlaceItem.picHeight);
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
    let scenicPlaceLength=getApp().scenicPlaceLength;
    if(canvasScenicPlaceCount==scenicPlaceLength){
      //scenicPlace.drawMeLocation();
      canvasBusStopCount=0;
      for(var i=0;i<busStopList.length;i++){
        let busStopItem=busStopList[i];
        scenicPlace.drawBusStop(busStopItem.name,busStopItem.x,busStopItem.y);
      }
    }
  },
  drawBusStop:function(name,x,y){
    canvasBusStopCount++;
    console.log("canvasBusStopCount==="+canvasBusStopCount)
    let sceDisCanvas=scenicPlace.data.sceDisCanvas;
    let sceDisCanvasStyleWidth=scenicPlace.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicPlace.data.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=scenicPlace.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicPlace.data.sceDisCanvasMinHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    //h5页面随着地图放大，坐标自动跟着改变。小程序端不一样，必须根据比例重新计算出坐标位置
    //h5页面绘制图片是以图片中心点为原点，小程序是以图片左下角为原点。若要做到和h5页面一样，需要用坐标减去图片宽度或高度的一半
    sceDisCanvas.drawImage(busStopPicUrl, x*widthScale-busStopPicWidth/2, sceDisCanvasStyleHeight-y*heightScale-busStopPicHeight/2, busStopPicWidth, busStopPicHeight);

    sceDisCanvas.font = 'normal bold 10px sans-serif';
    sceDisCanvas.setTextAlign('center'); // 文字居中
    sceDisCanvas.setFillStyle("#222");
    //小程序绘制文字默认以文字中心为原点，而h5页面是以文字左下角为原点。这里不用重新计算
    sceDisCanvas.fillText(name, x*widthScale,sceDisCanvasStyleHeight-y*heightScale+busStopPicHeight)

    //当地图上所有景点图片都加载完后再绘制，以防出现未加载完的图片不显示现象
    let busStopLength=getApp().busStopLength;
    if(canvasBusStopCount==busStopLength){
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
    scenicPlace.initSceDisCanvas(sceDisCanvasImagePath,true);
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
  getTouchPoint:function(e){
    let pageX=e.touches[0].pageX;
    let pageY=e.touches[0].pageY;
    let scrollLeft=scenicPlace.data.sceDisCanvasScrollLeft;
    let scrollTop=scenicPlace.data.sceDisCanvasScrollTop;
    let sceDisCanvasMinWidth=scenicPlace.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicPlace.data.sceDisCanvasMinHeight;
    let sceDisCanvasStyleWidth=scenicPlace.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicPlace.data.sceDisCanvasStyleHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    let x=(scrollLeft+pageX)/widthScale;
    let y=(sceDisCanvasStyleHeight-scrollTop-pageY)/heightScale;
    //console.log(x+","+y);
    scenicPlace.setData({meX:x,meY:y});
  },
  navToDestination:function(){
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
        scenicPlace.initSceDisCanvas(sceDisCanvasImagePath,false);
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
      console.log("x1="+roadStageNavList[i].backX+",y1="+roadStageNavList[i].backY+",x2="+roadStageNavList[i].frontX+",y2="+roadStageNavList[i].frontY)
      scenicPlace.setRoadStageLocation(sceDisCanvas,roadStageNavList[i].backX,roadStageNavList[i].backY,roadStageNavList[i].frontX,roadStageNavList[i].frontY);
    }
    //scenicPlace.setRoadStageLocation(sceDisCanvas,1097.00,572.00,1181.00,533);
    sceDisCanvas.stroke() //画出当前路径的边框
    sceDisCanvas.draw();

    if(!updateFlag){
      clearInterval(updateNavLineInterval);
      updateNavLineInterval=setInterval(() => {
        if(scenicPlace.checkLocaltionChanged()){
          //scenicPlace.drawNavRoadLine(true);
          if(scenicPlace.checkSceDisImage()){
            scenicPlace.changeMeLocation();
            scenicPlace.initMinDistanceStage();
            let nearX=scenicPlace.data.nearX;
            let nearY=scenicPlace.data.nearY;
            let nearRoadStage=scenicPlace.data.nearRoadStage;
            //console.log("nearRoadStage="+nearRoadStage.frontX);
            if(nearX==nearRoadStage.frontX&nearY==nearRoadStage.frontY){
              scenicPlace.initMeToSPRoadStageNavList();
              scenicPlace.initSceDisCanvas(sceDisCanvasImagePath,true);
            }
            else{
              scenicPlace.navToDestination();
            }

            scenicPlace.checkIfInArroundScope();
            if(scenicPlace.checkIfOverDetailScope())
              scenicPlace.checkNearScenicPlace();
          }
        }
      }, "5000");
    }
  },
  checkLocaltionChanged:function(){
    let preMeX=scenicPlace.data.preMeX;
    let preMeY=scenicPlace.data.preMeY;
    let meX=scenicPlace.data.meX;
    let meY=scenicPlace.data.meY;
    //console.log("preMeX="+preMeX+",preMeY="+preMeY+",meX="+meX+",meY="+meY)
    if(preMeX==meX&preMeY==meY){
      return false;
    }
    else{
      return true;
    }
  },
  checkNearScenicPlace:function(){
    let meX=scenicPlace.data.meX;
    let meY=scenicPlace.data.meY;
    let scenicPlaceList=scenicPlace.data.scenicPlaceList;
    if(detailAudioStateFlag=="pause"||detailAudioStateFlag=="end"){
      for(var i=0;i<scenicPlaceList.length;i++){
        var scenicPlaceItem=scenicPlaceList[i];
        let chaX=Math.abs(meX-scenicPlaceItem.x);
        let chaY=Math.abs(meY-scenicPlaceItem.y);
        let distance=Math.sqrt(chaX*chaX+chaY*chaY);
        if(distance<=scenicPlaceItem.detailIntroScope){
          console.log("detailIntroScope==="+scenicPlaceItem.detailIntroScope)
          scenicPlace.setData({nearScenicPlace:scenicPlaceItem});
          scenicPlace.optionDetailAudioSrc("play");
          break;
        }
      }
    }
  },
  checkIfOverDetailScope:function(){
    let meX=scenicPlace.data.meX;
    let meY=scenicPlace.data.meY;
    let nearScenicPlace=scenicPlace.data.nearScenicPlace;
    if(nearScenicPlace==undefined||nearScenicPlace==null){
      return true;
    }
    let chaX=Math.abs(meX-nearScenicPlace.x);
    let chaY=Math.abs(meY-nearScenicPlace.y);
    let distance=Math.sqrt(chaX*chaX+chaY*chaY);
    if(distance>nearScenicPlace.detailIntroScope){
      scenicPlace.optionDetailAudioSrc("pause");
      return true;
    }
    else
      return false;
  },
  optionDetailAudioSrc:function(stateFlag){
    if(stateFlag=="play"){
      console.log("播放......")
      let nearScenicPlace=scenicPlace.data.nearScenicPlace;
      scenicPlace.setData({detailAudioSrc:"https://"+scenicPlace.data.sceDis.serverName+nearScenicPlace.detailIntroVoiceUrl});
      //scenicPlace.setData({detailAudioSrc:"https://"+scenicPlace.data.sceDis.serverName+"/ElectronicGuide/upload/ScenicPlaceVoice/202108190001.mp3"});
      scenicPlace.detailAudio.play();
    }
    else if(stateFlag=="pause"){
      console.log("暂停......")
      scenicPlace.detailAudio.pause();
    }
    else if(stateFlag=="continue"){
      console.log("继续......")
      scenicPlace.detailAudio.play();
      scenicPlace.detailAudio.seek(currentTime);
    }
    else if(stateFlag=="end"){
      console.log("结束......")
      scenicPlace.setData({detailAudioSrc:null});
      scenicPlace.detailAudio.seek(0);
    }
    detailAudioStateFlag=stateFlag;
  },
  changeMeLocation:function(){
    let meX=scenicPlace.data.meX;
    let meY=scenicPlace.data.meY;
    /*
    meX-=3;
    meY-=3;
    if(meX<=1166)
      meX+=3;
    if(meY<=496)
      meY+=3;
      */
    console.log("changeMeLocation:preMeX="+meX+",preMeY="+meY);
    scenicPlace.setData({preMeX:meX,preMeY:meY});
    //scenicPlace.setData({meX:meX,meY:meY});
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
  openDZDYBut:function(){
    let dzdyButState=scenicPlace.data.dzdyButState;
    if(dzdyButState){
      scenicPlace.setData({dzdyButState:false});
      scenicPlace.optionDetailAudioSrc("pause");
    }
    else{
      scenicPlace.setData({dzdyButState:true});
      scenicPlace.optionDetailAudioSrc("continue");
    }
  },
  checkIfInArroundScope:function(){
    let meX=scenicPlace.data.meX;
    let meY=scenicPlace.data.meY;
    let x=scenicPlace.data.x;
    let y=scenicPlace.data.y;
    let chaX=Math.abs(meX-x);
    let chaY=Math.abs(meY-y);
    let distance=Math.sqrt(chaX*chaX+chaY*chaY);
    if(distance<=scenicPlace.data.arroundScope){
      console.log("已到景点范围内...");
      clearInterval(updateNavLineInterval);
      scenicPlace.setData({arrivedFlag:true});
    }
    else{
      scenicPlace.setData({arrivedFlag:false});
    }
    scenicPlace.jiSuanWorkInfo();
  },
  jiSuanWorkInfo:function(){
    let arrivedFlag=scenicPlace.data.arrivedFlag;
    if(arrivedFlag){
      let workDistance=scenicPlace.data.workDistance;
      console.log("workDistance==="+workDistance);
      scenicPlace.setData({workDistance:Math.floor(workDistance)});

      let chaWorkTime=new Date().getTime()-scenicPlace.data.workTime;
      console.log("chaWorkTime="+chaWorkTime)
      let workTime=0;
      if(chaWorkTime>=1000*60*60)
        workTime=chaWorkTime/(1000*60*60)+"(h)";
      else if(chaWorkTime>=1000*60)
        workTime=chaWorkTime/(1000*60)+"(m)";
      else if(chaWorkTime>=1000)
        workTime=chaWorkTime/1000+"(s)";
      scenicPlace.setData({workTime:workTime});

      scenicPlace.showArrivedBgCV(true);
    }
    else{
      let preMeX=scenicPlace.data.preMeX;
      let preMeY=scenicPlace.data.preMeY;
      //console.log("preMeX==="+preMeX)
      let meX=scenicPlace.data.meX;
      let meY=scenicPlace.data.meY;
      if(preMeX==undefined||preMeY==undefined){
        scenicPlace.setData({preMeX:meX,preMeY:meY});
      }
      else{
        let chaX=Math.abs(meX-preMeX);
        let chaY=Math.abs(meY-preMeY);
        let distance=Math.sqrt(chaX*chaX+chaY*chaY);
        let workDistance=scenicPlace.data.workDistance;
        if(workDistance==undefined)
          workDistance=0;
        workDistance+=distance;
        scenicPlace.setData({workDistance:workDistance});
      }

      let workTime=scenicPlace.data.workTime;
      if(workTime==undefined)
        scenicPlace.setData({workTime:new Date().getTime()});
    }
  },
  showArrivedBgCV:function(showFlag){
    scenicPlace.setData({showArrivedBgCVFlag:showFlag});
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