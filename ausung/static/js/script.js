
var themeurl = 'http://www.amcharts.com/wp-content/themes/amcharts';
var changing_zoom = false;

$("#searchForm").submit( function(e) {
    e.preventDefault();
    window.location.href =  "./"+$("#serachInput").val();
});

$("#comments-wrapper").css("max-height", $(".search-body").height());
$("#comments-wrapper").css("overflow", "scroll");
$("#comments-wrapper").css("padding", "0px");

function handleZoom(event) {
    var range = [];
    for (var i in times) {
        var time = times[i];
        var date = new Date(time*1000 * 86400);
        if (event.startDate < date && event.endDate > date) {
            Array.prototype.push.apply(range, comments[time]);
        }
    }
    //console.log(event);

    if (!changing_zoom) {
        changing_zoom = true;
        for (var i in charts) {
            if (event.chart != charts[i])
                charts[i].zoom(event.startDate, event.endDate);
        }
        update_comments(range);
        changing_zoom = false;
    }

}

charts = []

AmCharts.ready(function () {
    if ($("#chartdiv1").length) {
        var chart1 = createStockChart(1);
        chart1.write('chartdiv1');
        chart1.addListener("zoomed", handleZoom);
        charts.push(chart1);
    }

    if ($("#chartdiv2").length) {
        var chart2 = createStockChart(2);
        chart2.write('chartdiv2');
        chart2.addListener("zoomed", handleZoom);
        charts.push(chart2);
    }

    if ($("#chartdiv3").length) {
        var chart3 = createStockChart(3);
        chart3.write('chartdiv3');
        chart3.addListener("zoomed", handleZoom);
        charts.push(chart3);
    }

    /*var html='<div class="amChartsCompareList amcharts-compare-div" style="overflow-y: auto; overflow-x: hidden; width: 178px; max-height: 150px;">';

    for (var i in related) {
        html += '<div class="amcharts-compare-item-div" style="padding: 4px; position: relative; height: 25px;"> <div style="width: 25px; height: 25px; position: absolute; background-color: rgb(252, 210, 2);"></div> <div style="width: 100%; position: absolute; left: 35px; white-space: nowrap; cursor: default;">' + related[i] + '</div> </div> </div>'
    }

    alert(html);*/
});

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
};

function Comparator(a,b){
    if (a[3] < b[3]) return 1;
    if (a[3] > b[3]) return -1;
    return 0;
}

function update_comments(range) {
    $("#comments").html("");
    var class_n = "", data;

    var range = range.sort(Comparator);

    for (var i in range.slice(0, 100)) {
        if (range[i][0] == 1)
            class_n="one"
        else if (range[i][0] == 2)
            class_n="two"
        else if (range[i][0] == 3)
            class_n="three"
        else if (range[i][0] == 4)
            class_n="four"
        else if (range[i][0] == 5)
            class_n="five"

        data = range[i];

        //$("#comments").append('<div class="item pure-u-1-1 pure-u-md-1-4 pure-u-sm-1-3"><aside class="' + class_n + '"><a href="http://news.naver.com/main/read.nhn?oid=' + paddy(data[1], 3) + '&aid=' + paddy(data[2], 10) + '" target="_blank"><p class="white">' +data[5] + '</p><div class="center"> <button class="button-xsmall pure-button positive-button button-c">공감 ' + data[3] + '</button> <button class="button-xsmall pure-button positive-button">부정 ' + data[4] + '</button><br/> </div> </a></aside></div>')
        $("#comments").append('<div class="item pure-u-1-1 pure-u-md-1-1 pure-u-sm-1-1"><aside class="' + class_n + '"><a href="http://news.naver.com/main/read.nhn?oid=' + paddy(data[1], 3) + '&aid=' + paddy(data[2], 10) + '" target="_blank"><p class="white comment-content">' +data[5] + '</p><div class="center"> <button class="button-xsmall pure-button positive-button button-c">공감 ' + data[3] + '</button> <button class="button-xsmall pure-button positive-button">부정 ' + data[4] + '</button><br/> </div> </a></aside></div>')
    }

    /*var container = document.querySelector('#comments');
        var msnry = new Masonry( container, {
        itemSelector: '.item'
    });*/
}

function generateChartData(length) {
    var chartData = [];

    var firstDate = new Date();
    firstDate.setDate(firstDate.getDate() - length);
    firstDate.setHours(0, 0, 0, 0);


    var a1s = [];
    var b1s = [];

    var momentum = 3;
    for (var i = 0; i < length; i++) {
        var a1 = momentum + Math.random()*2-1;
        momentum = a1;

        var b1 = Math.round(Math.random() * (5));
        a1s.push(a1);
        b1s.push(b1);
    }

    var max = d3.max(a1s);
    var scale = d3.scale.linear().domain([d3.min(a1s), d3.max(a1s)]).range([1, 5]);

    for (var i = 0; i < length; i++) {
        var newDate = new Date(firstDate);
        newDate.setDate(newDate.getDate() + i);

        chartData.push({
            date: newDate,
            value: scale(a1s[i]),
            volume: b1s[i]
        });
    }

    return chartData;
}

