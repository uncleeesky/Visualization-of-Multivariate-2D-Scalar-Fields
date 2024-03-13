# Visualization-of-Multivariate-2D-Scalar-Fields
This appication is a web application visualizing 2d medical images with different visualization techniques.
Since github cannot upload large files, please download the compressed packages from these links and add it to the directory.
1. raw data please put it in ./src/server: https://drive.google.com/file/d/1XWOv8sxfAfs9OTumwO89fIqIGmKUFi5v/view?usp=drive_link
   
3. node modules please put it in Root directory: https://drive.google.com/file/d/1E172-jgslTJTs3uzFTFS718IAEKNTro3/view?usp=drive_link

The application will run in the environment of nodejs and python, so it is essential to have python and nodejs on the computer.
If you dont have you can download and install python here:https://www.python.org/downloads/release/python-3122/ and nodejs here:https://nodejs.org/en

After you install python and nodejs, there are some python pachage need to be installed, it can be easily installed after checking the website in the url
h5py :https://docs.h5py.org/en/stable/quick.html
numpy:https://numpy.org/install/
matplotlib:https://matplotlib.org/stable/users/installing/index.html
glob:https://pypi.org/project/glob2/
cv2:https://pypi.org/project/opencv-python/
pydicom:https://pydicom.github.io/pydicom/stable/tutorials/installation.html

After that, the application will start when you run main.cmd file in the directory.
When you are prompted from the cmd window with this sentence: 
webpack 5.89.0 compiled successfully in 3651 ms
you can copy the localhost server url in the cmd window and open it in your browser.

Now you can see this application.

Defaultly, there will be an image of MRI with the technique of color mapping shown in the middle. You can examine, zoom in, zoom out, rotate and move the image by mouse.
You can also change the visualization object by selecting the interface on the right.
Hope you enjoy the application.

├── Readme.md                       //readme
├── main.cmd                        //star programe
├── package-lock.json               //package config
├── package.json                     
├── dist                            
    ├── client                      
        ├── index.html              //page html file
        ├── img                     //image folder
            ├── images
    ├── server                      
├── node_modules                    //node modules folder
├── src
    ├── client
        ├── client.ts               //ts file
        ├── tsconfig.json           //ts config file
        ├── webpack.common.js       //bundle file
        ├── webpack.dev.js          //server config file
    ├── server
        ├── image.py                //python script file
        ├── hdf5 files              //hdf5 data files
        ├── dicom files             //dicom data files


Here are the screenshot of the application.
![1710342542461](https://github.com/uncleeesky/Visualization-of-Multivariate-2D-Scalar-Fields/assets/39225880/45ca336c-70fd-4b06-ace9-36f94182a7ca)

