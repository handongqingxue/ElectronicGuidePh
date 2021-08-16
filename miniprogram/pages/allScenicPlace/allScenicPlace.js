// pages/allScenicPlace/allScenicPlace.js
var allScenicPlace;
var serverPathCQ;
var serverPathSD;
var serverPath;
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
        allScenicPlace.setData({longitude:res.longitude,latitude:res.latitude});
      }
    })

    allScenicPlace=this;
    serverPathCQ=getApp().getServerPathCQ();
    serverPath=getApp().getServerPath();
    let sceDisId=options.sceDisId;
    //wx.setStorageSync('sceDisId', sceDisId);
    wx.setStorageSync('sceDisId', 1);
    allScenicPlace.getWindowSize();
  },
  getWindowSize:function(){
    allScenicPlace.setData({
      windowWidth:wx.getSystemInfoSync().windowWidth,
      windowHeight:wx.getSystemInfoSync().windowHeight
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    allScenicPlace.selectSceDisById();
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
          allScenicPlace.setData({
            sceDis:sceDis,
            sceDisCanvasMinWidth:sceDisCanvasMinWidth,
            sceDisCanvasMinHeight:sceDisCanvasMinHeight,
            sceDisCanvasStyleWidth:sceDisCanvasMinWidth,
            sceDisCanvasStyleHeight:sceDisCanvasMinHeight,
            sceDisCanvasMaxWidth:sceDisCanvasMaxWidth,
            sceDisCanvasMaxHeight:sceDisCanvasMaxHeight
          });
          serverPathSD="https://"+allScenicPlace.data.sceDis.serverName+"/ElectronicGuideSD/";
          allScenicPlace.jiSuanLocationScale(data.sceDis);
          allScenicPlace.getSceDisImageInfo(serverPath+data.sceDis.mapUrl);
        }
      },
      fail:function(res){
        getApp().showToast(serverPathCQ);
        allScenicPlace.setData({toastMsg:JSON.stringify(res)});
      }
    })
  },
  jiSuanLocationScale:function(sceDis){
    let locationWidthScale=(sceDis.longitudeEnd-sceDis.longitudeStart)/sceDis.mapWidth;
    let locationHeightScale=(sceDis.latitudeEnd-sceDis.latitudeStart)/sceDis.mapHeight;
    console.log(locationWidthScale+","+locationHeightScale);
    allScenicPlace.setData({locationWidthScale:locationWidthScale,locationHeightScale:locationHeightScale});
  },
  getSceDisImageInfo:function(src){
    wx.getImageInfo({
      src: src,
      success: function (res){
        allScenicPlace.setData({sceDisCanvasImagePath:res.path})
        allScenicPlace.initSceDisCanvas(res.path,false);
      },
      fail: function(res){
        allScenicPlace.setData({toastMsg:JSON.stringify(res)});
      }
    })
  },
  initSceDisCanvas:function(path,reSizeFlag){
    let allScenicPlaceData=allScenicPlace.data;
    let sceDisCanvasImageX=allScenicPlaceData.sceDisCanvasImageX;
    let sceDisCanvasImageY=allScenicPlaceData.sceDisCanvasImageY;

    //scenicDistrict.setData({sceDisCanvasStyleWidth:1000,sceDisCanvasStyleHeight:1000})
    let sceDisCanvasStyleWidth=allScenicPlaceData.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=allScenicPlaceData.sceDisCanvasStyleHeight;
    //console.log("sceDisCanvasImageX="+sceDisCanvasImageX+",sceDisCanvasImageY="+sceDisCanvasImageY+",sceDisCanvasStyleWidth="+sceDisCanvasStyleWidth+",sceDisCanvasStyleHeight="+sceDisCanvasStyleHeight)
    let sceDisCanvas=null;
    if(reSizeFlag){
      allScenicPlace.clearSceDisCanvas();
      sceDisCanvas=allScenicPlace.data.sceDisCanvas;
    }
    else{
      sceDisCanvas = wx.createCanvasContext('sceDisCanvas')
      allScenicPlace.setData({sceDisCanvas:sceDisCanvas});
    }
    sceDisCanvas.drawImage(path, sceDisCanvasImageX, sceDisCanvasImageY, sceDisCanvasStyleWidth, sceDisCanvasStyleHeight);

    allScenicPlace.selectScenicPlaceList()
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
        allScenicPlace.setData({scenicPlaceList:scenicPlaceList,scenicPlaceLength:scenicPlaceList.length});
        canvasScenicPlaceCount=0;
        for(let i=0;i<scenicPlaceList.length;i++){
          //if(i==0)
          allScenicPlace.getScenicPlaceImageInfo(scenicPlaceList[i]);
        }
      }
    })
  },
  getScenicPlaceImageInfo:function(scenicPlace){
    //console.log(scenicPlace.picUrl);
    wx.getImageInfo({
      //src: "https://localhost"+scenicPlace.picUrl,
      src: "https://www.qrcodesy.com"+scenicPlace.picUrl,
      success: function (res){
        allScenicPlace.drawScenicPlace(scenicPlace.name,res.path,scenicPlace.x,scenicPlace.y,scenicPlace.picWidth,scenicPlace.picHeight);
      },
      fail: function(res){
        allScenicPlace.setData({toastMsg:JSON.stringify(res)});
      }
    })
  },
  drawScenicPlace:function(name,picUrl,x,y,picWidth,picHeight){
    canvasScenicPlaceCount++;
    let sceDisCanvas=allScenicPlace.data.sceDisCanvas;
    let sceDisCanvasStyleWidth=allScenicPlace.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=allScenicPlace.data.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=allScenicPlace.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=allScenicPlace.data.sceDisCanvasMinHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    //h5页面随着地图放大，坐标自动跟着改变。小程序端不一样，必须根据比例重新计算出坐标位置
    //h5页面绘制图片是以图片中心点为原点，小程序是以图片左下角为原点。若要做到和h5页面一样，需要用坐标减去图片宽度或高度的一半
    sceDisCanvas.drawImage(picUrl, x*widthScale-picWidth/2, sceDisCanvasStyleHeight-y*heightScale-picHeight/2, picWidth, picHeight);

    sceDisCanvas.font = 'normal bold 10px sans-serif';
    sceDisCanvas.setTextAlign('center'); // 文字居中
    sceDisCanvas.setFillStyle("#222");
    //小程序绘制文字默认以文字中心为原点，而h5页面是以文字左下角为原点。这里不用重新计算
    sceDisCanvas.fillText(name, x*widthScale,sceDisCanvasStyleHeight-y*heightScale+picHeight)

    //当地图上所有景点图片都加载完后再绘制，以防出现未加载完的图片不显示现象
    let scenicPlaceLength=allScenicPlace.data.scenicPlaceLength;
    if(canvasScenicPlaceCount==scenicPlaceLength){
      allScenicPlace.drawMeLocation();
    }
  },
  drawMeLocation:function(){
    let picWidth=34;
    let picHeight=42;
    let sceDisCanvasStyleWidth=allScenicPlace.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=allScenicPlace.data.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=allScenicPlace.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=allScenicPlace.data.sceDisCanvasMinHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    let x=(allScenicPlace.data.longitude-allScenicPlace.data.sceDis.longitudeStart)/allScenicPlace.data.locationWidthScale;
    let y=(allScenicPlace.data.latitude-allScenicPlace.data.sceDis.latitudeStart)/allScenicPlace.data.locationHeightScale;
    console.log(x+","+y);
    //allScenicPlace.setData({meX:x,meY:y});
    let sceDisCanvas=allScenicPlace.data.sceDisCanvas;
    sceDisCanvas.drawImage("/images/meLocation.jpg", x*widthScale-picWidth/2, sceDisCanvasStyleHeight-y*heightScale-picHeight/2, picWidth, picHeight);
    
    if(allScenicPlace.data.navFlag)
      allScenicPlace.drawNavRoadLine();
    else
      allScenicPlace.drawSceDisCanvas();
  },
  drawSceDisCanvas:function(){
    let sceDisCanvas=allScenicPlace.data.sceDisCanvas;
    sceDisCanvas.draw();
  },
  changeCanvasSize:function(e){
    let bigflag=e.currentTarget.dataset.bigflag;
    let resetflag=e.currentTarget.dataset.resetflag;
    let allScenicPlaceData=allScenicPlace.data;
    let sceDisCanvasStyleWidth=allScenicPlaceData.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=allScenicPlaceData.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=allScenicPlaceData.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=allScenicPlaceData.sceDisCanvasMinHeight;
    let sceDisCanvasMaxWidth=allScenicPlaceData.sceDisCanvasMaxWidth;
    let sceDisCanvasMaxHeight=allScenicPlaceData.sceDisCanvasMaxHeight;
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

    allScenicPlace.setData({
      sceDisCanvasStyleWidth:sceDisCanvasStyleWidth,
      sceDisCanvasStyleHeight:sceDisCanvasStyleHeight
    })
    allScenicPlace.initSceDisCanvas(allScenicPlace.data.sceDisCanvasImagePath,true);
  },
  clearSceDisCanvas:function(){
    let sceDis=allScenicPlace.data.sceDis;
    let sceDisCanvas=allScenicPlace.data.sceDisCanvas;
    sceDisCanvas.clearRect(0, 0, sceDis.mapWidth, sceDis.mapHeight);
    sceDisCanvas.draw(true);
  },
  scrollCanvas:function(e){
    allScenicPlace.setData({sceDisCanvasScrollLeft:e.detail.scrollLeft,sceDisCanvasScrollTop:e.detail.scrollTop});
  },
  getTouchPoint:function(e){
    let pageX=e.touches[0].pageX;
    let pageY=e.touches[0].pageY;
    let scrollLeft=allScenicPlace.data.sceDisCanvasScrollLeft;
    let scrollTop=allScenicPlace.data.sceDisCanvasScrollTop;
    let sceDisCanvasMinWidth=allScenicPlace.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=allScenicPlace.data.sceDisCanvasMinHeight;
    let sceDisCanvasStyleWidth=allScenicPlace.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=allScenicPlace.data.sceDisCanvasStyleHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    let x=(scrollLeft+pageX)/widthScale;
    let y=(sceDisCanvasStyleHeight-scrollTop-pageY)/heightScale;
    console.log(x+","+y);
    let scenicPlaceList=allScenicPlace.data.scenicPlaceList;
    for(let i=0;i<scenicPlaceList.length;i++){
      let scenicPlace=scenicPlaceList[i];
      let startX=scenicPlace.x-scenicPlace.picWidth/2;
      let endX=scenicPlace.x+scenicPlace.picWidth/2;
      let startY=scenicPlace.y-scenicPlace.picHeight/2;
      let endY=scenicPlace.y+scenicPlace.picHeight/2;
      if(x>=startX&x<=endX&y>=startY&y<=endY){
        console.log(scenicPlace.name+",x="+scenicPlace.x+",y="+scenicPlace.y);
        allScenicPlace.navToDestination(scenicPlace.x,scenicPlace.y);
      }
    }
  },
  navToDestination:function(scenicPlaceX,scenicPlaceY){
    //let meX=allScenicPlace.data.meX;
    //let meY=allScenicPlace.data.meY;
    let meX=1250;
    let meY=580;
    allScenicPlace.setData({meX:meX,meY:meY});
    wx.request({
      url:serverPathSD+"wechatApplet/navToDestination",
      data:{meX:meX,meY:meY,scenicPlaceX:scenicPlaceX,scenicPlaceY:scenicPlaceY},
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function (res) {
        let data=res.data;
        allScenicPlace.setData({roadStageList:data.roadStageList});
        allScenicPlace.setData({navFlag:true});
        allScenicPlace.initSceDisCanvas(allScenicPlace.data.sceDisCanvasImagePath,true);
      }
    })
  },
  drawNavRoadLine:function(){

    let sceDisCanvas=allScenicPlace.data.sceDisCanvas;
    sceDisCanvas.beginPath(); //创建一条路径   
    sceDisCanvas.setStrokeStyle('red');   //设置边框为红色
    let x1=allScenicPlace.data.meX;
    let y1=allScenicPlace.data.meY;
    let x2=568;
    let y2=65;
    let roadStageList=allScenicPlace.data.roadStageList;
    //allScenicPlace.setRoadStageLocation(sceDisCanvas,962,385,568,65);
    //allScenicPlace.setRoadStageLocation(sceDisCanvas,x1,y1,roadStageList[0].backX,roadStageList[0].backY);
    for(let i=0;i<roadStageList.length;i++){
      //if(i==4)
        //break;
      console.log("==="+JSON.stringify(roadStageList[i]))
      console.log("x1="+roadStageList[i].backX+",y1="+roadStageList[i].backY+",x2="+roadStageList[i].frontX+",y2="+roadStageList[i].frontY)
      allScenicPlace.setRoadStageLocation(sceDisCanvas,roadStageList[i].backX,roadStageList[i].backY,roadStageList[i].frontX,roadStageList[i].frontY);
    }
    //allScenicPlace.setRoadStageLocation(sceDisCanvas,1097.00,572.00,1181.00,533);
    sceDisCanvas.stroke() //画出当前路径的边框
    sceDisCanvas.draw();
  },
  setRoadStageLocation:function(sceDisCanvas,x1,y1,x2,y2){
    let sceDisCanvasStyleWidth=allScenicPlace.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=allScenicPlace.data.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=allScenicPlace.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=allScenicPlace.data.sceDisCanvasMinHeight;
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