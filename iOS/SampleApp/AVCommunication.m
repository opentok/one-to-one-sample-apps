//
//  AVCommunication.m
//  SampleApp
//
//  Created by Esteban Cordero on 2/8/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import "AVCommunication.h"
#import <Opentok/OpenTok.h>

@interface AVCommunication () <OTSessionDelegate, OTSubscriberKitDelegate, OTPublisherDelegate>
@property (strong, nonatomic) IBOutlet UIView *publisherView;
@property (strong, nonatomic) IBOutlet UIView *subscriberView;

@property (strong, nonatomic) IBOutlet UIView *videoHolder;
@property (strong, nonatomic) IBOutlet UIView *callHolder;
@property (strong, nonatomic) IBOutlet UIView *micHolder;

@property (strong, nonatomic) IBOutlet UIButton *toggleCallButton;
@property (strong, nonatomic) IBOutlet UILabel *connectingLabel;
@property (strong, nonatomic) IBOutlet UIButton *errorMessage;
@end

@implementation AVCommunication

OTSession *_session;
OTPublisher *_publisher;
OTSubscriber *_subscriber;

// ===============================================================================================//
// TOGGLE ICONS VARIABLES
// ===============================================================================================//
bool enable_call = YES;
bool subscribeToSelf;
// ===============================================================================================//

-(id) initWithData:(NSMutableDictionary *)configInfo{
  //NSBundle *bundle = [NSBundle bundleForClass:[self class]];
  if( self = [self initWithNibName:@"AVCommunication" bundle:[NSBundle mainBundle]]) {
    self.configInfo = configInfo;
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
  }
  return self;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  _session = [[OTSession alloc] initWithApiKey:self.configInfo[@"api"]
                                     sessionId:self.configInfo[@"sessionId"]
                                      delegate:self];
  subscribeToSelf = [self.configInfo[@"subscribeToSelf"] boolValue];
  [self makingBorder:_micHolder need_background_transparent:YES];
  [self makingBorder:_callHolder need_background_transparent:NO];
  [self makingBorder:_videoHolder need_background_transparent:YES];
}


- (BOOL)prefersStatusBarHidden {
  return YES;
}

- (BOOL)shouldAutorotateToInterfaceOrientation: (UIInterfaceOrientation)interfaceOrientation {
  return YES;
}

- (void) willRotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration {
  [self adjustViewsForOrientation:toInterfaceOrientation];
}

- (void) adjustViewsForOrientation:(UIInterfaceOrientation)orientation {
  if (orientation == UIInterfaceOrientationLandscapeLeft || orientation == UIInterfaceOrientationLandscapeRight ||
      orientation == UIInterfaceOrientationPortrait || orientation == UIInterfaceOrientationPortraitUpsideDown) {
    
    (_subscriber.view).frame = CGRectMake(0, 0, self.view.frame.size.height,self.view.frame.size.width);
    
    self.subscriberView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleBottomMargin |
    UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin |
    UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleBottomMargin;
  }
}


# pragma mark - OTSession delegate callbacks

-(void) sessionDidConnect:(OTSession*)session{
  [_connectingLabel setAlpha:0];
  // We have successfully connected, now instantiate a publisher and
  // begin pushing A/V streams into OpenTok.
  [self doPublish];
}

-(void) sessionDidDisconnect:(OTSession*)session{
  // We have successfully disconnected, now stop a publisher and
  // leave the app in status ready to reconnect if need.
  [self doUnpublish];
}

-(void) session:(OTSession *)session streamCreated:(OTStream *)stream{
  NSLog(@"session streamCreated (%@)", stream.streamId);
  // (if NO == subscribeToSelf): Begin subscribing to a stream we
  // have seen on the OpenTok session.
  if (!subscribeToSelf) {
    [self doSubscribe:stream];
  }
}

- (void)session:(OTSession*)session streamDestroyed:(OTStream *)stream {
  NSLog(@"session streamDestroyed (%@)", stream.streamId);
  if ([_subscriber.stream.streamId isEqualToString:stream.streamId]) {
    [_subscriber.view removeFromSuperview];
    _subscriber = nil;
  }
}

