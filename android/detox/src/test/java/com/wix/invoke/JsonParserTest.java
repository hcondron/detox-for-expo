package com.wix.invoke;

import com.wix.invoke.parser.JsonParser;
import com.wix.invoke.types.ClassTarget;
import com.wix.invoke.types.Invocation;
import com.wix.invoke.types.InvocationTarget;

import org.junit.Test;

import static org.assertj.core.api.Java6Assertions.assertThat;

/**
 * Created by rotemm on 13/10/2016.
 */
public class JsonParserTest {

    @Test
    public void targetClassStaticMethodNoParams() {
        Invocation invocation = new Invocation(new ClassTarget("java.lang.System"), "lineSeparator");
        assertThat(parse("targetClassStaticMethodNoParams.json")).isEqualToComparingFieldByFieldRecursively(invocation);
    }

    @Test
    public void parseTargetClassStaticMethodOneParam() {
        Invocation invocation = new Invocation(new ClassTarget("java.lang.String"), "valueOf", 1.0f);
        assertThat(parse("targetClassStaticMethodOneParam.json")).isEqualToComparingFieldByFieldRecursively(invocation);
    }

    @Test
    public void targetInvocationMethodOfClassStaticMethodOneParam() {
        Invocation innerInvocation = new Invocation(new ClassTarget("java.lang.String"), "valueOf", 1.0f);
        Invocation outerInvocation = new Invocation(new InvocationTarget(innerInvocation), "length");
        assertThat(parse("targetInvocationMethodOfClassStaticMethodOneParam.json")).isEqualToComparingFieldByFieldRecursively(outerInvocation);
    }

//    @Test
//    public void fromJsonTargetInvocationEspresso() {
////        Espresso.onView(DetoxMatcher.matcherForContentDescription("Sanity")).perform(ViewActions.click());
//        Invocation matcher = new Invocation(new ClassTarget("com.wix.detox.espresso.DetoxMatcher"), "matcherForContentDescription", "Sanity");
//        Invocation onView = new Invocation(new ClassTarget("android.support.test.espresso.Espresso"), "onView", matcher);
//        Invocation click = new Invocation(new ClassTarget("android.support.test.espresso.action.ViewActions"), "click");
//        Invocation perform = new Invocation(new InvocationTarget(onView), "perform", click);
//
//
//        assertThat(parse("targetInvocationEspresso.json")).isEqualToComparingFieldByFieldRecursively(perform);
//    }

    public Invocation parse(String filePath) {
        String jsonData = TestUtils.jsonFileToString(filePath);
        return new JsonParser().parse(jsonData, Invocation.class);
    }
}