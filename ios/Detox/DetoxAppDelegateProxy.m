//
//  DetoxAppDelegateProxy.m
//  Detox
//
//  Created by Leo Natan (Wix) on 19/01/2017.
//  Copyright © 2017 Wix. All rights reserved.
//

#import "DetoxAppDelegateProxy.h"
@import ObjectiveC;
@import UIKit;
@import UserNotifications;
@import COSTouchVisualizer;

#import <Detox/Detox-Swift.h>

@class DetoxAppDelegateProxy;

static DetoxAppDelegateProxy* _currentAppDelegateProxy;
static COSTouchVisualizerWindow* _touchVisualizerWindow;

@interface UIWindow (DTXEventProxy) @end

@implementation UIWindow (DTXEventProxy)

+ (void)load
{
	static dispatch_once_t onceToken;
	dispatch_once(&onceToken, ^{
		Method m1 = class_getInstanceMethod(self, @selector(sendEvent:));
		Method m2 = class_getInstanceMethod(self, @selector(__dtx_sendEvent:));
		method_exchangeImplementations(m1, m2);
	});
}

- (void)__dtx_sendEvent:(UIEvent *)event
{
	if([self isKindOfClass:[COSTouchVisualizerWindow class]])
	{
		return;
	}
	
	[_touchVisualizerWindow sendEvent:event];
	[self __dtx_sendEvent:event];
}

@end

@interface DetoxAppDelegateProxy () <UIApplicationDelegate, COSTouchVisualizerWindowDelegate> @end

@implementation DetoxAppDelegateProxy

+ (instancetype)currentAppDelegateProxy
{
	return _currentAppDelegateProxy;
}

static void __copyMethods(Class orig, Class target)
{
	//Copy class methods
	Class targetMetaclass = object_getClass(target);
	
	unsigned int methodCount = 0;
	Method *methods = class_copyMethodList(object_getClass(orig), &methodCount);
	
	for (unsigned int i = 0; i < methodCount; i++)
	{
		Method method = methods[i];
		if(strcmp(sel_getName(method_getName(method)), "load") == 0 || strcmp(sel_getName(method_getName(method)), "initialize") == 0)
		{
			continue;
		}
		class_addMethod(targetMetaclass, method_getName(method), method_getImplementation(method), method_getTypeEncoding(method));
	}
	
	free(methods);
	
	//Copy instance methods
	methods = class_copyMethodList(orig, &methodCount);
	
	for (unsigned int i = 0; i < methodCount; i++)
	{
		Method method = methods[i];
		class_addMethod(target, method_getName(method), method_getImplementation(method), method_getTypeEncoding(method));
	}
	
	free(methods);
}

+ (void)load
{
	Method m = class_getInstanceMethod([UIApplication class], @selector(setDelegate:));
	void (*orig)(id, SEL, id<UIApplicationDelegate>) = (void*)method_getImplementation(m);
	method_setImplementation(m, imp_implementationWithBlock(^ (id _self, id<UIApplicationDelegate, COSTouchVisualizerWindowDelegate> origDelegate) {
		//Only create a dupe class if the provided instance is not already a dupe class.
		if(origDelegate != nil && [origDelegate respondsToSelector:@selector(__dtx_canaryInTheCoalMine)] == NO)
		{
			NSString* clsName = [NSString stringWithFormat:@"%@(%@)", NSStringFromClass([origDelegate class]), NSStringFromClass([DetoxAppDelegateProxy class])];
			Class cls = objc_getClass(clsName.UTF8String);
			
			if(cls == nil)
			{
				cls = objc_allocateClassPair(origDelegate.class, clsName.UTF8String, 0);
				__copyMethods([DetoxAppDelegateProxy class], cls);
				objc_registerClassPair(cls);
			}
			
			object_setClass(origDelegate, cls);
			
			[[NSNotificationCenter defaultCenter] addObserver:origDelegate selector:@selector(__dtx_applicationDidLaunchNotification:) name:UIApplicationDidFinishLaunchingNotification object:nil];
		}
		
		_currentAppDelegateProxy = origDelegate;
		orig(_self, @selector(setDelegate:), origDelegate);
	}));
}

- (void)__dtx_canaryInTheCoalMine {}

