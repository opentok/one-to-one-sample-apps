//
//  Annotatable.h
//  ScreenShareSample
//
//  Created by Xi Huang on 5/18/16.
//  Copyright © 2016 Lucas Huang. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol Annotatable <NSObject>

@optional
- (void)commit;
@end
