import xml.etree.ElementTree as XML

class Global_conf():
    def __init__(self, xmlfile):
        self.tree = XML.parse(xmlfile)
        self.root = self.tree.getroot()
        self.protocols = self.root.find('appGroup')
        self.ruleids = self.root.find('ruleid')
        self.xmlfile = xmlfile

    def savexml(self):
        self.tree.write(self.xmlfile)

    def get_val(self,varName):
        return self.__dict__[varName].find('info').text

    def set_val(self,varName,varValue):
        self.__dict__[varName].find('info').text = varValue
