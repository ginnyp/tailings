/*******************************************************************************
 * Model *
 * 
 * A section to define information about the data being presented in your
 * app.
 * 
 * Guidelines: Use this section to import assets and define information that
 * are used to parameterize data-dependant widgets and control style and
 * behavior on UI interactions.
 ******************************************************************************/

// Define a JSON object for storing model info (app data).
var m = {};

// Define the image collection.

var s2 = ee.ImageCollection('COPERNICUS/S2');
// Function to mask clouds using the Sentinel-2 QA band.
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = ee.Number(2).pow(10).int();
  var cirrusBitMask = ee.Number(2).pow(11).int();
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
            qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000);
}

// Function to map the cloud masking function over 6 months of data in a year
function filterYear(start,end) {
  var result = s2.filterDate(start, end)
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
      .filterBounds(southwest)
      .map(maskS2clouds)
      .select('B.*');
  return result;
}

m.sw2015 = filterYear('2015-06-01', '2015-12-31');
m.sw2021 = filterYear('2021-06-01', '2021-12-31');

function makeCircle(feature) {
  var circle = feature.geometry().centroid().buffer(10000);
  var new_feature = ee.Feature(circle);
  return new_feature;
}

// Define the feature collections
m.predictions = predictions.filterBounds(southwest);
//m.newpredictions = newPredictions.filterBounds(southwest);
m.predictionsCircles = newPredictions.map(makeCircle);
// m.predictionsCircles = predictions.map(makeCircle);
m.trainTailings = trainTailings.filterBounds(southwest);
m.allTailings = allTailings.filterBounds(southwest);
m.porcuMines = porcuMines.filterBounds(southwest);
m.cuMines = cuMines.filterBounds(southwest);

/*******************************************************************************
 * Components *
 * 
 * A section to define the widgets that will compose your app.
 * 
 * Guidelines:
 * 1. Except for static text and constraints, accept default values;
 *    initialize them in the initialization section.
 * 2. Limit composition of widgets to those belonging to an inseparable unit
 *    (i.e. a group of widgets that would make no sense out of order). 
 ******************************************************************************/

// Define a JSON object for storing UI components.
var c = {};

// Define a control panel for user input.
c.controlPanel = ui.Panel();

// Define a series of panel widgets to be used as horizontal dividers.
c.dividers = {};
c.dividers.divider1 = ui.Panel();
c.dividers.divider2 = ui.Panel();
c.dividers.divider3 = ui.Panel();
c.dividers.divider4 = ui.Panel();
c.dividers.divider5 = ui.Panel();
c.dividers.divider6 = ui.Panel();
c.dividers.divider7 = ui.Panel();

// Define the main interactive map.
c.map = ui.Map();

// Define an app info widget group.
c.info = {};
c.info.titleLabel = ui.Label('Tailings Search');
c.info.aboutLabel = ui.Label(
  'This map displays tailings that our machine learning model has identified ' +
  'in the Southwestern United States, alongside known tailings and mine dumps, ' +
  'porphyry copper mines, and copper mining areas. Explore the data by drawing ' +
  'a region on the map. Then you will see information about the features ' + 
  'within that region. You may also select the year of the image you would ' + 
  'like to display.');
c.info.panel = ui.Panel([
  c.info.titleLabel, c.info.aboutLabel
]);

// Define a select data widget group

c.selectData = {};
c.selectData.sectionLabel = ui.Label('Select data to display');
c.selectData.predictionsCheck = ui.Checkbox('Predicted Tailings (from classification model)',true);
c.selectData.tailingsCheck = ui.Checkbox('Known Tailings (used to train model)',true);
c.selectData.alltailingsCheck = ui.Checkbox('All Known Tailings and Mine Dumps',true);
c.selectData.porCuMinesCheck = ui.Checkbox('Porphyry Copper Mines',true);
c.selectData.cuMinesCheck = ui.Checkbox('Copper Mining Areas',false);
c.selectData.panel = ui.Panel([c.selectData.sectionLabel,
                               c.selectData.predictionsCheck,
                               c.selectData.tailingsCheck,
                               c.selectData.alltailingsCheck,
                               c.selectData.porCuMinesCheck,
                               c.selectData.cuMinesCheck]);

// Define a select region widget group

c.selectRegion = {};
c.selectRegion.sectionLabel = ui.Label("Select a region of interest");
c.selectRegion.drawButton = ui.Button("Draw Region",drawRegion);
c.selectRegion.panel = ui.Panel([c.selectRegion.sectionLabel,
                                c.selectRegion.drawButton]);

