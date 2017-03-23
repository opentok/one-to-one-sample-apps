set -e

cd OneToOneScreenSharingSample

#Create local properties to find Android SDK
if [ ! -e "local.properties" ]
then
        echo sdk.dir=$ANDROID_HOME >> local.properties
fi

#Ensure gradle wraper is properly set
gradle wrapper

./gradlew build
cd ../OneToOneScreenSharingSampleUITests/
python ScreenSharingUITest.py -app '../OneToOneScreenSharingSample/app/build/outputs/apk/OneToOneScreenSharingSample.apk' -platform 'Android' -platformVersion '6.0' -deviceName 'Android Emulator' -appPackage 'com.tokbox.android.screensharingsample'
