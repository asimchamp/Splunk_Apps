import os
import time
import subprocess
from sys import platform as _platform 

class CNCList:
    def __init__(self, cncFilePath, cncScriptPath):			
        self.cncFilePath = cncFilePath
        self.cncFileTime = time.ctime(os.path.getmtime(self.cncFilePath))
        if _platform == "linux" or _platform == "linux2" or _platform == "darwin":
            self.cncScriptPath = os.path.join(cncScriptPath, "download" + "." + "sh")
        else:
            self.cncScriptPath = os.path.join(cncScriptPath, "download" + "." + "bat")

    def downloadCNC(self):
        subprocess.call(self.cncScriptPath)
        self.cncFileTime = time.ctime(os.path.getmtime(self.cncFilePath))