-(void) subscriberDidConnectToStream:(OTSubscriberKit*)subscriber {
  assert(_subscriber == subscriber);
  (_subscriber.view).frame = CGRectMake(0, 0, self.subscriberView.bounds.size.width,self.subscriberView.bounds.size.height);
  [self.subscriberView addSubview:_subscriber.view];
}

- (void)session:(OTSession *)session didFailWithError:(OTError *)error {
   NSLog(@"session did failed with error: (%@)", error);
  [self showErrorView: [NSString stringWithFormat:@"Network connection is unstable"]];
  [_connectingLabel setAlpha:1];
  [self doConnect];
}

-(void)subscriber:(OTSubscriberKit *)subscriber didFailWithError:(OTError *)error {
  NSLog(@"subscriber did failed with error: (%@)", error);
  [self showErrorView: [NSString stringWithFormat:@"Problems when subscribing"]];
}

-(void)publisher:(OTPublisherKit *)publisher didFailWithError:(OTError *)error {
  NSLog(@"publisher did failed with error: (%@)", error);
  [self showErrorView:[NSString stringWithFormat: @"Problems when publishing"]];
}

#pragma mark - OpenTok methods

/**
 * Asynchronously begins the session connect process. Some time later, we will
 * expect a delegate method to call us back with the results of this action.
 */
- (void)doConnect {
  [_connectingLabel setAlpha:1];
  OTError *error = nil;
  [_session connectWithToken:self.configInfo[@"token"] error:&error];
  if (error)  {
    NSLog(@"do connect error");
    [self showErrorView: [NSString stringWithFormat:@"Network connection is unstable"]];
  }
}


/**
 * kills the current session
 */
-(void)doDisconnect {
  OTError *error = nil;
  [_session disconnect:&error];
  if (error) {
    NSLog(@"disconnect failed with error: (%@)", error);
    [self showErrorView: [NSString stringWithFormat:@"Network connection is unstable"]];
  }
  _session = nil;
}


/**
 * Sets up an instance of OTPublisher to use with this session. OTPubilsher
 * binds to the device camera and microphone, and will provide A/V streams
 * to the OpenTok session.
 */
-(void) doPublish {
  if(!_publisher){
    _publisher = [[OTPublisher alloc] initWithDelegate:self name:[UIDevice currentDevice].name];
  }
  
  OTError *error = nil;
  if (error) {
    NSLog(@"publish error");
    [self showErrorView: [NSString stringWithFormat:@"publish error: (%@)", error]];
  }
  [_session publish:_publisher error:&error];
  
  [self.publisherView addSubview:_publisher.view];
  (_publisher.view).frame = CGRectMake(0, 0, self.publisherView.bounds.size.width, self.publisherView.bounds.size.height);
}

/**
 * Cleans up the publisher and its view. At this point, the publisher should not
 * be attached to the session any more.
 */
-(void) doUnpublish {
  OTError* error = nil;
  if (_subscriber) {
    [_session unsubscribe:_subscriber error:&error];
  }
  if (error) {
    NSLog(@"unsubscribe failed with error: (%@)", error);
    [self showErrorView: [NSString stringWithFormat: @"unsubscribe failed with error: (%@)", error]];
  }
  
  [_publisher.view removeFromSuperview];
  [_subscriber.view removeFromSuperview];
  _publisher = nil;
  _subscriber = nil;
}

/**
 * Instantiates a subscriber for the given stream and asynchronously begins the
 * process to begin receiving A/V content for this stream. Unlike doPublish,
 * this method does not add the subscriber to the view hierarchy. Instead, we
 * add the subscriber only after it has connected and begins receiving data.
 */
- (void)doSubscribe:(OTStream*)stream {
  _subscriber = [[OTSubscriber alloc] initWithStream:stream delegate:self];

  OTError *error = nil;
  [_session subscribe: _subscriber error:&error];
  if (error) {
    NSLog(@"subscribe error");
    [self showErrorView: [NSString stringWithFormat: @"subscribe error: (%@)", error]];
  }
}

