import pandas as pd
import numpy as np
import openpyxl

df = pd.read_csv('pos_boxes.csv')
df['tailing_box'] = df['tailing_box'].str.replace('[', '', regex=True)
df['tailing_box'] = df['tailing_box'].str.replace(']', '', regex=True)
df['tailing_box'] = df['tailing_box'].str.split(',')


df['tail_x_min'] = df.apply(lambda x: float(x['tailing_box'][0]),axis=1)
df['tail_y_min'] = df.apply(lambda x: float(x['tailing_box'][1]),axis=1)
df['tail_x_max'] = df.apply(lambda x: float(x['tailing_box'][4]),axis=1)
df['tail_y_max'] = df.apply(lambda x: float(x['tailing_box'][5]),axis=1)


df['image_box'] = df['image_box'].str.replace('[', '', regex=True)
df['image_box'] = df['image_box'].str.replace(']', '', regex=True)
df['image_box'] = df['image_box'].str.split(',')


df['img_x_min'] = df.apply(lambda x: float(x['image_box'][0]),axis=1)
df['img_y_min'] = df.apply(lambda x: float(x['image_box'][1]),axis=1)
df['img_x_max'] = df.apply(lambda x: float(x['image_box'][4]),axis=1)
df['img_y_max'] = df.apply(lambda x: float(x['image_box'][5]),axis=1)

df['bounding_box'] = df.apply(lambda x: [x['img_x_min'],x['img_y_min'],x['img_x_max'],x['img_y_max']],axis=1)
df2 = df.copy(deep=True)
df3 = [['xmin','y_min','x_max','y_max',[1,2,3,4]]]
i=0

while i <= len(df2)-1:
    ls = [[df2['img_x_min'][i]],[df2['img_y_min'][i]],[df2['img_x_max'][i]],[df2['img_y_max'][i]]]
    bb = [df2['bounding_box'][i]]
    for j in range(len(df2)):
        if df2['img_x_min'][i] <= df2['img_x_max'][j] and df2['img_x_max'][i] >= df2['img_x_min'][j] and df2['img_y_max'][i] >= df2['img_y_min'][j] and df2['img_y_min'][i] <= df2['img_y_max'][j]:
            ls[0].append(df['img_x_min'][j])
            ls[1].append(df['img_y_min'][j])
            ls[2].append(df['img_x_max'][j])
            ls[3].append(df['img_y_max'][j])
            bb.append(df['bounding_box'][j])
    df3.append([min(ls[0]),min(ls[1]),max(ls[2]),max(ls[3]), bb])
    i += 1
df3 = pd.DataFrame(df3,columns =['img_x_min', 'img_x_max', 'img_y_min', 'img_y_max','bounding_boxes'])

newdf = df3.drop_duplicates(subset = ['img_x_min', 'img_x_max', 'img_y_min', 'img_y_max'],keep = 'last').reset_index(drop = True)

csv_file = df3.apply(lambda x: str(str(x['img_x_min']) + ';' + str(x['img_y_min'])+';'+ str(x['img_x_max']) + ';' + str(x['img_y_max'])+';'+ 'tailing') ,axis=1) 
print(csv_file)

df['x_min'] = pd.to_numeric(400*(df['img_x_min'] - df['tail_x_min'])/(df['img_x_min'] - df['img_x_max']), downcast='integer').astype(int)
df['y_min'] = pd.to_numeric(400*(df['img_y_min'] - df['tail_y_min'])/(df['img_y_min'] - df['img_y_max']), downcast='integer').astype(int)
df['x_max'] = pd.to_numeric(400*(df['img_x_min'] - df['tail_x_max'])/(df['img_x_min'] - df['img_x_max']), downcast='integer').astype(int)
df['y_max'] = pd.to_numeric(400*(df['img_y_min'] - df['tail_y_max'])/(df['img_y_min'] - df['img_y_max']), downcast='integer').astype(int)
df['label'] = 1
df['image_num'] = df['image_num']+'.jpg'

df = df[['image_num','x_min','y_min','x_max','y_max','label']]
#print(df)
#df.to_excel('bounding_boxes.xlsx', index = False)
#df.to_string('yolokeras.classes.txt',index = False)
#df.to_csv('yolokeras.annotations.txt', sep=',', header = False, index=False)