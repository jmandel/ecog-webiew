import scipy.io
import math
import json
import struct

print "Loading .MAT file"
ecog = scipy.io.loadmat('../neuraldata/EC2.CV.B1_8_9_15_76_89_105.align2.neural.mat')
neural =  ecog['neuralY']

for i in range(len(neural)):
    print "Exporting electrode %s"%i
    nums = neural[i,:,:].reshape(scipy.size(neural[i,:,:]))
    buf = struct.pack('<%sf' % len(nums), *nums)
    o = open("neurals_%03d.bin"%i, 'wb')
    o.write(buf)
    o.close()

