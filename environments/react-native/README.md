# React Native with Expo

# Getting Started
There are a few things that need to be done to get setup

Install the Expo CLI:
npm install -g expo-cli

Install the npm packages:
npm install

# Environment
For a windows machine with a bootcamped Mac 

To run in Android use the npm script in package.json:
npx expo start

Then press "a" in the repl that appears

You may need to "Wipe Data" in the Android Studio virtual device manager when running new apps

This should open up an Android emulator. This requires Android studio and a build configuration that does not include the Google Play store for some reason. Graphics Rendering needs to be set to Software. This can be accomplished by using the Pixel 6 build configuration

To run in iOS use the npm script in package.json:
npx expo start

Then scan the QR code with your phone

When the app loads, simple to a LONG three-fingered tap. This is required for UI interaction in the app. No clue why