const app = getApp()
var count = 0

Page({
  data: {
    uploadTimeout: null  
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      avatarUrl : app.globalData.userInfo.avatarUrl
   })
  },

  onLoad() {
  },

  changeUser() {
    app.globalData.userInfo = null;
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  changeUserAvatar() {
    let a = this;
    wx.showActionSheet({
        itemList: [ "从相册中选择", "拍照" ],
        itemColor: "#f7982a",
        success: function(e) {
        //album:相册   //camera拍照
            e.cancel || (0 == e.tapIndex ? a.chooseWxImageShop("album") : 1 == e.tapIndex && a.chooseWxImageShop("camera"));
        }
    });
  },
  //a：选择的类型  //album:相册   //camera拍照
  chooseWxImageShop: function(a) {
  var e = this;
  wx.chooseMedia({
      mediaType : ["image"],
      sizeType: [ "original", "compressed" ],
      sourceType: [ a ],//类型
      count:1,
      success: function(a) {
          if(a.tempFiles[0].size> 2097152){
              wx.showModal({
                  title: "提示",
                  content: "选择的图片过大,请上传不超过2M的图片",
                  showCancel: !1,
                  success: function(a) {
                      a.confirm;
                  }
              })
          }else{
              //把图片上传到服务器
              e.upload_file(a.tempFiles[0].tempFilePath)
          }
      }
  });
  },
  
    upload_file: function(e) {
      console.log(e);
      var that = this;
      wx.showLoading({
          title: "上传中"
      });
      wx.cloud.uploadFile({
        filePath,
        cloudPath: `${app.globalData.userInfo.account_id}_${Date.now()}.png`,
        success: (res) => {
          if (this.data.uploadTimeout) {
            clearTimeout(this.data.uploadTimeout);
            this.data.uploadTimeout = null;
            this.updateAvatar(res.fileID);
            wx.showToast({ title: "上传成功", icon: "success", duration: 1000 });
          }
        },
        fail: () => {
          if (this.data.uploadTimeout) {
            clearTimeout(this.data.uploadTimeout);
            this.data.uploadTimeout = null;
            wx.showToast({ title: "上传失败", icon: "none", duration: 3000 });
          }
        },
        complete: () => {
          wx.hideLoading();
        }
      })
    },
  
      
    updateAvatar(url) {
      var that = this;
      console.log(url)

      // 更新聊天记录数据库中头像信息
      wx.cloud.database().collection('chat_record').where({
        userA_avatarUrl : app.globalData.userInfo.avatarUrl,
        userA_account_id : app.globalData.userInfo.account_id
      }).update({
        data : {
        userA_avatarUrl : url
        }
      })

      wx.cloud.database().collection('chat_record').where({
        userB_avatarUrl : app.globalData.userInfo.avatarUrl,
        userB_account_id : app.globalData.userInfo.account_id
      }).update({
        data : {
        userB_avatarUrl : url
        }
      })

      console.log(app.globalData.userInfo.avatarUrl)

      // 更新数据集中用户的头像信息
      wx.cloud.database().collection('chat_user').doc(app.globalData.userInfo._id).update({
          data :{
            avatarUrl : url
          },
          success(res) {
            console.log(res)
            wx.showToast({
              title: '头像已更新',
            });
            that.setData({
              avatarUrl: url
            })
            app.globalData.userInfo.avatarUrl = url;
            wx.setStorageSync('userInfo', app.globalData.userInfo)
          }
      })

      this.onShow()

    },

    //前往登录/注册
    toLogin() {
      wx.navigateTo({
        url: '/pages/login/login',
      })
  }

    
})
