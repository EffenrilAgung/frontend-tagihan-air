module.exports = {
    apps: [
      {
        name: 'nuxt-app', // Ganti dengan nama aplikasi Anda
        port: '3003', // Port di mana Nuxt akan berjalan (sesuaikan jika perlu)
        script: './node_modules/nuxt/bin/nuxt.js',
        args: 'start',
        env: {
          NODE_ENV: 'production',
        }
      }
    ]
  }