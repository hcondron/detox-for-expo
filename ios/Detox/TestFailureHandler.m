//
//  TestFailureHandler.m
//  Detox
//
//  Created by Tal Kol on 6/16/16.
//  Copyright © 2016 Wix. All rights reserved.
//

#import "TestFailureHandler.h"

@implementation TestFailureHandler

- (void)handleException:(GREYFrameworkException *)exception details:(NSString *)details
{
    NSLog(@"Detox Test Failed: %@", exception);
    if (self.delegate) [self.delegate onTestFailed:[exception description]];
}

- (void)setInvocationFile:(NSString *)fileName andInvocationLine:(NSUInteger)lineNumber
{
}

@end
