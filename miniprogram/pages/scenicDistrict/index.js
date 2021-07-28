// miniprogram/pages/scenicDistrict/index.js
//https://blog.csdn.net/qq_19741181/article/details/104505264
var scenicDistrict;
var serverPathCQ;
var serverPath;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sceDisCanvasImageX:0,
    sceDisCanvasImageY:0,
    dhdyButBgImg:'/images/001.png'
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
    scenicDistrict.getWindowSize();
    //scenicDistrict.initBackgroundImage(this.data.dhdyButBgImg);
  },
  initBackgroundImage:function(name){
    let base64 = wx.getFileSystemManager().readFileSync(name, 'base64');
    //console.log(base64)
    if(name.indexOf("001.png")){
      this.setData({
        'dhdyButBgImg': 'data:image/png;base64,' + base64
      });
    }
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
          
          //scenicDistrict.downloadFile(serverPath+data.sceDis.mapUrl);
          //https://www.bainuojiaoche.com/GoodsPublic/upload/1513819863143.jpg
          scenicDistrict.getSceDisImageInfo(serverPath+data.sceDis.mapUrl);
          //scenicDistrict.getSceDisImageInfo("https://www.bainuojiaoche.com/GoodsPublic/upload/1513819863143.jpg");
        }
      },
      fail:function(res){
        getApp().showToast(serverPathCQ);
        scenicDistrict.setData({toastMsg:JSON.stringify(res)});
        //scenicDistrict.downloadFile("https://www.bainuojiaoche.com/GoodsPublic/upload/1513819863143.jpg");
        //scenicDistrict.getSceDisImageInfo("https://www.bainuojiaoche.com/GoodsPublic/upload/1513819863143.jpg");
      }
    })
  },
  downloadFile:function(src){
    wx.downloadFile({
      url:src,
      success:function(res){
        console.log(JSON.stringify(res))
      },
      fail:function(res){
        scenicDistrict.setData({toastMsg:JSON.stringify(res)});
      }
    });
  },
  getSceDisImageInfo:function(src){
    wx.getImageInfo({
      src: src,
      success: function (res){
        scenicDistrict.setData({sceDisCanvasImagePath:res.path})
        scenicDistrict.initSceDisCanvas(res.path,false);
      },
      fail: function(res){
        scenicDistrict.setData({toastMsg:JSON.stringify(res)});
      }
    })
  },
  getScenicPlaceImageInfo:function(scenicPlace,index){
    console.log(scenicPlace);
    wx.getImageInfo({
      src: "http://localhost:8080"+scenicPlace.picUrl,
      success: function (res){
        scenicDistrict.drawScenicPlace(scenicPlace.name,res.path,scenicPlace.x,scenicPlace.y,scenicPlace.picWidth,scenicPlace.picHeight,index);
        //scenicDistrict.drawScenicPlace(scenicPlace.name,res.path,50,50,scenicPlace.picWidth,scenicPlace.picHeight,index);
      },
      fail: function(res){
        scenicDistrict.setData({toastMsg:JSON.stringify(res)});
      }
    })
  },
  initSceDisCanvas:function(path,reSizeFlag){
    let scenicDistrictData=scenicDistrict.data;
    //let sceDis=scenicDistrictData.sceDis;
    let sceDisCanvasImageX=scenicDistrictData.sceDisCanvasImageX;
    let sceDisCanvasImageY=scenicDistrictData.sceDisCanvasImageY;

    //scenicDistrict.setData({sceDisCanvasStyleWidth:1000,sceDisCanvasStyleHeight:1000})
    let sceDisCanvasStyleWidth=scenicDistrictData.sceDisCanvasStyleWidth;
    let sceDisCanvasStyleHeight=scenicDistrictData.sceDisCanvasStyleHeight;
    console.log("sceDisCanvasImageX="+sceDisCanvasImageX+",sceDisCanvasImageY="+sceDisCanvasImageY+",sceDisCanvasStyleWidth="+sceDisCanvasStyleWidth+",sceDisCanvasStyleHeight="+sceDisCanvasStyleHeight)
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

    scenicDistrict.selectScenicPlaceList()
  },
  selectScenicPlaceList:function(){
    wx.request({
      url:serverPathCQ+"requestSDApi",
      method: 'POST',
      data:{url:"http://localhost:8080/ElectronicGuideSD/wechatApplet/selectScenicPlaceList"},
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function (res) {
        let data=res.data;
        let scenicPlaceList=data.scenicPlaceList;
        scenicDistrict.setData({scenicPlaceLength:scenicPlaceList.length});
        for(let i=0;i<scenicPlaceList.length;i++){
          //if(i==2)
            scenicDistrict.getScenicPlaceImageInfo(scenicPlaceList[i],i);
        }
      }
    })
  },
  drawScenicPlace:function(name,picUrl,x,y,picWidth,picHeight,index){
    let sceDisCanvas=scenicDistrict.data.sceDisCanvas;
    let sceDisCanvasStyleHeight=scenicDistrict.data.sceDisCanvasStyleHeight;
    sceDisCanvas.drawImage(picUrl, x-picWidth/2, sceDisCanvasStyleHeight-y-picHeight/2, picWidth, picHeight);

    sceDisCanvas.font = 'normal bold 10px sans-serif';
    sceDisCanvas.setTextAlign('center'); // 文字居中
    sceDisCanvas.setFillStyle("#222");
    sceDisCanvas.fillText(name, x,sceDisCanvasStyleHeight-y+picHeight)

    let scenicPlaceLength=scenicDistrict.data.scenicPlaceLength;
    if(index==scenicPlaceLength-1){
      setTimeout(function(){
        sceDisCanvas.draw();
      },"5000");
    }
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