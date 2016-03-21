#import <UIKit/UIKit.h>
#import <Opentok/OpenTok.h>
#import "ViewController.h"

@interface OneToOneCommunication : UIViewController

// ===============================================================================================//
// TOGGLE ICONS VARIABLES
// ===============================================================================================//
@property (nonatomic) bool enable_call;
// ===============================================================================================//

@property (weak, nonatomic) ViewController *_viewController;

@property (readonly, nonatomic) NSMutableDictionary *configInfo;

@property (readonly, nonatomic) OTSubscriber *subscriber;
@property (readonly, nonatomic) OTPublisher *publisher;

- (instancetype)initWithData:(NSMutableDictionary *)configInfo view:(id)viewController;

- (void)doConnect;

- (void)doDisconnect;

@end
