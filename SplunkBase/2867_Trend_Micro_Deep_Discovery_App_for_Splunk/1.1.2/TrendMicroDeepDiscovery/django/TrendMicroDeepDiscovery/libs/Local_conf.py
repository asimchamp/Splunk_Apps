import xml.etree.ElementTree as XML

class Local_conf():
    def __init__(self, xmlfile, *fields):
        self.xmlfile = xmlfile
        self.tree = XML.parse(xmlfile)
        self.root = self.tree.getroot()
        self.fields = {}
        for n in fields:
            self.fields.update({n:self.root.find(n)})

    def get_val(self,varName):
        return self.fields[varName].find('info').text

    def set_val(self,varName,varValue):
        self.fields[varName].find('info').text = varValue

    def savexml(self):
        self.tree.write(self.xmlfile)

