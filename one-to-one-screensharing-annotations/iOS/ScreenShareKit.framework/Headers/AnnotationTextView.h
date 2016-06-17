//
//  ScreenShareTextView.h
//  ScreenShareSample
//
//  Created by Xi Huang on 4/27/16.
//  Copyright © 2016 Lucas Huang. All rights reserved.
//

#import <ScreenShareKit/Annotatable.h>

@interface AnnotationTextView: UITextView <Annotatable>

+ (instancetype)defaultWithTextColor:(UIColor *)textColor;

- (instancetype)initWithText:(NSString *)text
                   textColor:(UIColor *)textColor
                    fontSize:(CGFloat)fontSize;

- (void)commit;
@end
