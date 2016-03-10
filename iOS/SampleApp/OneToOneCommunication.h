#import <UIKit/UIKit.h>
#import <Opentok/OpenTok.h>
#import "ViewController.h"

@interface OneToOneCommunication : UIViewController

// ===============================================================================================//
// TOGGLE ICONS VARIABLES
// ===============================================================================================//
@property (nonatomic) bool enable_call;
// ===============================================================================================//

@property (nonatomic) ViewController *_viewController;

@property (strong, nonatomic) NSMutableDictionary *configInfo;
@property (strong, nonatomic) OTSubscriber *subscriber;
@property (strong, nonatomic) OTPublisher *publisher;

- (id)initWithData:(NSMutableDictionary *)configInfo view:(id)viewController;

- (void)doConnect;

- (void)doDisconnect;
@end
