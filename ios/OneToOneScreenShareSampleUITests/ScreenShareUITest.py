#!/usr/bin/python

import sys
import unittest
import os
import random
import string
from random import randint
from appium import webdriver
from time import sleep

class ScreenShareUITest(unittest.TestCase):

    baseLayout = '//UIAApplication[1]/UIAWindow[1]'
    controlLayout = '/UIAButton[X]'
    ssLayout = '//UIAApplication[1]/UIAWindow[1]/UIAActionSheet[1]/UIACollectionView[1]/UIACollectionCell[1]/UIAButton[1]'
    baseControls = [5, 3, 4, 6]
    baseText = [5, 6, 7, 9]
    callStarted = False

    def random_text_generator(self, size, chars=string.ascii_uppercase + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))

    def get_button_name(self, xpstr):
        return self.driver.find_element_by_xpath(xpstr).get_attribute('name')

    def click_control(self, searchmode, value):
        if searchmode == 'xpath':
            self.driver.find_element_by_xpath(value).click()
        elif searchmode == 'className':
            self.driver.find_elements_by_class_name(value).click()

    def send_keys(self, searchmode, value, text):
        if searchmode == 'xpath':
            self.driver.find_element_by_xpath(value).send_keys(text)
        elif searchmode == 'className':
            self.driver.find_elements_by_class_name(value).send_keys(text);

    def setUp(self):
        app = os.path.abspath(sys.argv[2])
        platform = sys.argv[4]
        platformVersion = sys.argv[6]
        deviceName = sys.argv[8]
        packageName = sys.argv[10]
        self.driver = webdriver.Remote(
            command_executor='http://127.0.0.1:4723/wd/hub',
            desired_capabilities={
                'app': app,
                'platformName': platform,
                'platformVersion': platformVersion,
                'deviceName': deviceName,
                'bundleId': packageName
            })

    def tearDown(self):
        control = list(self.controlLayout)[len(self.controlLayout)-2] = baseControls[0]
        self.click_control('xpath', self.baseLayout.join(control))
        self.driver.quit()

    def test_start_call(self):
        control = list(self.controlLayout)[len(self.controlLayout)-2] = baseControls[0]
        if callStarted:
            self.assertEquals('hangUp', self.get_button_name(self.baseLayout.join(control)))
            self.click_control('xpath', self.baseLayout.join(control))
            self.assertEquals('startCall', self.get_button_name(self.baseLayout.join(control)))
            callStarted = False
        else:
            self.assertEquals('startCall', self.get_button_name(self.baseLayout.join(control)))
            self.click_control('xpath', self.baseLayout.join(control))
            self.assertEquals('hangUp', self.get_button_name(self.baseLayout.join(control)))
            callStarted = True

    def test_enabledisable_video(self):
        control = list(self.controlLayout)[len(self.controlLayout)-2] = baseControls[1]
        if callStarted:
            self.assertEquals('video', self.get_button_name(self.baseLayout.join(control)))
            self.click_control('xpath', self.baseLayout.join(control))
            self.assertEquals('noVideo', self.get_button_name(self.baseLayout.join(control)))
        else:
            self.assertEquals('noVideo', self.get_button_name(self.baseLayout.join(control)))
            self.click_control('xpath', self.baseLayout.join(control))
            self.assertEquals('video', self.get_button_name(self.baseLayout.join(control)))

    def test_enabledisable_mic(self):
        control = list(self.controlLayout)[len(self.controlLayout)-2] = baseControls[2]
        if callStarted:
            self.assertEquals('mic', self.get_button_name(self.baseLayout.join(control)))
            self.click_control('xpath', self.baseLayout.join(control))
            self.assertEquals('mutedMic', self.get_button_name(self.baseLayout.join(control)))
        else:
            self.assertEquals('mutedMic', self.get_button_name(self.baseLayout.join(control)))
            self.click_control('xpath', self.baseLayout.join(control))
            self.assertEquals('mic', self.get_button_name(self.baseLayout.join(control)))

    def test_enable_screensharing(self):
        control = list(self.controlLayout)[len(self.controlLayout)-2] = baseControls[3]
        if callStarted:
            self.click_control('xpath', self.baseLayout.join(control))
            self.assertTrue(self.driver.find_elements_by_xpath(self.ssLayout))
        else:
            self.click_control('xpath', self.baseLayout.join(control))
            self.assertTrue(not self.driver.find_elements_by_xpath(self.ssLayout))

    def test_strings_are_ok(self):
        text = list(self.textLayout)[len(self.textLayout)-2] = baseText[0]
        self.assertEquals('Video', self.get_button_name(self.baseLayout.join(text)))
        text = list(self.textLayout)[len(self.textLayout)-2] = baseText[1]
        self.assertEquals('Mic', self.get_button_name(self.baseLayout.join(text)))
        text = list(self.textLayout)[len(self.textLayout)-2] = baseText[2]
        self.assertEquals('Call', self.get_button_name(self.baseLayout.join(text)))
        text = list(self.textLayout)[len(self.textLayout)-2] = baseText[3]
        self.assertEqual('Screen Share', self.get_button_name(self.baseLayout.join(text)))

if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(ScreenShareUITest)
    unittest.TextTestRunner(verbosity=2).run(suite)