// Select year widget group
c.selectYear = {};
c.selectYear.sectionLabel = ui.Label("Select the year you would like to display");
c.selectYear.menu = ui.Select(['2015','2021'],'Select a year','2015');

c.selectYear.panel = ui.Panel([c.selectYear.sectionLabel,c.selectYear.menu]);

// Define a make table widget group

c.makeTable = {};

c.makeTable.predictionsLabel = ui.Label('Predicted Tailings in your Region');
c.makeTable.predictionsColumns = [
                {id: 'state', label: 'State', type: 'string'},
                 {id: 'county', label: 'County', type: 'string'},
                 {id: 'name', label: 'Nearest Mine', type: 'string'},
                // {id: 'area', label: 'Area', type: 'string'},
                {id: 'confidence', label: 'Confidence', type: 'number'},
                 {id: 'file_name', label: 'Image File', type: 'string'}];
                // {id: 'mine', label: 'Closest Porphyry Cu Mine', type: 'string'},
                // {id: 'site', label: 'Closest Cu Mine', type: 'string'}];

c.makeTable.predictionspropertyList = ['state','county','NameDeposi','confidence','file_name'];

c.makeTable.tailingsLabel = ui.Label('Tailings and Mine Dumps in your Region');
c.makeTable.tailingsColumns = [
                 {id: 'state', label: 'State', type: 'string'},
                 {id: 'county', label: 'County', type: 'string'},
                 {id: 'area', label: 'Area (km2)', type: 'number'},
                // {id: 'mine', label: 'Closest Porphyry Cu Mine', type: 'string'},
                // {id: 'site', label: 'Closest Cu Mine', type: 'string'},
                 {id: 'feature', label: 'Feature', type: 'string'},
                 {id: 'year', label: 'Map Year', type: 'string'}];

c.makeTable.tailingspropertyList = ['State','County','Shape_Area','Ftr_Type','Topo_Date'];

c.makeTable.poCuMineLabel = ui.Label('Porphyry Cu Mines in your Region');
c.makeTable.poCuMineColumns = [{id: 'name', label: 'Mine Name', type: 'string'},
                {id: 'date', label: 'Startup Date', type: 'string'},
                {id: 'tonnage', label: 'Tonnage', type: 'number'},
                {id: 'cu_grade', label: 'Copper grade', type: 'number'},
                {id: 'ageMY', label: 'AgeMY', type: 'number'}];

c.makeTable.poCuMinepropertyList = ['NameDeposi','StartupDat','Tonnage','Copper_gra','AgeMY'];

c.makeTable.cuMineLabel = ui.Label('Copper Mines in your Region');
c.makeTable.cuMineColumns = [{id: 'name', label: 'Mine Name', type: 'string'},
                    {id: 'status', label: 'Status', type: 'string'},
                    {id: 'id', label: 'MRDS - Deposit ID', type: 'string'},
                    {id: 'url', label: 'URL', type: 'string'}];

c.makeTable.cuMinepropertyList = ['SITE_NAME','DEV_STAT','DEP_ID','URL'];


c.makeTable.panel = ui.Panel([]);

/*******************************************************************************
 * Composition *
 * 
 * A section to compose the app i.e. add child widgets and widget groups to
 * first-level parent components like control panels and maps.
 * 
 * Guidelines: There is a gradient between components and composition. There
 * are no hard guidelines here; use this section to help conceptually break up
 * the composition of complicated apps with many widgets and widget groups.
 ******************************************************************************/

 c.controlPanel.add(c.info.panel);
 c.controlPanel.add(c.dividers.divider1);
 c.controlPanel.add(c.selectData.panel);
 c.controlPanel.add(c.dividers.divider2);
 c.controlPanel.add(c.selectRegion.panel);
 c.controlPanel.add(c.dividers.divider3);
 c.controlPanel.add(c.selectYear.panel);
 c.controlPanel.add(c.dividers.divider4);
 c.controlPanel.add(c.makeTable.panel);
 
 
 ui.root.clear();
 ui.root.add(c.controlPanel);
 ui.root.add(c.map);
  

