# vs-platform
練習使用 nuxt + firebase 建立簡易「xxx二選一」應用服務。

使用 nuxt 作 SSR，project structure 也參照 nuxt 結構，使用 firebase 作為後端 DB 與儲存空間，使用 Heroku deploy 服務。

## Feature
- [x] 建立比賽
- [x] 紀錄選擇過程，無痛接軌
- [x] 統計資訊
- [ ] 搜尋功能

## Demo
[https://vs-platform-demo.herokuapp.com/](https://vs-platform-demo.herokuapp.com/)
## 在本地端執行
準備`firebase.json`，參考`plugins/firebase.json.example`。
```json
{
    "apiKey": "",
    "authDomain": "",
    "databaseURL": "",
    "projectId": "",
    "storageBucket": "",
    "messagingSenderId": "",
    "appId": "",
    "measurementId": ""
}
```
```bash
# install dependencies
npm install

# serve for development
npm run dev

# build for production and launch server
npm run build
npm run start
```
