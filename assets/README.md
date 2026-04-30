# Assets

The Expo skeleton expects the following binary files in this directory. They are listed in [app.json](../app.json) and required before a production build (`eas build`). Dev (`npx expo start`) will warn but still run if any are missing.

| File                                 | Size                                  | Purpose                          |
| ------------------------------------ | ------------------------------------- | -------------------------------- |
| `icon.png`                           | 1024x1024 PNG                         | App icon (iOS + general)         |
| `adaptive-icon.png`                  | 1024x1024 PNG, transparent background | Android adaptive icon foreground |
| `splash.png`                         | 1284x2778 PNG (or similar tall)       | Launch splash                    |
| `favicon.png`                        | 48x48 PNG                             | Web build favicon                |
| `notification-icon.png` _(optional)_ | 96x96 PNG, white-on-transparent       | Push notification tray icon      |

Drop the files in this folder with the exact names above. To change the names or sizes, update `app.json` accordingly.
