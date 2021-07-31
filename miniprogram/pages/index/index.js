//index.js
const app = getApp()
import { hexMD5 } from '../../components/md5/md5.js'
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    hasUserInfo: false,
    logged: false,
    takeSession: false,
    requestResult: '',
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') ,// 如需尝试获取用户信息可改为false,
    code:"",
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }
  },

  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
    }
  },

  onGetOpenid: function() {

    wx.login({
      timeout: 6000,
      success:res =>{

        console.log("获取请求码成功")
        console.log(res.code)
        if(res.code){
          wx.request({
            url: 'https://localhost:10053/login/login',
            data:{
              code:res.code
            },
            success:res=>{
              console.log("登录成功！")
              console.log(res)
              if(res.data.data.openid){
                
                console.log(res.data.data.openid)
                app.globalData.openid = res.data.data.openid
                wx.showToast({
                  title: '登录成功！',
                })
              }
            }
          })
        }else{
          console.log("获取请求码失败！")
        }
        
      }
    })
    // 调用云函数
    // wx.cloud.callFunction({
    //   name: 'login',
    //   data: {},
    //   success: res => {
    //     console.log('[云函数] [login] user openid: ', res.result.openid)
    //     app.globalData.openid = res.result.openid
    //     wx.navigateTo({
    //       url: '../userConsole/userConsole',
    //     })
    //   },
    //   fail: err => {
    //     console.error('[云函数] [login] 调用失败', err)
    //     wx.navigateTo({
    //       url: '../deployFunctions/deployFunctions',
    //     })
    //   }
    // })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        // const cloudPath = `my-image${filePath.match(/\.[^.]+?$/)[0]}`
        const url = `http://localhost:10053/photocontroller/receivePhoto`
        const name = 'file'
        wx.uploadFile({
          url,
          filePath,
          name,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.imagePath = filePath
            
            wx.showToast({
              title: '上传成功！',
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            console.log("name is "+name)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
