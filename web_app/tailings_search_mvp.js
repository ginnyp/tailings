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

m.nv2015 = filterYear('2015-06-01', '2015-12-31');
m.nv2021 = filterYear('2021-06-01', '2021-12-31');

// var predictions = ee.FeatureCollection([])


// Define the feature collections
m.tailings = tailings;
m.mines = mines;
m.deposits = deposits;
m.predictions = predictions;

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

// Define the main interactive map.
c.map = ui.Map();

// Define an app info widget group.
c.info = {};
c.info.titleLabel = ui.Label('Tailings in the Southwestern United States');
c.info.aboutLabel = ui.Label(
  'Mapping of known and predicted tailings facilities ' +
  'in the Southwestern United States. Explore how tailings have changed ' +
  'over time by selecting the year. You may also choose to ' +
  'display additional information about the tailings.');

c.info.panel = ui.Panel([
  c.info.titleLabel, c.info.aboutLabel
]);

// Define a select data widget group

c.selectData = {};
c.selectData.sectionLabel = ui.Label('Select data to display');
c.selectData.tailingsCheck = ui.Checkbox('Tailings',true);
c.selectData.predictionsCheck = ui.Checkbox('Predicted Tailings',true);
c.selectData.minesCheck = ui.Checkbox('Mines',true);
c.selectData.depositsCheck = ui.Checkbox('Deposits',true);
c.selectData.panel = ui.Panel([c.selectData.sectionLabel,c.selectData.tailingsCheck,
                               c.selectData.predictionsCheck,c.selectData.minesCheck,
                               c.selectData.depositsCheck]);

// Define a select region widget group

c.selectRegion = {};
c.selectRegion.sectionLabel = ui.Label("Select a region of interest");
c.selectRegion.drawButton = ui.Button("Draw Region",drawRegion);
c.selectRegion.panel = ui.Panel([c.selectRegion.sectionLabel,
                                c.selectRegion.drawButton]);

// Select year widget group
c.selectYear = {};
c.selectYear.sectionLabel = ui.Label("Select the year you would like to display");
c.selectYear.menu = ui.Select(['2015','2021'],'Select a year');

c.selectYear.panel = ui.Panel([c.selectYear.sectionLabel,c.selectYear.menu]);

// Define a make table widget group

c.makeTable = {};
c.makeTable.tailingsLabel = ui.Label('Tailings in your Region');
c.makeTable.tailingsColumns = [
  // {id: 'tailing', label: 'Name', type: 'string'},
                 {id: 'state', label: 'State', type: 'string'},
                 {id: 'county', label: 'County', type: 'string'},
                 {id: 'area', label: 'Area (km^2)', type: 'string'},
                 {id: 'year', label: 'Year', type: 'string'}];

c.makeTable.tailingspropertyList = ['Ftr_Name','State','County','Shape_Area','Topo_Date'];

c.makeTable.depositsLabel = ui.Label('Deposits in your Region');
c.makeTable.depositsColumns = [{id: 'deposit', label: 'Name', type: 'string'}];
                // {id: 'state', label: 'State', type: 'string'},
                // {id: 'county', label: 'County', type: 'string'},
                // {id: 'area', label: 'Area (km)', type: 'string'},
                // {id: 'year', label: 'Year', type: 'string'}];

c.makeTable.depositspropertyList = ['NameDeposi'];

c.makeTable.minesLabel = ui.Label('Mines in your Region');
c.makeTable.minesColumns = [{id: 'area', label: 'Area (km^2)', type: 'string'}];
                // {id: 'state', label: 'State', type: 'string'},
                // {id: 'county', label: 'County', type: 'string'},
                // {id: 'area', label: 'Area (km)', type: 'string'},
                // {id: 'year', label: 'Year', type: 'string'}];

c.makeTable.minespropertyList = ['AREA'];


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

c.makeTable.depositsLabel.style().set(s.widgetTitle);

c.makeTable.minesLabel.style().set(s.widgetTitle);

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
function plotTailings() {
  var shown = c.selectData.tailingsCheck.getValue();
  var layer = ui.Map.Layer(
    m.tailings, {color: 'yellow'}, 'USGS Tailings Data',shown);
  c.map.layers().set(0,layer);
}
c.selectData.tailingsCheck.onChange(plotTailings);

function plotPredictions() {
  var shown = c.selectData.predictionsCheck.getValue();
  var layer = ui.Map.Layer(
    m.predictions, {color: 'blue'}, 'Predicted Tailings',shown);
  c.map.layers().set(1,layer);
}
c.selectData.predictionsCheck.onChange(plotPredictions);

