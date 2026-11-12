from pathlib import Path
import cv2,numpy as np,onnxruntime as ort
from PIL import Image
P=Path(__file__).parent;R=P.parents[1]
o=ort.SessionOptions();o.intra_op_num_threads=4;o.inter_op_num_threads=1
s=ort.InferenceSession(str(R/'.sementara/u2net/birefnet-portrait.onnx'),sess_options=o,providers=['CPUExecutionProvider'])
c=cv2.VideoCapture('D:/KERJAAN/CONTENT CREATOR/NAZARVERSE/GROWING MEANS.mp4')
for t in [3,39]:
    c.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,bgr=c.read();assert ok
    im=Image.fromarray(cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB));x=np.asarray(im.resize((1024,1024))).astype(np.float32)/255
    x=((x-np.array([.485,.456,.406]))/np.array([.229,.224,.225])).transpose(2,0,1)[None].astype(np.float32)
    y=s.run(None,{s.get_inputs()[0].name:x})[0][0,0];y=1/(1+np.exp(-np.clip(y,-80,80)));y=(y-y.min())/max(y.max()-y.min(),1e-6)
    mask=Image.fromarray(np.uint8(y*255)).resize(im.size,Image.Resampling.LANCZOS);im.putalpha(mask)
    im.crop((0,360,478,815)).save(P/f'hyperframes/assets/talent-{t}.png');print(t,flush=True)
