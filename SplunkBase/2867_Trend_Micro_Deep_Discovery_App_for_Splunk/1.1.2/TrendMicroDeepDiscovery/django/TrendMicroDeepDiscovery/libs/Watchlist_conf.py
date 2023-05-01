import xml.etree.ElementTree as XML
import csv
import json

hdr = ['interestedIp', 'Hostname', 'duser', 'Description']
hdr_src = ['src', 'shost', 'suser', 'Description']
hdr_dst = ['dst', 'dhost', 'duser', 'Description']
class Watchlist_conf():
    def __init__(self, watch_list_file):
        self.watch_array = []
        self.watch_list = {}
        self.watch_csv = ''
        with open(watch_list_file, 'rb') as csvfile:
            csvreader = csv.reader(csvfile, delimiter=',', quotechar='"')
            self.watch_list = json.dumps( [ row for row in csvreader ] )
            i = 0
            for row in csvreader:
                if (row[0] == hdr[0]):
                    continue
                i = i + 1
                typ = ""
                obj = ""
                if (row[0]):
                    obj = row[0]
                    typ = "IP"
                elif (row[1]):
                    obj = row[1]
                    typ = "Host"
                elif (row[2]):
                    obj = row[2]
                    typ = "Email"
                dsc = row[3]
                l1 = "t_" + str(i)
                l2 = "j_" + str(i)
                l3 = "d_" + str(i)
                self.watch_csv += (typ+',' + obj+',' +dsc+'|' ) 
                jrow = {'t':typ, 'j':obj, 'd':dsc}
                self.watch_array.append(jrow)

    def get_list(self):
        return self.watch_list

    def _save_1row(self, typ, obj, dsc):
        ip = ''
        host = ''
        email = ''
        desc = dsc
        if (typ == 'IP'):
            ip = obj
        if (typ == 'Host'):
            host = obj
        if (typ == 'Email'):
            email = obj
        self.csvwriter.writerow([ip,host,email,desc])

    def save_list(self, alist, watch_list_file):
        #write watch_list back to CSV file
        my = alist
        with open(watch_list_file, 'wb') as outcsvfile:
            self.csvwriter = csv.writer(outcsvfile, delimiter=',', quotechar='"')
            self.csvwriter.writerow([hdr[0], hdr[1], hdr[2], hdr[3]])
            self._save_1row(my['t_1'], my['j_1'], my['d_1'])
            self._save_1row(my['t_2'], my['j_2'], my['d_2'])
            self._save_1row(my['t_3'], my['j_3'], my['d_3'])
            self._save_1row(my['t_4'], my['j_4'], my['d_4'])
            self._save_1row(my['t_5'], my['j_5'], my['d_5'])
            self._save_1row(my['t_6'], my['j_6'], my['d_6'])
            self._save_1row(my['t_7'], my['j_7'], my['d_7'])
            self._save_1row(my['t_8'], my['j_8'], my['d_8'])
            self._save_1row(my['t_9'], my['j_9'], my['d_9'])
            self._save_1row(my['t_10'], my['j_10'], my['d_10'])
            self._save_1row(my['t_11'], my['j_11'], my['d_11'])
            self._save_1row(my['t_12'], my['j_12'], my['d_12'])
            self._save_1row(my['t_13'], my['j_13'], my['d_13'])
            self._save_1row(my['t_14'], my['j_14'], my['d_14'])
            self._save_1row(my['t_15'], my['j_15'], my['d_15'])
            self._save_1row(my['t_16'], my['j_16'], my['d_16'])
            self._save_1row(my['t_17'], my['j_17'], my['d_17'])
            self._save_1row(my['t_18'], my['j_18'], my['d_18'])
            self._save_1row(my['t_19'], my['j_19'], my['d_19'])
            self._save_1row(my['t_20'], my['j_20'], my['d_20'])
            self._save_1row(my['t_21'], my['j_21'], my['d_21'])
            self._save_1row(my['t_22'], my['j_22'], my['d_22'])
            self._save_1row(my['t_23'], my['j_23'], my['d_23'])
            self._save_1row(my['t_24'], my['j_24'], my['d_24'])
            self._save_1row(my['t_25'], my['j_25'], my['d_25'])

    def save_list_src(self, alist, watch_list_file):
        #write watch_list back to CSV file
        my = alist
        with open(watch_list_file, 'wb') as outcsvfile:
            self.csvwriter = csv.writer(outcsvfile, delimiter=',', quotechar='"')
            self.csvwriter.writerow([hdr_src[0], hdr_src[1], hdr_src[2], hdr_src[3]])
            self._save_1row(my['t_1'], my['j_1'], my['d_1'])
            self._save_1row(my['t_2'], my['j_2'], my['d_2'])
            self._save_1row(my['t_3'], my['j_3'], my['d_3'])
            self._save_1row(my['t_4'], my['j_4'], my['d_4'])
            self._save_1row(my['t_5'], my['j_5'], my['d_5'])
            self._save_1row(my['t_6'], my['j_6'], my['d_6'])
            self._save_1row(my['t_7'], my['j_7'], my['d_7'])
            self._save_1row(my['t_8'], my['j_8'], my['d_8'])
            self._save_1row(my['t_9'], my['j_9'], my['d_9'])
            self._save_1row(my['t_10'], my['j_10'], my['d_10'])
            self._save_1row(my['t_11'], my['j_11'], my['d_11'])
            self._save_1row(my['t_12'], my['j_12'], my['d_12'])
            self._save_1row(my['t_13'], my['j_13'], my['d_13'])
            self._save_1row(my['t_14'], my['j_14'], my['d_14'])
            self._save_1row(my['t_15'], my['j_15'], my['d_15'])
            self._save_1row(my['t_16'], my['j_16'], my['d_16'])
            self._save_1row(my['t_17'], my['j_17'], my['d_17'])
            self._save_1row(my['t_18'], my['j_18'], my['d_18'])
            self._save_1row(my['t_19'], my['j_19'], my['d_19'])
            self._save_1row(my['t_20'], my['j_20'], my['d_20'])
            self._save_1row(my['t_21'], my['j_21'], my['d_21'])
            self._save_1row(my['t_22'], my['j_22'], my['d_22'])
            self._save_1row(my['t_23'], my['j_23'], my['d_23'])
            self._save_1row(my['t_24'], my['j_24'], my['d_24'])
            self._save_1row(my['t_25'], my['j_25'], my['d_25'])

    def save_list_dst(self, alist, watch_list_file):
        #write watch_list back to CSV file
        my = alist
        with open(watch_list_file, 'wb') as outcsvfile:
            self.csvwriter = csv.writer(outcsvfile, delimiter=',', quotechar='"')
            self.csvwriter.writerow([hdr_dst[0], hdr_dst[1], hdr_dst[2], hdr_dst[3]])
            self._save_1row(my['t_1'], my['j_1'], my['d_1'])
            self._save_1row(my['t_2'], my['j_2'], my['d_2'])
            self._save_1row(my['t_3'], my['j_3'], my['d_3'])
            self._save_1row(my['t_4'], my['j_4'], my['d_4'])
            self._save_1row(my['t_5'], my['j_5'], my['d_5'])
            self._save_1row(my['t_6'], my['j_6'], my['d_6'])
            self._save_1row(my['t_7'], my['j_7'], my['d_7'])
            self._save_1row(my['t_8'], my['j_8'], my['d_8'])
            self._save_1row(my['t_9'], my['j_9'], my['d_9'])
            self._save_1row(my['t_10'], my['j_10'], my['d_10'])
            self._save_1row(my['t_11'], my['j_11'], my['d_11'])
            self._save_1row(my['t_12'], my['j_12'], my['d_12'])
            self._save_1row(my['t_13'], my['j_13'], my['d_13'])
            self._save_1row(my['t_14'], my['j_14'], my['d_14'])
            self._save_1row(my['t_15'], my['j_15'], my['d_15'])
            self._save_1row(my['t_16'], my['j_16'], my['d_16'])
            self._save_1row(my['t_17'], my['j_17'], my['d_17'])
            self._save_1row(my['t_18'], my['j_18'], my['d_18'])
            self._save_1row(my['t_19'], my['j_19'], my['d_19'])
            self._save_1row(my['t_20'], my['j_20'], my['d_20'])
            self._save_1row(my['t_21'], my['j_21'], my['d_21'])
            self._save_1row(my['t_22'], my['j_22'], my['d_22'])
            self._save_1row(my['t_23'], my['j_23'], my['d_23'])
            self._save_1row(my['t_24'], my['j_24'], my['d_24'])
            self._save_1row(my['t_25'], my['j_25'], my['d_25'])

    def get_csv(self):
        return self.watch_csv

    def get_array(self):
        return self.watch_array

