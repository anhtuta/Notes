## KHÔNG thể sử dụng variable trong animation keyframes
```css
:root {
  --primaryColor: #2199F9;
}

@keyframes blinker {
  50% {
    background: var(--primaryColor);  /* Ko thể dùng được, nếu dùng browser sẽ báo lỗi "no matching selector or style" khi inspect element */
    color: #fff;
  }
  100% {
    background: #fc0;
    color: #000;
  }
}
```