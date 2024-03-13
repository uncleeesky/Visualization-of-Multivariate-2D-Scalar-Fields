import h5py
import numpy as np
import matplotlib.pyplot as plt
import glob 
import cv2
import matplotlib as mpl
import pydicom

# transfer dcm files into hdf5 files
def export_pixel_array(in_file, out_file, dataset_name="data"):
    pixel_array = pydicom.read_file(in_file).pixel_array
    h5 = h5py.File(out_file,'w')
    h5.create_dataset(dataset_name, data=pixel_array)
    h5.close()
export_pixel_array('./src/server/ID_0000_AGE_0060_CONTRAST_1_CT.dcm','./src/server/test.h5')
ds = pydicom.dcmread('./src/server/ileitis_unspecific_20_0000.dic')

# transfer dcm files into hdf5 files
data = np.array(ds.pixel_array)
f = h5py.File('./src/server/HDF5_FILE.h5','w')   
f['data'] = data                 
f['labels'] = range(100)            
f.close() 

# Load the data
hf = h5py.File("./src/server/Brats2018_validation_data_sep_channels_train_val_mix.h5", 'r')
val_data = hf['data'][()]     
val_label = hf['label'][()]     
hf.close()
# Normalize the data
for i in range(len(val_data)):
	for j in range(4):
		val_data[i,j,:,:] =(val_data[i,j,:,:] - np.min(val_data[i,j,:,:])) / (np.max(val_data[i,j,:,:]) - np.min(val_data[i,j,:,:]))
# Four medical image modalities
val_t1 = val_data[:,0,:,:]
val_t2= val_data[:,1,:,:]
val_t1ce = val_data[:,2,:,:]
val_flair = val_data[:,3,:,:]
val_label = val_label



# create own transfer function
colors = ['white', 'blue', 'cyan', 'Lime','yellow'] 
cmap = mpl.colors.ListedColormap(colors)




plt.axis('off')
# use pyplot's default viridis color scale
plt.imshow(val_t1[0,:,:])
plt.savefig('./dist/client/img/MRI_1.png',bbox_inches='tight',pad_inches=0.0)
plt.imshow(val_t2[0,:,:])
plt.savefig('./dist/client/img/MRI_t2.png',bbox_inches='tight',pad_inches=0.0)
# use own transfer function
plt.imshow(val_t1[0,:,:], cmap=cmap)
plt.savefig('./dist/client/img/MRI_2.png',bbox_inches='tight',pad_inches=0.0)
plt.imshow(val_flair[0,:,:])
plt.savefig('./dist/client/img/MRI_flair.png',bbox_inches='tight',pad_inches=0.0)
# use gray-scale map
plt.imshow(val_t1[0,:,:], cmap='gray')
plt.savefig('./dist/client/img/MRI_gray.png',bbox_inches='tight',pad_inches=0.0)
plt.imshow(val_flair[0,:,:], cmap='gray')
plt.savefig('./dist/client/img/MRI_flgray.png',bbox_inches='tight',pad_inches=0.0)
plt.imshow(val_t2[0,:,:], cmap='gray')
plt.savefig('./dist/client/img/MRI_t2gray.png',bbox_inches='tight',pad_inches=0.0)
plt.imshow(val_t1ce[0,:,:], cmap='gray')
plt.savefig('./dist/client/img/MRI_t1cegray.png',bbox_inches='tight',pad_inches=0.0)
# create MRI img from first dataset

# load data
hf1 = h5py.File("./src/server/test.h5", 'r')
val_data = hf1['data'][()]     #`data` is now an ndarray
hf1.close()

# create images
plt.imshow(val_data)
plt.savefig('./dist/client/img/CT_1.png',bbox_inches='tight',pad_inches=0.0)
plt.imshow(val_data, cmap=cmap)
plt.savefig('./dist/client/img/CT_2.png',bbox_inches='tight',pad_inches=0.0)
plt.imshow(val_data, cmap='gray')
plt.savefig('./dist/client/img/CT_gray.png',bbox_inches='tight',pad_inches=0.0)

