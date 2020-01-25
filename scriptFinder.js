var Configuration = {
	searchInputId: "search-script-input",
	scriptsListId: "scripts-list",
	filterBtnId: "filter-scripts",
	scripts: [],
	filteredScripts: [],
	searchedScripts: [],
	favouritesOnlyFilter: false,
	selectedScript: null
};

// Labels Tag Component
const labels = function (labels){
	var _labels = document.createElement("div");
	_labels.className = "labels";
	labels.forEach((label, i) => {
		let __label = document.createElement("label");
		__label.innerText = label;
		_labels.appendChild(__label);
	});
	return _labels;
}


// Scripts List Component
const ScriptsList = function (scripts){
	var list = document.getElementById(Configuration.scriptsListId);
	list.innerHTML = "";

	// Script Item
	function Script (script){
		var li = document.createElement("li");

		// Highlight Selected Script
		if (script === Configuration.selectedScript) {
			li.classList.add("active");
		}

		var a = document.createElement("a");
		a.href = "javascript:void(0)"
		a.innerText = script.name;

		li.appendChild(a);
		li.appendChild(labels(script.metaAttributes.labels));

		// Marking if script is Favourite
		if (script.isFavourite) {
			var icon = document.createElement("i");
			icon.classList = "fas fa-star icon";
			icon.classList.add("fav");
			li.appendChild(icon);
		}

		// Adding click handlers on script li items
		li.addEventListener("click", function(e) {
			if(document.querySelector("li.active"))
				document.querySelector("li.active").classList.remove("active")
			e.currentTarget.classList.add("active");
			Configuration.selectedScript = script;
			ScriptDetails();
		});

		return li;
	}

	// Iterating and adding scripts
	scripts.forEach((script, i) => {
		list.appendChild(Script(script));
	});
}


// Script Details Component
const ScriptDetails = function (){
	// Getting script information container
	var scriptDetails = document.getElementById("script-information"); 
	scriptDetails.innerHTML = "";

	// H1 for Script Name
	var h1 = document.createElement("h1");
	h1.innerText = Configuration.selectedScript.name;
	scriptDetails.appendChild(h1);

	// Display labels in script
	scriptDetails.appendChild(labels(Configuration.selectedScript.metaAttributes.labels));

	var scriptMetaData = document.createElement("div");
	scriptMetaData.classList.add("metadata-details");

	// Displaying Metadata Information
	var p1 = document.createElement("p");
	p1.innerText = "Owner: "+ Configuration.selectedScript.metaAttributes.owner +" | Last Updated: " + Configuration.selectedScript.metaAttributes.lastUpdated;
	var p2 = document.createElement("p");
	p2.innerText = "Created By: "+ Configuration.selectedScript.metaAttributes.createdBy +" on " + Configuration.selectedScript.metaAttributes.createdOn;
	var p3 = document.createElement("p");
	p3.innerText = "Source: " + Configuration.selectedScript.metaAttributes.source;

	scriptMetaData.appendChild(p1);
	scriptMetaData.appendChild(p2);
	scriptMetaData.appendChild(p3);

	scriptDetails.appendChild(scriptMetaData);

	// Favourite Section
	var favourite = document.createElement("div");
	favourite.classList.add("favourite-script");
	var icon = document.createElement("i");
	icon.classList = "fas fa-star icon";
	var p = document.createElement("p");
	p.innerText = "Mark as Favourite";
	if (Configuration.selectedScript.isFavourite) {
		icon.classList.add("fav");
		p.innerText = "Marked as Favourite";
	}
	favourite.appendChild(icon);
	favourite.appendChild(p);

	// Adding Event Listner to toggle favourite selection
	favourite.addEventListener("click", function (e){
		let _script = Configuration.scripts.filter(script => script.name === Configuration.selectedScript.name)[0];
		_script.isFavourite = !_script.isFavourite;
		ScriptFinder.filter();
		ScriptDetails();
	});

	scriptDetails.appendChild(favourite);
}


