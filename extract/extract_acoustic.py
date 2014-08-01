import scipy.io
import math
import json
import struct

print "Loading .MAT file"
acoustic = scipy.io.loadmat('../acousticdata/EC2.CV.B1_8_9_15_76_89_105.align2.aud.mat')

formants =  acoustic['formantY']
nums = formants.reshape(scipy.size(formants))
buf = struct.pack('<%sf' % len(nums), *nums)
o = open("formants.bin", 'wb')
o.write(buf)
o.close()

wlist = [w[0] for w in acoustic['wlist'][0,:]]
labs = [wlist[x-1] for x in acoustic['labs'][0,:]]
categories = [{'consonant': v[:-2], 'vowel': v[-1].replace("O", "U").replace("E", "I")} for v in labs]
json.dump(categories, open("categories.json", "w"))
