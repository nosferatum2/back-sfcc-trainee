'use strict';

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const pwd = __dirname;
const packageFile = require(path.join(pwd, '../package.json'));
const dataOptions = packageFile.deployment.dataOptions;
const dataBundles = packageFile.deployment.dataBundles;

function writeAttributesRow(outputStream, classification, attributes, attributeToGroupMap) {
    const TABLE_NONE = "--none--";

    attributes.forEach(function (attribute) {

        if (attribute) {

            const attributeID = attribute.$['attribute-id'];

            let attributeName = TABLE_NONE;
            if (attribute['display-name']) {
                attributeName = attribute['display-name'][0]._;
            }

            let attributeType = TABLE_NONE;
            if (attribute['type']) {
                attributeType = attribute['type'];
            }

            let attributeDescription = TABLE_NONE;
            if (attribute['description']) {
                attributeDescription = attribute['description'][0]._;
            }

            let attributeMandatory = TABLE_NONE;
            if (attribute['mandatory-flag']) {
                attributeMandatory = attribute['mandatory-flag'];
            }

            let attributeExternal = TABLE_NONE;
            if (attribute['externally-managed-flag']) {
                attributeExternal = attribute['externally-managed-flag'];
            }

            let attributeGroup = attributeToGroupMap[attributeID];
            if (!attributeGroup) {
                attributeGroup = TABLE_NONE;
            }

            outputStream.write("<tr>");
            outputStream.write("<td>" + attributeID + "</td>");
            outputStream.write("<td><![CDATA[" + attributeName + "]]></td>");
            outputStream.write("<td>" + attributeType + "</td>");
            outputStream.write("<td><![CDATA[" + attributeDescription + "]]></td>");
            outputStream.write("<td>" + attributeMandatory + "</td>");
            outputStream.write("<td>" + attributeExternal + "</td>");
            outputStream.write("<td><![CDATA[" + attributeGroup + "]]></td>");
            outputStream.write("<td>" + classification + "</td>");
            outputStream.write("</tr>");

        }

    });
}

function generateSystemObjectReports (options) {
    const dataBundle = dataBundles[options.dataBundle],

        // set up parser and convert XML file to JS
        parser = new xml2js.Parser(),

        // create output file
        fileOut = path.resolve(pwd,'./artifacts/system-objecttype-extensions.txt'),
        outputStream = fs.createWriteStream(fileOut),
        SYSTEM_OBJ_TABLE_HEADER = "<tr><th>ID</th><th>Name</th><th>Type</th>" +
                              "<th>Description</th><th>Mandatory</th>" +
                              "<th>Externally managed</th><th>Group</th>" +
                              "<th>System/Custom</th></tr>";

    outputStream.write('<h1>Note:</h1>');
    outputStream.write('<p>This page is auto-generated by the build. Do not edit manually.</p>');

    for (var i in dataBundle) {
        // read arguments
        const fileIn = path.join(path.resolve(pwd, dataOptions.archivePath), dataBundle[i], 'meta/system-objecttype-extensions.xml');

        fs.readFile(fileIn, {encoding : "utf8"}, function(err, data) {

            parser.parseString(data, function (err, result) {

                console.log("processing " + fileIn);

                // iterate over each system object type extension
                var systemObjects = result.metadata['type-extension'];
                if (systemObjects) {
                    systemObjects.forEach(function (systemObject) {

                        // output system object ID
                        var systemObjectTypeID = systemObject.$['type-id'];
                        outputStream.write('<h2>' + systemObjectTypeID + '</h2>');

                        // iterate over attribute groups and create mapping of attribute to group
                        var attributeToGroupMap = {};

                        if(systemObject['group-definitions']) {
                            var groups = systemObject['group-definitions'][0]['attribute-group'];

                            groups.forEach(function (group) {

                                //output group name
                                var groupName = group.$['group-id'],

                                    // iterate over attributes in group
                                    groupAttributes = group.attribute;

                                if (groupAttributes) {

                                    groupAttributes.forEach(function (groupAttribute) {

                                        if (groupAttribute) {
                                            var attributeID = groupAttribute.$['attribute-id'];
                                            attributeToGroupMap[attributeID] = groupName;
                                        }

                                    });

                                }

                            });

                        }

                        // iterate over attribute definitions and output
                        var customAttributes = null,
                            systemAttributes = null;

                        // write table headers
                        outputStream.write("<table>");
                        outputStream.write(SYSTEM_OBJ_TABLE_HEADER);

                        if(systemObject['custom-attribute-definitions'] && systemObject['custom-attribute-definitions'][0]) {
                            customAttributes = systemObject['custom-attribute-definitions'][0]['attribute-definition'];
                            writeAttributesRow(outputStream, "Custom", customAttributes, attributeToGroupMap);
                        }

                        if(systemObject['system-attribute-definitions'] && systemObject['system-attribute-definitions'][0]) {
                            systemAttributes = systemObject['system-attribute-definitions'][0]['attribute-definition'];
                            writeAttributesRow(outputStream, "System", systemAttributes, attributeToGroupMap);
                        }

                        outputStream.write("</table>");

                    });

                    outputStream.end(function () {
                        console.log("file written: " + fileOut);
                    });
                }


            });

        });
    }
}

module.exports = generateSystemObjectReports;