function plotDeposits() {
  var shown = c.selectData.depositsCheck.getValue();
  var layer = ui.Map.Layer(
    m.deposits, {color: 'red'}, 'Copper Deposits',shown);
  c.map.layers().set(2, layer);
}
c.selectData.depositsCheck.onChange(plotDeposits);

function plotMines() {
  var shown = c.selectData.minesCheck.getValue();
  var layer = ui.Map.Layer(
    m.mines, {color: 'black'}, 'Mines',shown);
  c.map.layers().set(3, layer);
}
c.selectData.minesCheck.onChange(plotMines);

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
  var tailingsChart = makeTable(tailings,region,c.makeTable.tailingspropertyList,'Shape_Area',
                              c.makeTable.tailingsColumns,tailingToDict);
  var depositsChart = makeTable(deposits,region,c.makeTable.depositspropertyList,'Shape_Area',
                              c.makeTable.depositsColumns,depositToDict);
                              
  var minesChart = makeTable(mines,region,c.makeTable.minespropertyList,'AREA',
                              c.makeTable.minesColumns,mineToDict);

  c.makeTable.panel.clear();
  
  c.makeTable.panel.add(c.makeTable.tailingsLabel);
  c.makeTable.panel.add(ui.Panel([tailingsChart]));
  c.makeTable.panel.add(c.dividers.divider5);
  
  c.makeTable.panel.add(c.makeTable.depositsLabel);
  c.makeTable.panel.add(ui.Panel([depositsChart]));
    c.makeTable.panel.add(c.dividers.divider6);
  
  c.makeTable.panel.add(c.makeTable.minesLabel);
  c.makeTable.panel.add(ui.Panel([minesChart]));
  
  c.map.drawingTools().stop();
  c.map.drawingTools().setDrawModes([]);
}

function showImage(region){
  var year = c.selectYear.menu.getValue();
  print(year)
  var image = m.nv2015.filterBounds(region).median();
  var region_2015 = ee.Image(image).clip(region);
  var layer2015 = ui.Map.Layer(region_2015,{bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'Selected Region in 2015');
  c.map.layers().set(4,layer2015);
  
  var image2 = m.nv2021.filterBounds(region).median();
  var region_2021 = ee.Image(image).clip(region);
  var layer2021 = ui.Map.Layer(region_2021,{bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'Selected Region in 2021');
  c.map.layers().set(5,layer2021);
  c.map.setOptions("ROADMAP");
}

// c.selectYear.menu.onChange(changeYear);

function updateYearParam(year) {
  ui.url.set('year',year);
}
c.selectYear.menu.onChange(updateYearParam);


// function to map over list of tailingfeatures
function tailingToDict(tailing) {
  // make sure the feature is a feature
  var tailingFeature = ee.Feature(tailing);
  // turn it into a dictionary
  var tailingDict = tailingFeature.toDictionary();
  // create the row to add to the table
  var row = {c: [
    // {v: tailingDict.get('Ftr_Name')}, 
                 {v: tailingDict.get('State')},
                 {v: tailingDict.get('County')},
                 {v: tailingDict.get('Shape_Area')},
                 {v: tailingDict.get('Topo_Date')}]};
  return row;
}

// function to map over list of deposit features
function depositToDict(deposit) {
  var depositFeature = ee.Feature(deposit);
  var depositDict = depositFeature.toDictionary();
  var row = {c: [
    // {v: tailingDict.get('Ftr_Name')}, 
                 {v: depositDict.get('NameDeposi')}]};
                // {v: tailingDict.get('County')},
                // {v: tailingDict.get('Shape_Area')},
                // {v: tailingDict.get('Topo_Date')}]};
  return row;
}

// function to map over list of mine features
function mineToDict(mine) {
  // make sure the feature is a feature
  var mineFeature = ee.Feature(mine);
  // turn it into a dictionary
  var mineDict = mineFeature.toDictionary();
  // create the row to add to the table
  var row = {c: [
    // {v: tailingDict.get('Ftr_Name')}, 
                 {v: mineDict.get('AREA')}]};
                // {v: tailingDict.get('County')},
                // {v: tailingDict.get('Shape_Area')},
                // {v: tailingDict.get('Topo_Date')}]};
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
  // lon: ui.url.get('lon', -95.0),
  // lat: ui.url.get('lat', 39.0),
  // zoom: ui.url.get('zoom', 5)
  lon: -114,
  lat: 38,
  // zoom: 6.5
  zoom: 6
});


// Render the map.
plotTailings();
plotPredictions();
plotDeposits();
plotMines();