/*******************************************************************************
 * Styling *
 * 
 * A section to define and set widget style properties.
 * 
 * Guidelines:
 * 1. At the top, define styles for widget "classes" i.e. styles that might be
 *    applied to several widgets, like text styles or margin styles.
 * 2. Set "inline" style properties for single-use styles.
 * 3. You can add multiple styles to widgets, add "inline" style followed by
 *    "class" styles. If multiple styles need to be set on the same widget, do
 *    it consecutively to maintain order.
 ******************************************************************************/

// Define CSS-like class style properties for widgets; reusable styles.
var s = {};

s.opacityWhiteMed = {
  backgroundColor: 'rgba(255, 255, 255, 0.5)'
};
s.opacityWhiteNone = {
  backgroundColor: 'rgba(255, 255, 255, 0)'
};
s.aboutText = {
  fontSize: '13px',
  color: '505050'
};
s.sectionLabel = {
  fontSize: '14px',
  color: '505050',
  fontWeight: 'bold'
};
s.widgetTitle = {
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '8px 8px 0px 8px',
  color: '383838'
};
s.stretchHorizontal = {
  stretch: 'horizontal'
};
s.noTopMargin = {
  margin: '0px 8px 8px 8px'
};
s.smallBottomMargin = {
  margin: '8px 8px 4px 8px'
};
s.bigTopMargin = {
  margin: '24px 8px 8px 8px'
};
s.divider = {
  backgroundColor: 'F0F0F0',
  height: '4px',
  margin: '20px 0px'
};

// Set widget style.
c.info.titleLabel.style().set({
  fontSize: '20px',
  fontWeight: 'bold'
});
c.info.titleLabel.style().set(s.bigTopMargin);
c.info.aboutLabel.style().set(s.aboutText);

c.selectData.sectionLabel.style().set(s.widgetTitle);

c.selectRegion.sectionLabel.style().set(s.widgetTitle);

c.makeTable.tailingsLabel.style().set(s.widgetTitle);

c.makeTable.predictionsLabel.style().set(s.widgetTitle);

c.makeTable.poCuMineLabel.style().set(s.widgetTitle);

c.makeTable.cuMineLabel.style().set(s.widgetTitle);

c.selectYear.sectionLabel.style().set(s.widgetTitle);

c.selectYear.menu.style().set({
  height: '50',
  width: '200px',
  fontSize: '40px',
  fontWeight: '20'
});

c.selectRegion.drawButton.style().set({
  height: '50',
  width: '200px',
  fontSize: '40px',
  fontWeight: '20'
});

c.controlPanel.style().set({
  width: '400px',
  padding: '0px'
});

c.map.style().set({
  cursor: 'crosshair'
});

c.map.setOptions('HYBRID');

// Loop through setting divider style.
Object.keys(c.dividers).forEach(function(key) {
  c.dividers[key].style().set(s.divider);
});

/*******************************************************************************
 * Behaviors *
 * 
 * A section to define app behavior on UI activity.
 * 
 * Guidelines:
 * 1. At the top, define helper functions and functions that will be used as
 *    callbacks for multiple events.
 * 2. For single-use callbacks, define them just prior to assignment. If multiple
 *    callbacks are required for a widget, add them consecutively to maintain
 *    order; single-use followed by multi-use.
 * 3. As much as possible, include callbacks that update URL parameters.
 ******************************************************************************/



// Functions to plot each of the four feature collections.

// predicted tailings
function plotPredictions() {
  var shown = c.selectData.predictionsCheck.getValue();
  var layer = ui.Map.Layer(
    m.predictions, {color: 'yellow'}, 'Predicted Tailings',shown);
  var empty = ee.Image().byte();
  var outlines = empty.paint({
      featureCollection: m.predictionsCircles,
      color: 'yellow',
      width: '6'
    });
  var highlightLayer = ui.Map.Layer(outlines, {palette: 'yellow'}, 
                        'Predicted Tailings Highlight',shown);
  c.map.layers().set(0,layer);
  c.map.layers().set(1,highlightLayer);
}
c.selectData.predictionsCheck.onChange(plotPredictions);

// training tailings
function plotTailings() {
    var shown = c.selectData.tailingsCheck.getValue();
    var layer = ui.Map.Layer(
      m.trainTailings, {color: 'blue'}, 'Tailings for Model Training',shown);
    c.map.layers().set(2,layer);
  }
  c.selectData.tailingsCheck.onChange(plotTailings);
  
  // all tailings and mine dumps
