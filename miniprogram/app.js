//app.js
//var serverPathCQ = "https://www.qrcodesy.com/ElectronicGuideCQ/wechatApplet/";
var serverPathCQ = "http://192.168.2.166:8080/ElectronicGuideCQ/wechatApplet/";
//var serverPath = "https://www.qrcodesy.com";
var serverPath = "http://192.168.2.166:8080";
var sceDis;
var sceDisCanvasImagePath;
var scenicPlaceList;
var scenicPlaceLength;
var busStopList;
var busStopLength;
var busStopPicUrl="/images/busStop.png";
var busStopPicWidth=20;
var busStopPicHeight=20;

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {}
  },
  getServerPathCQ:function(){
    return serverPathCQ;
  },
  getServerPath:function(){
    return serverPath;
  },
  setSceDis:function(sceDis){
    this.sceDis=sceDis;
  },
  getSceDis:function(){
    return sceDis;
  },
  getSceDisCanvasImagePath:function(){
    return sceDisCanvasImagePath;
  },
  getBusStopPicUrl:function(){
    return busStopPicUrl;
  },
  getBusStopPicWidth:function(){
    return busStopPicWidth;
  },
  getBusStopPicHeight:function(){
    return busStopPicHeight;
  },
  showToast:function(title){
    wx.showToast({
      title: title,
      icon:'none'
    })
  }
})
