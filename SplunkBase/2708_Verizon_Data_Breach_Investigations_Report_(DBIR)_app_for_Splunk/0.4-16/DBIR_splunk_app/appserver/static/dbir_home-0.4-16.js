var patterns = [ {
    name : 'CRIMEWARE',
    url : 'crimeware'
}, {
    name : 'WEB APP ATTACKS',
    url : 'webapp_attacks'
}, {
    name : 'POINT-OF-SALE INTRUSIONS',
    url : 'point_of_sale'
}, {
    name : 'CYBER-ESPIONAGE',
    url : 'cyber'
}, {
    name : 'INSIDER MISUSE',
    url : 'insider_misuse'
}, {
    name : 'DENIAL-OF-SERVICE ATTACKS',
    url : 'denial_of_service'
}];

var homepage = {
    name : 'HOME',
    url : 'dbir_home'
}

var pctLabels = [ [ ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ '1%', '1%', '91%', ' ', '5%', ' ' ],
        [ ' ', '18%', ' ', '9% ', '45%', ' ' ],
        [ '32%', '9%', ' ', '15%', '9%', ' ' ],
        [ ' ', '7%', '73%', ' ', '7%', ' ' ],
        [ '36%', '31%', ' ', ' ', '11%', ' ' ],
        [ '1%', '9%', '12%', '4%', '26%', ' ' ],
        [ '14%', '35%', ' ', '37%', '7%', ' ' ],
        [ '34%', '1%', ' ', '60%', '4%', ' ' ],
        [ ' ', ' ', ' ', '14%', '79%', ' ' ],
        [ ' ', '8%', '8%', '8%', '33%', ' ' ],
        [ '25%', '4%', '5%', '52%', '4%', ' ' ],
        [ '51%', '6%', ' ', '5%', '11%', ' ' ],
        [ '11%', '5%', '70%', ' ', '3%', ' ' ] ];

var industryLabels = [ "All Industry", "Accomodation", "Administrative",
        "Educational", "Entertainment", "Financial Services", "Healthcare",
        "Information", "Manufacturing", "Mining", "Other Services",
        "Professional", "Public", "Retail" ];

function loadPatternsList(isHome) {
    $("#patternsList").html("");
    if (!isHome) {
        appendMenuItem(homepage.name, homepage.url, "A");
    }

    for (var i = 0; i < patterns.length; i++) {
        appendMenuItem(patterns[i].name, patterns[i].url, i);
    }
}

function appendMenuItem(menuName, menuUrl, menuId) {
    $("#patternsList").append(
        "<li id='pattern" + menuId + "'><a href='" + menuUrl
        + "'><span class='menu_item'>" + menuName
        + "</span><span class='menu_pct' id='pctMenu" + menuId
        + "'>&nbsp;</span></a><li>");
}

function loadIndustryList() {
    $("#industryList").html("");
    for (var i = 0; i < industryLabels.length; i++) {
        $("#industryList").append(
            "<li><a onClick='updatePct(" + i + ")' href='#'><span>"
            + industryLabels[i] + "</span></a><li>");
    }
}

function loadPercentages() {
    var indId = localStorage.getItem('industryId');
    if (indId == null) {
        indId = 0;
    } else if ((indId < 0) || (indId >= industryLabels.length)) {
        indId = 0;
    }
    updatePct(indId);
}

function updatePct(idx) {
    localStorage.setItem('industryId', idx);
    document.getElementById("all_industry_span").innerHTML = industryLabels[idx];
    for (var i = 0; i <= 5; i++) {
        document.getElementById("pctMenu" + i).innerHTML = pctLabels[idx][i];
    }
}
