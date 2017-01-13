# RELEASE NOTES

## OpenTok One-to-One Communication Sample App Version 1.3

### New Features and Enhancements

  - Update OpenTok versions
  - (_JS only_) Check videoTypes
  - (iOS only_) Add subscriber video disabled/enabled cases

### Resolved Issues
  
   - (_Android only_) Fix audio only UI

## OpenTok One-to-One Communication Sample App Version 1.2

### New Features and Enhancements

  - (_Android and iOS only_) The One-to-One Communication Sample App includes the session reconnections callbacks.
  - (_Android only_) New camera callabcks.

### Resolved Issues

  - (_Android only_) There was in issue with the audio and video permissions denied for Android version 6+. This issue has been resolved.
  - (_iOS only_) There was in issue with UIs didn't get reset after ending the call. This issue has been resolved.
  - (_JS only_) There was in issue trying to unsubscribe a stream from the session. This issue has been resolved.

## OpenTok One-to-One Communication Sample App Version 1.1

### New Features and Enhancements

  - The One-to-One Communication Sample App requires the latest OpenTok SDK version on all platforms.
  - The sample app contains logic used for logging for internal TokBox purposes only, which has been updated to v2. 
  - (_Android and iOS only_) The One-to-One Communication Sample App now includes an opentok-accelerator-pack dependency, which includes the audio/video communication code.
  - (_JS only_) The code has been refactored, and the `Call` component has been renamed to `CommunicationAccPack`.


### Resolved Issues

  - (_Android only_) There was in issue with the AudioOnly UI in which the avatar image sometimes did not display correctly. This issue has been resolved.
  - (_Android only_) There was in issue in which full screen mode for subscribers did not work correctly when the device was rotated. This issue has been resolved.