/**
 * Cleans the subscriber from the view hierarchy, if any.
 * NB: You do *not* have to call unsubscribe in your controller in response to
 * a streamDestroyed event. Any subscribers (or the publisher) for a stream will
 * be automatically removed from the session during cleanup of the stream.
 */
- (void)cleanupSubscriber {
  [_subscriber.view removeFromSuperview];
  _subscriber = nil;
}

-(void) didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
  // Dispose of any resources that can be recreated.
}

// ===============================================================================================//
// Helps with the round borders on the interface buttons
// ===============================================================================================//
-(void) makingBorder: (UIView *)sendingView need_background_transparent: (BOOL)transparent {
  sendingView.layer.cornerRadius = (sendingView.bounds.size.width/2);
  if (transparent) {
    sendingView.layer.borderWidth = 1;
    sendingView.layer.borderColor = [UIColor whiteColor].CGColor;
  }
}

// ===============================================================================================//
// Action buttons for the Interface
// ===============================================================================================//
- (IBAction)micButton:(UIButton *)sender {
  _publisher.publishAudio = !_publisher.publishAudio;
  if(_publisher.publishAudio) {
    [sender setImage:[UIImage imageNamed:@"assets/mutedMicLineCopy"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"assets/mic"] forState: UIControlStateNormal];
  }
}
- (IBAction)callButton:(UIButton *)sender {
  if(enable_call) {
    //BLUE SIDE
    [sender setImage:[UIImage imageNamed:@"assets/hangUp"] forState: UIControlStateNormal];
    enable_call = NO;
    _callHolder.layer.backgroundColor = [UIColor colorWithRed:(205/255.0) green:(32/255.0) blue:(40/255.0) alpha:1.0].CGColor; //red background
    [self doConnect];
  } else {
    // RED SIDE
    [sender setImage:[UIImage imageNamed:@"assets/startCall"] forState: UIControlStateNormal];
    enable_call = YES;
    _callHolder.layer.backgroundColor = [UIColor colorWithRed:(106/255.0) green:(173/255.0) blue:(191/255.0) alpha:1.0].CGColor; //blue background
    [self doDisconnect];
  }
}
- (IBAction)videoButton:(UIButton *)sender {
  _publisher.publishVideo = !_publisher.publishVideo;
  if(_publisher.publishVideo) {
    [sender setImage:[UIImage imageNamed:@"assets/noVideoIcon"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"assets/videoIcon"] forState: UIControlStateNormal];
  }
}
// ===============================================================================================//
// SUBSCRIBER ACTIONS
// ===============================================================================================//
- (IBAction)toggleSubscriberVideo:(UIButton *)sender {
  _subscriber.subscribeToVideo = !_subscriber.subscribeToVideo;
  if(_subscriber.subscribeToVideo) {
    [sender setImage:[UIImage imageNamed:@"assets/noVideoIcon"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"assets/videoIcon"] forState: UIControlStateNormal];
  }
}
- (IBAction)toggleSubscriberAudio:(UIButton *)sender {
  _subscriber.subscribeToAudio = !_subscriber.subscribeToAudio;
  if(_subscriber.subscribeToAudio) {
    [sender setImage:[UIImage imageNamed:@"assets/noSoundCopy"] forState: UIControlStateNormal];
  } else {
    [sender setImage:[UIImage imageNamed:@"assets/audio"] forState: UIControlStateNormal];
  }
}
- (IBAction)switchCamera:(UIButton *)sender {
  if (_publisher.cameraPosition == AVCaptureDevicePositionBack) {
    _publisher.cameraPosition = AVCaptureDevicePositionFront;
  } else {
    _publisher.cameraPosition = AVCaptureDevicePositionBack;
  }
}

// ===============================================================================================//
-(void) showErrorView: (NSString *) error_message {
  // Show error message
  _errorMessage.alpha = 0.0f;
  [_errorMessage setTitle: error_message forState: UIControlStateNormal];
  [UIView animateWithDuration:0.5 animations:^{
    _errorMessage.alpha = 0.6f;
  }];
  
  [UIView animateWithDuration:0.5
                        delay:4
                      options:UIViewAnimationOptionTransitionNone
                   animations:^{
                     _errorMessage.alpha = 0.0f;
                   } completion:nil];
}
@end
