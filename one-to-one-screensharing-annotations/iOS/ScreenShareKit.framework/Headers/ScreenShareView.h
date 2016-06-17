//
//  ScreenShareView.h
//  ScreenShareSample
//
//  Created by Xi Huang on 4/26/16.
//  Copyright © 2016 Lucas Huang. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <ScreenShareKit/AnnotationTextView.h>

@interface ScreenShareView : UIView

+ (instancetype)view;

- (void)addContentView:(UIView *)view;

@property (nonatomic, getter = isAnnotating) BOOL annotating;

- (void)addTextAnnotation:(AnnotationTextView *)annotationTextView;

- (void)selectColor:(UIColor *)selectedColor;

- (UIImage *)captureScreen;

- (void)erase;

@end