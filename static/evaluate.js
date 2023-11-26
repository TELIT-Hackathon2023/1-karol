// static/evaluate.js

const browsers = ['chrome', 'edge', 'firefox', 'ie', 'safari']

$('#url-field, #user-selection-field').keypress(function (e) {
    if (e.which === 13) {
        // 13 is the key code for Enter
        submitForm();
    }
});

function submitForm() {
    const submitButton = $('#form-submit-button');
    submitButton.prop('disabled',true);
    const inputField = $('#url-field').val();
    const optionField = $('#user-selection-field').val();
    const resultDiv = $('#result');
    $("#analyzing").show();
    $("#results").hide();
    try {
        let ci_table;
        let css_table;
        let domain;

        $.ajax({
            url: '/process_form',
            type: 'POST',
            data: {url_field: inputField, user_field: optionField},
            success: function (data) {
                ci_table = data["code-improvements"];
                css_table = data["css-tags-improvements"];
                domain = data["domain"];
                generateHTMLTable(ci_table);
                generateCSSTagsTable(css_table, domain)

                $("#results").show();
                $("#analyzing").hide();
                submitButton.prop('disabled',false);
            },
        });

    } catch (error) {
        console.error('Error:', error);
        resultDiv.text('Error occurred during form submission.');

    }
}

function generateHTMLTable(ci_table) {
    var tableHTML = '<table>';

    for (var i = 0; i < ci_table.length; i++) {
        var row = ci_table[i];
        tableHTML += '<tr><td><div class="ci-description">' + row[1] + '</div><div class="ci-suggestion">' + row[2] + '</div></td><td class="ci-count">' + row[0] + '</td></tr>';
    }

    tableHTML += '</table>';

    $('#code-improvements table').replaceWith(tableHTML);
}

function generateCSSTagsTable(css_table, domain) {
    const availableSinceThreshold = 50
    const partiallySupportedThreshold = 100
    let tableHTML = '<h3>No improvements for used tags<h3/>';
    // console.log(typeof(css_table))
    // console.log(css_table)
    // console.log(domain)
    let domainTags = css_table[domain]

    if (domainTags.length > 0) {
        tableHTML = '<table>';

        for (let i = 0; i < domainTags.length; i++) {
            const row = domainTags[i];
            const css_tag = Object.keys(row)[0]
            const browsersObj = row[css_tag]
            const browserObjKeys = Object.keys(browsersObj)
            const partiallySupported = {}
            const supportedSince = {}

            browserObjKeys.forEach(key => {
                if (browsersObj[key].hasOwnProperty('a') && browsersObj[key]['a'] > partiallySupportedThreshold) {
                    if (partiallySupported[css_tag] === undefined) {
                        partiallySupported[css_tag] = [key]
                    } else {
                        partiallySupported[css_tag].push(key)
                    }
                }
                if (browsersObj[key].hasOwnProperty('y') && browsersObj[key]['y'] < availableSinceThreshold) {
                    if (supportedSince[css_tag] === undefined) {
                        supportedSince[css_tag] = [key]
                    } else {
                        supportedSince[css_tag].push(key)
                    }
                }
            })

            Object.keys(partiallySupported).forEach(key => {
                tableHTML += '<tr><td><div class="ci-description">' + key + '</div><div class="ci-suggestion">' + 'This tag is partially supported' + '</div></td><td class="ci-count">' + partiallySupported[key].join(' ') + '</td></tr>';
            })

            Object.keys(supportedSince).forEach(key => {
                tableHTML += '<tr><td><div class="ci-description">' + key + '</div><div class="ci-suggestion">' + 'This tag is supported in late versions' + '</div></td><td class="ci-count">' + supportedSince[key].join(' ') + '</td></tr>';
            })
        }

        tableHTML += '</table>';
    }

    $('#css-tags-improvements table').replaceWith(tableHTML);
}
