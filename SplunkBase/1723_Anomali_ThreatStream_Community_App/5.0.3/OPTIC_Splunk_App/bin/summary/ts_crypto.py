from pyaes.aes import AESModeOfOperationCTR

def enc(clearFilename,encFilename,key, chunkSize=8192):
    aes = AESModeOfOperationCTR(key)
    with open(clearFilename,'rb')as clear:
        with open(encFilename,'wb')as enc:
            while True:
                chunk=clear.read(chunkSize)
                if len(chunk)==0:break
                enc.write(aes.encrypt(chunk))

def dec(encFilename,decFilename,key, chunkSize=8192):
    aes = AESModeOfOperationCTR(key)
    with open(encFilename,'rb')as enc:
        with open(decFilename,'wb')as dec:
            while True:
                chunk=enc.read(chunkSize)
                if len(chunk)==0:break
                dec.write(aes.decrypt(chunk))
