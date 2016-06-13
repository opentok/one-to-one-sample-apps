//
//  ScreenShareToolBarView.h
//  ScreenShareSample
//
//  Created by Xi Huang on 5/10/16.
//  Copyright © 2016 Lucas Huang. All rights reserved.
//

#import <ScreenShareKit/ScreenShareView.h>

@interface ScreenShareToolbarView : UIView

@property (readonly, nonatomic) ScreenShareView *screenShareView;

+ (instancetype)toolbar;

@end
