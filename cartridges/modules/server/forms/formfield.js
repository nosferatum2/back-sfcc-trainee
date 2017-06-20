'use strict';

var resource = require('dw/web/Resource');

/**
 * Function to conver <dw.web.FormField> object to plain JS object.
 * @param  {dw.web.FormField} field original formfield object.
 * @return {Object} Plain JS object representing formfield.
 */
function formField(field) {
    var result = {};
    Object.defineProperty(result, 'attributes', {
        get: function () {
            var attributes = '';
            attributes += 'name="' + result.htmlName + '"';
            if (result.mandatory) {
                attributes += ' required';
            }
            if (!result.checked && !result.selected && !field.options) {
                var value = field.htmlValue == null ? '' : field.htmlValue;
                attributes += ' value="' + value + '"';
            }
            if (result.maxValue && !field.options) {
                attributes += ' max="' + result.maxValue + '"';
            }
            if (result.minValue && !field.options) {
                attributes += ' min="' + result.minValue + '"';
            }
            if (result.maxLength && !field.options) {
                attributes += ' maxLength="' + result.maxLength + '"';
            }
            if (result.minLength && !field.options) {
                attributes += ' minLength="' + result.minLength + '"';
            }
            if (result.regEx && !field.options) {
                attributes += ' pattern="' + result.regEx + '"';
            }
            return attributes;
        }
    });
    Object.defineProperty(result, 'value', {
        get: function () {
            return field.value;
        },
        set: function (value) {
            field.value = value; // eslint-disable-line no-param-reassign
            // reset htmlValue
            result.htmlValue = field.htmlValue || '';
        }
    });
    var attributesToCopy = {
        string: ['maxLength', 'minLength', 'regEx'],
        bool: ['checked', 'selected'],
        int: ['maxValue', 'minValue'],
        common: ['htmlValue', 'mandatory',
            'dynamicHtmlName', 'htmlName', 'valid'],
        resources: ['error', 'description', 'label']
    };

    attributesToCopy.common.forEach(function (item) {
        if (item !== 'valid') {
            result[item] = field[item] || '';
        } else {
            result.valid = field.valid;
        }
    });

    attributesToCopy.resources.forEach(function (item) {
        if (field[item]) {
            result[item] = resource.msg(field[item], 'forms', null);
        }
    });

    if (field.options && field.options.optionsCount > 0) {
        result.options = [];
        for (var i = 0, l = field.options.optionsCount; i < l; i++) {
            result.options.push({
                checked: field.options[i].checked,
                htmlValue: field.options[i].htmlValue,
                label: field.options[i].label
                    ? resource.msg(field.options[i].label, 'forms', null)
                    : '',
                id: field.options[i].optionId,
                selected: field.options[i].selected,
                value: field.options[i].value
            });
        }

        result.selectedOption = field.selectedOption ? field.selectedOption.optionId : '';
    }

    switch (field.type) {
        case field.FIELD_TYPE_BOOLEAN:
            attributesToCopy.bool.forEach(function (item) {
                result[item] = field[item];
            });
            break;
        case field.FIELD_TYPE_DATE:
        case field.FIELD_TYPE_INTEGER:
        case field.FIELD_TYPE_NUMBER:
            attributesToCopy.int.forEach(function (item) {
                result[item] = field[item];
            });
            break;
        case field.FIELD_TYPE_STRING:
            attributesToCopy.string.forEach(function (item) {
                result[item] = field[item];
            });
            break;
        default:
            break;
    }

    result.formType = 'formField';

    return result;
}

module.exports = formField;