function plotAllTailings() {
  var shown = c.selectData.alltailingsCheck.getValue();
  var layer = ui.Map.Layer(
    m.allTailings, {color: 'brown'}, 'All Tailings and Mine Dumps',shown);
  c.map.layers().set(3,layer);
}
c.selectData.alltailingsCheck.onChange(plotAllTailings);

// Porphyry Cu Mines
function plotPorCuMines() {
  var shown = c.selectData.porCuMinesCheck.getValue();
  var layer = ui.Map.Layer(
    m.porcuMines.draw({color: 'red',pointRadius: 1}),{}, 'Porphyry Copper Mines',shown);
  c.map.layers().set(4, layer);
}
c.selectData.porCuMinesCheck.onChange(plotPorCuMines);

// Cu Mines  
function plotCuMines() {
  var shown = c.selectData.cuMinesCheck.getValue();
  var layer = ui.Map.Layer(
    m.cuMines.draw({color: 'black',pointRadius: 1}),{},'Copper Mines',shown);
  c.map.layers().set(5, layer);
}
c.selectData.cuMinesCheck.onChange(plotCuMines);
  
//Functions to take user input to select a region
function drawRegion() {
  c.map.setOptions("SATELLITE");
  c.map.drawingTools().clear().setLinked(false).setDrawModes(['rectangle']).setShape('rectangle');
  c.map.drawingTools().layers().get(0).setName('Selected Region').setColor('white');
  c.map.drawingTools().onDraw(updateUrlParamRegion);
  c.map.drawingTools().onDraw(selectRegion);
}

function selectRegion(region,tools) {
  // set it to zoom to the image? can get centroid from url params
  showImage(region);

  c.makeTable.panel.clear();

  // table for predicted tailings
  var predictionsChart = makeTable(m.predictions,region,c.makeTable.predictionspropertyList,'confidence',
                              c.makeTable.predictionsColumns,predictedToDict);
  c.makeTable.panel.add(c.makeTable.predictionsLabel);
  c.makeTable.panel.add(ui.Panel([predictionsChart]));
  c.makeTable.panel.add(c.dividers.divider5);

  // table for all tailings and mine dumps
  var tailingsChart = makeTable(m.trainTailings,region,c.makeTable.tailingspropertyList,'Shape_Area',
                                c.makeTable.tailingsColumns,tailingToDict);
  c.makeTable.panel.add(c.makeTable.tailingsLabel);
  c.makeTable.panel.add(ui.Panel([tailingsChart]));
  c.makeTable.panel.add(c.dividers.divider6);

  // table for Porphyry Cu Mines
  var poCuMineChart = makeTable(m.porcuMines,region,c.makeTable.poCuMinepropertyList,'Shape_Area',
                              c.makeTable.poCuMineColumns,poCuMineToDict);
  c.makeTable.panel.add(c.makeTable.poCuMineLabel);
  c.makeTable.panel.add(ui.Panel([poCuMineChart]));
  c.makeTable.panel.add(c.dividers.divider7);
      
  // table for Cu Mines
  var cuMineChart = makeTable(m.cuMines,region,c.makeTable.cuMinepropertyList,'AREA',
                              c.makeTable.cuMineColumns,cuMineToDict);  
  c.makeTable.panel.add(c.makeTable.cuMineLabel);
  c.makeTable.panel.add(ui.Panel([cuMineChart]));
  
  c.map.drawingTools().stop();
  c.map.drawingTools().setDrawModes([]);
}

function showImage(region){
  var year = ui.url.get('year');
  var image = m.sw2015.filterBounds(region).median();
  var region_2015 = ee.Image(image).clip(region);
  var layer2015 = ui.Map.Layer(region_2015,{bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3, opacity: 0.75}, 'Selected Region in 2015');
  c.map.layers().set(6,layer2015);
  
  var image2 = m.sw2021.filterBounds(region).median();
  var region_2021 = ee.Image(image).clip(region);
  var layer2021 = ui.Map.Layer(region_2021,{bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3, opacity: 0.75}, 'Selected Region in 2021');
  c.map.layers().set(7,layer2021);
  c.map.setOptions("ROADMAP");
  
  if (year == '2015') {
    layer2021.setShown(false);
  } else {
    layer2015.setShown(false);
  }
}

function updateYearParam(year) {
  ui.url.set('year',year);
}