function makeDataSet(item, length, data_set) {
    var dataSet = new AmCharts.DataSet();
    dataSet.title = item;
    dataSet.fieldMappings = [{
        fromField: "value",
        toField: "value"
    }, {
        fromField: "volume",
        toField: "volume"
    }];
    //dataSet.dataProvider = generateChartData(length);
    dataSet.dataProvider = data_set;
    dataSet.categoryField = "date";

    return dataSet;
}

function paddy(n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

function createStockChart(mode) {
    var theme;
    if (mode == 2) {
        theme = AmCharts.themes.light;
        data_sets = data_sets2;
    } else if (mode == 3) {
        theme = AmCharts.themes.dark;
        data_sets = data_sets3;
    } else {
        data_sets = data_sets1;
    }
    
    var chart = new AmCharts.AmStockChart(theme);
    chart.pathToImages = "/carpedm20/ausung/static/img/";

    chart.categoryAxesSettings = {maxSeries:0};

    // DATASETS //////////////////////////////////////////
    // create data sets first

    var dataSets = [];

    for (var i in data_sets) {
        //console.log(data_sets[i][0], media_dict[paddy(data_sets[i][0],3)]);
        var title;
        if (mode == 3) {
            if (i==0)
                title = "부정";
            else if (i==1)
                title = "약간 부정";
            else if (i==2)
                title = "중립";
            else if (i==3)
                title = "약간 긍정";
            else if (i==4)
                title = "긍정";
        } else
        title = media_dict[paddy(data_sets[i][0],3)];
        data_set = data_sets[i][1];
        dataSets.push(makeDataSet(title + " (" + data_set.length + ")", 500, data_set));
    }

    // set data sets to the chart
    chart.dataSets = dataSets;

    // PANELS ///////////////////////////////////////////
    // first stock panel
    var stockPanel1 = new AmCharts.StockPanel();
    stockPanel1.showCategoryAxis = false;
    stockPanel1.title = "Value";
    stockPanel1.percentHeight = 70;

    // graph of first stock panel
    var graph1 = new AmCharts.StockGraph();
    graph1.valueField = "value";
    graph1.comparable = true;
    graph1.compareField = "value";
    graph1.bullet = "round";
    graph1.bulletBorderColor = "#FFFFFF";
    graph1.bulletBorderAlpha = 1;
    graph1.balloonText = "[[title]]:<b>[[value]]</b>";
    graph1.compareGraphBalloonText = "[[title]]:<b>[[value]]</b>";
    //graph1.compareGraphBalloonText = "[[title]]";
    graph1.compareGraphBullet = "round";
    graph1.compareGraphBulletBorderColor = "#FFFFFF";
    graph1.compareGraphBulletBorderAlpha = 1;
    stockPanel1.addStockGraph(graph1);

    // create stock legend
    var stockLegend1 = new AmCharts.StockLegend();
    stockLegend1.periodValueTextComparing = "[[percents.value.close]]%";
    stockLegend1.periodValueTextRegular = "[[value.close]]";
    stockLegend1.valueTextComparing = "[[value]]";
    stockPanel1.stockLegend = stockLegend1;


    // second stock panel
    var stockPanel2 = new AmCharts.StockPanel();
    stockPanel2.title = "Volume";
    stockPanel2.percentHeight = 30;
    var graph2 = new AmCharts.StockGraph();
    graph2.valueField = "volume";
    graph2.type = "column";
    graph2.showBalloon = false;
    graph2.fillAlphas = 1;
    stockPanel2.addStockGraph(graph2);

    var stockLegend2 = new AmCharts.StockLegend();
    stockLegend2.periodValueTextRegular = "[[value.close]]";
    stockPanel2.stockLegend = stockLegend2;

    // set panels to the chart
    chart.panels = [stockPanel1, stockPanel2];


    // OTHER SETTINGS ////////////////////////////////////
    var sbsettings = new AmCharts.ChartScrollbarSettings();
    sbsettings.graph = graph1;
    chart.chartScrollbarSettings = sbsettings;

    chart.panelsSettings = {
        recalculateToPercents: "never"
    };

    // CURSOR
    var cursorSettings = new AmCharts.ChartCursorSettings();
    cursorSettings.valueBalloonsEnabled = true;
    chart.chartCursorSettings = cursorSettings;


    // PERIOD SELECTOR ///////////////////////////////////
    var periodSelector = new AmCharts.PeriodSelector();
    periodSelector.position = "left";
    periodSelector.periods = [
    {
        period: "MM",
        selected: true,
        count: 3,
        label: "3 month"
    }, {
        period: "YYYY",
        count: 1,
        label: "1 year"
    }, {
        period: "YTD",
        label: "YTD"
    }, {
        period: "MAX",
        label: "MAX"
    }];
    chart.periodSelector = periodSelector;

    var dataSetSelector = new AmCharts.DataSetSelector();
    dataSetSelector.position = 'left';
    chart.dataSetSelector = dataSetSelector;

    return chart;
}

var media_dict = {
    '032':'경향신문',
    '005':'국민일보',
    '020':'동아일보',
    '021':'문화일보',
    '081':'서울신문',
    '022':'세계일보',
    '023':'조선일보',
    '025':'중앙일보',
    '028':'한겨레',
    '469':'한국일보',
    '421':'뉴스1',
    '003':'뉴시스',
    '001':'연합뉴스',
    '422':'연합뉴스TV',
    '449':'채널A',
    '215':'한국경제TV',
    '437':'JTBC TV',
    '056':'KBS TV',
    '214':'MBC TV',
    '057':'MBN',
    '096':'SBS',
    '374':'SBS CNBC TV',
    '055':'SBS TV',
    '448':'TV조선',
    '034':'YTN',
    '052':'YTN TV',
    '009':'매일경제',
    '008':'머니투데이',
    '011':'서울경제',
    '277':'아시아경제',
    '018':'이데일리',
    '366':'조선비즈',
    '014':'파이낸셜뉴스',
    '015':'한국경제',
    '016':'헤럴드경제',
    '375':'SBS CNBC ',
    '079':'노컷뉴스',
    '119':'데일리안',
    '006':'미디어오늘',
    '047':'오마이뉴스',
    '002':'프레시안',
    '138':'디지털데일리',
    '029':'디지털타임스',
    '293':'블로터',
    '031':'아이뉴스24',
    '030':'전자신문',
    '092':'ZDNet Korea',
    '356':'게임메카',
    '216':'골닷컴',
    '435':'골프다이제스트',
    '420':'네이버 TV연예',
    '447':'뉴스엔',
    '347':'데일리e스포츠',
    '439':'디스이즈게임',
    '433':'디스패치',
    '425':'마니아리포트',
    '117':'마이데일리',
    '343':'베스트일레븐',
    '316':'순스포츠',
    '108':'스타뉴스',
    '144':'스포츠경향',
    '382':'스포츠동아',
    '468':'스포츠서울',
    '076':'스포츠조선',
    '139':'스포탈코리아',
    '477':'스포티비뉴스',
    '302':'아이웨이미디어',
    '465':'아이즈 ize',
    '311':'엑스포츠뉴스',
    '275':'엠파이트',
    '442':'인벤',
    '413':'인터풋볼',
    '241':'일간스포츠',
    '065':'점프볼',
    '111':'조이뉴스24',
    '312':'텐아시아',
    '440':'티브이데일리',
    '236':'포모스',
    '479':'헝그리앱',
    '112':'헤럴드POP',
    '404':'enews24',
    '482':'GS칼텍스 배구단',
    '470':'JTBC GOLF',
    '438':'KBS 연예',
    '408':'MBC연예',
    '410':'MK스포츠 ',
    '427':'OBS TV',
    '109':'OSEN',
    '416':'SBS funE',
    '213':'TV리포트',
    '444':'뉴스위크',
    '145':'레이디경향',
    '024':'매경이코노미',
    '417':'머니위크',
    '308':'시사IN Live',
    '262':'신동아',
    '140':'씨네21',
    '415':'앳스타일',
    '094':'월간 산',
    '243':'이코노미스트',
    '007':'일다',
    '033':'주간경향',
    '037':'주간동아',
    '053':'주간조선',
    '353':'중앙SUNDAY',
    '036':'한겨레21',
    '050':'한경비즈니스',
    '087':'강원일보',
    '088':'매일신문',
    '082':'부산일보',
    '127':'기자협회보',
    '310':'여성신문',
    '123':'조세일보',
    '152':'참세상',
    '040':'코리아타임스',
    '044':'코리아헤럴드',
    '296':'코메디닷컴',
    '105':'팝뉴스',
    '346':'헬스조선',
    '045':'로이터',
    '348':'신화사 연합뉴스',
    '412':'한국사진기자협회',
    '077':'AP연합뉴스',
    '091':'EPA연합뉴스',
    '321':'재해재난속보',
    '298':'정책브리핑',
    '441':'코리아넷',
    '000':'전체 통계',
    '004':'한국경제TV',
    '143':'쿠키뉴스',
}

