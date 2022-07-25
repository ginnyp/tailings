import pandas as pd
import numpy as np
import openpyxl
import json
import tifffile
import os
import sys
from PIL import Image
import matplotlib.pyplot as plt

#read bounding box file
df = pd.read_csv('US_data_cutoff_7_21 - US_data_cutoff_7_21.csv')
df = df[['Ftr_Type','tailingsBox','.geo']]
df["coordinates"] = df['tailingsBox'].apply(lambda x: json.loads(x)["coordinates"])
df["Polygon"] = df['.geo'].apply(lambda x: str(x)[33:-2])
df["image_num"] =  'positive' + df.index.astype(str)
df['tailings_box'] = df["coordinates"].apply(lambda x: x[0])

df['tail_x_min'] = df['tailings_box'].apply(lambda x: float(x[0][0]))
df['tail_y_min'] = df['tailings_box'].apply(lambda x: float(x[0][1]))
df['tail_x_max'] = df['tailings_box'].apply(lambda x: float(x[2][0]))
df['tail_y_max'] = df['tailings_box'].apply(lambda x: float(x[2][1]))

df['img_x_min'] = (df['tail_x_min']-0.018018).astype(float)
df['img_y_min'] = (df['tail_y_min']-0.018018).astype(float)
df['img_x_max'] = (df['tail_x_max']+0.018018).astype(float)
df['img_y_max'] = (df['tail_y_max']+0.018018).astype(float)

df= df[['image_num','img_x_min', 'img_y_min','img_x_max', 'img_y_max','tail_x_min','tail_y_min','tail_x_max','tail_y_max','Ftr_Type','Polygon']]


def Overlap(df):
    ls = [[]]
    #Seperate copy
    df2 = df.copy(deep = True)

    #Define list of list
    df3 = [['image_num','xmin','y_min','x_max','y_max','tail_x_min','tail_y_min','tail_x_max','tail_y_max','Ftr_Type','Polygon']]

    #While loop to iterate and find any boxes that are overlapping comb through all image boxes
    for i in range(len(df2)):
        #ls is list of image box
        ls = [[df2['img_x_min'][i]],[df2['img_y_min'][i]],[df2['img_x_max'][i]],[df2['img_y_max'][i]]]
        #for all other areas see if other images overlap
        for j in range(len(df2)):
            #if overlap
            if float(df2['img_x_min'][i]) < float(df2['img_x_max'][j]) and float(df2['img_x_max'][i]) > float(df2['img_x_min'][j]) and float(df2['img_y_max'][i]) > float(df2['img_y_min'][j]) and float(df2['img_y_min'][i]) < float(df2['img_y_max'][j]):
                
                #append all xmins, xmax, ymin and ymaxs of overlap te respective list
                ls[0].append(df2['img_x_min'][j])
                ls[1].append(df2['img_y_min'][j])
                ls[2].append(df2['img_x_max'][j])
                ls[3].append(df2['img_y_max'][j])
                #Change image number as only pulling one if overlap
                df2.iloc[j,0] = df2['image_num'][i]
        #append to list of list the bigger image for any tailings with overlaps as well as respective bounding boxes (keep all columnns for uploading ease on BB)
        df3.append([df2['image_num'][i],min(ls[0]),min(ls[1]),max(ls[2]),max(ls[3]), df2['tail_x_min'][i],df2['tail_y_min'][i],df2['tail_x_max'][i],df2['tail_y_max'][i],df2['Ftr_Type'][i], df2['Polygon'][i]])
        i += 1    
    #Initialize df3
    df3 = pd.DataFrame(df3,columns =['image_num','img_x_min', 'img_y_min','img_x_max', 'img_y_max','tail_x_min','tail_y_min','tail_x_max','tail_y_max','Ftr_Type','Polygon'])
    #Remove model header
    df3 = df3[1:]
    return df3

df = Overlap(df).reset_index()




#Output file to get pictures from GEE
df2 = df.drop_duplicates(subset=['image_num']).reset_index()
csv_file = df2.apply(lambda x: str(str(x['img_x_min']) + ';' + str(x['img_y_min'])+';'+ str(x['img_x_max']) + ';' + str(x['img_y_max'])+';'+ 'tailing') ,axis=1) 
csv_file.to_csv('pictures_file.csv', sep=' ', header = True, index=False)

df2['file_num']= 'tailing' + df2.index.astype(str) + '.tif'
df = df.merge(df2[['image_num', 'file_num']],how = 'left')
df.to_csv('BB_Coordinates.csv', sep=' ', header = True, index=False)