function changeYear() {
  var year = ui.url.get('year');
  if (!c.map.layers().get(6)) {
    return null;
  }
  if (year == '2015') {
    // need to update indices if layers change
    c.map.layers().get(6).setShown(true);
    c.map.layers().get(7).setShown(false);
  } else {
    c.map.layers().get(6).setShown(false);
    c.map.layers().get(7).setShown(true);
  }
} 
c.selectYear.menu.onChange(updateYearParam);
c.selectYear.menu.onChange(changeYear);


// function to map over list of tailingfeatures
function tailingToDict(tailing) {
  // make sure the feature is a feature
  var tailingFeature = ee.Feature(tailing);
  // turn it into a dictionary
  var tailingDict = tailingFeature.toDictionary();
  // create the row to add to the table
  // if (!tailingDict.get('Shape_Area')) {
  var row = {c: [
    // {v: tailingDict.get('Ftr_Name')}, 
                  {v: tailingDict.get('State')},
                  {v: tailingDict.get('County')},
                  {v: tailingDict.get('Shape_Area')},
                  {v: tailingDict.get('Ftr_Type')},
                  {v: tailingDict.get('Topo_Date')}
                  ]};
                  // {v: tailingDict.get('PoCU_Mine')},
                  // {v: tailingDict.get('SITE_NAME')}]};
  return row;
}


function predictedToDict(tailing) {
  // make sure the feature is a feature
  var tailingFeature = ee.Feature(tailing);
  // turn it into a dictionary
  var tailingDict = tailingFeature.toDictionary();
  // create the row to add to the table
  // if (!tailingDict.get('Shape_Area')) {
  var row = {c: [
                    {v: tailingDict.get('state')},
                    {v: tailingDict.get('county')},
                    {v: tailingDict.get('NameDeposi')},
                    // {v: tailingDict.get('area')},
                    {v: tailingDict.get('confidence')},
                    {v: tailingDict.get('file_name')}]};
  return row;
}


// function to map over list of deposit features
function poCuMineToDict(deposit) {
  var depositFeature = ee.Feature(deposit);
  var depositDict = depositFeature.toDictionary();
  var row = {c: [{v: depositDict.get('NameDeposi')},
                 {v: depositDict.get('StartupDat')},
                 {v: depositDict.get('Tonnage')},
                 {v: depositDict.get('Copper_gra')},
                 {v: depositDict.get('AgeMY')}]};
  return row;
}

// function to map over list of mine features
function cuMineToDict(mine) {
  // make sure the feature is a feature
  var mineFeature = ee.Feature(mine);
  // turn it into a dictionary
  var mineDict = mineFeature.toDictionary();
  // create the row to add to the table
  var row = {c: [{v: mineDict.get('SITE_NAME')},
                 {v: mineDict.get('DEV_STAT')},
                 {v: mineDict.get('DEP_ID')},
                 {v: mineDict.get('URL')},
]};
  return row;
}

function makeTable(fc,region,propertyList,sortBy,cols,featureToDict) {
  // filter the feature collection by the region and properties and change to list
  var featureList = fc.filterBounds(region).select({propertySelectors: propertyList,
                                      retainGeometry: false}).sort(sortBy,false).toList(100);
    // create the list of rows
  var rows = featureList.map(featureToDict).getInfo();
  var dataTable = {cols: cols,rows: rows};
  var chart = ui.Chart(dataTable).setChartType('Table');
  return chart;
}


// add URL params for region - update this to do corners maybe?
function updateUrlParamRegion(region) {
  var regionCentroid = region.centroid({'maxError': 1}).coordinates();
  ui.url.set('regionlat',regionCentroid.getInfo()[0]);
  ui.url.set('regionlong',regionCentroid.getInfo()[1]);
}

function updateUrlParamMap(newMapParams) {
  ui.url.set('lat', newMapParams.lat);
  ui.url.set('lon', newMapParams.lon);
  ui.url.set('zoom', newMapParams.zoom);
}
c.map.onChangeBounds(ui.util.debounce(updateUrlParamMap, 100));


/*******************************************************************************
 * Initialize *
 * 
 * A section to initialize the app state on load.
 * 
 * Guidelines:
 * 1. At the top, define any helper functions.
 * 2. As much as possible, use URL params to initialize the state of the app.
 ******************************************************************************/


// Set model state based on URL parameters or default values.
c.map.setCenter({
  lon: -113.795,
  lat: 37.234,
  zoom: 6.5
  // zoom: 6
});


ui.url.set('year', '2015')

// Render the map.
plotPredictions();
plotTailings();
plotAllTailings();
plotPorCuMines();
plotCuMines();
