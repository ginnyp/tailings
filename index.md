## Mission Statement

**Deliver the first data-driven solution to identifying tailings that can be sources for critical minerals, enabling safe and efficient procurement of minerals essential to national security and economic prosperity.**

> *“Applying AI to identify more tailings and potentially more critical minerals in the United States would be a paradigm shift”*
> 
> *Bob Seal, Research Geologist at USGS, co-leads Earth MRI*

## Team

![""](images/tailings_team.png)

## Project

Our project, Tailings: Identification and Characterization, is focused on helping researchers locate sites that store mine waste, or tailings, in the Southwest United States, so that they can remine them to extract critical minerals, as well as restore them to prevent environmental disasters.

Using satellite imagery and USGS mining and mineral databases, we have applied classification and segmentation to **identify unknown tailings**, then we have created an **interactive web application**, powered by Google Earth Engine, to allow users to explore and evaluate the tailings we have identified.

## Product

You can explore our model predictions alongside all known tailings and mine dumps by using our web application, [Tailings Search](https://ginny.users.earthengine.app/view/tailings-identification-and-characterization#year=2015;lat=37.234;lon=-113.795;zoom=7;).


!["](images/tailings_search.png)

## Process

The following sections provide additional detail on the need for our project, as well as explanations of our technical approach to building our tailings prediction model.

### Background

In the mining industry, the waste material left behind after a target mineral is extracted from the ore is called the **mine tailing**. Tailings can be seen as piles, or large ponds or dams that are located in the vicinity of the mine site.

![""](images/tailings_ponds_piles.png)

#### Critical Minerals in Tailings

The United States Geological Survey maintains a list of **critical minerals**, which are mineral commodities that are considered critical to the US economy and national security. Critical minerals are used to manufacture key inputs to clean energy technologies like electric vehicles, batteries, and solar panels and they are important to the transition to a low carbon economy. 

Many tailings are likely to contain critical minerals. Tailings are a largely untapped resource for our country, and remining tailings to extract critical minerals could be lucrative. The critical minerals market could top a valuation of $400 billion, exceeding the value of all the coal extracted in 2020. The previous and current administration has made securing critical minerals a high priority for the country, with nearly $75M invested annually in its procurement.

#### Environmental Hazards from Tailings

There’s an increased number of tailing failures around the world, as mining for critical minerals grows. Half of serious tailings dam failures in the last 70 years actually occurred in the most recent 20 years. Tailings pose a number of health hazards, environmental risks, and infrastructure risks. The toxins in tailings can be harmful to humans, especially if they seep into the groundwater and contaminate it. US federal agencies spent $2.5B reducing environmental risks from abandoned mines over the course of 9 years.

#### Further Reading

* [U.S. Geological Survey Releases List of Critical Minerals, USGS, February 2022](https://www.usgs.gov/news/national-news-release/us-geological-survey-releases-2022-list-critical-minerals)
* [Critical Mineral Recovery Potential from Tailings and Other Mine Waste Streams, USGS, September 2019](https://www.usgs.gov/centers/geology%2C-energy-%26amp%3Bamp%3B-minerals-science-center/science/critical-mineral-recovery)
* [A Dam Big Problem, Science Magazine, August 2020](https://www.science.org/content/article/catastrophic-failures-raise-alarm-about-dams-containing-muddy-mine-wastes)
* [Forty-Seven Years and Counting: The Lasting Damage of Tailings Dam Failures, Earthworks, July 2021](https://earthworks.org/blog/forty-seven-years-and-counting-the-lasting-damage-of-tailings-dam-failures/)
* [A new look at the statistics of tailings dam failures, Science Direct, June 2022](https://www.sciencedirect.com/science/article/pii/S0013795222001429)

#### Partners

The tool we created will support the work of a social enterprise called [Regeneration](https://www.regeneration.enterprises/) and two [U.S. Geological Survey](https://www.usgs.gov/) major initiatives, [USMIN](https://www.usgs.gov/centers/gggsc/science/usmin-mineral-deposit-database) and [EarthMRI](https://www.usgs.gov/special-topics/earth-mri).

![""](images/partners.png)

The Regeneration team works to remine and reprocess tailings, then restore and renew ecological systems such as forests and streams that have been impacted by the tailings storage site. Our project will help Regeneration identify sites for restoration, so that they can prioritize tailings that pose the highest risk to local communities, as well as the largest opportunities for remining critical minerals. 

In addition, our project will support USGS Initiatives: USMIN, which is a mineral deposit database, and EarthMRI, a project that aims to identify areas which may have unidentified critical mineral resources. Our work will help them to find unknown tailings, so that they can add them to existing databases.

### Data Sources
For our training data, we used a recently updated dataset from USGS (given to us by an SME) that captured mine features such as piles, shafts, and tailings.
The tailings data goes from 1945 - 2004 but after reviewing the data manually, we decided to only take tailing polygons mapped in the last 50 years (from 1972 onwards) as the older ones seem to have significant changes.

We started with over 2,000 tailing polygons in the dataset, and after quality control that removed overlapping tailings, nonvisible tailings, and very small tailings, our final count of training tailings came to 682 polygons, which you can see in the image below in yellow.

![""](images/training_data.png)

### Models

In our project we use two different models. First, we used Keras Retinanet50 to classify if an image contained a tailing. Then, once we filtered down the images with potential tailings, we used our Mask RCNN to predict on the actual tailing polygons. We chose this method because we found going direct to object detection was not accurate. Limiting our object detection to areas that had been classified as containing tailings improved our results.

We built our model using the 682 training polygons plus 784 random images for negative data. We collected Sentinel 2 data, which is the best resolution open source satellite available today, as well as Elevation data. We ran our data first through the retinanet50 classification algorithm for potential tailing areas. Once we filtered down to those areas we then run it through the MaskRCNN to predict the actual boundaries of the tailing.

### Predictions

We applied the trained models on images within a 5 kilometer radius around the 34 known Porphyry Copper Mines. In the image below, you can see three examples of the output of the our model, the blue bounding boxes are where a tailing is predicted.

![""](images/predictions.png)

In total the model predicted 179 tailings of which 14 were over known tailings/mine dumps, another 92 were in known mining areas, we visually inspected the remaining 73 and found 30 that had potential characteristics of being a tailing.

---

