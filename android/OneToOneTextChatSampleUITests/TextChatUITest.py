#!/usr/bin/python

import sys
import unittest
import os
import random
import string
from random import randint
from appium import webdriver
from time import sleep

class TextChatUITest(unittest.TestCase):

    baseLayout = '//android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup[1]/android.widget.RelativeLayout[1]'
    msgLayout = baseLayout + '/android.widget.FrameLayout[1]/android.widget.RelativeLayout[1]/android.widget.LinearLayout[1]/android.support.v7.widget.RecyclerView[1]/android.widget.RelativeLayout[1]/android.widget.LinearLayout[1]/android.widget.TextView[2]'
    tcLayout = baseLayout + '/android.widget.FrameLayout[1]/android.widget.RelativeLayout[1]'
    controlLayout = '/android.widget.RelativeLayout[4]/android.widget.RelativeLayout[1]/android.widget.RelativeLayout[1]'
    permissionsLayout = '//android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/android.widget.LinearLayout[1]/android.widget.Button[2]'

    baseControls = [2, 1, 3, 4]
    callStarted = False

    def random_text_generator(self, size, chars=string.ascii_uppercase + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))

    def get_button_name(self, xpstr):
        return self.driver.find_element_by_xpath(xpstr).get_attribute('name')

    def get_element_text(self, xpstr):
        return self.driver.find_element_by_xpath(xpstr).get_attribute('text')

    def click_send():
        return self.driver.tap(1,1002,1684,1)

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
                'appPackage': packageName
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

    def test_send_message(self):
        control = list(self.controlLayout)[len(self.controlLayout)-2] = baseControls[3]
        msg = self.random_text_generator(random.randint(50, 150))
        self.click_control('xpath', self.baseLayout.join(control))
        self.send_keys('xpath', self.tcLayout + '/android.widget.RelativeLayout[2]/android.widget.RelativeLayout[1]/android.widget.EditText[1]', msg)
        self.click_send()
        self.assertEquals(msg, self.get_element_text(self.msgLayout))
        self.click_control('xpath', self.tcLayout + '/android.widget.RelativeLayout[1]/android.widget.ImageButton[1]')

if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(TextChatUITest)
    unittest.TextTestRunner(verbosity=2).run(suite)
