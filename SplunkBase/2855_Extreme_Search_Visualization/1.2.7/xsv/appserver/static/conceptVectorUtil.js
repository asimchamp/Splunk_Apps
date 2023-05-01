/*
 Copyright 2015 Scianta Analytics LLC   All Rights Reserved.  
 Reproduction or unauthorized use is prohibited. Unauthorized
 use is illegal. Violators will be prosecuted. This software 
 contains proprietary trade and business secrets.            

  Module: conceptVectorUtil

*/
var ConceptVectorUtil = {


    createVectorCurveDecrease: function(domainMin, domainMax, termMin, inflectionPoint, termMax) {
        var result = [];
        var domainSize = domainMax - domainMin;
        var leftSize = (termMax-inflectionPoint) * 2;
        var rightSize = (inflectionPoint - termMin) * 2;
        var i = 0;
        for(i=0;i<256;i++)
        {
            var bucketSize = domainMin + i/256 * domainSize;
            if (bucketSize <= termMin)
                result[i] = 1.00;
            else if (bucketSize < inflectionPoint)
                result[i] = (1 - (2 * (Math.pow((bucketSize-termMin)/rightSize,2))));
            else if (bucketSize < termMax)
                result[i] = (2 * (Math.pow((bucketSize-termMax)/leftSize,2)));
            else
                result[i] = 0;
        }
        return result;
    },

    createVectorCurveIncrease: function(domainMin, domainMax, termMin, inflectionPoint, termMax) {
        var result = [];
        var domainSize = domainMax - domainMin;
        var leftSize = (termMax-inflectionPoint) * 2;
        var rightSize = (inflectionPoint - termMin) * 2;
        var i = 0;
        for(i=0;i<256;i++)
        {
            var bucketSize = domainMin + i/256 * domainSize;
            if (bucketSize >= termMax)
                result[i] = 1.00;
            else if (bucketSize > inflectionPoint)
                result[i] = (1 - (2 * (Math.pow((bucketSize-termMax)/leftSize,2))));
            else if (bucketSize > termMin)
                result[i] = (2 * (Math.pow((bucketSize-termMin)/rightSize,2)));
            else
                result[i] = 0;
        }
        return result;
    },

    createVectorLinearDecrease: function(domainMin, domainMax, termMin, termMax) {
        var result = [];
        var domainSize = domainMax - domainMin;
        var termSize = termMax - termMin;
        var i = 0;
        for(i=0; i<256; i++)
        {
            var distanceFromMin = domainMin + i/256 * domainSize;
            if (distanceFromMin <= termMin)
                result[i] = 1.00;
            else if(distanceFromMin < termMax)
                result[i] = 1.00 - (distanceFromMin - termMin)/ termSize;
            else
                result[i] = 0;
        }
        return result;
    },

    createVectorLinearIncrease: function(domainMin, domainMax, termMin, termMax) {
        var result = [];
        var domainSize = domainMax - domainMin;
        var termSize = termMax - termMin;
        var i = 0;
        for(i=0; i<256; i++)
        {
            var distanceFromMin = domainMin + i/256 * domainSize;
            if (distanceFromMin > termMax)
                result[i] = 1.00;
            else if(distanceFromMin > termMin)
                result[i] = ((distanceFromMin - termMin)/ termSize);
            else
                result[i] = 0;
        }
        return result;
    },

    createVectorPI: function(domainMin, domainMax, termMin, leftInflectionPoint, centerPoint, rightInflectionPoint, termMax) {
        var result = [];
        var domainSize = domainMax - domainMin;
        var i = 0;
        for(i=0;i<256;i++)
        {
            var bucketIDX = domainMin + i/256 * domainSize;
            if (bucketIDX >= termMin && bucketIDX <= termMax)
            {
                if (bucketIDX < leftInflectionPoint)
                    result[i] = (2 * (Math.pow((bucketIDX - termMin)/((leftInflectionPoint - termMin)*2),2)));
                else if (bucketIDX < centerPoint)
                    result[i] = (1 - (2 * (Math.pow((bucketIDX - centerPoint)/((centerPoint - leftInflectionPoint)*2),2))));
                else if (bucketIDX < rightInflectionPoint)
                    result[i] = (1 - (2 * (Math.pow((bucketIDX - centerPoint)/((rightInflectionPoint - centerPoint)*2),2))));
                else if (bucketIDX < termMax)
                    result[i] = (2 * (Math.pow((bucketIDX - termMax)/((termMax - rightInflectionPoint)*2),2)));
            }
            else
            {
                result[i]=0;
            }
        }
        return result;
    },

    createVectorTrapezoid: function(domainMin, domainMax, termMin, leftTrapPoint, rightTrapPoint, termMax) {
        var result = [];
        var domainSize = domainMax - domainMin;
        for(i=0;i<256;i++)
        {
            var bucketSize = domainMin + i/256 * domainSize;
            if (bucketSize >= termMin && bucketSize <= termMax)
            {
                if (bucketSize < leftTrapPoint)
                    result[i]=((bucketSize - termMin)/(leftTrapPoint - termMin));
                else if (bucketSize > rightTrapPoint)
                    result[i]=(1 - (bucketSize - rightTrapPoint)/(termMax - rightTrapPoint));
                else
                    result[i]=1.0;
            }
            else
            {
                result[i]=0;
            }
        }
        return result;
    },

    createVectorStrapezoid: function(domainMin, domainMax, termMin, leftInflectionPoint, leftTrapPoint, rightTrapPoint, rightInflectionPoint, termMax) {
        var result = [];
        var domainSize = domainMax - domainMin;

        for(i=0;i<256;i++)
        {
            var bucketSize = domainMin + i/256 * domainSize;
            if (bucketSize >= termMin && bucketSize <= termMax)
            {
                if (bucketSize >= leftInflectionPoint && bucketSize <= leftTrapPoint) {
                    result[i]=(1-(2 * (Math.pow((bucketSize - leftTrapPoint)/((leftTrapPoint - leftInflectionPoint)*2),2))));
                }
                else if (bucketSize >= termMin && bucketSize <= leftInflectionPoint) {
                    result[i]=(2 * (Math.pow((bucketSize - termMin)/((leftInflectionPoint - termMin)*2),2)));
                }
                else if (bucketSize >= rightTrapPoint && bucketSize <= rightInflectionPoint) {
                    result[i]=(1-(2 * (Math.pow((bucketSize - rightTrapPoint)/((rightInflectionPoint - rightTrapPoint)*2),2))));
                }
                else if (bucketSize >= rightInflectionPoint && bucketSize <= termMax) {
                    result[i]=(2 * (Math.pow((bucketSize - termMax)/((termMax - rightInflectionPoint)*2),2)));
                }
                else {
                    result[i]=1.0;
                }
            }
            else
            {
                result[i]=0;
            }
        }
        return result;
    },

    createVectorTriangle: function(domainMin, domainMax, termMin, centerPoint, termMax) {
        var result = [];
        var domainSize = domainMax - domainMin;

        for(i=0;i<256;i++)
        {
            var bucketSize = domainMin + i/256 * domainSize;
            if (bucketSize >= termMin && bucketSize <= termMax)
            {
                if (bucketSize < centerPoint)
                result[i] = ((bucketSize - termMin)/(centerPoint - termMin));
                else if (bucketSize == centerPoint)
                    result[i] = 1.0;
                else
                    result[i]= (1 - (bucketSize - centerPoint)/(termMax - centerPoint));
            }
            else
            {
                result[i]=0;
            }
        }
        return result;
    },

    createVectorCurve: function(domainMin, domainMax, termMin, centerPoint, termMax) {
    },

    getChartData: function(contextName,concepts,selectedMethod) {
        var self = this;
        var conceptData = new Object();
        conceptData.fields = [];
        conceptData.rows = [];
        var j = 0;
        for (j = 0; j < 256; j++) {
            conceptData.rows[j] = [];
            conceptData.rows[j].push(j);
        }
        conceptData.fields.push(contextName);
        var domainMin = 0;
        domainMax = 256;
        var size = domainMax / concepts.length;
        var low_max = 0;
        var high_min = 0;
        var crossovers = [];
        if (selectedMethod == "crossoverDriven") {
            for (var x = 0; x < concepts.length+1; x++) {
                if (x == 0) crossovers.push(0);
                else if (x == concepts.length) crossovers.push(255);
                else crossovers.push(x*size);
            }
        }

        for (var i = 0; i < concepts.length; i++) {

            var shape = "";
            if (selectedMethod == "anomalyDriven") {
                shape = concepts[1].shape;
                if (concepts.length == 3) {
                   //if (i == 0) continue;
                   if (i == 2) continue;
                }
            }

            conceptData.fields.push(concepts[i].name);
            // Default values for dataDefine
            var results = null;
            var min = i * size - size * 0.50;
            if (i == 0) min = domainMin;
            var max = i * size + size + size * 0.50;
            if (i == concepts.length-1) max = domainMax

            if (concepts[i].shape == "lineardecrease") {
                results = self.createVectorLinearDecrease(domainMin,domainMax,min,max);
            }
            else if (concepts[i].shape == "linearincrease") {
                results = self.createVectorLinearIncrease(domainMin,domainMax,min,max);
            }
            else if (concepts[i].shape == "curvedecrease") {
                var inflection = min + (max-min)/2;
                results = self.createVectorCurveDecrease(domainMin,domainMax,min,inflection,max);
            }
            else if (concepts[i].shape == "curveincrease") {
                var inflection = min + (max-min)/2;
                results = conceptData.rows.push = self.createVectorCurveIncrease(domainMin,domainMax,min,inflection,max);
            }
            else if (concepts[i].shape == "pi") {
                if (selectedMethod == "crossoverDriven") {
                    min = 0;
                    max = 0;
                    if (i == 1)
                    {
                        min = crossovers[0];
                        max = (crossovers[2] + crossovers[3]) / 2;
                    }
                    else if (i == concepts.length - 2)
                    {
                        min = (crossovers[i-1] + crossovers[i]) / 2;
                        max = crossovers[concepts.length];
                    }
                    else
                    {
                        min = (crossovers[i] + crossovers[i-1]) / 2;
                        max = (crossovers[i+1] + crossovers[i+2]) / 2;
                    }
                    var inflectionLeft = crossovers[i];
                    var center = (crossovers[i] + crossovers[i+1]) / 2;
                    var inflectionRight = crossovers[i+1];
                    results = self.createVectorPI(domainMin,domainMax,min,inflectionLeft,center,inflectionRight,max);
                }
                else if (selectedMethod == "anomalyDriven") {
                    // crossovers default to 0, 76 (30%), 178 (70%), 255
                    var min = 0;                 //points[0] = crossovers[0];
                    var inflectionLeft = 76;     //points[1] = crossovers[1];
                    var center = (76 + 178) / 2; //points[2] = (crossovers[1] + crossovers[2]) / 2;
                    var inflectionRight = 178;   //points[3] = crossovers[2];
                    var max = 255;               //points[4] = crossovers[3];
                    //low_max = high_min = center; //points[2];
                    //min = 51;
                    //max = 255;
                    //var center = min + (max-min)/2;
                    //var segmentSize = (max - min ) / 4;
                    //var inflectionLeft = min + segmentSize;
                    //var inflectionRight = max - segmentSize;
                    results = self.createVectorPI(domainMin,domainMax,min,inflectionLeft,center,inflectionRight,max);
                }
                else {
                    var center = min + (max-min)/2;
                    var segmentSize = (max - min ) / 4;
                    var inflectionLeft = min + segmentSize;
                    var inflectionRight = max - segmentSize;
                    results = self.createVectorPI(domainMin,domainMax,min,inflectionLeft,center,inflectionRight,max);
                }
            }
            else if (concepts[i].shape == "trapezoid") {
                if (selectedMethod == "crossoverDriven") {
                }
                else if (selectedMethod == "anomalyDriven") {
                }
                var trapLeft = min + ((max-min)/2 * 0.25);
                var trapRight = max - ((max-min)/2 * 0.25);
                results = self.createVectorTrapezoid(domainMin,domainMax,min,trapLeft,trapRight,max);
            }
            else if (concepts[i].shape == "strapezoid") {
                if (selectedMethod == "anomalyDriven") {
                    // 0, 32, 64, 191, 223, 255
                    var center = 191 - 32;                //crossovers[2] - crossovers[1];
                    min = 0;                              //points[0] = crossovers[0];
                    var inflectionLeft = 32;              //points[1] = crossovers[1];
                    var trapLeft = 32 + (0.2 * center);   //points[2] = crossovers[1] + 0.2 * center;
                    var trapRight = 223 - (0.2 * center); //points[3] = crossovers[2] - 0.2 * center;
                    var inflectionRight = 223;            //points[4] = crossovers[2];
                    var max =  255;                       //points[5] = crossovers[3];
                    low_max = trapLeft;                   //points[2];
                    high_min = trapRight;                 //points[3];
                    //min = 43;
                    //max = 211;
                    //var termSize = max - min;
                    //var trapSize = termSize * 0.25;
                    //var trapLeft = min + trapSize;
                    //var trapRight = max - trapSize;
                    //var inflectionLeft = min + trapSize/2;
                    //var inflectionRight = max - trapSize/2;
                    results = self.createVectorStrapezoid(domainMin,domainMax,min,inflectionLeft,trapLeft, trapRight,inflectionRight,max);
                }
                else {
                    var termSize = max - min;
                    var trapSize = termSize * 0.25;
                    var trapLeft = min + trapSize;
                    var trapRight = max - trapSize;
                    var inflectionLeft = min + trapSize/2;
                    var inflectionRight = max - trapSize/2;
                    results = self.createVectorStrapezoid(domainMin,domainMax,min,inflectionLeft,trapLeft, trapRight,inflectionRight,max);
                }
            }
            else if (concepts[i].shape == "triangle") {
                var center = min + (max-min)/2;
                results = self.createVectorTriangle(domainMin,domainMax,min,center,max);
            }
            else if (concepts[i].shape == "curve") {
                if (selectedMethod == "anomalyDriven") {
                    min = 0;             //points[0] = crossovers[0];
                    var inflection = 32; //points[1] = crossovers[1];
                    max = 64;
                    var curveDecrease = self.createVectorCurveDecrease(domainMin,domainMax,min,inflection,max);

                    min = 191;
                    inflection = 223;    //points[1] = crossovers[numConcepts-1];
                    max = 255;           //points[2] = crossovers[numConcepts];
                    var curveIncrease = conceptData.rows.push = self.createVectorCurveIncrease(domainMin,domainMax,min,inflection,max);

                    //min = 0;
                    //max = 127;
                    //var inflection = min + (max-min)/2;
                    //var curveDecrease = self.createVectorCurveDecrease(domainMin,domainMax,min,inflection,max);
                    //min = 128;
                    //max = 255;
                    //inflection = min + (max-min)/2;
                    //var curveIncrease = conceptData.rows.push = self.createVectorCurveIncrease(domainMin,domainMax,min,inflection,max);

                    results = [];
                    for (j = 0; j < 128; j++) {
                        results[j] = curveDecrease[j];
                    }
                    for (j = 128; j < 256; j++) {
                        results[j] = curveIncrease[j];
                    }
                }
                else  if (selectedMethod == "crossoverDriven") {
                    if (i == 0) {
                        min = crossovers[0];
                        var inflection = crossovers[1];
                        max = (crossovers[1] + crossovers[2]) / 2;
                        results = self.createVectorCurveDecrease(domainMin,domainMax,min,inflection,max);
                    }
                    else {
                        min = (crossovers[concepts.length-1] + crossovers[concepts.length-2]) / 2;
                        var inflection = crossovers[concepts.length-1];
                        max = crossovers[concepts.length];
                        results = conceptData.rows.push = self.createVectorCurveIncrease(domainMin,domainMax,min,inflection,max);
                    }
                }
                else  if (i == 0){
                    var inflection = min + (max-min)/2;
                    results = self.createVectorCurveDecrease(domainMin,domainMax,min,inflection,max);
                }
                else {
                    var inflection = min + (max-min)/2;
                    results = conceptData.rows.push = self.createVectorCurveIncrease(domainMin,domainMax,min,inflection,max);
                }
            }
            else if (concepts[i].shape == "linear") {
                if (selectedMethod == "anomalyDriven") {
                    min = 0;
                    max = 127;
                    var linearDecrease = self.createVectorLinearDecrease(domainMin,domainMax,min,max);
                    min = 128;
                    max = 255;
                    var linearIncrease = conceptData.rows.push = self.createVectorLinearIncrease(domainMin,domainMax,min,max);
                    results = [];
                    for (j = 0; j < 128; j++) {
                        results[j] = linearDecrease[j];
                    }
                    for (j = 128; j < 256; j++) {
                        results[j] = linearIncrease[j];
                    }
                }
                else  if (selectedMethod == "crossoverDriven") {
                    if (i == 0) {
                        min = crossovers[0];
                        max = (crossovers[1] + crossovers[2]) / 2;
                        results = self.createVectorLinearDecrease(domainMin,domainMax,min,max);
                    }
                    else {
                        min = (crossovers[concepts.length-2] + crossovers[concepts.length-1]) / 2;
                        max = crossovers[concepts.length];
                        results = self.createVectorLinearIncrease(domainMin,domainMax,min,max);
                    }
                }
                else  if (i == 0){
                    var inflection = min + (max-min)/2;
                    results = self.createVectorLinearDecrease(domainMin,domainMax,min,max);
                }
                else {
                    var inflection = min + (max-min)/2;
                    results = self.createVectorLinearIncrease(domainMin,domainMax,min,max);
                }
            }

            if (results != null) {
                for (j = 0; j < results.length; j++) {
                    conceptData.rows[j].push(results[j]);
                }
            }
        }
        return conceptData;
    },

    createConceptsForDisplay: function(conceptList,selectedMethod) {
        var html = "";
        if (selectedMethod == "crossoverDriven") {
            for (var i = 0; i < conceptList.length; i++) {
                html += "<tr><td><input type=\"text\" value=\"" + conceptList[i].name + "\" class=\"name-only\" maxlength=\"64\"/></td>";
                if ((i ==0) || (i == conceptList.length-1)) {
                    html += " <td><select style=\"display:block;\" class=\"endshape\">";
                }
                else {
                    html += " <td><select style=\"display:block;\" class=\"shape\">";
                }
                if ((i ==0) || (i == conceptList.length-1)) {
                    html += " <option value=\"curve\"selected=\"selected\">Curve</option>";
                } else {
                    html += " <option class=\"shape\" value=\"pi\" selected=\"selected\">PI</option>";
                }
                html += " </select></td></tr>";
            }
        }
        else if (selectedMethod == "anomalyDriven") {
            html += "<tr><td><input type=\"text\" value=\"" + conceptList[0].name + "\" class=\"name-only\" maxlength=\"64\"/></td>";
            html += " <td><select style=\"display:block;\">";
            html += " <option value=\"curve\" selected=\"selected\">Curve</option>";
            html += " </select></td></tr>";
            html += "<tr><td><input type=\"text\" value=\"" + conceptList[1].name + "\" class=\"name-only\" maxlength=\"64\"/></td>";
            html += " <td><select style=\"display:block;\">";
            //html += " <option value=\"pi\"";
            //html += (conceptList[1].shape == "pi") ? " selected=\"selected\"" : "";
            //html += ">PI</option>";
            html += " <option value=\"strapezoid\"";
            html += (conceptList[1].shape == "strapezoid") ? " selected=\"selected\"" : "";
            html += ">S-Trapezoid</option>";
            html += " </select></td></tr>";
        }
        else {
            for (var i = 0; i < conceptList.length; i++) {
                html += "<tr><td><input type=\"text\" value=\"" + conceptList[i].name + "\" class=\"name-only\" maxlength=\"64\"/></td>";
                html += " <td><select style=\"display:block;\">";
                html += " <option value=\"curvedecrease\"";
                html += (conceptList[i].shape == "curvedecrease") ? " selected=\"selected\"" : "";
                html += ">Curve Decrease</option>";
                html += " <option value=\"curveincrease\"";
                html += (conceptList[i].shape == "curveincrease") ? " selected=\"selected\"" : "";
                html += ">Curve Increase</option>";
                html += " <option value=\"lineardecrease\"";
                html += (conceptList[i].shape == "lineardecrease") ? " selected=\"selected\"" : "";
                html += ">Linear Decrease</option>";
                html += " <option value=\"linearincrease\"";
                html += (conceptList[i].shape == "linearincrease") ? " selected=\"selected\"" : "";
                html += ">Linear Increase</option>";
                html += " <option value=\"pi\"";
                html += (conceptList[i].shape == "pi") ? " selected=\"selected\"" : "";
                html += ">PI</option>";
                html += " <option value=\"trapezoid\"";
                html += (conceptList[i].shape == "trapezoid") ? " selected=\"selected\"" : "";
                html += ">Trapezoid</option>";
                html += " <option value=\"strapezoid\"";
                html += (conceptList[i].shape == "strapezoid") ? " selected=\"selected\"" : "";
                html += ">S-Trapezoid</option>";
                html += " <option value=\"triangle\"";
                html += (conceptList[i].shape == "triangle") ? " selected=\"selected\"" : "";
                html += ">Triangle</option>";
                html += " </select></td></tr>";
            }
        }
        return html;
    },

    findConceptMin: function(name, contextData) {
        var idx = -1;
        var result = contextData.rows[0][0];
        var min = 0;
        for (var i = 0; i < contextData.fields.length; i++) {
            if (contextData.fields[i] == name) idx=i;
        }
        if (idx != -1) {
            min = contextData.rows[0][idx];
            if ( min == contextData.rows[1][idx]) {
                for (var j = 1; j < contextData.rows.length; j++) {
                    if (contextData.rows[j][idx] != min ) {
                        return contextData.rows[j-1][0];
                    }
                }
        }
        }
        return result;
    },

    findConceptMax: function(name, contextData) {
        var idx = -1;
        var max = 0;
        var result = contextData.rows[255][0];
        for (var i = 0; i < contextData.fields.length; i++) {
            if (contextData.fields[i] == name) idx=i;
        }

        if (idx != -1) {
            max = contextData.rows[contextData.rows.length-1][idx];
            if ( max == contextData.rows[contextData.rows.length-2][idx]) {
                for (var j = contextData.rows.length-2; j > 0; j--) {
                    if (contextData.rows[j][idx] != max ) {
                        return contextData.rows[j+1][0];
                    }
                }
            }
        }
        return result;
    }
};