- (void)__dtx_applicationDidLaunchNotification:(NSNotification*)notification
{
	[self.__dtx_userNotificationDispatcher dispatchOnAppDelegate:self simulateDuringLaunch:YES];

	dispatch_async(dispatch_get_main_queue(), ^{
		_touchVisualizerWindow = [[COSTouchVisualizerWindow alloc] initWithFrame:UIScreen.mainScreen.bounds];
		_touchVisualizerWindow.windowLevel = 100000000000;
		_touchVisualizerWindow.backgroundColor = [UIColor.greenColor colorWithAlphaComponent:0.0];
		_touchVisualizerWindow.hidden = NO;
		_touchVisualizerWindow.touchVisualizerWindowDelegate = self;
		_touchVisualizerWindow.userInteractionEnabled = NO;
	});
}

- (NSURL*)_userNotificationDataURL
{
	NSString* userNotificationDataPath = [[NSUserDefaults standardUserDefaults] objectForKey:@"detoxUserNotificationDataURL"];
	
	if(userNotificationDataPath == nil)
	{
		return nil;
	}
	
	return [NSURL fileURLWithPath:userNotificationDataPath];
}

- (NSURL*)_URLOverride
{
	return [NSURL URLWithString:[[NSUserDefaults standardUserDefaults] objectForKey:@"detoxURLOverride"]];
}

- (NSString*)_sourceAppOverride
{
	return [[NSUserDefaults standardUserDefaults] objectForKey:@"detoxSourceAppOverride"];
}

- (NSDictionary*)_prepareLaunchOptions:(NSDictionary*)launchOptions userNotificationDispatcher:(DetoxUserNotificationDispatcher*)dispatcher
{
	NSMutableDictionary* rv = [launchOptions mutableCopy] ?: [NSMutableDictionary new];
	
	if(dispatcher)
	{
		rv[UIApplicationLaunchOptionsRemoteNotificationKey] = [dispatcher remoteNotification];
	}
	else
	{
		NSURL* openURLOverride = [self _URLOverride];
		if(openURLOverride)
		{
			rv[UIApplicationLaunchOptionsURLKey] = openURLOverride;
		}
		NSString* originalAppOverride = [self _sourceAppOverride];
		if(originalAppOverride)
		{
			rv[UIApplicationLaunchOptionsSourceApplicationKey] = originalAppOverride;
		}
	}
	
	return rv;
}

- (DetoxUserNotificationDispatcher*)__dtx_userNotificationDispatcher
{
	DetoxUserNotificationDispatcher* rv = objc_getAssociatedObject(self, _cmd);
	
	if([self _userNotificationDataURL])
	{
		rv = [[DetoxUserNotificationDispatcher alloc] initWithUserNotificationDataURL:[self _userNotificationDataURL]];
		objc_setAssociatedObject(self, _cmd, rv, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
	}
	
	return rv;
}

- (BOOL)application:(UIApplication *)application willFinishLaunchingWithOptions:(nullable NSDictionary<UIApplicationLaunchOptionsKey, id>*)launchOptions
{
	launchOptions = [self _prepareLaunchOptions:launchOptions userNotificationDispatcher:self.__dtx_userNotificationDispatcher];
	
	BOOL rv = YES;
	if([class_getSuperclass(object_getClass(self)) instancesRespondToSelector:_cmd])
	{
		struct objc_super super = {.receiver = self, .super_class = class_getSuperclass(object_getClass(self))};
		BOOL (*super_class)(struct objc_super*, SEL, id, id) = (void*)objc_msgSendSuper;
		rv = super_class(&super, _cmd, application, launchOptions);
	}
	
	return rv;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(nullable NSDictionary<UIApplicationLaunchOptionsKey, id> *)launchOptions
{
	launchOptions = [self _prepareLaunchOptions:launchOptions userNotificationDispatcher:self.__dtx_userNotificationDispatcher];
	
	BOOL rv = YES;
	if([class_getSuperclass(object_getClass(self)) instancesRespondToSelector:_cmd])
	{
		struct objc_super super = {.receiver = self, .super_class = class_getSuperclass(object_getClass(self))};
		BOOL (*super_class)(struct objc_super*, SEL, id, id) = (void*)objc_msgSendSuper;
		rv = super_class(&super, _cmd, application, launchOptions);
	}
	
	if(self.__dtx_userNotificationDispatcher == nil && [self _URLOverride] && [class_getSuperclass(object_getClass(self)) instancesRespondToSelector:@selector(application:openURL:options:)])
	{
		[self application:application openURL:[self _URLOverride] options:launchOptions];
	}
	
	return rv;
}

- (BOOL)touchVisualizerWindowShouldAlwaysShowFingertip:(COSTouchVisualizerWindow *)window
{
	return YES;
}

@end
