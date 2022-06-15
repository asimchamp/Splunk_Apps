from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
import unittest, time, re
###### STEP 1
### Include the splunktransactions module in your script
from splunktransactions import Transaction

class GoogleTest(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()

        # replace the above line with the below line to run as Safari
        # Safari driver needs to be downloaded
        #self.driver = webdriver.Safari()
        self.driver.implicitly_wait(30)
        self.base_url = "https://www.google.com/"
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_google(self):
        driver = self.driver

        ###### STEP 2
        ### Provide a name to your Application eg. 'Google'
        a=Transaction(driver, 'Google')

        ###### STEP 3
        ### assign a name to the transaction by defining a start and an end 
        a.TransactionStart(driver, 'Google Home Page')
        driver.get(self.base_url + "/")
        #time.sleep(1)
        a.TransactionEnd(driver, 'Google Home Page')
        time.sleep(4)
        ###### STEP 4
        ### Repeat Step 3 and 4 as needed for as many transactions as needed
        a.TransactionStart(driver, 'Search Splunk')
        driver.find_element_by_id("gbqfq").clear()
        driver.find_element_by_id("gbqfq").send_keys("splunk")
        driver.find_element_by_id("gbqfb").click()
        time.sleep(1)
        driver.find_element_by_xpath("//a[@id='vs0p1']/b[2]").click()
        a.TransactionEnd(driver, 'Search Splunk')
        time.sleep(2)
    
    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