// FilterBox Component
const FilterBox = function(){
	var filterList = document.querySelector(".filter-items ul");
	filterList.innerHTML = "";
	Configuration.labels.forEach((label, i) => {
		// Create list item Element
		let li = document.createElement("li");

		// Create checkbox Element
		let checkbox = document.createElement("input");
		checkbox.name = "labels";
		checkbox.value = label;
		checkbox.type = "checkbox";
		li.appendChild(checkbox);

		// Creating span element to hold label name
		let span = document.createElement("span");
		span.innerText = label;
		li.appendChild(span);
		filterList.appendChild(li);
	});

	// Get All Labels
	var filterListItems = document.querySelectorAll(".filter-items ul li");

	// Select all labels
	(function selectAll(){
		document.querySelector(".filter-container #filter-all").addEventListener("click", function(e){
			e.stopPropagation();
			e.preventDefault();
			Array.from(filterListItems).forEach((checkbox, i) => {
				checkbox.childNodes[0].checked = true;
			});
		});
	})();

	// Select None
	(function selectNone(){
		document.querySelector(".filter-container #filter-none").addEventListener("click", function(e){
			e.stopPropagation();
			e.preventDefault();
			Array.from(filterListItems).forEach((checkbox, i) => {
				checkbox.childNodes[0].checked = false;
			});
		});
	})();

	// Apply Filter
	(function applyFilter(){
		document.querySelector(".filter-container .filter-apply").addEventListener("click", function(e){
			e.stopPropagation();
			e.preventDefault();
			ScriptFinder.filter();
			document.getElementById(Configuration.filterBtnId).classList.remove("active");
		});
	})();

	// Reset Filter
	(function resetFilter(){
		document.querySelector(".filter-container .filter-reset").addEventListener("click", function(e){
			e.stopPropagation();
			e.preventDefault();
			ScriptsList(Configuration.searchedScripts);

			// Close Filter Box
			document.getElementById(Configuration.filterBtnId).classList.remove("active");
			
			// Uncheck all labels
			Array.from(filterListItems).forEach((checkbox, i) => {
				checkbox.childNodes[0].checked = false;
			});
			
			// Remove Filter Number
			let filterIcon = document.getElementById("filter-icon");
			filterIcon.innerHTML = "";

			// Remove Show only Favourites
			Configuration.favouritesOnlyFilter = false;
			document.getElementById("favourites-only").checked = false;

		});
	})();
}


// ScriptFinder Module with all the actions
var ScriptFinder = function(){
	return {
		init: function(scripts) {
			// Setting Configuration values
			Configuration.searchInputId = "search-script-input";
			Configuration.scriptsListId = "scripts-list";
			Configuration.filterBtnId = "filter-scripts";
			Configuration.scripts = scripts || [];
			Configuration.filteredScripts = scripts;
			Configuration.searchedScripts = scripts;
			Configuration.selectedScript = scripts[0];

			// Render Scripts List Component
			ScriptsList(Configuration.scripts);

			// Render Script Details
			ScriptDetails();

			// initialize Search & Filter
			ScriptFinder.initializeSearch();
			ScriptFinder.initializeFilter();
		},
		initializeSearch: function(){
			// Initializing Search
			document.getElementById(Configuration.searchInputId).addEventListener("input", function(e) {
				ScriptFinder.search(e.target.value);
			});
		},
		search: function(keyword) {
			Configuration.searchedScripts = Configuration.scripts.filter(script => script.name.toLowerCase().includes(keyword.toLowerCase()));
			// ScriptsList(Configuration.searchedScripts);
			ScriptFinder.filter();
		},
		initializeFilter: function(){
			// Initializing Filter

			// Adding click handler on filter icon
			document.getElementById(Configuration.filterBtnId).addEventListener("click", function(e) {
				e.stopPropagation();
				e.currentTarget.classList.toggle("active");
			});

			// Adding Click handler on body to close filter box when clicked outside
			document.getElementById("filter-container").addEventListener("click", function(e) {
				e.stopPropagation();
			});
			Array.from(document.getElementsByTagName("body"))[0].addEventListener("click", function(e){
				document.getElementById(Configuration.filterBtnId).classList.remove("active");
			});

			// Getting all the labels from scripts
			Configuration.labels = [];
			Configuration.scripts.forEach((script, i)=> {
				script.metaAttributes.labels.forEach((label, j) => {
					if(!Configuration.labels.includes(label))
						Configuration.labels.push(label);
				})
			});
			FilterBox();
		},
		filter: function(){
			// Getting selected Filters
			var selectedLabels = [];
			var filterList = document.querySelectorAll(".filter-items ul li");
			Array.from(filterList).forEach((checkbox, i) => {
				if(checkbox.childNodes[0].checked)
					selectedLabels.push(checkbox.childNodes[0].value)
			});

			// Checking for favourites only checkbox
			Configuration.favouritesOnlyFilter = document.getElementById("favourites-only").checked;

			Configuration.filteredScripts = [];

			var searchedScripts = Configuration.searchedScripts;

			if (Configuration.favouritesOnlyFilter) {
				searchedScripts = Configuration.searchedScripts.filter(script => script.isFavourite);
			}

			// Filtering Scripts
			searchedScripts.forEach((script, i)=> {
				if (!Configuration.filteredScripts.includes(script))
					script.metaAttributes.labels.forEach((label, i)=> {
						if (selectedLabels.includes(label)){
							Configuration.filteredScripts.push(script);
							return true;
						}
					});
			});

			// Updating Filtered Number Icons
			let filterIcon = document.getElementById("filter-icon");
			if (selectedLabels.length > 0) {
				ScriptsList(Configuration.filteredScripts);
				let span = document.createElement("span");
				span.innerText = selectedLabels.length;

				filterIcon.innerHTML = "";
				filterIcon.appendChild(span);
			}
			else{
				ScriptsList(searchedScripts);
				filterIcon.innerHTML = "";
			}
		},
		viewScript: function(script){
			Configuration.selectedScript = script;
			ScriptDetails();
		}
	}
}();