# exense-visualization
visualization packages for exense's web apps.

![demo screenshot](https://step.exense.ch/knowledgebase/3.12/images/userdoc/dashboards/dashboards-plain.png)

This page provides rudimentary end-user documentation for the viz framework. Developer docs may be added in the future. If you are a developper and need help in order to make use of the framework, just send us a email at contact[at]exense.ch or send us a message through our corporate [contact form](https://www.exense.ch/contact).

# Concepts

viz provides a full stack of visualization components written in angularjs, ranging from individual dashlets to dashboards, to a dashboard manager and a session manager.

## Dashlets

A dashlet is the smallest visualization entity that can be created. It is used to query, transform, format and visualize the results of a web query.

You can switch between configuration and visualization mode by clicking either the cog icon (if you're in visualization mode) or the bar chart icon (if you're in configuration mode) in the top right corner of the dashlet, just below the deletion cross icon.

### Query

The query tab is composed of 2 sections : the service definition and the service input. The query is the entity responsible for accessing a service and retrieving the resulting data. By default, queries will be fired when the user toggles to the visualization pane of the dashlet, when autorefresh is enabled or when application-specific events are broadcast to trigger its execution.

#### Service section
The service  section is used to define the following settings:
- **Service Type**: either Simple or Asynchronous
- **Service Method**: the HTTP method used to query your service. Available values are **Get, Post, Put, Delete and Patch**
- **Service URL**: the URL of the service you want to target

#### Input section
In the service input section, you can choose between 2 kinds of input:
- **RAW**: allow you to send a static payload and some URL parameters to your service
- **Template**: allow you to create the placeholders of your choice and use them to dynamically create the service payload and URL 

### Transform

The transform tab is composed of 3 sections : the Pre-processing , Post-processing and Axes processing function definition. Transformations occur when a service response is received. The transformation is applied in order to structure the data into an X-Y-Z object array format. X and Y represent the coordinates of the datapoint while Z represents the series (more specifically, its name). It is the user's responsability to parse the service response correctly and turn it into this array by providing a proper javascript function.

#### Pre-processing

The pre-processing function is used to prepare the url and payload data based on the defined templates and place holders. The default function should cover most cases.

#### Post-processing

The post-processing function is used to process the response payload and build up an array of three-dimensional items (x,y,z). Typically for a time chart, you would use:

* x: timestamp
* y: value
* z: serie's name

#### Axes processing

Under axes processing you have the possibility to define function for formating and scaling the x and y axes.

### Settings

The settings tab will provide configuration options for the visualization as wells as for managing dependencies between dashlets.

#### Display

Here you manage most display options such as setting title, legend options, managing the refresh mode and more...

Most importantly that's where you will choose the type of visualization between:

* seriesTable
* singleValueTable
* singleValueFullText
* lineChart
* multiBarChart
* scatterChart
* discreteBarChart
* stackedAreaChart

#### Coms

You have the possiblity to link dashlets between each other to avoid firing multiple time the same request when applicable.
In this section, you can define whether this dashlet is a master one or a slave. In the later case you can reference the master dashlet to be used.

### Status

This last tab of the configuration mode not only give you the status by showing alerts under the info section, it also give the possibility to test the dashler under the Execution view

Finally to can save/copy the dashlet in the Manage section.

## Dashboards

Dashboards serve as containers for dashlets. You can decide to add as many dashlets to a dashboard as you wish by expanding the Dashboard options bar and clicking the + button of the management section in these options.

Alternatively, you can clone a dashlet by clicking the clone icon located in the top right corner of the dashlet, in its title bar.

# Sessions

When a session manager is enabled on the page, two toolboxed are displayed: a session management toolbox and a dashboard management toolbox.

## Session management

The session management toolbox allows users to interact with a persistence backend running on the same server hosting the application.

From left to right, the toolbox buttons allow you to:

* start a fresh session with a new name
* search for an existing session in the backend (search by name only as of valpha-036)
* persist a session on the backend
* delete a persisted session in the backend

## Dashboard management toolbox

The dashboard management toolbox enables functionality which applies to all dashboards present in the current session.

From left to right, the toolbox buttons allow you to:

* create a new dashboard tab (either of type "visualization" or "exploration"
* delete all current tabs
* trigger a forced query in all of the current dashlets
* clear the data from all of the current dashlets

## Dashboard tab types

The default and primary type of dashboard tab is "visualization". This type of tab is designed to provide a space-efficient, compact and clean layout for managing multiple dashlets. However, users who engage with the process of configuring a new dashlet or playing with the settings of a new dashlet may want to use the "exploration" type, which has the advantage of displaying all dashlet settings in one screen, thus eliminating the need to toggle constantly between visualization and configuration mode.

When users are done configuring a dahslet in explore mode, they can just copy-paste it from the explore tab to any visualization tab by clicking the Copy and Paste buttons located respectively in the dashlet itself and in the management bar of the target tab.

# Presets

Presets are the programmatic representation of a dashboard's initial state. Presets are written in javascript and allow for the preservation of a specific dashboard state in an immutable form. A comprehensive api is provided to create dashboard presets in javascript (see the next section).

Presets can be loaded straight into a session manager's or dashboard manager's endpoint after creating a new instance.

# API

Dashboard presets can be created through programming by using the viz API. You only need to look at and understand 3 javascript files in order to create your own presets:

## Reference documentation

* [core-classes.js](https://github.com/exense/exense-visualization/blob/master/src/js/core-classes.js): this file contains the object-oriented definition of every component and sub-component involved in the state of a dashlet and of a dashboard
* [object-defaults.js](https://github.com/exense/exense-visualization/blob/master/src/js/object-defaults.js): this file contains default constructor for every class defined in core-classes.js, making the creation of a component much faster, assuming it doesn't need to be customized
* preset file (name can very): depending on the specific application the viz dashboards are integrated with, the preset file is where you will want to both add your dashboard preset class and look for examples at. For instance, in step, that would be the "viz-presets.js" file, which is exposed in the conf/cosmetic folder of the controller in the Enterprise Edition of the product.

## Example

Here is the programmatic definition of the WikimediaDemo dashboard preset provided in step, valid as of version alpha-036 of viz:

```javascript

function WikimediaDemo() {

	var widgetsArray = [];
	var wikimediaTransformFunction = function (response, args) {
		var ret = [];
		var items = response.data.items;
		for(var i=0; i < items.length; i++){
			ret.push({x: items[i].timestamp, y: items[i].views, z: 'views'});
		}
		return ret;
	};

	var wikimediaBaseQuery = new SimpleQuery(
			"Raw", new Service(
					"", "Get","",
					new DefaultPreproc(),
					new Postproc("", wikimediaTransformFunction.toString(), [], {}, "")
			)
	);
	var wikimediaQueryTemplate = new TemplatedQuery(
			"Plain",
			wikimediaBaseQuery,
			new DefaultPaging(),
			new Controls(new Template("","https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/Foo/daily/__dayFrom__/__dayTo__",
					[new Placeholder("__dayFrom__", "20151010", false), new Placeholder("__dayTo__", "20151030", false)]))
	);

	var xAxisFn = function(d) {
		var str = d.toString();
		var year = str.substring(0,4);
		var month = str.substring(4, 6);
		var day = str.substring(6, 8);
		return year + '-' + month + '-' + day;
	};

	var options = new EffectiveChartOptions('lineChart', xAxisFn.toString());
	options.showLegend = true;

	var widget = new Widget(getUniqueId(), new WidgetState('col-md-12', false, true), new DashletState(" Daily wikimedia stats", false, 0, {}, options, new Config('Fire','Off', false, false, ''), wikimediaQueryTemplate, new DefaultGuiClosed(), new DefaultInfo()));

	widgetsArray.push(widget);

	var dashboardObject = new Dashboard(
			'Daily Stats',
			new DashboardState(
					new GlobalSettings(
							[new Placeholder("__businessobjectid__", "", false)],
							false,
							false,
							'Global Settings',
							3000
					),
					widgetsArray,
					'Wikimedia Dashboard',
					'aggregated',
					new DefaultDashboardGui()
			)
	);

	return dashboardObject;
}

```


