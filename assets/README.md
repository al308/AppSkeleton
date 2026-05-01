# Assets

The Expo skeleton expects the following binary files in this directory. They are listed in [app.json](../app.json) and required before a production build (`eas build`). Dev (`npx expo start`) will warn but still run if any are missing.

| File                                 | Recommended size                                             | Purpose                          |
| ------------------------------------ | ------------------------------------------------------------ | -------------------------------- |
| `icon.png`                           | 1024×1024 PNG (square, no alpha)                             | App icon (iOS + general)         |
| `adaptive-icon.png`                  | 1024×1024 PNG, transparent bg, content in inner ~66 % circle | Android adaptive icon foreground |
| `splash.png`                         | 1284×2778 PNG (or similar tall) on a solid background        | Launch splash                    |
| `favicon.png`                        | 48–192 px PNG                                                | Web build favicon                |
| `notification-icon.png` _(optional)_ | 96×96 PNG, white-on-transparent silhouette                   | Push notification tray icon      |

Drop the files in this folder with the exact names above. To change the names or sizes, update `app.json` accordingly.

## docs/web/ assets (separate folder)

| File                    | Recommended size       | Purpose                                       |
| ----------------------- | ---------------------- | --------------------------------------------- |
| `docs/web/logo.png`     | 256–512 px PNG, square | Header on info & privacy pages                |
| `docs/web/og-image.png` | 1200×630 PNG           | Social/share preview (Twitter/LinkedIn/iMess) |
