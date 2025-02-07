import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),            // 메인 페이지
        guestbook: resolve(__dirname, 'src/guestbook/guestbook.html') // 팝업 창
      }
    }
  }
});
