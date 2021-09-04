// miniprogram/pages/scenicDistrict/index.js
//https://blog.csdn.net/qq_19741181/article/details/104505264
var scenicDistrict;
var serverPathCQ;
var serverPathSD;
var serverPath;
var sceDisCanvasImagePath;
var scenicPlaceImageCount;
var canvasScenicPlaceCount;
var scenicPlaceList;
var scenicPlaceLength;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sceDisCanvasImageX:0,
    sceDisCanvasImageY:0,
    sceDisCanvasScrollLeft:0,
    sceDisCanvasScrollTop:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getLocation({
      type: 'wgs84',
      success:function(res){        
        //console.log(res.longitude+","+res.latitude)
        scenicDistrict.setData({longitude:res.longitude,latitude:res.latitude});
      }
    })

    scenicDistrict=this;
    serverPathCQ=getApp().getServerPathCQ();
    serverPath=getApp().getServerPath();
    let sceDisId=options.sceDisId;
    //wx.setStorageSync('sceDisId', sceDisId);
    wx.setStorageSync('sceDisId', 1);
    scenicDistrict.getWindowSize();
  },
  getWindowSize:function(){
    scenicDistrict.setData({
      windowWidth:wx.getSystemInfoSync().windowWidth,
      windowHeight:wx.getSystemInfoSync().windowHeight
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      //https://developers.weixin.qq.com/miniprogram/dev/component/canvas.html#Canvas-2D-%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81
      //https://www.jb51.net/article/182288.htm
      scenicDistrict.selectSceDisById();
      //scenicDistrict.initSceDisCanvas("http://tmp/VEVKyulCFuto9c4f4458d9905c2fa99bb56eb28a6276.jpg",false);
      /*
      var ctx = wx.createCanvasContext('sceDisCanvas')
      //ctx.drawImage("/images/database.png", 0, 0, 1550, 1200);
      wx.getImageInfo({
        src: 'http://www.qrcodesy.com:8080/ElectronicGuide/upload/map/1626254021278.jpg',
        success: function (res){
          console.log("res==="+JSON.stringify(res));
          ctx.drawImage(res.path, 0, 0, 1550, 1200);

          var str = "我都不惜说你了"
          ctx.font = 'normal bold 20px sans-serif';
          ctx.setTextAlign('center'); // 文字居中
          ctx.setFillStyle("#222222");
          ctx.fillText(str, 100,65)
    
          
          ctx.drawImage("/images/deploy_step1.png", 100, 100, 550, 200);
    
          ctx.draw();
        }
      })
      */
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

  },
  checkSceDisInfo:function(){
    let sceDis=getApp().sceDis;
    if(sceDis==undefined)
      return false;
    else
      return true;
  },
  selectSceDisById:function(){
    if(scenicDistrict.checkSceDisInfo()){
      let sceDis=getApp().sceDis;
      scenicDistrict.initSceDisInfo(sceDis);
    }
    else{
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
            scenicDistrict.initSceDisInfo(sceDis);
          }
        },
        fail:function(res){
          getApp().showToast(serverPathCQ);
          scenicDistrict.setData({toastMsg:JSON.stringify(res)});
        }
      })
    }
  },
  initSceDisInfo:function(sceDis){
    let sceDisCanvasMinWidth=sceDis.mapWidth;
    let sceDisCanvasMinHeight=sceDis.mapHeight;
    let sceDisCanvasMaxWidth=sceDis.picWidth;
    let sceDisCanvasMaxHeight=sceDis.picHeight;
    scenicDistrict.setData({
      sceDis:sceDis,
      sceDisCanvasMinWidth:sceDisCanvasMinWidth,
      sceDisCanvasMinHeight:sceDisCanvasMinHeight,
      sceDisCanvasStyleWidth:sceDisCanvasMinWidth,
      sceDisCanvasStyleHeight:sceDisCanvasMinHeight,
      sceDisCanvasMaxWidth:sceDisCanvasMaxWidth,
      sceDisCanvasMaxHeight:sceDisCanvasMaxHeight
    });
    serverPathSD="http://"+sceDis.serverName+":8080/ElectronicGuideSD/";
    
    scenicDistrict.jiSuanLocationScale(sceDis);
    //scenicDistrict.downloadFile(serverPath+data.sceDis.mapUrl);
    scenicDistrict.initSceDisCanvasImagePath(serverPath+sceDis.mapUrl);
  },
  jiSuanLocationScale:function(sceDis){
    let locationWidthScale=(sceDis.longitudeEnd-sceDis.longitudeStart)/sceDis.mapWidth;
    let locationHeightScale=(sceDis.latitudeEnd-sceDis.latitudeStart)/sceDis.mapHeight;
    console.log(locationWidthScale+","+locationHeightScale);
    scenicDistrict.setData({locationWidthScale:locationWidthScale,locationHeightScale:locationHeightScale});
  },
  downloadFile:function(src){
    wx.downloadFile({
      url:src,
      success:function(res){
        //console.log(JSON.stringify(res))
      },
      fail:function(res){
        scenicDistrict.setData({toastMsg:JSON.stringify(res)});
      }
    });
  },
  checkSceDisCanvasImagePath:function(){
    let sceDisCanvasImagePath=getApp().sceDisCanvasImagePath;
    if(sceDisCanvasImagePath==undefined)
      return false;
    else
      return true;
  },
  initSceDisCanvasImagePath:function(src){
    //console.log("src="+src)
    //console.log("serverPathSD="+serverPathSD);
    if(scenicDistrict.checkSceDisCanvasImagePath()){
      sceDisCanvasImagePath=getApp().sceDisCanvasImagePath;
      scenicDistrict.selectScenicPlaceList();
    }
    else{
      wx.getImageInfo({
        src: src,
        success: function (res){
          sceDisCanvasImagePath=res.path;
          getApp().sceDisCanvasImagePath=sceDisCanvasImagePath;
          scenicDistrict.selectScenicPlaceList();
        },
        fail: function(res){
          scenicDistrict.setData({toastMsg:JSON.stringify(res)});
        }
      })
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
    if(scenicDistrict.checkScenicPlaceImageSrc(scenicPlaceItem.imageSrc)){
      scenicPlaceImageCount++;
      if(scenicPlaceImageCount==scenicPlaceLength){
        scenicDistrict.initSceDisCanvas(sceDisCanvasImagePath,false);
      }
    }
    else{
      wx.getImageInfo({
        src: serverPath+scenicPlaceItem.picUrl,
        success: function (res){
          scenicPlaceItem.imageSrc=res.path;
          scenicPlaceImageCount++;
          if(scenicPlaceImageCount==scenicPlaceLength){
            scenicDistrict.initSceDisCanvas(sceDisCanvasImagePath,false);
          }
        },
        fail: function(res){
          scenicDistrict.setData({toastMsg:JSON.stringify(res)});
        }
      })
    }
  },
  initSceDisCanvas:function(path,reSizeFlag){
    let scenicDistrictData=scenicDistrict.data;
    //let sceDis=scenicDistrictData.sceDis;
    let sceDisCanvasImageX=scenicDistrictData.sceDisCanvasImageX;
    let sceDisCanvasImageY=scenicDistrictData.sceDisCanvasImageY;

    //scenicDistrict.setData({sceDisCanvasStyleWidth:1000,sceDisCanvasStyleHeight:1000})
    let sceDisCanvasStyleWidth=scenicDistrictData.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicDistrictData.sceDisCanvasStyleHeight;
    //console.log("sceDisCanvasImageX="+sceDisCanvasImageX+",sceDisCanvasImageY="+sceDisCanvasImageY+",sceDisCanvasStyleWidth="+sceDisCanvasStyleWidth+",sceDisCanvasStyleHeight="+sceDisCanvasStyleHeight)
    let sceDisCanvas=null;
    if(reSizeFlag){
      //scenicDistrict.clearSceDisCanvas();
      sceDisCanvas=scenicDistrict.data.sceDisCanvas;
    }
    else{
      sceDisCanvas = wx.createCanvasContext('sceDisCanvas')
      scenicDistrict.setData({sceDisCanvas:sceDisCanvas});
    }
    sceDisCanvas.drawImage(path, sceDisCanvasImageX, sceDisCanvasImageY, sceDisCanvasStyleWidth, sceDisCanvasStyleHeight);

    canvasScenicPlaceCount=0;
    for(var i=0;i<scenicPlaceList.length;i++){
      let scenicPlaceItem=scenicPlaceList[i];
      scenicDistrict.drawScenicPlace(scenicPlaceItem.name,scenicPlaceItem.imageSrc,scenicPlaceItem.x,scenicPlaceItem.y,scenicPlaceItem.picWidth,scenicPlaceItem.picHeight);
    }
  },
  checkScenicPlaceList:function(){
    if(scenicPlaceList==undefined)
      return false;
    else
      return true;
  },
  selectScenicPlaceList:function(){
    if(scenicDistrict.checkScenicPlaceList()){
      scenicPlaceList=getApp().scenicPlaceList;
      scenicDistrict.initScenicPlaceList(scenicPlaceList);
    }
    else{
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
          scenicDistrict.initScenicPlaceList(scenicPlaceList);
        },
        fail:function(){
          
        }
      })
    }
  },
  initScenicPlaceList:function(scenicPlaceList){
    scenicPlaceImageCount=0;
    canvasScenicPlaceCount=0;
    for(let i=0;i<scenicPlaceList.length;i++){
      //if(i==2)
        scenicDistrict.initScenicPlaceImageSrc(scenicPlaceList[i]);
    }
  },
  drawScenicPlace:function(name,picUrl,x,y,picWidth,picHeight){
    canvasScenicPlaceCount++;
    console.log("canvasScenicPlaceCount==="+canvasScenicPlaceCount)
    let sceDisCanvas=scenicDistrict.data.sceDisCanvas;
    let sceDisCanvasStyleWidth=scenicDistrict.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicDistrict.data.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=scenicDistrict.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicDistrict.data.sceDisCanvasMinHeight;
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
    let scenicPlaceLength=getApp().scenicPlaceLength;
    if(canvasScenicPlaceCount==scenicPlaceLength){
      scenicDistrict.drawMeLocation();
    }
  },
  drawMeLocation:function(){
    let picWidth=34;
    let picHeight=42;
    let sceDisCanvasStyleWidth=scenicDistrict.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicDistrict.data.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=scenicDistrict.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicDistrict.data.sceDisCanvasMinHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    let x=(scenicDistrict.data.longitude-scenicDistrict.data.sceDis.longitudeStart)/scenicDistrict.data.locationWidthScale;
    let y=(scenicDistrict.data.latitude-scenicDistrict.data.sceDis.latitudeStart)/scenicDistrict.data.locationHeightScale;
    console.log(x+","+y);
    let sceDisCanvas=scenicDistrict.data.sceDisCanvas;
    sceDisCanvas.drawImage("/images/meLocation.jpg", x*widthScale-picWidth/2, sceDisCanvasStyleHeight-y*heightScale-picHeight/2, picWidth, picHeight);
    
    scenicDistrict.drawSceDisCanvas();
  },
  drawSceDisCanvas:function(){
    let sceDisCanvas=scenicDistrict.data.sceDisCanvas;
    sceDisCanvas.draw();
  },
  changeCanvasSize:function(e){
    let bigflag=e.currentTarget.dataset.bigflag;
    let resetflag=e.currentTarget.dataset.resetflag;
    let scenicDistrictData=scenicDistrict.data;
    let sceDisCanvasStyleWidth=scenicDistrictData.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicDistrictData.sceDisCanvasStyleHeight;
    let sceDisCanvasMinWidth=scenicDistrictData.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicDistrictData.sceDisCanvasMinHeight;
    let sceDisCanvasMaxWidth=scenicDistrictData.sceDisCanvasMaxWidth;
    let sceDisCanvasMaxHeight=scenicDistrictData.sceDisCanvasMaxHeight;
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

    scenicDistrict.setData({
      sceDisCanvasStyleWidth:sceDisCanvasStyleWidth,
      sceDisCanvasStyleHeight:sceDisCanvasStyleHeight
    })
    scenicDistrict.initSceDisCanvas(sceDisCanvasImagePath,true);
  },
  clearSceDisCanvas:function(){
    let sceDis=scenicDistrict.data.sceDis;
    let sceDisCanvas=scenicDistrict.data.sceDisCanvas;
    sceDisCanvas.clearRect(0, 0, sceDis.mapWidth, sceDis.mapHeight);
    sceDisCanvas.draw(true);
  },
  getTouchPoint:function(e){
    let pageX=e.touches[0].pageX;
    let pageY=e.touches[0].pageY;
    let scrollLeft=scenicDistrict.data.sceDisCanvasScrollLeft;
    let scrollTop=scenicDistrict.data.sceDisCanvasScrollTop;
    let sceDisCanvasMinWidth=scenicDistrict.data.sceDisCanvasMinWidth;
    let sceDisCanvasMinHeight=scenicDistrict.data.sceDisCanvasMinHeight;
    let sceDisCanvasStyleWidth=scenicDistrict.data.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicDistrict.data.sceDisCanvasStyleHeight;
    let widthScale=sceDisCanvasStyleWidth/sceDisCanvasMinWidth;
    let heightScale=sceDisCanvasStyleHeight/sceDisCanvasMinHeight;
    let x=(scrollLeft+pageX)/widthScale;
    let y=(sceDisCanvasStyleHeight-scrollTop-pageY)/heightScale;
    console.log(x+","+y);
    for(let i=0;i<scenicPlaceList.length;i++){
      let scenicPlace=scenicPlaceList[i];
      let startX=scenicPlace.x-scenicPlace.picWidth/2;
      let endX=scenicPlace.x+scenicPlace.picWidth/2;
      let startY=scenicPlace.y-scenicPlace.picHeight/2;
      let endY=scenicPlace.y+scenicPlace.picHeight/2;
      if(x>=startX&x<=endX&y>=startY&y<=endY){
        //console.log("id="+scenicPlace.id+","+scenicPlace.name+",x="+scenicPlace.x+",y="+scenicPlace.y);
        scenicDistrict.goScenicPlace(scenicPlace.id,scenicPlace.name,scenicPlace.x,scenicPlace.y,scenicPlace.picUrl,scenicPlace.picWidth,scenicPlace.picHeight,scenicPlace.arroundScope);
      }
    }
  },
  goScenicPlace:function(id,name,x,y,picUrl,picWidth,picHeight,arroundScope){
    wx.redirectTo({
      url: '/pages/scenicPlace/scenicPlace?id='+id+"&name="+name+"&x="+x+"&y="+y+"&picUrl="+picUrl+"&picWidth="+picWidth+"&picHeight="+picHeight+"&arroundScope="+arroundScope,
    })
  },
  scrollCanvas:function(e){
    scenicDistrict.setData({sceDisCanvasScrollLeft:e.detail.scrollLeft,sceDisCanvasScrollTop:e.detail.scrollTop});
  },
  goAllScenicPlace:function(){
    wx.redirectTo({
      url: '/pages/allScenicPlace/allScenicPlace',
    })
  }
})