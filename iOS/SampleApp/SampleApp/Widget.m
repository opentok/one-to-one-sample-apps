//
//  Widget.m
//  SampleApp
//
//  Created by Esteban Cordero on 2/8/16.
//  Copyright © 2016 AgilityFeat. All rights reserved.
//

#import "Widget.h"
#import <Opentok/OpenTok.h>

// otherwise no upside down rotation
@interface UINavigationController (RotationAll)
- (NSUInteger)supportedInterfaceOrientations;
@end

@implementation UINavigationController (RotationAll)
- (NSUInteger)supportedInterfaceOrientations {
  return UIInterfaceOrientationMaskAll;
}
@end

@interface Widget () <OTSessionDelegate, OTSubscriberKitDelegate, OTPublisherDelegate>
@property (strong, nonatomic) IBOutlet UIView *publisherView;
@property (strong, nonatomic) IBOutlet UIView *subscriberView;

@property (strong, nonatomic) IBOutlet UIView *videoHolder;
@property (strong, nonatomic) IBOutlet UIView *callHolder;
@property (strong, nonatomic) IBOutlet UIView *micHolder;

@property (strong, nonatomic) IBOutlet UIButton *toggleCallButton;
@property (strong, nonatomic) IBOutlet UILabel *connectingLabel;
@property (strong, nonatomic) IBOutlet UIButton *errorMessage;
@end

@implementation Widget

OTSession *_session;
OTPublisher *_publisher;
OTSubscriber *_subscriber;

// ===============================================================================================//
// TOGGLE ICONS VARIABLES
// ===============================================================================================//
bool enable_mic = YES;
bool enable_call = YES;
bool enable_video = YES;
bool subscriber_enable_video = YES;
bool subscriber_enable_audio = YES;
bool showing_cam_from = YES;
// ===============================================================================================//

-(id) initWithData:(NSMutableDictionary *)meetingInfo{
  //NSBundle *bundle = [NSBundle bundleForClass:[self class]];
  if( self = [self initWithNibName:@"Widget" bundle:[NSBundle mainBundle]]) {
    self.meetingInfo = meetingInfo;
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
  }
  return self;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  _session = [[OTSession alloc] initWithApiKey:self.meetingInfo[@"api"]
                                     sessionId:self.meetingInfo[@"sessionId"]
                                      delegate:self];
  [self makingBorder:_micHolder need_background_transparent:YES];
  [self makingBorder:_callHolder need_background_transparent:NO];
  [self makingBorder:_videoHolder need_background_transparent:YES];
}

- (BOOL)shouldAutorotate {
  return YES;
}

