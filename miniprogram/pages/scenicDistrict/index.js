// miniprogram/pages/scenicDistrict/index.js
var scenicDistrict;
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      //https://developers.weixin.qq.com/miniprogram/dev/component/canvas.html#Canvas-2D-%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81
      //https://www.jb51.net/article/182288.htm
      var ctx = wx.createCanvasContext('ssdwCanvas')
      ctx.drawImage("/images/database.png", 0, 0, 1550, 1200);

      var str = "我都不惜说你了"
      ctx.font = 'normal bold 20px sans-serif';
      ctx.setTextAlign('center'); // 文字居中
      ctx.setFillStyle("#222222");
      ctx.fillText(str, 100,65)

      
      ctx.drawImage("/images/deploy_step1.png", 100, 100, 550, 200);

      ctx.draw();
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