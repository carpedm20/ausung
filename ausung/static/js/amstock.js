(function() {
    var d = window.AmCharts;
    d.AmStockChart = d.Class({
        construct: function(a) {
            this.type = "stock";
            this.cname = "AmStockChart";
            d.addChart(this);
            this.version = "3.14.1";
            this.theme = a;
            this.createEvents("zoomed", "rollOverStockEvent", "rollOutStockEvent", "clickStockEvent", "panelRemoved", "dataUpdated", "init", "rendered", "drawn", "resized");
            this.colors = "#FF6600 #FCD202 #B0DE09 #0D8ECF #2A0CD0 #CD0D74 #CC0000 #00CC00 #0000CC #DDDDDD #999999 #333333 #990000".split(" ");
            this.firstDayOfWeek = 1;
            this.glueToTheEnd = !1;
            this.dataSetCounter = -1;
            this.zoomOutOnDataSetChange = !1;
            this.panels = [];
            this.dataSets = [];
            this.chartCursors = [];
            this.comparedDataSets = [];
            this.classNamePrefix = "amcharts";
            this.categoryAxesSettings = new d.CategoryAxesSettings(a);
            this.valueAxesSettings = new d.ValueAxesSettings(a);
            this.panelsSettings = new d.PanelsSettings(a);
            this.chartScrollbarSettings = new d.ChartScrollbarSettings(a);
            this.chartCursorSettings = new d.ChartCursorSettings(a);
            this.stockEventsSettings = new d.StockEventsSettings(a);
            this.legendSettings = new d.LegendSettings(a);
            this.balloon = new d.AmBalloon(a);
            this.previousEndDate = new Date(0);
            this.previousStartDate = new Date(0);
            this.dataSetCount = this.graphCount = 0;
            this.chartCreated = !1;
            this.extendToFullPeriod = !0;
            d.applyTheme(this, a, this.cname)
        },
        write: function(a) {
            var b = this.theme;
            this.initHC || (d.callInitHandler(this), this.initHC = !0);
            d.applyLang(this.language, this);
            this.chartCursors = [];
            var c = this.exportConfig;
            c && d.AmExport && !this.AmExport && (this.AmExport = new d.AmExport(this, c));
            this.amExport && d.AmExport && (this.AmExport = d.extend(this.amExport,
                new d.AmExport(this), !0));
            this.AmExport && this.AmExport.init();
            this.chartRendered = !1;
            a = "object" != typeof a ? document.getElementById(a) : a;
            this.zoomOutOnDataSetChange && (this.endDate = this.startDate = void 0);
            this.categoryAxesSettings = d.processObject(this.categoryAxesSettings, d.CategoryAxesSettings, b);
            this.valueAxesSettings = d.processObject(this.valueAxesSettings, d.ValueAxesSettings, b);
            this.chartCursorSettings = d.processObject(this.chartCursorSettings, d.ChartCursorSettings, b);
            this.chartScrollbarSettings = d.processObject(this.chartScrollbarSettings,
                d.ChartScrollbarSettings, b);
            this.legendSettings = d.processObject(this.legendSettings, d.LegendSettings, b);
            this.panelsSettings = d.processObject(this.panelsSettings, d.PanelsSettings, b);
            this.stockEventsSettings = d.processObject(this.stockEventsSettings, d.StockEventsSettings, b);
            this.dataSetSelector && (this.dataSetSelector = d.processObject(this.dataSetSelector, d.DataSetSelector, b));
            this.periodSelector && (this.periodSelector = d.processObject(this.periodSelector, d.PeriodSelector, b));
            a.innerHTML = "";
            this.div = a;
            this.measure();
            this.createLayout();
            this.updateDataSets();
            this.addDataSetSelector();
            this.addPeriodSelector();
            this.addPanels();
            this.updatePanels();
            this.addChartScrollbar();
            this.updateData();
            this.skipDefault || this.setDefaultPeriod()
        },
        setDefaultPeriod: function(a) {
            var b = this.periodSelector;
            b && (this.animationPlayed = !1, b.setDefaultPeriod(a))
        },
        validateSize: function() {
            this.measurePanels()
        },
        updateDataSets: function() {
            var a = this.mainDataSet,
                b = this.dataSets,
                c;
            for (c = 0; c < b.length; c++) {
                var e = b[c],
                    e = d.processObject(e, d.DataSet);
                b[c] = e;
                e.id || (this.dataSetCount++, e.id = "ds" + this.dataSetCount);
                void 0 === e.color && (e.color = this.colors.length - 1 > c ? this.colors[c] : d.randomColor())
            }!a && d.ifArray(b) && (this.mainDataSet = this.dataSets[0])
        },
        updateEvents: function(a) {
            d.ifArray(a.stockEvents) && d.parseEvents(a, this.panels, this.stockEventsSettings, this.firstDayOfWeek, this, this.dataDateFormat)
        },
        getLastDate: function(a) {
            a = d.getDate(a, this.dataDateFormat, "fff");
            return new Date(d.changeDate(a, this.categoryAxesSettings.minPeriod, 1, !0).getTime() - 1)
        },
        getFirstDate: function(a) {
            a = d.getDate(a, this.dataDateFormat, "fff");
            return new Date(d.resetDateToMin(a, this.categoryAxesSettings.minPeriod, 1, this.firstDayOfWeek))
        },
        updateData: function() {
            var a = this.mainDataSet;
            if (a) {
                var b = this.categoryAxesSettings; - 1 == d.getItemIndex(b.minPeriod, b.groupToPeriods) && b.groupToPeriods.unshift(b.minPeriod);
                var c = a.dataProvider;
                if (d.ifArray(c)) {
                    var e = a.categoryField;
                    this.firstDate = this.getFirstDate(c[0][e]);
                    this.lastDate = this.getLastDate(c[c.length - 1][e]);
                    this.periodSelector &&
                        this.periodSelector.setRanges(this.firstDate, this.lastDate);
                    a.dataParsed || (d.parseStockData(a, b.minPeriod, b.groupToPeriods, this.firstDayOfWeek, this.dataDateFormat), a.dataParsed = !0);
                    this.updateComparingData();
                    this.updateEvents(a)
                } else this.lastDate = this.firstDate = void 0;
                this.glueToTheEnd && this.startDate && this.endDate && this.lastDate && (this.startDate = new Date(this.startDate.getTime() + (this.lastDate.getTime() - this.endDate.getTime())), this.endDate = this.lastDate, this.updateScrollbar = !0);
                this.updatePanelsWithNewData()
            }
            a = {
                type: "dataUpdated",
                chart: this
            };
            this.fire(a.type, a)
        },
        updateComparingData: function() {
            var a = this.comparedDataSets,
                b = this.categoryAxesSettings,
                c;
            for (c = 0; c < a.length; c++) {
                var e = a[c];
                e.dataParsed || (d.parseStockData(e, b.minPeriod, b.groupToPeriods, this.firstDayOfWeek, this.dataDateFormat), e.dataParsed = !0);
                this.updateEvents(e)
            }
        },
        createLayout: function() {
            var a = this.div,
                b, c, e = this.classNamePrefix,
                d = document.createElement("div");
            d.style.position = "relative";
            this.containerDiv = d;
            d.className = e + "-stock-div";
            a.appendChild(d);
            if (a = this.periodSelector) b = a.position;
            if (a = this.dataSetSelector) c = a.position;
            if ("left" == b || "left" == c) a = document.createElement("div"), a.className = e + "-left-div", a.style.cssFloat = "left", a.style.styleFloat = "left", a.style.width = "0px", a.style.position = "absolute", d.appendChild(a), this.leftContainer = a;
            if ("right" == b || "right" == c) b = document.createElement("div"), b.className = e + "-right-div", b.style.cssFloat = "right", b.style.styleFloat = "right", b.style.width = "0px", d.appendChild(b), this.rightContainer = b;
            b = document.createElement("div");
            b.className = e + "-center-div";
            d.appendChild(b);
            this.centerContainer = b;
            d = document.createElement("div");
            d.className = e + "-panels-div";
            b.appendChild(d);
            this.panelsContainer = d
        },
        addPanels: function() {
            this.measurePanels(!0);
            for (var a = this.panels, b = 0; b < a.length; b++) {
                var c = a[b],
                    c = d.processObject(c, d.StockPanel, this.theme, !0);
                a[b] = c;
                this.addStockPanel(c, b)
            }
            this.panelsAdded = !0
        },
        measurePanels: function(a) {
            this.measure();
            var b = this.chartScrollbarSettings,
                c = this.divRealHeight,
                e = this.divRealWidth;
            if (this.div) {
                var d =
                    this.panelsSettings.panelSpacing;
                b.enabled && (c -= b.height);
                (b = this.periodSelector) && !b.vertical && (b = b.offsetHeight, c -= b + d);
                (b = this.dataSetSelector) && !b.vertical && (b = b.offsetHeight, c -= b + d);
                a || c == this.prevPH && this.prevPW == e || this.fire("resized", {
                    type: "resized",
                    chart: this
                });
                this.prevPW != e && (this.prevPW = e);
                if (c != this.prevPH) {
                    a = this.panels;
                    0 < c && (this.panelsContainer.style.height = c + "px");
                    for (var e = 0, l, b = 0; b < a.length; b++)
                        if (l = a[b]) {
                            var k = l.percentHeight;
                            isNaN(k) && (k = 100 / a.length, l.percentHeight = k);
                            e += k
                        }
                    this.panelsHeight =
                        Math.max(c - d * (a.length - 1), 0);
                    for (b = 0; b < a.length; b++)
                        if (l = a[b]) l.percentHeight = l.percentHeight / e * 100, l.panelBox && (l.panelBox.style.height = Math.round(l.percentHeight * this.panelsHeight / 100) + "px");
                    this.prevPH = c
                }
            }
        },
        addStockPanel: function(a, b) {
            var c = this.panelsSettings,
                e = document.createElement("div");
            0 < b && !this.panels[b - 1].showCategoryAxis && (e.style.marginTop = c.panelSpacing + "px");
            a.hideBalloonReal();
            a.panelBox = e;
            a.stockChart = this;
            a.id || (a.id = "stockPanel" + b);
            e.className = "amChartsPanel " + this.classNamePrefix +
                "-stock-panel-div " + this.classNamePrefix + "-stock-panel-div-" + a.id;
            a.pathToImages = this.pathToImages;
            e.style.height = Math.round(a.percentHeight * this.panelsHeight / 100) + "px";
            e.style.width = "100%";
            this.panelsContainer.appendChild(e);
            0 < c.backgroundAlpha && (e.style.backgroundColor = c.backgroundColor);
            if (e = a.stockLegend) e = d.processObject(e, d.StockLegend, this.theme), e.container = void 0, e.title = a.title, e.marginLeft = c.marginLeft, e.marginRight = c.marginRight, e.verticalGap = 3, e.position = "top", d.copyProperties(this.legendSettings,
                e), a.addLegend(e, e.divId);
            a.zoomOutText = "";
            this.addCursor(a)
        },
        enableCursors: function(a) {
            var b = this.chartCursors,
                c;
            for (c = 0; c < b.length; c++) b[c].enabled = a
        },
        updatePanels: function() {
            var a = this.panels,
                b;
            for (b = 0; b < a.length; b++) this.updatePanel(a[b]);
            this.mainDataSet && this.updateGraphs();
            this.currentPeriod = void 0
        },
        updatePanel: function(a) {
            a.seriesIdField = "amCategoryIdField";
            a.dataProvider = [];
            a.chartData = [];
            a.graphs = [];
            var b = a.categoryAxis,
                c = this.categoryAxesSettings;
            d.copyProperties(this.panelsSettings, a);
            d.copyProperties(c, b);
            b.parseDates = !0;
            a.addClassNames = this.addClassNames;
            a.classNamePrefix = this.classNamePrefix;
            a.zoomOutOnDataUpdate = !1;
            a.mouseWheelScrollEnabled = this.mouseWheelScrollEnabled;
            a.dataDateFormat = this.dataDateFormat;
            a.language = this.language;
            a.showCategoryAxis ? "top" == b.position ? a.marginTop = c.axisHeight : a.marginBottom = c.axisHeight : (a.categoryAxis.labelsEnabled = !1, a.chartCursor && (a.chartCursor.categoryBalloonEnabled = !1));
            var c = a.valueAxes,
                e = c.length,
                h;
            0 === e && (h = new d.ValueAxis(this.theme),
                a.addValueAxis(h));
            b = new d.AmBalloon(this.theme);
            d.copyProperties(this.balloon, b);
            a.balloon = b;
            c = a.valueAxes;
            e = c.length;
            for (b = 0; b < e; b++) h = c[b], d.copyProperties(this.valueAxesSettings, h);
            a.listenersAdded = !1;
            a.write(a.panelBox)
        },
        zoom: function(a, b) {
            this.zoomChart(a, b)
        },
        zoomOut: function() {
            this.zoomChart(this.firstDate, this.lastDate)
        },
        updatePanelsWithNewData: function() {
            var a = this.mainDataSet,
                b = this.scrollbarChart;
            if (a) {
                var c = this.panels;
                this.currentPeriod = void 0;
                var e;
                for (e = 0; e < c.length; e++) {
                    var d = c[e];
                    d.categoryField = a.categoryField;
                    0 === a.dataProvider.length && (d.dataProvider = []);
                    d.scrollbarChart = b
                }
                b && (c = this.categoryAxesSettings, e = c.minPeriod, b.categoryField = a.categoryField, 0 < a.dataProvider.length ? (d = this.chartScrollbarSettings.usePeriod, b.dataProvider = d ? a.agregatedDataProviders[d] : a.agregatedDataProviders[e]) : b.dataProvider = [], d = b.categoryAxis, d.minPeriod = e, d.firstDayOfWeek = this.firstDayOfWeek, d.equalSpacing = c.equalSpacing, d.axisAlpha = 0, d.markPeriodChange = c.markPeriodChange, b.bbsetr = !0, b.validateData(),
                    c = this.panelsSettings, b.maxSelectedTime = c.maxSelectedTime, b.minSelectedTime = c.minSelectedTime);
                0 < a.dataProvider.length && this.zoomChart(this.startDate, this.endDate)
            }
            this.panelDataInvalidated = !1
        },
        addChartScrollbar: function() {
            var a = this.chartScrollbarSettings,
                b = this.scrollbarChart;
            b && (b.clear(), b.destroy());
            if (a.enabled) {
                var c = this.panelsSettings,
                    e = this.categoryAxesSettings,
                    b = new d.AmSerialChart(this.theme);
                b.language = this.language;
                b.pathToImages = this.pathToImages;
                b.autoMargins = !1;
                this.scrollbarChart =
                    b;
                b.id = "scrollbarChart";
                b.scrollbarOnly = !0;
                b.zoomOutText = "";
                b.marginLeft = c.marginLeft;
                b.marginRight = c.marginRight;
                b.marginTop = 0;
                b.marginBottom = 0;
                var c = e.dateFormats,
                    h = b.categoryAxis;
                h.boldPeriodBeginning = e.boldPeriodBeginning;
                c && (h.dateFormats = e.dateFormats);
                h.labelsEnabled = !1;
                h.parseDates = !0;
                e = a.graph;
                if (d.isString(e)) {
                    c = this.panels;
                    for (h = 0; h < c.length; h++) {
                        var l = d.getObjById(c[h].stockGraphs, a.graph);
                        l && (e = l)
                    }
                    a.graph = e
                }
                var k;
                e && (k = new d.AmGraph(this.theme), k.valueField = e.valueField, k.periodValue =
                    e.periodValue, k.type = e.type, k.connect = e.connect, k.minDistance = a.minDistance, b.addGraph(k));
                e = new d.ChartScrollbar(this.theme);
                b.addChartScrollbar(e);
                d.copyProperties(a, e);
                e.scrollbarHeight = a.height;
                e.graph = k;
                this.listenTo(e, "zoomed", this.handleScrollbarZoom);
                k = document.createElement("div");
                k.className = this.classNamePrefix + "-scrollbar-chart-div";
                k.style.height = a.height + "px";
                e = this.periodSelectorContainer;
                c = this.periodSelector;
                h = this.centerContainer;
                "bottom" == a.position ? c ? "bottom" == c.position ? h.insertBefore(k,
                    e) : h.appendChild(k) : h.appendChild(k) : c ? "top" == c.position ? h.insertBefore(k, e.nextSibling) : h.insertBefore(k, h.firstChild) : h.insertBefore(k, h.firstChild);
                b.write(k)
            }
        },
        handleScrollbarZoom: function(a) {
            if (this.skipScrollbarEvent) this.skipScrollbarEvent = !1;
            else {
                var b = a.endDate,
                    c = {};
                c.startDate = a.startDate;
                c.endDate = b;
                this.updateScrollbar = !1;
                this.handleZoom(c)
            }
        },
        addPeriodSelector: function() {
            var a = this.periodSelector;
            if (a) {
                var b = this.categoryAxesSettings.minPeriod;
                a.minDuration = d.getPeriodDuration(b);
                a.minPeriod =
                    b;
                a.chart = this;
                var c = this.dataSetSelector,
                    e, b = this.dssContainer;
                c && (e = c.position);
                var c = this.panelsSettings.panelSpacing,
                    h = document.createElement("div");
                this.periodSelectorContainer = h;
                var l = this.leftContainer,
                    k = this.rightContainer,
                    g = this.centerContainer,
                    m = this.panelsContainer,
                    f = a.width + 2 * c + "px";
                switch (a.position) {
                    case "left":
                        l.style.width = a.width + "px";
                        l.appendChild(h);
                        g.style.paddingLeft = f;
                        break;
                    case "right":
                        g.style.marginRight = f;
                        k.appendChild(h);
                        k.style.width = a.width + "px";
                        break;
                    case "top":
                        m.style.clear =
                            "both";
                        g.insertBefore(h, m);
                        h.style.paddingBottom = c + "px";
                        h.style.overflow = "hidden";
                        break;
                    case "bottom":
                        h.style.marginTop = c + "px", "bottom" == e ? g.insertBefore(h, b) : g.appendChild(h)
                }
                this.listenTo(a, "changed", this.handlePeriodSelectorZoom);
                a.write(h)
            }
        },
        addDataSetSelector: function() {
            var a = this.dataSetSelector;
            if (a) {
                a.chart = this;
                a.dataProvider = this.dataSets;
                var b = a.position,
                    c = this.panelsSettings.panelSpacing,
                    e = document.createElement("div");
                this.dssContainer = e;
                var d = this.leftContainer,
                    l = this.rightContainer,
                    k = this.centerContainer,
                    g = this.panelsContainer,
                    c = a.width + 2 * c + "px";
                switch (b) {
                    case "left":
                        d.style.width = a.width + "px";
                        d.appendChild(e);
                        k.style.paddingLeft = c;
                        break;
                    case "right":
                        k.style.marginRight = c;
                        l.appendChild(e);
                        l.style.width = a.width + "px";
                        break;
                    case "top":
                        g.style.clear = "both";
                        k.insertBefore(e, g);
                        e.style.overflow = "hidden";
                        break;
                    case "bottom":
                        k.appendChild(e)
                }
                a.write(e)
            }
        },
        handlePeriodSelectorZoom: function(a) {
            var b = this.scrollbarChart;
            b && (b.updateScrollbar = !0);
            a.predefinedPeriod ? (this.predefinedStart =
                a.startDate, this.predefinedEnd = a.endDate) : this.predefinedEnd = this.predefinedStart = null;
            this.zoomChart(a.startDate, a.endDate)
        },
        addCursor: function(a) {
            var b = this.chartCursorSettings;
            if (b.enabled) {
                var c = new d.ChartCursor(this.theme);
                d.copyProperties(b, c);
                a.chartCursor && d.copyProperties(a.chartCursor, c);
                a.removeChartCursor();
                a.addChartCursor(c);
                this.listenTo(c, "changed", this.handleCursorChange);
                this.listenTo(c, "onHideCursor", this.hideChartCursor);
                this.listenTo(c, "zoomed", this.handleCursorZoom);
                this.chartCursors.push(c)
            }
        },
        hideChartCursor: function() {
            var a = this.chartCursors,
                b;
            for (b = 0; b < a.length; b++) {
                var c = a[b];
                c.hideCursor(!1);
                (c = c.chart) && c.updateLegendValues()
            }
        },
        handleCursorZoom: function(a) {
            var b = this.scrollbarChart;
            b && (b.updateScrollbar = !0);
            var b = {},
                c;
            if (this.categoryAxesSettings.equalSpacing) {
                var e = this.mainDataSet.categoryField,
                    d = this.mainDataSet.agregatedDataProviders[this.currentPeriod];
                c = new Date(d[a.start][e]);
                a = new Date(d[a.end][e])
            } else c = new Date(a.start), a = new Date(a.end);
            b.startDate = c;
            b.endDate = a;
            this.handleZoom(b)
        },
        handleZoom: function(a) {
            this.zoomChart(a.startDate, a.endDate)
        },
        zoomChart: function(a, b) {
            var c = new Date(a),
                e = this,
                h = e.firstDate,
                l = e.lastDate,
                k = e.currentPeriod,
                g = e.categoryAxesSettings,
                m = g.minPeriod,
                f = e.panelsSettings,
                p = e.periodSelector,
                r = e.panels,
                t = e.comparedGraphs,
                x = e.scrollbarChart,
                y = e.firstDayOfWeek;
            if (h && l) {
                a || (a = h);
                b || (b = l);
                if (k) {
                    var n = d.extractPeriod(k);
                    a.getTime() == b.getTime() && n != m && (b = d.changeDate(b, n.period, n.count), b.setTime(b.getTime() - 1))
                }
                a.getTime() < h.getTime() && (a = h);
                a.getTime() > l.getTime() &&
                    (a = l);
                b.getTime() < h.getTime() && (b = h);
                b.getTime() > l.getTime() && (b = l);
                m = d.getItemIndex(m, g.groupToPeriods);
                g = k;
                k = e.choosePeriod(m, a, b);
                e.currentPeriod = k;
                var m = d.extractPeriod(k),
                    z = d.getPeriodDuration(m.period, m.count);
                1 > b.getTime() - a.getTime() && (a = new Date(b.getTime() - 1));
                n = d.newDate(a);
                e.extendToFullPeriod && (n.getTime() - h.getTime() < .1 * z && (n = d.resetDateToMin(a, m.period, m.count, y)), l.getTime() - b.getTime() < .1 * z && (b = d.resetDateToMin(l, m.period, m.count, y), b = d.changeDate(b, m.period, m.count, !0)));
                for (h = 0; h <
                    r.length; h++) l = r[h], l.chartCursor && l.chartCursor.panning && (n = c);
                for (h = 0; h < r.length; h++) {
                    l = r[h];
                    if (k != g) {
                        for (c = 0; c < t.length; c++) z = t[c].graph, z.dataProvider = z.dataSet.agregatedDataProviders[k];
                        c = l.categoryAxis;
                        c.firstDayOfWeek = y;
                        c.minPeriod = k;
                        l.dataProvider = e.mainDataSet.agregatedDataProviders[k];
                        if (c = l.chartCursor) c.categoryBalloonDateFormat = e.chartCursorSettings.categoryBalloonDateFormat(m.period), l.showCategoryAxis || (c.categoryBalloonEnabled = !1);
                        l.startTime = n.getTime();
                        l.endTime = b.getTime();
                        l.validateData(!0)
                    }
                    c = !1;
                    l.chartCursor && l.chartCursor.panning && (c = !0);
                    c || (l.startTime = void 0, l.endTime = void 0, l.zoomToDates(n, b));
                    0 < f.startDuration && e.animationPlayed && !c ? (l.startDuration = 0, l.animateAgain()) : 0 < f.startDuration && !c && l.animateAgain()
                }
                e.animationPlayed = !0;
                f = new Date(b);
                x && e.updateScrollbar && (x.zoomToDates(a, f), e.skipScrollbarEvent = !0, setTimeout(function() {
                    e.resetSkip.call(e)
                }, 100));
                e.updateScrollbar = !0;
                e.startDate = a;
                e.endDate = b;
                p && p.zoom(a, b);
                if (a.getTime() != e.previousStartDate.getTime() || b.getTime() != e.previousEndDate.getTime()) p = {
                    type: "zoomed"
                }, p.startDate = a, p.endDate = b, p.chart = e, p.period = k, e.fire(p.type, p), e.previousStartDate = new Date(a), e.previousEndDate = new Date(b)
            }
            e.eventsHidden && e.showHideEvents(!1);
            e.chartCreated || (k = "init", e.fire(k, {
                type: k,
                chart: e
            }));
            e.chartRendered || (k = "rendered", e.fire(k, {
                type: k,
                chart: e
            }), e.chartRendered = !0);
            k = "drawn";
            e.fire(k, {
                type: k,
                chart: e
            });
            e.chartCreated = !0;
            e.animationPlayed = !0
        },
        resetSkip: function() {
            this.skipScrollbarEvent = !1
        },
        updateGraphs: function() {
            this.getSelections();
            if (0 < this.dataSets.length) {
                var a =
                    this.panels;
                this.comparedGraphs = [];
                var b;
                for (b = 0; b < a.length; b++) {
                    var c = a[b],
                        e = c.valueAxes,
                        h;
                    for (h = 0; h < e.length; h++) {
                        var l = e[h];
                        l.prevLog && (l.logarithmic = l.prevLog);
                        l.recalculateToPercents = "always" == c.recalculateToPercents ? !0 : !1
                    }
                    e = this.mainDataSet;
                    h = this.comparedDataSets;
                    l = c.stockGraphs;
                    c.graphs = [];
                    var k, g, m;
                    for (k = 0; k < l.length; k++) {
                        var f = l[k],
                            f = d.processObject(f, d.StockGraph, this.theme);
                        l[k] = f;
                        if (!f.title || f.resetTitleOnDataSetChange) f.title = e.title, f.resetTitleOnDataSetChange = !0;
                        f.useDataSetColors &&
                            (f.lineColor = e.color, f.fillColors = void 0, f.bulletColor = void 0);
                        var p = !1,
                            r = e.fieldMappings;
                        for (g = 0; g < r.length; g++) {
                            m = r[g];
                            var t = f.valueField;
                            t && m.toField == t && (p = !0);
                            (t = f.openField) && m.toField == t && (p = !0);
                            (t = f.closeField) && m.toField == t && (p = !0);
                            (t = f.lowField) && m.toField == t && (p = !0)
                        }
                        c.addGraph(f);
                        p || (f.visibleInLegend = !1);
                        t = !1;
                        "always" == c.recalculateToPercents && (t = !0);
                        var x = c.stockLegend,
                            y, n, z, A;
                        x && (x = d.processObject(x, d.StockLegend, this.theme), c.stockLegend = x, y = x.valueTextComparing, n = x.valueTextRegular,
                            z = x.periodValueTextComparing, A = x.periodValueTextRegular);
                        if (f.comparable) {
                            var B = h.length;
                            if (f.valueAxis) {
                                0 < B && f.valueAxis.logarithmic && "never" != c.recalculateToPercents && (f.valueAxis.logarithmic = !1, f.valueAxis.prevLog = !0);
                                0 < B && "whenComparing" == c.recalculateToPercents && (f.valueAxis.recalculateToPercents = !0);
                                x && f.valueAxis && !0 === f.valueAxis.recalculateToPercents && (t = !0);
                                var D;
                                for (D = 0; D < B; D++) {
                                    var C = h[D],
                                        u = f.comparedGraphs[C.id];
                                    u || (u = new d.AmGraph(this.theme), u.id = "comparedGraph" + D + "_" + k + C.id);
                                    u.periodValue =
                                        f.periodValue;
                                    u.dataSet = C;
                                    u.behindColumns = f.behindColumns;
                                    f.comparedGraphs[C.id] = u;
                                    u.seriesIdField = "amCategoryIdField";
                                    u.connect = f.connect;
                                    u.showBalloon = f.showBalloon;
                                    var v = f.compareField;
                                    v || (v = f.valueField);
                                    p = !1;
                                    r = C.fieldMappings;
                                    for (g = 0; g < r.length; g++) m = r[g], m.toField == v && (p = !0);
                                    if (p) {
                                        u.valueField = v;
                                        u.title = C.title;
                                        u.lineColor = C.color;
                                        f.compareGraphLineColor && (u.lineColor = f.compareGraphLineColor);
                                        f.compareGraphType && (u.type = f.compareGraphType);
                                        g = f.compareGraphLineThickness;
                                        isNaN(g) || (u.lineThickness =
                                            g);
                                        g = f.compareGraphDashLength;
                                        isNaN(g) || (u.dashLength = g);
                                        g = f.compareGraphLineAlpha;
                                        isNaN(g) || (u.lineAlpha = g);
                                        g = f.compareGraphCornerRadiusTop;
                                        isNaN(g) || (u.cornerRadiusTop = g);
                                        g = f.compareGraphCornerRadiusBottom;
                                        isNaN(g) || (u.cornerRadiusBottom = g);
                                        g = f.compareGraphBalloonColor;
                                        isNaN(g) || (u.balloonColor = g);
                                        g = f.compareGraphBulletColor;
                                        isNaN(g) || (u.bulletColor = g);
                                        if (g = f.compareGraphFillColors) u.fillColors = g;
                                        if (g = f.compareGraphNegativeFillColors) u.negativeFillColors = g;
                                        if (g = f.compareGraphFillAlphas) u.fillAlphas =
                                            g;
                                        if (g = f.compareGraphNegativeFillAlphas) u.negativeFillAlphas = g;
                                        if (g = f.compareGraphBullet) u.bullet = g;
                                        if (g = f.compareGraphNumberFormatter) u.numberFormatter = g;
                                        g = f.compareGraphPrecision;
                                        isNaN(g) || (u.precision = g);
                                        if (g = f.compareGraphBalloonText) u.balloonText = g;
                                        g = f.compareGraphBulletSize;
                                        isNaN(g) || (u.bulletSize = g);
                                        g = f.compareGraphBulletAlpha;
                                        isNaN(g) || (u.bulletAlpha = g);
                                        g = f.compareGraphBulletBorderAlpha;
                                        isNaN(g) || (u.bulletBorderAlpha = g);
                                        if (g = f.compareGraphBulletBorderColor) u.bulletBorderColor = g;
                                        g = f.compareGraphBulletBorderThickness;
                                        isNaN(g) || (u.bulletBorderThickness = g);
                                        u.visibleInLegend = f.compareGraphVisibleInLegend;
                                        u.balloonFunction = f.compareGraphBalloonFunction;
                                        u.hideBulletsCount = f.hideBulletsCount;
                                        u.valueAxis = f.valueAxis;
                                        x && (t && y ? (u.legendValueText = y, u.legendPeriodValueText = z) : (n && (u.legendValueText = n), u.legendPeriodValueText = A));
                                        c.showComparedOnTop ? c.graphs.push(u) : c.graphs.unshift(u);
                                        this.comparedGraphs.push({
                                            graph: u,
                                            dataSet: C
                                        })
                                    }
                                }
                            }
                        }
                        x && (t && y ? (f.legendValueText = y, f.legendPeriodValueText = z) : (n && (f.legendValueText = n), f.legendPeriodValueText =
                            A))
                    }
                }
            }
        },
        choosePeriod: function(a, b, c) {
            var e = this.categoryAxesSettings,
                h = e.groupToPeriods,
                l = h[a],
                k = h[a + 1],
                g = d.extractPeriod(l),
                g = d.getPeriodDuration(g.period, g.count),
                m = b.getTime(),
                f = c.getTime(),
                p = e.maxSeries;
            e.alwaysGroup && l == e.minPeriod && (l = e.groupToPeriods[1], 1 < h.length && (l = h[1]));
            return (f - m) / g > p && 0 < p && k ? this.choosePeriod(a + 1, b, c) : l
        },
        handleCursorChange: function(a) {
            var b = a.target,
                c = a.position,
                e = a.zooming;
            a = a.index;
            var d = this.chartCursors,
                l;
            for (l = 0; l < d.length; l++) {
                var k = d[l];
                k != b && c && (k.isZooming(e),
                    k.previousMousePosition = NaN, k.forceShow = !0, k.initialMouse = b.initialMouse, k.selectionPosX = b.selectionPosX, k.setPosition(c, !1, a))
            }
        },
        getSelections: function() {
            var a = [],
                b = this.dataSets,
                c;
            for (c = 0; c < b.length; c++) {
                var e = b[c];
                e.compared && a.push(e)
            }
            this.comparedDataSets = a;
            b = this.panels;
            for (c = 0; c < b.length; c++) e = b[c], "never" != e.recalculateToPercents && 0 < a.length ? e.hideDrawingIcons(!0) : e.drawingIconsEnabled && e.hideDrawingIcons(!1)
        },
        addPanel: function(a) {
            this.panels.push(a);
            this.prevPH = void 0;
            d.removeChart(a);
            d.addChart(a)
        },
        addPanelAt: function(a, b) {
            this.panels.splice(b, 0, a);
            this.prevPH = void 0;
            d.removeChart(a);
            d.addChart(a)
        },
        removePanel: function(a) {
            var b = this.panels;
            this.prevPH = void 0;
            var c;
            for (c = b.length - 1; 0 <= c; c--)
                if (b[c] == a) {
                    var e = {
                        type: "panelRemoved",
                        panel: a,
                        chart: this
                    };
                    this.fire(e.type, e);
                    b.splice(c, 1);
                    a.destroy();
                    a.clear()
                }
        },
        validateData: function() {
            this.resetDataParsed();
            this.updateDataSets();
            this.mainDataSet.compared = !1;
            this.updateGraphs();
            this.updateData();
            var a = this.dataSetSelector;
            a && a.write(a.div)
        },
        resetDataParsed: function() {
            var a =
                this.dataSets,
                b;
            for (b = 0; b < a.length; b++) a[b].dataParsed = !1
        },
        validateNow: function(a) {
            this.skipDefault = !0;
            this.chartRendered = !1;
            this.prevPH = void 0;
            this.clear(!0);
            this.initTO && clearTimeout(this.initTO);
            a && this.resetDataParsed();
            this.write(this.div)
        },
        hideStockEvents: function() {
            this.showHideEvents(!1);
            this.eventsHidden = !0
        },
        showStockEvents: function() {
            this.showHideEvents(!0);
            this.eventsHidden = !1
        },
        showHideEvents: function(a) {
            var b = this.panels,
                c;
            for (c = 0; c < b.length; c++) {
                var e = b[c].graphs,
                    d;
                for (d = 0; d < e.length; d++) {
                    var l =
                        e[d];
                    !0 === a ? l.showCustomBullets(!0) : l.hideCustomBullets(!0)
                }
            }
        },
        invalidateSize: function() {
            var a = this;
            clearTimeout(a.validateTO);
            var b = setTimeout(function() {
                a.validateNow()
            }, 5);
            a.validateTO = b
        },
        measure: function() {
            var a = this.div;
            if (a) {
                var b = a.offsetWidth,
                    c = a.offsetHeight;
                a.clientHeight && (b = a.clientWidth, c = a.clientHeight);
                this.divRealWidth = b;
                this.divRealHeight = c
            }
        },
        handleResize: function() {
            var a = this,
                b = setTimeout(function() {
                    a.validateSizeReal()
                }, 150);
            a.initTO = b
        },
        validateSizeReal: function() {
            this.previousWidth =
                this.divRealWidth;
            this.previousHeight = this.divRealHeight;
            this.measure();
            if (this.divRealWidth != this.previousWidth || this.divRealHeight != this.previousHeight) 0 < this.divRealWidth && 0 < this.divRealHeight && this.fire("resized", {
                type: "resized",
                chart: this
            }), this.divRealHeight != this.previousHeight && this.validateNow()
        },
        clear: function(a) {
            var b = this.panels,
                c;
            if (b)
                for (c = 0; c < b.length; c++) {
                    var e = b[c];
                    a || (e.cleanChart(), e.destroy());
                    e.clear(a)
                }(b = this.scrollbarChart) && b.clear();
            if (b = this.div) b.innerHTML = "";
            a || (this.div =
                null, d.deleteObject(this))
        }
    });
    d.StockEvent = d.Class({
        construct: function() {}
    })
})();
(function() {
    var d = window.AmCharts;
    d.DataSet = d.Class({
        construct: function() {
            this.cname = "DataSet";
            this.fieldMappings = [];
            this.dataProvider = [];
            this.agregatedDataProviders = [];
            this.stockEvents = [];
            this.compared = !1;
            this.showInCompare = this.showInSelect = !0
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.PeriodSelector = d.Class({
        construct: function(a) {
            this.cname = "PeriodSelector";
            this.theme = a;
            this.createEvents("changed");
            this.inputFieldsEnabled = !0;
            this.position = "bottom";
            this.width = 180;
            this.fromText = "From: ";
            this.toText = "to: ";
            this.periodsText = "Zoom: ";
            this.periods = [];
            this.inputFieldWidth = 100;
            this.dateFormat = "DD-MM-YYYY";
            this.hideOutOfScopePeriods = !0;
            d.applyTheme(this, a, this.cname)
        },
        zoom: function(a, b) {
            var c = this.chart;
            this.inputFieldsEnabled && (this.startDateField.value =
                d.formatDate(a, this.dateFormat, c), this.endDateField.value = d.formatDate(b, this.dateFormat, c));
            this.markButtonAsSelected()
        },
        write: function(a) {
            var b = this,
                c = b.chart.classNamePrefix;
            a.className = "amChartsPeriodSelector " + c + "-period-selector-div";
            var e = b.width,
                h = b.position;
            b.width = void 0;
            b.position = void 0;
            d.applyStyles(a.style, b);
            b.width = e;
            b.position = h;
            b.div = a;
            a.innerHTML = "";
            e = b.theme;
            h = b.position;
            h = "top" == h || "bottom" == h ? !1 : !0;
            b.vertical = h;
            var l = 0,
                k = 0;
            if (b.inputFieldsEnabled) {
                var g = document.createElement("div");
                a.appendChild(g);
                var m = document.createTextNode(d.lang.fromText || b.fromText);
                g.appendChild(m);
                h ? d.addBr(g) : (g.style.styleFloat = "left", g.style.display = "inline");
                var f = document.createElement("input");
                f.className = "amChartsInputField " + c + "-start-date-input";
                e && d.applyStyles(f.style, e.PeriodInputField);
                f.style.textAlign = "center";
                f.onblur = function(a) {
                    b.handleCalChange(a)
                };
                d.isNN && f.addEventListener("keypress", function(a) {
                    b.handleCalendarChange.call(b, a)
                }, !0);
                d.isIE && f.attachEvent("onkeypress", function(a) {
                    b.handleCalendarChange.call(b,
                        a)
                });
                g.appendChild(f);
                b.startDateField = f;
                if (h) m = b.width - 6 + "px", d.addBr(g);
                else {
                    var m = b.inputFieldWidth + "px",
                        p = document.createTextNode(" ");
                    g.appendChild(p)
                }
                f.style.width = m;
                f = document.createTextNode(d.lang.toText || b.toText);
                g.appendChild(f);
                h && d.addBr(g);
                f = document.createElement("input");
                f.className = "amChartsInputField " + c + "-end-date-input";
                e && d.applyStyles(f.style, e.PeriodInputField);
                f.style.textAlign = "center";
                f.onblur = function() {
                    b.handleCalChange()
                };
                d.isNN && f.addEventListener("keypress", function(a) {
                    b.handleCalendarChange.call(b,
                        a)
                }, !0);
                d.isIE && f.attachEvent("onkeypress", function(a) {
                    b.handleCalendarChange.call(b, a)
                });
                g.appendChild(f);
                b.endDateField = f;
                h ? d.addBr(g) : l = f.offsetHeight + 2;
                m && (f.style.width = m)
            }
            g = b.periods;
            if (d.ifArray(g)) {
                m = document.createElement("div");
                h || (m.style.cssFloat = "right", m.style.styleFloat = "right", m.style.display = "inline");
                a.appendChild(m);
                h && d.addBr(m);
                a = document.createTextNode(d.lang.periodsText || b.periodsText);
                m.appendChild(a);
                b.periodContainer = m;
                var r;
                for (a = 0; a < g.length; a++) f = g[a], r = document.createElement("input"),
                    r.type = "button", r.value = f.label, r.period = f.period, r.count = f.count, r.periodObj = f, r.className = "amChartsButton " + c + "-period-input", e && d.applyStyles(r.style, e.PeriodButton), h && (r.style.width = b.width - 1 + "px"), r.style.boxSizing = "border-box", m.appendChild(r), b.addEventListeners(r), f.button = r;
                !h && r && (k = r.offsetHeight);
                b.offsetHeight = Math.max(l, k)
            }
        },
        addEventListeners: function(a) {
            var b = this;
            d.isNN && a.addEventListener("click", function(a) {
                b.handlePeriodChange.call(b, a)
            }, !0);
            d.isIE && a.attachEvent("onclick", function(a) {
                b.handlePeriodChange.call(b,
                    a)
            })
        },
        getPeriodDates: function() {
            var a = this.periods,
                b;
            for (b = 0; b < a.length; b++) this.selectPeriodButton(a[b], !0)
        },
        handleCalendarChange: function(a) {
            13 == a.keyCode && this.handleCalChange(a)
        },
        handleCalChange: function(a) {
            var b = this.dateFormat,
                c = d.stringToDate(this.startDateField.value, b),
                b = this.chart.getLastDate(d.stringToDate(this.endDateField.value, b));
            try {
                this.startDateField.blur(), this.endDateField.blur()
            } catch (e) {}
            if (c && b) {
                var h = {
                    type: "changed"
                };
                h.startDate = c;
                h.endDate = b;
                h.chart = this.chart;
                h.event = a;
                this.fire(h.type,
                    h)
            }
        },
        handlePeriodChange: function(a) {
            this.selectPeriodButton((a.srcElement ? a.srcElement : a.target).periodObj, !1, a)
        },
        setRanges: function(a, b) {
            this.firstDate = a;
            this.lastDate = b;
            this.getPeriodDates()
        },
        selectPeriodButton: function(a, b, c) {
            var e = a.button,
                h = e.count,
                l = e.period,
                k = this.chart,
                g, m, f = this.firstDate,
                p = this.lastDate,
                r, t = this.theme;
            f && p && ("MAX" == l ? (g = f, m = p) : "YTD" == l ? (g = new Date, g.setMonth(0, 1), g.setHours(0, 0, 0, 0), 0 === h && g.setDate(g.getDate() - 1), m = this.lastDate) : "YYYY" == l || "MM" == l ? this.selectFromStart ?
                (g = f, m = new Date(f), m.setMonth(m.getMonth() + h)) : (g = new Date(p), d.changeDate(g, l, h, !1), g.setDate(g.getDate() - 1), m = p, g.setTime(g.getTime() + 1)) : (r = d.getPeriodDuration(l, h), this.selectFromStart ? (g = f, m = new Date(f.getTime() + r - 1)) : (g = new Date(p.getTime() - r + 1), m = p)), a.startTime = g.getTime(), this.hideOutOfScopePeriods && (b && a.startTime < f.getTime() ? e.style.display = "none" : e.style.display = "inline"), g.getTime() > p.getTime() && (r = d.getPeriodDuration("DD", 1), g = new Date(p.getTime() - r)), g.getTime() < f.getTime() && (g = f),
                "YTD" == l && (a.startTime = g.getTime()), a.endTime = m.getTime(), b || (this.skipMark = !0, this.unselectButtons(), e.className = "amChartsButtonSelected " + k.classNamePrefix + "-period-input-selected", t && d.applyStyles(e.style, t.PeriodButtonSelected), a = {
                    type: "changed"
                }, a.startDate = g, a.endDate = m, a.predefinedPeriod = l, a.chart = this.chart, a.count = h, a.event = c, this.fire(a.type, a)))
        },
        markButtonAsSelected: function() {
            if (!this.skipMark) {
                var a = this.chart,
                    b = this.periods,
                    c = a.startDate.getTime(),
                    e = a.endDate.getTime(),
                    h = this.lastDate.getTime();
                e > h && (e = h);
                h = this.theme;
                this.unselectButtons();
                var l;
                for (l = b.length - 1; 0 <= l; l--) {
                    var k = b[l],
                        g = k.button;
                    k.startTime && k.endTime && c == k.startTime && e == k.endTime && (this.unselectButtons(), g.className = "amChartsButtonSelected " + a.classNamePrefix + "-period-input-selected", h && d.applyStyles(g.style, h.PeriodButtonSelected))
                }
            }
            this.skipMark = !1
        },
        unselectButtons: function() {
            var a = this.chart,
                b = this.periods,
                c, e = this.theme;
            for (c = b.length - 1; 0 <= c; c--) {
                var h = b[c].button;
                h.className = "amChartsButton " + a.classNamePrefix + "-period-input";
                e && d.applyStyles(h.style, e.PeriodButton)
            }
        },
        setDefaultPeriod: function() {
            var a = this.periods,
                b;
            for (b = 0; b < a.length; b++) {
                var c = a[b];
                c.selected && this.selectPeriodButton(c)
            }
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.StockGraph = d.Class({
        inherits: d.AmGraph,
        construct: function(a) {
            d.StockGraph.base.construct.call(this, a);
            this.cname = "StockGraph";
            this.useDataSetColors = !0;
            this.periodValue = "Close";
            this.compareGraphType = "line";
            this.compareGraphVisibleInLegend = !0;
            this.comparable = this.resetTitleOnDataSetChange = !1;
            this.comparedGraphs = {};
            this.showEventsOnComparedGraphs = !1;
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.StockPanel = d.Class({
        inherits: d.AmSerialChart,
        construct: function(a) {
            d.StockPanel.base.construct.call(this, a);
            this.cname = "StockPanel";
            this.theme = a;
            this.showCategoryAxis = this.showComparedOnTop = !0;
            this.recalculateToPercents = "whenComparing";
            this.panelHeaderPaddingBottom = this.panelHeaderPaddingLeft = this.panelHeaderPaddingRight = this.panelHeaderPaddingTop = 0;
            this.trendLineAlpha = 1;
            this.trendLineColor = "#00CC00";
            this.trendLineColorHover = "#CC0000";
            this.trendLineThickness = 2;
            this.trendLineDashLength = 0;
            this.stockGraphs = [];
            this.drawingIconsEnabled = !1;
            this.iconSize = 38;
            this.autoMargins = this.allowTurningOff = this.eraseAll = this.erasingEnabled = this.drawingEnabled = !1;
            d.applyTheme(this, a, this.cname)
        },
        initChart: function(a) {
            d.StockPanel.base.initChart.call(this, a);
            this.drawingIconsEnabled && this.createDrawIcons();
            (a = this.chartCursor) && this.listenTo(a, "draw", this.handleDraw)
        },
        addStockGraph: function(a) {
            this.stockGraphs.push(a);
            return a
        },
        handleCursorZoom: function(a) {
            this.chartCursor &&
                this.chartCursor.pan && d.StockPanel.base.handleCursorZoom.call(this, a)
        },
        removeStockGraph: function(a) {
            var b = this.stockGraphs,
                c;
            for (c = b.length - 1; 0 <= c; c--) b[c] == a && b.splice(c, 1)
        },
        createDrawIcons: function() {
            var a = this,
                b = a.iconSize,
                c = a.container,
                e = a.pathToImages,
                h = a.realWidth - 2 * b - 1 - a.marginRight,
                l = d.rect(c, b, b, "#000", .005),
                k = d.rect(c, b, b, "#000", .005);
            k.translate(b + 1, 0);
            var g = c.image(e + "pencilIcon.png", 0, 0, b, b);
            d.setCN(a, g, "pencil");
            a.pencilButton = g;
            k.setAttr("cursor", "pointer");
            l.setAttr("cursor", "pointer");
            l.mouseup(function() {
                a.handlePencilClick()
            });
            var m = c.image(e + "pencilIconH.png", 0, 0, b, b);
            d.setCN(a, m, "pencil-pushed");
            a.pencilButtonPushed = m;
            a.drawingEnabled || m.hide();
            var f = c.image(e + "eraserIcon.png", b + 1, 0, b, b);
            d.setCN(a, f, "eraser");
            a.eraserButton = f;
            k.mouseup(function() {
                a.handleEraserClick()
            });
            l.touchend && (l.touchend(function() {
                a.handlePencilClick()
            }), k.touchend(function() {
                a.handleEraserClick()
            }));
            b = c.image(e + "eraserIconH.png", b + 1, 0, b, b);
            d.setCN(a, b, "eraser-pushed");
            a.eraserButtonPushed = b;
            a.erasingEnabled ||
                b.hide();
            c = c.set([g, m, f, b, l, k]);
            d.setCN(a, c, "drawing-tools");
            c.translate(h, 1);
            this.hideIcons && c.hide()
        },
        handlePencilClick: function() {
            var a = !this.drawingEnabled;
            this.disableDrawing(!a);
            this.erasingEnabled = !1;
            var b = this.eraserButtonPushed;
            b && b.hide();
            b = this.pencilButtonPushed;
            a ? b && b.show() : (b && b.hide(), this.setMouseCursor("auto"))
        },
        disableDrawing: function(a) {
            this.drawingEnabled = !a;
            var b = this.chartCursor;
            this.stockChart.enableCursors(a);
            b && b.enableDrawing(!a)
        },
        handleEraserClick: function() {
            this.disableDrawing(!0);
            var a = this.pencilButtonPushed;
            a && a.hide();
            a = this.eraserButtonPushed;
            if (this.eraseAll) {
                var a = this.trendLines,
                    b;
                for (b = a.length - 1; 0 <= b; b--) {
                    var c = a[b];
                    c.isProtected || this.removeTrendLine(c)
                }
                this.validateNow()
            } else(this.erasingEnabled = b = !this.erasingEnabled) ? (a && a.show(), this.setTrendColorHover(this.trendLineColorHover), this.setMouseCursor("auto")) : (a && a.hide(), this.setTrendColorHover())
        },
        setTrendColorHover: function(a) {
            var b = this.trendLines,
                c;
            for (c = b.length - 1; 0 <= c; c--) {
                var e = b[c];
                e.isProtected || (e.rollOverColor =
                    a)
            }
        },
        handleDraw: function(a) {
            var b = this.drawOnAxis;
            d.isString(b) && (b = this.getValueAxisById(b));
            b || (b = this.valueAxes[0]);
            this.drawOnAxis = b;
            var c = this.categoryAxis,
                e = a.initialX,
                h = a.finalX,
                l = a.initialY;
            a = a.finalY;
            var k = new d.TrendLine(this.theme);
            k.initialDate = c.coordinateToDate(e);
            k.finalDate = c.coordinateToDate(h);
            k.initialValue = b.coordinateToValue(l);
            k.finalValue = b.coordinateToValue(a);
            k.lineAlpha = this.trendLineAlpha;
            k.lineColor = this.trendLineColor;
            k.lineThickness = this.trendLineThickness;
            k.dashLength =
                this.trendLineDashLength;
            k.valueAxis = b;
            k.categoryAxis = c;
            this.addTrendLine(k);
            this.listenTo(k, "click", this.handleTrendClick);
            this.validateNow()
        },
        hideDrawingIcons: function(a) {
            (this.hideIcons = a) && this.disableDrawing(a)
        },
        handleTrendClick: function(a) {
            this.erasingEnabled && (a = a.trendLine, this.eraseAll || a.isProtected || this.removeTrendLine(a), this.validateNow())
        },
        handleWheelReal: function(a, b) {
            var c = this.scrollbarChart;
            if (!this.wheelBusy && c) {
                var e = 1;
                b && (e = -1);
                var c = c.chartScrollbar,
                    d = this.categoryAxis.minDuration();
                0 > a ? (e = this.startTime + e * d, d = this.endTime + 1 * d) : (e = this.startTime - e * d, d = this.endTime - 1 * d);
                e < this.firstTime && (e = this.firstTime);
                d > this.lastTime && (d = this.lastTime);
                e < d && c.timeZoom(e, d, !0)
            }
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.CategoryAxesSettings = d.Class({
        construct: function(a) {
            this.cname = "CategoryAxesSettings";
            this.minPeriod = "DD";
            this.equalSpacing = !1;
            this.axisHeight = 28;
            this.tickLength = this.axisAlpha = 0;
            this.gridCount = 10;
            this.maxSeries = 150;
            this.groupToPeriods = "ss 10ss 30ss mm 10mm 30mm hh DD WW MM YYYY".split(" ");
            this.markPeriodChange = this.autoGridCount = !0;
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.ChartCursorSettings = d.Class({
        construct: function(a) {
            this.cname = "ChartCursorSettings";
            this.enabled = !0;
            this.bulletsEnabled = this.valueBalloonsEnabled = !1;
            this.graphBulletSize = 1;
            this.categoryBalloonDateFormats = [{
                period: "YYYY",
                format: "YYYY"
            }, {
                period: "MM",
                format: "MMM, YYYY"
            }, {
                period: "WW",
                format: "MMM DD, YYYY"
            }, {
                period: "DD",
                format: "MMM DD, YYYY"
            }, {
                period: "hh",
                format: "JJ:NN"
            }, {
                period: "mm",
                format: "JJ:NN"
            }, {
                period: "ss",
                format: "JJ:NN:SS"
            }, {
                period: "fff",
                format: "JJ:NN:SS"
            }];
            d.applyTheme(this,
                a, this.cname)
        },
        categoryBalloonDateFormat: function(a) {
            var b = this.categoryBalloonDateFormats,
                c, e;
            for (e = 0; e < b.length; e++) b[e].period == a && (c = b[e].format);
            return c
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.ChartScrollbarSettings = d.Class({
        construct: function(a) {
            this.cname = "ChartScrollbarSettings";
            this.height = 40;
            this.enabled = !0;
            this.color = "#FFFFFF";
            this.updateOnReleaseOnly = this.autoGridCount = !0;
            this.hideResizeGrips = !1;
            this.position = "bottom";
            this.minDistance = 1;
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.LegendSettings = d.Class({
        construct: function(a) {
            this.cname = "LegendSettings";
            this.marginBottom = this.marginTop = 0;
            this.usePositiveNegativeOnPercentsOnly = !0;
            this.positiveValueColor = "#00CC00";
            this.negativeValueColor = "#CC0000";
            this.autoMargins = this.equalWidths = this.textClickEnabled = !1;
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.PanelsSettings = d.Class({
        construct: function(a) {
            this.cname = "PanelsSettings";
            this.marginBottom = this.marginTop = this.marginRight = this.marginLeft = 0;
            this.backgroundColor = "#FFFFFF";
            this.backgroundAlpha = 0;
            this.panelSpacing = 8;
            this.panEventsEnabled = !0;
            this.creditsPosition = "top-right";
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.StockEventsSettings = d.Class({
        construct: function(a) {
            this.cname = "StockEventsSettings";
            this.type = "sign";
            this.backgroundAlpha = 1;
            this.backgroundColor = "#DADADA";
            this.borderAlpha = 1;
            this.borderColor = "#888888";
            this.balloonColor = this.rollOverColor = "#CC0000";
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.ValueAxesSettings = d.Class({
        construct: function(a) {
            this.cname = "ValueAxesSettings";
            this.tickLength = 0;
            this.showFirstLabel = this.autoGridCount = this.inside = !0;
            this.showLastLabel = !1;
            this.axisAlpha = 0;
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.getItemIndex = function(a, b) {
        var c = -1,
            e;
        for (e = 0; e < b.length; e++) a == b[e] && (c = e);
        return c
    };
    d.addBr = function(a) {
        a.appendChild(document.createElement("br"))
    };
    d.applyStyles = function(a, b) {
        if (b && a)
            for (var c in a) {
                var e = c,
                    d = b[e];
                if (void 0 !== d) try {
                    a[e] = d
                } catch (l) {}
            }
    };
    d.parseStockData = function(a, b, c, e, h) {
        var l = {},
            k = a.dataProvider,
            g = a.categoryField;
        if (g) {
            var m = d.getItemIndex(b, c),
                f = c.length,
                p, r = k.length,
                t, x = {};
            for (p = m; p < f; p++) t = c[p], l[t] = [];
            var y = {},
                n = a.fieldMappings,
                z = n.length;
            for (p = 0; p < r; p++) {
                var A = k[p],
                    B = A[g],
                    D = d.getDate(B, h, b),
                    D = B instanceof Date ? d.newDate(B, b) : h ? d.stringToDate(B, h) : new Date(B),
                    B = D.getTime(),
                    C = {};
                for (t = 0; t < z; t++) C[n[t].toField] = A[n[t].fromField];
                var u;
                for (u = m; u < f; u++) {
                    t = c[u];
                    var v = d.extractPeriod(t),
                        E = v.period,
                        G = v.count,
                        w, q;
                    if (u == m || B >= x[t] || !x[t]) {
                        y[t] = {};
                        y[t].amCategoryIdField = String(d.resetDateToMin(D, E, G, e).getTime());
                        var F;
                        for (F = 0; F < z; F++) v = n[F].toField, w = y[t], q = Number(C[v]), w[v + "Count"] = 0, w[v + "Sum"] = 0, isNaN(q) || (w[v + "Open"] = q, w[v + "Sum"] = q, w[v +
                            "High"] = q, w[v + "Low"] = q, w[v + "Close"] = q, w[v + "Count"] = 1, w[v + "Average"] = q);
                        w.dataContext = A;
                        l[t].push(y[t]);
                        u > m && (v = d.newDate(D, b), v = d.changeDate(v, E, G, !0), v = d.resetDateToMin(v, E, G, e), x[t] = v.getTime());
                        if (u == m)
                            for (var H in A) A.hasOwnProperty(H) && (y[t][H] = A[H]);
                        y[t][g] = d.newDate(D, b)
                    } else
                        for (E = 0; E < z; E++) v = n[E].toField, w = y[t], p == r - 1 && (w[g] = d.newDate(D, b)), q = Number(C[v]), isNaN(q) || (isNaN(w[v + "Low"]) && (w[v + "Low"] = q), q < w[v + "Low"] && (w[v + "Low"] = q), isNaN(w[v + "High"]) && (w[v + "High"] = q), q > w[v + "High"] && (w[v + "High"] =
                            q), w[v + "Close"] = q, G = d.getDecimals(w[v + "Sum"]), F = d.getDecimals(q), w[v + "Sum"] += q, w[v + "Sum"] = d.roundTo(w[v + "Sum"], Math.max(G, F)), w[v + "Count"]++, w[v + "Average"] = w[v + "Sum"] / w[v + "Count"])
                }
            }
        }
        a.agregatedDataProviders = l
    };
    d.parseEvents = function(a, b, c, e, h, l) {
        var k = a.stockEvents,
            g = a.agregatedDataProviders,
            m = b.length,
            f, p, r, t, x, y, n, z, A;
        for (f = 0; f < m; f++) {
            y = b[f];
            x = y.graphs;
            r = x.length;
            var B;
            for (p = 0; p < r; p++) t = x[p], t.customBulletField = "amCustomBullet" + t.id + "_" + y.id, t.bulletConfigField = "amCustomBulletConfig" + t.id + "_" +
                y.id;
            for (A = 0; A < k.length; A++)
                if (n = k[A], B = n.graph, d.isString(B) && (B = d.getObjById(x, B))) n.graph = B
        }
        for (var D in g)
            if (g.hasOwnProperty(D)) {
                B = g[D];
                var C = d.extractPeriod(D),
                    u = B.length,
                    v;
                for (v = 0; v < u; v++) {
                    var E = B[v];
                    f = E[a.categoryField];
                    z = f instanceof Date;
                    l && !z && (f = d.stringToDate(f, l));
                    var G = f.getTime();
                    x = C.period;
                    A = C.count;
                    var w;
                    w = "fff" == x ? f.getTime() + 1 : d.resetDateToMin(d.changeDate(new Date(f), C.period, C.count), x, A, e).getTime();
                    for (f = 0; f < m; f++)
                        for (y = b[f], x = y.graphs, r = x.length, p = 0; p < r; p++) {
                            t = x[p];
                            var q = {};
                            q.eventDispatcher = h;
                            q.eventObjects = [];
                            q.letters = [];
                            q.descriptions = [];
                            q.shapes = [];
                            q.backgroundColors = [];
                            q.backgroundAlphas = [];
                            q.borderColors = [];
                            q.borderAlphas = [];
                            q.colors = [];
                            q.rollOverColors = [];
                            q.showOnAxis = [];
                            q.values = [];
                            q.showAts = [];
                            q.fontSizes = [];
                            for (A = 0; A < k.length; A++) {
                                n = k[A];
                                z = n.date instanceof Date;
                                l && !z && (n.date = d.stringToDate(n.date, l));
                                z = n.date.getTime();
                                var F = !1;
                                n.graph && (n.graph.showEventsOnComparedGraphs && n.graph.comparedGraphs[a.id] && (F = !0), (t == n.graph || F) && z >= G && z < w && (q.eventObjects.push(n),
                                    q.letters.push(n.text), q.descriptions.push(n.description), n.type ? q.shapes.push(n.type) : q.shapes.push(c.type), void 0 !== n.backgroundColor ? q.backgroundColors.push(n.backgroundColor) : q.backgroundColors.push(c.backgroundColor), isNaN(n.backgroundAlpha) ? q.backgroundAlphas.push(c.backgroundAlpha) : q.backgroundAlphas.push(n.backgroundAlpha), isNaN(n.borderAlpha) ? q.borderAlphas.push(c.borderAlpha) : q.borderAlphas.push(n.borderAlpha), void 0 !== n.borderColor ? q.borderColors.push(n.borderColor) : q.borderColors.push(c.borderColor),
                                    void 0 !== n.rollOverColor ? q.rollOverColors.push(n.rollOverColor) : q.rollOverColors.push(c.rollOverColor), void 0 !== n.showAt ? q.showAts.push(n.showAt) : q.showAts.push(c.showAt), void 0 !== n.fontSize && q.fontSizes.push(n.fontSize), q.colors.push(n.color), q.values.push(n.value), !n.panel && n.graph && (n.panel = n.graph.chart), q.showOnAxis.push(n.showOnAxis), q.date = new Date(n.date)));
                                0 < q.shapes.length && (n = "amCustomBullet" + t.id + "_" + y.id, z = "amCustomBulletConfig" + t.id + "_" + y.id, E[n] = d.StackedBullet, E[z] = q)
                            }
                        }
                }
            }
    }
})();
(function() {
    var d = window.AmCharts;
    d.StockLegend = d.Class({
        inherits: d.AmLegend,
        construct: function(a) {
            d.StockLegend.base.construct.call(this, a);
            this.cname = "StockLegend";
            this.valueTextComparing = "[[percents.value]]%";
            this.valueTextRegular = "[[value]]";
            d.applyTheme(this, a, this.cname)
        },
        drawLegend: function() {
            var a = this;
            d.StockLegend.base.drawLegend.call(a);
            var b = a.chart;
            if (b.allowTurningOff) {
                var c = a.container,
                    e = c.image(b.pathToImages + "xIcon.png", b.realWidth - 19, 3, 19, 19),
                    b = c.image(b.pathToImages + "xIconH.png",
                        b.realWidth - 19, 3, 19, 19);
                b.hide();
                a.xButtonHover = b;
                e.mouseup(function() {
                    a.handleXClick()
                }).mouseover(function() {
                    a.handleXOver()
                });
                b.mouseup(function() {
                    a.handleXClick()
                }).mouseout(function() {
                    a.handleXOut()
                })
            }
        },
        handleXOver: function() {
            this.xButtonHover.show()
        },
        handleXOut: function() {
            this.xButtonHover.hide()
        },
        handleXClick: function() {
            var a = this.chart,
                b = a.stockChart;
            b.removePanel(a);
            b.validateNow()
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.DataSetSelector = d.Class({
        construct: function(a) {
            this.cname = "DataSetSelector";
            this.theme = a;
            this.createEvents("dataSetSelected", "dataSetCompared", "dataSetUncompared");
            this.position = "left";
            this.selectText = "기준:";
            this.comboBoxSelectText = "Select...";
            this.compareText = "언론사 비교:"; // carpedm20
            this.width = 180;
            this.dataProvider = [];
            this.listHeight = 150;
            this.listCheckBoxSize = 25; // carpedm20
            this.rollOverBackgroundColor = "#b2e1ff";
            this.selectedBackgroundColor = "#7fceff";
            d.applyTheme(this, a, this.cname)
        },
        write: function(a) {
            var b = this,
                c, e = b.theme,
                h = b.chart;
            a.className = "amChartsDataSetSelector " + h.classNamePrefix + "-data-set-selector-div";
            var l = b.width;
            c = b.position;
            b.width = void 0;
            b.position = void 0;
            d.applyStyles(a.style, b);
            b.div = a;
            b.width = l;
            b.position = c;
            a.innerHTML = "";
            var l = b.position,
                k;
            k = "top" == l || "bottom" == l ? !1 : !0;
            b.vertical = k;
            var g;
            k && (g = b.width + "px");
            var l = b.dataProvider,
                m, f;
            if (1 < b.countDataSets("showInSelect")) {
                c = document.createTextNode(d.lang.selectText || b.selectText);
                a.appendChild(c);
                k && d.addBr(a);
                var p = document.createElement("select");
                g && (p.style.width = g);
                b.selectCB = p;
                e && d.applyStyles(p.style, e.DataSetSelect);
                p.className = h.classNamePrefix + "-data-set-select";
                a.appendChild(p);
                d.isNN && p.addEventListener("change", function(a) {
                    b.handleDataSetChange.call(b, a)
                }, !0);
                d.isIE && p.attachEvent("onchange", function(a) {
                    b.handleDataSetChange.call(b, a)
                });
                for (c = 0; c < l.length; c++)
                    if (m = l[c], !0 === m.showInSelect) {
                        f = document.createElement("option");
                        f.className = h.classNamePrefix + "-data-set-select-option";
                        f.text = m.title;
                        f.value = c;
                        m == b.chart.mainDataSet && (f.selected = !0);
                        try {
                            p.add(f, null)
                        } catch (r) {
                            p.add(f)
                        }
                    }
                b.offsetHeight = p.offsetHeight
            }
            if (0 < b.countDataSets("showInCompare") && 1 < l.length)
                if (k ? (d.addBr(a), d.addBr(a)) : (c = document.createTextNode(" "), a.appendChild(c)), c = document.createTextNode(d.lang.compareText || b.compareText), a.appendChild(c), f = b.listCheckBoxSize, k) {
                    d.addBr(a);
                    g = document.createElement("div");
                    a.appendChild(g);
                    g.className = "amChartsCompareList " + h.classNamePrefix + "-compare-div";
                    e && d.applyStyles(g.style,
                        e.DataSetCompareList);
                    g.style.overflow = "auto";
                    g.style.overflowX = "hidden";
                    g.style.width = b.width - 2 + "px";
                    g.style.maxHeight = b.listHeight + "px";
                    for (c = 0; c < l.length; c++) m = l[c], !0 === m.showInCompare && m != b.chart.mainDataSet && (e = document.createElement("div"), e.style.padding = "4px", e.style.position = "relative", e.name = "amCBContainer", e.className = h.classNamePrefix + "-compare-item-div", e.dataSet = m, e.style.height = f + "px", m.compared && (e.style.backgroundColor = b.selectedBackgroundColor), g.appendChild(e), k = document.createElement("div"),
                        k.style.width = f + "px", k.style.height = f + "px", k.style.position = "absolute", k.style.backgroundColor = m.color, e.appendChild(k), k = document.createElement("div"), k.style.width = "100%", k.style.position = "absolute", k.style.left = f + 10 + "px", e.appendChild(k), m = document.createTextNode(m.title), k.style.whiteSpace = "nowrap", k.style.cursor = "default", k.appendChild(m), b.addEventListeners(e));
                    d.addBr(a);
                    d.addBr(a)
                } else {
                    h = document.createElement("select");
                    b.compareCB = h;
                    g && (h.style.width = g);
                    a.appendChild(h);
                    d.isNN && h.addEventListener("change",
                        function(a) {
                            b.handleCBSelect.call(b, a)
                        }, !0);
                    d.isIE && h.attachEvent("onchange", function(a) {
                        b.handleCBSelect.call(b, a)
                    });
                    f = document.createElement("option");
                    f.text = d.lang.comboBoxSelectText || b.comboBoxSelectText;
                    try {
                        h.add(f, null)
                    } catch (t) {
                        h.add(f)
                    }
                    for (c = 0; c < l.length; c++)
                        if (m = l[c], !0 === m.showInCompare && m != b.chart.mainDataSet) {
                            f = document.createElement("option");
                            f.text = m.title;
                            f.value = c;
                            m.compared && (f.selected = !0);
                            try {
                                h.add(f, null)
                            } catch (x) {
                                h.add(f)
                            }
                        }
                    b.offsetHeight = h.offsetHeight
                }
        },
        addEventListeners: function(a) {
            var b =
                this;
            d.isNN && (a.addEventListener("mouseover", function(a) {
                b.handleRollOver.call(b, a)
            }, !0), a.addEventListener("mouseout", function(a) {
                b.handleRollOut.call(b, a)
            }, !0), a.addEventListener("click", function(a) {
                b.handleClick.call(b, a)
            }, !0));
            d.isIE && (a.attachEvent("onmouseout", function(a) {
                b.handleRollOut.call(b, a)
            }), a.attachEvent("onmouseover", function(a) {
                b.handleRollOver.call(b, a)
            }), a.attachEvent("onclick", function(a) {
                b.handleClick.call(b, a)
            }))
        },
        handleDataSetChange: function() {
            var a = this.selectCB,
                a = this.dataProvider[a.options[a.selectedIndex].value],
                b = this.chart;
            b.mainDataSet = a;
            b.zoomOutOnDataSetChange && (b.startDate = void 0, b.endDate = void 0);
            b.validateData();
            a = {
                type: "dataSetSelected",
                dataSet: a,
                chart: this.chart
            };
            this.fire(a.type, a)
        },
        handleRollOver: function(a) {
            a = this.getRealDiv(a);
            a.dataSet.compared || (a.style.backgroundColor = this.rollOverBackgroundColor)
        },
        handleRollOut: function(a) {
            a = this.getRealDiv(a);
            a.dataSet.compared || (a.style.removeProperty && a.style.removeProperty("background-color"), a.style.removeAttribute && a.style.removeAttribute("backgroundColor"))
        },
        handleCBSelect: function(a) {
            var b = this.compareCB,
                c = this.dataProvider,
                e, d;
            for (e = 0; e < c.length; e++) d = c[e], d.compared && (a = {
                type: "dataSetUncompared",
                dataSet: d
            }), d.compared = !1;
            c = b.selectedIndex;
            0 < c && (d = this.dataProvider[b.options[c].value], d.compared || (a = {
                type: "dataSetCompared",
                dataSet: d
            }), d.compared = !0);
            b = this.chart;
            b.validateData();
            a.chart = b;
            this.fire(a.type, a)
        },
        handleClick: function(a) {
            a = this.getRealDiv(a).dataSet;
            !0 === a.compared ? (a.compared = !1, a = {
                type: "dataSetUncompared",
                dataSet: a
            }) : (a.compared = !0, a = {
                type: "dataSetCompared",
                dataSet: a
            });
            var b = this.chart;
            b.validateData();
            a.chart = b;
            this.fire(a.type, a)
        },
        getRealDiv: function(a) {
            a || (a = window.event);
            a = a.currentTarget ? a.currentTarget : a.srcElement;
            "amCBContainer" == a.parentNode.name && (a = a.parentNode);
            return a
        },
        countDataSets: function(a) {
            var b = this.dataProvider,
                c = 0,
                d;
            for (d = 0; d < b.length; d++) !0 === b[d][a] && c++;
            return c
        }
    })
})();
(function() {
    var d = window.AmCharts;
    d.StackedBullet = d.Class({
        construct: function() {
            this.stackDown = !1;
            this.mastHeight = 8;
            this.shapes = [];
            this.backgroundColors = [];
            this.backgroundAlphas = [];
            this.borderAlphas = [];
            this.borderColors = [];
            this.colors = [];
            this.rollOverColors = [];
            this.showOnAxiss = [];
            this.values = [];
            this.showAts = [];
            this.textColor = "#000000";
            this.nextY = 0;
            this.size = 16
        },
        parseConfig: function() {
            var a = this.bulletConfig;
            this.eventObjects = a.eventObjects;
            this.letters = a.letters;
            this.shapes = a.shapes;
            this.backgroundColors =
                a.backgroundColors;
            this.backgroundAlphas = a.backgroundAlphas;
            this.borderColors = a.borderColors;
            this.borderAlphas = a.borderAlphas;
            this.colors = a.colors;
            this.rollOverColors = a.rollOverColors;
            this.date = a.date;
            this.showOnAxiss = a.showOnAxis;
            this.axisCoordinate = a.minCoord;
            this.showAts = a.showAts;
            this.values = a.values;
            this.fontSizes = a.fontSizes
        },
        write: function(a) {
            this.parseConfig();
            this.container = a;
            this.bullets = [];
            this.fontSize = this.chart.fontSize;
            if (this.graph) {
                var b = this.graph.fontSize;
                b && (this.fontSize = b)
            }
            b =
                this.letters.length;
            (this.mastHeight + 2 * (this.fontSize / 2 + 2)) * b > this.availableSpace && (this.stackDown = !0);
            this.set = a.set();
            a = 0;
            var c;
            for (c = 0; c < b; c++) {
                this.shape = this.shapes[c];
                this.backgroundColor = this.backgroundColors[c];
                this.backgroundAlpha = this.backgroundAlphas[c];
                this.borderAlpha = this.borderAlphas[c];
                this.borderColor = this.borderColors[c];
                this.rollOverColor = this.rollOverColors[c];
                this.showOnAxis = this.showOnAxiss[c];
                this.color = this.colors[c];
                this.value = this.values[c];
                this.showAt = this.showAts[c];
                var d =
                    this.fontSizes[c];
                isNaN(d) || (this.fontSize = d);
                this.addLetter(this.letters[c], a, c);
                this.showOnAxis || a++
            }
        },
        addLetter: function(a, b, c) {
            var e = this.container;
            b = e.set();
            var h = -1,
                l = this.stackDown,
                k = this.graph.valueAxis;
            this.showOnAxis && (this.stackDown = k.reversed ? !0 : !1);
            this.stackDown && (h = 1);
            var g = 0,
                m = 0,
                f = 0,
                p, r = this.fontSize,
                t = this.mastHeight,
                x = this.shape,
                y = this.textColor;
            void 0 !== this.color && (y = this.color);
            void 0 === a && (a = "");
            a = d.fixBrakes(a);
            a = d.text(e, a, y, this.chart.fontFamily, this.fontSize);
            a.node.style.pointerEvents =
                "none";
            e = a.getBBox();
            this.labelWidth = y = e.width;
            this.labelHeight = e.height;
            var n, e = 0;
            switch (x) {
                case "sign":
                    n = this.drawSign(b);
                    g = t + 4 + r / 2;
                    e = t + r + 4;
                    1 == h && (g -= 4);
                    break;
                case "flag":
                    n = this.drawFlag(b);
                    m = y / 2 + 3;
                    g = t + 4 + r / 2;
                    e = t + r + 4;
                    1 == h && (g -= 4);
                    break;
                case "pin":
                    n = this.drawPin(b);
                    g = 6 + r / 2;
                    e = r + 8;
                    break;
                case "triangleUp":
                    n = this.drawTriangleUp(b);
                    g = -r - 1;
                    e = r + 4;
                    h = -1;
                    break;
                case "triangleDown":
                    n = this.drawTriangleDown(b);
                    g = r + 1;
                    e = r + 4;
                    h = -1;
                    break;
                case "triangleLeft":
                    n = this.drawTriangleLeft(b);
                    m = r;
                    e = r + 4;
                    h = -1;
                    break;
                case "triangleRight":
                    n =
                        this.drawTriangleRight(b);
                    m = -r;
                    h = -1;
                    e = r + 4;
                    break;
                case "arrowUp":
                    n = this.drawArrowUp(b);
                    a.hide();
                    break;
                case "arrowDown":
                    n = this.drawArrowDown(b);
                    a.hide();
                    e = r + 4;
                    break;
                case "text":
                    h = -1;
                    n = this.drawTextBackground(b, a);
                    g = this.labelHeight + 3;
                    e = r + 10;
                    break;
                case "round":
                    n = this.drawCircle(b)
            }
            this.bullets[c] = n;
            this.showOnAxis ? (p = isNaN(this.nextAxisY) ? this.axisCoordinate : this.nextY, f = g * h, this.nextAxisY = p + h * e) : this.value ? (p = this.value, k.recalculateToPercents && (p = p / k.recBaseValue * 100 - 100), p = k.getCoordinate(p) - this.bulletY,
                f = g * h) : this.showAt ? (n = this.graphDataItem.values, k.recalculateToPercents && (n = this.graphDataItem.percents), n && (p = k.getCoordinate(n[this.showAt]) - this.bulletY, f = g * h)) : (p = this.nextY, f = g * h);
            a.translate(m, f);
            b.push(a);
            b.translate(0, p);
            this.addEventListeners(b, c);
            this.nextY = p + h * e;
            this.stackDown = l
        },
        addEventListeners: function(a, b) {
            var c = this;
            a.click(function() {
                c.handleClick(b)
            }).mouseover(function() {
                c.handleMouseOver(b)
            }).touchend(function() {
                c.handleMouseOver(b, !0);
                c.handleClick(b)
            }).mouseout(function() {
                c.handleMouseOut(b)
            })
        },
        drawPin: function(a) {
            var b = -1;
            this.stackDown && (b = 1);
            var c = this.fontSize + 4;
            return this.drawRealPolygon(a, [0, c / 2, c / 2, -c / 2, -c / 2, 0], [0, b * c / 4, b * (c + c / 4), b * (c + c / 4), b * c / 4, 0])
        },
        drawSign: function(a) {
            var b = -1;
            this.stackDown && (b = 1);
            var c = this.mastHeight * b,
                e = this.fontSize / 2 + 2,
                h = d.line(this.container, [0, 0], [0, c], this.borderColor, this.borderAlpha, 1),
                l = d.circle(this.container, e, this.backgroundColor, this.backgroundAlpha, 1, this.borderColor, this.borderAlpha);
            l.translate(0, c + e * b);
            a.push(h);
            a.push(l);
            this.set.push(a);
            return l
        },
        drawFlag: function(a) {
            var b = -1;
            this.stackDown && (b = 1);
            var c = this.fontSize + 4,
                e = this.labelWidth + 6,
                h = this.mastHeight,
                b = 1 == b ? b * h : b * h - c,
                h = d.line(this.container, [0, 0], [0, b], this.borderColor, this.borderAlpha, 1),
                c = d.polygon(this.container, [0, e, e, 0], [0, 0, c, c], this.backgroundColor, this.backgroundAlpha, 1, this.borderColor, this.borderAlpha);
            c.translate(0, b);
            a.push(h);
            a.push(c);
            this.set.push(a);
            return c
        },
        drawTriangleUp: function(a) {
            var b = this.fontSize + 7;
            return this.drawRealPolygon(a, [0, b / 2, -b / 2, 0], [0, b,
                b, 0
            ])
        },
        drawArrowUp: function(a) {
            var b = this.size,
                c = b / 2,
                d = b / 4;
            return this.drawRealPolygon(a, [0, c, d, d, -d, -d, -c, 0], [0, c, c, b, b, c, c, 0])
        },
        drawArrowDown: function(a) {
            var b = this.size,
                c = b / 2,
                d = b / 4;
            return this.drawRealPolygon(a, [0, c, d, d, -d, -d, -c, 0], [0, -c, -c, -b, -b, -c, -c, 0])
        },
        drawTriangleDown: function(a) {
            var b = this.fontSize + 7;
            return this.drawRealPolygon(a, [0, b / 2, -b / 2, 0], [0, -b, -b, 0])
        },
        drawTriangleLeft: function(a) {
            var b = this.fontSize + 7;
            return this.drawRealPolygon(a, [0, b, b, 0], [0, -b / 2, b / 2])
        },
        drawTriangleRight: function(a) {
            var b =
                this.fontSize + 7;
            return this.drawRealPolygon(a, [0, -b, -b, 0], [0, -b / 2, b / 2, 0])
        },
        drawRealPolygon: function(a, b, c) {
            b = d.polygon(this.container, b, c, this.backgroundColor, this.backgroundAlpha, 1, this.borderColor, this.borderAlpha);
            a.push(b);
            this.set.push(a);
            return b
        },
        drawCircle: function(a) {
            var b = d.circle(this.container, this.fontSize / 2, this.backgroundColor, this.backgroundAlpha, 1, this.borderColor, this.borderAlpha);
            a.push(b);
            this.set.push(a);
            return b
        },
        drawTextBackground: function(a, b) {
            var c = b.getBBox(),
                d = -c.width /
                2 - 5,
                h = c.width / 2 + 5,
                c = -c.height - 12;
            return this.drawRealPolygon(a, [d, -5, 0, 5, h, h, d, d], [-5, -5, 0, -5, -5, c, c, -5])
        },
        handleMouseOver: function(a, b) {
            b || this.bullets[a].attr({
                fill: this.rollOverColors[a]
            });
            var c = this.eventObjects[a],
                e = {
                    type: "rollOverStockEvent",
                    eventObject: c,
                    graph: this.graph,
                    date: this.date
                },
                h = this.bulletConfig.eventDispatcher;
            e.chart = h;
            h.fire(e.type, e);
            c.url && this.bullets[a].setAttr("cursor", "pointer");
            this.chart.showBalloon(d.fixNewLines(c.description), h.stockEventsSettings.balloonColor, !0)
        },
        handleClick: function(a) {
            a = this.eventObjects[a];
            var b = {
                    type: "clickStockEvent",
                    eventObject: a,
                    graph: this.graph,
                    date: this.date
                },
                c = this.bulletConfig.eventDispatcher;
            b.chart = c;
            c.fire(b.type, b);
            b = a.urlTarget;
            b || (b = c.stockEventsSettings.urlTarget);
            d.getURL(a.url, b)
        },
        handleMouseOut: function(a) {
            this.bullets[a].attr({
                fill: this.backgroundColors[a]
            });
            a = {
                type: "rollOutStockEvent",
                eventObject: this.eventObjects[a],
                graph: this.graph,
                date: this.date
            };
            var b = this.bulletConfig.eventDispatcher;
            a.chart = b;
            b.fire(a.type, a)
        }
    })
})();
