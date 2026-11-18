# Invigra Android build

Invigra wraps the repository's existing React/Vite application in a native Android WebView using Capacitor. The Android debug APK is a development build and is **not** a Play Store release.

## GitHub Actions

Open Actions → **Build Invigra Android APK** → a successful run → **Artifacts** → **Invigra-Android-Debug-APK**, then unzip and install `app-debug.apk`.

## Local reproduction

Requires Node 22+, Java 21, Android SDK/Android Studio and Gradle dependencies.

```sh
npm ci
npm install --no-save @capacitor/core@8 @capacitor/cli@8 @capacitor/android@8
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

The resulting APK is `android/app/build/outputs/apk/debug/app-debug.apk`.

## Security

The current source repository contains a demo role selector in `src/context/AuthContext.jsx`, not production authentication. Do not use the resulting debug app with real institutional data until Firebase authentication, permissions, and Firestore access rules have been audited. Native wrapper does not grant Firebase admin or Hosting deployment permissions.
