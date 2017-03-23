package com.tokbox.android.accpack.textchat.utils;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Random;
import java.util.Scanner;

public class TestUtils {

    public static String generateString(int length){

        StringBuilder tmp = new StringBuilder();
        for (char ch = '0'; ch <= '9'; ++ch)
            tmp.append(ch);
        for (char ch = 'a'; ch <= 'z'; ++ch)
            tmp.append(ch);
        char[] symbols = tmp.toString().toCharArray();
        char[] buf = new char[length];
        Random random = new Random();

        for (int idx = 0; idx < buf.length; ++idx)
            buf[idx] = symbols[random.nextInt(symbols.length)];
        return new String(buf);
    }

    public static Constructor getConstructor(Class<?> targetClass, Class<?>... parameterTypes) throws NoSuchMethodException {
        Constructor constructor = targetClass.getConstructor(parameterTypes);
        constructor.setAccessible(true);
        return constructor;
    }

    public static Method getPrivateMethod(Object target, String methodName, Class<?>... parameterTypes) throws NoSuchMethodException {
        Class targetClass = target.getClass();
        Method method = targetClass.getDeclaredMethod(methodName, parameterTypes);
        method.setAccessible(true);
        return method;
    }

    public static Field getPrivateField(Object target, String fieldName) throws NoSuchFieldException {
        Class targetClass = target.getClass();
        Field field = targetClass.getDeclaredField(fieldName);
        field.setAccessible(true);
        return field;
    }
}
