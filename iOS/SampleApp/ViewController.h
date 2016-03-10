#import <UIKit/UIKit.h>

@interface ViewController : UIViewController

@property (strong, nonatomic) IBOutlet UIView *publisherView;
@property (strong, nonatomic) IBOutlet UIView *subscriberView;

@property (strong, nonatomic) IBOutlet UIView *videoHolder;
@property (strong, nonatomic) IBOutlet UIView *callHolder;
@property (strong, nonatomic) IBOutlet UIView *micHolder;

@property (strong, nonatomic) IBOutlet UIButton *toggleCallButton;
@property (strong, nonatomic) IBOutlet UILabel *connectingLabel;
@property (strong, nonatomic) IBOutlet UIButton *errorMessage;

- (void) adjustViewsForOrientation;

- (void) setConnectingLabelAlpha:(NSInteger)alpha;

- (void) adjustViewsForOrientation:(UIInterfaceOrientation)orientation;
@end

