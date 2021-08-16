// miniprogram/pages/scenicPlace/scenicPlace.js
var scenicPlace;
var serverPathCQ;
var serverPathSD;
var serverPath;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
        scenicPlace.initSceDisCanvas(res.path,false);
      },
      fail: function(res){
        scenicPlace.setData({toastMsg:JSON.stringify(res)});
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
      scenicPlace.clearSceDisCanvas();
      sceDisCanvas=scenicPlace.data.sceDisCanvas;
    }
    else{
      sceDisCanvas = wx.createCanvasContext('sceDisCanvas')
      scenicPlace.setData({sceDisCanvas:sceDisCanvas});
    }
    sceDisCanvas.drawImage(path, sceDisCanvasImageX, sceDisCanvasImageY, sceDisCanvasStyleWidth, sceDisCanvasStyleHeight);

    scenicPlace.getScenicPlaceImageInfo()
  },
  getScenicPlaceImageInfo:function(){
    wx.getImageInfo({
      //src: "https://localhost"+scenicPlace.picUrl,
      src: "https://www.qrcodesy.com"+scenicPlace.data.picUrl,
      success: function (res){
        scenicPlace.drawScenicPlace(scenicPlace.data.name,res.path,scenicPlace.data.x,scenicPlace.data.y,scenicPlace.data.picWidth,scenicPlace.data.picHeight);
      },
      fail: function(res){
        scenicPlace.setData({toastMsg:JSON.stringify(res)});
      }
    })
  },
  drawScenicPlace:function(name,picUrl,x,y,picWidth,picHeight){
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

    scenicPlace.drawMeLocation();
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
    let x=(scenicPlace.data.longitude-scenicPlace.data.sceDis.longitudeStart)/scenicPlace.data.locationWidthScale;
    let y=(scenicPlace.data.latitude-scenicPlace.data.sceDis.latitudeStart)/scenicPlace.data.locationHeightScale;
    console.log(x+","+y);
    //scenicPlace.setData({meX:x,meY:y});
    let sceDisCanvas=scenicPlace.data.sceDisCanvas;
    sceDisCanvas.drawImage("/images/meLocation.jpg", x*widthScale-picWidth/2, sceDisCanvasStyleHeight-y*heightScale-picHeight/2, picWidth, picHeight);
    
    if(scenicPlace.data.navFlag)
      scenicPlace.drawNavRoadLine();
    else
      scenicPlace.drawSceDisCanvas();
  },
  drawSceDisCanvas:function(){
    let sceDisCanvas=scenicPlace.data.sceDisCanvas;
    sceDisCanvas.draw();
  },
  scrollCanvas:function(e){
    scenicPlace.setData({sceDisCanvasScrollLeft:e.detail.scrollLeft,sceDisCanvasScrollTop:e.detail.scrollTop});
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