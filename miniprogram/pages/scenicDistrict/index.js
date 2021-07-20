// miniprogram/pages/scenicDistrict/index.js
var scenicDistrict;
var serverPathCQ;
var serverPath;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sceDisCanvasImageX:0,
    sceDisCanvasImageY:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    scenicDistrict=this;
    serverPathCQ=getApp().getServerPathCQ();
    serverPath=getApp().getServerPath();
    let sceDisId=options.sceDisId;
    //wx.setStorageSync('sceDisId', sceDisId);
    wx.setStorageSync('sceDisId', 1);
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
          scenicDistrict.setData({
            sceDis:sceDis,
            sceDisCanvasMinWidth:sceDisCanvasMinWidth,
            sceDisCanvasMinHeight:sceDisCanvasMinHeight,
            sceDisCanvasStyleWidth:sceDisCanvasMinWidth,
            sceDisCanvasStyleHeight:sceDisCanvasMinHeight,
            sceDisCanvasMaxWidth:sceDisCanvasMaxWidth,
            sceDisCanvasMaxHeight:sceDisCanvasMaxHeight
          });
          
          scenicDistrict.getImageInfo("sceDisCanvas",serverPath+data.sceDis.mapUrl);
        }
      }
    })
  },
  getImageInfo:function(flag,src){
    wx.getImageInfo({
      src: src,
      success: function (res){
        switch(flag){
          case "sceDisCanvas":
            scenicDistrict.setData({sceDisCanvasImagePath:res.path})
            scenicDistrict.initSceDisCanvas(res.path,false);
            break;
        }
      }
    })
  },
  initSceDisCanvas:function(path,reSizeFlag){
    let scenicDistrictData=scenicDistrict.data;
    //let sceDis=scenicDistrictData.sceDis;
    let sceDisCanvasImageX=scenicDistrictData.sceDisCanvasImageX;
    let sceDisCanvasImageY=scenicDistrictData.sceDisCanvasImageY;
    let sceDisCanvasStyleWidth=scenicDistrictData.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicDistrictData.sceDisCanvasStyleHeight;
    let sceDisCanvas=null;
    if(reSizeFlag){
      scenicDistrict.clearSceDisCanvas();
      sceDisCanvas=scenicDistrict.data.sceDisCanvas;
    }
    else{
      sceDisCanvas = wx.createCanvasContext('sceDisCanvas')
      scenicDistrict.setData({sceDisCanvas:sceDisCanvas});
    }
    sceDisCanvas.drawImage(path, sceDisCanvasImageX, sceDisCanvasImageY, sceDisCanvasStyleWidth, sceDisCanvasStyleHeight);
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
    scenicDistrict.initSceDisCanvas(scenicDistrict.data.sceDisCanvasImagePath,true);
  },
  clearSceDisCanvas:function(){
    let sceDis=scenicDistrict.data.sceDis;
    let sceDisCanvas=scenicDistrict.data.sceDisCanvas;
    sceDisCanvas.clearRect(0, 0, sceDis.mapWidth, sceDis.mapHeight);
    sceDisCanvas.draw(true);
  }
})