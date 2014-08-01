from array import array
import struct

nums = [3.14, 1.59, 0.00001]
buf = struct.pack('<%sf' % len(nums), *nums)

output_file = open('test.bin', 'wb')
output_file.write(buf)
output_file.close()
