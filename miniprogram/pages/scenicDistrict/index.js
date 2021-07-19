// miniprogram/pages/scenicDistrict/index.js
var scenicDistrict;
var serverPathCQ;
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
    scenicDistrict=this;
    serverPathCQ=getApp().getServerPathCQ();
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
          scenicDistrict.setData({
            sceDis:data.sceDis
          });
          scenicDistrict.getImageInfo("sceDisCanvas","http://www.qrcodesy.com:8080"+data.sceDis.mapUrl);
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
            scenicDistrict.initSceDisCanvas(res.path);
            break;
        }
      }
    })
  },
  initSceDisCanvas:function(path){
    let sceDis=scenicDistrict.data.sceDis;
    var ctx = wx.createCanvasContext('sceDisCanvas')
    ctx.drawImage(path, 0, 0, sceDis.mapWidth, sceDis.mapHeight);
    ctx.draw();
  }
})