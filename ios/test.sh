set -e

cd OneToOneScreenShareSample
pod cache clean --all
pod install
xcodebuild -workspace OneToOneScreenShareSample.xcworkspace -scheme OneToOneScreenShareSample -sdk iphonesimulator10.0 -configuration Debug -derivedDataPath build
cd ../OneToOneScreenShareSampleUITests/
python ScreenShareUITest.py '../OneToOneScreenShareSample/build/Build/Products/Debug-iphonesimulator/OneToOneScreenShareSample.app' -platform 'iOS' -platformVersion '10.0' -deviceName 'iPhone 6s Plus' -bundleId 'com.tokbox.OneToOneScreenShareSample'
