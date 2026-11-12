from pathlib import Path
import cv2,numpy as np,onnxruntime as ort
from PIL import Image
P=Path(__file__).parent;ROOT=P.parents[1]
opts=ort.SessionOptions();opts.intra_op_num_threads=4
s=ort.InferenceSession(str(ROOT/'.sementara/rvm_mobilenetv3_fp32.onnx'),sess_options=opts,providers=['CPUExecutionProvider'])
c=cv2.VideoCapture('D:/KERJAAN/CONTENT CREATOR/NAZARVERSE/GROWING MEANS.mp4')
for t in [3,39]:
    c.set(cv2.CAP_PROP_POS_FRAMES,int(t*30)-30);rec=[np.zeros((1,1,1,1),np.float32) for _ in range(4)]
    for i in range(31):
        ok,bgr=c.read();assert ok;rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)
        f,a,*rec=s.run(None,dict(src=rgb.transpose(2,0,1)[None].astype(np.float32)/255,**{f'r{j+1}i':v for j,v in enumerate(rec)},downsample_ratio=np.array([.6],np.float32)))
    rgba=np.dstack((np.uint8(np.clip(f[0].transpose(1,2,0),0,1)*255),np.uint8(np.clip((a[0,0]-.015)/.985,0,1)*255)))
    Image.fromarray(rgba[360:815]).save(P/f'hyperframes/assets/talent-{t}.png')
print('pilot ready')
