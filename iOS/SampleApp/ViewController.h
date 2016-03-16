#import <UIKit/UIKit.h>

@interface ViewController : UIViewController

@property (strong, nonatomic) IBOutlet UIView *publisherView;
@property (strong, nonatomic) IBOutlet UIView *subscriberView;

@property (strong, nonatomic) IBOutlet UIButton *videoHolder;
@property (strong, nonatomic) IBOutlet UIButton *callHolder;
@property (strong, nonatomic) IBOutlet UIButton *micHolder;

@property (strong, nonatomic) IBOutlet UILabel *connectingLabel;
@property (strong, nonatomic) IBOutlet UIButton *errorMessage;

@property (strong, nonatomic) IBOutlet UIButton *subscriberVideoButton;
@property (strong, nonatomic) IBOutlet UIButton *subscriberAudioButton;

- (void) setConnectingLabelAlpha:(NSInteger)alpha;

- (void) badQualityDisableVideo:(id)reason quiality_error:(id)reason_quiality_error;

-(void) publisherAddStyle;
@end

