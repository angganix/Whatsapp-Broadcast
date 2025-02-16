## Whatsapp Broadcast (Unofficial)

Project ini berawal dari permintaan seseorang yang ingin melakukan broadcast pesan whatsapp dengan integrasi ke sistem aplikasi milik beliau, terciptalah ide untuk bikin project ini.

project nya masih sederhana banget, page nya cuma buat demo dan testing pengiriman broadccast pesan aja. barangkali yang baca ini butuh juga buat sample project silahkan di fork **GAK PAPA FORK AJA KOCAK, GAK USAH CONTRIBUTE, RIBET PULL REQUEST SEGALA, FORK AJA!!!**.

#### Cara Setup & Running Project

1. Clone Project nya
   ```
   git clone 
   ```

2. Install package
   ```
   npm install
   ```

3. Copy .env.example ke .env dan isi sesuai keinginan
   ```
   #development untuk testing di lokal, production kalo udah live domain
   ENVIRONMENT=development

   #ganti port sesuai keinginan
   BASE_PORT=2004

   #kalo development pake ini, kalo live sesuaikan dengan domain dan protocol nya (https misal)
   BASE_URL=http://localhost

   #token ini bukan encrypt random string aja, pastikan jangan ampe bocor
   AUTH_TOKEN=isidenganrandomstringdanjangansampaiadaiyangtauBaiknyabuatskenarioauthsendiridisisifrontend
   ```

4. Jalankan project nya
   ```
   npm start
   ```

5. Buka di browser url sesuai yang sudah di set .env
   ```
   http://localhost:2004
   ```

6. Tunggu hingga QR Code muncul, dan scan menggunakan whatsapp di ponsel
7. Testing broadcast pesan