# load data from another hdf5
hf2 = h5py.File("./src/server/HDF5_FILE.h5", 'r')
val_data1 = hf2['data'][()]   
val_t1 = val_data1[3,:,:]
hf2.close()
plt.imshow(val_t1[:,:,0])
plt.savefig('./dist/client/img/US_1.png',bbox_inches='tight',pad_inches=0.0)
plt.imshow(val_t1[:,:,0], cmap=cmap)
plt.savefig('./dist/client/img/US_2.png',bbox_inches='tight',pad_inches=0.0)
plt.imshow(val_t1[:,:,0], cmap='gray')
plt.savefig('./dist/client/img/US_gray.png',bbox_inches='tight',pad_inches=0.0)

# calclate the bump map of images
# this method is basically coloned from Run_Clover's blog python opencv implements image generation bump map
# https://blog.csdn.net/KEEPace_6/article/details/125878140
# accessed at 24.12.2023
def CalcBumpmap(path):
    # construct converce matrix
    def ConvMatrix(data, kernel):
        dst = cv2.filter2D(data, -1, kernel)
        return dst
    # rescale the image
    def Rescale(data):
        minV = np.min(data)
        maxV = np.max(data)
        data = (data - minV) / (maxV - minV)
        return data
    # calculate normal vectors
    def Bumpmap(img):

        H,W = img.shape
        bumpmap = np.zeros((H,W,3))
        img = img.astype(np.float)
        kernelNx = np.array([[0, 0, 0], [0, -1, 1], [0, 0, 0]], dtype=np.float)  
        kernelNy = np.array([[0, 0, 0], [0, -1, 0], [0, 1, 0]],
                            dtype=np.float)  
        Xgradient = ConvMatrix(img, kernelNx)
        Ygradient = ConvMatrix(img, kernelNy)
        Xgradient = Rescale(abs(Xgradient))
        Ygradient = Rescale(abs(Ygradient))
        bumpnorm = np.sqrt(Xgradient ** 2 + Ygradient ** 2 + 1)
        bumpmap[:, :, 0] = Xgradient / bumpnorm
        bumpmap[:, :, 1] = Ygradient / bumpnorm
        bumpmap[:, :, 2] = 1 / bumpnorm
        return bumpmap

    imglists = glob.glob(path)
    lens = len(imglists)
    for img_id,item in enumerate(imglists):
        # transfer the nomarl vector value into rgb value
        img = cv2.imread(item)
        b,g,r = cv2.split(img)
        b_bumpmap = Bumpmap(b)
        g_bumpmap = Bumpmap(g)
        r_bumpmap = Bumpmap(r)
        bumpmap = np.maximum(b_bumpmap,g_bumpmap,r_bumpmap)
        bumpnorm = np.sqrt(np.sum(bumpmap**2,axis=2))
        bumpmap[:, :, 0] = bumpmap[:, :, 0] / bumpnorm
        bumpmap[:, :, 1] = bumpmap[:, :, 1] / bumpnorm
        bumpmap[:, :, 2] = bumpmap[:, :, 2] / bumpnorm
        bumpmap = bumpmap / 2 + 0.5  
        # save bump map images
        plt.clf()
        plt.axis('off')
        plt.imshow(bumpmap)
        filename= path.split('.')[1]
        plt.savefig('.'+filename+'bm.png',bbox_inches='tight',pad_inches=0.0)
        


    
# run the function of calcBump
CalcBumpmap('./dist/client/img/MRI_1.png')
CalcBumpmap('./dist/client/img/MRI_2.png')
CalcBumpmap('./dist/client/img/MRI_gray.png')
CalcBumpmap('./dist/client/img/MRI_t2.png')
CalcBumpmap('./dist/client/img/MRI_t2gray.png')
CalcBumpmap('./dist/client/img/MRI_flair.png')
CalcBumpmap('./dist/client/img/MRI_flgray.png')
CalcBumpmap('./dist/client/img/CT_1.png')
CalcBumpmap('./dist/client/img/CT_2.png')
CalcBumpmap('./dist/client/img/CT_gray.png')

CalcBumpmap('./dist/client/img/US_1.png')
CalcBumpmap('./dist/client/img/US_2.png')
CalcBumpmap('./dist/client/img/US_gray.png')