- (void)willAnimateRotationToInterfaceOrientation: (UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration {
  [super willRotateToInterfaceOrientation: toInterfaceOrientation duration:duration];
  UIInterfaceOrientation orientation = toInterfaceOrientation;
  // adjust overlay views
  if (orientation == UIInterfaceOrientationPortrait || orientation == UIInterfaceOrientationLandscapeLeft || orientation == UIInterfaceOrientationLandscapeRight) {
    self.subscriberView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleBottomMargin |
    UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin |
    UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleBottomMargin;
    
    self.publisherView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleBottomMargin |
    UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin |
    UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleBottomMargin;
  }
}

- (void)doConnect {
  [_connectingLabel setAlpha:1];
  OTError *error = nil;
  [_session connectWithToken:self.meetingInfo[@"token"] error:&error];
  if (error)  {
    NSLog(@"do connect error");
    [self showErrorView: [NSString stringWithFormat:@"Network connection is unstable"]];
  }
}

-(void)doDisconnect {
  OTError *error = nil;
  [_session disconnect:&error];
  if (error) {
    NSLog(@"disconnect failed with error: (%@)", error);
    [self showErrorView: [NSString stringWithFormat:@"Network connection is unstable"]];
  }
}
# pragma mark - OTSession delegate callbacks

-(void) sessionDidConnect:(OTSession*)session{
  //Here we start calling the components, for now just gonna place here...
  [_connectingLabel setAlpha:0];
  [self doPublish];
}

-(void) sessionDidDisconnect:(OTSession*)session{
  //Here we start calling the components, for now just gonna place here...
  [self removePublish];
}

-(void) session:(OTSession *)session streamCreated:(OTStream *)stream{
  NSLog(@"session streamCreated (%@)", stream.streamId);
  [self doSubscribe:stream];
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


///Methods that need to be in a component??? ===>

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

-(void) removePublish {
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
}


- (void)doSubscribe:(OTStream*)stream {
  _subscriber = [[OTSubscriber alloc] initWithStream:stream delegate:self];

  OTError *error = nil;
  [_session subscribe: _subscriber error:&error];
  if (error) {
    NSLog(@"subscribe error");
    [self showErrorView: [NSString stringWithFormat: @"subscribe error: (%@)", error]];
  }
}

/// <------- End of Component Methods

-(void) didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
  // Dispose of any resources that can be recreated.
}

// ===============================================================================================//
-(void) makingBorder: (UIView *)sendingView need_background_transparent: (BOOL)transparent {
  sendingView.layer.cornerRadius = (sendingView.bounds.size.width/2);
  if (transparent) {
    sendingView.layer.borderWidth = 1;
    sendingView.layer.borderColor = [UIColor whiteColor].CGColor;
  }
}

// ===============================================================================================//
- (IBAction)micButton:(UIButton *)sender {
  UIImage *onMic = [UIImage imageNamed:@"mic"];
  UIImage *offMic = [UIImage imageNamed:@"mutedMicLineCopy"];
  if(enable_mic) {
    [sender setImage:offMic forState: UIControlStateNormal];
    _publisher.publishAudio = NO;
    enable_mic = NO;
  } else {
    [sender setImage:onMic forState: UIControlStateNormal];
    _publisher.publishAudio = YES;
    enable_mic = YES;
  }
}
- (IBAction)callButton:(UIButton *)sender {
  UIImage *onCall = [UIImage imageNamed:@"startCall"];
  UIImage *offCall = [UIImage imageNamed:@"hangUp"];
  if(enable_call) {
    //BLUE SIDE
    [sender setImage:offCall forState: UIControlStateNormal];
    enable_call = NO;
    _callHolder.layer.backgroundColor = [UIColor colorWithRed:(205/255.0) green:(32/255.0) blue:(40/255.0) alpha:1.0].CGColor; //red background
    [self doConnect];
  } else {
    // RED SIDE
    [sender setImage:onCall forState: UIControlStateNormal];
    enable_call = YES;
    _callHolder.layer.backgroundColor = [UIColor colorWithRed:(106/255.0) green:(173/255.0) blue:(191/255.0) alpha:1.0].CGColor; //blue background
    [self doDisconnect];
  }
}
- (IBAction)videoButton:(UIButton *)sender {
  UIImage *onVideo = [UIImage imageNamed:@"videoIcon"];
  UIImage *offVideo = [UIImage imageNamed:@"noVideoIcon"];
  if(enable_video) {
    [sender setImage:offVideo forState: UIControlStateNormal];
    _publisher.publishVideo = NO;
    enable_video = NO;
  } else {
    [sender setImage:onVideo forState: UIControlStateNormal];
    _publisher.publishVideo = YES;
    enable_video = YES;
  }
}
// ===============================================================================================//
// SUBSCRIBER ACTIONS
// ===============================================================================================//
- (IBAction)toggleSubscriberVideo:(UIButton *)sender {
  UIImage *onVideo = [UIImage imageNamed:@"videoIcon"];
  UIImage *offVideo = [UIImage imageNamed:@"noVideoIcon"];
  if(subscriber_enable_video) {
    [sender setImage:offVideo forState: UIControlStateNormal];
    _subscriber.subscribeToVideo = NO;
    subscriber_enable_video = NO;
  } else {
    [sender setImage:onVideo forState: UIControlStateNormal];
    _subscriber.subscribeToVideo = YES;
    subscriber_enable_video = YES;
  }
}
- (IBAction)toggleSubscriberAudio:(UIButton *)sender {
  UIImage *onAudio = [UIImage imageNamed:@"audio"];
  UIImage *offAudio = [UIImage imageNamed:@"noSoundCopy"];
  if(subscriber_enable_video) {
    [sender setImage:offAudio forState: UIControlStateNormal];
    _subscriber.subscribeToAudio = NO;
    subscriber_enable_video = NO;
  } else {
    [sender setImage:onAudio forState: UIControlStateNormal];
    _subscriber.subscribeToAudio = YES;
    subscriber_enable_video = YES;
  }
}
- (IBAction)switchCamera:(UIButton *)sender {
  if (showing_cam_from) {
    _publisher.cameraPosition = AVCaptureDevicePositionBack;
    showing_cam_from = NO;
  } else {
    _publisher.cameraPosition = AVCaptureDevicePositionFront;
    showing_cam_from = YES;
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
